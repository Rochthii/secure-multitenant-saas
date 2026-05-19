# 01 — Operations Handbook

> **Tài liệu chuẩn vận hành — Đồ Án Tốt Nghiệp PTIT**  
> **Đề tài:** Secure Multi-tenant SaaS: Áp dụng RLS và Audit Log trong quản trị rủi ro thông tin.  
> **Cập nhật:** 2026-05-16

---

## 1) Phạm vi

Tài liệu này mô tả vận hành hệ thống Next.js + Supabase theo mô hình multi-tenant, bao gồm:

- Môi trường chạy và biến môi trường bắt buộc.
- Build/deploy/runtime trên Vercel.
- Monitoring và quan sát lỗi.
- Kiểm tra sau deploy (post-deploy checklist).

---

## 2) Runtime kiến trúc

### 2.1 Thành phần chính

- App runtime: Next.js App Router.
- Database/Auth/Storage: Supabase.
- Error tracking: Sentry.
- Analytics: Vercel Analytics, PostHog (nếu bật).

### 2.2 Điểm kỹ thuật cần nhớ

- `middleware.ts`: resolve host/locale và rewrite đường dẫn đa tenant.
- `lib/tenant.ts`: cache cấu hình tenant theo domain/id/subdomain.
- `lib/cache/queries.ts`: cache dữ liệu public (`unstable_cache`) với tag theo tenant.
- `lib/cache/revalidate.ts`: invalidation dạng “phẫu thuật” theo tag/path.

---

## 3) Biến môi trường

### 3.1 Nhóm bắt buộc (core)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (được dùng ở các luồng backend chuyên biệt)

### 3.2 Nhóm bảo mật & cron

- `CRON_SECRET` (bảo vệ các route cron)
- `REVALIDATE_SECRET` (xác thực HMAC cho webhook revalidate)

### 3.3 Nhóm quan sát & thông báo

- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `RESEND_API_KEY` (email reminder)

### 3.4 Nhóm media (nếu dùng)

- `CLOUDINARY_URL`

---

## 4) Deploy & cấu hình production

### 4.1 Vercel

- Region cấu hình tại `vercel.json`: `sin1`.
- Cron jobs chạy theo `vercel.json` (xem runbook cron/backup).

### 4.2 Security headers

Thiết lập tại `next.config.ts` gồm:

- HSTS
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

Lưu ý: CSP hiện được ghi chú chưa bật cứng để tránh phá các tích hợp bên ngoài.

### 4.3 Images remote patterns

`next.config.ts` cho phép domain ảnh từ:

- Supabase Storage host
- `res.cloudinary.com`
- YouTube thumbnails (`img.youtube.com`, `i.ytimg.com`)
- Một số host ngoài đã whitelist

---

## 5) Build/Test tiêu chuẩn trước release

Thực thi tối thiểu:

1. `npm run lint`
2. `npm run test:unit`
3. `npm run build`

Khuyến nghị thêm trước production:

4. `npm run test:e2e` (hoặc smoke subset)

---

## 6) Monitoring & Observability

### 6.1 Sentry

- Client config: `sentry.client.config.ts`
- Server config: `sentry.server.config.ts`
- `tracesSampleRate` hiện đặt 1.0 (cần điều chỉnh theo chi phí thực tế production).

### 6.2 Analytics

- Có `@vercel/analytics` và `@vercel/speed-insights` trong dependencies.
- `lib/analytics.ts` đã giảm tải tracking thủ công để tránh tăng CPU/DB.

### 6.3 Log chiến lược

- API quan trọng có log theo tiền tố (ví dụ `REVALIDATE`, `Backup Cron`).
- Không ghi lộ secret/token ra log.

---

## 7) Post-deploy checklist (chuẩn)

1. Truy cập public route theo tenant + locale (`/vi`, `/km`, `/en`) kiểm tra rewrite.
2. Truy cập admin route và xác thực phân quyền cơ bản.
3. Kiểm tra endpoint quan trọng:
   - `/api/search`
   - `/api/revalidate` (chỉ test với chữ ký hợp lệ)
4. Kiểm tra cron status trên Vercel dashboard.
5. Kiểm tra lỗi mới trong Sentry sau 15–30 phút.

---

## 8) Sự cố thường gặp

### 8.1 Tenant resolve sai domain

- Kiểm tra header host, mapping domain/subdomain trong bảng `tenants`.
- Kiểm tra logic fallback `localhost`/`dev-tenant` tại middleware và search API.

### 8.2 Cache không cập nhật sau khi admin sửa nội dung

- Kiểm tra server action đã gọi revalidate tag/path tương ứng chưa.
- Kiểm tra dedupe window trong `lib/cache/revalidate.ts` (2 giây).

### 8.3 Cron chạy nhưng không tác dụng

- Kiểm tra `CRON_SECRET` và header Authorization.
- Kiểm tra method route (`GET`/`POST`) tương thích với job.

---

## 9) Liên kết tài liệu kế tiếp

- Cron/backup chi tiết: `docs/02_CRON_BACKUP_RUNBOOK.md`
- Bảo mật/phân quyền: `docs/03_SECURITY_PERMISSIONS.md`
- Index canonical: `docs/_index.md`
