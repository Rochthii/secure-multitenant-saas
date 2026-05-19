-- ==============================================================================
-- MIGRATION: Giai Đoạn 4 - RBAC (Phân Quyền) & Xuất Bản Chéo (Broadcast)
-- Ngày: 2026-02-28
-- ==============================================================================

-- 1. Tạo bảng user_roles để quản lý phân quyền gắn với chi nhánh
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (
        role IN (
            'super_admin',
            'company_editor',
            'tenant_admin',
            'tenant_editor',
            'tenant_accountant'
        )
    ),
    tenant_id UUID REFERENCES public.tenants (id) ON DELETE CASCADE, -- Null cho super_admin và company_editor
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW (),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW (),
        UNIQUE (user_id) -- Mỗi tài khoản 1 vai trò hệ thống duy nhất
);

-- Index để tối ưu RLS Query
CREATE INDEX idx_user_roles_user_id ON public.user_roles (user_id);

-- 2. Thêm cột published_to vào các bảng nội dung
ALTER TABLE public.news
ADD COLUMN IF NOT EXISTS published_to UUID [] DEFAULT '{}';

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS published_to UUID [] DEFAULT '{}';

-- Index GIN để tối ưu tìm kiếm Array (Sẽ tăng tốc độ lọc mảng trong Supabase .cs)
CREATE INDEX idx_news_published_to ON public.news USING GIN (published_to);

CREATE INDEX idx_events_published_to ON public.events USING GIN (published_to);

-- 3. Cập nhật các hàm Helper dùng cho Auth RLS
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS VARCHAR AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Viết lại hàm has_admin_role cho tương thích hệ thống mới (bao gồm mọi quyền quản trị)
CREATE OR REPLACE FUNCTION public.has_admin_role()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'company_editor', 'tenant_admin', 'tenant_editor', 'tenant_accountant')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ==============================================================================
-- 4. Bổ sung RLS (Row-Level Security) mẫu cho bảng user_roles
-- ==============================================================================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Super Admin có thể xem và sửa mọi user roles
CREATE POLICY "Super_Admin_Manage_Roles" ON public.user_roles FOR ALL USING (
    public.get_current_user_role () = 'super_admin'
);

-- User bình thường có thể xem role của chính mình
CREATE POLICY "Users_Read_Own_Role" ON public.user_roles FOR
SELECT USING (user_id = auth.uid ());

-- ==============================================================================
-- 5. Cập nhật RLS Policy cho News & Events (Bảo vệ dữ liệu đa chi nhánh)
-- ==============================================================================

-- Bảng News
DROP POLICY IF EXISTS "Admin_ALL_News" ON public.news;

CREATE POLICY "Admin_ALL_News" ON public.news FOR ALL USING (
    -- Super Admin & Company Editor có toàn quyền
    public.get_current_user_role () IN (
        'super_admin',
        'company_editor'
    )
    OR
    -- Tenant Admin & Tenant Editor chỉ được quản lý bài viết thuộc chi nhánh mình
    (
        public.get_current_user_role () IN (
            'tenant_admin',
            'tenant_editor'
        )
        AND tenant_id = public.get_current_tenant_id ()
    )
);

-- Bảng Events
DROP POLICY IF EXISTS "Admin_ALL_Events" ON public.events;

CREATE POLICY "Admin_ALL_Events" ON public.events FOR ALL USING (
    public.get_current_user_role () IN (
        'super_admin',
        'company_editor'
    )
    OR (
        public.get_current_user_role () IN (
            'tenant_admin',
            'tenant_editor'
        )
        AND tenant_id = public.get_current_tenant_id ()
    )
);

-- (BẢNG AUDIT LOGS ĐÃ TỒN TẠI TỪ MIGRATION KHỞI TẠO NÊN BỎ QUA VIỆC TẠO)