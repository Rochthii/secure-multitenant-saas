-- ==============================================================================
-- MIGRATION: TỐI ƯU HÓA CHỈ MỤC (INDEXING) CHO PHÁT SÓNG (BROADCAST)
-- Ngày: 2026-03-17
-- Mục đích: 
--   1. Thêm GIN index cho cột published_to trên các bảng news, events, dharma_talks.
--   2. Đảm bảo các truy vấn .or() và ANY(published_to) chạy với tốc độ tối đa.
--   3. Giảm tải Active CPU cho Database và App Server khi dữ liệu lớn dần.
-- ==============================================================================

-- 1. INDEX CHO TIN TỨC (NEWS)
CREATE INDEX IF NOT EXISTS idx_news_published_to_gin ON public.news USING GIN (published_to);
CREATE INDEX IF NOT EXISTS idx_news_tenant_id ON public.news (tenant_id);
CREATE INDEX IF NOT EXISTS idx_news_slug ON public.news (slug);

-- 2. INDEX CHO SỰ KIỆN (EVENTS)
CREATE INDEX IF NOT EXISTS idx_events_published_to_gin ON public.events USING GIN (published_to);
CREATE INDEX IF NOT EXISTS idx_events_tenant_id ON public.events (tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events (slug);

-- 3. INDEX CHO PHÁP THOẠI (DHARMA_TALKS)
CREATE INDEX IF NOT EXISTS idx_dharma_talks_published_to_gin ON public.dharma_talks USING GIN (published_to);
CREATE INDEX IF NOT EXISTS idx_dharma_talks_tenant_id ON public.dharma_talks (tenant_id);
CREATE INDEX IF NOT EXISTS idx_dharma_talks_slug ON public.dharma_talks (slug);

-- 4. INDEX CHO DANH MỤC (CATEGORIES)
CREATE INDEX IF NOT EXISTS idx_categories_tenant_id ON public.categories (tenant_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories (slug, module);

-- HOÀN TẤT TỐI ƯU HÓA.
