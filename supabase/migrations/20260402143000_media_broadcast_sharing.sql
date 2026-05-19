-- ==============================================================================
-- MIGRATION: Mở rộng cơ chế Phát sóng (Broadcast) cho Thư viện số (Media & Categories)
-- Ngày: 2026-04-02
-- ==============================================================================

-- 1. Thêm cột published_to vào các bảng thư viện
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS published_to UUID [] DEFAULT '{}';

ALTER TABLE public.media
ADD COLUMN IF NOT EXISTS published_to UUID [] DEFAULT '{}';

-- Index GIN để tối ưu tìm kiếm Array
CREATE INDEX IF NOT EXISTS idx_categories_published_to ON public.categories USING GIN (published_to);
CREATE INDEX IF NOT EXISTS idx_media_published_to ON public.media USING GIN (published_to);

-- 2. Cập nhật RLS Policy cho Categories
DROP POLICY IF EXISTS "Public can read categories including broadcast" ON public.categories;
CREATE POLICY "Public can read categories including broadcast" ON public.categories FOR
SELECT USING (
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

-- Admin Policy cho Categories
DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (
    public.is_global_admin()
    OR (
        public.has_admin_role() 
        AND tenant_id = public.get_current_tenant_id()
    )
);

-- 3. Cập nhật RLS Policy cho Media
DROP POLICY IF EXISTS "Public can read media including broadcast" ON public.media;
CREATE POLICY "Public can read media including broadcast" ON public.media FOR
SELECT USING (
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

-- Admin Policy cho Media
DROP POLICY IF EXISTS "Admins manage media" ON public.media;
CREATE POLICY "Admins manage media" ON public.media FOR ALL USING (
    public.is_global_admin()
    OR (
        public.has_admin_role() 
        AND tenant_id = public.get_current_tenant_id()
    )
);
