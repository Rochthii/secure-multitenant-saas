# Ma trận ánh xạ OWASP Top 10 tới Cơ chế phòng thủ hệ thống

## Mục tiêu
Tài liệu này ánh xạ các rủi ro bảo mật phổ biến nhất theo phân loại của OWASP Top 10 vào các giải pháp thiết kế, kiến trúc và mã nguồn thực tế của dự án. Điều này giúp chứng minh tính "phòng thủ chiều sâu" (Defense-in-depth) và tuân thủ Zero Trust của hệ thống trước Hội đồng chấm tốt nghiệp.

## Bảng ánh xạ chi tiết

| OWASP Top 10 | Rủi ro | Giải pháp thiết kế trong hệ thống | Minh chứng mã nguồn / Cấu hình |
|---|---|---|---|
| **A01:2021** | Broken Access Control (Lỗi kiểm soát truy cập) | - PostgreSQL Row-Level Security (RLS) bắt buộc.<br>- Phân quyền lai RBAC + ABAC.<br>- Xác thực claim JWT trong bộ nhớ RAM.<br>- Edge Middleware Router cô lập tenant. | - RLS policies trong CSDL.<br>- [middleware.ts](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/middleware.ts)<br>- Bảng `audit_logs` triggers chặn UPDATE/DELETE. |
| **A02:2021** | Cryptographic Failures (Lỗi mật mã) | - Sổ cái Audit Log mật mã học bất biến (SHA-256 Hash-chaining).<br>- Tích hợp WORM Vault Widget để quét kiểm tra tính toàn vẹn. | - [worm-vault.ts](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/lib/security/worm-vault.ts)<br>- [worm-vault-widget.tsx](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/components/admin/worm-vault-widget.tsx) |
| **A03:2021** | Injection (Lỗi tiêm mã lệnh) | - Sử dụng ORM và Parameterized Queries từ Supabase Client.<br>- RLS chặn việc truy xuất dữ liệu trái phép kể cả khi SQL Injection xảy ra thành công trên một query. | - Cấu hình RLS policies mặc định từ chối tất cả (`DEFAULT RESTRICTIVE`). |
| **A04:2021** | Insecure Design (Thiết kế không an toàn) | - Thiết kế theo mô hình Clean Architecture & DDD.<br>- Ánh xạ đầy đủ theo tiêu chuẩn ISO/IEC 27017.<br>- Tách biệt logic và hạ tầng. | - [28_ARCHITECTURAL_DESIGN_PATTERN.md](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/docs/28_ARCHITECTURAL_DESIGN_PATTERN.md)<br>- [25_ISO27001_COMPLIANCE_GUIDE.md](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/docs/25_ISO27001_COMPLIANCE_GUIDE.md) |
| **A05:2021** | Security Misconfiguration (Sai sót cấu hình an toàn) | - Quản lý tập trung biến môi trường.<br>- Định cấu hình giới hạn kết nối Supavisor tránh cạn kiệt tài nguyên. | - [10_ENV_VARIABLES_REFERENCE.md](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/docs/10_ENV_VARIABLES_REFERENCE.md)<br>- [tenant-pooler.ts](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/lib/security/tenant-pooler.ts) |
| **A06:2021** | Vulnerable and Outdated Components (Thành phần có lỗ hổng) | - Quản lý thư viện qua Package Manager.<br>- Hạn chế tối đa các dependency bên ngoài không tin cậy. | - `package.json` kiểm tra định kỳ. |
| **A07:2021** | Identification and Authentication Failures (Lỗi xác thực & Định danh) | - Tích hợp Supabase Auth với cơ chế JWT Claims.<br>- Kịch bản khóa session, quay vòng JWT (JWT Rotation) và quản lý phiên. | - [31_JWT_ROTATION_AND_SESSION_MANAGEMENT.md](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/docs/31_JWT_ROTATION_AND_SESSION_MANAGEMENT.md) |
| **A08:2021** | Software and Data Integrity Failures (Lỗi toàn vẹn dữ liệu) | - Forensic WORM Chain Auditor thẩm định tính toàn vẹn cryptographic ledger.<br>- Trực quan hóa lỗi vi phạm toàn vẹn chéo CSDL. | - [worm-vault-widget.tsx](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/components/admin/worm-vault-widget.tsx) |
| **A09:2021** | Security Logging and Monitoring Failures (Lỗi giám sát nhật ký) | - Sổ cái Audit Trail mật mã học bất biến (SHA-256) chống chối bỏ.<br>- Telegram Webhook SOC Alerts báo động tức thời.<br>- Cyber SOC Dashboard giám sát tập trung. | - [audit/index.ts](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/lib/audit/index.ts)<br>- `soc_active_alert_trigger` trong database. |
| **A10:2021** | Server-Side Request Forgery - SSRF (Giả mạo yêu cầu từ máy chủ) | - Intranet Lockdown kiểm tra IP đầu vào nghiêm ngặt.<br>- Smart Router ngăn chặn truy cập trực tiếp từ môi trường Intranet/Extranet không hợp lệ. | - [middleware.ts](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/middleware.ts) |

---
*Tài liệu này là một phần trong hồ sơ bảo vệ đồ án tốt nghiệp của sinh viên Chăm Rốch Thi.*
