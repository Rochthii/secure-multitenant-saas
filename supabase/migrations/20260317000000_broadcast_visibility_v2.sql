-- ==============================================================================
-- MIGRATION: CỦNG CỐ LOGIC PHÁT SÓNG (BROADCAST) & QUYỀN XEM ADMIN
-- Ngày: 2026-03-17
-- Mục đích: 
--   1. Cho phép Admin/Editor của chi nhánh thấy bài được Global phát sóng xuống (published_to).
--   2. Đảm bảo bài viết từ Root Tenant (55555555...) có thể được xem bởi mọi người nếu đã xuất bản.
-- ==============================================================================

-- 1. CẬP NHẬT RLS CHO BẢNG NEWS
DROP POLICY IF EXISTS "Public can read published news for specific tenant" ON public.news;
CREATE POLICY "Public can read news including broadcast" ON public.news FOR
SELECT USING (
    status = 'published' AND (
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

-- 2. CẬP NHẬT RLS CHO BẢNG EVENTS
DROP POLICY IF EXISTS "Public can read events" ON public.events;
CREATE POLICY "Public can read events including broadcast" ON public.events FOR
SELECT USING (
    (status IN ('upcoming', 'ongoing', 'completed') AND (
        tenant_id IS NULL 
        OR tenant_id = '55555555-5555-5555-5555-555555555555' 
        OR tenant_id = public.get_current_tenant_id()
        OR public.get_current_tenant_id() = ANY(published_to)
    ))
    OR (
        auth.uid() IS NOT NULL AND (
            public.is_global_admin()
            OR tenant_id = public.get_current_tenant_id()
            OR public.get_current_tenant_id() = ANY(published_to)
        )
    )
);

-- 3. CẬP NHẬT RLS CHO BẢNG DHARMA_TALKS
DROP POLICY IF EXISTS "Public can read dharma talks" ON public.dharma_talks;
CREATE POLICY "Public can read dharma talks including broadcast" ON public.dharma_talks FOR
SELECT USING (
    (is_active = true AND (
        tenant_id IS NULL 
        OR tenant_id = '55555555-5555-5555-5555-555555555555' 
        OR tenant_id = public.get_current_tenant_id()
        OR public.get_current_tenant_id() = ANY(published_to)
    ))
    OR (
        auth.uid() IS NOT NULL AND (
            public.is_global_admin()
            OR tenant_id = public.get_current_tenant_id()
            OR public.get_current_tenant_id() = ANY(published_to)
        )
    )
);

-- GHI CHÚ: Logic ANY(published_to) cho phép Admin chi nhánh thấy bài từ Root 
-- trong Dashboard của họ nếu Root đã gán bài đó vào danh sách 'published_to' của chi nhánh.
