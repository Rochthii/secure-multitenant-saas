# PROMPT 03: DATABASE SETUP

**Task:** Setup Supabase database schema với migrations & RLS policies

**Thời gian ước tính:** 1-2 giờ

---

## 📋 CONTEXT

Tạo database schema cho website chi nhánh với các bảng: categories, news, events, transactions, media, pages, contact_messages, audit_logs.

**Reference:**
- `docs/_legacy_archive/2026-03/04_KIEN_TRUC_KY_THUAT.md` (section Database Schema - legacy)
- `docs/07_DATABASE_MIGRATIONS_RLS.md` (playbook DB hiện tại)

**Prerequisites:**
- Đã có Supabase project
- Đã cài Supabase CLI: `npm install -g supabase`

---

## 🎯 YÊU CẦU

### 1. Login Supabase CLI

```bash
supabase login
supabase link --project-ref your-project-ref
```

### 2. Initialize migrations

```bash
supabase init
supabase db pull
```

### 3. Create migration file

```bash
supabase migration new initial_schema
```

### 4. Migration SQL

Paste vào file migration:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_vi VARCHAR(100) NOT NULL,
  name_km VARCHAR(100),
  name_en VARCHAR(100),
  slug VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('news', 'event', 'media')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- News table
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  category_id UUID REFERENCES categories(id),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES auth.users(id),
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Registrations table
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  num_participants INT DEFAULT 1,
  note TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_name VARCHAR(100),
  donor_phone VARCHAR(20),
  donor_email VARCHAR(100),
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'VND',
  purpose VARCHAR(100),
  purpose_detail TEXT,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  note TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Media table
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_vi VARCHAR(200) NOT NULL,
  title_km VARCHAR(200),
  title_en VARCHAR(200),
  description_vi TEXT,
  description_km TEXT,
  description_en TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('image', 'video', 'audio', 'document')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size BIGINT,
  mime_type VARCHAR(100),
  category_id UUID REFERENCES categories(id),
  event_id UUID REFERENCES events(id),
  year INT,
  tags TEXT[],
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pages table
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Messages table
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  subject VARCHAR(200),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  replied_at TIMESTAMPTZ,
  replied_by UUID REFERENCES auth.users(id)
);

-- Audit Logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(50),
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_published_at ON news(published_at DESC);
CREATE INDEX idx_news_category ON news(category_id);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_media_type ON media(type);
CREATE INDEX idx_media_event ON media(event_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Row Level Security Policies
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
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Published news are viewable by everyone"
  ON news FOR SELECT
  USING (status = 'published');

CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT
  USING (status != 'cancelled');

CREATE POLICY "Media are viewable by everyone"
  ON media FOR SELECT
  USING (true);

CREATE POLICY "Published pages are viewable by everyone"
  ON pages FOR SELECT
  USING (status = 'published');

-- Public insert policies (for forms)
CREATE POLICY "Anyone can register for events"
  ON event_registrations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can send contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

-- Admin policies (you'll need to set up admin role)
CREATE POLICY "Admins can manage all news"
  ON news FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can manage all events"
  ON events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Only admins can view transactions"
  ON transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Only admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
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

-- Triggers
CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 5. Push migration

```bash
supabase db push
```

### 6. Generate TypeScript types

```bash
supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

### 7. Seed initial data (optional)

Create `supabase/seed.sql`:

```sql
-- Seed categories
INSERT INTO categories (name_vi, name_km, name_en, slug, type) VALUES
('Tin tức chung', 'ព័ត៌មានទូទៅ', 'General News', 'tin-tuc-chung', 'news'),
('Hoạt động Phật sự', 'សកម្មភាពព្រះពុទ្ធសាសនា', 'Buddhist Activities', 'hoat-dong-phat-su', 'news'),
('Từ thiện', 'សប្បុរសធម៌', 'Charity', 'tu-thien', 'news'),
('Lễ hội', 'បុណ្យ', 'Festivals', 'le-hoi', 'event'),
('Ảnh sự kiện', 'រូបថតព្រឹត្តិការណ៍', 'Event Photos', 'anh-su-kien', 'media'),
('Video pháp âm', 'វីដេអូធម៌', 'Dharma Videos', 'video-phap-am', 'media');

-- Seed sample page
INSERT INTO pages (title_vi, title_km, title_en, slug, content_vi, status) VALUES
('Giới thiệu', 'អំពីយើង', 'About Us', 'gioi-thieu', 
 'Chi nhánh Chantarangsay được thành lập năm 1946...', 
 'published');
```

Apply seed:
```bash
supabase db reset # Resets & applies seed
```

---

## ✅ ACCEPTANCE CRITERIA

- [ ] All tables created successfully
- [ ] RLS policies enabled
- [ ] Indexes created
- [ ] Types generated
- [ ] Can query from Next.js app
- [ ] No SQL errors

---

--- START PROMPT ---

Setup Supabase database cho website Chi nhánh Chantarangsay:

1. Tạo migration file với tất cả tables theo schema
2. Enable RLS trên tất cả tables
3. Create policies: public read cho published content, admin full access
4. Create indexes cho performance
5. Create updated_at triggers
6. Seed initial categories data
7. Generate TypeScript types

Tables cần tạo: categories, news, events, event_registrations, transactions, media, pages, contact_messages, audit_logs

Test connect từ Next.js app để confirm!
