-- ==============================================================================
-- MIGRATION: Consolidated Database Schema Patching & Standardization
-- Ngày tạo: 2026-05-22
-- Mục đích:
--   1. Cho phép phân quyền đa chi nhánh bằng cách nới lỏng UNIQUE(user_id) sang UNIQUE(user_id, tenant_id) trong user_roles.
--   2. Hỗ trợ email newsletter đăng ký trên nhiều tenant bằng UNIQUE(tenant_id, email).
--   3. Thay đổi kiểu dữ liệu record_id trong content_revisions sang text để tránh crash runtime.
--   4. Chuẩn hóa khóa chính/khóa ngoại của donation_campaigns và donations từ text sang uuid (bao gồm chuyển đổi dữ liệu lịch sử an toàn).
--   5. Tạo Partial Unique Index đảm bảo chỉ có tối đa một tài khoản ngân hàng mặc định hoạt động trên mỗi tenant.
--   6. Chuẩn hóa kiểu dữ liệu mảng ARRAY sang uuid[] và text[] để tuân thủ Postgres chuẩn.
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- BƯỚC 1: SỬA ĐỔI RÀNG BUỘC PHÂN QUYỀN TRÊN BẢNG user_roles
-- ==============================================================================
-- RAISE NOTICE 'Đang cập nhật ràng buộc UNIQUE trên bảng user_roles...';

-- Loại bỏ unique cũ trên user_id và unique mới (nếu đã chạy dở dang)
ALTER TABLE public.user_roles 
    DROP CONSTRAINT IF EXISTS user_roles_user_id_key,
    DROP CONSTRAINT IF EXISTS user_roles_user_id_tenant_id_key;

-- Thêm unique trên cặp (user_id, tenant_id) để hỗ trợ tài khoản có vai trò khác nhau trên các tenant khác nhau
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_tenant_id_key UNIQUE (user_id, tenant_id);


-- ==============================================================================
-- BƯỚC 2: SỬA ĐỔI RÀNG BUỘC ĐĂNG KÝ BẢN TIN TRÊN BẢNG newsletter_subscribers
-- ==============================================================================
-- RAISE NOTICE 'Đang cập nhật ràng buộc UNIQUE trên bảng newsletter_subscribers...';

-- Loại bỏ unique cũ trên email và unique mới (nếu đã chạy dở dang)
ALTER TABLE public.newsletter_subscribers 
    DROP CONSTRAINT IF EXISTS newsletter_subscribers_email_key,
    DROP CONSTRAINT IF EXISTS newsletter_subscribers_tenant_email_key;

-- Thêm unique trên (tenant_id, email) để cho phép cùng 1 email đăng ký ở các tenant khác nhau
ALTER TABLE public.newsletter_subscribers ADD CONSTRAINT newsletter_subscribers_tenant_email_key UNIQUE (tenant_id, email);


-- ==============================================================================
-- BƯỚC 3: ĐỒNG BỘ KIỂU DỮ LIỆU record_id TRONG BẢNG content_revisions
-- ==============================================================================
-- RAISE NOTICE 'Đang đồng bộ kiểu dữ liệu record_id trong content_revisions...';

-- Drop index cũ liên quan trước khi đổi kiểu dữ liệu
DROP INDEX IF EXISTS public.idx_content_revisions_lookup;

-- Chuyển kiểu dữ liệu sang text để tương thích với tất cả các bảng (kể cả bảng dùng khóa chính dạng text/slug)
ALTER TABLE public.content_revisions ALTER COLUMN record_id TYPE text;

-- Khôi phục lại index
CREATE INDEX IF NOT EXISTS idx_content_revisions_lookup ON public.content_revisions (table_name, record_id);


-- ==============================================================================
-- BƯỚC 4: CHUẨN HÓA KHÓA CHÍNH/KHÓA NGOẠI CỦA donation_campaigns & donations SANG UUID
-- ==============================================================================
-- RAISE NOTICE 'Đang chuẩn hóa kiểu dữ liệu khóa chính/khóa ngoại của donation_campaigns và donations...';

DO $$
DECLARE
    v_campaign_id_type text;
BEGIN
    -- Kiểm tra kiểu dữ liệu hiện tại của donation_campaigns.id
    SELECT data_type INTO v_campaign_id_type
    FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'donation_campaigns' 
      AND column_name = 'id';

    -- Nếu là 'character varying' hoặc 'text' thì mới cần convert dữ liệu và đổi kiểu
    IF v_campaign_id_type IN ('character varying', 'text') THEN
        -- 4.1. Hủy bỏ khóa ngoại hiện tại
        ALTER TABLE public.donations DROP CONSTRAINT IF EXISTS donations_campaign_id_fkey;

        -- 4.2. Chuyển đổi dữ liệu lịch sử từ ID dạng text không hợp lệ sang UUID mới bằng CTE
        EXECUTE $query$
            WITH mapping AS (
                SELECT id::text AS old_id, gen_random_uuid() AS new_id
                FROM public.donation_campaigns
                WHERE id::text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
            ),
            update_child AS (
                UPDATE public.donations d
                SET campaign_id = m.new_id::text
                FROM mapping m
                WHERE d.campaign_id::text = m.old_id
            )
            UPDATE public.donation_campaigns c
            SET id = m.new_id::text
            FROM mapping m
            WHERE c.id::text = m.old_id;
        $query$;

        -- 4.3. Thực hiện đổi kiểu dữ liệu các cột sang uuid
        ALTER TABLE public.donation_campaigns 
            ALTER COLUMN id TYPE uuid USING id::uuid,
            ALTER COLUMN id SET DEFAULT gen_random_uuid();

        ALTER TABLE public.donations 
            ALTER COLUMN campaign_id TYPE uuid USING campaign_id::uuid;

        -- 4.4. Thiết lập lại ràng buộc khóa ngoại chỉ trỏ dạng uuid
        ALTER TABLE public.donations
            ADD CONSTRAINT donations_campaign_id_fkey 
            FOREIGN KEY (campaign_id) 
            REFERENCES public.donation_campaigns(id) 
            ON DELETE SET NULL;
            
        RAISE NOTICE 'Đã đồng bộ thành công cột campaign_id và id sang kiểu UUID.';
    ELSE
        RAISE NOTICE 'Cột campaign_id và id đã là UUID từ trước, bỏ qua chuyển đổi.';
    END IF;
END $$;




-- ==============================================================================
-- BƯỚC 5: TẠO PARTIAL INDEX ĐẢM BẢO TỐI ĐA 1 TÀI KHOẢN NGÂN HÀNG MẶC ĐỊNH TRÊN TỪNG TENANT
-- ==============================================================================
-- RAISE NOTICE 'Đang tạo Partial Unique Index trên bảng bank_accounts...';

CREATE UNIQUE INDEX IF NOT EXISTS bank_accounts_tenant_default_idx 
ON public.bank_accounts (tenant_id) 
WHERE (is_active = true AND is_default = true);


-- ==============================================================================
-- BƯỚC 6: CHUẨN HÓA CÚ PHÁP KIỂU DỮ LIỆU MẢNG ARRAY SANG uuid[] VÀ text[] CỦA POSTGRES
-- ==============================================================================
-- RAISE NOTICE 'Đang chuẩn hóa cú pháp kiểu dữ liệu mảng ARRAY...';

-- 6.1. Hủy bỏ tạm thời các RLS policies phụ thuộc vào cột published_to
DROP POLICY IF EXISTS "Public can read categories including broadcast" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users read own tenant dharma talks" ON public.dharma_talks;
DROP POLICY IF EXISTS "Authenticated users read own tenant events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users read own tenant news" ON public.news;
DROP POLICY IF EXISTS "Public can read media including broadcast" ON public.media;

-- 6.2. Hủy bỏ tạm thời các indexes liên quan để tránh xung đột kiểu dữ liệu cũ/mới
DROP INDEX IF EXISTS public.idx_categories_published_to;
DROP INDEX IF EXISTS public.idx_media_published_to;
DROP INDEX IF EXISTS public.idx_news_published_to_gin;
DROP INDEX IF EXISTS public.idx_events_published_to_gin;
DROP INDEX IF EXISTS public.idx_dharma_talks_published_to_gin;
DROP INDEX IF EXISTS public.idx_news_published_to;
DROP INDEX IF EXISTS public.idx_events_published_to;

-- 6.3. Thực hiện thay đổi kiểu dữ liệu cột sang uuid[] / text[] chuẩn
-- Bảng categories
ALTER TABLE public.categories 
    ALTER COLUMN published_to TYPE uuid[] USING published_to::uuid[];

-- Bảng dharma_talks
ALTER TABLE public.dharma_talks 
    ALTER COLUMN published_to TYPE uuid[] USING published_to::uuid[];

-- Bảng events
ALTER TABLE public.events 
    ALTER COLUMN published_to TYPE uuid[] USING published_to::uuid[];

-- Bảng news
ALTER TABLE public.news 
    ALTER COLUMN published_to TYPE uuid[] USING published_to::uuid[];

-- Bảng media
ALTER TABLE public.media 
    ALTER COLUMN published_to TYPE uuid[] USING published_to::uuid[],
    ALTER COLUMN tags TYPE text[] USING tags::text[],
    ALTER COLUMN tags SET DEFAULT '{}'::text[];

-- 6.4. Khởi tạo lại các indexes tối ưu cho mảng
CREATE INDEX IF NOT EXISTS idx_categories_published_to ON public.categories USING GIN (published_to);
CREATE INDEX IF NOT EXISTS idx_media_published_to ON public.media USING GIN (published_to);
CREATE INDEX IF NOT EXISTS idx_news_published_to_gin ON public.news USING GIN (published_to);
CREATE INDEX IF NOT EXISTS idx_events_published_to_gin ON public.events USING GIN (published_to);
CREATE INDEX IF NOT EXISTS idx_dharma_talks_published_to_gin ON public.dharma_talks USING GIN (published_to);

-- 6.5. Khôi phục lại các RLS policies với định nghĩa chuẩn
CREATE POLICY "Public can read categories including broadcast" ON public.categories FOR SELECT USING (
    is_visible = true AND (
        tenant_id IS NULL 
        OR tenant_id = '55555555-5555-5555-5555-555555555555' 
        OR tenant_id = public.get_current_tenant_id()
        OR public.get_current_tenant_id() = ANY(published_to)
    )
    OR (
        auth.uid() IS NOT NULL AND (
            public.is_global_admin()
            OR tenant_id = public.get_current_tenant_id()
            OR public.get_current_tenant_id() = ANY(published_to)
        )
    )
);

CREATE POLICY "Authenticated users read own tenant dharma talks" ON public.dharma_talks FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND is_active = true
    AND (
        public.is_global_admin()
        OR tenant_id = public.get_current_tenant_id()
        OR public.get_current_tenant_id() = ANY(published_to)
    )
);

CREATE POLICY "Authenticated users read own tenant events" ON public.events FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND status IN ('upcoming', 'ongoing', 'completed')
    AND (
        public.is_global_admin()
        OR tenant_id = public.get_current_tenant_id()
        OR public.get_current_tenant_id() = ANY(published_to)
    )
);

CREATE POLICY "Authenticated users read own tenant news" ON public.news FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND status = 'published'
    AND (
        public.is_global_admin()
        OR tenant_id = public.get_current_tenant_id()
        OR public.get_current_tenant_id() = ANY(published_to)
    )
);

CREATE POLICY "Public can read media including broadcast" ON public.media FOR SELECT USING (
    (
        tenant_id IS NULL 
        OR tenant_id = '55555555-5555-5555-5555-555555555555' 
        OR tenant_id = public.get_current_tenant_id()
        OR public.get_current_tenant_id() = ANY(published_to)
    )
    OR (
        auth.uid() IS NOT NULL AND (
            public.is_global_admin()
            OR tenant_id = public.get_current_tenant_id()
            OR public.get_current_tenant_id() = ANY(published_to)
        )
    )
);

COMMIT;
