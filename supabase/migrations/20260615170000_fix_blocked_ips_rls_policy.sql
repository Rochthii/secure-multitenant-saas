-- ==============================================================================
-- MIGRATION: Cập nhật RLS Policy cho bảng blocked_ips
-- Ngày: 2026-06-15
-- ==============================================================================

BEGIN;

-- 1. Xóa các policy quản lý cũ kiểm tra trực tiếp qua JWT role
DROP POLICY IF EXISTS "Cho phép Super Admin quản lý IP bị chặn" ON public.blocked_ips;

-- 2. Tạo policy mới sử dụng hàm is_global_admin() để kiểm tra phân quyền thực tế trong DB
CREATE POLICY "Cho phép Super Admin quản lý IP bị chặn" ON public.blocked_ips
    FOR ALL
    TO authenticated
    USING (public.is_global_admin())
    WITH CHECK (public.is_global_admin());

-- 3. Cập nhật luôn policy đọc (SELECT) để các Global Admin cũng có thể đọc danh sách IP bị chặn của mọi tenant
DROP POLICY IF EXISTS "Cho phép đọc danh sách IP bị chặn theo tenant" ON public.blocked_ips;
CREATE POLICY "Cho phép đọc danh sách IP bị chặn theo tenant" ON public.blocked_ips
    FOR SELECT
    USING (
        (auth.uid() IS NOT NULL AND (
            (auth.jwt() ->> 'tenant_id')::UUID = tenant_id
            OR
            public.is_global_admin()
        ))
        OR
        (auth.role() = 'anon')
    );

COMMIT;
