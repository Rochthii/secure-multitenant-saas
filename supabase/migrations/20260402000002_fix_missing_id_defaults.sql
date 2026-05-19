-- Migration: Fix missing default gen_random_uuid() on id columns
-- Target: dharma_talks, tags, news_tags, media_tags, dharma_talk_tags

DO $$
DECLARE
    t_name text;
BEGIN
    FOR t_name IN SELECT unnest(ARRAY[
        'dharma_talks', 
        'tags', 
        'news_tags', 
        'media_tags', 
        'dharma_talk_tags',
        'transaction_projects',
        'transactions',
        'event_registrations',
        'media',
        'about_sections',
        'hero_slides',
        'pages',
        'categories',
        'faqs'
    ]) 
    LOOP
        -- Kiểm tra xem bảng có tồn tại không và cột id có tồn tại không
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t_name AND column_name = 'id') THEN
            EXECUTE format('ALTER TABLE public.%I ALTER COLUMN id SET DEFAULT gen_random_uuid();', t_name);
        END IF;
    END LOOP;
END $$;
