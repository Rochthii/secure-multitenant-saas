-- Xóa constraint categories_type_check cũ đang gây lỗi
ALTER TABLE public.categories
DROP CONSTRAINT IF EXISTS categories_type_check;

-- Cập nhật lại các danh mục đã lỡ có type 'media' thành 'dharma' để đồng nhất theo đúng thiết kế ban đầu
UPDATE public.categories
SET
    type = 'dharma'
WHERE
    type = 'media'
    AND module = 'dharma';