# 05 — Admin Features Specification

> **Tài liệu chuẩn chức năng admin — Đồ Án Tốt Nghiệp PTIT**  
> **Đề tài:** Secure Multi-tenant SaaS: Áp dụng RLS và Audit Log trong quản trị rủi ro thông tin.  
> **Cập nhật:** 2026-05-16

---

## 1) Phạm vi

Mô tả toàn bộ surface admin theo route thực tế trong `app/admin/**`, kèm mapping tới server actions tương ứng và các cơ chế quyền/tenant.

---

## 2) Kiến trúc admin

### 2.1 Hai lớp admin route

- Global admin zone: `app/admin/**` (dashboard hệ thống, SOC, users, tenants, organizations...).
- Tenant admin zone: `app/admin/t/[tenant_id]/**` (quản trị nội dung theo từng chi nhánh/tổ chức).

### 2.2 Guard chính

- Role guard: `requireAdmin`, `requireEditor`, `requireVolunteer`, `requirePermission`.
- Tenant guard: `requireTenantAccess`, `enforceTenantScopeForRecord`.

---

## 3) Danh mục module admin

### 3.1 Global/system modules

- `admin/dashboard`
- `admin/analytics`
- `admin/tenants`, `admin/tenants/new`, `admin/tenants/[id]`, `admin/tenants/[id]/theme`
- `admin/users`, `admin/users/invite`, `admin/users/[id]`
- `admin/organizations`, `admin/organizations/new`, `admin/organizations/[id]`
- `admin/approvals`, `admin/pending`
- **An ninh & Giám sát (SOC):**
  - `admin/security-center` — **SOC Dashboard:** Security Score, Activity Timeline, Anomaly Alerts, RLS Coverage
  - `admin/audit-logs` — Nhật ký Kiểm toán (Audit Trail): toàn bộ hành động hệ thống
- `admin/page-builder`
- `admin/backup` — Backup & Restore (DR)
- **Tài chính & Ngân sách:**
  - `admin/finance/transactions` (Review, Approval, Export)
  - `admin/finance/projects` (Quản lý Dự án & Chiến dịch)
  - `admin/finance/bank-accounts` (Tài khoản Ngân hàng & QR)
- **Nội dung & Tài liệu:**
  - `admin/media` (Kho Tài liệu số)
  - `admin/categories` (Phân loại & Danh mục)
  - `admin/documents` (Tài liệu Nội bộ)

### 3.2 Tenant-scoped modules (`admin/t/[tenant_id]/*`)

- Dashboard chi nhánh
- Thông báo nội bộ (News)
- Sự kiện & Lịch hoạt động
- Tài liệu nội bộ
- Kho tài liệu số (Media)
- Trang quản trị (Pages)
- Danh mục
- FAQ
- Giới thiệu chi nhánh
- Trang chủ + Slides + Preview
- Ngân sách + Dự án
- Cấu hình (general/domain/bank)

---

## 4) Luồng nghiệp vụ chính theo module

### 4.1 News management

Actions chính: `createNews`, `updateNews`, `deleteNews`, approve/reject-related actions.

Đặc điểm:

- Editor/volunteer có thể tạo bài theo permission matrix.
- Trạng thái có luồng `draft` → `pending_review` → `published`.
- Có hỗ trợ `scheduled_at` và `published_to` (broadcast multi-tenant).
- Save revision + audit log + notifications + revalidation đa tenant.

### 4.2 Events management

Actions: `createEvent`, `updateEvent`, `deleteEvent`, `approveEvent`, `rejectEvent`.

Đặc điểm:

- Tenant scope được ép theo user context khi cần.
- Revalidate trang/metrics theo tenant sau mutate.
- Save revision/audit tương tự news.

### 4.3 Ngân sách & Quỹ nội bộ (Unified Project Flow)

Actions: `confirmTransaction`, `cancelTransaction`, `updateTransactionStatus`, export reports, `createProject`, `updateProject`.

Đặc điểm:

- Quản lý tập trung toàn bộ ngân sách qua hệ thống **Dự án / Chiến dịch (Projects)**.
- Gộp mục đích và dự án vào một bảng `transaction_projects`.
- Hỗ trợ gán tài khoản ngân hàng cụ thể cho từng Chiến dịch.
- Tự động cộng/trừ `current_amount` theo trạng thái confirmed.
- Admin chi nhánh (`tenant_admin`) có quyền **Xem (Read Only)** để đảm bảo minh bạch.
- Tính năng xuất báo cáo Excel/PDF động lọc theo Chiến dịch và thời gian.
- **Audit Trail:** Mọi thay đổi trạng thái tài chính đều ghi audit_logs.
- Revalidate tag dashboard + transactions list.

### 4.4 Pages/CMS structure

Actions: `createPage`, `updatePage`, `deletePage`, `updatePageStructure`.

Đặc điểm:

- Quản lý page tree qua `parent_id` + `order_index`.
- Có save revision khi update.

### 4.5 Media management

Actions/API: `updateMediaMetadata`, `deleteMedia`, API link/youtube upload helpers.

Đặc điểm:

- Metadata update theo schema.
- Xóa media cố gắng dọn Cloudinary trước khi xóa DB record.
- **Digital Library Broadcasting (New):**
  - Hỗ trợ `published_to` (UUID[]) để chia sẻ tài liệu/video cho nhiều chi nhánh.
  - Tự động hiển thị tại Dashboard của chi nhánh được chia sẻ.
  - Chỉ cho phép Super Admin điều chỉnh mục tiêu phát sóng (broadcast targets).

### 4.6 Tenant/System settings

Actions: `updateSettings`, tenant CRUD actions.

Đặc điểm:

- Cross-tenant modifications bị chặn qua context guard.
- Đồng bộ theme/site settings + tenant config.
- Revalidate layout-level cache.

- Revalidate layout-level cache.

### 4.7 Visual Page Builder Enhancements
- **Mapping Key Overrides**: Cho phép Admin tùy chỉnh từ khóa ánh xạ nội dung (introKey, abbotKey, architectureKey) trực tiếp trong giao diện cấu hình khối (Block Settings), giúp kiểm soát chính xác bài viết nào được hiển thị trong các khối Mosaic tự động.
- **Hệ thống Danh mục chuẩn hóa (V3)**:
  - **Component**: `CustomCategorySelect` hỗ trợ chọn danh mục phân cấp (hierarchical).
  - **Phân tách Tab**: Tự động chia danh mục thành "Hệ thống" (Global) và "Tổ chức/Chi nhánh" (Local).
  - **Bộ lọc thông minh**: Bộ lọc danh mục trên trang danh sách (Events, Media) hỗ trợ URL params, ghi nhớ trạng thái lọc và hiển thị nhãn nguồn gốc (phân biệt giữa các chi nhánh ở chế độ Global Admin).
- **Modernized Projects UI (V2)**:
  - **Giao diện Biên tập**: Nâng cấp màn hình thêm/sửa Dự án với Layout chuyên nghiệp (trái là nội dung, phải là metadata), tương đồng với module Tin tức và Pháp thoại.
  - **Input tối ưu**: Sử dụng bộ input hiện đại cho tên dự án, mô tả, mục tiêu tài chính và thời hạn, giúp giảm thiểu sai sót khi nhập liệu.
  - **Branding Consistency**: Tích hợp hiển thị logo và thông tin chi nhánh nguồn gốc ngay trong trình biên tập để tăng tính nhận diện.
- **Quản trị tri thức AI & RAG (New):**
  - **PDF Parser**: Chức năng bóc tách đoạn văn từ file PDF kinh sách cổ (với thư viện xử lý 2026).
  - **Semantic Indexing**: Tự động chuyển đổi các đoạn văn thành Vector 768 chiều (Gemini) và lưu vào bảng `dharma_embeddings`.
  - **Validation**: Cho phép Admin kiểm tra các đoạn context đã được nạp trước khi đưa vào chatbot.
  - **RBAC Security Restriction**:
    - Chỉ **Super Admin** mới có quyền cấu hình Layout `ai_portal`.
    - Việc tạo/cập nhật Tenant với layout AI được bảo vệ bởi server action validation (`requireSuperAdmin`).

---

---

## 5) Cross-cutting concerns bắt buộc trong admin actions

1. AuthN/AuthZ guard đầu action.
2. Validation payload (schema-based).
3. Tenant scope enforcement cho mutate record.
4. Audit log ghi lại actor + old/new data.
5. Revalidate cache/path phù hợp.

---

## 6) Approval & collaboration flows

- Cộng tác viên/biên tập viên tạo nội dung ở trạng thái chờ duyệt.
- Admin cấp cao thực hiện approve/reject.
- Khi publish thành công có thể phát thông báo user/admin tùy workflow.

---

## 7) Runbook mini cho admin incidents

### 7.1 Admin không thấy dữ liệu tenant của mình

- Kiểm tra `user_roles.tenant_id`.
- Kiểm tra route đang vào đúng `tenant_id`.
- Kiểm tra guard `requireTenantAccess`.

### 7.2 Lưu thành công nhưng giao diện chưa cập nhật

- Kiểm tra action đã gọi revalidate tag/path.
- Kiểm tra cache tag theo tenant có khớp key.

### 7.3 Không thể delete/update record

- Khả năng cao bị chặn bởi `enforceTenantScopeForRecord` hoặc permission matrix.

---

## 8) Checklist khi thêm module admin mới

1. Đặt module vào global zone hay tenant zone rõ ràng.
2. Định nghĩa quyền `resource/action` trước khi build UI.
3. Tạo action server-first (không gọi trực tiếp service role ở client).
4. Bổ sung audit + revalidate.
5. Cập nhật docs admin + API/actions catalog.
