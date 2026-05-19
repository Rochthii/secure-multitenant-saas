-- ==============================================================================
-- THÊM CỘT `order_position` CHO BẢNG `categories` ĐỂ HỖ TRỢ KÉO THẢ UI
-- Mặc định là 0. Khi người dùng kéo thả, giá trị này sẽ được cập nhật.
-- ==============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'categories' 
          AND column_name = 'order_position' 
          AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.categories ADD COLUMN order_position integer DEFAULT 0;
    END IF;
END $$;