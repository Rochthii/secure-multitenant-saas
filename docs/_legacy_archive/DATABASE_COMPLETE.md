# 🗄️ CƠ SỞ DỮ LIỆU TOÀN DIỆN - PRODUCTION SAAS SCHEMA

Tài liệu này tổng hợp toàn bộ cấu trúc cơ sở dữ liệu thực tế (Production-grade Schema) của dự án **Secure Multi-tenant SaaS** (Áp dụng RLS và Audit Log trong quản trị rủi ro thông tin).

---

## 📊 TỔNG QUAN HỆ THỐNG
*   **Tổng số bảng:** 28 bảng nghiệp vụ và quản trị.
*   **Kiến trúc Cô lập dữ liệu:** Shared Database — Shared Schema với cơ chế Row-Level Security (RLS) bắt buộc trên tất cả các bảng nghiệp vụ liên quan đến tenant.
*   **Cơ chế ABAC bổ sung:** Kiểm soát truy cập dựa trên thuộc tính thời gian (Time-based), Blacklist IP, và IP trong giờ hành chính.
*   **Kiểm toán Bảo mật:** Bảng `audit_logs` có tính chất **Bất biến (Immutable)** bằng cách chặn hoàn toàn các hành động UPDATE/DELETE ở tầng RLS.

---

## 📁 DANH SÁCH BẢNG CƠ SỞ DỮ LIỆU

### 1. Phân Hệ Đa Chi Nhánh (Tenancy)
*   **provinces**: Quản lý tỉnh/thành phố hỗ trợ phân vùng địa lý.
*   **tenants**: Bảng trung tâm quản lý các chi nhánh. Chứa thông tin tên, tên miền phụ (`subdomain`), tên miền chính, loại hình (`tenant_type` như `tenant`, `company`, `ngo`), và trạng thái vòng đời.
*   **bank_accounts**: Danh sách tài khoản ngân hàng nhận quyên góp của từng chi nhánh. Đảm bảo quy tắc kinh doanh: tối đa chỉ 1 tài khoản mặc định được kích hoạt trên một tenant thông qua chỉ mục lọc `bank_accounts_tenant_default_idx`.

### 2. Phân Hệ Xác Thực & Quyền (Auth & RBAC)
*   **user_profiles**: Thông tin hồ sơ chi tiết của người dùng liên kết với bảng `auth.users` của Supabase.
*   **user_roles**: Gán vai trò cho người dùng trên từng chi nhánh. Được thiết kế với ràng buộc unique phức hợp `UNIQUE(user_id, tenant_id)` để hỗ trợ một tài khoản có thể có các quyền khác nhau (như Admin, Editor, Accountant) trên các chi nhánh khác nhau.
*   **role_permissions**: Cấu hình chi tiết các hành động (Create/Read/Update/Delete) được phép cho từng vai trò trên từng tài nguyên.

### 3. Phân Hệ Quản Trị Nội Dung (CMS Multi-language)
*   **categories**: Danh mục nội dung (tin tức, sự kiện, media). Hỗ trợ phân cấp cha-con (`parent_id`) và chia sẻ chéo (`published_to uuid[]`).
*   **news**: Các bài viết tin tức hỗ trợ 3 ngôn ngữ (vi, km, en), trạng thái xuất bản, tác giả, người kiểm duyệt và cơ chế phát sóng đa chi nhánh.
*   **events**: Các sự kiện, lịch trình lễ hội, hỗ trợ cấu hình lặp lại (`recurrence_pattern`) và yêu cầu đăng ký.
*   **event_registrations**: Danh sách phật tử/khách hàng đăng ký tham gia sự kiện.
*   **dharma_talks**: Các bài thuyết pháp, bài giảng Phật giáo dưới dạng âm thanh hoặc video.
*   **media**: Thư viện hình ảnh, tài liệu và video, được tối ưu hóa tìm kiếm với mảng thẻ `tags text[]`.
*   **about_sections**: Các phần giới thiệu về lịch sử, kiến trúc, chư tăng của chi nhánh.
*   **faqs**: Các câu hỏi thường gặp của từng chi nhánh.
*   **hero_slides**: Các banner động trình chiếu trên trang chủ của từng chi nhánh.
*   **layout_blocks**: Các khối nội dung động trên trang chủ cho phép quản trị viên tùy biến giao diện.

### 4. Phân Hệ Tài Chính (Finances & Donations)
*   **donation_campaigns**: Chiến dịch quyên góp (như xây chùa, cứu trợ thiên tai). Có mục tiêu tài chính, số tiền hiện tại và liên kết tài khoản ngân hàng nhận tiền. Được chuẩn hóa khoá chính kiểu `UUID`.
*   **donations**: Bản ghi chi tiết từng giao dịch quyên góp thực tế từ các nhà hảo tâm. Liên kết trực tiếp với chiến dịch (`campaign_id` dạng `UUID`) và tài khoản ngân hàng nhận tiền, hỗ trợ tính năng ẩn danh.

### 5. Phân Hệ Vận Hành & Khách Hàng
*   **contact_messages**: Tin nhắn liên hệ từ biểu mẫu gửi về ban quản trị, hỗ trợ theo dõi trạng thái phản hồi.
*   **newsletter_subscribers**: Danh sách đăng ký nhận bản tin qua email. Chứa ràng buộc unique phức hợp `UNIQUE(tenant_id, email)` giúp một email đăng ký nhận tin ở nhiều chi nhánh khác nhau mà không xung đột dữ liệu.

### 6. Phân Hệ Nhật Ký & Đo Lường Hệ Thống
*   **audit_logs**: Nhật ký kiểm toán bảo mật bất biến. Ghi lại mọi hành động quan trọng (AI thực hiện, IP, trình duyệt, dữ liệu cũ và dữ liệu mới trước/sau khi sửa đổi). `record_id` lưu trữ dạng `TEXT` để tương thích với tất cả loại khóa chính.
*   **content_revisions**: Lưu lịch sử các phiên bản sửa đổi nội dung của các bảng tĩnh để hỗ trợ tính năng khôi phục (rollback).
*   **cron_job_logs**: Lưu nhật ký chạy các tác vụ nền tự động (cron jobs) như dọn dẹp session, kiểm tra bảo mật.
*   **rls_benchmark_results**: Nhật ký đo lường và đánh giá hiệu năng truy vấn có RLS phục vụ nghiên cứu thực nghiệm đề tài tốt nghiệp.

### 7. Phân Hệ Bảo Mật & Giám Sát SOC
*   **active_visitors**: Theo dõi số người dùng trực tuyến theo thời gian thực trên từng chi nhánh.
*   **ip_blacklist**: Danh sách các IP bị chặn truy cập do phát hiện dấu hiệu tấn công hoặc spam.
*   **rate_limit_events**: Ghi nhận các sự kiện vi phạm giới hạn tần suất yêu cầu (Rate Limit) để hệ thống tự động kích hoạt chế độ khóa IP tạm thời.

---

## 🔒 CHÍNH SÁCH BẢO MẬT ROW-LEVEL SECURITY (RLS)

Hệ thống thiết lập nguyên tắc **Deny by Default** ở mức cơ sở dữ liệu. Chỉ các truy vấn được định nghĩa rõ ràng thông qua Policies mới được phép thực hiện:

1.  **Public Read Access**: Cho phép người dùng không cần đăng nhập đọc các bài viết `news` đã xuất bản (`status = 'published'`), các sự kiện `events` đang diễn ra, thư viện `media`, các trang tĩnh `pages` và danh mục `categories` thuộc chi nhánh hiện tại hoặc được phát sóng tới chi nhánh này (`published_to`).
2.  **Public Insert Access**: Khách vãng lai được phép thêm bản ghi vào `event_registrations`, `donations`, và `contact_messages` để gửi thông tin biểu mẫu.
3.  **Tenant Isolation**: Nhân viên chi nhánh chỉ có quyền thao tác trên dữ liệu có `tenant_id = public.get_current_tenant_id()`.
4.  **Global Admin Control**: Thành viên ban quản trị cấp cao (`super_admin`) được cấp quyền truy cập toàn bộ dữ liệu của tất cả các chi nhánh qua chính sách bỏ qua lọc tenant.
5.  **Immutability**: Bảng `audit_logs` và `cron_job_logs` chỉ có policy `INSERT` cho ứng dụng và policy `SELECT` cho admin. Tuyệt đối không có policy `UPDATE` hay `DELETE`.

---

## 🚀 HIỆU NĂNG TRUY VẤN & CHỈ MỤC (INDEXES)

Để giảm thiểu chi phí hiệu năng khi áp dụng RLS (do PostgreSQL phải thực hiện phép lọc lặp qua các hàm bảo mật), hệ thống đã triển khai các chỉ mục tối ưu:
*   Composite Index trên các cột khoá ngoại kết hợp với `tenant_id`.
*   Index tối ưu tìm kiếm mảng GIN trên trường `published_to` của các bảng CMS để tối ưu hóa tính năng chia sẻ chéo (Broadcast).
*   Index DESC trên trường thời gian như `audit_logs.created_at DESC` và `donations.created_at DESC` phục vụ các trang danh sách thời gian thực.
*   Partial Unique Index `bank_accounts_tenant_default_idx` trên trường `tenant_id` có điều kiện `WHERE (is_active = true AND is_default = true)` đảm bảo tính toàn vẹn nghiệp vụ ở tầng lưu trữ.
