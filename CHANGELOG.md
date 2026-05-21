# Changelog

Tất cả các thay đổi đáng chú ý đối với nền tảng Secure Multi-tenant SaaS sẽ được ghi lại trong tệp này.

## [Unreleased] - 2026-05-21

### Bảo mật & Kiến trúc Zero Trust (Security)
- **Đã vá lỗ hổng UUID Injection**: Thay thế logic kiểm tra độ dài chuỗi sơ sài bằng biểu thức chính quy (Regex) chuẩn UUIDv4 trong `middleware.ts`.
- **Cô lập môi trường (Environment Isolation)**: Khóa chức năng ghi đè tham số `tenant` qua URL, chỉ cấp phép hoạt động trong môi trường Development/Debug để ngăn chặn Routing Hijacking trên Production.
- **Triển khai Intranet Lockdown**: Áp dụng cơ chế kiểm tra IP Whitelist từ các header chuẩn (`x-forwarded-for`, `x-real-ip`) tại tầng Edge Middleware nhằm thực thi Zero Trust Network Access cho từng Tenant.
- **Tối ưu hóa chặn Root Routes**: Sửa lỗi so khớp định tuyến từ `startsWith` lỏng lẻo sang so khớp chính xác/thư mục con, tránh lỗi 403 nhầm lẫn đối với các đường dẫn của khách hàng.
- **Tương thích Next.js 14/15+**: Gỡ bỏ thuộc tính `request.ip` đã bị deprecate, nâng cao độ ổn định trên môi trường Vercel.

### Học thuật & Thực nghiệm (Academic & Benchmarking)
- **Thêm Dataset Scaling Engine**: Xây dựng module thực nghiệm `lib/benchmark/scaling-engine.ts` để đo lường độ trễ truy xuất trên các tập dữ liệu giả lập quy mô 1.000, 10.000 và 100.000 dòng.
- **Bằng chứng phân quyền O(1) (O(1) Authorization Proof)**: Cập nhật trang `/admin/performance` hiển thị biểu đồ đường (LineChart) chứng minh hiệu năng ưu việt của Custom JWT Claims so với RLS JOIN truyền thống. Thay đổi này trực tiếp phục vụ số liệu cho báo cáo Đồ án Tốt nghiệp.

### Tài liệu (Documentation)
- Cập nhật `19_SECURITY_AUDIT_FEEDBACK.md` ghi nhận các lỗ hổng đã được vá thành công.
- Cập nhật `18_PROPOSAL_MAPPING_ANALYSIS.md` đánh dấu hoàn thành mục tiêu "Fix benchmark narrative".

---
*Dự án Đồ án Tốt nghiệp PTIT - Ngành Công nghệ Thông tin*
*Nghiên cứu & Phát triển: Chăm Rốch Thi*