-- Migration: Xóa sạch TOÀN BỘ about_sections cũ trước khi seed lại
-- Chạy file này TRƯỚC khi chạy 20260225_seed_about_pages.sql
-- Mục đích: loại bỏ trùng lặp giữa sections cũ (abbot, founder, intro, history...)
--           và 11 sections mới vừa thiết kế

-- Xóa TẤT CẢ bản ghi trong bảng about_sections
-- (Bảng này được quản lý hoàn toàn qua migration, không có user-created data)
DELETE FROM about_sections;

-- Sau khi chạy file này, chạy tiếp:
-- supabase/migrations/20260225_seed_about_pages.sql