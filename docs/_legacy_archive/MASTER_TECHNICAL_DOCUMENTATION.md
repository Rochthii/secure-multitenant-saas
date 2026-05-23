# 🌟 TÀI LIỆU KỸ THUẬT & KIẾN TRÚC TỔNG THỂ 

> ⚠️ **LEGACY DOCUMENT**  
> Tài liệu này được giữ lại cho mục đích lịch sử/đối chiếu.  
> Nguồn chuẩn hiện tại: `docs/_index.md` (Canonical v2).

**Dự án: Hệ sinh thái Quản lý Chi nhánh Đa nền tảng (Multi-tenant) & Các tự viện Nam Tông**  
**Phiên bản Tài liệu:** 2.0 (Cập nhật chuẩn bị bàn giao/Scale-up)  
**Mô hình Kiến trúc:** Headless CMS, Edge-optimized, Serverless Multi-tenant  

---

## MỤC LỤC
1. Tổng quan Hệ thống (System Overview)
2. Kiến trúc Kỹ thuật (Technical Architecture)
3. Mô hình Dữ liệu & Cơ sở dữ liệu (Database Schema)
4. Hệ thống Phân quyền (RBAC & Security)
5. Chiến lược Caching & Hiệu suất (Caching Strategy)
6. Chi tiết Luồng Tính năng (Feature Workflows)
7. Hướng dẫn Dành cho Developer (Developer Guide)

---

## 1. TỔNG QUAN HỆ THỐNG
Dự án không chỉ là một website đơn lẻ, mà là một **Hệ sinh thái Multi-tenant (SaaS-like)** cho phép khởi tạo và quản lý hàng chục website của các chi nhánh/tổ chức khác nhau (Chi nhánh A, Chi nhánh B, Chi nhánh C...) chung trên một codebase và một database duy nhất.

### 1.1 Tech Stack
*   **Framework:** Next.js 16.1.5 (App Router, Server Components, Server Actions).
*   **Ngôn ngữ:** TypeScript (Strict mode).
*   **UI/Styling:** Tailwind CSS v3/v4, Shadcn/UI, Radix UI, Framer Motion.
*   **Đa ngôn ngữ (i18n):** `next-intl` (vi, km, en).
*   **Database & Auth:** Supabase (PostgreSQL, Row Level Security, GoTrue Auth).
*   **Media Storage:** Cloudinary (tối ưu hóa ảnh/video) kết hợp Supabase Storage.
*   **Validation:** Zod (Strict validation với `.strip()`).
*   **Testing:** Vitest (Unit), Playwright (E2E).

---

## 2. KIẾN TRÚC KỸ THUẬT

### 2.1 Cơ chế Multi-tenant (Đa người thuê)
Sử dụng **Middleware** (`middleware.ts`) chạy tại tầng Edge để phân luồng người dùng:
1.  **Nhận diện Domain/Subdomain:** Middleware đọc Header `Host` (VD: `chuaphuly.vercel.app` hoặc `chantarangsay.org`).
2.  **Mapping:** Map domain thành `tenant_id` tương ứng trong Database.
3.  **Rewrite URL:** Âm thầm rewrite URL (Zero Object Allocation) về cấu trúc nội bộ: `/[tenant_domain]/[locale]/path`.
4.  **Data Isolation (Cách ly dữ liệu):** Mọi Query DB và Server Action đều bắt buộc phải kẹp `tenant_id`. Dữ liệu được bảo vệ nghiêm ngặt bằng Row Level Security (RLS) của PostgreSQL.

### 2.2 Luồng Render & Kiến trúc Layout
*   **Data Layout Tập trung (`getLayoutBlocks`, `getCachedLayoutData`):** Trang chủ được xây dựng dựa trên khái niệm **"Block-based Rendering"**. Admin chọn "Layout Style" (Truyền thống, Hiện đại, Hoa Sen...), hệ thống tự động render các component tương ứng.
*   **Dynamic Theme:** Màu sắc (Primary, Secondary, Accent) được fetch từ DB (`site_settings`) và tiêm (inject) thành CSS Variables (`--theme-primary`) tại thẻ `<body>`, giúp đổi theme realtime không cần build lại.

---

## 3. MÔ HÌNH DỮ LIỆU (DATABASE SCHEMA CORE)

Hệ thống xoay quanh bảng `tenants` (Tổ chức/Chi nhánh).

| Bảng (Table) | Chức năng cốt lõi | Ràng buộc Multi-tenant |
| :--- | :--- | :--- |
| `tenants` | Lưu domain, config theme, modules bật/tắt của từng chi nhánh. | Root table. |
| `users` (Auth) & `user_roles` | Quản lý định danh và Role. Có cột `custom_permissions` (JSONB) ghi đè quyền. | Giới hạn User thuộc về 1 `tenant_id` (trừ Super Admin). |
| `site_settings` | Key-Value store lưu cấu hình ngân hàng, mạng xã hội, tên website. | `tenant_id` + `key` là Unique. |
| `news` / `events` / `dharma_talks` | Lưu trữ nội dung. Có cơ chế Approval (Status: Draft, Pending, Published). | Bắt buộc có `tenant_id`. Hỗ trợ cột `published_to` (mảng UUID) để **Broadcast** bài viết sang chi nhánh khác. |
| `categories` | Phân loại phân cấp (Tree/Nested). | Hỗ trợ Global Category (`tenant_id = null`) hoặc Local Category. |
| `transactions` & `transaction_projects` | Quản lý quyên góp. Giao dịch map với Project mục tiêu. | Cách ly hoàn toàn theo `tenant_id`. |
| `content_revisions` | Lưu snapshot (JSONB) mỗi khi nội dung bị sửa. | Dùng để Rollback phiên bản cũ. |
| `audit_logs` | Ghi log mọi thao tác CRUD của Admin. | Traceability cho mục đích Audit. |

---

## 4. HỆ THỐNG PHÂN QUYỀN (RBAC & SECURITY)

Phân quyền được thiết kế phân tầng sâu sắc, đáp ứng mô hình Tổng Công Ty / Chi Nhánh (`lib/auth/require-admin.ts`, `lib/permissions.ts`).

### 4.1 Cấp bậc Quyền (Role Hierarchy)
1.  **Level 7 - `super_admin`:** Thượng tôn hệ thống. Quyền can thiệp DB, tạo chi nhánh mới, sửa Core Theme.
2.  **Level 6 - `company_editor`:** Biên tập viên mạng lưới (quản lý nội dung xuyên suốt các chi nhánh).
3.  **Level 5 - `tenant_admin`:** Trụ trì / Admin của 1 chi nhánh cụ thể. Toàn quyền trong phạm vi chi nhánh của mình (Không thể xem chi nhánh khác).
4.  **Level 4 - `moderator`:** Kiểm duyệt viên (duyệt bình luận, quyên góp).
5.  **Level 3 - `tenant_editor` / `editor`:** Người đăng tin, tạo sự kiện. (Đăng bài phải qua duyệt).
6.  **Level 2 - `volunteer`:** Tình nguyện viên (chỉ được viết nháp).

### 4.2 Lớp bảo mật (Defense in Depth)
*   **Bảo mật Server Actions:** Sử dụng hàm `enforceTenantScopeForRecord(tableName, recordId)` ở mọi Action (`update`, `delete`) để chặn việc Admin Chi nhánh A truyền ID giả mạo nhằm xóa dữ liệu Chi nhánh B.
*   **Bảo mật Form:** Mọi Action đều đi qua Zod Schema `.strip()`. Mọi trường (field) rác Client gửi lên sẽ bị lột bỏ trước khi chạm vào Database.
*   **Bypass RLS Warning:** Hệ thống sử dụng `getPublicClient` (ẩn danh) cho UI và `createClient` (có session) cho Admin. Tuyệt đối không dùng `getServiceRoleClient` trong các Query có Auth.

---

## 5. CHIẾN LƯỢC CACHING & HIỆU SUẤT ĐỈNH CAO

Đây là trái tim về hiệu năng của dự án, giúp website chịu tải hàng triệu views mà không sập Supabase.

### 5.1 Caching Vĩnh viễn (Permanent Data Cache)
*   Sử dụng `unstable_cache` của Next.js với tham số `revalidate: false` (hoặc TTL rất cao) tại `lib/cache/queries.ts`.
*   Mọi Fetch (News, Events, Settings) đều được gắn Tag theo định dạng chuẩn: `[type]-[tenant_id]` (Vd: `news-1234abcd`, `site_settings-1234abcd`).

### 5.2 Động cơ Khử trùng lặp Revalidate (Deduplication Engine)
Nằm tại `lib/cache/revalidate.ts`. Khi Editor bấm nút "Lưu" liên tục, hệ thống Revalidate Tag có thể đánh sập Vercel API. 
**Giải pháp:**
*   Sử dụng `Set<string>` và `setTimeout` (2000ms).
*   Nếu có 10 request revalidate `homepage-tenantA` trong 2 giây, hệ thống chỉ đẩy **1 request duy nhất** xuống Next.js Cache.

### 5.3 Webhook Revalidation (`app/api/revalidate/route.ts`)
Được thiết kế chống tấn công (Military-grade):
1.  **Rate Limiting:** Tối đa 15 requests / phút.
2.  **Replay Protection:** Có Header `X-Timestamp`, từ chối request cũ quá 5 phút.
3.  **HMAC Signature:** Body và Timestamp được băm SHA256 với Secret Key. Dùng `crypto.timingSafeEqual` để chống Timing Attack.

---

## 6. CHI TIẾT LUỒNG TÍNH NĂNG (CORE WORKFLOWS)

### 6.1 Quản trị Nội dung (News / Events / Dharma Talks)
*   **Luồng Phê duyệt (Approval Workflow):** 
    *   Editor tạo bài → Trạng thái `draft`.
    *   Bấm "Gửi duyệt" → Trạng thái `pending_review` → Bắn Push Notification (FCM) cho Admin.
    *   Admin duyệt → Trạng thái `published` → Xóa Cache Tag (`news-tenantId`) → Render ra UI.
*   **Revision History:** Mỗi lần ấn Save, hệ thống tự động insert một snapshot (JSONB) vào `content_revisions`. Admin có thể ấn "Khôi phục" (Rollback).

### 6.2 Quản lý Phước Điền (Transactions)
*   **Mô hình:** Thanh toán chia làm 2 loại:
    1.  *Mục đích chung (Purposes):* Thanh toán Tam Bảo, Nuôi Tăng...
    2.  *Dự án (Projects):* Xây chánh điện (có Target Amount & thanh tiến độ).
*   **Luồng:** User điền Form → Gen VietQR / MoMo → Trạng thái `pending` → Kế toán/Admin check biến động số dư → Bấm "Xác nhận" (Confirm) → Tự động cộng dồn `current_amount` vào Dự án → Lưu Audit Log.

### 6.3 Media & Tags Engine
*   **Upload Pipeline:** User upload File → Validate Size & MIME Type → Upload stream lên **Cloudinary** (trả về secure_url, tự động nén WebP) → Lưu Metadata vào Supabase `media` table.
*   **Tags Tự động**: Hàm `suggestTags` phân tích Title & Content để tự động trích xuất các từ khóa (Keywords) gợi ý cho Editor.

### 6.4 Hệ thống Linh kiện Nghệ thuật (Artistic Components V2)
Sẵn sàng cho việc xây dựng các trang chủ ấn tượng mà không cần code:
- **12 Khối mới**: Mosaic (Giới thiệu) Alt1-7 và Tam Bảo Alt1-5.
- **Smart Auto-mapping**: Cơ chế tự động lấy nội dung từ DB dựa trên phân tích từ khóa bài viết, giảm 90% công sức cấu hình cho Admin.
- **Tinh chỉnh Tâm linh (Spiritual UX)**: Toàn bộ linh kiện và nội dung mẫu được viết lại theo phong cách Phật giáo Nam Tông (Theravada), sử dụng thuật ngữ thiêng liêng và trang trọng.

---

## 7. HƯỚNG DẪN DÀNH CHO DEVELOPER / CTY TIẾP QUẢN

### 7.1 Cài đặt Môi trường (Local Setup)

Tạo file `.env.local` với các biến tối thiểu:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...

# Cloudinary
CLOUDINARY_URL=cloudinary://[KEY]:[SECRET]@[CLOUD_NAME]

# Security Webhooks
REVALIDATE_SECRET=your_super_secret_key_here

# Firebase (Dành cho Push Notification nội bộ)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

### 7.2 Lệnh Khởi chạy
```bash
# Cài đặt
pnpm install

# Sinh TypeScript types từ Supabase (RẤT QUAN TRỌNG KHI SỬA DB)
npx supabase gen types typescript --project-id [YOUR_ID] > lib/supabase/database.types.ts

# Khởi chạy Dev
pnpm run dev
```

### 7.3 Tiêu chuẩn Viết Code (Coding Conventions) bắt buộc tuân thủ:
1.  **Dữ liệu Admin:** Tuyệt đối KHÔNG dùng `unstable_cache` cho các page trong thư mục `/admin`. Phải fetch trực tiếp bằng `createClient()` (SSR auth) để ăn Row Level Security.
2.  **Server Actions:**
    *   Line đầu tiên luôn là `await requireAdmin()` hoặc `await requireEditor()`.
    *   Nếu có mutate dữ liệu, bắt buộc gọi `await enforceTenantScopeForRecord(tableName, id)`.
    *   Validate dữ liệu vào bằng `ZodSchema.safeParse(raw)` (Tuyệt đối không dùng `.parse()` vì sẽ throw 500 error không handle được sang UI).
3.  **Audit Log:** Mọi action Insert/Update/Delete phải gọi hàm `createAuditLog`.

---

### 📝 Lời nhắn nhủ cho Team Tiếp quản:
> Kiến trúc của dự án này đã giải quyết thành công bài toán khó nhất của Next.js App Router là **"Quản lý Cache trong môi trường Multi-tenant"**. 
> 
> Chìa khóa để maintain dự án này nằm ở file `lib/cache/tags.ts` và `lib/permissions.ts`. Chỉ cần nắm vững cách hệ thống định danh `tenant_id` thông qua Middleware và cách invalidation cache cục bộ, team có thể dễ dàng scale hệ thống lên hàng nghìn tự viện mà chi phí server (Vercel/Supabase) gần như không tăng.
