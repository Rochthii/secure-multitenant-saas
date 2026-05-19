-- Migration: Sửa đổi Check Constraint cho bảng user_roles để bao gồm cả các Role cũ
-- Nguyên nhân: Trước đó chỉ ưu tiên cho hệ thống Đa Chi Nhánh mới, dẫn đến cập nhật các role cũ (Viewer, Volunteer, Editor, Moderator, Admin) bị lỗi.

-- Xóa Constraint cũ (Bỏ qua nếu không tồn tại)
ALTER TABLE public.user_roles
DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- Thêm lại Constraint mới, bao quát toàn bộ Role
ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_role_check CHECK (
    role IN (
        -- Roles cũ (Tương thích ngược)
        'viewer',
        'volunteer',
        'editor',
        'moderator',
        'admin',
        -- Roles mới (Hệ thống Đa Chi Nhánh)
        'super_admin',
        'company_editor',
        'tenant_admin',
        'tenant_editor',
        'tenant_accountant'
    )
);