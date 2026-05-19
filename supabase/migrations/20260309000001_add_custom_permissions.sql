-- Thêm cột custom_permissions vào bảng user_roles để lưu trữ các phân quyền ghi đè
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS custom_permissions JSONB DEFAULT '{}'::jsonb;