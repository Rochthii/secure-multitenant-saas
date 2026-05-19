-- Migration: Thêm cột order_position vào bảng transaction_projects
-- Mục đích: Cho phép sắp xếp thứ tự các hạng mục và fix lỗi SQL query trong Admin

ALTER TABLE public.transaction_projects ADD COLUMN IF NOT EXISTS order_position integer DEFAULT 0;
