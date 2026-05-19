-- ==============================================================================
-- MIGRATION: Core Foundation Hardening (Security & Data Integrity)
-- Ngày: 2026-03-13
-- Mục đích: 
--   1. Đảm bảo dọn dẹp dữ liệu sạch sẽ (CASCADE) cho toàn bộ bảng multi-tenant.
--   2. Mở rộng quyền xem Audit Logs cho Admin từng chi nhánh (Tenant Admin).
--   3. Đồng bộ hóa RLS cho các bảng tương tác công cộng mới.
-- ==============================================================================

-- 1. THÊM ON DELETE CASCADE CHO CÁC BẢNG PHỤ TRỢ (MISSING FROM PREVIOUS MIGRATIONS)
-- Đảm bảo khi xóa một Chi nhánh, toàn bộ dữ liệu liên quan biến mất hoàn toàn.

-- [audit_logs]
ALTER TABLE public.audit_logs
DROP CONSTRAINT IF EXISTS audit_logs_tenant_id_fkey;
ALTER TABLE public.audit_logs
ADD CONSTRAINT audit_logs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;

-- [content_revisions]
ALTER TABLE public.content_revisions
DROP CONSTRAINT IF EXISTS content_revisions_tenant_id_fkey;
ALTER TABLE public.content_revisions
ADD CONSTRAINT content_revisions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;

-- [charity_posts]
ALTER TABLE public.charity_posts
DROP CONSTRAINT IF EXISTS charity_posts_tenant_id_fkey;
ALTER TABLE public.charity_posts
ADD CONSTRAINT charity_posts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;

-- [faqs]
ALTER TABLE public.faqs
DROP CONSTRAINT IF EXISTS faqs_tenant_id_fkey;
ALTER TABLE public.faqs
ADD CONSTRAINT faqs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;

-- [homepage_stats]
ALTER TABLE public.homepage_stats
DROP CONSTRAINT IF EXISTS homepage_stats_tenant_id_fkey;
ALTER TABLE public.homepage_stats
ADD CONSTRAINT homepage_stats_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;

-- [testimonials]
ALTER TABLE public.testimonials
DROP CONSTRAINT IF EXISTS testimonials_tenant_id_fkey;
ALTER TABLE public.testimonials
ADD CONSTRAINT testimonials_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;

-- [quick_access_links]
ALTER TABLE public.quick_access_links
DROP CONSTRAINT IF EXISTS quick_access_links_tenant_id_fkey;
ALTER TABLE public.quick_access_links
ADD CONSTRAINT quick_access_links_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;


-- 2. NÂNG CẤP QUYỀN TRUY CẬP AUDIT LOGS
-- Hiện tại chỉ Super Admin xem được. Cần cho phép Tenant Admin xem log của chi nhánh mình.

DROP POLICY IF EXISTS "TenantAdmin_View_Own_Audit" ON public.audit_logs;

CREATE POLICY "TenantAdmin_View_Own_Audit" ON public.audit_logs FOR
SELECT USING (
    auth.uid() IS NOT NULL AND (
        public.get_current_user_role() IN ('super_admin', 'company_editor')
        OR (public.get_current_user_role() = 'tenant_admin' AND public.get_current_tenant_id() = tenant_id)
    )
);

-- 3. ĐẢM BẢO RLS CHO EVENT_REGISTRATIONS VÀ CONTACT_MESSAGES LUÔN CÔ LẬP
-- (Đã có Anon_Insert, giờ chỉ đảm bảo SELECT/UPDATE/DELETE không bị hở)

DROP POLICY IF EXISTS "Admin_Manage_Event_Registrations_Hardened" ON public.event_registrations;
CREATE POLICY "Admin_Manage_Event_Registrations_Hardened" ON public.event_registrations FOR ALL USING (
    public.is_authorized_admin(tenant_id)
);

DROP POLICY IF EXISTS "Admin_Manage_Contact_Messages_Hardened" ON public.contact_messages;
CREATE POLICY "Admin_Manage_Contact_Messages_Hardened" ON public.contact_messages FOR ALL USING (
    public.is_authorized_admin(tenant_id)
);

-- 4. FIX TRIGGER AUTO_SET_TENANT_ID CHO GUEST ACTIONS
-- Đảm bảo nếu APP không gửi tenant_id và User chưa login (Guest), 
-- nó sẽ KHÔNG mặc định gán vào Root mà sẽ bị lỗi (Để dev biết mà sửa App layer).
-- Hoặc linh hoạt hơn: Cho phép Insert nặc danh nếu ID được chuyển từ App.

CREATE OR REPLACE FUNCTION public.auto_set_tenant_id()
RETURNS TRIGGER AS $$
DECLARE
    current_tenant UUID;
    root_tenant UUID := '55555555-5555-5555-5555-555555555555';
BEGIN
    -- 1. Ưu tiên hàng đầu: Nếu App (Server Action) đã truyền tenant_id chính xác
    IF NEW.tenant_id IS NOT NULL THEN
        RETURN NEW;
    END IF;

    -- 2. Nếu không truyền, lấy từ context người dùng đăng nhập
    current_tenant := public.get_current_tenant_id();

    IF current_tenant IS NOT NULL THEN
        NEW.tenant_id := current_tenant;
        RETURN NEW;
    END IF;

    -- 3. Nếu là Admin Global (super_admin) mà không truyền ID, mặc định vào Root
    IF public.is_global_admin() THEN
        NEW.tenant_id := root_tenant;
        RETURN NEW;
    END IF;

    -- 4. TRƯỜNG HỢP GUEST (Nặc danh): 
    -- Nếu tới đây mà tenant_id vẫn NULL -> THROW ERROR để bắt buộc Backend phải truyền ID chi nhánh.
    -- Ngăn chặn việc dữ liệu nặc danh bị gom hết vào Chi nhánh chính phủ một cách sai lệch.
    RAISE EXCEPTION 'Missing tenant_id for anonymous interaction. Please specify tenant_id in your application request.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- HOÀN TẤT HARDENING.
