# 06 — API & Server Actions Catalog

**Catalog chuẩn endpoint/action (Canonical v2)**  
**Cập nhật:** 2026-05-23

---

## 1) Nguyên tắc đọc catalog

- API routes: `app/api/**/route.ts`
- Server actions: `app/actions/**/*.ts`
- Mỗi mục ghi rõ mục đích, auth, input/output và side-effects chính.

---

## 2) API Routes Catalog

### 2.1 Public/Content APIs

#### `GET /api/search`
- Mục đích: tìm kiếm toàn cục theo tenant.
- Auth: public.
- Input: query `q`, `limit`, `tenant` (dev fallback).
- Side-effects: không mutate, có cache header ngắn.

#### `GET /api/sections/news-events`
- Mục đích: cấp dữ liệu section trang chủ (news/events).
- Auth: public.
- Side-effects: không mutate.

#### `GET /api/sections/categories`
- Mục đích: danh mục tin (news categories) theo tenant.
- Auth: public.

#### `GET /api/sections/about`
- Mục đích: about sections theo tenant.
- Auth: public.

### 2.2 Newsletter/Notifications

#### `POST /api/newsletter/subscribe`
- Mục đích: đăng ký nhận bản tin.
- Auth: public.
- Guard: rate limit + duplicate check.

#### `POST /api/notifications/send`
- Mục đích: gửi push notifications tới token theo tenant/global.
- Auth: yêu cầu role admin trở lên.

### 2.3 Revalidation & Webhooks

#### `POST /api/revalidate`
- Mục đích: invalidation cache theo event type.
- Auth: HMAC signature + timestamp + rate limit.
- Types: `news_updated`, `event_updated`, `about_updated`, `dharma_talk_updated`, `transaction_project_updated`, `tenant_settings_updated`.

### 2.4 Cron APIs

#### `GET /api/cron/backup`
- Mục đích: backup JSON định kỳ + rotate + audit.
- Auth: `CRON_SECRET`.

#### `GET|POST /api/cron/publish-scheduled`
- Mục đích: publish bài news đã schedule.
- Auth: `CRON_SECRET`.

#### `POST /api/cron/send-event-reminders`
- Mục đích: gửi email reminder sự kiện ngày mai.
- Auth: `CRON_SECRET`.
- Phụ thuộc: `RESEND_API_KEY`.

#### `GET /api/cron/backup-db`
- Mục đích: backup DB variant (route legacy/tùy môi trường).

### 2.5 Admin Utilities APIs

#### `GET /api/admin/backup`
- Mục đích: tạo backup thủ công có kiểm soát admin.
- Auth: `requireAdmin`.

#### `POST /api/admin/media/youtube`
- Mục đích: thêm media YouTube vào thư viện.
- Auth: admin.

#### `POST /api/admin/media/link`
- Mục đích: thêm media từ URL ngoài, auto-detect type/source.
- Auth: editor/admin.

### 2.6 Misc/ops APIs

#### `GET /api/warmup`
- Mục đích: ping DB tránh cold-start/free-tier sleep.
- Auth: `CRON_SECRET` nếu cấu hình.

#### `POST /api/ai/seo-suggest`
- Mục đích: gợi ý SEO metadata bằng Gemini.
- Auth: user đăng nhập.
- Guard: rate limit in-memory theo IP.

#### `GET /api/seed-khleang`
- Mục đích: seed dữ liệu tenant mẫu.
- Auth: secret query (`REVALIDATE_SECRET`/`SEED_SECRET`).
- Lưu ý: route công cụ vận hành, không dùng cho public traffic.

### 2.7 Admin Security APIs (v1.4.0)

#### `GET /api/admin/security/worm-vault`
- Mục đích: Kiểm tra tính toàn vẹn của WORM Audit Ledger (SHA-256 hash-chaining).
- Auth: `requireSuperAdmin`.
- Output: `{ ledger_size, last_hash, integrity: "VERIFIED" | "CORRUPTED", verified_at }`.

#### `POST /api/admin/security/worm-vault`
- Mục đích: Ghi một audit entry mới vào ledger bất biến.
- Auth: `requireSuperAdmin`.
- Input: `{ actor, action, resource, tenant_id?, metadata? }`.
- Side-effects: Append entry vào `storage/worm_vault/immutable_ledger.json` với hash-chaining, set file `0o444`.

#### `GET /api/admin/security/tenant-pooler`
- Mục đích: Trả về thống kê connection slot hiện tại của tất cả tenant.
- Auth: `requireSuperAdmin`.
- Output: `{ stats: [{ tenantId, tier, active, limit, utilization_pct }]... }`.

#### `POST /api/admin/security/tenant-pooler`
- Mục đích: Thực hiện hành động kiểm thử hoặc quản trị pool.
- Auth: `requireSuperAdmin`.
- Actions:
  - `simulate_flood`: Kích hoạt DDoS simulation (tất cả tenant Free đầy slot).
  - `release`: Giải phóng slot theo `tenantId`.
- Side-effects: Thay đổi in-memory pool state, ghi audit log.

---

## 3) Server Actions Catalog (Public)

### 3.1 `createTransaction`
- File: `app/actions/create-transaction.ts`
- Input: transaction form data.
- Guard: rate limit + schema validation + tenant host check.
- Output: `{ success, transaction?, error? }`.

### 3.2 `registerForEvent`
- File: `app/actions/register-event.ts`
- Guard: rate limit + event validity/capacity checks.
- Side-effects: insert registration, audit log, increment participants, gửi email.

### 3.3 `submitContactForm`
- File: `app/actions/submit-contact.ts`
- Guard: rate limit + Zod validation.
- Side-effects: insert contact message + audit.

### 3.4 Các action public khác
- `transactions.ts`, `upload-receipt.ts`, `search.ts`, `get-faqs.ts`, `auth.ts`.
- Mục tiêu chính: truy vấn/phụ trợ UI hoặc xử lý bước liên quan public flow.

---

## 4) Server Actions Catalog (Admin)

Nhóm action trong `app/actions/admin/` gồm:

- Nội dung: `news.ts`, `events.ts`, `dharma-talks.ts`, `faq.ts`, `pages.ts`, `about-sections.ts`
- Cấu trúc trình bày: `category.ts`, `layout-blocks.ts`, `hero-slides.ts`, `theme.ts`
- Tài nguyên media/tags: `media.ts`, `upload.ts`, `tags.ts`
- Vận hành business: `transactions.ts`, `transaction-projects.ts`, `transaction-purposes.ts`, `registrations.ts`, `contact-messages.ts`
- Quản trị tài chính (Global Finance): `finance.ts` (Quản lý Bank Accounts, báo cáo tài chính)
- Quản trị hệ thống: `tenants.ts`, `users.ts`, `organizations.ts`, `settings.ts`, `site-settings.ts`, `revisions.ts`

Mẫu chuẩn trong admin action:

1. `require*` + `requirePermission`.
2. `enforceTenantScopeForRecord` với mutate record.
3. Validate schema (`safeParse`).
4. DB mutation.
5. `createAuditLog`.
6. Revalidate tag/path.

---

## 5) Revalidation matrix (high-level)

- News mutate → revalidate news tags + homepage liên quan tenant/broadcast.
- Events mutate → revalidate event tags + dashboard stats.
- Transactions mutate → revalidate transaction tags + dashboard stats.
- Settings/theme mutate → revalidate tenant layout/config tags.

---

## 6) Error contract recommendations

Để đồng bộ toàn hệ thống, khuyến nghị trả object chuẩn cho actions:

- `success: boolean`
- `error?: string`
- `unauthorized?: boolean`
- `data?: any`

API routes giữ status code HTTP tương ứng (`400/401/409/429/500`).

---

## 7) Checklist khi thêm API/action mới

1. Xác định rõ public hay admin surface.
2. Bổ sung auth guard/rate limit theo risk.
3. Validate input bằng schema.
4. Thêm audit log nếu mutate quan trọng.
5. Bổ sung revalidation tags/path.
6. Cập nhật catalog này ngay trong PR.
