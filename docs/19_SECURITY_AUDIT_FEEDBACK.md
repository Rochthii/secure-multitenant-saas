# BẢN ĐÁNH GIÁ AN NINH MÃ NGUỒN & KHOẢNG TRỐNG KIẾN TRÚC (SECURITY AUDIT & GAP ANALYSIS)
## Dự án: Secure Multi-tenant SaaS Platform
**Người đánh giá:** AI Security Auditor  
**Ngày lập:** 2026-05-19  

---

## 1. TẦNG MIDDLEWARE — SMART ROUTER

### Điểm mạnh ✅
*   `middleware.ts` được tối ưu hóa hiệu năng cực kỳ tốt cho Edge Runtime (comment tiêu chuẩn "Ultra Lean, target < 4ms" được đáp ứng thực tế).
*   Sử dụng `indexOf` thay thế cho Regular Expressions để tránh cấp phát bộ nhớ động (object allocation).
*   Định nghĩa hằng số bên ngoài hàm xử lý chính để tránh khởi tạo lại ở mỗi request.
*   Sử dụng `startsWith` để phát hiện và định tuyến ngôn ngữ (locale detection) nhanh chóng.

### Lỗ hổng bảo mật (ĐÃ ĐƯỢC VÁ ✅ - 2026-05-21)
*   **Lỗ hổng Tenant Parameter Injection:**
    **Trạng thái:** Đã vá thành công. Hiện tại Middleware đã sử dụng Regex chuẩn UUIDv4 và khóa chặt tính năng ghi đè tenant, chỉ cho phép kích hoạt trong môi trường `development` hoặc `debug_mode`.

### Gap so với Đề cương đồ án tốt nghiệp (ĐÃ HOÀN THIỆN ✅ - 2026-05-21)
*   **Intranet Lockdown (IP-based Access Control):** Trong đề cương mô tả cơ chế giới hạn truy cập từ mạng nội bộ (Intranet Lockdown). Tuy nhiên, trong Next.js Middleware hiện tại chưa thấy có bất kỳ cơ chế kiểm tra IP nào (`req.ip` hoặc header `x-forwarded-for`) để lọc và phân vùng mạng truy cập cho từng Tenant.
    **Trạng thái:** Đã tích hợp logic đọc IP qua `x-forwarded-for` và `x-real-ip` trực tiếp tại Edge Runtime để đối chiếu với `TENANT_IP_WHITELIST`, thực thi kiến trúc mạng Zero Trust.

---

## 2. TẦNG AUDIT & KIỂM TOÁN — `audit_storage_policies.ts`

### Đánh giá kỹ thuật 🔍
*   Tệp `audit_storage_policies.ts` hoạt động như một **công cụ kiểm toán một lần (one-shot audit script)**, không phải là một module ghi nhật ký hoạt động thường trực trong runtime của ứng dụng.
*   Nhiệm vụ của nó là truy vấn bảng hệ thống `pg_policies` để kiểm tra độ bao phủ RLS trên phân vùng lưu trữ `storage.objects`.
*   **Lưu ý kiến trúc:** Script sử dụng hàm RPC `execute_sql` đi kèm mã khóa đặc quyền cao `SUPABASE_SERVICE_ROLE_KEY` (bypass hoàn toàn RLS). Đây là hành vi hợp lệ đối với tác vụ quản trị và kiểm toán của Super Admin, nhưng cần được tài liệu hóa rõ ràng để tránh hiểu nhầm trong báo cáo đồ án.

---

## 3. MA TRẬN PHÂN TÍCH CHÊNH LỆCH (GAP MATRIX)

| Thành phần đề cương (Proposal) | Trạng thái trong mã nguồn | Phân tích & Hướng hoàn thiện |
| :--- | :--- | :--- |
| **Smart Router (Dynamic Subdomain Routing)** | ✅ Có (`middleware.ts`) | Đã triển khai và **đã vá lỗ hổng injection** (chặn UUID rác, phân lập Debug). |
| **Intranet Lockdown (IP-based)** | ✅ Đã cấu hình | Đã cấu hình kiểm tra IP (`TENANT_IP_WHITELIST`) an toàn tại tầng định tuyến ứng dụng. |
| **RLS Policies (PostgreSQL)** | ✅ Có (`supabase/migrations/`) | Đã triển khai. Cần chuyển từ truy vấn SELECT JOIN sang kiểm tra JWT Claims để tối ưu hiệu năng. |
| **ABAC time-based** | ✅ Có (`supabase/migrations/...`) | Đã cài đặt thành công cho các nghiệp vụ nhạy cảm của Editor/Accountant. |
| **Audit Log bất biến** | 🟡 Có một phần | Bảng `audit_logs` có trigger chặn DELETE/UPDATE. Cần hoàn thiện trigger tự động trước DELETE ở các bảng nghiệp vụ chính. |
| **SOC Dashboard (Giám sát bảo mật)** | ✅ Có | Giao diện Security Center đã sẵn sàng với việc đo lường độ bao phủ RLS và điểm số an toàn. |
| **Anomaly Detection (AI/Thuật toán)** | ❌ Chưa triển khai sâu | Mới dừng lại ở phát hiện ngưỡng tĩnh (rule-based: >20 actions/hour). Cần tích hợp mô hình thuật toán như Isolation Forest trong pha nghiên cứu tiếp theo. |
| **DevSecOps Pipeline** | ✅ Có | Tự động hóa qua GitHub Actions và Vercel Cron Jobs (backup, auto-publish). |

---

## 4. CÁC ĐỊNH HƯỚNG ƯU TIÊN HOÀN THIỆN (ACTION PLAN)

*   ~~**Ưu tiên 1 (Làm ngay):** Vá lỗ hổng định dạng UUID trong query parameter tại `middleware.ts`.~~ **[ĐÃ HOÀN THÀNH]**
*   **Ưu tiên 2 (Tối ưu hóa hiệu năng RLS):** Chuyển cơ chế kiểm tra phân quyền và tenant ID trong RLS từ việc gọi hàm SELECT bảng `user_roles` sang đọc trực tiếp từ **Supabase JWT Custom Claims** (`auth.jwt() ->> 'tenant_id'`). Điều này sẽ giúp giảm số lượt truy vấn DB từ $O(N)$ xuống $O(1)$, là đề tài đo lường (benchmark) xuất sắc cho Chương 5.
*   ~~**Ưu tiên 3 (Intranet Lockdown):** Tích hợp kiểm tra dải IP IP-based whitelist ở tầng Middleware đối với các route quản trị của Tenant.~~ **[ĐÃ HOÀN THÀNH]**
*   **Ưu tiên 4 (Phát hiện ngoại lai nâng cao):** Nâng cấp thuật toán phát hiện bất thường từ ngưỡng tĩnh sang mô hình toán học (Isolation Forest) để phân tích log và phát hiện các hành vi bất hợp pháp (Anomalous Activity Detection).
