-- Migration: Thêm trường mô tả ngắn (excerpt) cho sự kiện
-- Chạy trong Supabase SQL Editor

ALTER TABLE events ADD COLUMN IF NOT EXISTS excerpt_vi TEXT;

ALTER TABLE events ADD COLUMN IF NOT EXISTS excerpt_km TEXT;

ALTER TABLE events ADD COLUMN IF NOT EXISTS excerpt_en TEXT;

-- Ghi chú: Các trường này sẽ được dùng để hiển thị preview trên Card sự kiện,
-- giúp tránh việc phải parse HTML từ trường description chi tiết.