-- ==============================================================================
-- MIGRATION: ON DELETE CASCADE — Dọn rác tự động khi xóa Tenant
-- Ngày: 2026-03-04
-- Mục đích: Khi một chi nhánh (tenant) bị xóa khỏi hệ thống,
--   TẤT CẢ dữ liệu liên quan bị xóa dây chuyền — không còn rác DB
-- ==============================================================================

-- NOTE: Để thêm CASCADE, phải DROP và tạo lại foreign key constraint

-- ------------------------------------------------------------------------------
-- events → tenants
-- ------------------------------------------------------------------------------
ALTER TABLE public.events
DROP CONSTRAINT IF EXISTS events_tenant_id_fkey;

ALTER TABLE public.events
ADD CONSTRAINT events_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;

-- ------------------------------------------------------------------------------
-- news → tenants
-- ------------------------------------------------------------------------------
ALTER TABLE public.news
DROP CONSTRAINT IF EXISTS news_tenant_id_fkey;

ALTER TABLE public.news
ADD CONSTRAINT news_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;

-- ------------------------------------------------------------------------------
-- dharma_talks → tenants
-- ------------------------------------------------------------------------------
ALTER TABLE public.dharma_talks
DROP CONSTRAINT IF EXISTS dharma_talks_tenant_id_fkey;

ALTER TABLE public.dharma_talks
ADD CONSTRAINT dharma_talks_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;

-- ------------------------------------------------------------------------------
-- about_sections → tenants
-- ------------------------------------------------------------------------------
ALTER TABLE public.about_sections
DROP CONSTRAINT IF EXISTS about_sections_tenant_id_fkey;

ALTER TABLE public.about_sections
ADD CONSTRAINT about_sections_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;

-- ------------------------------------------------------------------------------
-- hero_slides → tenants
-- ------------------------------------------------------------------------------
ALTER TABLE public.hero_slides
DROP CONSTRAINT IF EXISTS hero_slides_tenant_id_fkey;

ALTER TABLE public.hero_slides
ADD CONSTRAINT hero_slides_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;

-- ------------------------------------------------------------------------------
-- categories → tenants
-- ------------------------------------------------------------------------------
ALTER TABLE public.categories
DROP CONSTRAINT IF EXISTS categories_tenant_id_fkey;

ALTER TABLE public.categories
ADD CONSTRAINT categories_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;

-- ------------------------------------------------------------------------------
-- pages → tenants
-- ------------------------------------------------------------------------------
ALTER TABLE public.pages
DROP CONSTRAINT IF EXISTS pages_tenant_id_fkey;

ALTER TABLE public.pages
ADD CONSTRAINT pages_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;

-- ------------------------------------------------------------------------------
-- media → tenants
-- ------------------------------------------------------------------------------
ALTER TABLE public.media
DROP CONSTRAINT IF EXISTS media_tenant_id_fkey;

ALTER TABLE public.media
ADD CONSTRAINT media_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;

-- ------------------------------------------------------------------------------
-- transaction_projects → tenants
-- ------------------------------------------------------------------------------
ALTER TABLE public.transaction_projects
DROP CONSTRAINT IF EXISTS transaction_projects_tenant_id_fkey;

ALTER TABLE public.transaction_projects
ADD CONSTRAINT transaction_projects_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;

-- ------------------------------------------------------------------------------
-- transaction_purposes → tenants
-- ------------------------------------------------------------------------------
ALTER TABLE public.transaction_purposes
DROP CONSTRAINT IF EXISTS transaction_purposes_tenant_id_fkey;

ALTER TABLE public.transaction_purposes
ADD CONSTRAINT transaction_purposes_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;

-- ------------------------------------------------------------------------------
-- newsletter_subscribers → tenants
-- ------------------------------------------------------------------------------
ALTER TABLE public.newsletter_subscribers
DROP CONSTRAINT IF EXISTS newsletter_subscribers_tenant_id_fkey;

ALTER TABLE public.newsletter_subscribers
ADD CONSTRAINT newsletter_subscribers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;

-- ------------------------------------------------------------------------------
-- site_settings → tenants  (đã có từ trước, chỉ đảm bảo CASCADE)
-- ------------------------------------------------------------------------------
ALTER TABLE public.site_settings
DROP CONSTRAINT IF EXISTS site_settings_tenant_id_fkey;

ALTER TABLE public.site_settings
ADD CONSTRAINT site_settings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;

-- ------------------------------------------------------------------------------
-- transactions → tenants
-- ------------------------------------------------------------------------------
ALTER TABLE public.transactions
DROP CONSTRAINT IF EXISTS transactions_tenant_id_fkey;

ALTER TABLE public.transactions
ADD CONSTRAINT transactions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;

-- ------------------------------------------------------------------------------
-- user_roles → tenants  (xóa tenant thì xóa luôn roles)
-- ------------------------------------------------------------------------------
ALTER TABLE public.user_roles
DROP CONSTRAINT IF EXISTS user_roles_tenant_id_fkey;

ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;

-- ==============================================================================
-- KIỂM TRA: Chạy lệnh này để xem tất cả FK và CASCADE status
-- SELECT
--     tc.table_name,
--     kcu.column_name,
--     rc.delete_rule
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu
--     ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.referential_constraints AS rc
--     ON tc.constraint_name = rc.constraint_name
-- WHERE kcu.column_name = 'tenant_id'
-- ORDER BY tc.table_name;
-- ==============================================================================