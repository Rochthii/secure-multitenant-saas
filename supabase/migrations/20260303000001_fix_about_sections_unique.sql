ALTER TABLE public.about_sections
DROP CONSTRAINT IF EXISTS about_sections_key_key;

DROP INDEX IF EXISTS public.about_sections_key_key;

ALTER TABLE public.about_sections
DROP CONSTRAINT IF EXISTS about_sections_tenant_id_key_key;

ALTER TABLE public.about_sections
ADD CONSTRAINT about_sections_tenant_id_key_key UNIQUE (tenant_id, key);