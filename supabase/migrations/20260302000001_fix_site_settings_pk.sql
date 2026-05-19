-- Thêm composite primary key / unique constraint cho site_settings để hỗ trợ Multi-tenant

-- 1. Xóa khóa chính tĩnh hiện tại dựa trên `key`
ALTER TABLE site_settings
DROP CONSTRAINT IF EXISTS site_settings_pkey CASCADE;

-- 2. Đảm bảo tất cả current records đều có tenant_id (phòng hờ)
UPDATE site_settings
SET
    tenant_id = '55555555-5555-5555-5555-555555555555'
WHERE
    tenant_id IS NULL;

-- 3. Đánh lại Composite Primary Key trên (tenant_id, key)
ALTER TABLE site_settings ADD PRIMARY KEY (tenant_id, key);