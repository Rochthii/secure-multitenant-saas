# 🔗 HƯỚNG DẪN LIÊN KẾT SUPABASE

## 📋 BƯỚC 1: LẤY THÔNG TIN TỪ SUPABASE

1. Truy cập Supabase Dashboard: https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **Settings** → **API**
4. Copy 2 thông tin:
   - **Project URL** (ví dụ: `https://xxxxx.supabase.co`)
   - **anon public** key (trong mục **Project API keys**)

---

## 📋 BƯỚC 2: TẠO FILE .ENV.LOCAL

1. Tại thư mục `e:\WEB_CHANTARANGSAY\chantarangsay-website\`
2. Tạo file mới tên `.env.local`
3. Paste nội dung sau:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email Service (Resend)
RESEND_API_KEY=your-resend-api-key-if-you-have
RESEND_FROM_EMAIL=noreply@chantarangsay.org

# Optional: Service Role Key (for admin operations)
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. **Thay thế:**
   - `https://your-project.supabase.co` → URL thật
   - `your-anon-key-here` → Anon key thật

---

## 📋 BƯỚC 3: KIỂM TRA DATABASE SCHEMA

### Các bảng cần có trong Supabase:

Vào **SQL Editor** trong Supabase và chạy script tạo bảng (nếu chưa có):

```sql
-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_vi TEXT NOT NULL,
    name_km TEXT,
    name_en TEXT,
    slug TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('news', 'events')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. News Table
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_vi TEXT NOT NULL,
    title_km TEXT,
    title_en TEXT,
    slug TEXT UNIQUE NOT NULL,
    excerpt_vi TEXT,
    excerpt_km TEXT,
    excerpt_en TEXT,
    content_vi TEXT,
    content_km TEXT,
    content_en TEXT,
    thumbnail_url TEXT,
    category_id UUID REFERENCES categories(id),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_vi TEXT NOT NULL,
    title_km TEXT,
    title_en TEXT,
    description_vi TEXT,
    description_km TEXT,
    description_en TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    location TEXT,
    thumbnail_url TEXT,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    registration_required BOOLEAN DEFAULT FALSE,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Event Registrations Table
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_name TEXT NOT NULL,
    donor_email TEXT,
    donor_phone TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    purpose TEXT NOT NULL,
    message TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
    receipt_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_vi TEXT NOT NULL,
    question_km TEXT,
    question_en TEXT,
    answer_vi TEXT NOT NULL,
    answer_km TEXT,
    answer_en TEXT,
    category TEXT,
    display_order INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Pages Table (for CMS content)
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title_vi TEXT NOT NULL,
    title_km TEXT,
    title_en TEXT,
    content_vi TEXT,
    content_km TEXT,
    content_en TEXT,
    meta_description TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📋 BƯỚC 4: SETUP ROW LEVEL SECURITY (RLS)

Chạy các lệnh sau trong **SQL Editor**:

```sql
-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Public read access policies (anyone can read published content)
CREATE POLICY "Public can read published news" ON news
    FOR SELECT USING (status = 'published');

CREATE POLICY "Public can read events" ON events
    FOR SELECT USING (true);

CREATE POLICY "Public can read FAQs" ON faqs
    FOR SELECT USING (status = 'active');

CREATE POLICY "Public can read published pages" ON pages
    FOR SELECT USING (status = 'published');

CREATE POLICY "Public can read categories" ON categories
    FOR SELECT USING (true);

-- Public write access policies (for forms)
CREATE POLICY "Public can create event registrations" ON event_registrations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can create transactions" ON transactions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can create contact messages" ON contact_messages
    FOR INSERT WITH CHECK (true);

-- Public can read non-anonymous transactions
CREATE POLICY "Public can read transactions" ON transactions
    FOR SELECT USING (is_anonymous = FALSE);
```

---

## 📋 BƯỚC 5: THÊM DỮ LIỆU MẪU

### 5.1. Thêm Categories

```sql
INSERT INTO categories (name_vi, slug, type) VALUES
('Tin chi nhánh', 'tin-chua', 'news'),
('Phật pháp', 'phat-phap', 'news'),
('Hoạt động', 'hoat-dong', 'news');
```

### 5.2. Thêm FAQs

```sql
INSERT INTO faqs (question_vi, answer_vi, category) VALUES
('Chi nhánh mở cửa lúc mấy giờ?', 'Chi nhánh mở cửa từ 5:00 sáng đến 18:00 tối hằng ngày.', 'Chung'),
('Làm thế nào để đăng ký tham gia khóa tu?', 'Bạn có thể đăng ký trực tiếp tại trang Lịch lễ hoặc liên hệ qua số điện thoại của chi nhánh.', 'Sự kiện'),
('Tôi có thể thanh toán online không?', 'Có, bạn có thể thanh toán qua trang Thanh toán trên website.', 'Thanh toán');
```

### 5.3. Thêm Page "Giới thiệu"

```sql
INSERT INTO pages (slug, title_vi, content_vi, status) VALUES
('gioi-thieu', 
 'Giới thiệu về Chi nhánh Chantarangsay',
 '<p>Chi nhánh Chantarangsay là một ngôi chi nhánh Phật giáo Nam tông Khmer nằm tại Quận 3, TP. Hồ Chí Minh.</p>
  <p>Với lịch sử hơn 75 năm hình thành và phát triển, chi nhánh là nơi tu tập, học hỏi Phật pháp và gìn giữ văn hóa truyền thống của cộng đồng người Khmer.</p>',
 'published');
```

---

## 📋 BƯỚC 6: KIỂM TRA KẾT NỐI

1. **Restart dev server:**
   ```bash
   npm run dev
   ```

2. **Kiểm tra console:**
   - Không có lỗi Supabase
   - Pages load được data

3. **Test các trang:**
   - `/tin-tuc` - Nên hiện "Chưa có bài viết nào"
   - `/lich-le` - Nên hiện "Chưa có sự kiện sắp diễn ra"
   - `/hoi-dap` - Nên hiện 3 FAQs mẫu
   - `/gioi-thieu` - Nên hiện nội dung giới thiệu

---

## 📋 BƯỚC 7: THÊM STORAGE (Optional - cho hình ảnh)

1. Vào **Storage** trong Supabase
2. Tạo bucket mới: `public-images`
3. Set public access
4. Thêm policy:

```sql
-- Allow public to read images
CREATE POLICY "Public can read images" ON storage.objects
    FOR SELECT USING (bucket_id = 'public-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated can upload images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'public-images' AND auth.role() = 'authenticated');
```

---

## ✅ CHECKLIST HOÀN TẤT

- [ ] Đã tạo file `.env.local` với credentials
- [ ] Đã chạy SQL tạo các bảng
- [ ] Đã enable RLS và tạo policies
- [ ] Đã thêm dữ liệu mẫu
- [ ] Dev server chạy không lỗi
- [ ] Các trang hiện content từ database
- [ ] (Optional) Đã tạo Storage bucket

---

## 🆘 TROUBLESHOOTING

### Lỗi "Invalid API key"
- Kiểm tra lại `.env.local`
- Đảm bảo dùng **anon key**, không phải service role key
- Restart dev server: `Ctrl+C` rồi `npm run dev`

### Lỗi "relation does not exist"
- Chưa tạo bảng trong Supabase
- Chạy lại SQL script ở Bước 3

### Không thấy dữ liệu
- Kiểm tra RLS policies (Bước 4)
- Kiểm tra status = 'published' trong database

### Dev server không khởi động được
- Kiểm tra `.env.local` có đúng format không
- Không được có dấu space thừa
- Phải restart terminal sau khi tạo `.env.local`

---

## 📞 CẦN HỖ TRỢ?

Nếu gặp lỗi, share:
1. Error message trong console
2. Screenshot Supabase dashboard (API settings)
3. Nội dung file `.env.local` (ẩn credentials)
