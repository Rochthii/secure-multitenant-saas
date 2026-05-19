-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name_vi VARCHAR(100) NOT NULL,
    name_km VARCHAR(100),
    name_en VARCHAR(100),
    slug VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (
        type IN ('news', 'event', 'media')
    ),
    created_at TIMESTAMPTZ DEFAULT NOW ()
);

-- News table
CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    title_vi VARCHAR(200) NOT NULL,
    title_km VARCHAR(200),
    title_en VARCHAR(200),
    slug VARCHAR(200) UNIQUE NOT NULL,
    content_vi TEXT,
    content_km TEXT,
    content_en TEXT,
    excerpt_vi TEXT,
    excerpt_km TEXT,
    excerpt_en TEXT,
    thumbnail_url TEXT,
    category_id UUID REFERENCES categories (id),
    status VARCHAR(20) DEFAULT 'draft' CHECK (
        status IN (
            'draft',
            'published',
            'archived'
        )
    ),
    published_at TIMESTAMPTZ,
    author_id UUID REFERENCES auth.users (id),
    view_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW (),
    updated_at TIMESTAMPTZ DEFAULT NOW ()
);

-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    title_vi VARCHAR(200) NOT NULL,
    title_km VARCHAR(200),
    title_en VARCHAR(200),
    description_vi TEXT,
    description_km TEXT,
    description_en TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    location VARCHAR(200),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern JSONB,
    thumbnail_url TEXT,
    registration_required BOOLEAN DEFAULT FALSE,
    max_participants INT,
    current_participants INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (
        status IN (
            'upcoming',
            'ongoing',
            'completed',
            'cancelled'
        )
    ),
    created_at TIMESTAMPTZ DEFAULT NOW (),
    updated_at TIMESTAMPTZ DEFAULT NOW ()
);

-- Event Registrations table
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    event_id UUID REFERENCES events (id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    num_participants INT DEFAULT 1,
    note TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'confirmed',
            'cancelled'
        )
    ),
    created_at TIMESTAMPTZ DEFAULT NOW (),
    updated_at TIMESTAMPTZ DEFAULT NOW ()
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    donor_name VARCHAR(100),
    donor_phone VARCHAR(20),
    donor_email VARCHAR(100),
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'VND',
    purpose VARCHAR(100),
    purpose_detail TEXT,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'completed',
            'failed',
            'refunded'
        )
    ),
    note TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW (),
    completed_at TIMESTAMPTZ
);

-- Media table
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    title_vi VARCHAR(200) NOT NULL,
    title_km VARCHAR(200),
    title_en VARCHAR(200),
    description_vi TEXT,
    description_km TEXT,
    description_en TEXT,
    type VARCHAR(20) NOT NULL CHECK (
        type IN (
            'image',
            'video',
            'audio',
            'document'
        )
    ),
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_size BIGINT,
    mime_type VARCHAR(100),
    category_id UUID REFERENCES categories (id),
    event_id UUID REFERENCES events (id),
    year INT,
    tags TEXT [],
    view_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW ()
);

-- Pages table
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    title_vi VARCHAR(200) NOT NULL,
    title_km VARCHAR(200),
    title_en VARCHAR(200),
    slug VARCHAR(200) UNIQUE NOT NULL,
    content_vi TEXT,
    content_km TEXT,
    content_en TEXT,
    meta_description_vi TEXT,
    meta_description_km TEXT,
    meta_description_en TEXT,
    status VARCHAR(20) DEFAULT 'published' CHECK (
        status IN (
            'draft',
            'published',
            'archived'
        )
    ),
    created_at TIMESTAMPTZ DEFAULT NOW (),
    updated_at TIMESTAMPTZ DEFAULT NOW ()
);

-- Contact Messages table
CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'unread' CHECK (
        status IN ('unread', 'read', 'replied')
    ),
    created_at TIMESTAMPTZ DEFAULT NOW (),
    replied_at TIMESTAMPTZ,
    replied_by UUID REFERENCES auth.users (id)
);

-- Audit Logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID REFERENCES auth.users (id),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50),
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW ()
);

-- Indexes for performance
CREATE INDEX idx_news_status ON news (status);

CREATE INDEX idx_news_published_at ON news (published_at DESC);

CREATE INDEX idx_news_category ON news (category_id);

CREATE INDEX idx_events_start_date ON events (start_date);

CREATE INDEX idx_events_status ON events (status);

CREATE INDEX idx_media_type ON media(type);

CREATE INDEX idx_media_event ON media (event_id);

CREATE INDEX idx_transactions_status ON transactions (status);

CREATE INDEX idx_transactions_created_at ON transactions (created_at DESC);

-- Row Level Security - Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

ALTER TABLE media ENABLE ROW LEVEL SECURITY;

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Categories are viewable by everyone" ON categories FOR
SELECT USING (true);

CREATE POLICY "Published news are viewable by everyone" ON news FOR
SELECT USING (status = 'published');

CREATE POLICY "Events are viewable by everyone" ON events FOR
SELECT USING (status != 'cancelled');

CREATE POLICY "Media are viewable by everyone" ON media FOR
SELECT USING (true);

CREATE POLICY "Published pages are viewable by everyone" ON pages FOR
SELECT USING (status = 'published');

-- Public insert policies (for forms)
CREATE POLICY "Anyone can register for events" ON event_registrations FOR INSERT
WITH
    CHECK (true);

CREATE POLICY "Anyone can donate" ON transactions FOR INSERT
WITH
    CHECK (true);

CREATE POLICY "Anyone can send contact messages" ON contact_messages FOR INSERT
WITH
    CHECK (true);

-- Admin policies (requires role='admin' in user metadata)
CREATE POLICY "Admins can manage all news" ON news FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM auth.users
        WHERE
            auth.users.id = auth.uid ()
            AND auth.users.raw_user_meta_data ->> 'role' = 'admin'
    )
);

CREATE POLICY "Admins can manage all events" ON events FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM auth.users
        WHERE
            auth.users.id = auth.uid ()
            AND auth.users.raw_user_meta_data ->> 'role' = 'admin'
    )
);

CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM auth.users
        WHERE
            auth.users.id = auth.uid ()
            AND auth.users.raw_user_meta_data ->> 'role' = 'admin'
    )
);

CREATE POLICY "Admins can manage media" ON media FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM auth.users
        WHERE
            auth.users.id = auth.uid ()
            AND auth.users.raw_user_meta_data ->> 'role' = 'admin'
    )
);

CREATE POLICY "Admins can manage pages" ON pages FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM auth.users
        WHERE
            auth.users.id = auth.uid ()
            AND auth.users.raw_user_meta_data ->> 'role' = 'admin'
    )
);

CREATE POLICY "Admins can view event registrations" ON event_registrations FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM auth.users
            WHERE
                auth.users.id = auth.uid ()
                AND auth.users.raw_user_meta_data ->> 'role' = 'admin'
        )
    );

CREATE POLICY "Admins can manage event registrations" ON event_registrations FOR
UPDATE USING (
    EXISTS (
        SELECT 1
        FROM auth.users
        WHERE
            auth.users.id = auth.uid ()
            AND auth.users.raw_user_meta_data ->> 'role' = 'admin'
    )
);

CREATE POLICY "Only admins can view transactions" ON transactions FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM auth.users
            WHERE
                auth.users.id = auth.uid ()
                AND auth.users.raw_user_meta_data ->> 'role' = 'admin'
        )
    );

CREATE POLICY "Admins can update transactions" ON transactions FOR
UPDATE USING (
    EXISTS (
        SELECT 1
        FROM auth.users
        WHERE
            auth.users.id = auth.uid ()
            AND auth.users.raw_user_meta_data ->> 'role' = 'admin'
    )
);

CREATE POLICY "Admins can view contact messages" ON contact_messages FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM auth.users
            WHERE
                auth.users.id = auth.uid ()
                AND auth.users.raw_user_meta_data ->> 'role' = 'admin'
        )
    );

CREATE POLICY "Admins can update contact messages" ON contact_messages FOR
UPDATE USING (
    EXISTS (
        SELECT 1
        FROM auth.users
        WHERE
            auth.users.id = auth.uid ()
            AND auth.users.raw_user_meta_data ->> 'role' = 'admin'
    )
);

CREATE POLICY "Only admins can view audit logs" ON audit_logs FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM auth.users
            WHERE
                auth.users.id = auth.uid ()
                AND auth.users.raw_user_meta_data ->> 'role' = 'admin'
        )
    );

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_registrations_updated_at
  BEFORE UPDATE ON event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();