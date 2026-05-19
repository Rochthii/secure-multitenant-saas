-- Migration: Thêm cột nav_visibility vào bảng tenants
-- Mục đích: Cho phép Admin cấu hình bật/tắt từng mục trên Header (Menu Navigation)
-- độc lập với việc hiển thị các blocks/sections trên trang chủ
--
-- Cấu trúc nav_visibility (JSONB):
-- {
--   "home": true,
--   "about": true,
--   "news": true,
--   "dharma": true,
--   "documents": true,
--   "transaction": true,
--   "contact": true
-- }
-- Nếu key không tồn tại hoặc null → mặc định hiện (true)

ALTER TABLE public.tenants
    ADD COLUMN IF NOT EXISTS nav_visibility jsonb DEFAULT '{}';

COMMENT ON COLUMN public.tenants.nav_visibility IS
    'Cấu hình bật/tắt từng mục menu chính trên Header. Keys: home, about, news, dharma, documents, transaction, contact. Default: hiển thị tất cả.';
