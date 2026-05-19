-- ==============================================================================
-- MIGRATION: RLS TOÀN DIỆN CHO TẤT CẢ CÁC BẢNG CÓ tenant_id
-- Ngày: 2026-03-04
-- Mục đích: Bảo mật dữ liệu đa chi nhánh ở tầng Database
--   → Không phụ thuộc vào việc dev có nhớ filter tenant_id trong code hay không
--   → Đây là lưới an toàn cuối cùng (last line of defense)
-- ==============================================================================

-- ==============================================================================
-- HÀM TIỆN ÍCH (đã có trong tenant_rls_isolation.sql, tái tạo để đảm bảo)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT tenant_id
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_global_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'company_editor')
  );
$$;

-- ==============================================================================
-- MACRO RLS PATTERN:
--   PUBLIC READ  = bất kỳ ai xem nội dung published/active
--   ADMIN WRITE  = chỉ admin/editor cùng tenant hoặc super_admin
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EVENTS
-- ------------------------------------------------------------------------------
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read events" ON public.events;

DROP POLICY IF EXISTS "Tenant admins can manage events" ON public.events;

CREATE POLICY "Public can read events" ON public.events FOR
SELECT USING (
        status IN (
            'upcoming', 'ongoing', 'completed'
        )
        OR (
            auth.uid () IS NOT NULL
            AND (
                public.is_global_admin ()
                OR public.get_current_tenant_id () = tenant_id
            )
        )
    );

CREATE POLICY "Tenant admins can manage events" ON public.events FOR ALL USING (
    auth.uid () IS NOT NULL
    AND (
        public.is_global_admin ()
        OR public.get_current_tenant_id () = tenant_id
    )
)
WITH
    CHECK (
        auth.uid () IS NOT NULL
        AND (
            public.is_global_admin ()
            OR public.get_current_tenant_id () = tenant_id
        )
    );

-- ------------------------------------------------------------------------------
-- 2. DHARMA_TALKS
-- ------------------------------------------------------------------------------
ALTER TABLE public.dharma_talks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read dharma talks" ON public.dharma_talks;

DROP POLICY IF EXISTS "Tenant admins can manage dharma talks" ON public.dharma_talks;

CREATE POLICY "Public can read dharma talks" ON public.dharma_talks FOR
SELECT USING (
        is_active = true
        OR (
            auth.uid () IS NOT NULL
            AND (
                public.is_global_admin ()
                OR public.get_current_tenant_id () = tenant_id
            )
        )
    );

CREATE POLICY "Tenant admins can manage dharma talks" ON public.dharma_talks FOR ALL USING (
    auth.uid () IS NOT NULL
    AND (
        public.is_global_admin ()
        OR public.get_current_tenant_id () = tenant_id
    )
)
WITH
    CHECK (
        auth.uid () IS NOT NULL
        AND (
            public.is_global_admin ()
            OR public.get_current_tenant_id () = tenant_id
        )
    );

-- ------------------------------------------------------------------------------
-- 3. CATEGORIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read categories" ON public.categories;

DROP POLICY IF EXISTS "Tenant admins can manage categories" ON public.categories;

-- Categories: ai cũng xem được (dùng cho navigation)
CREATE POLICY "Public can read categories" ON public.categories FOR
SELECT USING (true);

CREATE POLICY "Tenant admins can manage categories" ON public.categories FOR ALL USING (
    auth.uid () IS NOT NULL
    AND (
        public.is_global_admin ()
        OR public.get_current_tenant_id () = tenant_id
    )
)
WITH
    CHECK (
        auth.uid () IS NOT NULL
        AND (
            public.is_global_admin ()
            OR public.get_current_tenant_id () = tenant_id
        )
    );

-- ------------------------------------------------------------------------------
-- 4. ABOUT_SECTIONS
-- ------------------------------------------------------------------------------
ALTER TABLE public.about_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read about sections" ON public.about_sections;

DROP POLICY IF EXISTS "Tenant admins can manage about sections" ON public.about_sections;

CREATE POLICY "Public can read about sections" ON public.about_sections FOR
SELECT USING (
        is_active = true
        OR (
            auth.uid () IS NOT NULL
            AND (
                public.is_global_admin ()
                OR public.get_current_tenant_id () = tenant_id
            )
        )
    );

CREATE POLICY "Tenant admins can manage about sections" ON public.about_sections FOR ALL USING (
    auth.uid () IS NOT NULL
    AND (
        public.is_global_admin ()
        OR public.get_current_tenant_id () = tenant_id
    )
)
WITH
    CHECK (
        auth.uid () IS NOT NULL
        AND (
            public.is_global_admin ()
            OR public.get_current_tenant_id () = tenant_id
        )
    );

-- ------------------------------------------------------------------------------
-- 5. HERO_SLIDES
-- ------------------------------------------------------------------------------
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read hero slides" ON public.hero_slides;

DROP POLICY IF EXISTS "Tenant admins can manage hero slides" ON public.hero_slides;

CREATE POLICY "Public can read hero slides" ON public.hero_slides FOR
SELECT USING (
        is_active = true
        OR (
            auth.uid () IS NOT NULL
            AND (
                public.is_global_admin ()
                OR public.get_current_tenant_id () = tenant_id
            )
        )
    );

CREATE POLICY "Tenant admins can manage hero slides" ON public.hero_slides FOR ALL USING (
    auth.uid () IS NOT NULL
    AND (
        public.is_global_admin ()
        OR public.get_current_tenant_id () = tenant_id
    )
)
WITH
    CHECK (
        auth.uid () IS NOT NULL
        AND (
            public.is_global_admin ()
            OR public.get_current_tenant_id () = tenant_id
        )
    );

-- ------------------------------------------------------------------------------
-- 6. PAGES
-- ------------------------------------------------------------------------------
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published pages" ON public.pages;

DROP POLICY IF EXISTS "Tenant admins can manage pages" ON public.pages;

CREATE POLICY "Public can read published pages" ON public.pages FOR
SELECT USING (
        status = 'published'
        OR (
            auth.uid () IS NOT NULL
            AND (
                public.is_global_admin ()
                OR public.get_current_tenant_id () = tenant_id
            )
        )
    );

CREATE POLICY "Tenant admins can manage pages" ON public.pages FOR ALL USING (
    auth.uid () IS NOT NULL
    AND (
        public.is_global_admin ()
        OR public.get_current_tenant_id () = tenant_id
    )
)
WITH
    CHECK (
        auth.uid () IS NOT NULL
        AND (
            public.is_global_admin ()
            OR public.get_current_tenant_id () = tenant_id
        )
    );

-- ------------------------------------------------------------------------------
-- 7. MEDIA
-- ------------------------------------------------------------------------------
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read media" ON public.media;

DROP POLICY IF EXISTS "Tenant admins can manage media" ON public.media;

-- Media: ai cũng xem được (thư viện công khai)
CREATE POLICY "Public can read media" ON public.media FOR
SELECT USING (true);

CREATE POLICY "Tenant admins can manage media" ON public.media FOR ALL USING (
    auth.uid () IS NOT NULL
    AND (
        public.is_global_admin ()
        OR public.get_current_tenant_id () = tenant_id
    )
)
WITH
    CHECK (
        auth.uid () IS NOT NULL
        AND (
            public.is_global_admin ()
            OR public.get_current_tenant_id () = tenant_id
        )
    );

-- ------------------------------------------------------------------------------
-- 8. DONATION_PROJECTS
-- ------------------------------------------------------------------------------
ALTER TABLE public.transaction_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read transaction projects" ON public.transaction_projects;

DROP POLICY IF EXISTS "Tenant admins can manage transaction projects" ON public.transaction_projects;

CREATE POLICY "Public can read transaction projects" ON public.transaction_projects FOR
SELECT USING (true);

CREATE POLICY "Tenant admins can manage transaction projects" ON public.transaction_projects FOR ALL USING (
    auth.uid () IS NOT NULL
    AND (
        public.is_global_admin ()
        OR public.get_current_tenant_id () = tenant_id
    )
)
WITH
    CHECK (
        auth.uid () IS NOT NULL
        AND (
            public.is_global_admin ()
            OR public.get_current_tenant_id () = tenant_id
        )
    );

-- ------------------------------------------------------------------------------
-- 9. DONATION_PURPOSES
-- ------------------------------------------------------------------------------
ALTER TABLE public.transaction_purposes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read transaction purposes" ON public.transaction_purposes;

DROP POLICY IF EXISTS "Tenant admins can manage transaction purposes" ON public.transaction_purposes;

CREATE POLICY "Public can read transaction purposes" ON public.transaction_purposes FOR
SELECT USING (
        is_active = true
        OR auth.uid () IS NOT NULL
    );

CREATE POLICY "Tenant admins can manage transaction purposes" ON public.transaction_purposes FOR ALL USING (
    auth.uid () IS NOT NULL
    AND (
        public.is_global_admin ()
        OR public.get_current_tenant_id () = tenant_id
    )
)
WITH
    CHECK (
        auth.uid () IS NOT NULL
        AND (
            public.is_global_admin ()
            OR public.get_current_tenant_id () = tenant_id
        )
    );

-- ------------------------------------------------------------------------------
-- 10. NEWSLETTER_SUBSCRIBERS
-- ------------------------------------------------------------------------------
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;

DROP POLICY IF EXISTS "Tenant admins can view subscribers" ON public.newsletter_subscribers;

-- Ai cũng có thể đăng ký newsletter (INSERT public)
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT
WITH
    CHECK (true);

-- Chỉ admin xem được danh sách subscriber của chi nhánh mình
CREATE POLICY "Tenant admins can view subscribers" ON public.newsletter_subscribers FOR
SELECT USING (
        auth.uid () IS NOT NULL
        AND (
            public.is_global_admin ()
            OR public.get_current_tenant_id () = tenant_id
        )
    );

CREATE POLICY "Tenant admins can manage subscribers" ON public.newsletter_subscribers FOR ALL USING (
    auth.uid () IS NOT NULL
    AND (
        public.is_global_admin ()
        OR public.get_current_tenant_id () = tenant_id
    )
);

-- ------------------------------------------------------------------------------
-- 11. SITE_SETTINGS (đã có tenant_id)
-- ------------------------------------------------------------------------------
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read site settings" ON public.site_settings;

DROP POLICY IF EXISTS "Tenant admins can manage site settings" ON public.site_settings;

-- Ai cũng có thể đọc settings công khai (theme, contact info, v.v.)
CREATE POLICY "Public can read site settings" ON public.site_settings FOR
SELECT USING (true);

CREATE POLICY "Tenant admins can manage site settings" ON public.site_settings FOR ALL USING (
    auth.uid () IS NOT NULL
    AND (
        public.is_global_admin ()
        OR public.get_current_tenant_id () = tenant_id
    )
)
WITH
    CHECK (
        auth.uid () IS NOT NULL
        AND (
            public.is_global_admin ()
            OR public.get_current_tenant_id () = tenant_id
        )
    );

-- ==============================================================================
-- GHI CHÚ:
-- Bảng transactions đã có RLS trong 20260220000002_fix_transactions.sql
-- Bảng news đã có RLS trong tenant_rls_isolation.sql
-- ==============================================================================