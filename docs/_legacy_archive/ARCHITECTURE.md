# 🏗️ Architecture Documentation - Multi-tenant Ecosystem

---

## 📋 Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Patterns](#2-architecture-patterns)
3. [Technology Stack](#3-technology-stack)
4. [Directory Structure](#4-directory-structure)
5. [Data Flow](#5-data-flow)
6. [Component Architecture](#6-component-architecture)
7. [State Management](#7-state-management)
8. [API Design](#8-api-design)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Internationalization](#10-internationalization)
11. [Performance Optimization](#11-performance-optimization)
12. [Security Architecture](#12-security-architecture)
13. [Deployment Architecture](#13-deployment-architecture)
14. [Monitoring & Observability](#14-monitoring--observability)

---

## 1. System Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Browser │  │  Mobile  │  │  Tablet  │  │   SEO    │        │
│  │   User   │  │   User   │  │   User   │  │  Bots    │        │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘        │
└────────┼─────────────┼─────────────┼─────────────┼──────────────┘
         │             │             │             │
         └─────────────┴─────────────┴─────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │            Next.js 16+ (App Router + Turbopack)           │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │                                                            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │ │
│  │  │    Public    │  │     Admin    │  │      API     │   │ │
│  │  │    Pages     │  │   Dashboard  │  │    Routes    │   │ │
│  │  │              │  │              │  │              │   │ │
│  │  │ • Homepage   │  │ • Analytics  │  │ • REST       │   │ │
│  │  │ • News       │  │ • CMS        │  │ • Actions    │   │ │
│  │  │ • Events     │  │ • Settings   │  │ • Webhooks   │   │ │
│  │  │ • Transactions  │  │ • Approvals  │  │ • AI RAG     │   │ │
│  │  │ • AI Portal  │  │ • RAG Admin  │  │              │   │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │ │
│  │                                                            │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │                    Middleware Layer                        │ │
│  │  • i18n Routing • Auth Guard • Security Headers           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND-AS-A-SERVICE LAYER                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      SUPABASE                              │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │                                                            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │ │
│  │  │  PostgreSQL  │  │     Auth     │  │   Storage    │   │ │
│  │  │   Database   │  │   Service    │  │   Service    │   │ │
│  │  │              │  │              │  │              │   │ │
│  │  │ • 28+ Tables │  │ • JWT        │  │ • Images     │   │ │
│  │  │ • RLS        │  │ • Roles      │  │ • Videos     │   │ │
│  │  │ • Triggers   │  │ • MFA        │  │ • Documents  │   │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │ │
│  │                                                            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │ │
│  │  │   Realtime   │  │     Edge     │  │   Vectors    │   │ │
│  │  │  Subscriptions│ │   Functions  │  │  (pgvector)  │   │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MONITORING & ANALYTICS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    Sentry    │  │   PostHog    │  │   Vercel     │         │
│  │ Error Track  │  │  Analytics   │  │  Analytics   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 System Characteristics

| Characteristic | Value | Description |
|---------------|--------|-------------|
| **Architecture Pattern** | Multi-tenant SaaS | Shared codebase, isolated tenants |
| **Admin Types** | Global / Business / Tenant | Unified core with contextual UI (McAaron for Business) |
| **Rendering Strategy** | Hybrid SSR/SSG/ISR | Optimized per-route cache |
| **Block Registry** | Hybrid Static/Dynamic | Pre-parsing optimization for Edge |
| **Data Flow** | Unidirectional | React Server Components → Client |
| **Mapping Engine** | Semantic Auto-mapping | Fallback-based content selection |
| **AI Strategy** | Agentic GraphRAG V2 | LLM-based NER + Multi-hop Traversal + Graph-Aware Reranking |
| **Deployment Model** | Edge-first | Vercel Edge Network + Supabase Edge Functions |
| **Scalability** | Horizontal | Auto-scaling on Vercel |
| **Availability** | 99.9%+ | Multi-region deployment |

---

## 2. Architecture Patterns

### 2.1 Headless CMS Architecture

**Decision**: Decoupled frontend (Next.js) from backend (Supabase)

**Benefits**:
- ✅ **Flexibility**: Change frontend without affecting backend
- ✅ **Performance**: Static generation + CDN caching
- ✅ **Developer Experience**: Modern React ecosystem
- ✅ **Multi-channel**: Same backend for web, mobile, API

**Trade-offs**:
- ⚠️ More complex initial setup
- ⚠️ Requires API versioning strategy

### 2.2 Server-First Architecture

**Decision**: Leverage Next.js 16+ App Router with Server Components and `unstable_cache`.

**Benefits**:
- ✅ **Performance**: Zero-bundle components by default
- ✅ **SEO**: Full SSR support
- ✅ **Security**: Database access on server only
- ✅ **DX**: Co-locate data fetching with UI

```typescript
// Example: Server Component with direct DB access
async function NewsPage() {
  const { data: news } = await createServerClient()
    .from('news')
    .select('*')
    .eq('status', 'published');
  
  return <NewsList news={news} />;
}
```

### 2.3 Feature-Based Directory Structure

**Decision**: Organize by feature, not by file type

```
components/
├── transactions/          # All transaction-related components
│   ├── amount-selector.tsx
│   ├── payment-method-selector.tsx
│   └── transaction-form.tsx
├── events/            # All event-related components
└── news/              # All news-related components
```

**Benefits**:
- ✅ **Maintainability**: Related code stays together
- ✅ **Scalability**: Easy to add/remove features
- ✅ **Team Collaboration**: Clear ownership boundaries

### 2.4 Broadcast Content Distribution Pattern

**Decision**: Implement a "Broadcast" (one-to-many) distribution for shared assets (News, Dharma Talks, Media, Categories).

**Mechanism** (Technical Details):
- **Field**: `published_to` (UUID[] array of tenant IDs).
- **Resolver**: Frontend queries use the `.or()` filter (e.g., `tenant_id.eq.{id},published_to.cs.{{id}}`).
- **RLS**: Policies check if the current user's `tenant_id` is contained in the `published_to` array.
- **Admin**: Global Admin pages (e.g., `/admin/media`) have `super_admin` access to manage system-wide distribution.

**Benefits**:
- ✅ **Efficiency**: Single source of truth for common assets.
- ✅ **Scalability**: Easily share content with one, many, or all tenants.
- ✅ **Isolation**: Global assets remain separate from tenant-owned assets unless explicitly shared.

---

## 3. Technology Stack

### 3.1 Frontend Stack Decision Matrix

| Technology | Alternatives Considered | Why Chosen |
|------------|------------------------|------------|
| **Next.js 16+** | Remix, Astro | App Router, Turbopack, Data Cache |
| **React 19** | Vue, Svelte | Largest ecosystem, Server Components |
| **TypeScript** | JavaScript | Type safety, better DX |
| **Tailwind CSS** | CSS Modules, Emotion | Utility-first, fast prototyping |
| **Radix UI** | MUI, Headless UI | Accessible, unstyled, flexible |
| **next-intl** | react-i18next | Next.js-specific, better DX |

### 3.2 Backend Stack Decision Matrix

| Technology | Alternatives Considered | Why Chosen |
|------------|------------------------|------------|
| **Supabase** | Firebase, AWS Amplify | PostgreSQL, open-source, affordable |
| **PostgreSQL** | MySQL, MongoDB | Relational data, mature ecosystem |
| **Supabase Auth** | Auth0, Clerk | Integrated, no extra cost |
| **Supabase Storage** | S3, Cloudinary | Integrated, simple CDN |

---

## 4. Directory Structure

### 4.1 Complete Structure

```
multi-tenant-ecosystem/
│
├── 📁 app/                          # Next.js App Router
│   │
│   ├── 📄 layout.tsx               # Root layout (required by Next.js 16)
│   ├── 📄 globals.css              # Global styles
│   ├── 📄 robots.ts                # Dynamic robots.txt
│   ├── 📄 sitemap.ts               # Dynamic sitemap.xml
│   ├── 📄 not-found.tsx            # 404 page
│   │
│   ├── 📁 [locale]/                # Internationalized routes
│   │   ├── layout.tsx             # Locale-specific layout
│   │   ├── page.tsx               # Homepage
│   │   ├── tin-tuc/               # News (Vietnamese route)
│   │   ├── lich-le/               # Events calendar
│   │   ├── cung-duong/            # Transactions
│   │   ├── gioi-thieu/            # About
│   │   ├── thu-vien/              # Gallery
│   │   └── ...
│   │
│   ├── 📁 admin/                   # Admin Dashboard (protected)
│   │   ├── layout.tsx             # Admin layout
│   │   ├── page.tsx               # Dashboard home
│   │   ├── dashboard/             # Analytics
│   │   ├── news/                  # News management
│   │   ├── events/                # Events management
│   │   ├── projects/             # Unified Projects management
│   │   ├── bank-accounts/         # Global Finance management
│   │   ├── transactions/             # Transactions tracking
│   │   ├── media/                 # Media library
│   │   ├── users/                 # User management
│   │   ├── approvals/             # Approval workflow
│   │   ├── audit-logs/            # Activity logs
│   │   ├── analytics/             # PostHog integration
│   │   ├── settings/              # Site configuration
│   │   └── backup/                # Backup & restore
│   │
│   ├── 📁 api/                     # API Routes
│   │   ├── health/                # Health check
│   │   ├── webhooks/              # External webhooks
│   │   ├── admin/                 # Admin specific APIs
│   │   │   └── ai/                # AI & RAG Management APIs
│   │   └── ...
│   │
│   ├── 📁 actions/                 # Server Actions
│   │   ├── news.actions.ts       # News CRUD actions
│   │   ├── events.actions.ts     # Events CRUD actions
│   │   └── ...
│   │
│   └── 📁 login/                   # Auth pages
│       └── page.tsx               # Login page
│
├── 📁 components/                  # React Components
│   ├── 📁 about/                  # About page components
│   │   ├── founder-section.tsx
│   │   ├── history-timeline.tsx
│   │   └── architecture-gallery.tsx
│   │
│   ├── 📁 transactions/              # Transaction components
│   │   ├── amount-selector.tsx
│   │   ├── payment-method-selector.tsx
│   │   ├── transaction-form.tsx
│   │   └── thank-you-modal.tsx
│   │
│   ├── 📁 events/                 # Event components
│   │   ├── calendar-view.tsx
│   │   ├── event-card.tsx
│   │   ├── event-detail-modal.tsx
│   │   └── registration-form.tsx
│   │
│   ├── 📁 news/                   # News components
│   │   ├── news-card.tsx
│   │   ├── news-list.tsx
│   │   ├── featured-news.tsx
│   │   └── news-detail.tsx
│   │
│   ├── 📁 gallery/                # Gallery components
│   │   ├── lightbox-viewer.tsx
│   │   ├── masonry-grid.tsx
│   │   └── image-card.tsx
│   │
│   ├── 📁 layout/                 # Layout components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── top-bar.tsx
│   │   ├── sidebar.tsx
│   │   └── breadcrumbs.tsx
│   │
│   ├── 📁 sections/               # Homepage sections
│   │   ├── hero-section.tsx
│   │   ├── stats-section.tsx
│   │   ├── khmer-calendar-section.tsx
│   │   ├── news-section.tsx
│   │   └── testimonials-section.tsx
│   │
│   ├── 📁 ui/                     # Reusable UI components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── tabs.tsx
│   │   ├── accordion.tsx
│   │   └── ... (30+ components)
│   │
│   ├── 📁 lazy/                   # Lazy-loaded components
│   │   └── index.ts              # Dynamic imports
│   │
│   ├── 📁 registry/               # Block Registries
│   │   ├── traditional.ts        # Traditional tenant blocks (12+ variations)
│   │   ├── modern.ts             # Modern business blocks
│   │   └── ...
│   │
│   └── 📁 error/                  # Error handling
│       └── error-boundary.tsx
│
├── 📁 lib/                         # Utilities & Libraries
│   ├── 📁 supabase/               # Supabase clients
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Middleware client
│   │
│   ├── 📁 analytics/              # Analytics setup
│   │   ├── posthog.tsx           # PostHog provider
│   │   └── tracking.ts           # Event tracking utils
│   │
│   ├── utils.ts                   # Utility functions
│   └── constants.ts               # App constants
│
├── 📁 i18n/                        # Internationalization
│   ├── routing.ts                 # Locale routing config
│   └── request.ts                 # Locale detection
│
├── 📁 messages/                    # Translation files
│   ├── vi.json                    # Vietnamese (3,500+ keys)
│   ├── km.json                    # Khmer (3,500+ keys)
│   └── en.json                    # English (3,500+ keys)
│
├── 📁 supabase/                    # Database
│   ├── 📁 migrations/             # SQL migrations (28+)
│   ├── config.toml                # Supabase config
│   └── seed.sql                   # Initial seed data
│
├── 📁 scripts/                     # Utility scripts
│   ├── seed-news.ts               # Seed news data
│   └── seed-events.ts             # Seed events data
│
├── 📁 public/                      # Static assets
│   ├── 📁 images/                 # Public images
│   ├── 📁 icons/                  # Icons & logos
│   └── favicon.ico
│
├── 📁 tests/                       # Test suite
│   ├── 📁 unit/                   # Unit tests (Vitest)
│   │   ├── components/
│   │   └── lib/
│   └── 📁 e2e/                    # E2E tests (Playwright)
│       ├── homepage.spec.ts
│       ├── transaction.spec.ts
│       └── admin.spec.ts
│
├── 📁 docs/                        # Documentation
│   ├── WHITE_PAPER_AGENTIC_GRAPHRAG_BUDDHISM.md # Nghiên cứu chuyên sâu về AI RAG
│   ├── API_DOCS.md                # API documentation
│   └── CONTRIBUTING.md            # Contribution guide
│
├── 📄 next.config.ts               # Next.js configuration
├── 📄 tailwind.config.ts           # Tailwind configuration
├── 📄 vitest.config.ts             # Vitest configuration
├── 📄 playwright.config.ts         # Playwright configuration
├── 📄 middleware.ts                # Global middleware
├── 📄 sentry.client.config.ts      # Sentry client config
├── 📄 sentry.server.config.ts      # Sentry server config
├── 📄 sentry.edge.config.ts        # Sentry edge config
├── 📄 package.json                 # Dependencies
├── 📄 tsconfig.json                # TypeScript config
├── 📄 eslint.config.mjs            # ESLint config
└── 📄 README.md                    # Main documentation
```

---

## 5. Data Flow

### 5.1 Request Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. CLIENT REQUEST                                                │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. MIDDLEWARE (middleware.ts)                                    │
│    • i18n routing (detect locale)                               │
│    • Auth check (verify JWT)                                    │
│    • Security headers                                           │
│    • Logging                                                    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. PAGE COMPONENT (Server Component)                            │
│    • Execute on server                                          │
│    • Fetch data from Supabase                                   │
│    • No client bundle                                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. CLIENT COMPONENTS (if needed)                                │
│    • Hydrate on client                                          │
│    • Interactive features                                       │
│    • useState, useEffect, etc.                                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. RENDER RESPONSE                                               │
│    • HTML (SSR/SSG)                                             │
│    • JSON (API)                                                 │
│    • Streaming (React Server Components)                        │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Data Mutation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ USER ACTION (e.g., Submit Transaction)                             │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT COMPONENT                                                 │
│    • Form validation (React Hook Form + Zod)                    │
│    • Call Server Action                                         │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ SERVER ACTION (app/actions/*.ts)                                │
│    • Validate input                                             │
│    • Check permissions                                          │
│    • Execute business logic                                     │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ SUPABASE DATABASE                                                │
│    • Row Level Security check                                   │
│    • Insert/Update data                                         │
│    • Trigger database functions                                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ RESPONSE TO CLIENT                                               │
│    • Success/Error status                                       │
│    • Revalidate cache (revalidatePath)                         │
│    • Update UI optimistically                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Component Architecture

### 6.1 Component Hierarchy

```
Page (Server Component)
├── Layout (Server Component)
│   ├── Header (Server Component)
│   │   └── LocaleSwitcher (Client Component)
│   ├── Children (Page content)
│   └── Footer (Server Component)
│
└── Page Content
    ├── ServerDataProvider (Server Component)
    │   └── ClientInteractive (Client Component)
    │       └── UI Components
    └── StaticSection (Server Component)
```

### 6.2 Server vs Client Components

| Type | When to Use | Example |
|------|------------|---------|
| **Server Component** | Default, data fetching, static UI | `NewsPage`, `Header`, `Footer` |
| **Client Component** | Interactive, useState, useEffect | `TransactionForm`, `Calendar`, `Modal` |

**Rule of Thumb**: Use Server Components by default, add `'use client'` only when needed.

### 6.3 Component Patterns

#### Pattern 1: Composition Pattern

```typescript
// Container Component (Server)
async function NewsPage() {
  const news = await getNews();
  return <NewsList news={news} />;
}

// Presentational Component (Server/Client)
function NewsList({ news }) {
  return (
    <div className="grid">
      {news.map(item => (
        <NewsCard key={item.id} news={item} />
      ))}
    </div>
  );
}
```

#### Pattern 2: Render Props Pattern

```typescript
<Tabs>
  <TabsList>
    <TabsTrigger value="news">Tin tức</TabsTrigger>
    <TabsTrigger value="events">Sự kiện</TabsTrigger>
  </TabsList>
  <TabsContent value="news">
    <NewsContent />
  </TabsContent>
  <TabsContent value="events">
    <EventsContent />
  </TabsContent>
</Tabs>
```

#### Pattern 3: Compound Components Pattern

```typescript
// Used extensively with Radix UI
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    <DialogFooter>
      <Button>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 6.4 Branding & Icon Standardization

Dự án áp dụng mô hình "Single Source of Truth" cho toàn bộ hệ thống nhận diện thương hiệu của các chi nhánh (Tenants):

#### 6.4.1 TenantLogo Architecture
- **Component**: `components/layout/tenant-logo.tsx`
- **Role**: Giải pháp duy nhất để render logo trong tất cả các Header và Footer.
- **Features**:
  - `variant`: Hỗ trợ `adaptive` (giữ nguyên tỷ lệ), `circle`, `square`.
  - `size`: Chuẩn hóa kích thước `sm`, `md`, `lg` hoặc `numeric`.
  - `Dynamic Fallback`: Tự động hiển thị tên chi nhánh hoặc icon bản sắc (Lotus) nếu tenant chưa cập nhật logo.

#### 6.4.2 Khmer Icon System (Standardized API)
- **Library**: `components/ui/khmer-icons.tsx`
- **Pattern**: Đồng bộ hóa API với các thư viện icon tiêu chuẩn (như Lucide).
- **Update**: Tất cả icon bản sắc (`LotusIcon`, `DharmaWheelIcon`, etc.) hỗ trợ prop `size`, `color` và `className`, giải quyết vấn đề type-mismatch và tăng tính linh hoạt khi tái sử dụng.

---

## 7. State Management

### 7.1 State Management Strategy

| Type | Solution | Use Case |
|------|----------|----------|
| **Server State** | Supabase + React Query | Database data, cache |
| **URL State** | Next.js searchParams | Filters, pagination, tabs |
| **Local State** | useState | Form inputs, modals, toggles |
| **Context** | React Context | Theme, locale, auth user |
| **Global State** | Not needed | Keep simple |

**Decision**: No Redux/Zustand - React Server Components reduce client state needs.

### 7.2 Caching Strategy

```typescript
// Next.js built-in cache
// Cache data for 1 hour, revalidate after
export const revalidate = 3600;

async function getData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 }
  });
  return res.json();
}

// On-demand revalidation (after mutations)
import { revalidatePath, revalidateTag } from 'next/cache';

revalidatePath('/tin-tuc');
revalidateTag('news');
```

---

## 8. API Design

### 8.1 API Architecture

**Primary API**: Supabase Auto-generated REST API

```
GET    /rest/v1/news?select=*&status=eq.published
POST   /rest/v1/transactions
PATCH  /rest/v1/events?id=eq.123
DELETE /rest/v1/news?id=eq.456
```

**Custom APIs**: Next.js API Routes (rare, for webhooks)

```
POST   /api/webhooks/stripe
POST   /api/send-email
GET    /api/health
GET    /api/sections/about        # Trả về mapped data cho About sections
```

### 8.2 Smart Content Mapping (lib/utils/autoMapAboutSections.ts)

Để hỗ trợ đa chi nhánh mà không yêu cầu Admin cấu hình thủ công từng khối, hệ thống sử dụng cơ chế **Smart Mapping**:
1. **Priority 1**: Admin chọn trực tiếp ID bài viết (Override).
2. **Priority 2**: Khớp theo `key` cấu hình trong `site_settings` (Vd: `about_intro_key`).
3. **Priority 3**: Khớp từ khóa ngữ nghĩa (Semantic Keywords) trong `key` hoặc `title` bài viết (Vd: "lich-su", "tru-tri", "kien-truc").
4. **Priority 4**: Fallback theo vị trí mặc định trong danh sách bài viết.

### 8.3 API Naming Conventions

| Resource | Endpoint | Method | Description |
|----------|----------|--------|-------------|
| News | `/rest/v1/news` | GET | List news |
| News | `/rest/v1/news?id=eq.{id}` | GET | Get one |
| News | `/rest/v1/news` | POST | Create |
| News | `/rest/v1/news?id=eq.{id}` | PATCH | Update |
| News | `/rest/v1/news?id=eq.{id}` | DELETE | Delete |

---

## 9. Authentication & Authorization

### 9.1 Auth Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER LOGIN                                                    │
│    • Email/Password (Supabase Auth)                             │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. SUPABASE AUTH                                                 │
│    • Verify credentials                                         │
│    • Issue JWT token                                            │
│    • Set secure cookie                                          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. MIDDLEWARE CHECK (every request)                             │
│    • Read JWT from cookie                                       │
│    • Verify signature                                           │
│    • Check expiry                                               │
│    • Attach user to request                                     │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. ROLE-BASED ACCESS                                             │
│    • Check user.role === 'admin'                                │
│    • Allow/Deny access to /admin routes                         │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Authorization Levels

| Role | Access | Permissions |
|------|--------|------------|
| **Anonymous** | Public pages | Read published content |
| **User** | Login required | Register for events, donate |
| **Admin** | /admin/* | Full CRUD, approvals, settings |

### 9.3 Multi-tenant Admin Context (McAaron)

The system distinguishes between traditional Tenant admins and the **Minh Châu Foundation (McAaron)** corporate admin.

**McAaron Specifics:**
- **Sidebar**: Uses `BusinessSidebar` (professional SaaS style) instead of `BusinessSidebar`.
- **Dashboard**: Professional business-oriented UI with corporate-specific KPIs.
- **Layout Designer**: Groups blocks into a "Business" category, prioritizing corporate-specific sections (Founder, Impact, Solutions).
- **Branding**: Dynamic switching of sidebars and headers based on `tenant_id === 'mcaaron'`.

---

## 10. Internationalization

### 10.1 i18n Architecture

**Routing Strategy**: Path-based locales

```
/vi/tin-tuc      → Vietnamese news
/km/tin-tuc      → Khmer news (translated URL)
/en/news         → English news
/transactions/hang-muc-du-an → Unified Projects listing (formerly Projects)
```

**Translation Sources**:
1. **UI Text**: `messages/{locale}.json` (next-intl)
2. **Database Content**: Columns `title_vi`, `title_km`, `title_en`

### 10.2 Translation Workflow

```typescript
// 1. Static UI text
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('HomePage');
  return <h1>{t('title')}</h1>;
}

// 2. Dynamic database content
function NewsCard({ news, locale }) {
  const title = news[`title_${locale}`];
  return <h2>{title}</h2>;
}
```

---

## 11. Performance Optimization

### 11.1 Optimization Strategies

| Strategy | Implementation | Impact |
|----------|---------------|--------|
| **Code Splitting** | Dynamic imports | -30% initial bundle |
| **Lazy Loading** | React.lazy for heavy components | Faster TTI |
| **Image Optimization** | Next.js Image, WebP/AVIF | -60% image size |
| **Font Optimization** | next/font | No layout shift |
| **Bundle Analysis** | @next/bundle-analyzer | Identify bloat |
| **Server Components** | Default for all pages | Zero-bundle by default |

### 11.2 Lazy Loading Configuration

```typescript
// components/lazy/index.ts
export const LightboxViewer = dynamic(
  () => import('yet-another-react-lightbox'),
  { ssr: false, loading: () => <Skeleton /> }
);

export const RichTextEditor = dynamic(
  () => import('@tiptap/react'),
  { ssr: false }
);

export const CalendarGrid = dynamic(
  () => import('../ui/calendar-grid'),
  { loading: () => <CalendarSkeleton /> }
);
```

### 11.3 Hybrid Block Registry Optimization

Registry (`lib/registry/traditional.ts`) được thiết kế để cân bằng giữa hiệu năng Cold Start và tính linh hoạt:
- **Standard Blocks**: Import tĩnh để đảm bảo Render cực nhanh cho 80% trường hợp sử dụng.
- **Heavy Artistic Blocks** (Vd: Mandala, Parallax): Được đăng ký với Metadata nhẹ nhưng chỉ load code thực tế khi được render trên trang. Điều này giúp Vercel Function giữ được kích thước nhỏ (< 1MB) ngay cả khi thư viện linh kiện lên đến hàng trăm khối.

---

## 12. Security Architecture

### 12.1 Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. NETWORK SECURITY                                              │
│    • HTTPS only (Vercel)                                        │
│    • DDoS protection (Vercel)                                   │
│    • Rate limiting (Future)                                     │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. APPLICATION SECURITY                                          │
│    • Security headers (CSP, HSTS, X-Frame-Options)              │
│    • Input validation (Zod)                                     │
│    • XSS protection (React escaping)                            │
│    • CSRF protection (SameSite cookies)                         │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. AUTHENTICATION                                                │
│    • JWT tokens (Supabase Auth)                                 │
│    • Secure cookies (httpOnly, secure)                          │
│    • Session management                                         │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. DATABASE SECURITY                                             │
│    • Row Level Security (RLS)                                   │
│    • Prepared statements (SQL injection protection)             │
│    • Encrypted at rest (Supabase)                               │
│    • Encrypted in transit (TLS)                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 12.2 Security Headers

```typescript
// next.config.ts
headers: async () => [
  {
    source: '/:path*',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains'
      },
      {
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
      }
    ]
  }
]
```

---

## 13. Deployment Architecture

### 13.1 Deployment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ DEVELOPMENT                                                      │
│    • Local dev (npm run dev)                                    │
│    • Hot reload (Turbopack)                                     │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ GIT PUSH TO MAIN                                                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ VERCEL AUTO-DEPLOY                                               │
│    • Build (npm run build)                                      │
│    • Run tests (npm test)                                       │
│    • Generate static pages                                      │
│    • Upload to Edge Network                                     │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ PRODUCTION (Multi-region CDN)                                    │
│    • Edge caching                                               │
│    • Auto-scaling                                               │
│    • Zero-downtime deploys                                      │
└─────────────────────────────────────────────────────────────────┘
```

### 13.2 Environment Configuration

| Environment | Branch | URL | Purpose |
|------------|---------|-----|---------|
| **Production** | main | chantarangsay.org, mcaaron-new.vercel.app | Live Ecosystem |
| **Preview** | feature/* | auto-generated.vercel.app | PR previews |
| **Development** | local | localhost:3000 | Local dev |

---

## 14. Monitoring & Observability

### 14.1 Monitoring Stack

```
┌─────────────────────────────────────────────────────────────────┐
│ APPLICATION METRICS                                              │
│    • Sentry (Error tracking, Performance monitoring)            │
│    • PostHog (User analytics, Feature flags)                    │
│    • Vercel Analytics (Core Web Vitals, Real User Metrics)      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ DATABASE METRICS                                                 │
│    • Supabase Dashboard (Query performance, Connection pool)    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ LOGS                                                             │
│    • Vercel Logs (Server logs, Build logs)                      │
│    • Sentry Breadcrumbs (User actions leading to errors)        │
└─────────────────────────────────────────────────────────────────┘
```

### 14.2 Key Metrics

| Metric | Target | Monitoring |
|--------|--------|-----------|
| **Page Load Time** | < 2s | Vercel Analytics |
| **Error Rate** | < 0.5% | Sentry |
| **API Latency** | < 300ms | Supabase Dashboard |
| **Uptime** | > 99.9% | Vercel |
| **Core Web Vitals** | All Green | Lighthouse CI |

---

## 📝 Conclusion

This architecture is designed for:
- ✅ **Performance**: Server-first, edge-cached, optimized bundles
- ✅ **Scalability**: Serverless, auto-scaling, horizontally scalable database
- ✅ **Security**: Defense in depth with multiple security layers
- ✅ **Maintainability**: Feature-based structure, TypeScript, comprehensive tests
- ✅ **Developer Experience**: Modern tooling, fast feedback loops, great DX

---

**Next Steps**:
- See [API_DOCS.md](./API_DOCS.md) for database schema and API reference
- See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines
- See [../README.md](../README.md) for setup instructions

---

<div align="center">
  <p>🛕 Namo Buddhaya 🙏</p>
</div>
