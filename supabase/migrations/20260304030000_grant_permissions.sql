-- ==============================================================================
-- MIGRATION: Mở quyền SELECT PUBLIC cho anon key (Service khóa cachedQueries)
-- Ngày: 2026-03-04
-- Mục đích: unstable_cache dùng ANON KEY — cần GRANT SELECT cho các bảng public
--   để getCachedHeroSlides, getCachedNews, v.v. hoạt động đúng sau khi bật RLS
-- ==============================================================================

-- Sau khi bật RLS, anon key không thể SELECT nếu không có policy cho anon.
-- Policy "Public can read" trong migration trước dùng `auth.uid()` logic
-- nhưng cần đảm bảo anon (chưa đăng nhập) vẫn đọc được nội dung public.

-- Cấp quyền SELECT cơ bản cho service anon (đã được kiểm soát bởi RLS policy)
GRANT SELECT ON public.hero_slides TO anon;

GRANT SELECT ON public.news TO anon;

GRANT SELECT ON public.events TO anon;

GRANT SELECT ON public.dharma_talks TO anon;

GRANT SELECT ON public.about_sections TO anon;

GRANT SELECT ON public.categories TO anon;

GRANT SELECT ON public.pages TO anon;

GRANT SELECT ON public.media TO anon;

GRANT SELECT ON public.transaction_projects TO anon;

GRANT SELECT ON public.transaction_purposes TO anon;

GRANT SELECT ON public.site_settings TO anon;

GRANT SELECT ON public.tenants TO anon;

-- Cấp quyền INSERT cho newsletter (ai cũng có thể đăng ký)
GRANT INSERT ON public.newsletter_subscribers TO anon;

-- Cấp quyền cho authenticated users (admin operations)
GRANT ALL ON public.hero_slides TO authenticated;

GRANT ALL ON public.news TO authenticated;

GRANT ALL ON public.events TO authenticated;

GRANT ALL ON public.dharma_talks TO authenticated;

GRANT ALL ON public.about_sections TO authenticated;

GRANT ALL ON public.categories TO authenticated;

GRANT ALL ON public.pages TO authenticated;

GRANT ALL ON public.media TO authenticated;

GRANT ALL ON public.transaction_projects TO authenticated;

GRANT ALL ON public.transaction_purposes TO authenticated;

GRANT ALL ON public.site_settings TO authenticated;

GRANT ALL ON public.newsletter_subscribers TO authenticated;

-- ==============================================================================
-- KIỂM TRA RLS ĐÃ BẬT:
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
-- ==============================================================================