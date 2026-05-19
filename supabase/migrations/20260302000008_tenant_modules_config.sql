-- ==============================================================================
-- KỊCH BẢN MIGRATION: THIẾT LẬP KIẾN TRÚC LẮP RÁP MODULE (PLUG-AND-PLAY)
-- Mục đích: Bổ sung cột cấu hình JSONB vào bảng tenants để cho phép mỗi chi nhánh
-- tự do bật/tắt các tính năng (modules) tuỳ theo nhu cầu thực tế.
-- ==============================================================================

-- 1. Thêm cột modules_config kiểu JSONB vào bảng tenants, gắn giá trị mặc định.
-- Cấu trúc mặc định: Bật tất cả các module chuẩn.
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS modules_config jsonb DEFAULT '{
  "news_events": true,
  "dharma_talks": true,
  "transactions": true,
  "digital_library": true,
  "registrations": true,
  "monk_profiles": true
}'::jsonb;

-- 2. Cập nhật dữ liệu cho các tenants đã tồn tại trước đó
-- (nếu họ chưa có cấu hình này, gán mặc định bật hết để khỏi lỗi UI)
UPDATE public.tenants
SET modules_config = '{
  "news_events": true,
  "dharma_talks": true,
  "transactions": true,
  "digital_library": true,
  "registrations": true,
  "monk_profiles": true
}'::jsonb
WHERE modules_config IS NULL;