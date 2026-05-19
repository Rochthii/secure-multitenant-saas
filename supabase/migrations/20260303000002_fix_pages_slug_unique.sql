ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_slug_key;

DROP INDEX IF EXISTS pages_slug_key;

ALTER TABLE pages
ADD CONSTRAINT pages_tenant_id_slug_key UNIQUE (tenant_id, slug);