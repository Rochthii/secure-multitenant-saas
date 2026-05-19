-- Migration: Fix RLS for transaction_projects to allow Super Admin access
-- Created by Antigravity on 2026-03-30
-- Target: Fix the "disappearing data" issue for Global Admins

-- 1. Xóa các policy cũ để tránh xung đột
DROP POLICY IF EXISTS "Campigns are viewable by everyone." ON public.transaction_projects;
DROP POLICY IF EXISTS "Projects can be created by authenticated users" ON public.transaction_projects;
DROP POLICY IF EXISTS "Projects can be updated by authenticated users" ON public.transaction_projects;
DROP POLICY IF EXISTS "Projects can be deleted by authenticated users" ON public.transaction_projects;
DROP POLICY IF EXISTS "Global admins can manage all projects" ON public.transaction_projects;
DROP POLICY IF EXISTS "Tenant admins can manage own projects" ON public.transaction_projects;

-- 2. Đảm bảo RLS đã được bật
ALTER TABLE public.transaction_projects ENABLE ROW LEVEL SECURITY;

-- 3. Tạo các Policy mới bảo mật và linh hoạt hơn

-- A. Quyền cho GLOBAL ADMIN (Super Admin / Company Editor)
-- Cho phép làm tất cả mọi thứ với mọi bản ghi
CREATE POLICY "Global admins can manage all projects" 
ON public.transaction_projects 
FOR ALL 
TO authenticated
USING (
  public.is_global_admin() -- Hàm này kiểm tra role 'super_admin' hoặc 'company_editor'
);

-- B. Quyền cho TENANT ADMIN / EDITOR
-- Chỉ được thao tác trên dữ liệu của chính cơ sở (chi nhánh) mình
CREATE POLICY "Tenant admins can manage own projects" 
ON public.transaction_projects 
FOR ALL 
TO authenticated
USING (
  NOT public.is_global_admin()
  AND 
  tenant_id = public.get_current_tenant_id()
)
WITH CHECK (
  NOT public.is_global_admin() 
  AND 
  tenant_id = public.get_current_tenant_id()
);

-- C. Quyền cho PUBLIC / ANONYMOUS (Trang web chính)
-- Chỉ được xem các hạng mục đang được bật Hiển thị
CREATE POLICY "Public can view active projects" 
ON public.transaction_projects 
FOR SELECT 
TO anon, authenticated
USING (
  is_active = true
);

-- D. Quyền cho AUTHENTICATED USERS (Xem bản nháp nếu là admin chi nhánh đó)
-- Cho phép xem các hạng mục ẩn/nháp nếu có quyền quản trị tương ứng
CREATE POLICY "Staff can view hidden projects of their own tenant" 
ON public.transaction_projects 
FOR SELECT 
TO authenticated
USING (
  is_active = false 
  AND (
    public.is_global_admin() 
    OR 
    tenant_id = public.get_current_tenant_id()
  )
);
