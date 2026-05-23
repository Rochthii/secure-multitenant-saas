# 📡 API Documentation - Chi nhánh Chantarangsay Website

> **API Reference & Database Schema**  
> **Version**: 1.0  
> **Last Updated**: February 4, 2026  
> **Base URL**: Supabase Auto-generated REST API

---

## 📋 Table of Contents

1. [API Overview](#1-api-overview)
2. [Authentication](#2-authentication)
3. [Database Schema](#3-database-schema)
4. [REST API Endpoints](#4-rest-api-endpoints)
5. [Server Actions](#5-server-actions)
6. [Webhooks](#6-webhooks)
7. [Error Handling](#7-error-handling)
8. [Rate Limiting](#8-rate-limiting)

---

## 1. API Overview

### 1.1 API Architecture

The Chantarangsay Website uses **Supabase** as the primary API layer:

- **REST API**: Auto-generated from PostgreSQL schema
- **Realtime API**: WebSocket subscriptions (optional)
- **Storage API**: File uploads & retrieval
- **Auth API**: User authentication & authorization

### 1.2 Base URLs

| Environment | Base URL | Purpose |
|------------|----------|---------|
| **Production** | `https://your-project.supabase.co/rest/v1` | Live API |
| **Development** | `http://localhost:54321/rest/v1` | Local Supabase |

### 1.3 Request Headers

```http
Content-Type: application/json
apikey: YOUR_SUPABASE_ANON_KEY
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 2. Authentication

### 2.1 Auth Endpoints

#### Login

```http
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": "authenticated",
    "user_metadata": {
      "role": "admin"
    }
  }
}
```

#### Logout

```http
POST /auth/v1/logout
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Refresh Token

```http
POST /auth/v1/token?grant_type=refresh_token
Content-Type: application/json

{
  "refresh_token": "YOUR_REFRESH_TOKEN"
}
```

### 2.2 Authorization Levels

| Level | Access | Required Header |
|-------|--------|----------------|
| **Public** | Read published content | `apikey` only |
| **Authenticated** | User-specific actions | `apikey` + `Authorization` |
| **Admin** | Full CRUD, management | `apikey` + `Authorization` (role='admin') |

---

## 3. Database Schema

### 3.1 Schema Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CORE TABLES                              │
├─────────────────────────────────────────────────────────────────┤
│  categories → news                                              │
│  categories → events → event_registrations                      │
│  categories → media                                             │
│  pages (static content)                                         │
│  transactions                                                      │
│  contact_messages                                               │
│  audit_logs                                                     │
│  faqs                                                           │
│  newsletter_subscribers                                         │
│  hero_slides (homepage carousel)                                │
│  dharma_talks                                                   │
│  testimonials                                                   │
│  about_sections                                                 │
│  homepage_stats                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Table Definitions

#### 3.2.1 Categories

**Purpose**: Categorization for news, events, media

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_vi VARCHAR(100) NOT NULL,
  name_km VARCHAR(100),
  name_en VARCHAR(100),
  slug VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('news', 'event', 'media')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `name_vi` | VARCHAR(100) | Vietnamese name |
| `name_km` | VARCHAR(100) | Khmer name |
| `name_en` | VARCHAR(100) | English name |
| `slug` | VARCHAR(100) | URL-friendly identifier (unique) |
| `type` | VARCHAR(50) | Category type: 'news', 'event', 'media' |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**RLS Policies**:
- ✅ Public: SELECT
- 🔒 Admin: ALL

---

#### 3.2.2 News

**Purpose**: News articles & blog posts

```sql
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `title_*` | VARCHAR(200) | Localized titles (vi/km/en) |
| `slug` | VARCHAR(200) | URL slug (unique) |
| `content_*` | TEXT | Full article content (localized) |
| `excerpt_*` | TEXT | Short excerpt for listings (localized) |
| `thumbnail_url` | TEXT | Featured image URL |
| `category_id` | UUID | Foreign key to categories |
| `status` | VARCHAR(20) | 'draft', 'published', 'archived' |
| `published_at` | TIMESTAMPTZ | Publish date/time |
| `author_id` | UUID | Foreign key to auth.users |
| `view_count` | INT | Page view counter |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Indexes**:
- `idx_news_status` on `status`
- `idx_news_published_at` on `published_at DESC`
- `idx_news_category` on `category_id`

**RLS Policies**:
- ✅ Public: SELECT WHERE status='published'
- 🔒 Admin: ALL

---

#### 3.2.3 Events

**Purpose**: Tenant events, festivals, classes

```sql
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
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `title_*` | VARCHAR(200) | Localized event titles |
| `description_*` | TEXT | Full event descriptions (localized) |
| `start_date` | DATE | Event start date |
| `end_date` | DATE | Event end date (optional) |
| `start_time` | TIME | Event start time |
| `end_time` | TIME | Event end time |
| `location` | VARCHAR(200) | Event location |
| `is_recurring` | BOOLEAN | Whether event recurs |
| `recurrence_pattern` | JSONB | Recurrence rules (cron-like) |
| `thumbnail_url` | TEXT | Event image |
| `registration_required` | BOOLEAN | If registration is needed |
| `max_participants` | INT | Maximum attendees |
| `current_participants` | INT | Current registrations count |
| `status` | VARCHAR(20) | 'upcoming', 'ongoing', 'completed', 'cancelled' |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Indexes**:
- `idx_events_start_date` on `start_date`
- `idx_events_status` on `status`

**RLS Policies**:
- ✅ Public: SELECT WHERE status != 'cancelled'
- 🔒 Admin: ALL

---

#### 3.2.4 Event Registrations

**Purpose**: User registrations for events

```sql
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `event_id` | UUID | Foreign key to events (cascades on delete) |
| `full_name` | VARCHAR(100) | Registrant name |
| `phone` | VARCHAR(20) | Contact phone |
| `email` | VARCHAR(100) | Contact email |
| `num_participants` | INT | Number of attendees |
| `note` | TEXT | Special requests/notes |
| `status` | VARCHAR(20) | 'pending', 'confirmed', 'cancelled' |
| `created_at` | TIMESTAMPTZ | Registration timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**RLS Policies**:
- ✅ Public: INSERT (anyone can register)
- 🔒 Admin: SELECT, UPDATE

---

#### 3.2.5 Transactions

**Purpose**: Online transactions & offerings

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `donor_name` | VARCHAR(100) | Donor name (optional if anonymous) |
| `donor_phone` | VARCHAR(20) | Contact phone |
| `donor_email` | VARCHAR(100) | Contact email |
| `amount` | DECIMAL(12,2) | Transaction amount (must be > 0) |
| `currency` | VARCHAR(3) | Currency code (default: VND) |
| `purpose` | VARCHAR(100) | Transaction purpose category |
| `purpose_detail` | TEXT | Detailed purpose description |
| `payment_method` | VARCHAR(50) | Payment method used |
| `transaction_id` | VARCHAR(100) | External transaction reference |
| `status` | VARCHAR(20) | 'pending', 'completed', 'failed', 'refunded' |
| `note` | TEXT | Additional notes |
| `is_anonymous` | BOOLEAN | Hide donor name publicly |
| `created_at` | TIMESTAMPTZ | Transaction timestamp |
| `completed_at` | TIMESTAMPTZ | Completion timestamp |

**Indexes**:
- `idx_transactions_status` on `status`
- `idx_transactions_created_at` on `created_at DESC`

**RLS Policies**:
- ✅ Public: INSERT (anyone can donate)
- 🔒 Admin: SELECT, UPDATE (view & manage)

---

#### 3.2.6 Pages

**Purpose**: Static/CMS pages (About, Contact, etc.)

```sql
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
  meta_description_km TEXT,
  meta_description_en TEXT,
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `title_*` | VARCHAR(200) | Page titles (localized) |
| `slug` | VARCHAR(200) | URL slug (unique) |
| `content_*` | TEXT | Page content (localized) |
| `meta_description_*` | TEXT | SEO meta descriptions (localized) |
| `status` | VARCHAR(20) | 'draft', 'published', 'archived' |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**RLS Policies**:
- ✅ Public: SELECT WHERE status='published'
- 🔒 Admin: ALL

---

#### 3.2.7 Additional Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| **media** | Photos, videos, audio files | `type`, `url`, `category_id`, `event_id` |
| **contact_messages** | Contact form submissions | `name`, `email`, `message`, `status` |
| **audit_logs** | Admin activity tracking | `user_id`, `action`, `table_name`, `record_id` |
| **faqs** | Frequently asked questions | `question_*`, `answer_*`, `category` |
| **newsletter_subscribers** | Email newsletter list | `email`, `status`, `subscribed_at` |
| **hero_slides** | Homepage carousel | `image_url`, `title_*`, `link_url`, `order` |
| **dharma_talks** | Audio/video sermons | `title_*`, `speaker`, `audio_url`, `video_url` |
| **testimonials** | User testimonials | `name`, `content_*`, `photo_url`, `role` |
| **about_sections** | About page sections | `section_key`, `title_*`, `content_*`, `order` |
| **homepage_stats** | Homepage statistics | `stat_key`, `value`, `label_*`, `icon` |

---

## 4. REST API Endpoints

### 4.1 News Endpoints

#### List News

```http
GET /rest/v1/news?select=*&status=eq.published&order=published_at.desc&limit=10
```

**Query Parameters**:
- `select`: Fields to return (default: `*`)
- `status`: Filter by status
- `category_id`: Filter by category
- `order`: Sort order
- `limit`: Results per page
- `offset`: Pagination offset

**Response**:
```json
[
  {
    "id": "uuid",
    "title_vi": "Tin tức mới nhất",
    "title_km": "ព័ត៌មានថ្មីបំផុត",
    "title_en": "Latest News",
    "slug": "tin-tuc-moi-nhat",
    "excerpt_vi": "Mô tả ngắn...",
    "thumbnail_url": "https://...",
    "category_id": "uuid",
    "published_at": "2026-02-01T10:00:00Z",
    "view_count": 150
  }
]
```

#### Get Single News

```http
GET /rest/v1/news?select=*&slug=eq.tin-tuc-moi-nhat&single=true
```

#### Create News (Admin Only)

```http
POST /rest/v1/news
Authorization: Bearer ADMIN_JWT
Content-Type: application/json

{
  "title_vi": "Tin tức mới",
  "title_km": "ព័ត៌មានថ្មី",
  "title_en": "New News",
  "slug": "tin-tuc-moi",
  "content_vi": "Nội dung...",
  "content_km": "មាតិកា...",
  "content_en": "Content...",
  "category_id": "uuid",
  "status": "draft"
}
```

#### Update News (Admin Only)

```http
PATCH /rest/v1/news?id=eq.uuid
Authorization: Bearer ADMIN_JWT
Content-Type: application/json

{
  "status": "published",
  "published_at": "2026-02-04T10:00:00Z"
}
```

#### Delete News (Admin Only)

```http
DELETE /rest/v1/news?id=eq.uuid
Authorization: Bearer ADMIN_JWT
```

---

### 4.2 Events Endpoints

#### List Events

```http
GET /rest/v1/events?select=*&status=eq.upcoming&order=start_date.asc
```

#### Get Single Event

```http
GET /rest/v1/events?select=*,event_registrations(count)&id=eq.uuid&single=true
```

#### Register for Event

```http
POST /rest/v1/event_registrations
Content-Type: application/json

{
  "event_id": "uuid",
  "full_name": "Nguyễn Văn A",
  "phone": "0123456789",
  "email": "nguyenvana@example.com",
  "num_participants": 2,
  "note": "Vegetarian meal please"
}
```

---

### 4.3 Transactions Endpoints

#### Create Transaction

```http
POST /rest/v1/transactions
Content-Type: application/json

{
  "donor_name": "Nguyễn Thị B",
  "donor_email": "nguyenthib@example.com",
  "amount": 500000,
  "currency": "VND",
  "purpose": "Giao dịch chung",
  "payment_method": "bank_transfer",
  "is_anonymous": false
}
```

#### List Transactions (Admin Only)

```http
GET /rest/v1/transactions?select=*&status=eq.completed&order=created_at.desc&limit=20
Authorization: Bearer ADMIN_JWT
```

---

### 4.4 Common Query Patterns

#### Filtering

```http
# Equals
GET /rest/v1/news?status=eq.published

# Not equals
GET /rest/v1/news?status=neq.draft

# Greater than
GET /rest/v1/events?start_date=gt.2026-02-01

# In list
GET /rest/v1/news?status=in.(published,archived)

# Like (pattern matching)
GET /rest/v1/news?title_vi=like.*Phật*
```

#### Sorting

```http
# Ascending
GET /rest/v1/news?order=published_at.asc

# Descending
GET /rest/v1/news?order=published_at.desc

# Multiple columns
GET /rest/v1/news?order=status.asc,published_at.desc
```

#### Pagination

```http
# Limit & offset
GET /rest/v1/news?limit=10&offset=20

# With count
GET /rest/v1/news?limit=10&offset=20
Prefer: count=exact
```

#### Relationships

```http
# Inner join
GET /rest/v1/news?select=*,categories(*)

# Filtering on joined table
GET /rest/v1/news?select=*,categories(*)&categories.type=eq.news
```

---

## 5. Server Actions

**Location**: `app/actions/*.ts`

Server Actions are used for mutations (Create, Update, Delete) with additional business logic.

### 5.1 News Actions

```typescript
// app/actions/news.actions.ts
'use server'

export async function createNews(data: NewsInput) {
  // Validate permissions
  // Validate input with Zod
  // Insert to database
  // Revalidate cache
  return { success: true, data: news };
}

export async function updateNews(id: string, data: Partial<NewsInput>) {
  // Similar pattern
}

export async function deleteNews(id: string) {
  // Similar pattern
}

export async function publishNews(id: string) {
  // Update status + published_at
  // Trigger notifications
}
```

### 5.2 Usage in Client Components

```typescript
'use client'
import { createNews } from '@/app/actions/news.actions';

function NewsForm() {
  async function handleSubmit(formData: FormData) {
    const result = await createNews({
      title_vi: formData.get('title_vi'),
      // ...
    });
    
    if (result.success) {
      toast.success('News created!');
    }
  }
  
  return <form action={handleSubmit}>...</form>;
}
```

---

## 6. Webhooks

### 6.1 Stripe Webhook (Future)

```http
POST /api/webhooks/stripe
Stripe-Signature: ...

{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_xxx",
      "amount": 500000,
      "metadata": {
        "transaction_id": "uuid"
      }
    }
  }
}
```

**Handler**: Updates transaction status to 'completed'

---

## 7. Error Handling

### 7.1 Error Responses

```json
{
  "error": {
    "code": "23505",
    "message": "duplicate key value violates unique constraint",
    "details": "Key (slug)=(tin-tuc-moi) already exists."
  }
}
```

### 7.2 HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| `200` | OK | Successful GET, PATCH, DELETE |
| `201` | Created | Successful POST |
| `204` | No Content | Successful DELETE with no response |
| `400` | Bad Request | Invalid input data |
| `401` | Unauthorized | Missing or invalid JWT |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate key, constraint violation |
| `500` | Internal Server Error | Server-side error |

---

## 8. Rate Limiting

**Current**: No rate limiting (relying on Supabase default)

**Future**: Implement rate limiting via middleware
- **Anonymous**: 100 requests/minute
- **Authenticated**: 300 requests/minute
- **Admin**: Unlimited

---

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **PostgREST API**: https://postgrest.org/en/stable/api.html
- **Database Migrations**: See `supabase/migrations/`

---

<div align="center">
  <p>🛕 Namo Buddhaya 🙏</p>
</div>
