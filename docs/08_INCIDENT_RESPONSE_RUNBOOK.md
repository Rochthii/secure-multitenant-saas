# 08 — Incident Response Runbook

**Cập nhật gần nhất:** 2026-03-14  
**Mục tiêu:** Khôi phục dịch vụ nhanh, giảm ảnh hưởng người dùng, giữ đủ bằng chứng để postmortem.

---

## 1) Quy ước mức độ sự cố

### SEV-1 (Khẩn cấp)

- Public site down diện rộng (nhiều tenant không truy cập được).
- Admin không đăng nhập hoặc không thể CRUD module cốt lõi.
- Cron quan trọng hỏng liên tục (backup không chạy, publish-scheduled bị kẹt dài).

**Mục tiêu xử lý ban đầu:** ≤ 15 phút.  
**Mục tiêu khôi phục tạm thời:** ≤ 60 phút.

### SEV-2 (Cao)

- Một module lớn lỗi (search toàn tenant, transaction flow, event registration).
- Revalidate lỗi khiến dữ liệu stale dài.

**Mục tiêu xử lý ban đầu:** ≤ 30 phút.  
**Mục tiêu khôi phục:** trong ngày.

### SEV-3 (Trung bình)

- Lỗi cục bộ (một trang admin, một tenant nhỏ, lỗi hiển thị không gây mất dữ liệu).

**Mục tiêu xử lý ban đầu:** trong giờ làm việc.

---

## 2) Quy trình phản ứng chuẩn (0–30 phút)

1. **Xác nhận phạm vi:** tenant nào, locale nào, public hay admin, endpoint nào.
2. **Đóng băng thay đổi:** tạm dừng deploy mới cho đến khi rõ nguyên nhân.
3. **Thu thập log ngay:** Vercel Functions log + Sentry issue + request ID (nếu có).
4. **Phân loại SEV:** dựa trên ảnh hưởng người dùng thực tế.
5. **Thực hiện khôi phục ngắn hạn:** rollback code/env hoặc bypass tạm thời an toàn.
6. **Thông báo trạng thái:** cập nhật nội bộ mỗi 15 phút cho đến khi phục hồi.

---

## 3) Runbook theo triệu chứng chính

## 3.1 `/api/revalidate` trả 401 / 400 / 429

**Dấu hiệu**

- Admin cập nhật nội dung nhưng public không đổi.
- Log có cảnh báo Signature Mismatch, Timestamp Expired, Missing Signature/Timestamp.
- Có thể gặp 429 khi gửi quá dày.

**Kiểm tra nhanh**

1. Xác nhận `REVALIDATE_SECRET` tồn tại ở môi trường chạy.
2. Xác nhận webhook gửi đủ header `x-signature`, `x-timestamp`.
3. Kiểm tra đồng bộ thời gian hệ thống phát webhook (window ±5 phút).
4. Kiểm tra lưu lượng bất thường gây vượt rate limit (15 req/phút theo IP).

**Khôi phục**

- Sửa secret hoặc logic ký HMAC phía caller.
- Nếu lỗi do burst: giảm tần suất trigger và gom revalidate theo lô.
- Sau khi sửa: trigger lại event tương ứng để làm mới tag/path.

---

## 3.2 Cron backup lỗi 401 hoặc 500 (`/api/cron/backup`)

**Dấu hiệu**

- Không có file backup mới trong bucket `backups`.
- Log báo `Unauthorized` hoặc `Backup upload failed`.

**Kiểm tra nhanh**

1. Xác nhận `CRON_SECRET` khớp giữa scheduler và server.
2. Kiểm tra bucket `backups` tồn tại, quyền ghi ổn định.
3. Kiểm tra quota Supabase Storage và lỗi mạng tạm thời.

**Khôi phục**

- Chạy thủ công endpoint backup với token đúng để xác minh.
- Nếu bucket hỏng quyền: tạo lại bucket + xác nhận upload thành công.
- Xác nhận chính sách giữ 30 bản backup vẫn hoạt động (rotation không lỗi).

---

## 3.3 Cron publish-scheduled không tự publish (`/api/cron/publish-scheduled`)

**Dấu hiệu**

- Bài có `status=scheduled`, `scheduled_at <= now` nhưng vẫn chưa lên public.

**Kiểm tra nhanh**

1. Xác nhận cron đang gọi đúng endpoint với token hợp lệ.
2. Kiểm tra timezone trong dữ liệu lịch (`scheduled_at`) và giờ Việt Nam hiện tại.
3. Kiểm tra quyền service-role và lỗi ghi `news`/`audit_logs`.

**Khôi phục**

- Trigger thủ công endpoint để unblock ngay.
- Chuẩn hóa dữ liệu thời gian cho các bài bị lệch múi giờ.
- Nếu cần, cập nhật lại job schedule trong `vercel.json` và redeploy.

---

## 3.4 Cron nhắc sự kiện không gửi mail (`/api/cron/send-event-reminders`)

**Dấu hiệu**

- Sự kiện ngày mai có người đăng ký confirmed nhưng không nhận mail.

**Kiểm tra nhanh**

1. Xác nhận `RESEND_API_KEY` có giá trị thật (không placeholder).
2. Kiểm tra `CRON_SECRET` và log Unauthorized.
3. Kiểm tra dữ liệu event (`start_date` ngày mai) + registration status `confirmed` + email không null.
4. Kiểm tra giới hạn gửi mail từ provider.

**Khôi phục**

- Gửi lại theo batch nhỏ cho các event ảnh hưởng.
- Nếu khóa API key: rotate key và cập nhật env ngay.
- Ghi nhận danh sách email chưa gửi để xử lý bù.

---

## 3.5 Search trả rỗng sai (`/api/search`)

**Dấu hiệu**

- Người dùng tìm kiếm luôn rỗng dù có dữ liệu.
- Log báo `Tenant not found`.

**Kiểm tra nhanh**

1. Kiểm tra host header/domain mapping trong bảng `tenants`.
2. Ở local, kiểm tra query `tenant` fallback có đúng giá trị.
3. Kiểm tra dữ liệu được publish đúng tenant và index truy vấn.

**Khôi phục**

- Sửa mapping domain/subdomain trong tenant config.
- Chạy lại kiểm tra search bằng host thực tế của tenant.

---

## 3.6 Admin trả 401/403 diện rộng

**Dấu hiệu**

- Người dùng đã đăng nhập nhưng không vào được route admin hoặc action bị từ chối.

**Kiểm tra nhanh**

1. Kiểm tra session/cookie Supabase còn hiệu lực.
2. Kiểm tra role trong metadata và bảng role mapping theo tenant.
3. Kiểm tra middleware guard + `requireAdminAccess`/`checkPermission` call path.
4. Kiểm tra RLS policy có thay đổi gần đây không.

**Khôi phục**

- Khôi phục role metadata đúng chuẩn cho tài khoản ảnh hưởng.
- Nếu do migration/policy mới: rollback migration hoặc fix policy cấp tốc.

---

## 4) Danh sách endpoint ưu tiên theo dõi

- `/api/revalidate` — cache freshness và đồng bộ nội dung.
- `/api/cron/backup` — an toàn dữ liệu.
- `/api/cron/publish-scheduled` — vận hành nội dung tự động.
- `/api/cron/send-event-reminders` — trải nghiệm người đăng ký sự kiện.
- `/api/search` — trải nghiệm tìm kiếm public.
- `/api/warmup` — theo dõi readiness sau deploy.

---

## 5) Checklist đóng sự cố

- Dịch vụ đã khôi phục và được xác nhận bởi người phụ trách module.
- Đã xác nhận không còn lỗi lặp lại trong log 30–60 phút.
- Đã ghi timeline chuẩn (phát hiện, triage, khôi phục, xác minh).
- Đã tạo action item phòng ngừa tái diễn (owner + deadline).

---

## 6) Mẫu postmortem tối thiểu

1. **Tóm tắt sự cố:** ảnh hưởng gì, từ khi nào đến khi nào.
2. **Root cause kỹ thuật:** file/module/endpoint gốc gây lỗi.
3. **Khôi phục đã làm:** thứ tự thao tác và thời gian.
4. **Biện pháp phòng ngừa:** test, alert, guard, runbook cập nhật.
5. **Người chịu trách nhiệm:** owner chính và deadline.

---

## 7) Tài liệu mẫu điền nhanh

- Kịch bản SEV-1 theo tình huống + mẫu thông báo + mẫu postmortem chi tiết:
	- `docs/11_SEV1_SCENARIOS_TEMPLATES.md`

---

## 8) Ánh xạ ISO/IEC 27017 — Bảo mật Đám mây

> Tham chiếu: ISO/IEC 27017:2015 — Code of practice for information security controls based on ISO/IEC 27002 for cloud services.

### 8.1 Mô hình Trách nhiệm Chia sẻ (Shared Responsibility Model)

| Lớp | Nhà cung cấp SaaS (Chúng ta) | Tenant (Chi nhánh) |
|---|---|---|
| **Hạ tầng vật lý** | ❌ Supabase/Vercel chịu trách nhiệm | ❌ Không liên quan |
| **Mạng & Firewall** | ⚠️ Cấu hình Edge/Rate Limit | ❌ Không liên quan |
| **Xác thực (AuthN)** | ✅ Supabase Auth + Middleware guard | ⚠️ Bảo quản credential |
| **Phân quyền (AuthZ)** | ✅ RBAC + ABAC policies | ⚠️ Quản lý vai trò nội bộ |
| **Cô lập dữ liệu** | ✅ RLS + tenant_id FK + trigger | ❌ Không cần biết |
| **Mã hóa tại nghỉ** | ✅ Supabase AES-256 mặc định | ❌ Không cần biết |
| **Mã hóa truyền tải** | ✅ TLS 1.3 (Vercel Edge) | ❌ Không cần biết |
| **Sao lưu dữ liệu** | ✅ Cron backup 3AM UTC hàng ngày | ⚠️ Kiểm tra backup khi cần |
| **Nhật ký kiểm toán** | ✅ audit_logs + immutable triggers | ⚠️ Đọc log khi cần |
| **Ứng phó sự cố** | ✅ Runbook SEV-1/2/3 + postmortem | ⚠️ Báo cáo sự cố phát hiện |

### 8.2 Quy trình Xử lý Tài sản khi Chấm dứt Hợp đồng (CLD.8.1.5)

Khi một Tenant (Chi nhánh) rời khỏi hệ thống:

1. **Thông báo trước 30 ngày**: Tenant Admin nhận thông báo chính thức.
2. **Xuất dữ liệu (Data Export)**: Super Admin tạo bản export toàn bộ dữ liệu thuộc tenant_id tương ứng (news, events, transactions, media).
3. **Vô hiệu hóa truy cập**: Khóa domain mapping trong bảng `tenants`, thu hồi tất cả `user_roles` thuộc tenant.
4. **Giữ lại Audit Logs**: Nhật ký kiểm toán **KHÔNG** bị xóa — giữ vĩnh viễn phục vụ pháp lý.
5. **Xóa dữ liệu giao dịch**: Sau 90 ngày, thực hiện hard-delete dữ liệu tenant (có ghi audit log cho thao tác xóa).
6. **Xác nhận hoàn tất**: Phát hành chứng nhận xóa dữ liệu (Data Destruction Certificate).

### 8.3 Kiểm soát truy cập Đặc quyền (CLD.9.5.1)

- **RBAC**: 6 vai trò phân quyền (super_admin → tenant_accountant).
- **ABAC**: Chính sách giờ hành chính (07:00-22:00 ICT) cho tenant_editor/tenant_accountant.
- **Nguyên tắc Đặc quyền Tối thiểu**: Mỗi user chỉ 1 vai trò duy nhất (UNIQUE constraint `user_roles`).
- **Thu hồi quyền tự động**: Khi tenant bị vô hiệu hóa, RLS tự động chặn mọi truy cập.

### 8.4 Bảo vệ Nhật ký Sự kiện (CLD.12.4.1)

- **Immutability**: Bảng `audit_logs` chỉ cho phép INSERT, không UPDATE/DELETE.
- **Trigger tự động**: Mọi DELETE operation trên bảng nhạy cảm tự động ghi log TRƯỚC KHI xóa.
- **Không bypass**: Audit log được ghi qua service_role (bypass RLS), đảm bảo không ai có thể tắt logging.
- **Retention**: Dữ liệu audit log được giữ vĩnh viễn, không áp dụng auto-cleanup.

---

## 9) Chiến lược Giảm thiểu Rủi ro "Hàng xóm Ồn ào" (Noisy Neighbor)

### 9.1 Tình huống rủi ro

Trong mô hình Shared Database, một Tenant có lưu lượng truy cập đột biến (ví dụ: chiến dịch marketing viral) có thể:
- Chiếm hết connection pool của PostgreSQL.
- Làm tăng latency cho tất cả Tenant khác.
- Gây timeout cho các request admin CRUD.

### 9.2 Biện pháp đã triển khai

| Lớp | Biện pháp | File tham chiếu |
|---|---|---|
| **Cache** | `unstable_cache` với tag-based invalidation | `lib/cache/tags.ts` |
| **Deduplication** | Gom revalidate request trùng tag/path | `lib/cache/revalidate.ts` |
| **Rate Limit** | 15 req/phút/IP cho endpoint revalidate | `app/api/revalidate/route.ts` |
| **HMAC Signing** | Chữ ký SHA-256 + replay window 5 phút | `lib/revalidate-utils.ts` |
| **Database Index** | GIN index cho `published_to` UUID[] | Migration Phase 4 |
| **Connection Pool** | Supabase Pooler (PgBouncer) mặc định | Supabase infrastructure |

### 9.3 Playbook ứng phó Noisy Neighbor

1. **Phát hiện**: Latency P99 > 3s hoặc connection count > 80% pool.
2. **Xác định Tenant**: Kiểm tra `audit_logs` hoặc Vercel Analytics theo domain.
3. **Throttle**: Tăng cache TTL tạm thời cho Tenant đó (revalidate less frequently).
4. **Thông báo**: Liên hệ Tenant Admin để phối hợp giảm tải.
5. **Scale**: Nếu cần, nâng tier Supabase hoặc kích hoạt read replica.

---

## 10) Kịch bản SEV-1: Cross-tenant Data Breach

### 10.1 Dấu hiệu

- User Tenant A nhìn thấy dữ liệu (news, transactions) thuộc Tenant B.
- Audit log ghi nhận truy vấn trả về record có `tenant_id` khác tenant hiện tại của user.
- API response chứa dữ liệu không thuộc scope phân quyền.

### 10.2 Playbook 0–30 phút

1. **Phút 0–5**: Đóng băng toàn bộ API endpoint công khai. Chuyển site sang maintenance mode.
2. **Phút 5–10**: Kiểm tra RLS policies trên bảng bị ảnh hưởng (`pg_policies`). Xác nhận `get_current_tenant_id()` trả về đúng giá trị.
3. **Phút 10–15**: Kiểm tra migration gần nhất có thay đổi policy không. Diff với bản production trước đó.
4. **Phút 15–20**: Rollback migration nếu phát hiện lỗi policy. Hoặc tạo hotfix policy trực tiếp trên DB.
5. **Phút 20–30**: Kiểm tra audit_logs xem có bao nhiêu record bị leak. Ghi nhận scope ảnh hưởng.

### 10.3 Sau khôi phục

- Thông báo tất cả Tenant bị ảnh hưởng (bắt buộc theo ISO 27017 §CLD.16.1.2).
- Tạo postmortem chi tiết (bắt buộc).
- Cập nhật test suite: thêm integration test cross-tenant isolation.
- Review toàn bộ RLS policies bằng script `audit_storage_policies.ts`.
