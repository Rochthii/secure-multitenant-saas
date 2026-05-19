-- ==============================================================================
-- [P0 CRITICAL] FIX site_settings PRIMARY KEY cho Multi-tenant
-- Ngày: 2026-03-04
-- Vấn đề: PK hiện tại là (key) → 2 chi nhánh không thể có cùng key
--         Code đang upsert với onConflict: 'tenant_id,key' nhưng DB chưa hỗ trợ
-- Giải pháp: Đổi PK thành (key, tenant_id) — COMPOSITE PRIMARY KEY
-- ==============================================================================

-- Bước 1: Xóa PK cũ
ALTER TABLE public.site_settings
DROP CONSTRAINT IF EXISTS site_settings_pkey;

-- Bước 2: Tạo PK mới — composite (tenant_id, key)
-- Lưu ý: đặt tenant_id trước để optimize query theo tenant
ALTER TABLE public.site_settings
ADD CONSTRAINT site_settings_pkey PRIMARY KEY (tenant_id, key);

-- Bước 3: Tạo index bổ sung để tìm kiếm theo key (optional nhưng nên có)
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings (key);

-- Bước 4: Đảm bảo tenant_id có default value (không null)
ALTER TABLE public.site_settings ALTER COLUMN tenant_id
SET
    NOT NULL,
    ALTER COLUMN tenant_id
SET
    DEFAULT '55555555-5555-5555-5555-555555555555';

-- ==============================================================================
-- KIỂM TRA sau khi chạy:
-- SELECT conname, contype, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'public.site_settings'::regclass;
-- ==============================================================================