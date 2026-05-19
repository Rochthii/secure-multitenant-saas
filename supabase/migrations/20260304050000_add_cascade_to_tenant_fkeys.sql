-- ==============================================================================
-- FIX CASCADE: Drop và re-create FK với ON DELETE CASCADE (SAFE VERSION)
-- Dùng DO block để skip bảng / constraint không tồn tại
-- ==============================================================================

DO $$
DECLARE
    tables_fkeys TEXT[][] := ARRAY[
        ARRAY['about_sections',          'about_sections_tenant_id_fkey',          'CASCADE'],
        ARRAY['audit_logs',              'audit_logs_tenant_id_fkey',              'CASCADE'],
        ARRAY['categories',              'categories_tenant_id_fkey',              'CASCADE'],
        ARRAY['charity_posts',           'charity_posts_tenant_id_fkey',           'CASCADE'],
        ARRAY['contact_messages',        'contact_messages_tenant_id_fkey',        'CASCADE'],
        ARRAY['content_revisions',       'content_revisions_tenant_id_fkey',       'CASCADE'],
        ARRAY['dharma_talks',            'dharma_talks_tenant_id_fkey',            'CASCADE'],
        ARRAY['transaction_projects',       'transaction_projects_tenant_id_fkey',       'CASCADE'],
        ARRAY['transaction_purposes',       'transaction_purposes_tenant_id_fkey',       'CASCADE'],
        ARRAY['transactions',               'transactions_tenant_id_fkey',               'CASCADE'],
        ARRAY['event_registrations',     'event_registrations_tenant_id_fkey',     'CASCADE'],
        ARRAY['events',                  'events_tenant_id_fkey',                  'CASCADE'],
        ARRAY['faqs',                    'faqs_tenant_id_fkey',                    'CASCADE'],
        ARRAY['hero_slides',             'hero_slides_tenant_id_fkey',             'CASCADE'],
        ARRAY['homepage_stats',          'homepage_stats_tenant_id_fkey',          'CASCADE'],
        ARRAY['media',                   'media_tenant_id_fkey',                   'CASCADE'],
        ARRAY['news',                    'news_tenant_id_fkey',                    'CASCADE'],
        ARRAY['newsletter_subscribers',  'newsletter_subscribers_tenant_id_fkey',  'CASCADE'],
        ARRAY['pages',                   'pages_tenant_id_fkey',                   'CASCADE'],
        ARRAY['quick_access_links',      'quick_access_links_tenant_id_fkey',      'CASCADE'],
        ARRAY['site_settings',           'site_settings_tenant_id_fkey',           'CASCADE'],
        ARRAY['testimonials',            'testimonials_tenant_id_fkey',            'CASCADE'],
        ARRAY['user_roles',              'user_roles_tenant_id_fkey',              'SET NULL']
    ];
    rec TEXT[];
    tbl TEXT;
    fkey TEXT;
    action TEXT;
    tbl_exists BOOLEAN;
BEGIN
    FOREACH rec SLICE 1 IN ARRAY tables_fkeys LOOP
        tbl    := rec[1];
        fkey   := rec[2];
        action := rec[3];

        -- Kiểm tra bảng có tồn tại không
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = tbl
        ) INTO tbl_exists;

        IF NOT tbl_exists THEN
            RAISE NOTICE 'Table % does not exist, skipping.', tbl;
            CONTINUE;
        END IF;

        -- Drop FK cũ nếu tồn tại
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE table_schema = 'public'
              AND table_name = tbl
              AND constraint_name = fkey
              AND constraint_type = 'FOREIGN KEY'
        ) THEN
            EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I', tbl, fkey);
        END IF;

        -- Thêm lại FK với ON DELETE action
        EXECUTE format(
            'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE %s',
            tbl, fkey, action
        );

        RAISE NOTICE 'Updated FK % on table % with ON DELETE %', fkey, tbl, action;
    END LOOP;
END;
$$;