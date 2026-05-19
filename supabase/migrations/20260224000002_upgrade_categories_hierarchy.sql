-- Tái kiến trúc bảng categories hỗ trợ Cây Đa Tầng (Hierarchical Taxonomy)

-- 1. Bổ sung trường parent_id để tạo liên kết phân cấp cha - con
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.categories (id) ON DELETE CASCADE;

-- 2. Tái cấu trúc trường 'type' thành 'module' linh hoạt hơn
-- Thay vì ENUM cứng ('news', 'event', 'media'), ta dùng varchar để dễ dàng thêm mới các module như 'dharma_talks', 'documents', 'charity', v.v...
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS module varchar(50) DEFAULT 'news';

-- (Optional) Update dữ liệu cũ: chuyển type -> module
UPDATE public.categories SET module = type::varchar WHERE module = 'news' AND type IS NOT NULL;

-- 3. Tạo index để truy vấn cây phả hệ nhanh hơn (ví dụ tìm tất cả con của 1 nhánh)
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories (parent_id);

CREATE INDEX IF NOT EXISTS idx_categories_module ON public.categories (module);