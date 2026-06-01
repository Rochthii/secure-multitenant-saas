-- ==============================================================================
-- MIGRATION: Cập nhật giá trị mặc định & tên miền sang nexus-corp-ptit.vercel.app
-- Ngày: 2026-06-01
-- Mục tiêu: Cập nhật mặc định cho toàn bộ các bảng multi-tenant sang Tập đoàn Alpha
--   và đổi tên miền của nó sang nexus-corp-ptit.vercel.app để tương thích Vercel.
-- ==============================================================================

DO $$
DECLARE
    tbl RECORD;
BEGIN
    -- 1. Cập nhật domain cho Tập đoàn Alpha (Hội sở chính) sang nexus-corp-ptit.vercel.app nếu bảng tenants tồn tại
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'tenants'
    ) THEN
        -- Tránh lỗi trùng lặp bằng cách đổi tên domain của tenant khác nếu có
        UPDATE public.tenants
        SET domain = 'nexus-temp-' || substr(id::text, 1, 8) || '.vercel.app'
        WHERE domain = 'nexus-corp-ptit.vercel.app' 
          AND id <> '11111111-1111-1111-1111-111111111111';

        UPDATE public.tenants
        SET domain = 'nexus-corp-ptit.vercel.app'
        WHERE id = '11111111-1111-1111-1111-111111111111';
        RAISE NOTICE 'Updated flagship corporate tenant domain to nexus-corp-ptit.vercel.app';
    END IF;

    -- 2. Thay đổi giá trị DEFAULT của cột tenant_id trong tất cả các bảng tồn tại sang Tập đoàn Alpha (11111111...)
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name IN (
              'news', 'events', 'transactions', 'site_settings', 
              'audit_logs', 'charity_posts', 'faqs', 'homepage_stats', 
              'testimonials', 'newsletter_subscribers', 'quick_access_links', 
              'content_revisions'
          )
    LOOP
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN tenant_id SET DEFAULT ''11111111-1111-1111-1111-111111111111''::uuid', tbl.table_name);
        RAISE NOTICE 'Set default tenant_id on table % to Alpha successfully.', tbl.table_name;
    END LOOP;
END $$;
