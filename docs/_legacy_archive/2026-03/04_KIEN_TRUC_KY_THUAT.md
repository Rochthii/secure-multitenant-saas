# 🔧 KIẾN TRÚC KỸ THUẬT

> **Stack công nghệ hiện đại, phù hợp production system**

---

## 1. TỔNG QUAN CÔNG NGHỆ

### 1.1 Đề xuất Stack chính

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Next.js 14+ (App Router)                           │   │
│  │  + TypeScript                                        │   │
│  │  + Tailwind CSS                                      │   │
│  │  + shadcn/ui                                         │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    BACKEND                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Supabase (Backend-as-a-Service)                    │   │
│  │  ├── PostgreSQL Database                            │   │
│  │  ├── Authentication (Email, OAuth)                  │   │
│  │  ├── Storage (Images, Files)                        │   │
│  │  ├── Edge Functions (Serverless)                    │   │
│  │  └── Realtime Subscriptions                         │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    DEPLOYMENT                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Vercel (Next.js Hosting)                           │   │
│  │  + Cloudflare CDN                                    │   │
│  │  + GitHub Actions (CI/CD)                            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Tại sao chọn Stack này?

| Công nghệ | Lý do chọn |
|-----------|------------|
| **Next.js 14** | SSR/SSG tối ưu SEO, App Router hiện đại, Server Components |
| **Supabase** | PostgreSQL mạnh mẽ, Auth tích hợp, Realtime, **FREE tier đủ dùng** |
| **TypeScript** | Type-safe, giảm bugs, DX tốt |
| **Tailwind CSS** | Styling nhanh, consistent, responsive dễ dàng |
| **Vercel** | Deploy Next.js nhanh nhất, preview branches |

### 1.3 Supabase có phù hợp không?

> [!TIP]
> **CÓ - Supabase RẤT PHÙ HỢP** cho dự án này vì:
> - PostgreSQL cho dữ liệu có cấu trúc (lễ, tin tức, sự kiện)
> - Auth tích hợp cho hệ thống đăng ký
> - Storage cho hình ảnh, video, PDF
> - Realtime cho cập nhật lịch lễ
> - **Free tier: 500MB DB, 1GB Storage, 50K monthly users**

---

## 2. CẤU TRÚC DỰ ÁN

### 2.1 Folder Structure

```
chantarangsay-website/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD
├── public/
│   ├── fonts/                   # Khmer fonts local
│   ├── images/
│   │   ├── icons/              # Custom Khmer icons
│   │   └── og/                 # Open Graph images
│   └── locales/                # i18n JSON files
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/           # i18n routing
│   │   │   ├── page.tsx        # Homepage
│   │   │   ├── gioi-thieu/
│   │   │   ├── tin-tuc/
│   │   │   ├── thu-vien/
│   │   │   ├── cung-duong/
│   │   │   └── lien-he/
│   │   ├── admin/              # Admin dashboard
│   │   ├── api/                # API Routes
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Navigation.tsx
│   │   ├── sections/           # Page sections
│   │   └── common/             # Shared components
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts       # Browser client
│   │   │   ├── server.ts       # Server client
│   │   │   └── admin.ts        # Service role client
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript types
│   ├── i18n/                   # Internationalization
│   └── styles/
│       └── khmer-patterns.css  # Custom Khmer patterns
├── supabase/
│   ├── migrations/             # SQL migrations
│   ├── functions/              # Edge Functions
│   └── seed.sql                # Seed data
├── docs/                       # Documentation
├── .env.local                  # Environment variables
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. DATABASE SCHEMA

### 3.1 Core Tables

```sql
-- Bảng Categories (Danh mục)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_vi VARCHAR(100) NOT NULL,
  name_km VARCHAR(100),
  name_en VARCHAR(100),
  slug VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'news', 'event', 'media'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng News (Tin tức)
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_vi VARCHAR(200) NOT NULL,
  title_km VARCHAR(200),
  title_en VARCHAR(200),
  slug VARCHAR(200) UNIQUE NOT NULL,
  content_vi TEXT,
  content_km TEXT,
  content_en TEXT,
  thumbnail_url TEXT,
  category_id UUID REFERENCES categories(id),
  status VARCHAR(20) DEFAULT 'draft', -- draft, published
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Events (Sự kiện/Lễ)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_vi VARCHAR(200) NOT NULL,
  title_km VARCHAR(200),
  title_en VARCHAR(200),
  description_vi TEXT,
  description_km TEXT,
  description_en TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  location VARCHAR(200),
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern JSONB, -- {type: 'yearly', day: 14, month: 4}
  thumbnail_url TEXT,
  registration_required BOOLEAN DEFAULT FALSE,
  max_participants INT,
  status VARCHAR(20) DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Event Registrations (Đăng ký sự kiện)
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  note TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, cancelled
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Transactions (Thanh toán)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name VARCHAR(100),
  donor_phone VARCHAR(20),
  donor_email VARCHAR(100),
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'VND',
  purpose VARCHAR(100), -- 'general', 'construction', 'education'
  payment_method VARCHAR(50), -- 'bank_transfer', 'momo', 'zalopay'
  transaction_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
  note TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Media (Thư viện)
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_vi VARCHAR(200) NOT NULL,
  title_km VARCHAR(200),
  title_en VARCHAR(200),
  description_vi TEXT,
  type VARCHAR(20) NOT NULL, -- 'image', 'video', 'audio', 'document'
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  category_id UUID REFERENCES categories(id),
  event_id UUID REFERENCES events(id), -- Liên kết với sự kiện
  year INT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Pages (Trang tĩnh)
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_vi VARCHAR(200) NOT NULL,
  title_km VARCHAR(200),
  title_en VARCHAR(200),
  slug VARCHAR(200) UNIQUE NOT NULL,
  content_vi TEXT,
  content_km TEXT,
  content_en TEXT,
  meta_description_vi TEXT,
  meta_description_en TEXT,
  status VARCHAR(20) DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Contact Messages
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  subject VARCHAR(200),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'unread', -- unread, read, replied
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Audit Logs (theo yêu cầu user rules)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

### 3.2 Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Public read for published news
CREATE POLICY "Public can read published news"
ON news FOR SELECT
USING (status = 'published');

-- Only admins can manage news
CREATE POLICY "Admins can manage news"
ON news FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');

-- Transactions are private, only admins
CREATE POLICY "Only admins can view transactions"
ON transactions FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');
```

---

## 4. AUTHENTICATION & AUTHORIZATION

### 4.1 Auth Flow

```
1. Public User (không đăng nhập)
   └── Xem tin tức, sự kiện, thư viện
   └── Gửi form liên hệ
   └── Đăng ký sự kiện (guest)

2. Registered User (đăng ký)
   └── Theo dõi sự kiện đã đăng ký
   └── Lịch sử thanh toán
   └── Nhận thông báo

3. Admin (quản trị)
   └── Quản lý nội dung
   └── Xem/xuất báo cáo
   └── Quản lý đăng ký, thanh toán
```

### 4.2 Admin Roles

| Role | Quyền |
|------|-------|
| **Super Admin** | Full access, quản lý users |
| **Content Editor** | CRUD tin tức, sự kiện, media |
| **Transaction Manager** | Xem/quản lý thanh toán |
| **Read Only** | Chỉ xem báo cáo |

---

## 5. INTEGRATIONS

### 5.1 Payment Gateways

```
Thanh toán online:
├── Bank Transfer (QR Code VietQR)
├── MoMo (API integration)
├── ZaloPay (API integration)
└── PayPal/Stripe (cho Việt Kiều)
```

### 5.2 Third-party Services

| Service | Mục đích |
|---------|----------|
| **Cloudinary** | Image optimization & CDN |
| **SendGrid/Resend** | Email notifications |
| **Google Analytics** | Traffic tracking |
| **Google Maps** | Bản đồ vị trí chi nhánh |
| **Facebook/YouTube** | Embed & share |

---

## 6. PERFORMANCE & SECURITY

### 6.1 Performance

```
- Next.js ISR (Incremental Static Regeneration)
- Image optimization với next/image
- Font optimization với next/font
- Code splitting automatic
- Edge caching với Vercel
```

### 6.2 Security Checklist

- [ ] HTTPS everywhere
- [ ] CORS configuration
- [ ] Rate limiting API routes
- [ ] Input validation (Zod)
- [ ] XSS prevention
- [ ] CSRF tokens cho forms
- [ ] Supabase RLS policies
- [ ] Environment variables secure
- [ ] Audit logging enabled

---

## 7. SO SÁNH VỚI WORDPRESS

| Tiêu chí | Next.js + Supabase | WordPress |
|----------|-------------------|-----------|
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Security** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Customization** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Ease of Use (Admin)** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Scalability** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Cost** | ⭐⭐⭐⭐⭐ (Free tier) | ⭐⭐⭐ (Hosting) |
| **SEO** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Realtime** | ⭐⭐⭐⭐⭐ | ⭐⭐ |

> [!NOTE]
> **Kết luận:** Next.js + Supabase phù hợp hơn cho dự án này vì:
> - Cần custom UI đặc biệt (bản sắc Khmer)
> - Cần đa ngôn ngữ phức tạp (Khmer font)
> - Cần tính năng realtime
> - Team có khả năng kỹ thuật
