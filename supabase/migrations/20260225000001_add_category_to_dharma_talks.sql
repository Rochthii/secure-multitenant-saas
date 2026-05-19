-- Bổ sung category_id vào bảng dharma_talks
ALTER TABLE public.dharma_talks
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories (id) ON DELETE SET NULL;