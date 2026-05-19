-- ==============================================================================
-- MIGRATION: Giai Đoạn 4.5 - Tối Ưu Hóa Multi-Tenant Toàn Diện (Scale-Ready)
-- Ngày: 2026-02-28
-- Mục Tiêu: Gắn tenant_id vào tất cả các bảng vệ tinh & Xóa sự phân mảnh RLS
-- ==============================================================================

-- 1. CHUẨN HÓA BẢNG VỆ TINH: THÊM TENANT_ID VÀ FOREIGN KEYS
-- Mặc định gán về ID của chi nhánh chính phủ (Chantarangsay) để hệ thống cũ không bị sập.
-- Thư viện Media
ALTER TABLE public.media
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants (id) DEFAULT '55555555-5555-5555-5555-555555555555';
-- Danh mục
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants (id) DEFAULT '55555555-5555-5555-5555-555555555555';
-- Trang tĩnh
ALTER TABLE public.pages
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants (id) DEFAULT '55555555-5555-5555-5555-555555555555';
-- Các phần Giới thiệu
ALTER TABLE public.about_sections
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants (id) DEFAULT '55555555-5555-5555-5555-555555555555';
-- Banner Slider
ALTER TABLE public.hero_slides
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants (id) DEFAULT '55555555-5555-5555-5555-555555555555';
-- Pháp âm/Pháp thoại
ALTER TABLE public.dharma_talks
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants (id) DEFAULT '55555555-5555-5555-5555-555555555555';
-- Đăng ký sự kiện
ALTER TABLE public.event_registrations
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants (id) DEFAULT '55555555-5555-5555-5555-555555555555';
-- Tin nhắn liên hệ
ALTER TABLE public.contact_messages
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants (id) DEFAULT '55555555-5555-5555-5555-555555555555';
-- Dự án quyên góp
ALTER TABLE public.transaction_projects
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants (id) DEFAULT '55555555-5555-5555-5555-555555555555';

-- Tạo Index để tăng tốc độ quét theo chi nhánh
CREATE INDEX IF NOT EXISTS idx_media_tenant ON public.media (tenant_id);

CREATE INDEX IF NOT EXISTS idx_categories_tenant ON public.categories (tenant_id);

CREATE INDEX IF NOT EXISTS idx_pages_tenant ON public.pages (tenant_id);

CREATE INDEX IF NOT EXISTS idx_about_sections_tenant ON public.about_sections (tenant_id);

CREATE INDEX IF NOT EXISTS idx_hero_slides_tenant ON public.hero_slides (tenant_id);

CREATE INDEX IF NOT EXISTS idx_dharma_talks_tenant ON public.dharma_talks (tenant_id);

CREATE INDEX IF NOT EXISTS idx_event_registrations_tenant ON public.event_registrations (tenant_id);

CREATE INDEX IF NOT EXISTS idx_contact_messages_tenant ON public.contact_messages (tenant_id);

CREATE INDEX IF NOT EXISTS idx_transaction_projects_tenant ON public.transaction_projects (tenant_id);

-- 2. ĐỒNG NHẤT HÀM KIỂM TRA QUYỀN (SINGLE SOURCE OF TRUTH)
-- Hàm này đã có ở 20260228092700_phase4_rbac_and_broadcast.sql, ta định nghĩa lại cho chắc chắn.
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS VARCHAR AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Mọi hành động Admin được xem là hợp lệ nếu:
-- (A) Role là super_admin hoặc company_editor
-- (B) Role là tenant_admin, tenant_editor... VÀ dữ liệu đang thao tác nằm trong chi nhánh của họ.

-- 3. XÓA BỎ TOÀN BỘ RLS POLICY CŨ (Tránh xung đột)
DO $$
DECLARE
    tbl_name text;
    pol_name text;
BEGIN
    FOR tbl_name, pol_name IN 
        SELECT tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename IN ('news', 'events', 'transactions', 'site_settings', 'media', 'categories', 'pages', 'about_sections', 'hero_slides', 'dharma_talks', 'event_registrations', 'contact_messages', 'transaction_projects', 'audit_logs')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol_name, tbl_name);
    END LOOP;
END $$;

-- 4. TRIỂN KHAI RLS ĐỒNG NHẤT (ONE-SIZE-FITS-ALL TEMPLATE)

-- [MẪU 1]: CÔNG KHAI ĐỌC (Ai cũng xem được), ADMIN QUẢN LÝ
-- Bảng áp dụng: categories, pages, about_sections, hero_slides, dharma_talks, media, transaction_projects

-- BẬT RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.about_sections ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.dharma_talks ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.transaction_projects ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Tạo Function Macro định nghĩa Rule Quản Trị Hệ Thống / Chi Nhánh
CREATE OR REPLACE FUNCTION public.is_authorized_admin(target_tenant_id UUID)
RETURNS BOOLEAN AS $$
  SELECT (
    public.get_current_user_role() IN ('super_admin', 'company_editor')
    OR
    (public.get_current_user_role() IN ('tenant_admin', 'tenant_editor') AND public.get_current_tenant_id() = target_tenant_id)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 4.1. Policies cho: Categories
CREATE POLICY "Public_Read_Categories" ON public.categories FOR
SELECT USING (true);

CREATE POLICY "Admin_Manage_Categories" ON public.categories FOR ALL USING (
    public.is_authorized_admin (tenant_id)
);

-- 4.2. Policies cho: Pages
CREATE POLICY "Public_Read_Pages" ON public.pages FOR
SELECT USING (true);

CREATE POLICY "Admin_Manage_Pages" ON public.pages FOR ALL USING (
    public.is_authorized_admin (tenant_id)
);

-- 4.3. Policies cho: About Sections
CREATE POLICY "Public_Read_About_Sections" ON public.about_sections FOR
SELECT USING (true);

CREATE POLICY "Admin_Manage_About_Sections" ON public.about_sections FOR ALL USING (
    public.is_authorized_admin (tenant_id)
);

-- 4.4. Policies cho: Hero Slides
CREATE POLICY "Public_Read_Hero_Slides" ON public.hero_slides FOR
SELECT USING (true);

CREATE POLICY "Admin_Manage_Hero_Slides" ON public.hero_slides FOR ALL USING (
    public.is_authorized_admin (tenant_id)
);

-- 4.5. Policies cho: Dharma Talks
CREATE POLICY "Public_Read_Dharma_Talks" ON public.dharma_talks FOR
SELECT USING (true);

CREATE POLICY "Admin_Manage_Dharma_Talks" ON public.dharma_talks FOR ALL USING (
    public.is_authorized_admin (tenant_id)
);

-- 4.6. Policies cho: Media
CREATE POLICY "Public_Read_Media" ON public.media FOR
SELECT USING (true);

CREATE POLICY "Admin_Manage_Media" ON public.media FOR ALL USING (
    public.is_authorized_admin (tenant_id)
);

-- 4.7. Policies cho: Transaction Projects
CREATE POLICY "Public_Read_Transaction_Projects" ON public.transaction_projects FOR
SELECT USING (true);

CREATE POLICY "Admin_Manage_Transaction_Projects" ON public.transaction_projects FOR ALL USING (
    public.is_authorized_admin (tenant_id)
);

-- 4.8. Policies cho: Site Settings
CREATE POLICY "Public_Read_Site_Settings" ON public.site_settings FOR
SELECT USING (true);

CREATE POLICY "Admin_Manage_Site_Settings" ON public.site_settings FOR ALL USING (
    public.is_authorized_admin (tenant_id)
);

-- [MẪU 2]: ĐỐI TƯỢNG XUẤT BẢN CHÉO (News, Events)
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public_Read_News" ON public.news FOR
SELECT USING (status = 'published');

CREATE POLICY "Admin_Manage_News" ON public.news FOR ALL USING (
    public.is_authorized_admin (tenant_id)
);

CREATE POLICY "Public_Read_Events" ON public.events FOR
SELECT USING (status != 'draft');

CREATE POLICY "Admin_Manage_Events" ON public.events FOR ALL USING (
    public.is_authorized_admin (tenant_id)
);

-- [MẪU 3]: BẢO MẬT CAO (Chỉ Insert Nặc Danh hoặc Admin Quản Lý)
-- Đăng ký sự kiện, Tin nhắn liên hệ, Đóng góp (Transactions)
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 4.9. Policies cho: Event Registrations
CREATE POLICY "Anon_Insert_Event_Registrations" ON public.event_registrations FOR INSERT
WITH
    CHECK (true);

CREATE POLICY "Admin_Manage_Event_Registrations" ON public.event_registrations FOR ALL USING (
    public.is_authorized_admin (tenant_id)
);

-- 4.10. Policies cho: Contact Messages
CREATE POLICY "Anon_Insert_Contact_Messages" ON public.contact_messages FOR INSERT
WITH
    CHECK (true);

CREATE POLICY "Admin_Manage_Contact_Messages" ON public.contact_messages FOR ALL USING (
    public.is_authorized_admin (tenant_id)
);

-- 4.11. Policies cho: Transactions
-- Kế toán viên có quyền đặc thù ở bảng này (tenant_accountant)
CREATE OR REPLACE FUNCTION public.is_authorized_finance_admin(target_tenant_id UUID)
RETURNS BOOLEAN AS $$
  SELECT (
    public.get_current_user_role() IN ('super_admin', 'company_editor')
    OR
    (public.get_current_user_role() IN ('tenant_admin', 'tenant_accountant') AND public.get_current_tenant_id() = target_tenant_id)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "Public_Insert_Transactions_And_Read_Confirmed" ON public.transactions FOR
SELECT USING (status = 'confirmed');

CREATE POLICY "Anon_Insert_Transactions" ON public.transactions FOR INSERT
WITH
    CHECK (true);

CREATE POLICY "Finance_Manage_Transactions" ON public.transactions FOR ALL USING (
    public.is_authorized_finance_admin (tenant_id)
);

-- 5. BẢNG AUDIT LOGS (Chỉ Super Admin & Tenant Admin truy cập)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Super Admin xem mọi log. Tenant Admin xem log của nhân sự trong Chi nhánh (Cần join bảng user_roles)
CREATE POLICY "SuperAdmin_View_Audit" ON public.audit_logs FOR
SELECT USING (
        public.get_current_user_role () = 'super_admin'
    );
-- Service Role insert thông qua App Backend (Action) (Bỏ qua RLS) nên Policy Insert chỉ cần bảo vệ DB trực tiếp.
CREATE POLICY "Auth_Insert_Audit" ON public.audit_logs FOR INSERT
WITH
    CHECK (auth.uid () IS NOT NULL);

-- ==============================================================================
-- 6. TỰ ĐỘNG GẮN TENANT_ID QUA DATABASE TRIGGER (Để Tối Ưu Backend)
-- Thay vì phải sửa 15 APi (Server Actions) để gài tenant_id vào, cứ để DB tự lo.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.auto_set_tenant_id()
RETURNS TRIGGER AS $$
DECLARE
    current_tenant UUID;
    root_tenant UUID := '55555555-5555-5555-5555-555555555555';
BEGIN
    -- Nếu User App đã gửi sẵn tenant_id (Super Admin chọn), thì giữ nguyên.
    IF NEW.tenant_id IS NOT NULL THEN
        RETURN NEW;
    END IF;

    -- Lấy ID chi nhánh hiện tại của người dùng đang đăng nhập
    current_tenant := public.get_current_tenant_id();

    -- Nếu là Super Admin (tenant_id = null) hoặc Công ty Editor, mặc định cho vào Tổng (Root)
    IF current_tenant IS NULL THEN
        NEW.tenant_id := root_tenant;
    ELSE
        -- Nếu là sư thầy ở Chi nhánh Tỉnh, gán luôn ID chi nhánh đó vào dữ liệu
        NEW.tenant_id := current_tenant;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kích hoạt Trigger cho toàn bộ các bảng nội dung
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY['news', 'events', 'categories', 'media', 'pages', 'about_sections', 'hero_slides', 'dharma_talks', 'event_registrations', 'contact_messages', 'transaction_projects', 'transactions'])
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS ensure_tenant_id ON public.%I;
            CREATE TRIGGER ensure_tenant_id
            BEFORE INSERT ON public.%I
            FOR EACH ROW
            EXECUTE FUNCTION public.auto_set_tenant_id();
        ', t, t);
    END LOOP;
END $$;

-- HOÀN THÀNH.