-- Migration: Thêm cột image_url và images vào bảng about_sections
-- Cột image_url: ảnh đại diện chính cho section
-- Cột images: mảng JSON chứa nhiều URL ảnh phụ (gallery)

ALTER TABLE about_sections
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS images TEXT [] DEFAULT '{}';

-- Cập nhật schema cache Supabase (refresh sau khi thêm cột)
NOTIFY pgrst, 'reload schema';