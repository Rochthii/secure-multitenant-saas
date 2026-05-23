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

| Viết tắt / Thuật ngữ | Ý nghĩa |
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
| **Smart Router** | Bộ định tuyến thông minh (Định tuyến yêu cầu dựa trên Tenant Domain/Subdomain) |
| **Intranet Lockdown** | Cơ chế khóa mạng nội bộ (Chỉ cho phép truy cập tài nguyên Tenant từ IP/mạng nội bộ được chỉ định) |
| **Zero Trust** | Kiến trúc an ninh mạng "Không bao giờ tin tưởng, luôn luôn xác thực" |

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
- **Về thực tiễn:** Cung cấp một bộ khung (framework) SaaS an toàn có khả năng tùy biến cao, giúp các doanh nghiệp vừa và nhỏ hoặc các tổ chức phi lợi nhuận (ví dụ: các tổ chức xã hội, tự viện) dễ dàng triển khai nền tảng quản trị an toàn với chi phí hạ tầng thấp nhưng đảm bảo mức độ bảo mật tương đương cấp doanh nghiệp lớn (Enterprise security tier).

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
- Multi-tenant Architecture: 3 mô hình cô lập dữ liệu
- PostgreSQL Row-Level Security (RLS) và tác động hiệu năng cơ sở dữ liệu
- RBAC vs. ABAC: Mô hình phân quyền lai dựa trên vai trò và ngữ cảnh thuộc tính
- Audit Log, tính bất biến (Immutability) và khả năng chống chối bỏ (Non-repudiation)
- Định nghĩa cơ chế Smart Router và kiến trúc Intranet Lockdown phân vùng tài nguyên Tenant
- Nguyên lý thiết kế an toàn Zero Trust Architecture (ZTA) cho hệ thống SaaS
- Tiêu chuẩn an toàn thông tin đám mây ISO/IEC 27017
- Phân tích phát hiện bất thường (Anomaly Detection) trong nhật ký hệ thống: Nguyên lý thuật toán Isolation Forest

### Chương 3: Phân tích & Thiết kế
- Kiến trúc tổng thể hệ thống (System Architecture) theo triết lý Zero Trust **[HOÀN THÀNH]**
- Thiết kế mô hình dữ liệu Multi-tenant (Shared Schema) **[HOÀN THÀNH]**
- Thiết kế mô hình bảo mật hình phễu Defense-in-depth **[HOÀN THÀNH]**
- Thiết kế cơ chế Smart Router (Dynamic Subdomain Routing) và phân vùng Intranet Lockdown bảo vệ tài nguyên **[HOÀN THÀNH]**
- Thiết kế RLS Policy Engine & Data Isolation tối ưu hiệu năng (Nhúng Custom Claims vào JWT để triệt tiêu độ trễ JOIN query) **[HOÀN THÀNH - Tối ưu hóa Custom Claims JWT kết hợp RLS & Benchmark so sánh]**
- Thiết kế RBAC + ABAC Authorization Model (Delegated Admin & Chống leo thang đặc quyền - Preventing Permission Escalation) **[HOÀN THÀNH]**
- Thiết kế Chiến lược Caching an toàn (Tenant-aware Cache Keys) và Điều tiết tải (Rate Limiting, Connection Pooling) chống Noisy Neighbor **[HOÀN THÀNH]**
- Thiết kế Audit Log System bất biến & SOC Dashboard tích hợp phát hiện bất thường (quy tắc 20 thao tác/giờ và giám sát tuân thủ 2FA) kết hợp cơ chế phản ứng tự động (Active Webhook Alerts & Force Logout) **[HOÀN THÀNH]**

### Chương 4: Triển khai
- Triển khai "Intranet Lockdown" & Smart Router Access Control tuân thủ Zero Trust **[HOÀN THÀNH]**
- Triển khai Phân quyền ủy thác (Delegated Admin) từ Tập đoàn xuống Chi nhánh **[HOÀN THÀNH]**
- Triển khai hệ thống RLS Policies tối ưu hóa trên PostgreSQL **[HOÀN THÀNH]**
- Triển khai các hàm kiểm tra thuộc tính ABAC (time-based, IP-based, operation-type) **[HOÀN THÀNH]**
- Triển khai Multi-tenant Caching System (unstable_cache, tags-based revalidation) bảo mật chống rò rỉ chéo **[HOÀN THÀNH]**
- Triển khai Rate Limiting trên Mutation API và Connection Pooling (Supavisor) **[HOÀN THÀNH]**
- Triển khai Audit Trail System bất biến (Triggers chặn DELETE/UPDATE ghi đè) **[HOÀN THÀNH]**
- Triển khai SOC Dashboard kết hợp mô hình Anomaly Detection (giám sát thao tác bất thường trong 1 giờ) và cảnh báo chủ động kết hợp nút Force Logout khẩn cấp **[HOÀN THÀNH]**
- Triển khai DevSecOps Pipeline (cron backup, release checklist) **[HOÀN THÀNH]**
- Thiết lập quy trình Tenant Offboarding (Hard Wipe data) theo chuẩn ISO 27017 và xử lý phân mảnh CSDL **[HOÀN THÀNH]**

### Chương 5: Đánh giá & Thực nghiệm
- **Xây dựng mô hình Threat Modeling (STRIDE):** Phân tích 6 attack vectors chính đối với hệ thống đa khách hàng và cách kiến trúc đề xuất ngăn chặn từng nguy cơ. **[HOÀN THÀNH - Báo cáo lý thuyết]**
- Đánh giá RLS Coverage Score (Tỷ lệ phần trăm các bảng dữ liệu được bảo vệ thành công bằng RLS). **[HOÀN THÀNH - Đã tích hợp RPC kiểm tra tự động]**
- Kiểm chứng tính toàn vẹn của Audit Log (Audit Log integrity check & non-repudiation verification). **[HOÀN THÀNH]**
- **Thực nghiệm đo lường hiệu năng (Performance Benchmarking):** **[HOÀN THÀNH]**
  - Định nghĩa Baseline so sánh: Phương pháp lọc dữ liệu ở tầng ứng dụng (Application-layer Filtering) vs. Lọc dữ liệu ở tầng cơ sở dữ liệu (Database-level RLS) vs RLS tối ưu Custom Claims.
  - Chỉ số đo lường (Metrics): Độ trễ trung vị (P50), độ trễ phân vị cao (P95, P99 Latency) qua vòng lặp benchmark tự động trực tiếp trên giao diện `/admin/performance`.
  - Công cụ thực nghiệm (Tooling): Trang Performance Dashboard mô phỏng đo đạc thực tế trên database server.
- **Thực nghiệm Cache Leakage Testing & Tấn công giả lập (Threat Simulation):** Mô phỏng truy cập chéo giữa các tenant sử dụng cache/đường dẫn chéo thông qua widget Threat Simulator và API `/api/admin/security/simulate-attack` để kiểm chứng độ tin cậy của RLS DB. **[HOÀN THÀNH]**
- Ánh xạ Ma trận tuân thủ (ISO/IEC 27017 Compliance Matrix): Bảng đối chiếu thực tế từng điều khoản kiểm soát bảo mật cloud với bằng chứng kỹ thuật cụ thể đã cài đặt. **[HOÀN THÀNH]**

> [!TIP]
> **Báo cáo Phân tích Kỹ thuật & Chứng minh Học thuật chuyên sâu:** Toàn bộ bằng chứng thực nghiệm và lập luận kỹ thuật của 4 phân hệ bảo mật cốt lõi (Tối ưu RLS $O(1)$ Query Execution Plan, Động cơ SOAR & Webhook Telegram alert, Disaster Recovery cô lập cấp Tenant, và giải pháp Caching cô lập chống rò rỉ dữ liệu) được trình bày chi tiết phục vụ viết luận văn tại [21_TECHNICAL_SECURITY_ANALYSIS.md](file:///e:/PTIT_THESIS_SAAS/docs/21_TECHNICAL_SECURITY_ANALYSIS.md).

### Chương 6: Kết luận & Hướng phát triển
- Tổng kết kết quả đạt được **[HOÀN THÀNH]**
- **Hạn chế:** 
  - Điểm mù trong khôi phục dữ liệu (Disaster Recovery) cục bộ cho từng Tenant trong mô hình Shared DB (rủi ro rollback chéo). Đã nâng cấp cho phép Export dữ liệu thô dạng JSON cô lập cho riêng từng Tenant. **[ĐÃ GIẢM THIỂU]**
  - Lỗ hổng "Người gác đền cũng có thể là kẻ trộm" (Audit Log Tampering): Rủi ro quản trị viên cấp cao (Super Admin) tự ý xóa dấu vết vì Audit Log đang được lưu trên cùng một CSDL vật lý với ứng dụng. **[CẦN PHÁT TRIỂN THÊM]**
- **Hướng phát triển:** 
  - Đề xuất Chiến lược kiến trúc lai (Hybrid Strategy): Cung cấp Shared DB cho gói Standard và tự động cấp phát CSDL riêng (Isolated DB) cho tệp khách hàng Enterprise có yêu cầu HIPAA/Tài chính. **[ĐỊNH HƯỚNG TƯƠNG LAI]**
  - Giải pháp WORM Storage: Tích hợp cơ chế Forwarding Audit Log ra hệ thống SIEM lưu trữ độc lập (như Splunk, AWS S3) để đảm bảo tính bất biến tuyệt đối. **[ĐỊNH HƯỚNG TƯƠNG LAI]**
  - Tích hợp thêm AI vào hệ thống SIEM/SOC để dự đoán hành vi tấn công. **[ĐỊNH HƯỚNG TƯƠNG LAI]**
  - Triển khai Penetration Testing, đạt chứng nhận SOC 2, Zero Trust Architecture. **[ĐỊNH HƯỚNG TƯƠNG LAI]**

---

## 6. Kế hoạch thực hiện (Chi tiết Học kỳ cuối thực hiện đồ án)

> [!NOTE]
> Kế hoạch 18 tuần dưới đây thể hiện tiến độ chi tiết của học kỳ cuối cùng đăng ký thực hiện đồ án tốt nghiệp chính thức. Lộ trình chuẩn bị, nghiên cứu nền tảng và phát triển hệ thống tổng thể 2 năm được mô tả chi tiết tại Mục 7.2.

| Giai đoạn | Nội dung | Thời gian |
|---|---|---|
| 1 | Nghiên cứu lý thuyết + Tổng quan | Tuần 1–3 |
| 2 | Thiết kế kiến trúc + Mô hình bảo mật | Tuần 4–6 |
| 3 | Triển khai RLS + ABAC + Audit | Tuần 7–10 |
| 4 | SOC Dashboard + DevSecOps | Tuần 11–12 |
| 5 | Đánh giá + Viết báo cáo | Tuần 13–16 |
| 6 | Chỉnh sửa + Bảo vệ | Tuần 17–18 |

---

## 7. Định hướng chiến lược & Lộ trình thực hiện (2 năm)

### 7.1 Định hướng chiến lược phát triển
Đề tài được xây dựng theo định hướng **Nghiên cứu ứng dụng kết hợp Đo lường kiểm chứng kỹ thuật**, tận dụng lợi thế chuyên sâu về Kỹ thuật phần mềm (Software Engineering) và An toàn thông tin (ATTT) để tạo ra sản phẩm thực thi chất lượng cao và có đóng góp khoa học rõ ràng:
- **Sản phẩm thực thi chạy được:** Làm minh chứng kỹ thuật cụ thể cho các luận điểm an toàn dữ liệu.
- **Đánh giá kiểm chứng có số liệu:** Thực hiện benchmark hiệu năng cụ thể và lập bảng đối chiếu compliance (ISO 27017) để khẳng định tính khoa học của đề án.
- **Tập trung cao độ:** Không sa đà vào tối ưu giao diện UI/UX phức tạp hay các tính năng nghiệp vụ thừa, ưu tiên bảo mật cốt lõi và tính cô lập hệ thống.

> [!IMPORTANT]
> **Nhiệm vụ cần làm rõ sớm với Giảng viên hướng dẫn:**
> 1. Xác nhận đề tài được đánh giá theo thiên hướng nghiên cứu ứng dụng (chú trọng thực nghiệm và giải pháp) hay nghiên cứu khoa học thuần túy (chú trọng lý thuyết và mô hình toán học) để điều chỉnh văn phong báo cáo phù hợp.
> 2. Xác nhận yêu cầu về demo trực tiếp (live demo) trong buổi bảo vệ hay chỉ cần quay video minh chứng kết quả thực nghiệm.

### 7.2 Lộ trình thực hiện 2 năm gợi ý

| Giai đoạn | Thời gian | Nội dung công việc | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **Giai đoạn 1** | Hiện tại - Hết năm 2 | - Nghiên cứu sâu về cơ chế hoạt động PostgreSQL RLS.<br>- Đọc hiểu các tiêu chuẩn an toàn đám mây ISO/IEC 27017.<br>- Làm quen hạ tầng Backend-as-a-Service (Supabase). | Nắm vững kiến thức nền tảng và chuẩn bị môi trường Lab thử nghiệm. |
| **Giai đoạn 2** | Năm học thứ 3 | - Thiết kế kiến trúc tổng thể, mô hình RLS Policy Engine.<br>- Viết các chương đầu (Chương 1, 2, 3) của báo cáo đồ án.<br>- Xây dựng prototype (phiên bản thử nghiệm) của hệ thống. | Hoàn thành bộ khung tài liệu và mã nguồn prototype chạy được cơ bản. |
| **Giai đoạn 3** | Đầu năm thứ 4 | - Hoàn thiện toàn bộ các tính năng của hệ thống (SOC Dashboard, AI-powered Audit Log).<br>- Chạy benchmark hiệu năng (performance), vẽ biểu đồ latency/throughput.<br>- Hoàn thiện dự thảo báo cáo đồ án. | Hệ thống hoàn thiện, có dữ liệu benchmark trực quan để đưa vào báo cáo. |
| **Giai đoạn 4** | Cuối năm thứ 4 | - Tối ưu hóa, kiểm thử bảo mật diện rộng.<br>- Chỉnh sửa báo cáo theo ý kiến Hội đồng và chuẩn bị bảo vệ đồ án tốt nghiệp. | Slide thuyết trình, demo hoàn chỉnh và báo cáo đồ án tốt nghiệp xuất sắc. |

---

## 7.3 Cập nhật triển khai (Đối chiếu ngày 22/05/2026)

- **Mục 2.2.4 & 4.3 (SOC Dashboard & Audit Log):** Đã hoàn thành SOC Dashboard hiển thị log an ninh, tích hợp quy tắc phát hiện bất thường (20 thao tác/giờ) và tính năng kết xuất báo cáo Excel, xuất dữ liệu JSON độc lập cho từng Tenant phục vụ Disaster Recovery.
- **Mục 2.2.5 (Noisy Neighbor / Rate Limiting):** Tích hợp Supavisor Connection Pooling kết hợp điều tiết lưu lượng API ghi (Rate Limiting) và widget Noisy Neighbors trực quan.
- **Mục 2.2.6 & 4.3 (Active Defense & SOAR Engine):** Hoàn thành **SOAR Active Defense Engine**. Khi phát hiện tấn công dồn dập (3 vi phạm/phút), database trigger tự động khóa tenant sang trạng thái `suspended`. Middleware Edge Runtime lập tức chặn đứng mọi truy cập từ bên ngoài với giao diện Modern Dark Mode cao cấp.
- **Mục 2.2.6 (Dynamic Telegram Webhook SOC Alerts):** Hoàn thành tích hợp cảnh báo đỏ khẩn cấp trực tiếp về Telegram cá nhân của Admin qua `net.http_post` bất đồng bộ. Đã tối ưu hóa loại bỏ ký tự `%0A` thừa bằng phép nối chuỗi `CHR(10)`, tin nhắn hiển thị phân dòng vô cùng chuyên nghiệp và rõ ràng.
- **Mục 2.2.3 & 4.3 (Immutable Audit Logs - ISO 27017 CLD.12.4.1):** Hiện thực hóa hoàn hảo tính bất biến của nhật ký kiểm toán. Postgres triggers chặn hoàn toàn mọi lệnh `UPDATE` hoặc `DELETE` của toàn bộ người dùng (kể cả Super Admin), trả về lỗi `SECURITY VIOLATION [CLD.12.4.1]` chống chối bỏ.
- **Chương 5 (Performance Benchmarking):** Thiết lập môi trường đo lường hiệu năng thật 100% trên **111,000 bản ghi dữ liệu seed thực tế** trên Supabase Cloud. Vẽ biểu đồ so sánh phân kỳ hiệu năng rõ rệt giữa Custom JWT Claims ($O(\log N)$ optimized) và RLS JOIN ($O(N)$), khắc phục triệt để lỗi TypeScript trên giao diện Dark Mode.
- **DevSecOps / Cron Observability:** Ghi log cron jobs (backup/publish/reminder) để phục vụ audit vận hành.
- **Vòng đời & Trạng thái Tenant (Lifecycle):** Bổ sung chức năng Suspend/Reactivate, badge hiển thị Plan type (Free/Pro/Enterprise) đồng bộ bảo mật Zero Trust.

---

## 8. Tài liệu tham khảo (Dự kiến)

1. Microsoft Azure Architecture Center, "Multi-tenant SaaS Architecture Patterns", 2024.
2. PostgreSQL Documentation, "Row Security Policies", PostgreSQL 16.
3. ISO/IEC 27017:2015, "Code of practice for information security controls based on ISO/IEC 27002 for cloud services".
4. Nghị định 13/2023/NĐ-CP, "Bảo vệ dữ liệu cá nhân", Chính phủ nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.
5. Supabase Documentation, "Row Level Security", 2024.
6. R. Sandhu, "Attribute-Based Access Control Models: A Review", IEEE Computer Society, 2018.
7. OWASP, "Top 10 - A01:2021-Broken Access Control", 2021.
8. Jin, X., Krishnan, R., and Sandhu, R., "A Unified Attribute-Based Access Control Model Covering User, Object, and Environment Attributes", ACM Transactions on Information and System Security (TISSEC), 2012.
9. Al-Kahtani, M. S., and Sandhu, R., "Rule-Based Role-Based Access Control", ACM Workshop on Role-Based Access Control, 2002.
10. Shostack, A., "Threat Modeling: Designing for Security", John Wiley & Sons, 2014.
11. Saltzer, J. H., and Schroeder, M. D., "The Protection of Information in Computer Systems", Proceedings of the IEEE, 1975.
12. NIST Special Publication 800-207, "Zero Trust Architecture", National Institute of Standards and Technology, 2020.
13. Kuhn, D. R., Coyne, E. J., and Weil, T. R., "Adding Attributes to Role-Based Access Control", IEEE Computer, 2010.
14. W. Stallings, "Effective Cybersecurity: A Guide to Active Defense and Security Principles", Addison-Wesley Professional, 2018.
15. IEEE Standard 802.1Q, "Standard for Local and Metropolitan Area Networks—Bridges and Bridged Networks" (Intranet network isolation concepts).
16. Hu, V. C., Kuhn, D. R., and Ferraiolo, D. F., "Attribute-Based Access Control for Cloud Infrastructure", IEEE Cloud Computing, 2015.

