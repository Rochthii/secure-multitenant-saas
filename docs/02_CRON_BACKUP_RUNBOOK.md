# 02 — Cron & Backup Runbook

**Tài liệu chuẩn vận hành định kỳ (Canonical v2)**  
**Cập nhật:** 2026-03-14

---

## 1) Lịch cron hiện tại

Theo `vercel.json`:

- `0 3 * * *` → `/api/cron/backup`
- `0 2 * * *` → `/api/cron/send-event-reminders`
- `0 1 * * *` → `/api/cron/publish-scheduled`

Lưu ý: Route `GET`/`POST` được xử lý khác nhau theo từng endpoint, cần kiểm tra code route trước khi đổi scheduler.

---

## 2) Route định kỳ và mục đích

### 2.1 `/api/cron/backup`

Mục đích:

- Export nhiều bảng dữ liệu thành JSON.
- Upload lên bucket `backups` của Supabase Storage.
- Auto rotation, giữ tối đa 30 file gần nhất.
- Ghi audit log hệ thống.

Điểm cần chú ý:

- Bắt buộc `CRON_SECRET`.
- Dùng header `Authorization: Bearer <CRON_SECRET>`.

### 2.2 `/api/cron/publish-scheduled`

Mục đích:

- Tự động publish bài `news` có `status = scheduled` và `scheduled_at <= now`.
- Ghi audit log batch sau khi publish.

Điểm cần chú ý:

- Có kiểm tra `CRON_SECRET`.
- Có cả `GET` gọi vào `POST` để tương thích cron invoker.

### 2.3 `/api/cron/send-event-reminders`

Mục đích:

- Gửi email nhắc sự kiện ngày mai cho đăng ký đã confirm.
- Dùng Resend API.

Điểm cần chú ý:

- Cần `RESEND_API_KEY`.
- Cần `CRON_SECRET` nếu đang bật verify.
- Dùng timezone Việt Nam để xác định “ngày mai”.

---

## 3) Route backup thủ công cho admin

### `/api/admin/backup`

- Bảo vệ bằng `requireAdmin()`.
- Trả JSON backup để tải/đối chiếu.
- Ghi audit log backup.

Kịch bản dùng:

- Trước migration có rủi ro.
- Trước refactor lớn cho module nội dung.

---

## 4) Quy trình kiểm tra cron sau deploy

1. Kiểm tra Vercel cron đã sync đúng schedule.
2. Trigger thủ công từng route bằng request đã ký/đủ quyền.
3. Quan sát log:
   - Success marker của route.
   - Số bản ghi xử lý.
   - Thời gian chạy.
4. Xác nhận side effects:
   - Backup file xuất hiện trong bucket.
   - News scheduled chuyển published.
   - Email reminder có số lượng gửi hợp lệ.

---

## 5) Quy trình khôi phục từ backup (mức ứng dụng)

Lưu ý: Hệ thống hiện tạo snapshot JSON theo bảng, không phải full physical backup của Postgres WAL.

Quy trình đề xuất:

1. Xác định thời điểm lỗi.
2. Chọn file backup gần nhất trước thời điểm lỗi.
3. Restore có chọn lọc theo bảng/bản ghi quan trọng (không overwrite toàn bộ nếu không cần).
4. Sau restore: chạy kiểm tra integrity theo tenant.
5. Revalidate tag/path liên quan để đồng bộ cache.

---

## 6) Sự cố và cách xử lý nhanh

### 6.1 `401 Unauthorized` trên cron

- Kiểm tra `CRON_SECRET` ở runtime.
- Kiểm tra format header có đúng `Bearer <token>`.

### 6.2 Backup upload lỗi bucket

- Kiểm tra bucket `backups` tồn tại.
- Route có logic tạo bucket fallback, kiểm tra quyền service/runtime có đủ.

### 6.3 Publish scheduled không có tác dụng

- Kiểm tra dữ liệu `status='scheduled'` và `scheduled_at` hợp lệ.
- Kiểm tra timezone khi nhập lịch đăng.

### 6.4 Reminder không gửi email

- Kiểm tra `RESEND_API_KEY`.
- Kiểm tra email đã `confirmed` và không null.

---

## 7) Hardening backlog (khuyến nghị)

- Chuẩn hóa method cho tất cả cron routes.
- Thêm idempotency key cho job dài.
- Thêm alerting khi job fail liên tiếp.
- Chuẩn hóa metric: duration, success_count, error_count.
