# 🚀Multi-tenant Platform

> Nền tảng website + CMS đa tenant cho chi nhánh/tổ chức cộng đồng, xây dựng trên Next.js App Router + Supabase (Postgres + RLS), tối ưu cho vận hành production với cache tag-based và runbook đầy đủ.

---

## 📚 Mục lục

- [1) Tổng quan dự án](#1-tổng-quan-dự-án)
- [2) Kiến trúc hệ thống](#2-kiến-trúc-hệ-thống)
- [3) Multi-tenant & routing](#3-multi-tenant--routing)
- [4) Chức năng public](#4-chức-năng-public)
- [5) Chức năng admin](#5-chức-năng-admin)
- [6) Data, cache và revalidation](#6-data-cache-và-revalidation)
- [7) API & server actions](#7-api--server-actions)
- [8) Bảo mật & phân quyền](#8-bảo-mật--phân-quyền)
- [9) Tech stack hiện tại](#9-tech-stack-hiện-tại)
- [10) Cài đặt và chạy local](#10-cài-đặt-và-chạy-local)
- [11) Biến môi trường](#11-biến-môi-trường)
- [12) Scripts chuẩn](#12-scripts-chuẩn)
- [13) Cron jobs production](#13-cron-jobs-production)
- [14) Cấu trúc thư mục chính](#14-cấu-trúc-thư-mục-chính)
- [15) Testing & chất lượng](#15-testing--chất-lượng)
- [16) Quy trình release khuyến nghị](#16-quy-trình-release-khuyến-nghị)
- [17) Bộ tài liệu chuẩn (Canonical)](#17-bộ-tài-liệu-chuẩn-canonical)
- [18) Ghi chú maintain](#18-ghi-chú-maintain)

---

## 1) Tổng quan dự án

- **Trợ lý Dharma Chat (AI Assistant)**: 
    - **RAG (Retrieval Augmented Generation)**: Hệ thống truy vấn tri thức sâu dựa trên kho tài liệu kinh điển PDF/Text (Kinh - Luật - Luận). Trích xuất chính xác dẫn chứng từ nguồn 'Kinh Tụng Nam Tông' và các bộ kinh Theravada tinh hoa.
    - **Neural Conversational Memory**: Kích hoạt "Siêu trí nhớ" với khả năng ghi nhớ 10 tin nhắn gần nhất và giải mã bối cảnh (follow-up questions), cho phép hội thoại sâu sắc và liên tục.
    - **Philosophical Reasoning Pipeline**: AI được huấn luyện theo quy trình "Nghiên cứu -> Tổng hợp -> Diễn giải", giúp chuyển hóa kiến thức kinh điển thành lời giải đáp dễ hiểu, gần gũi.

Hệ thống phục vụ nhiều website (tenant) trên cùng một codebase và một cụm dữ liệu trung tâm, với các đặc điểm chính:

- Resolve tenant theo domain/subdomain ở middleware.
- Public site đa ngôn ngữ `vi/km/en` theo route chuẩn `/{domain}/{locale}/...`.
- Admin có 2 lớp: global admin và tenant admin.
- Dữ liệu nhạy cảm được chặn nhiều lớp: app guard + tenant scope + Supabase RLS.
- Cache dữ liệu public bằng `unstable_cache`, invalidation theo tag/path khi mutate.
- **Tối ưu SEO & Discovery (Mới)**: Kiến trúc sitemap đa tiền thuê (XML + Hreflang), Advanced JSON-LD Schema (WebSite, FAQPage, SearchAction), và Metadata động chuẩn mực Google News.

Mục tiêu vận hành: ổn định production, SEO-friendly, dễ handoff, kiểm soát rủi ro release.

---

## 2) Kiến trúc hệ thống

### 2.1 Thành phần runtime

- **App runtime**: Next.js 16 (App Router, Server Components, Route Handlers, Server Actions)
- **Database/Auth/Storage**: Supabase (Postgres + RLS)
- **Deploy**: Vercel (region `sin1`)
- **Observability**: Sentry, Vercel Analytics/Speed Insights, PostHog (tuỳ bật)

### 2.2 Luồng tổng quát

```text
Browser
  ↓
Next.js App Router (Vercel)
  ├─ Public routes: app/[domain]/[locale]/**
  ├─ Admin routes: app/admin/**, app/admin/t/[tenant_id]/**
  └─ API routes: app/api/** (search, sections, revalidate, cron, admin utilities)
  ↓
Supabase (Postgres + Auth + Storage + RLS)
```

### 2.3 Nguyên tắc thiết kế

- Server-first cho logic nghiệp vụ.
- Guard và validation ở điểm vào mutation.
- Audit + revalidate đi kèm mutation quan trọng.
- Tách luồng public cached và admin realtime để cân bằng hiệu năng/bảo mật.

---

## 3) Multi-tenant & routing

### 3.1 Tenant resolution

`middleware.ts` xử lý:

- Đọc `Host` để xác định tenant.
- Parse locale prefix (`vi/km/en`).
- Rewrite sang cấu trúc nội bộ `/{hostname}/{path}`.
- Loại trừ static/assets/API qua matcher.

Ngoài ra có fallback hỗ trợ local/dev theo query `tenant` trong một số flow.

### 3.2 Public route pattern

- Root: `/{domain}/{locale}`
- Các nhóm chính:
  - `tin-tuc/**`
  - `lich-le/**`
  - `documents/**`
  - `transactions/**`
  - `tai-lieu-so/**`
  - `gioi-thieu/**`
  - `van-hoa/**`
  - `tim-kiem`
  - `hoi-dap`
  - `lien-he`

### 3.3 Admin route pattern

- Global admin: `app/admin/**`
- Tenant admin: `app/admin/t/[tenant_id]/**`

---

## 4) Chức năng public

### 4.1 Nội dung và trải nghiệm

- Trang chủ theo layout blocks/theme từng tenant.
- Tin tức, sự kiện, pháp thoại, thư viện số, giới thiệu, văn hoá.
- FAQ, liên hệ, tìm kiếm.

### 4.2 Các luồng chính

- **Đăng ký sự kiện**: validate + capacity check + insert registration + audit + update participants.
- **Quyên góp**: validate + tenant cross-check + purpose/project check + insert pending + audit.
- **Newsletter**: subscribe có rate limit + duplicate check.

### 4.3 i18n

- Locale prefix chuẩn trong URL.
- Message files: `messages/vi.json`, `messages/km.json`, `messages/en.json`.

---

## 5) Chức năng admin

### 5.1 Global admin modules

- Dashboard hệ thống
- Analytics
- Tenants
- Users
- Organizations
- Approvals/Pending
- Audit logs
- Page builder
- Backup utilities

### 5.2 Tenant admin modules

- Dashboard
- News
- Events/Calendar
- Dharma talks
- Media
- Pages
- Categories
- FAQ
- About sections
- Homepage/slides/preview
- Transactions/purposes/projects
- Messages
- Settings (general/domain/bank)

### 5.3 Mẫu mutation chuẩn

1. Auth guard (`require*`) + permission check.
2. Tenant scope enforcement cho record mutate.
3. Schema validation (`safeParse`).
4. DB mutation.
5. Audit log.
6. Revalidate tag/path.

---

## 6) Data, cache và revalidation

### 6.1 Data cache public

- Public queries dùng `unstable_cache` trong `lib/cache/queries.ts`.
- Cache tags chuẩn hóa tập trung tại `lib/cache/tags.ts`.

### 6.2 Revalidation strategy

- Revalidation helper ở `lib/cache/revalidate.ts`.
- Có deduplication để giảm revalidate storm.
- Tối ưu invalidate theo tenant/tag/path thay vì clear diện rộng.

### 6.3 Tag conventions (rút gọn)

- `news-*`, `events-*`, `dharma-talks-*`
- `about-*`, `about-sections-*`
- `dashboard-stats-*`
- `tenant-config-*`
- `site_settings`

---

## 7) API & server actions

### 7.1 API routes nổi bật

- Public:
  - `GET /api/search`
  - `GET /api/sections/news-events`
  - `GET /api/sections/categories`
  - `GET /api/sections/about`
- Revalidation:
  - `POST /api/revalidate`
- Cron:
  - `/api/cron/backup`
  - `/api/cron/publish-scheduled`
  - `/api/cron/send-event-reminders`
- Admin utilities:
  - `/api/admin/backup`
  - `/api/admin/media/youtube`
  - `/api/admin/media/link`

### 7.2 Server actions

- Public actions:
  - `createTransaction`
  - `registerForEvent`
  - `submitContactForm`
- Admin actions:
  - `app/actions/admin/*` theo module (news/events/transactions/settings/...)

Catalog chi tiết xem `docs/06_API_ACTIONS_CATALOG.md`.

---

## 8) Bảo mật & phân quyền

### 8.1 Các lớp bảo vệ

- Middleware gate (routing/host/locale)
- App layer RBAC + permission matrix
- Tenant scope enforcement ở mutation
- DB-level RLS trên Supabase

### 8.2 Revalidate endpoint hardening

- Rate limit
- HMAC signature + timestamp
- Replay window
- Schema validation

### 8.3 Security headers

Thiết lập tại `next.config.ts`, gồm HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.

Tài liệu đầy đủ: `docs/03_SECURITY_PERMISSIONS.md`.

---

## 9) Tech stack hiện tại

### Core

- `next@16.x`
- `react@19.x`
- `typescript@5.x`

### UI/UX

- Tailwind CSS
- Radix UI
- lucide-react
- framer-motion
- Tiptap editor

### Data/Auth/Validation

- `@supabase/supabase-js`
- `@supabase/ssr`
- `zod`
- `react-hook-form`

### i18n

- `next-intl`

### Testing

- Vitest
- Playwright

Chi tiết package đầy đủ xem `package.json`.

---

## 10) Cài đặt và chạy local

### 10.1 Yêu cầu

- Node.js >= 20
- npm >= 10
- Supabase project hợp lệ

### 10.2 Cài đặt dependencies

```bash
npm install
```

### 10.3 Chạy dev

```bash
npm run dev
```

Nếu cần xoá cache `.next`:

```bash
npm run dev:clean
```

---

## 11) Biến môi trường

### 11.1 Nhóm bắt buộc

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `REVALIDATE_SECRET`
- `CRON_SECRET`

### 11.2 Nhóm thường dùng thêm

- `RESEND_API_KEY`
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_SITE_URL`

Tham chiếu đầy đủ: `docs/10_ENV_VARIABLES_REFERENCE.md`.

---

## 12) Scripts chuẩn

### 12.1 Build/run

- `npm run dev`
- `npm run dev:clean`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run analyze`

### 12.2 Seed

- `npm run seed:news`
- `npm run seed:events`
- `npm run seed:all`

### 12.3 Unit tests (Vitest)

- `npm test`
- `npm run test:unit`
- `npm run test:watch`
- `npm run test:coverage`
- `npm run test:ui`

### 12.4 E2E (Playwright)

- `npm run test:e2e`
- `npm run test:e2e:ui`
- `npm run test:e2e:debug`

---

## 13) Cron jobs production

Theo `vercel.json`:

- `0 3 * * *` → `/api/cron/backup`
- `0 2 * * *` → `/api/cron/send-event-reminders`
- `0 1 * * *` → `/api/cron/publish-scheduled`

Runbook cron/backup: `docs/02_CRON_BACKUP_RUNBOOK.md`.

---

## 14) Cấu trúc thư mục chính

```text
app/
  [domain]/[locale]/...          # Public pages theo tenant/locale
  admin/...                      # Global admin
  admin/t/[tenant_id]/...        # Tenant admin
  api/...                        # Route handlers (public/admin/cron/revalidate)
  actions/...                    # Server actions

components/                      # UI components + sections
lib/                             # business logic, cache, auth, permissions, utils
docs/                            # Canonical docs + legacy docs
supabase/                        # migrations, SQL, seed liên quan Supabase
scripts/                         # tooling scripts cho seed/check/migration hỗ trợ
e2e/                             # Playwright tests
__tests__/                       # Unit tests
messages/                        # i18n messages (vi/km/en)
```

---

## 15) Testing & chất lượng

### 15.1 Gate tối thiểu trước release

1. `npm run lint`
2. `npm run test:unit`
3. `npm run build`

Khuyến nghị thêm:

4. `npm run test:e2e` (hoặc smoke subset)

### 15.2 Sau deploy

- Smoke test public routes theo 2–3 tenant và locale chính
- Smoke test admin CRUD cơ bản
- Kiểm tra `/api/search`, `/api/revalidate`, cron status
- Theo dõi Sentry/logs 15–30 phút đầu

---

## 16) Quy trình release khuyến nghị

1. Chốt PR + migration plan + rollback plan
2. Verify env production
3. Deploy Vercel
4. Chạy smoke tests
5. Verify cron jobs
6. Theo dõi logs/Sentry
7. Bàn giao release ticket (changelog + env diff + runbook refs)

Checklist đầy đủ: `docs/09_RELEASE_HANDOFF_CHECKLIST.md`.

---

## 17) Bộ tài liệu chuẩn (Canonical)

Điểm vào chính thức:

- `docs/_index.md`

Canonical v2:

- `docs/01_OPERATIONS_HANDBOOK.md`
- `docs/02_CRON_BACKUP_RUNBOOK.md`
- `docs/03_SECURITY_PERMISSIONS.md`
- `docs/04_PUBLIC_FEATURES.md`
- `docs/05_ADMIN_FEATURES.md`
- `docs/06_API_ACTIONS_CATALOG.md`
- `docs/07_DATABASE_MIGRATIONS_RLS.md`
- `docs/08_INCIDENT_RESPONSE_RUNBOOK.md`
- `docs/09_RELEASE_HANDOFF_CHECKLIST.md`
- `docs/10_ENV_VARIABLES_REFERENCE.md`
- `docs/11_SEV1_SCENARIOS_TEMPLATES.md`

Legacy docs vẫn được giữ để đối chiếu lịch sử, nhưng không phải nguồn chuẩn khi mâu thuẫn với canonical set.

---

## 18) Ghi chú maintain

- Không hardcode cache tags mới rải rác; ưu tiên mở rộng trong `lib/cache/tags.ts`.
- Mọi thay đổi route/API/cron/security cần cập nhật docs canonical cùng PR.
- Không bypass tenant isolation trong admin actions.
- Ưu tiên sửa ở root cause thay vì workaround ở UI.
- Khi thay đổi env/cron/revalidate flow, luôn cập nhật runbook liên quan.
