-- =============================================================================
-- SECURE MULTI-TENANT SAAS - COMPLETE DATABASE SCHEMA
-- Đề tài: Secure Multi-tenant SaaS: Áp dụng RLS và Audit Log trong quản trị rủi ro thông tin.
-- Generated on: 2026-05-22T15:53:44.703Z
-- Target: Production-ready Postgres (Supabase/PostgreSQL 17)
-- =============================================================================

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_net" SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =============================================================================
-- 1. TABLES DEFINITIONS
-- =============================================================================

-- Table: about_sections
CREATE TABLE public.about_sections (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    key CHARACTER VARYING NOT NULL,
    title_vi TEXT NOT NULL,
    title_km TEXT,
    title_en TEXT,
    content_vi TEXT,
    content_km TEXT,
    content_en TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    thumbnail_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    summary_vi TEXT,
    summary_km TEXT,
    summary_en TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    tenant_id UUID DEFAULT '55555555-5555-5555-5555-555555555555'::uuid,
    image_url TEXT
);

ALTER TABLE public.about_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_sections FORCE ROW LEVEL SECURITY;

-- Table: active_visitors
CREATE TABLE public.active_visitors (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    session_hash TEXT NOT NULL,
    path TEXT,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.active_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_visitors FORCE ROW LEVEL SECURITY;

-- Table: audit_logs
CREATE TABLE public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID,
    action CHARACTER VARYING NOT NULL,
    table_name CHARACTER VARYING,
    record_id TEXT,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    tenant_id UUID DEFAULT '55555555-5555-5555-5555-555555555555'::uuid,
    user_email CHARACTER VARYING,
    resource CHARACTER VARYING,
    severity TEXT DEFAULT 'INFO'::text,
    details JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY;

-- Table: bank_accounts
CREATE TABLE public.bank_accounts (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    tenant_id UUID,
    bank_code TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    qr_template TEXT DEFAULT 'compact2'::text,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts FORCE ROW LEVEL SECURITY;

-- Table: benchmark_jwt
CREATE TABLE public.benchmark_jwt (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tenant_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    dataset_size INTEGER
);

ALTER TABLE public.benchmark_jwt ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmark_jwt FORCE ROW LEVEL SECURITY;

-- Table: benchmark_legacy
CREATE TABLE public.benchmark_legacy (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tenant_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    dataset_size INTEGER
);

ALTER TABLE public.benchmark_legacy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmark_legacy FORCE ROW LEVEL SECURITY;

-- Table: categories
CREATE TABLE public.categories (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name_vi CHARACTER VARYING NOT NULL,
    name_km CHARACTER VARYING,
    name_en CHARACTER VARYING,
    slug CHARACTER VARYING NOT NULL,
    type CHARACTER VARYING,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    parent_id UUID,
    module CHARACTER VARYING DEFAULT 'news'::character varying,
    description_vi TEXT,
    description_km TEXT,
    description_en TEXT,
    thumbnail_url TEXT,
    tenant_id UUID DEFAULT '55555555-5555-5555-5555-555555555555'::uuid,
    order_position INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    published_to UUID[] DEFAULT '{}'::uuid[]
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories FORCE ROW LEVEL SECURITY;

-- Table: charity_posts
CREATE TABLE public.charity_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title_vi TEXT NOT NULL,
    title_km TEXT,
    title_en TEXT,
    excerpt_vi TEXT NOT NULL,
    excerpt_km TEXT,
    excerpt_en TEXT,
    image_url TEXT NOT NULL,
    image_alt_vi TEXT,
    image_alt_km TEXT,
    image_alt_en TEXT,
    link_url TEXT,
    event_date DATE NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    order_position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    tenant_id UUID DEFAULT '55555555-5555-5555-5555-555555555555'::uuid
);

ALTER TABLE public.charity_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charity_posts FORCE ROW LEVEL SECURITY;

-- Table: contact_messages
CREATE TABLE public.contact_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name CHARACTER VARYING NOT NULL,
    email CHARACTER VARYING,
    phone CHARACTER VARYING,
    subject CHARACTER VARYING,
    message TEXT NOT NULL,
    status CHARACTER VARYING DEFAULT 'unread'::character varying,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    replied_at TIMESTAMP WITH TIME ZONE,
    replied_by UUID,
    tenant_id UUID DEFAULT '55555555-5555-5555-5555-555555555555'::uuid
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages FORCE ROW LEVEL SECURITY;

-- Table: content_revisions
CREATE TABLE public.content_revisions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    changed_by UUID,
    old_data JSONB,
    new_data JSONB NOT NULL,
    change_summary TEXT,
    tenant_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.content_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_revisions FORCE ROW LEVEL SECURITY;

-- Table: cron_job_logs
CREATE TABLE public.cron_job_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    job_name TEXT NOT NULL,
    status TEXT NOT NULL,
    message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    duration_ms INTEGER,
    executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cron_job_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cron_job_logs FORCE ROW LEVEL SECURITY;

-- Table: dharma_embeddings
CREATE TABLE public.dharma_embeddings (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    tenant_id UUID,
    content_id UUID,
    content_type TEXT,
    content_text TEXT,
    embedding VECTOR,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.dharma_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dharma_embeddings FORCE ROW LEVEL SECURITY;

-- Table: dharma_talks
CREATE TABLE public.dharma_talks (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title_vi TEXT NOT NULL,
    title_km TEXT,
    title_en TEXT,
    description_vi TEXT,
    description_km TEXT,
    description_en TEXT,
    media_type TEXT NOT NULL,
    media_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    duration_minutes INTEGER,
    speaker_name_vi TEXT NOT NULL,
    speaker_name_km TEXT,
    speaker_name_en TEXT,
    topic_vi TEXT,
    topic_km TEXT,
    topic_en TEXT,
    recorded_date DATE,
    is_featured BOOLEAN DEFAULT false,
    order_position INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    category_id UUID,
    tenant_id UUID DEFAULT '55555555-5555-5555-5555-555555555555'::uuid,
    published_to UUID[] DEFAULT '{}'::uuid[],
    slug CHARACTER VARYING
);

ALTER TABLE public.dharma_talks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dharma_talks FORCE ROW LEVEL SECURITY;

-- Table: donation_campaigns
CREATE TABLE public.donation_campaigns (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    tenant_id UUID,
    bank_account_id UUID,
    type CAMPAIGN_TYPE NOT NULL DEFAULT 'specific_project'::campaign_type,
    title_vi TEXT NOT NULL,
    title_km TEXT,
    slug TEXT,
    description_vi TEXT,
    description_km TEXT,
    content_vi TEXT,
    content_km TEXT,
    thumbnail_url TEXT,
    target_amount NUMERIC,
    current_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'ongoing'::text,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    created_by UUID,
    order_position INTEGER DEFAULT 0,
    is_project BOOLEAN DEFAULT false,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.donation_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_campaigns FORCE ROW LEVEL SECURITY;

-- Table: donations
CREATE TABLE public.donations (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    donor_name CHARACTER VARYING,
    donor_phone CHARACTER VARYING,
    donor_email CHARACTER VARYING,
    amount NUMERIC NOT NULL,
    currency CHARACTER VARYING DEFAULT 'VND'::character varying,
    purpose CHARACTER VARYING,
    purpose_detail TEXT,
    payment_method CHARACTER VARYING,
    transaction_id CHARACTER VARYING,
    status CHARACTER VARYING DEFAULT 'pending'::character varying,
    note TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    tenant_id UUID DEFAULT '55555555-5555-5555-5555-555555555555'::uuid,
    recipient_type DONATION_RECIPIENT_TYPE DEFAULT 'temple_fund'::donation_recipient_type,
    bank_account_id UUID,
    campaign_id UUID
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations FORCE ROW LEVEL SECURITY;

-- Table: event_registrations
CREATE TABLE public.event_registrations (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    event_id UUID,
    full_name CHARACTER VARYING NOT NULL,
    phone CHARACTER VARYING,
    email CHARACTER VARYING,
    num_participants INTEGER DEFAULT 1,
    note TEXT,
    status CHARACTER VARYING DEFAULT 'pending'::character varying,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    tenant_id UUID DEFAULT '55555555-5555-5555-5555-555555555555'::uuid
);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations FORCE ROW LEVEL SECURITY;

-- Table: events
CREATE TABLE public.events (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title_vi CHARACTER VARYING NOT NULL,
    title_km CHARACTER VARYING,
    title_en CHARACTER VARYING,
    description_vi TEXT,
    description_km TEXT,
    description_en TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TIME WITHOUT TIME ZONE,
    end_time TIME WITHOUT TIME ZONE,
    location CHARACTER VARYING,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern JSONB,
    thumbnail_url TEXT,
    registration_required BOOLEAN DEFAULT false,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    status CHARACTER VARYING DEFAULT 'upcoming'::character varying,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    excerpt_vi TEXT,
    excerpt_km TEXT,
    excerpt_en TEXT,
    tenant_id UUID DEFAULT '55555555-5555-5555-5555-555555555555'::uuid,
    published_to UUID[] DEFAULT '{}'::uuid[],
    slug CHARACTER VARYING,
    is_major_festival BOOLEAN DEFAULT false,
    approval_status CHARACTER VARYING DEFAULT 'approved'::character varying
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events FORCE ROW LEVEL SECURITY;

-- Table: faqs
CREATE TABLE public.faqs (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    question_vi TEXT NOT NULL,
    question_km TEXT,
    question_en TEXT,
    answer_vi TEXT NOT NULL,
    answer_km TEXT,
    answer_en TEXT,
    category CHARACTER VARYING NOT NULL DEFAULT 'general'::character varying,
    display_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    approval_status TEXT NOT NULL DEFAULT 'published'::text,
    tenant_id UUID DEFAULT '55555555-5555-5555-5555-555555555555'::uuid
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs FORCE ROW LEVEL SECURITY;

-- Table: hero_slides
CREATE TABLE public.hero_slides (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    order_position INTEGER NOT NULL DEFAULT 0,
    image_url TEXT NOT NULL,
    title_vi TEXT NOT NULL,
    title_km TEXT,
    title_en TEXT,
    subtitle_vi TEXT NOT NULL,
    subtitle_km TEXT,
    subtitle_en TEXT,
    cta1_text_key TEXT,
    cta1_link TEXT,
    cta2_text_key TEXT,
    cta2_link TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    tenant_id UUID DEFAULT '55555555-5555-5555-5555-555555555555'::uuid,
    cta1_enabled BOOLEAN DEFAULT true,
    cta2_enabled BOOLEAN DEFAULT true
);

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides FORCE ROW LEVEL SECURITY;

-- Table: homepage_stats
CREATE TABLE public.homepage_stats (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    order_position INTEGER NOT NULL DEFAULT 0,
    icon_emoji TEXT NOT NULL,
    stat_value INTEGER NOT NULL,
    suffix TEXT DEFAULT ''::text,
    label_vi TEXT NOT NULL,
    label_km TEXT,
    label_en TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    tenant_id UUID DEFAULT '55555555-5555-5555-5555-555555555555'::uuid
);

ALTER TABLE public.homepage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_stats FORCE ROW LEVEL SECURITY;

-- Table: media
CREATE TABLE public.media (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title_vi CHARACTER VARYING NOT NULL,
    title_km CHARACTER VARYING,
    title_en CHARACTER VARYING,
    description_vi TEXT,
    description_km TEXT,
    description_en TEXT,
    type CHARACTER VARYING NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_size BIGINT,
    mime_type CHARACTER VARYING,
    category_id UUID,
    event_id UUID,
    year INTEGER,
    tags TEXT[] DEFAULT '{}'::text[],
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    tenant_id UUID DEFAULT '55555555-5555-5555-5555-555555555555'::uuid,
    published_to UUID[] DEFAULT '{}'::uuid[]
);

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media FORCE ROW LEVEL SECURITY;

-- Table: news
CREATE TABLE public.news (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title_vi CHARACTER VARYING NOT NULL,
    title_km CHARACTER VARYING,
    title_en CHARACTER VARYING,
    slug CHARACTER VARYING NOT NULL,
    content_vi TEXT,
    content_km TEXT,
    content_en TEXT,
    excerpt_vi TEXT,
    excerpt_km TEXT,
    excerpt_en TEXT,
    thumbnail_url TEXT,
    category_id UUID,
    status CHARACTER VARYING DEFAULT 'draft'::character varying,
    published_at TIMESTAMP WITH TIME ZONE,
    author_id UUID,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    author_name TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_note TEXT,
    reviewer_name TEXT,
    tenant_id UUID DEFAULT '55555555-5555-5555-5555-555555555555'::uuid,
    published_to UUID[] DEFAULT '{}'::uuid[]
);

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news FORCE ROW LEVEL SECURITY;

-- Table: newsletter_subscribers
CREATE TABLE public.newsletter_subscribers (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    locale TEXT DEFAULT 'vi'::text,
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    tenant_id UUID DEFAULT '55555555-5555-5555-5555-555555555555'::uuid
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers FORCE ROW LEVEL SECURITY;

-- Table: organizations
CREATE TABLE public.organizations (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_url TEXT,
    org_type TEXT DEFAULT 'partner'::text,
    description TEXT,
    website_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    tenant_id UUID
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations FORCE ROW LEVEL SECURITY;

-- Table: page_views
CREATE TABLE public.page_views (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    path TEXT NOT NULL,
    view_count BIGINT DEFAULT 1,
    day DATE DEFAULT CURRENT_DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views FORCE ROW LEVEL SECURITY;

-- Table: pages
CREATE TABLE public.pages (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title_vi CHARACTER VARYING NOT NULL,
    title_km CHARACTER VARYING,
    title_en CHARACTER VARYING,
    slug CHARACTER VARYING NOT NULL,
    content_vi TEXT,
    content_km TEXT,
    content_en TEXT,
    meta_description_vi TEXT,
    meta_description_km TEXT,
    meta_description_en TEXT,
    status CHARACTER VARYING DEFAULT 'published'::character varying,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    tenant_id UUID DEFAULT '55555555-5555-5555-5555-555555555555'::uuid,
    parent_id UUID,
    order_index INTEGER DEFAULT 0,
    show_in_menu BOOLEAN DEFAULT true
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages FORCE ROW LEVEL SECURITY;

-- Table: provinces
CREATE TABLE public.provinces (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provinces FORCE ROW LEVEL SECURITY;

-- Table: quick_access_links
CREATE TABLE public.quick_access_links (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    order_position INTEGER NOT NULL DEFAULT 0,
    icon_emoji TEXT NOT NULL,
    translation_key TEXT NOT NULL,
    href TEXT NOT NULL,
    color_class TEXT DEFAULT 'text-gold-primary'::text,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    tenant_id UUID DEFAULT '55555555-5555-5555-5555-555555555555'::uuid
);

ALTER TABLE public.quick_access_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_access_links FORCE ROW LEVEL SECURITY;

-- Table: rate_limit_hits
CREATE TABLE public.rate_limit_hits (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    ip_address TEXT NOT NULL,
    action_type TEXT NOT NULL,
    hit_count INTEGER DEFAULT 1,
    last_hit TIMESTAMP WITH TIME ZONE DEFAULT now(),
    tenant_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    identifier TEXT,
    action TEXT
);

ALTER TABLE public.rate_limit_hits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_hits FORCE ROW LEVEL SECURITY;

-- Table: role_permissions
CREATE TABLE public.role_permissions (
    role CHARACTER VARYING NOT NULL,
    resource CHARACTER VARYING NOT NULL,
    can_create BOOLEAN DEFAULT false,
    can_read BOOLEAN DEFAULT true,
    can_update BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions FORCE ROW LEVEL SECURITY;

-- Table: settings
CREATE TABLE public.settings (
    key CHARACTER VARYING NOT NULL,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings FORCE ROW LEVEL SECURITY;

-- Table: site_settings
CREATE TABLE public.site_settings (
    key TEXT NOT NULL,
    value TEXT,
    description TEXT,
    updated_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    tenant_id UUID NOT NULL DEFAULT '55555555-5555-5555-5555-555555555555'::uuid
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings FORCE ROW LEVEL SECURITY;

-- Table: tenants
CREATE TABLE public.tenants (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    domain CHARACTER VARYING NOT NULL,
    name CHARACTER VARYING NOT NULL,
    subdomain CHARACTER VARYING,
    layout_style CHARACTER VARYING DEFAULT 'traditional'::character varying,
    theme_colors JSONB,
    logo_url TEXT,
    contact_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    layout_blocks JSONB,
    modules_config JSONB DEFAULT '{"donations": true, "news_events": true, "dharma_talks": true, "monk_profiles": true, "registrations": true, "digital_library": true}'::jsonb,
    has_web_frontend BOOLEAN DEFAULT true,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address_vi TEXT,
    geog GEOGRAPHY,
    parent_id UUID,
    centralized_finance BOOLEAN DEFAULT false,
    nav_visibility JSONB DEFAULT '{}'::jsonb,
    province_id UUID,
    tenant_type TEXT DEFAULT 'company'::text,
    plan_type TEXT NOT NULL DEFAULT 'free'::text,
    lifecycle_status TEXT NOT NULL DEFAULT 'active'::text
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants FORCE ROW LEVEL SECURITY;

-- Table: testimonials
CREATE TABLE public.testimonials (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    quote_vi TEXT NOT NULL,
    quote_km TEXT,
    quote_en TEXT,
    author_name_vi TEXT NOT NULL,
    author_name_km TEXT,
    author_name_en TEXT,
    author_role_vi TEXT,
    author_role_km TEXT,
    author_role_en TEXT,
    author_location TEXT,
    is_featured BOOLEAN DEFAULT false,
    order_position INTEGER DEFAULT 0,
    rating INTEGER,
    is_active BOOLEAN DEFAULT true,
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    tenant_id UUID DEFAULT '55555555-5555-5555-5555-555555555555'::uuid
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials FORCE ROW LEVEL SECURITY;

-- Table: user_profiles
CREATE TABLE public.user_profiles (
    id UUID NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    preferred_temple_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles FORCE ROW LEVEL SECURITY;

-- Table: user_roles
CREATE TABLE public.user_roles (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    role CHARACTER VARYING NOT NULL,
    tenant_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    custom_permissions JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;

-- =============================================================================
-- 2. CONSTRAINTS (PRIMARY KEYS, UNIQUES, CHECKS)
-- =============================================================================

-- Primary Keys
ALTER TABLE public.about_sections ADD CONSTRAINT about_sections_pkey PRIMARY KEY (id);
ALTER TABLE public.active_visitors ADD CONSTRAINT active_visitors_pkey PRIMARY KEY (id);
ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);
ALTER TABLE public.bank_accounts ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);
ALTER TABLE public.benchmark_jwt ADD CONSTRAINT benchmark_jwt_pkey PRIMARY KEY (id);
ALTER TABLE public.benchmark_legacy ADD CONSTRAINT benchmark_legacy_pkey PRIMARY KEY (id);
ALTER TABLE public.categories ADD CONSTRAINT categories_pkey PRIMARY KEY (id);
ALTER TABLE public.charity_posts ADD CONSTRAINT charity_posts_pkey PRIMARY KEY (id);
ALTER TABLE public.contact_messages ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);
ALTER TABLE public.content_revisions ADD CONSTRAINT content_revisions_pkey PRIMARY KEY (id);
ALTER TABLE public.cron_job_logs ADD CONSTRAINT cron_job_logs_pkey PRIMARY KEY (id);
ALTER TABLE public.dharma_embeddings ADD CONSTRAINT dharma_embeddings_pkey PRIMARY KEY (id);
ALTER TABLE public.dharma_talks ADD CONSTRAINT dharma_talks_pkey PRIMARY KEY (id);
ALTER TABLE public.donation_campaigns ADD CONSTRAINT donation_campaigns_pkey PRIMARY KEY (id);
ALTER TABLE public.donations ADD CONSTRAINT donations_pkey PRIMARY KEY (id);
ALTER TABLE public.event_registrations ADD CONSTRAINT event_registrations_pkey PRIMARY KEY (id);
ALTER TABLE public.events ADD CONSTRAINT events_pkey PRIMARY KEY (id);
ALTER TABLE public.faqs ADD CONSTRAINT faqs_pkey PRIMARY KEY (id);
ALTER TABLE public.hero_slides ADD CONSTRAINT hero_slides_pkey PRIMARY KEY (id);
ALTER TABLE public.homepage_stats ADD CONSTRAINT homepage_stats_pkey PRIMARY KEY (id);
ALTER TABLE public.media ADD CONSTRAINT media_pkey PRIMARY KEY (id);
ALTER TABLE public.news ADD CONSTRAINT news_pkey PRIMARY KEY (id);
ALTER TABLE public.newsletter_subscribers ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id);
ALTER TABLE public.organizations ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);
ALTER TABLE public.page_views ADD CONSTRAINT page_views_pkey PRIMARY KEY (id);
ALTER TABLE public.pages ADD CONSTRAINT pages_pkey PRIMARY KEY (id);
ALTER TABLE public.provinces ADD CONSTRAINT provinces_pkey PRIMARY KEY (id);
ALTER TABLE public.quick_access_links ADD CONSTRAINT quick_access_links_pkey PRIMARY KEY (id);
ALTER TABLE public.rate_limit_hits ADD CONSTRAINT rate_limit_hits_pkey PRIMARY KEY (id);
ALTER TABLE public.role_permissions ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role, resource);
ALTER TABLE public.settings ADD CONSTRAINT settings_pkey PRIMARY KEY (key);
ALTER TABLE public.site_settings ADD CONSTRAINT site_settings_pkey PRIMARY KEY (key, tenant_id);
ALTER TABLE public.tenants ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);
ALTER TABLE public.testimonials ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);

-- Unique Constraints
ALTER TABLE public.about_sections ADD CONSTRAINT about_sections_tenant_id_key_key UNIQUE (key, tenant_id);
ALTER TABLE public.about_sections ADD CONSTRAINT about_sections_tenant_key_unique UNIQUE (tenant_id, key);
ALTER TABLE public.active_visitors ADD CONSTRAINT active_visitors_session_hash_key UNIQUE (session_hash);
ALTER TABLE public.categories ADD CONSTRAINT categories_tenant_slug_unique UNIQUE (slug, tenant_id);
ALTER TABLE public.dharma_talks ADD CONSTRAINT dharma_talks_tenant_slug_unique UNIQUE (tenant_id, slug);
ALTER TABLE public.events ADD CONSTRAINT events_tenant_slug_unique UNIQUE (slug, tenant_id);
ALTER TABLE public.news ADD CONSTRAINT news_tenant_slug_unique UNIQUE (slug, tenant_id);
ALTER TABLE public.newsletter_subscribers ADD CONSTRAINT newsletter_subscribers_tenant_email_key UNIQUE (email, tenant_id);
ALTER TABLE public.pages ADD CONSTRAINT pages_tenant_slug_unique UNIQUE (tenant_id, slug);
ALTER TABLE public.provinces ADD CONSTRAINT provinces_code_key UNIQUE (code);
ALTER TABLE public.provinces ADD CONSTRAINT provinces_name_key UNIQUE (name);
ALTER TABLE public.tenants ADD CONSTRAINT tenants_domain_key UNIQUE (domain);
ALTER TABLE public.tenants ADD CONSTRAINT tenants_subdomain_key UNIQUE (subdomain);
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_tenant_id_key UNIQUE (user_id, tenant_id);

-- Check Constraints
ALTER TABLE public.contact_messages ADD CONSTRAINT contact_messages_status_check CHECK ((status)::text = ANY ((ARRAY['unread'::character varying, 'read'::character varying, 'replied'::character varying])::text[]));
ALTER TABLE public.cron_job_logs ADD CONSTRAINT cron_job_logs_status_check CHECK (status = ANY (ARRAY['success'::text, 'failed'::text, 'running'::text]));
ALTER TABLE public.dharma_talks ADD CONSTRAINT dharma_talks_media_type_check CHECK (media_type = ANY (ARRAY['audio'::text, 'video'::text]));
ALTER TABLE public.donation_campaigns ADD CONSTRAINT donation_campaigns_status_check CHECK (status = ANY (ARRAY['ongoing'::text, 'completed'::text, 'cancelled'::text]));
ALTER TABLE public.donations ADD CONSTRAINT donations_amount_check CHECK (amount > (0)::numeric);
ALTER TABLE public.donations ADD CONSTRAINT donations_status_check CHECK ((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying, 'refunded'::character varying, 'confirmed'::character varying])::text[]));
ALTER TABLE public.event_registrations ADD CONSTRAINT event_registrations_status_check CHECK ((status)::text = ANY ((ARRAY['pending'::character varying, 'confirmed'::character varying, 'cancelled'::character varying])::text[]));
ALTER TABLE public.events ADD CONSTRAINT events_approval_status_check CHECK ((approval_status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[]));
ALTER TABLE public.events ADD CONSTRAINT events_status_check CHECK ((status)::text = ANY ((ARRAY['upcoming'::character varying, 'ongoing'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[]));
ALTER TABLE public.faqs ADD CONSTRAINT faqs_approval_status_check CHECK (approval_status = ANY (ARRAY['draft'::text, 'pending_review'::text, 'published'::text, 'rejected'::text]));
ALTER TABLE public.media ADD CONSTRAINT media_type_check CHECK ((type)::text = ANY ((ARRAY['image'::character varying, 'video'::character varying, 'audio'::character varying, 'document'::character varying, 'book'::character varying, 'sutra'::character varying, 'external_link'::character varying])::text[]));
ALTER TABLE public.news ADD CONSTRAINT news_status_check CHECK ((status)::text = ANY ((ARRAY['draft'::character varying, 'pending_review'::character varying, 'scheduled'::character varying, 'published'::character varying, 'rejected'::character varying, 'archived'::character varying])::text[]));
ALTER TABLE public.pages ADD CONSTRAINT pages_status_check CHECK ((status)::text = ANY ((ARRAY['draft'::character varying, 'published'::character varying, 'archived'::character varying])::text[]));
ALTER TABLE public.tenants ADD CONSTRAINT tenants_lifecycle_status_check CHECK (lifecycle_status = ANY (ARRAY['active'::text, 'suspended'::text, 'offboarding'::text, 'terminated'::text]));
ALTER TABLE public.tenants ADD CONSTRAINT tenants_plan_type_check CHECK (plan_type = ANY (ARRAY['free'::text, 'pro'::text, 'enterprise'::text]));
ALTER TABLE public.tenants ADD CONSTRAINT tenants_tenant_type_check CHECK (tenant_type = ANY (ARRAY['tenant'::text, 'company'::text, 'ngo'::text]));
ALTER TABLE public.testimonials ADD CONSTRAINT testimonials_rating_check CHECK ((rating >= 1) AND (rating <= 5));
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check CHECK ((role)::text = ANY ((ARRAY['viewer'::character varying, 'volunteer'::character varying, 'editor'::character varying, 'moderator'::character varying, 'admin'::character varying, 'super_admin'::character varying, 'company_editor'::character varying, 'tenant_admin'::character varying, 'tenant_editor'::character varying, 'tenant_accountant'::character varying])::text[]));

-- =============================================================================
-- 3. FUNCTIONS & SECURITY HELPERS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.audit_before_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
    client_ip TEXT;
    extracted_tenant_id UUID;
BEGIN
    -- Lấy IP an toàn
    BEGIN
        client_ip := split_part(current_setting('request.headers', true)::json->>'x-forwarded-for', ',', 1);
    EXCEPTION WHEN OTHERS THEN
        client_ip := NULL;
    END;

    -- Lấy tenant_id từ OLD một cách an toàn thông qua JSONB (nếu bảng không có tenant_id sẽ tự động ra NULL)
    BEGIN
        extracted_tenant_id := (to_jsonb(OLD)->>'tenant_id')::UUID;
    EXCEPTION WHEN OTHERS THEN
        extracted_tenant_id := NULL;
    END;

    INSERT INTO public.audit_logs (
        user_id,
        user_email,
        action,
        resource,
        table_name,
        record_id,
        old_data,
        tenant_id,
        ip_address
    ) VALUES (
        auth.uid(),
        (SELECT email FROM auth.users WHERE id = auth.uid()),
        'delete',
        TG_TABLE_NAME,
        TG_TABLE_NAME,
        (to_jsonb(OLD)->>'id')::TEXT, -- An toàn cho cả record_id dạng TEXT
        to_jsonb(OLD),
        extracted_tenant_id,
        NULLIF(client_ip, '')::INET
    );
    RETURN OLD;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.auto_set_tenant_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
    current_tenant UUID;
    root_tenant UUID := '55555555-5555-5555-5555-555555555555';
BEGIN
    -- 1. Ưu tiên hàng đầu: Nếu App (Server Action) đã truyền tenant_id chính xác
    IF NEW.tenant_id IS NOT NULL THEN
        RETURN NEW;
    END IF;

    -- 2. Nếu không truyền, lấy từ context người dùng đăng nhập
    current_tenant := public.get_current_tenant_id();

    IF current_tenant IS NOT NULL THEN
        NEW.tenant_id := current_tenant;
        RETURN NEW;
    END IF;

    -- 3. Nếu là Admin Global (super_admin) mà không truyền ID, mặc định vào Root
    IF public.is_global_admin() THEN
        NEW.tenant_id := root_tenant;
        RETURN NEW;
    END IF;

    -- 4. TRƯỜNG HỢP GUEST (Nặc danh): 
    -- Nếu tới đây mà tenant_id vẫn NULL -> THROW ERROR để bắt buộc Backend phải truyền ID chi nhánh.
    -- Ngăn chặn việc dữ liệu nặc danh bị gom hết vào Chùa chính phủ một cách sai lệch.
    RAISE EXCEPTION 'Missing tenant_id for anonymous interaction. Please specify tenant_id in your application request.';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.benchmark_rls_claims(limit_count integer DEFAULT 1000)
 RETURNS TABLE(id uuid, name text, tenant_id uuid, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    jwt_tenant_id text;
    jwt_role text;
BEGIN
    -- Step 1: Đọc trực tiếp từ JWT Custom Claims - KHÔNG CẦN QUERY DATABASE
    -- Đây là O(1): luôn constant time bất kể có bao nhiêu tenant hay users
    jwt_tenant_id := auth.jwt() ->> 'tenant_id';
    jwt_role      := auth.jwt() ->> 'role';

    -- Step 2: Filter dựa trên Claims đã có sẵn trong session
    RETURN QUERY
    SELECT bj.id, bj.name, bj.tenant_id, bj.created_at
    FROM public.benchmark_jwt bj
    WHERE (
        jwt_role IN ('super_admin', 'company_editor', 'admin')
        OR bj.tenant_id::text = jwt_tenant_id
    )
    LIMIT limit_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.benchmark_rls_join(limit_count integer DEFAULT 1000)
 RETURNS TABLE(id uuid, name text, tenant_id uuid, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
        DECLARE
            current_user_tenant_id uuid;
            current_user_role text;
        BEGIN
            -- Step 1: Tra cứu tenant_id của user hiện tại từ bảng user_roles
            SELECT ur.tenant_id, ur.role
            INTO current_user_tenant_id, current_user_role
            FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            LIMIT 1;

            -- Step 2: Thực hiện JOIN tường minh với bảng tenants để xác minh tenant đang hoạt động
            -- Đổi t.status sang t.lifecycle_status để khớp 100% với schema thực tế của DB
            RETURN QUERY
            SELECT bl.id, bl.name, bl.tenant_id, bl.created_at
            FROM public.benchmark_legacy bl
            INNER JOIN public.tenants t ON bl.tenant_id = t.id
            WHERE (
                current_user_role IN ('super_admin', 'company_editor', 'admin')
                OR (
                    t.lifecycle_status = 'active'
                    AND bl.tenant_id = current_user_tenant_id
                )
            )
            LIMIT limit_count;
        END;
        $function$
;

CREATE OR REPLACE FUNCTION public.can_manage_donations()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' IN ('super_admin', 'admin', 'moderator')
  );
$function$
;

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_ip text, p_action text, p_max_hits integer, p_window_seconds integer, p_tenant_id text DEFAULT NULL::text, p_user_id text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
    v_count     INT;
    v_key       TEXT;
    v_window    INTERVAL;
    v_tenant_uuid UUID;
BEGIN
    v_window := (p_window_seconds || ' seconds')::INTERVAL;
    v_key := COALESCE(p_user_id, p_ip);
    
    -- Parse tenant_id sang UUID nếu hợp lệ
    IF p_tenant_id IS NOT NULL AND p_tenant_id <> '' THEN
        BEGIN
            v_tenant_uuid := p_tenant_id::UUID;
        EXCEPTION WHEN OTHERS THEN
            v_tenant_uuid := NULL;
        END;
    END IF;

    DELETE FROM public.rate_limit_hits
    WHERE action = p_action
      AND identifier = v_key
      AND created_at < NOW() - v_window;

    SELECT COUNT(*) INTO v_count
    FROM public.rate_limit_hits
    WHERE action     = p_action
      AND identifier = v_key
      AND created_at > NOW() - v_window;

    IF v_count >= p_max_hits THEN
        RETURN FALSE;
    END IF;

    INSERT INTO public.rate_limit_hits (
        identifier, action, tenant_id, created_at, ip_address, action_type
    ) VALUES (
        v_key, p_action, v_tenant_uuid, NOW(), COALESCE(p_ip, '0.0.0.0'), p_action
    );

    RETURN TRUE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
 RETURNS void
 LANGUAGE sql
 SET search_path TO 'public', 'extensions'
AS $function$
    DELETE FROM public.rate_limit_hits WHERE last_hit < NOW() - INTERVAL '24 hours';
$function$
;

CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
  SELECT tenant_id
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
$function$
;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS character varying
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$function$
;

CREATE OR REPLACE FUNCTION public.get_discovery_temples(user_lat double precision, user_long double precision, search_query text DEFAULT NULL::text, filter_province_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, name text, domain text, latitude double precision, longitude double precision, address_vi text, logo_url text, cover_url text, distance_meters double precision)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
    user_geog geography;
BEGIN
    user_geog := ST_SetSRID(ST_MakePoint(user_long, user_lat), 4326)::geography;

    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.domain,
        t.latitude,
        t.longitude,
        t.address_vi,
        t.logo_url,
        NULL::TEXT as cover_url, -- Placeholder nếu chưa có cột cover_url
        ST_Distance(t.geog, user_geog) as distance_meters
    FROM 
        public.tenants t
    WHERE 
        (search_query IS NULL OR t.name ILIKE '%' || search_query || '%' OR t.domain ILIKE '%' || search_query || '%')
        AND (filter_province_id IS NULL OR t.province_id = filter_province_id)
        AND t.latitude IS NOT NULL 
        AND t.longitude IS NOT NULL
    ORDER BY 
        distance_meters ASC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_rls_coverage()
 RETURNS TABLE(protected bigint, total bigint, percentage numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_total bigint;
    v_protected bigint;
BEGIN
    -- Đếm tổng số bảng trong schema public (bỏ qua các bảng hệ thống của Supabase nếu cần)
    SELECT count(*) INTO v_total
    FROM pg_tables
    WHERE schemaname = 'public';

    -- Đếm số bảng đã enable RLS trong schema public
    SELECT count(*) INTO v_protected
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relrowsecurity = true;

    -- Tính %
    IF v_total = 0 THEN
        RETURN QUERY SELECT 0::bigint, 0::bigint, 0.0::numeric;
    ELSE
        RETURN QUERY SELECT 
            v_protected, 
            v_total, 
            ROUND((v_protected::numeric / v_total::numeric) * 100, 2);
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, preferred_temple_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'preferred_temple_id' IS NOT NULL 
      THEN (NEW.raw_user_meta_data ->> 'preferred_temple_id')::UUID
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.has_admin_role()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'company_editor', 'tenant_admin', 'tenant_editor', 'tenant_accountant')
  );
$function$
;

CREATE OR REPLACE FUNCTION public.has_admin_role_v1()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' IN ('super_admin', 'admin', 'editor', 'moderator')
  );
$function$
;

CREATE OR REPLACE FUNCTION public.has_full_admin_role()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' IN ('super_admin', 'admin')
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_authorized_admin(target_tenant_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
  SELECT (
    public.get_current_user_role() IN ('super_admin', 'company_editor')
    OR
    (public.get_current_user_role() IN ('tenant_admin', 'tenant_editor') AND public.get_current_tenant_id() = target_tenant_id)
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_authorized_finance_admin(target_tenant_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
  SELECT (
    public.get_current_user_role() IN ('super_admin', 'company_editor')
    OR
    (public.get_current_user_role() IN ('tenant_admin', 'tenant_accountant') AND public.get_current_tenant_id() = target_tenant_id)
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_global_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'company_editor')
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_within_business_hours()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
    -- Giờ hiện tại theo múi giờ Asia/Ho_Chi_Minh (ICT, UTC+7)
    RETURN EXTRACT(HOUR FROM NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')
        BETWEEN 7 AND 21; -- 07:00 đến 21:59
END;
$function$
;

CREATE OR REPLACE FUNCTION public.notify_telegram_on_attack()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  telegram_bot_token TEXT := '8715974217:AAEKQFkHrpSDD5yTJqBFod5ca2fXEWtDBuk'; 
  telegram_chat_id TEXT;
  dynamic_chat_id TEXT;
  payload JSONB;
  message_text TEXT;
  tenant_name TEXT := 'Unknown';
BEGIN
  -- Lấy động telegram_chat_id và tên của tenant từ bảng tenants
  IF NEW.tenant_id IS NOT NULL THEN
    SELECT name, modules_config->'security_settings'->>'telegram_chat_id'
    INTO tenant_name, dynamic_chat_id
    FROM public.tenants
    WHERE id = NEW.tenant_id;
  END IF;

  -- Nếu tìm thấy Telegram Chat ID động từ cấu hình chi nhánh, sử dụng nó. Ngược lại fallback về Chat ID Super Admin mặc định
  IF dynamic_chat_id IS NOT NULL AND dynamic_chat_id <> '' AND dynamic_chat_id <> 'YOUR_CHAT_ID' THEN
    telegram_chat_id := dynamic_chat_id;
  ELSE
    telegram_chat_id := '8617200830';
  END IF;

  -- Chỉ kích hoạt gửi Webhook khi hành động là tấn công (cross_tenant_violation, sql_injection_attempt, cache_pollution_attempt),
  -- hoặc khi tenant bị tự động khoá (tenant_auto_suspended), hoặc mức độ nghiêm trọng là CRITICAL
  IF NEW.action IN ('cross_tenant_violation', 'tenant_auto_suspended', 'sql_injection_attempt', 'cache_pollution_attempt') 
     OR NEW.severity = 'CRITICAL' THEN
    
    -- Soạn nội dung tin nhắn định dạng Markdown phong cách SOC Cyber Security Professional
    message_text := format(
        '🚨 *[PTIT SAAS SOC ALERTS]*' || CHR(10) ||
        '━━━━━━━━━━━━━━━━━━━━' || CHR(10) ||
        '🏢 *Tổ chức:* %s' || CHR(10) ||
        '🆔 *Tenant ID:* `%s`' || CHR(10) ||
        '🥷 *Đối tượng:* `%s`' || CHR(10) ||
        '🌐 *Địa chỉ IP:* `%s`' || CHR(10) ||
        '🔥 *Mức độ:* %s *%s*' || CHR(10) ||
        '🛡️ *Hành động:* `%s`' || CHR(10) ||
        '📝 *Thông tin:* _%s_',
        COALESCE(tenant_name, 'Hệ thống Trung tâm'),
        COALESCE(NEW.tenant_id::text, 'CENTRAL'),
        COALESCE(NEW.user_email, 'guest@anonymous'),
        COALESCE(NEW.ip_address::text, '127.0.0.1'),
        CASE 
          WHEN COALESCE(NEW.severity, 'HIGH') = 'CRITICAL' THEN '🟥'
          WHEN COALESCE(NEW.severity, 'HIGH') = 'HIGH' THEN '🟧'
          ELSE '🟨'
        END,
        COALESCE(NEW.severity, 'HIGH'),
        COALESCE(NEW.action, 'Access Violation'),
        COALESCE(NEW.details->>'reason', COALESCE(NEW.details->>'message', 'Phát hiện hành vi xâm nhập trái phép'))
    );

    -- Đóng gói payload JSON
    payload := jsonb_build_object(
        'chat_id', telegram_chat_id,
        'text', message_text,
        'parse_mode', 'Markdown'
    );

    -- Bắn Webhook bất đồng bộ qua extension net
    PERFORM net.http_post(
        url := 'https://api.telegram.org/bot' || telegram_bot_token || '/sendMessage',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := payload
    );
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.prevent_audit_log_tampering()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Ghi lại sự kiện cố gắng can thiệp log (meta-audit)
    -- Lưu ý: Không gọi INSERT vào audit_logs ở đây để tránh đệ quy vô hạn
    -- Thay vào đó, raise exception ngay lập tức với thông báo rõ ràng
    RAISE EXCEPTION
        'SECURITY VIOLATION [CLD.12.4.1]: Bản ghi Audit Log là BẤT BIẾN - Thao tác % trên bảng audit_logs bị từ chối hoàn toàn. Mọi hành vi can thiệp nhật ký kiểm toán là vi phạm nghiêm trọng chính sách bảo mật hệ thống.',
        TG_OP
    USING ERRCODE = 'insufficient_privilege';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.soc_active_alert_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  recent_attack_count INT;
  is_already_suspended BOOLEAN := false;
BEGIN
  -- Bỏ qua nếu là log của hệ thống SOAR tự tạo để tránh vòng lặp đệ quy vô hạn
  IF NEW.user_email = 'soar@system.security' THEN
    RETURN NEW;
  END IF;

  -- Kiểm tra trạng thái hiện tại của Tenant trước
  IF NEW.tenant_id IS NOT NULL THEN
    SELECT (lifecycle_status = 'suspended')
    INTO is_already_suspended
    FROM public.tenants
    WHERE id = NEW.tenant_id;

    -- Nếu tenant đã bị khóa từ trước, không cần xử lý tiếp
    IF is_already_suspended THEN
      RETURN NEW;
    END IF;

    -- Chỉ kiểm tra khi log mới là một vi phạm an ninh nghiêm trọng
    IF NEW.action IN ('cross_tenant_violation', 'sql_injection_attempt', 'cache_pollution_attempt') OR NEW.severity = 'HIGH' THEN
      
      -- Đếm số lượng hành vi vi phạm tương tự của cùng một Tenant trong vòng 1 phút qua
      SELECT COUNT(*)
      INTO recent_attack_count
      FROM public.audit_logs
      WHERE tenant_id = NEW.tenant_id
        AND created_at >= NOW() - INTERVAL '1 minute'
        AND (action IN ('cross_tenant_violation', 'sql_injection_attempt', 'cache_pollution_attempt') OR severity = 'HIGH');

      -- Ngưỡng kích hoạt SOAR tự động khóa (từ 3 cuộc tấn công trở lên trong 1 phút)
      IF recent_attack_count >= 3 THEN
        -- A. Khóa Tenant ngay lập tức bằng cách đổi trạng thái sang 'suspended'
        UPDATE public.tenants
        SET lifecycle_status = 'suspended'
        WHERE id = NEW.tenant_id;

        -- B. Ghi nhận log sự kiện khóa tự động mức độ CRITICAL
        INSERT INTO public.audit_logs (
          tenant_id,
          user_email,
          action,
          table_name,
          record_id,
          severity,
          details,
          ip_address,
          user_agent
        ) VALUES (
          NEW.tenant_id,
          'soar@system.security',
          'tenant_auto_suspended',
          'tenants',
          NEW.tenant_id::text,
          'CRITICAL',
          jsonb_build_object(
            'reason', 'Hệ thống SOAR kích hoạt cơ chế phong tỏa tự động khẩn cấp do phát hiện ' || recent_attack_count || ' hành vi tấn công mạng dồn dập chỉ trong 1 phút.',
            'trigger_by_ip', NEW.ip_address,
            'attack_scenario', NEW.action
          ),
          NEW.ip_address,
          'SOAR Active Defense Engine'
        );
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.tenant_offboarding_wipe(target_tenant_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    tenant_exists BOOLEAN;
BEGIN
    -- 1. Xác thực quyền Global Admin
    IF public.get_current_user_role() != 'super_admin' THEN
        RAISE EXCEPTION 'Chỉ Global Admin mới có quyền thực thi Tenant Offboarding.';
    END IF;

    -- 2. Kiểm tra tenant có tồn tại không
    SELECT EXISTS (SELECT 1 FROM public.tenants WHERE id = target_tenant_id) INTO tenant_exists;
    IF NOT tenant_exists THEN
        RAISE EXCEPTION 'Tenant ID % không tồn tại.', target_tenant_id;
    END IF;

    -- 3. Bắt đầu quá trình xóa (Cascading Delete)
    -- Vì ta đã cấu hình ON DELETE CASCADE ở các foreign key trỏ đến tenant_id trong thiết kế,
    -- việc xóa dòng root trong bảng tenants sẽ tự động kích hoạt hiệu ứng domino
    -- xóa sạch sành sanh dữ liệu tại các bảng con (news, events, donations, users).
    
    DELETE FROM public.tenants WHERE id = target_tenant_id;
    
    -- Lưu ý: Các bảng Audit Logs thường không có ràng buộc ON DELETE CASCADE để giữ lại lịch sử.
    -- Theo chuẩn ISO 27017, dữ liệu log cần được giữ thêm 90 ngày sau khi Offboard.
    -- Ta có thể cập nhật trạng thái tenant_id trong audit logs thành "DELETED_TENANT" hoặc giữ nguyên.

    RAISE NOTICE 'Đã xóa hoàn toàn dữ liệu của Tenant ID % khỏi hệ thống.', target_tenant_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_tenants_geog()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.geog := extensions.ST_SetSRID(extensions.ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::extensions.geography;
  ELSE
    NEW.geog := NULL;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

-- =============================================================================
-- 4. TRIGGERS
-- =============================================================================

CREATE TRIGGER ensure_tenant_id BEFORE INSERT ON public.about_sections FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

CREATE TRIGGER trg_prevent_audit_log_delete BEFORE DELETE ON public.audit_logs FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_tampering();

CREATE TRIGGER trg_prevent_audit_log_update BEFORE UPDATE ON public.audit_logs FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_tampering();

CREATE TRIGGER trg_soc_active_alert AFTER INSERT ON public.audit_logs FOR EACH ROW EXECUTE FUNCTION soc_active_alert_trigger();

CREATE TRIGGER trigger_notify_telegram_on_attack AFTER INSERT ON public.audit_logs FOR EACH ROW EXECUTE FUNCTION notify_telegram_on_attack();

CREATE TRIGGER trigger_soc_active_alert AFTER INSERT ON public.audit_logs FOR EACH ROW EXECUTE FUNCTION soc_active_alert_trigger();

CREATE TRIGGER trg_audit_before_delete BEFORE DELETE ON public.bank_accounts FOR EACH ROW EXECUTE FUNCTION audit_before_delete();

CREATE TRIGGER ensure_tenant_id BEFORE INSERT ON public.categories FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

CREATE TRIGGER trg_audit_before_delete BEFORE DELETE ON public.categories FOR EACH ROW EXECUTE FUNCTION audit_before_delete();

CREATE TRIGGER trg_audit_before_delete BEFORE DELETE ON public.charity_posts FOR EACH ROW EXECUTE FUNCTION audit_before_delete();

CREATE TRIGGER ensure_tenant_id BEFORE INSERT ON public.contact_messages FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

CREATE TRIGGER trg_audit_before_delete BEFORE DELETE ON public.contact_messages FOR EACH ROW EXECUTE FUNCTION audit_before_delete();

CREATE TRIGGER ensure_tenant_id BEFORE INSERT ON public.dharma_talks FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

CREATE TRIGGER trg_audit_before_delete BEFORE DELETE ON public.dharma_talks FOR EACH ROW EXECUTE FUNCTION audit_before_delete();

CREATE TRIGGER trg_audit_before_delete BEFORE DELETE ON public.donation_campaigns FOR EACH ROW EXECUTE FUNCTION audit_before_delete();

CREATE TRIGGER ensure_tenant_id BEFORE INSERT ON public.donations FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

CREATE TRIGGER trg_audit_before_delete BEFORE DELETE ON public.donations FOR EACH ROW EXECUTE FUNCTION audit_before_delete();

CREATE TRIGGER ensure_tenant_id BEFORE INSERT ON public.event_registrations FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

CREATE TRIGGER update_event_registrations_updated_at BEFORE UPDATE ON public.event_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER ensure_tenant_id BEFORE INSERT ON public.events FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

CREATE TRIGGER trg_audit_before_delete BEFORE DELETE ON public.events FOR EACH ROW EXECUTE FUNCTION audit_before_delete();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER ensure_tenant_id BEFORE INSERT ON public.hero_slides FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

CREATE TRIGGER ensure_tenant_id BEFORE INSERT ON public.media FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

CREATE TRIGGER trg_audit_before_delete BEFORE DELETE ON public.media FOR EACH ROW EXECUTE FUNCTION audit_before_delete();

CREATE TRIGGER ensure_tenant_id BEFORE INSERT ON public.news FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

CREATE TRIGGER trg_audit_before_delete BEFORE DELETE ON public.news FOR EACH ROW EXECUTE FUNCTION audit_before_delete();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_audit_before_delete BEFORE DELETE ON public.organizations FOR EACH ROW EXECUTE FUNCTION audit_before_delete();

CREATE TRIGGER ensure_tenant_id BEFORE INSERT ON public.pages FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

CREATE TRIGGER trg_audit_before_delete BEFORE DELETE ON public.pages FOR EACH ROW EXECUTE FUNCTION audit_before_delete();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_update_tenants_geog BEFORE INSERT OR UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION update_tenants_geog();

CREATE TRIGGER trg_audit_before_delete BEFORE DELETE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION audit_before_delete();

-- =============================================================================
-- 5. ROW-LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

CREATE POLICY "Admin_Manage_About_Sections" ON public.about_sections
    FOR ALL
    TO public
    USING (is_authorized_admin(tenant_id));

CREATE POLICY "Public can read about sections" ON public.about_sections
    FOR SELECT
    TO public
    USING (((is_active = true) OR ((auth.uid() IS NOT NULL) AND (is_global_admin() OR (get_current_tenant_id() = tenant_id)))));

CREATE POLICY "Public_Read_About_Sections" ON public.about_sections
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Tenant admins can manage about sections" ON public.about_sections
    FOR ALL
    TO public
    USING (((auth.uid() IS NOT NULL) AND (is_global_admin() OR (get_current_tenant_id() = tenant_id))))
    WITH CHECK (((auth.uid() IS NOT NULL) AND (is_global_admin() OR (get_current_tenant_id() = tenant_id))));

CREATE POLICY "Anon can insert visitor session" ON public.active_visitors
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Anon can update own visitor session" ON public.active_visitors
    FOR UPDATE
    TO public
    USING (true);

CREATE POLICY "Global admin can read active visitors" ON public.active_visitors
    FOR SELECT
    TO public
    USING (is_global_admin());

CREATE POLICY "Auth_Insert_Audit" ON public.audit_logs
    FOR INSERT
    TO public
    WITH CHECK ((auth.uid() IS NOT NULL));

CREATE POLICY "SuperAdmin_View_Audit" ON public.audit_logs
    FOR SELECT
    TO public
    USING (((get_current_user_role())::text = 'super_admin'::text));

CREATE POLICY "TenantAdmin_View_Own_Audit" ON public.audit_logs
    FOR SELECT
    TO public
    USING (((auth.uid() IS NOT NULL) AND (((get_current_user_role())::text = ANY ((ARRAY['super_admin'::character varying, 'company_editor'::character varying])::text[])) OR (((get_current_user_role())::text = 'tenant_admin'::text) AND (get_current_tenant_id() = tenant_id)))));

CREATE POLICY "Everyone can view active bank accounts" ON public.bank_accounts
    FOR SELECT
    TO public
    USING ((is_active = true));

CREATE POLICY "Global admins can manage bank accounts" ON public.bank_accounts
    FOR ALL
    TO public
    USING ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND ((user_roles.role)::text = ANY ((ARRAY['super_admin'::character varying, 'company_editor'::character varying])::text[]))))));

CREATE POLICY "JWT RLS check" ON public.benchmark_jwt
    FOR SELECT
    TO public
    USING (((auth.uid() IS NOT NULL) AND (((auth.jwt() ->> 'role'::text) = 'super_admin'::text) OR ((tenant_id)::text = (auth.jwt() ->> 'tenant_id'::text)))));

CREATE POLICY "Legacy RLS check" ON public.benchmark_legacy
    FOR SELECT
    TO public
    USING (((auth.uid() IS NOT NULL) AND (((get_current_user_role())::text = 'super_admin'::text) OR (tenant_id = get_current_tenant_id()))));

CREATE POLICY "Admin_Manage_Categories" ON public.categories
    FOR ALL
    TO public
    USING (is_authorized_admin(tenant_id));

CREATE POLICY "Admins manage categories" ON public.categories
    FOR ALL
    TO public
    USING ((is_global_admin() OR (has_admin_role() AND (tenant_id = get_current_tenant_id()))));

CREATE POLICY "Public can read categories" ON public.categories
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Public can read categories including broadcast" ON public.categories
    FOR SELECT
    TO public
    USING ((((is_visible = true) AND ((tenant_id IS NULL) OR (tenant_id = '55555555-5555-5555-5555-555555555555'::uuid) OR (tenant_id = get_current_tenant_id()) OR (get_current_tenant_id() = ANY (published_to)))) OR ((auth.uid() IS NOT NULL) AND (is_global_admin() OR (tenant_id = get_current_tenant_id()) OR (get_current_tenant_id() = ANY (published_to))))));

CREATE POLICY "Public_Read_Categories" ON public.categories
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Tenant admins can manage categories" ON public.categories
    FOR ALL
    TO public
    USING (((auth.uid() IS NOT NULL) AND (is_global_admin() OR (get_current_tenant_id() = tenant_id))))
    WITH CHECK (((auth.uid() IS NOT NULL) AND (is_global_admin() OR (get_current_tenant_id() = tenant_id))));

CREATE POLICY "Global admin can manage charity posts" ON public.charity_posts
    FOR ALL
    TO public
    USING (is_global_admin());

CREATE POLICY "Public can read charity posts" ON public.charity_posts
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Admin_Manage_Contact_Messages" ON public.contact_messages
    FOR ALL
    TO public
    USING (is_authorized_admin(tenant_id));

CREATE POLICY "Admin_Manage_Contact_Messages_Hardened" ON public.contact_messages
    FOR ALL
    TO public
    USING (is_authorized_admin(tenant_id));

CREATE POLICY "Anon_Insert_Contact_Messages" ON public.contact_messages
    FOR INSERT
    TO public
    WITH CHECK (((tenant_id IS NOT NULL) AND (length((email)::text) > 5) AND (length(message) > 0)));

CREATE POLICY "Admin_Manage_Content_Revisions" ON public.content_revisions
    FOR ALL
    TO public
    USING (is_authorized_admin(tenant_id));

CREATE POLICY "global_admin_read_cron_logs" ON public.cron_job_logs
    FOR SELECT
    TO authenticated
    USING ((EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND ((ur.role)::text = ANY ((ARRAY['super_admin'::character varying, 'admin'::character varying, 'company_editor'::character varying, 'agency_admin'::character varying])::text[]))))));

CREATE POLICY "service_role_full_access_cron_logs" ON public.cron_job_logs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Public can read dharma_embeddings" ON public.dharma_embeddings
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Super admins can manage dharma_embeddings" ON public.dharma_embeddings
    FOR ALL
    TO public
    USING (((auth.uid() IS NOT NULL) AND ((get_current_user_role())::text = 'super_admin'::text)));

CREATE POLICY "Admin_Manage_Dharma_Talks" ON public.dharma_talks
    FOR ALL
    TO public
    USING (is_authorized_admin(tenant_id));

CREATE POLICY "Authenticated users read own tenant dharma talks" ON public.dharma_talks
    FOR SELECT
    TO public
    USING (((auth.uid() IS NOT NULL) AND (is_active = true) AND (is_global_admin() OR (tenant_id = get_current_tenant_id()) OR (get_current_tenant_id() = ANY (published_to)))));

CREATE POLICY "Tenant admins can manage dharma talks" ON public.dharma_talks
    FOR ALL
    TO public
    USING (((auth.uid() IS NOT NULL) AND (is_global_admin() OR (get_current_tenant_id() = tenant_id))))
    WITH CHECK (((auth.uid() IS NOT NULL) AND (is_global_admin() OR (get_current_tenant_id() = tenant_id))));

CREATE POLICY "ABAC_time_restrict_editor_insert_campaigns" ON public.donation_campaigns
    FOR INSERT
    TO public
    WITH CHECK (((auth.uid() IS NOT NULL) AND (((get_current_user_role())::text = ANY ((ARRAY['super_admin'::character varying, 'company_editor'::character varying, 'tenant_admin'::character varying])::text[])) OR (((get_current_user_role())::text = ANY ((ARRAY['tenant_editor'::character varying, 'editor'::character varying, 'tenant_accountant'::character varying, 'moderator'::character varying])::text[])) AND is_within_business_hours() AND (tenant_id = get_current_tenant_id())))));

CREATE POLICY "Global admins can manage all campaigns" ON public.donation_campaigns
    FOR ALL
    TO authenticated
    USING (is_global_admin());

CREATE POLICY "Public can view active campaigns" ON public.donation_campaigns
    FOR SELECT
    TO anon,authenticated
    USING ((is_active = true));

CREATE POLICY "Staff can view hidden campaigns of their own tenant" ON public.donation_campaigns
    FOR SELECT
    TO authenticated
    USING (((is_active = false) AND (is_global_admin() OR (tenant_id = get_current_tenant_id()))));

CREATE POLICY "Tenant admins can manage own campaigns" ON public.donation_campaigns
    FOR ALL
    TO authenticated
    USING (((NOT is_global_admin()) AND (tenant_id = get_current_tenant_id())))
    WITH CHECK (((NOT is_global_admin()) AND (tenant_id = get_current_tenant_id())));

CREATE POLICY "Anon_Insert_Donations" ON public.donations
    FOR INSERT
    TO public
    WITH CHECK (((tenant_id IS NOT NULL) AND (amount > (0)::numeric)));

CREATE POLICY "Anyone can view their own donation by ID" ON public.donations
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Finance_Manage_Donations" ON public.donations
    FOR ALL
    TO public
    USING (is_authorized_finance_admin(tenant_id));

CREATE POLICY "Global admins can manage all donations" ON public.donations
    FOR ALL
    TO public
    USING (((get_current_user_role())::text = ANY ((ARRAY['super_admin'::character varying, 'company_editor'::character varying])::text[])));

CREATE POLICY "Public_Insert_Donations_And_Read_Confirmed" ON public.donations
    FOR SELECT
    TO public
    USING (((status)::text = 'confirmed'::text));

CREATE POLICY "Tenant admins can view own donations" ON public.donations
    FOR SELECT
    TO public
    USING ((((get_current_user_role())::text = ANY ((ARRAY['tenant_admin'::character varying, 'tenant_accountant'::character varying])::text[])) AND (tenant_id = get_current_tenant_id())));

CREATE POLICY "Admin_Manage_Event_Registrations" ON public.event_registrations
    FOR ALL
    TO public
    USING (is_authorized_admin(tenant_id));

CREATE POLICY "Admin_Manage_Event_Registrations_Hardened" ON public.event_registrations
    FOR ALL
    TO public
    USING (is_authorized_admin(tenant_id));

CREATE POLICY "Anon_Insert_Event_Registrations" ON public.event_registrations
    FOR INSERT
    TO public
    WITH CHECK (((tenant_id IS NOT NULL) AND (event_id IS NOT NULL)));

CREATE POLICY "ABAC_time_restrict_editor_insert_events" ON public.events
    FOR INSERT
    TO public
    WITH CHECK (((auth.uid() IS NOT NULL) AND (((get_current_user_role())::text = ANY ((ARRAY['super_admin'::character varying, 'company_editor'::character varying, 'tenant_admin'::character varying])::text[])) OR (((get_current_user_role())::text = ANY ((ARRAY['tenant_editor'::character varying, 'editor'::character varying, 'moderator'::character varying])::text[])) AND is_within_business_hours() AND (tenant_id = get_current_tenant_id())))));

CREATE POLICY "Admin_Manage_Events" ON public.events
    FOR ALL
    TO public
    USING (is_authorized_admin(tenant_id));

CREATE POLICY "Authenticated users read own tenant events" ON public.events
    FOR SELECT
    TO public
    USING (((auth.uid() IS NOT NULL) AND ((status)::text = ANY ((ARRAY['upcoming'::character varying, 'ongoing'::character varying, 'completed'::character varying])::text[])) AND (is_global_admin() OR (tenant_id = get_current_tenant_id()) OR (get_current_tenant_id() = ANY (published_to)))));

CREATE POLICY "Public_Read_Events" ON public.events
    FOR SELECT
    TO public
    USING (((status)::text <> 'draft'::text));

CREATE POLICY "Tenant admins can manage events" ON public.events
    FOR ALL
    TO public
    USING (((auth.uid() IS NOT NULL) AND (is_global_admin() OR (get_current_tenant_id() = tenant_id))))
    WITH CHECK (((auth.uid() IS NOT NULL) AND (is_global_admin() OR (get_current_tenant_id() = tenant_id))));

CREATE POLICY "Global admin can manage faqs" ON public.faqs
    FOR ALL
    TO public
    USING (is_global_admin());

CREATE POLICY "Public can read faqs" ON public.faqs
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Admin_Manage_Hero_Slides" ON public.hero_slides
    FOR ALL
    TO public
    USING (is_authorized_admin(tenant_id));

CREATE POLICY "Public can read hero slides" ON public.hero_slides
    FOR SELECT
    TO public
    USING (((is_active = true) OR ((auth.uid() IS NOT NULL) AND (is_global_admin() OR (get_current_tenant_id() = tenant_id)))));

CREATE POLICY "Public_Read_Hero_Slides" ON public.hero_slides
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Tenant admins can manage hero slides" ON public.hero_slides
    FOR ALL
    TO public
    USING (((auth.uid() IS NOT NULL) AND (is_global_admin() OR (get_current_tenant_id() = tenant_id))))
    WITH CHECK (((auth.uid() IS NOT NULL) AND (is_global_admin() OR (get_current_tenant_id() = tenant_id))));

CREATE POLICY "Global admin can manage homepage stats" ON public.homepage_stats
    FOR ALL
    TO public
    USING (is_global_admin());

CREATE POLICY "Public can read homepage stats" ON public.homepage_stats
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Admin_Manage_Media" ON public.media
    FOR ALL
    TO public
    USING (is_authorized_admin(tenant_id));

CREATE POLICY "Admins manage media" ON public.media
    FOR ALL
    TO public
    USING ((is_global_admin() OR (has_admin_role() AND (tenant_id = get_current_tenant_id()))));

CREATE POLICY "Public can read media" ON public.media
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Public can read media including broadcast" ON public.media
    FOR SELECT
    TO public
    USING (((tenant_id IS NULL) OR (tenant_id = '55555555-5555-5555-5555-555555555555'::uuid) OR (tenant_id = get_current_tenant_id()) OR (get_current_tenant_id() = ANY (published_to)) OR ((auth.uid() IS NOT NULL) AND (is_global_admin() OR (tenant_id = get_current_tenant_id()) OR (get_current_tenant_id() = ANY (published_to))))));

CREATE POLICY "Public_Read_Media" ON public.media
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Tenant admins can manage media" ON public.media
    FOR ALL
    TO public
    USING (((auth.uid() IS NOT NULL) AND (is_global_admin() OR (get_current_tenant_id() = tenant_id))))
    WITH CHECK (((auth.uid() IS NOT NULL) AND (is_global_admin() OR (get_current_tenant_id() = tenant_id))));

CREATE POLICY "ABAC_time_restrict_editor_write" ON public.news
    FOR INSERT
    TO public
    WITH CHECK ((((get_current_user_role())::text = ANY ((ARRAY['super_admin'::character varying, 'company_editor'::character varying, 'tenant_admin'::character varying])::text[])) OR (((get_current_user_role())::text = ANY ((ARRAY['tenant_editor'::character varying, 'tenant_accountant'::character varying])::text[])) AND is_within_business_hours() AND (tenant_id = get_current_tenant_id()))));

CREATE POLICY "Admin_Manage_News" ON public.news
    FOR ALL
    TO public
    USING (is_authorized_admin(tenant_id));

CREATE POLICY "Authenticated users read own tenant news" ON public.news
    FOR SELECT
    TO public
    USING (((auth.uid() IS NOT NULL) AND ((status)::text = 'published'::text) AND (is_global_admin() OR (tenant_id = get_current_tenant_id()) OR (get_current_tenant_id() = ANY (published_to)))));

CREATE POLICY "Public_Read_News" ON public.news
    FOR SELECT
    TO public
    USING (((status)::text = 'published'::text));

CREATE POLICY "Tenant Admins / Editors can manage their own news" ON public.news
    FOR ALL
    TO public
    USING (((auth.uid() IS NOT NULL) AND (is_global_admin() OR (get_current_tenant_id() = tenant_id))))
    WITH CHECK (((auth.uid() IS NOT NULL) AND (is_global_admin() OR (get_current_tenant_id() = tenant_id))));

CREATE POLICY "Admin_Full_Newsletter" ON public.newsletter_subscribers
    FOR ALL
    TO public
    USING (has_admin_role());

CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
    FOR INSERT
    TO public
    WITH CHECK (((tenant_id IS NOT NULL) AND (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)));

CREATE POLICY "Tenant admins can manage subscribers" ON public.newsletter_subscribers
    FOR ALL
    TO public
    USING (((auth.uid() IS NOT NULL) AND (is_global_admin() OR (get_current_tenant_id() = tenant_id))));

CREATE POLICY "Tenant admins can view subscribers" ON public.newsletter_subscribers
    FOR SELECT
    TO public
    USING (((auth.uid() IS NOT NULL) AND (is_global_admin() OR (get_current_tenant_id() = tenant_id))));

CREATE POLICY "Enable delete for super_admins only" ON public.organizations
    FOR DELETE
    TO public
    USING (((auth.uid() IS NOT NULL) AND is_global_admin()));

CREATE POLICY "Enable insert for authenticated users with admin role" ON public.organizations
    FOR INSERT
    TO public
    WITH CHECK (((auth.uid() IS NOT NULL) AND (is_global_admin() OR (get_current_tenant_id() = tenant_id))));

CREATE POLICY "Enable read access for all users" ON public.organizations
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Enable update for authenticated users with admin role" ON public.organizations
    FOR UPDATE
    TO public
    USING (((auth.uid() IS NOT NULL) AND (is_global_admin() OR (get_current_tenant_id() = tenant_id))))
    WITH CHECK (((auth.uid() IS NOT NULL) AND (is_global_admin() OR (get_current_tenant_id() = tenant_id))));

CREATE POLICY "Anon can upsert page views" ON public.page_views
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Public can read page views" ON public.page_views
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "System can update page views" ON public.page_views
    FOR UPDATE
    TO public
    USING (is_global_admin());

CREATE POLICY "Admin_Manage_Pages" ON public.pages
    FOR ALL
    TO public
    USING (is_authorized_admin(tenant_id));

CREATE POLICY "Public can read published pages" ON public.pages
    FOR SELECT
    TO public
    USING ((((status)::text = 'published'::text) OR ((auth.uid() IS NOT NULL) AND (is_global_admin() OR (get_current_tenant_id() = tenant_id)))));

CREATE POLICY "Public_Read_Pages" ON public.pages
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Tenant admins can manage pages" ON public.pages
    FOR ALL
    TO public
    USING (((auth.uid() IS NOT NULL) AND (is_global_admin() OR (get_current_tenant_id() = tenant_id))))
    WITH CHECK (((auth.uid() IS NOT NULL) AND (is_global_admin() OR (get_current_tenant_id() = tenant_id))));

CREATE POLICY "Allow public read access to provinces" ON public.provinces
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow super_admin to manage provinces" ON public.provinces
    FOR ALL
    TO public
    USING (((get_current_user_role())::text = 'super_admin'::text));

CREATE POLICY "Global admin can manage quick access links" ON public.quick_access_links
    FOR ALL
    TO public
    USING (is_global_admin());

CREATE POLICY "Public can read quick access links" ON public.quick_access_links
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "System only access" ON public.rate_limit_hits
    FOR ALL
    TO service_role
    USING (true);

CREATE POLICY "Public can read role permissions" ON public.role_permissions
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Super admin can manage role permissions" ON public.role_permissions
    FOR ALL
    TO public
    USING (is_global_admin());

CREATE POLICY "Super admin can manage settings" ON public.settings
    FOR ALL
    TO public
    USING (is_global_admin());

CREATE POLICY "Admin_Manage_Site_Settings" ON public.site_settings
    FOR ALL
    TO public
    USING (is_authorized_admin(tenant_id));

CREATE POLICY "Public can read site settings" ON public.site_settings
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Public_Read_Site_Settings" ON public.site_settings
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Tenant admins can manage site settings" ON public.site_settings
    FOR ALL
    TO public
    USING (((auth.uid() IS NOT NULL) AND (is_global_admin() OR (get_current_tenant_id() = tenant_id))))
    WITH CHECK (((auth.uid() IS NOT NULL) AND (is_global_admin() OR (get_current_tenant_id() = tenant_id))));

CREATE POLICY "Public can read tenants" ON public.tenants
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Super admins can manage tenants" ON public.tenants
    FOR ALL
    TO public
    USING (((auth.uid() IS NOT NULL) AND ((get_current_user_role())::text = 'super_admin'::text)))
    WITH CHECK (((auth.uid() IS NOT NULL) AND ((get_current_user_role())::text = 'super_admin'::text)));

CREATE POLICY "Global admin can manage testimonials" ON public.testimonials
    FOR ALL
    TO public
    USING (is_global_admin());

CREATE POLICY "Public can read active testimonials" ON public.testimonials
    FOR SELECT
    TO public
    USING ((is_active = true));

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT
    TO public
    WITH CHECK ((auth.uid() = id));

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE
    TO public
    USING ((auth.uid() = id))
    WITH CHECK ((auth.uid() = id));

CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT
    TO public
    USING ((auth.uid() = id));

CREATE POLICY "Super_Admin_Manage_Roles" ON public.user_roles
    FOR ALL
    TO public
    USING (((get_current_user_role())::text = 'super_admin'::text));

CREATE POLICY "Users_Read_Own_Role" ON public.user_roles
    FOR SELECT
    TO public
    USING ((user_id = auth.uid()));

-- =============================================================================
-- 6. INDEXES
-- =============================================================================

CREATE UNIQUE INDEX about_sections_tenant_key_unique ON public.about_sections USING btree (tenant_id, key);

CREATE INDEX idx_about_sections_tenant ON public.about_sections USING btree (tenant_id);

CREATE UNIQUE INDEX bank_accounts_tenant_default_idx ON public.bank_accounts USING btree (tenant_id) WHERE ((is_active = true) AND (is_default = true));

CREATE INDEX idx_bank_accounts_tenant ON public.bank_accounts USING btree (tenant_id);

CREATE INDEX benchmark_jwt_dataset_size_idx ON public.benchmark_jwt USING btree (dataset_size);

CREATE INDEX benchmark_legacy_dataset_size_idx ON public.benchmark_legacy USING btree (dataset_size);

CREATE UNIQUE INDEX categories_tenant_slug_unique ON public.categories USING btree (tenant_id, slug);

CREATE INDEX idx_categories_module ON public.categories USING btree (module);

CREATE INDEX idx_categories_parent_id ON public.categories USING btree (parent_id);

CREATE INDEX idx_categories_published_to ON public.categories USING gin (published_to);

CREATE INDEX idx_categories_slug ON public.categories USING btree (slug, module);

CREATE INDEX idx_categories_tenant ON public.categories USING btree (tenant_id);

CREATE INDEX idx_categories_tenant_id ON public.categories USING btree (tenant_id);

CREATE INDEX idx_contact_messages_tenant ON public.contact_messages USING btree (tenant_id);

CREATE INDEX idx_content_revisions_created ON public.content_revisions USING btree (created_at DESC);

CREATE INDEX idx_content_revisions_lookup ON public.content_revisions USING btree (table_name, record_id);

CREATE INDEX idx_content_revisions_tenant ON public.content_revisions USING btree (tenant_id);

CREATE INDEX idx_cron_job_logs_executed_at ON public.cron_job_logs USING btree (executed_at DESC);

CREATE INDEX idx_cron_job_logs_job_name ON public.cron_job_logs USING btree (job_name, executed_at DESC);

CREATE INDEX idx_cron_job_logs_status ON public.cron_job_logs USING btree (status);

CREATE INDEX idx_dharma_embeddings_vector ON public.dharma_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists='100');

CREATE UNIQUE INDEX dharma_talks_tenant_slug_unique ON public.dharma_talks USING btree (tenant_id, slug);

CREATE INDEX idx_dharma_talks_published_to_gin ON public.dharma_talks USING gin (published_to);

CREATE INDEX idx_dharma_talks_slug ON public.dharma_talks USING btree (slug);

CREATE INDEX idx_dharma_talks_tenant ON public.dharma_talks USING btree (tenant_id);

CREATE INDEX idx_dharma_talks_tenant_id ON public.dharma_talks USING btree (tenant_id);

CREATE INDEX idx_donation_campaigns_is_project ON public.donation_campaigns USING btree (is_project) WHERE (is_project = true);

CREATE INDEX idx_donation_campaigns_start_date ON public.donation_campaigns USING btree (start_date DESC);

CREATE INDEX idx_donation_campaigns_status ON public.donation_campaigns USING btree (status);

CREATE INDEX idx_donations_created_at ON public.donations USING btree (created_at DESC);

CREATE INDEX idx_donations_status ON public.donations USING btree (status);

CREATE INDEX idx_event_registrations_tenant ON public.event_registrations USING btree (tenant_id);

CREATE UNIQUE INDEX events_tenant_slug_unique ON public.events USING btree (tenant_id, slug);

CREATE INDEX idx_events_approval_status ON public.events USING btree (approval_status);

CREATE INDEX idx_events_is_major_festival ON public.events USING btree (is_major_festival);

CREATE INDEX idx_events_published_to_gin ON public.events USING gin (published_to);

CREATE INDEX idx_events_slug ON public.events USING btree (slug);

CREATE INDEX idx_events_start_date ON public.events USING btree (start_date);

CREATE INDEX idx_events_status ON public.events USING btree (status);

CREATE INDEX idx_events_tenant_id ON public.events USING btree (tenant_id);

CREATE INDEX idx_hero_slides_tenant ON public.hero_slides USING btree (tenant_id);

CREATE INDEX idx_media_event ON public.media USING btree (event_id);

CREATE INDEX idx_media_published_to ON public.media USING gin (published_to);

CREATE INDEX idx_media_tenant ON public.media USING btree (tenant_id);

CREATE INDEX idx_media_type ON public.media USING btree (type);

CREATE INDEX idx_news_category ON public.news USING btree (category_id);

CREATE INDEX idx_news_published_at ON public.news USING btree (published_at DESC);

CREATE INDEX idx_news_published_to_gin ON public.news USING gin (published_to);

CREATE INDEX idx_news_slug ON public.news USING btree (slug);

CREATE INDEX idx_news_status ON public.news USING btree (status);

CREATE INDEX idx_news_tenant_id ON public.news USING btree (tenant_id);

CREATE UNIQUE INDEX news_tenant_slug_unique ON public.news USING btree (tenant_id, slug);

CREATE INDEX idx_organizations_is_active ON public.organizations USING btree (is_active);

CREATE INDEX idx_organizations_tenant_id ON public.organizations USING btree (tenant_id);

CREATE INDEX idx_pages_tenant ON public.pages USING btree (tenant_id);

CREATE UNIQUE INDEX pages_tenant_slug_unique ON public.pages USING btree (tenant_id, slug);

CREATE INDEX idx_rate_limit_hits_identifier_action ON public.rate_limit_hits USING btree (identifier, action, created_at DESC);

CREATE INDEX idx_rate_limit_ip_action ON public.rate_limit_hits USING btree (ip_address, action_type);

CREATE INDEX idx_tenants_domain ON public.tenants USING btree (domain);

CREATE INDEX idx_tenants_geog ON public.tenants USING gist (geog);

CREATE INDEX idx_tenants_lifecycle_status ON public.tenants USING btree (lifecycle_status);

CREATE INDEX idx_tenants_plan_type ON public.tenants USING btree (plan_type);

CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);

-- =============================================================================
-- 7. FOREIGN KEYS
-- =============================================================================

ALTER TABLE public.about_sections ADD CONSTRAINT about_sections_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;
ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;
ALTER TABLE public.bank_accounts ADD CONSTRAINT bank_accounts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;
ALTER TABLE public.categories ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories (id) ON DELETE CASCADE;
ALTER TABLE public.categories ADD CONSTRAINT categories_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;
ALTER TABLE public.charity_posts ADD CONSTRAINT charity_posts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;
ALTER TABLE public.contact_messages ADD CONSTRAINT contact_messages_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;
ALTER TABLE public.content_revisions ADD CONSTRAINT content_revisions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;
ALTER TABLE public.dharma_embeddings ADD CONSTRAINT dharma_embeddings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;
ALTER TABLE public.dharma_talks ADD CONSTRAINT dharma_talks_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories (id) ON DELETE CASCADE;
ALTER TABLE public.dharma_talks ADD CONSTRAINT dharma_talks_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;
ALTER TABLE public.donation_campaigns ADD CONSTRAINT donation_campaigns_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts (id) ON DELETE SET NULL;
ALTER TABLE public.donation_campaigns ADD CONSTRAINT donation_campaigns_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;
ALTER TABLE public.donations ADD CONSTRAINT donations_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts (id);
ALTER TABLE public.donations ADD CONSTRAINT donations_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.donation_campaigns (id) ON DELETE SET NULL;
ALTER TABLE public.donations ADD CONSTRAINT donations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;
ALTER TABLE public.event_registrations ADD CONSTRAINT event_registrations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events (id) ON DELETE CASCADE;
ALTER TABLE public.event_registrations ADD CONSTRAINT event_registrations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;
ALTER TABLE public.events ADD CONSTRAINT events_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;
ALTER TABLE public.faqs ADD CONSTRAINT faqs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;
ALTER TABLE public.hero_slides ADD CONSTRAINT hero_slides_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;
ALTER TABLE public.homepage_stats ADD CONSTRAINT homepage_stats_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;
ALTER TABLE public.media ADD CONSTRAINT media_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories (id) ON DELETE CASCADE;
ALTER TABLE public.media ADD CONSTRAINT media_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events (id) ON DELETE CASCADE;
ALTER TABLE public.media ADD CONSTRAINT media_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;
ALTER TABLE public.news ADD CONSTRAINT news_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories (id) ON DELETE CASCADE;
ALTER TABLE public.news ADD CONSTRAINT news_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;
ALTER TABLE public.newsletter_subscribers ADD CONSTRAINT newsletter_subscribers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;
ALTER TABLE public.organizations ADD CONSTRAINT organizations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;
ALTER TABLE public.pages ADD CONSTRAINT pages_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.pages (id) ON DELETE CASCADE;
ALTER TABLE public.pages ADD CONSTRAINT pages_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;
ALTER TABLE public.quick_access_links ADD CONSTRAINT quick_access_links_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;
ALTER TABLE public.rate_limit_hits ADD CONSTRAINT rate_limit_hits_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;
ALTER TABLE public.site_settings ADD CONSTRAINT site_settings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;
ALTER TABLE public.tenants ADD CONSTRAINT tenants_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.tenants (id);
ALTER TABLE public.tenants ADD CONSTRAINT tenants_province_id_fkey FOREIGN KEY (province_id) REFERENCES public.provinces (id);
ALTER TABLE public.testimonials ADD CONSTRAINT testimonials_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE;
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_preferred_temple_id_fkey FOREIGN KEY (preferred_temple_id) REFERENCES public.tenants (id) ON DELETE SET NULL;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE SET NULL;

