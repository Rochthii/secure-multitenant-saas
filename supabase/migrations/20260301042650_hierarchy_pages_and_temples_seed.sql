-- 1. Nâng cấp bảng trang nội dung (pages) thêm tính năng phân cấp (Hierarchy)
ALTER TABLE public.pages
ADD COLUMN parent_id UUID REFERENCES public.pages (id) ON DELETE SET NULL,
ADD COLUMN order_index INT DEFAULT 0,
ADD COLUMN show_in_menu BOOLEAN DEFAULT true;

-- 2. Cập nhật bảng màu và Layout Blocks (Homepage) cho 3 Chi nhánh còn lại

-- A. Chi nhánh Phù Ly
UPDATE public.tenants
SET 
  theme_colors = '{"primary":"#D4AF37", "secondary":"#8B1E1E", "bgStart":"#F5F0E6"}',
  layout_blocks = '[
    {"id": "hero", "visible": true},
    {"id": "intro", "visible": true},
    {"id": "latest_news", "visible": true},
    {"id": "feature_mosaic", "visible": true}
  ]'::jsonb
WHERE id = '22222222-2222-2222-2222-222222222222';

-- B. Chi nhánh Kh''leang (Escape single quote)
UPDATE public.tenants
SET 
  theme_colors = '{"primary":"#2F6F4E", "secondary":"#E8C547", "bgStart":"#FFFFFF"}',
  layout_blocks = '[
    {"id": "hero", "visible": true},
    {"id": "dharma_quote", "visible": true},
    {"id": "culture_preview", "visible": true},
    {"id": "dharma_talks", "visible": true},
    {"id": "khmer_calendar", "visible": true}
  ]'::jsonb
WHERE id = '33333333-3333-3333-3333-333333333333';

-- C. Chi nhánh Hộ Phòng Cũ
UPDATE public.tenants
SET 
  theme_colors = '{"primary":"#6B4FA3", "secondary":"#F2D16B", "bgStart":"#F5F0E6"}',
  layout_blocks = '[
    {"id": "hero", "visible": true},
    {"id": "transaction_cta", "visible": true},
    {"id": "dharma_talks", "visible": true},
    {"id": "facebook_feed", "visible": true}
  ]'::jsonb
WHERE id = '44444444-4444-4444-4444-444444444444';