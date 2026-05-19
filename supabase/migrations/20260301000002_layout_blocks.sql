-- Phase 2: Layout Designer
-- Thêm cột layout_blocks JSONB vào bảng tenants để lưu thứ tự và trạng thái hiển thị của các sections

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS layout_blocks JSONB DEFAULT NULL;

-- Seed giá trị mặc định cho tất cả tenants hiện có
-- (Thứ tự này tương ứng với thứ tự hiện tại trong traditional-home.tsx)
UPDATE tenants 
SET layout_blocks = '[
  {"id": "hero",           "visible": true},
  {"id": "dharma_quote",   "visible": true},
  {"id": "intro",          "visible": true},
  {"id": "feature_mosaic", "visible": true},
  {"id": "culture_preview","visible": true},
  {"id": "dharma_talks",   "visible": true},
  {"id": "transaction_cta",   "visible": true},
  {"id": "latest_news",    "visible": true},
  {"id": "khmer_calendar", "visible": true},
  {"id": "facebook_feed",  "visible": true}
]'::jsonb
WHERE layout_blocks IS NULL;