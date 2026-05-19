-- ==============================================================================
-- MIGRATION: Fix RLS for tenants table to allow persistence
-- Ngày: 2026-03-14
-- Mục đích: Cho phép Super Admin cập nhật cấu hình giao diện và giao diện của chi nhánh.
-- ==============================================================================

-- 1. Kích hoạt RLS cho bảng tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 2. Xóa các chính sách cũ nếu có (để tránh trùng lặp)
DROP POLICY IF EXISTS "Public can read tenants" ON public.tenants;
DROP POLICY IF EXISTS "Super admins can manage tenants" ON public.tenants;

-- 3. Chính sách: Mọi người (nặc danh hoặc đã login) đều có thể đọc thông tin cơ bản
-- Cần thiết cho Middleware và Frontend (DynamicPageBuilder)
CREATE POLICY "Public can read tenants" ON public.tenants FOR
SELECT USING (true);

-- 4. Chính sách: Chỉ Super Admin mới có quyền quản lý (INSERT, UPDATE, DELETE)
-- Dùng hàm public.get_current_user_role() đã định nghĩa trong các migration trước
CREATE POLICY "Super admins can manage tenants" ON public.tenants FOR ALL USING (
    auth.uid() IS NOT NULL AND (
        public.get_current_user_role() = 'super_admin'
    )
)
WITH CHECK (
    auth.uid() IS NOT NULL AND (
        public.get_current_user_role() = 'super_admin'
    )
);

-- Note: Không cấp quyền cho tenant_admin ở đây theo yêu cầu của user. 
-- Nếu muốn cho phép tenant_admin sửa chi nhánh của họ, cần thêm:
-- OR (public.get_current_user_role() = 'tenant_admin' AND public.get_current_tenant_id() = id)
