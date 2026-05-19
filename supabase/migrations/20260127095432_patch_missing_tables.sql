CREATE TABLE public.about_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key character varying NOT NULL UNIQUE,
  title_vi text NOT NULL,
  title_km text,
  title_en text,
  content_vi text,
  content_km text,
  content_en text,
  images jsonb DEFAULT '[]'::jsonb,
  thumbnail_url text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  summary_vi text,
  summary_km text,
  summary_en text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.active_visitors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_hash text NOT NULL UNIQUE,
  path text,
  last_active_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.charity_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_vi text NOT NULL,
  title_km text,
  title_en text,
  excerpt_vi text NOT NULL,
  excerpt_km text,
  excerpt_en text,
  image_url text NOT NULL,
  image_alt_vi text,
  image_alt_km text,
  image_alt_en text,
  link_url text,
  event_date date NOT NULL,
  is_featured boolean DEFAULT false,
  order_position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.content_revisions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type character varying NOT NULL,
  content_id uuid NOT NULL,
  version_number integer NOT NULL,
  data jsonb NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_email character varying,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.dharma_talks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_vi text NOT NULL,
  title_km text,
  title_en text,
  description_vi text,
  description_km text,
  description_en text,
  media_type text NOT NULL CHECK (media_type = ANY (ARRAY['audio'::text, 'video'::text])),
  media_url text NOT NULL,
  thumbnail_url text NOT NULL,
  duration_minutes integer,
  speaker_name_vi text NOT NULL,
  speaker_name_km text,
  speaker_name_en text,
  topic_vi text,
  topic_km text,
  topic_en text,
  recorded_date date,
  is_featured boolean DEFAULT false,
  order_position integer DEFAULT 0,
  view_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.transaction_purposes (
  id text NOT NULL PRIMARY KEY,
  title text NOT NULL,
  description text,
  icon text DEFAULT 'Landmark'::text,
  goal bigint DEFAULT 0,
  current bigint DEFAULT 0,
  color text DEFAULT 'text-gold-primary'::text,
  is_active boolean DEFAULT true,
  order_position integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.faqs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_vi text NOT NULL,
  question_km text,
  question_en text,
  answer_vi text NOT NULL,
  answer_km text,
  answer_en text,
  category character varying NOT NULL DEFAULT 'general'::character varying,
  display_order integer DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.hero_slides (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_position integer NOT NULL DEFAULT 0,
  image_url text NOT NULL,
  title_vi text NOT NULL,
  title_km text,
  title_en text,
  subtitle_vi text NOT NULL,
  subtitle_km text,
  subtitle_en text,
  cta1_text_key text NOT NULL,
  cta1_link text NOT NULL,
  cta2_text_key text NOT NULL,
  cta2_link text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.homepage_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_position integer NOT NULL DEFAULT 0,
  icon_emoji text NOT NULL,
  stat_value integer NOT NULL,
  suffix text DEFAULT ''::text,
  label_vi text NOT NULL,
  label_km text,
  label_en text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.newsletter_subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  locale text DEFAULT 'vi'::text,
  is_active boolean DEFAULT true,
  subscribed_at timestamp with time zone DEFAULT now(),
  unsubscribed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.page_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  path text NOT NULL,
  view_count bigint DEFAULT 1,
  day date DEFAULT CURRENT_DATE,
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.quick_access_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_position integer NOT NULL DEFAULT 0,
  icon_emoji text NOT NULL,
  translation_key text NOT NULL,
  href text NOT NULL,
  color_class text DEFAULT 'text-gold-primary'::text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.role_permissions (
  role character varying NOT NULL,
  resource character varying NOT NULL,
  can_create boolean DEFAULT false,
  can_read boolean DEFAULT true,
  can_update boolean DEFAULT false,
  can_delete boolean DEFAULT false,
  CONSTRAINT role_permissions_pkey PRIMARY KEY (role, resource)
);

CREATE TABLE public.settings (
  key character varying NOT NULL PRIMARY KEY,
  value text,
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.site_settings (
  key text NOT NULL PRIMARY KEY,
  value text,
  description text,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.testimonials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_vi text NOT NULL,
  quote_km text,
  quote_en text,
  author_name_vi text NOT NULL,
  author_name_km text,
  author_name_en text,
  author_role_vi text,
  author_role_km text,
  author_role_en text,
  author_location text,
  is_featured boolean DEFAULT false,
  order_position integer DEFAULT 0,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  is_active boolean DEFAULT true,
  approved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);





