-- ==============================================================================
-- KỊCH BẢN MIGRATION: HỆ THỐNG GLOBAL BROADCAST (PHÁP ÂM TRUYỀN TIN)
-- Mục đích: Thêm cột `published_to` (mảng UUID) cho các bảng nội dung chính.
-- Cho phép Chi nhánh Gốc đăng 1 bài viết/sự kiện/pháp âm và chọn hiển thị ở nhiều Chi nhánh Nhánh cùng lúc.
-- ==============================================================================

-- 1. Bảng Tin Tức (news)
ALTER TABLE public.news 
  ADD COLUMN IF NOT EXISTS published_to uuid[] DEFAULT '{}'::uuid[];

-- 2. Bảng Sự Kiện (events)
ALTER TABLE public.events 
  ADD COLUMN IF NOT EXISTS published_to uuid[] DEFAULT '{}'::uuid[];

-- 3. Bảng Pháp Âm (dharma_talks)
ALTER TABLE public.dharma_talks 
  ADD COLUMN IF NOT EXISTS published_to uuid[] DEFAULT '{}'::uuid[];

-- Cập nhật Role-based Row Level Security (RLS) để cho phép Viewer/Subscriber đọc bài chéo
-- Lưu ý: Bạn cần bảo đảm các Policy RLS của news, events, dharma_talks cho phép SELECT
-- khi (tenant_id = current_tenant) HOẶC (current_tenant = ANY(published_to))
-- Code phía Frontend (Supabase JS, Next.js cache queries) đã xử lý điều kiện .or() này
-- ==============================================================================