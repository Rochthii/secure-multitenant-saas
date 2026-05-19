-- PATCH KHẨN CẤP: Kích hoạt tất cả about_sections
-- Chạy 1 dòng này trên Supabase SQL Editor → trang /gioi-thieu sẽ hiện ngay
UPDATE about_sections
SET
    is_active = true
WHERE
    is_active IS NOT TRUE;