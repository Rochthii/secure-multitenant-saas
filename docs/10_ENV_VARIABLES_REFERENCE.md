# 10 — Environment Variables Reference

**Cập nhật gần nhất:** 2026-03-14  
**Mục tiêu:** Tập trung toàn bộ biến môi trường production theo nhóm chức năng và mức độ bắt buộc.

---

## 1) Nhóm bắt buộc (production)

## 1.1 Supabase core

- `NEXT_PUBLIC_SUPABASE_URL`  
  Dùng cho client/server query phổ biến, tenant resolver, search API.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
  Dùng cho các truy vấn an toàn theo RLS và public access.
- `SUPABASE_SERVICE_ROLE_KEY`  
  Dùng cho admin client, cron thao tác hệ thống, script seed/migration hỗ trợ.

**Thiếu nhóm này:** hệ thống không thể truy cập dữ liệu ổn định.

## 1.2 Revalidate và cron

- `REVALIDATE_SECRET`  
  Bắt buộc cho endpoint `/api/revalidate` (HMAC + timestamp).
- `CRON_SECRET`  
  Bắt buộc cho các route cron có bảo vệ bearer token.

**Thiếu nhóm này:** nội dung stale kéo dài, cron có thể bị chặn 401 hoặc mở rủi ro bảo mật.

---

## 2) Nhóm email, thông báo và AI

- `RESEND_API_KEY`  
  Dùng cho gửi email nhắc sự kiện và email hệ thống.
- `GEMINI_API_KEY`  
  Dùng chính cho Chat RAG, Embedding tài liệu (1536px) và Router Agent.
- `GEMINI_API_KEY_2`  
  Dùng làm dự phòng (Fallback) khi API Key chính hết hạn mức (Quota).
- `GROQ_API_KEY`  
  Dùng cho mô hình Llama 3 70B thông qua Groq, phục vụ cơ chế Failover khi hệ thống Gemini gặp sự cố toàn diện.

**Lưu ý:** Tất cả các biến này phải được thiết lập trong **Supabase Secrets** (`supabase secrets set`) để các Edge Functions có thể truy cập ở runtime.

---

## 3) Nhóm monitoring và analytics

- `NEXT_PUBLIC_SENTRY_DSN`  
  Gửi lỗi từ client/server/edge vào Sentry.
- `NEXT_PUBLIC_POSTHOG_KEY`  
  Kích hoạt analytics PostHog.
- `NEXT_PUBLIC_POSTHOG_HOST`  
  Host nhận sự kiện PostHog.

---

## 4) Nhóm Firebase (push/noti)

## 4.1 Firebase client (public)

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY`

## 4.2 Firebase server/admin

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string, tùy cách cấu hình)

---

## 5) Nhóm URL và môi trường runtime

- `NEXT_PUBLIC_SITE_URL`  
  Dùng cho canonical URL/SEO/email template.
- `NODE_ENV`  
  Điều khiển nhánh logic development/production.
- `CI`  
  Điều khiển hành vi test (Playwright/Vitest trong pipeline).
- `PLAYWRIGHT_TEST_BASE_URL`  
  Base URL cho E2E tests.
- `ANALYZE`  
  Bật bundle analyzer khi cần kiểm tra tối ưu build.

---

## 6) Nhóm secret phụ trợ

- `SEED_SECRET`  
  Dùng cho endpoint seed có bảo vệ (fallback cùng `REVALIDATE_SECRET` ở một số route).

---

## 7) Kiểm tra trước deploy

1. So sánh danh sách env giữa local/staging/production.
2. Xác nhận secret không rỗng, không dùng placeholder.
3. Xác nhận tất cả biến server-only không bị lộ vào client bundle.
4. Sau deploy, kiểm tra nhanh các endpoint phụ thuộc secret: revalidate, cron, email.

---

## 8) Chính sách quản lý secret

- Chỉ cập nhật secret qua hệ thống quản lý env chính thức (Vercel/Supabase secrets).
- Không commit secret vào repo, script tạm, hoặc file log.
- Rotate định kỳ cho `CRON_SECRET`, `REVALIDATE_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` theo chu kỳ vận hành.
- Sau khi rotate, chạy smoke test đầy đủ các luồng liên quan trong 30 phút đầu.
