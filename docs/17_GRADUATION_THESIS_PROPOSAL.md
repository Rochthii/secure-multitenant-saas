# Đề Cương Đồ Án Tốt Nghiệp

> **Học viện:** Học viện Công nghệ Bưu chính Viễn thông (PTIT)  
> **Khoa:** Công nghệ Thông tin  
> **Sinh viên:**Chăm Rốch Thi  
> **Cập nhật:** 2026-05-16

---

## Tên đề tài

**Nghiên cứu và thiết kế kiến trúc phần mềm an toàn cho nền tảng đa khách hàng (Secure Multi-tenant SaaS): Áp dụng Row-Level Security và Audit Log trong quản trị rủi ro thông tin.**

---

## Danh mục chữ viết tắt

| Viết tắt | Ý nghĩa |
|---|---|
| **SaaS** | Software-as-a-Service (Phần mềm dưới dạng dịch vụ) |
| **RLS** | Row-Level Security (Bảo mật mức dòng) |
| **RBAC** | Role-Based Access Control (Kiểm soát truy cập dựa trên vai trò) |
| **ABAC** | Attribute-Based Access Control (Kiểm soát truy cập dựa trên thuộc tính) |
| **JWT** | JSON Web Token |
| **SOC** | Security Operations Center (Trung tâm điều hành an ninh) |
| **ISR** | Incremental Static Regeneration (Tái tạo tĩnh tuần tự) |
| **TTL** | Time To Live (Thời gian sống của cache) |
| **CRUD** | Create, Read, Update, Delete |
| **API** | Application Programming Interface |

---

## 1. Tính cấp thiết của đề tài

### 1.1 Bối cảnh thực tiễn

- **Xu hướng SaaS đa khách hàng:** Mô hình SaaS (Software-as-a-Service) đang chiếm ưu thế trong ngành phần mềm doanh nghiệp. Tuy nhiên, việc nhiều tổ chức (tenant) cùng chia sẻ hạ tầng đặt ra thách thức nghiêm trọng về **cô lập dữ liệu** và **quản trị rủi ro thông tin**.
- **Rò rỉ dữ liệu cross-tenant:** Nhiều sự cố bảo mật lớn (Salesforce, Zendesk, HubSpot) xuất phát từ lỗi cô lập dữ liệu ở tầng ứng dụng. Nguyên nhân gốc rễ: phụ thuộc application-layer filtering thay vì database-level enforcement.
- **Bối cảnh pháp lý tại Việt Nam:** Việc tuân thủ **Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân** yêu cầu các đơn vị cung cấp dịch vụ cloud phải có cơ chế kiểm soát truy cập nghiêm ngặt và minh chứng được việc cô lập dữ liệu người dùng một cách an toàn.
- **Yêu cầu tuân thủ quốc tế:** ISO/IEC 27017, SOC 2, GDPR đều yêu cầu hệ thống cloud phải có cơ chế kiểm soát truy cập đặc quyền, nhật ký kiểm toán bất biến, và quy trình ứng phó sự cố.

### 1.2 Khoảng trống nghiên cứu

- Đa số tài liệu hiện có tập trung vào **kiến trúc multi-tenant** (shared DB vs. isolated DB) nhưng **ít đề cập cụ thể** cách triển khai bảo mật tầng database bằng **Row-Level Security (RLS)** kết hợp **Audit Trail** trong thực tế.
- Thiếu nghiên cứu ánh xạ giữa **kiến trúc kỹ thuật RLS** và **khung quản trị rủi ro ISO 27017** cho nền tảng cloud SaaS.

---

## 2. Mục tiêu nghiên cứu

### 2.1 Mục tiêu tổng quát

Nghiên cứu và thiết kế kiến trúc phần mềm an toàn cho nền tảng đa khách hàng, trong đó bảo mật dữ liệu được thực thi ở tầng database thay vì tầng ứng dụng, đồng thời xây dựng hệ thống nhật ký kiểm toán toàn diện phục vụ quản trị rủi ro thông tin.

### 2.2 Mục tiêu cụ thể

1. **Thiết kế mô hình cô lập dữ liệu** theo phương pháp Shared Database — Shared Schema, sử dụng PostgreSQL Row-Level Security (RLS) để bảo vệ cô lập dữ liệu giữa các tenant ở tầng thấp nhất.
2. **Xây dựng mô hình phân quyền lai RBAC + ABAC**, trong đó RBAC xác định vai trò cơ bản, ABAC bổ sung ràng buộc ngữ cảnh (giờ hành chính, loại thao tác) để tăng cường kiểm soát truy cập.
3. **Triển khai hệ thống Audit Log bất biến** — ghi nhận mọi hành động mutation, hỗ trợ phân tích hành vi, phát hiện bất thường (anomaly detection), và đáp ứng yêu cầu pháp lý về truy vết.
4. **Xây dựng bảng điều khiển giám sát bảo mật (SOC Dashboard)** — tổng hợp chỉ số an ninh thời gian thực: Security Score, RLS Coverage, Activity Timeline, Anomaly Alerts.
5. **Tối ưu hóa hiệu năng và chống "Noisy Neighbor":** Thiết kế cơ chế lưu trữ đệm có nhận diện tenant (tenant-aware indexing) và áp dụng Rate Limiting kết hợp Connection Pooling (Supavisor) ở chiều ghi nhằm ngăn chặn một tenant vắt kiệt tài nguyên hệ thống.
6. **Xây dựng cơ chế phòng vệ chủ động (Active Defense):** Nâng cấp hệ thống SOC bằng việc tích hợp tự động ứng phó sự cố (Automated Incident Response), cho phép cảnh báo thời gian thực qua Webhook khi có dấu hiệu tấn công.
7. **Ánh xạ kiến trúc kỹ thuật** với khung tiêu chuẩn **ISO/IEC 27017** — chứng minh tính tuân thủ và khả năng triển khai trong môi trường doanh nghiệp thực tế.

### 2.3 Đóng góp khoa học & thực tiễn

- **Về lý thuyết:** Hệ thống hóa cách tiếp cận bảo mật "Defense-in-depth" cho kiến trúc Multi-tenant, chuyển dịch trọng tâm thực thi từ tầng ứng dụng xuống tầng dữ liệu (Data-centric Security).
- **Về thực tiễn:** Cung cấp một bộ khung (framework) SaaS an toàn có khả năng tùy biến cao, giúp các tổ chức tôn giáo hoặc doanh nghiệp vừa và nhỏ dễ dàng triển khai nền tảng quản trị an toàn với chi phí hạ tầng thấp nhưng bảo mật mức doanh nghiệp.

---

## 3. Đối tượng & Phạm vi nghiên cứu
### 3.1 Đối tượng nghiên cứu

- Kiến trúc phần mềm SaaS đa khách hàng (Multi-tenant Architecture).
- Cơ chế Row-Level Security (RLS) trong PostgreSQL.
- Hệ thống Audit Log và giám sát hành vi.
- Khung quản trị rủi ro thông tin ISO/IEC 27017.

### 3.2 Phạm vi kỹ thuật

| Lớp | Công nghệ | Vai trò trong đề tài |
|---|---|---|
| **Frontend** | Next.js 16 (App Router) | Giao diện quản trị — SOC Dashboard |
| **Backend** | Server Actions + API Routes | Điểm thực thi Guard/Audit |
| **Database** | PostgreSQL (Supabase) | **Core:** RLS Policies, ABAC Functions, Audit Triggers |
| **Auth** | Supabase Auth (JWT) | Xác thực — cung cấp identity cho RLS |
| **Hosting** | Vercel + Supabase Cloud | Hạ tầng đám mây — minh họa Shared Responsibility |
| **Monitoring** | Sentry + Custom SOC | Giám sát & phát hiện bất thường |

### 3.3 Giới hạn phạm vi

- Đề tài **tập trung vào kiến trúc bảo mật**, không đi sâu vào thiết kế giao diện (UI/UX) hay chức năng nghiệp vụ cụ thể.
- Không bao gồm: Mobile App, AI/RAG, GIS/PostGIS.
- Đánh giá bảo mật dừng ở mức **kiến trúc và thiết kế** (design review), không thực hiện penetration testing.

---

## 4. Phương pháp nghiên cứu

### 4.1 Nghiên cứu lý thuyết

- Tổng quan mô hình Multi-tenant Architecture: Isolated DB, Shared DB — Shared Schema, Shared DB — Separate Schema.
- Nghiên cứu PostgreSQL RLS: cơ chế hoạt động, CREATE POLICY, SECURITY DEFINER functions.
- Phân tích khung ISO/IEC 27017 và ánh xạ sang kiến trúc kỹ thuật.

### 4.2 Thiết kế & Triển khai

- Thiết kế kiến trúc Defense-in-depth 4 lớp: Middleware → App Auth → Server Actions → DB RLS.
- Triển khai mô hình RBAC (6 vai trò) + ABAC (time-based, operation-type).
- Triển khai Audit Log System: immutable audit_logs table, auto-trigger before DELETE.
- Triển khai SOC Dashboard và Active Alerting: Security Score, Activity Timeline, Anomaly Detection, tự động bắn Webhook khi phát hiện truy cập bất thường.

### 4.3 Đánh giá & Kiểm chứng

- **Kiểm chứng cô lập dữ liệu:** Viết test case cross-tenant access — chứng minh RLS ngăn chặn thành công.
- **Kiểm chứng Audit Trail:** Thao tác CRUD → xác nhận log được ghi đầy đủ và không thể sửa/xóa.
- **Đánh giá RLS Coverage:** Tỉ lệ bảng có policy / tổng bảng.
- **Ánh xạ ISO 27017:** Bảng đối chiếu từng control domain → minh chứng kỹ thuật tương ứng.

---

## 5. Nội dung chính dự kiến

### Chương 1: Tổng quan
- Bối cảnh và tính cấp thiết
- Mục tiêu và phạm vi nghiên cứu
- Phương pháp nghiên cứu

### Chương 2: Cơ sở lý thuyết
- Multi-tenant Architecture: 3 mô hình
- PostgreSQL Row-Level Security (RLS)
- RBAC vs. ABAC: Mô hình kiểm soát truy cập
- Audit Log và Non-repudiation
- ISO/IEC 27017: Cloud Security Controls

### Chương 3: Phân tích & Thiết kế
- Kiến trúc tổng thể hệ thống (System Architecture)
- Thiết kế mô hình dữ liệu Multi-tenant (Shared Schema)
- Thiết kế Defense-in-depth Security Model
- Cấu trúc "Tường lửa nội bộ" (Intranet Lockdown) & Smart Router
- Thiết kế RLS Policy Engine & Data Isolation tối ưu hiệu năng (Nhúng Custom Claims vào JWT để triệt tiêu độ trễ JOIN query)
- Thiết kế RBAC + ABAC Authorization Model (Delegated Admin & Chống leo thang đặc quyền - Preventing Permission Escalation)
- Thiết kế Chiến lược Caching an toàn (Tenant-aware Cache Keys) và Điều tiết tải (Rate Limiting, Connection Pooling) chống Noisy Neighbor
- Thiết kế Audit Log System & SOC Dashboard (Automated Incident Response)

### Chương 4: Triển khai
- Triển khai "Intranet Lockdown" & Smart Router Access Control
- Triển khai Phân quyền ủy thác (Delegated Admin) từ Tập đoàn xuống Chi nhánh
- Triển khai RLS Policies (PostgreSQL)
- Triển khai ABAC Functions (time-based, operation-type)
- Triển khai Multi-tenant Caching System (unstable_cache, tags-based revalidation)
- Triển khai Rate Limiting trên Mutation API và Connection Pooling (Supavisor)
- Triển khai Audit Trail System (triggers, immutable log)
- Triển khai SOC Dashboard và Cảnh báo chủ động (Active Webhook Alerts)
- Triển khai DevSecOps Pipeline (cron backup, release checklist)
- Thiết lập quy trình Tenant Offboarding (Hard Wipe data) theo chuẩn ISO 27017 và xử lý phân mảnh CSDL

### Chương 5: Đánh giá & Thực nghiệm
- Kiểm chứng tenant isolation (cross-tenant test)
- Đánh giá RLS Coverage Score
- Kiểm chứng Audit Log integrity
- Kiểm chứng tính cô lập của Cache (Cache Leakage Testing giữa các tenant)
- Ánh xạ ISO 27017 Compliance Matrix
- **Đánh giá ảnh hưởng hiệu năng (Performance Benchmarking):** So sánh độ trễ query khi có và không có RLS để đánh giá tính khả thi trong môi trường production.
- So sánh với giải pháp application-level filtering

### Chương 6: Kết luận & Hướng phát triển
- Tổng kết kết quả đạt được
- **Hạn chế:** 
  - Điểm mù trong khôi phục dữ liệu (Disaster Recovery) cục bộ cho từng Tenant trong mô hình Shared DB (rủi ro rollback chéo). Đề xuất giải pháp "Soft Delete" kết hợp Audit Log.
  - Lỗ hổng "Người gác đền cũng có thể là kẻ trộm" (Audit Log Tampering): Rủi ro quản trị viên cấp cao (Super Admin) tự ý xóa dấu vết vì Audit Log đang được lưu trên cùng một CSDL vật lý với ứng dụng.
- **Hướng phát triển:** 
  - Đề xuất Chiến lược kiến trúc lai (Hybrid Strategy): Cung cấp Shared DB cho gói Standard và tự động cấp phát CSDL riêng (Isolated DB) cho tệp khách hàng Enterprise có yêu cầu HIPAA/Tài chính.
  - Giải pháp WORM Storage: Tích hợp cơ chế Forwarding Audit Log ra hệ thống SIEM lưu trữ độc lập (như Splunk, AWS S3) để đảm bảo tính bất biến tuyệt đối.
  - Tích hợp thêm AI vào hệ thống SIEM/SOC để dự đoán hành vi tấn công.
  - Triển khai Penetration Testing, đạt chứng nhận SOC 2, Zero Trust Architecture.

---

## 6. Kế hoạch thực hiện

| Giai đoạn | Nội dung | Thời gian |
|---|---|---|
| 1 | Nghiên cứu lý thuyết + Tổng quan | Tuần 1–3 |
| 2 | Thiết kế kiến trúc + Mô hình bảo mật | Tuần 4–6 |
| 3 | Triển khai RLS + ABAC + Audit | Tuần 7–10 |
| 4 | SOC Dashboard + DevSecOps | Tuần 11–12 |
| 5 | Đánh giá + Viết báo cáo | Tuần 13–16 |
| 6 | Chỉnh sửa + Bảo vệ | Tuần 17–18 |

---

## 7. Tài liệu tham khảo (Dự kiến)

1. Microsoft Azure Architecture Center, "Multi-tenant SaaS Architecture Patterns", 2024.
2. PostgreSQL Documentation, "Row Security Policies", PostgreSQL 16.
3. ISO/IEC 27017:2015, "Code of practice for information security controls based on ISO/IEC 27002 for cloud services".
4. Nghị định 13/2023/NĐ-CP, "Bảo vệ dữ liệu cá nhân", Chính phủ nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.
5. Supabase Documentation, "Row Level Security", 2024.
6. R. Sandhu, "Attribute-Based Access Control Models: A Review", IEEE Computer Society, 2018.
7. OWASP, "Top 10 - A01:2021-Broken Access Control", 2021.
