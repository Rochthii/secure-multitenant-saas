# Đề Cương Đồ Án Tốt Nghiệp

> **Học viện:** Học viện Công nghệ Bưu chính Viễn thông (PTIT)  
> **Khoa:** Công nghệ Thông tin  
> **Ngành:** Công nghệ Thông tin (Chuyên ngành Kỹ thuật phần mềm & An toàn thông tin)  
> **Sinh viên:** Chăm Rốch Thi  
> **Cập nhật:** 2026-05-25

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
| **WORM** | Write Once, Read Many (Ghi một lần, đọc nhiều lần - Tính bất biến vật lý) |
| **SOAR** | Security Orchestration, Automation, and Response (Tự động hóa phản ứng an ninh) |
| **ZTA** | Zero Trust Architecture (Kiến trúc an ninh mạng không tin cậy) |
| **SOC** | Security Operations Center (Trung tâm điều hành an ninh) |
| **SHA-256** | Secure Hash Algorithm 256-bit (Thuật toán băm an toàn 256-bit) |
| **CRUD** | Create, Read, Update, Delete (Tạo, Đọc, Sửa, Xóa) |
| **API** | Application Programming Interface (Giao diện lập trình ứng dụng) |
| **Smart Router** | Bộ định tuyến thông minh (Định tuyến yêu cầu dựa trên Tenant Domain/Subdomain ở Edge) |
| **Intranet Lockdown** | Cơ chế khóa mạng nội bộ (Chỉ cho phép truy cập tài nguyên Tenant từ IP được chỉ định) |

---

## 1. Tính cấp thiết của đề tài

### 1.1 Bối cảnh thực tiễn
- **Xu hướng SaaS đa khách hàng:** Mô hình SaaS đang chiếm ưu thế trong ngành phần mềm doanh nghiệp. Tuy nhiên, việc nhiều tổ chức (tenant) cùng chia sẻ hạ tầng vật lý đặt ra thách thức nghiêm trọng về **cô lập dữ liệu** và **quản trị rủi ro thông tin**.
- **Rò rỉ dữ liệu cross-tenant:** Nhiều sự cố bảo mật lớn (Salesforce, Zendesk, HubSpot) xuất phát từ lỗi cô lập dữ liệu ở tầng ứng dụng. Nguyên nhân gốc rễ: phụ thuộc application-layer filtering thay vì database-level enforcement.
- **Bối cảnh pháp lý tại Việt Nam:** Việc tuân thủ **Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân** yêu cầu các đơn vị cung cấp dịch vụ cloud phải có cơ chế kiểm soát truy cập nghiêm ngặt và minh chứng được việc cô lập dữ liệu người dùng một cách an toàn.
- **Yêu cầu tuân thủ quốc tế:** ISO/IEC 27017, SOC 2, GDPR đều yêu cầu hệ thống cloud phải có cơ chế kiểm soát truy cập đặc quyền, nhật ký kiểm toán bất biến, và quy trình ứng phó sự cố.

### 1.2 Khoảng trống nghiên cứu
- Đa số tài liệu hiện có tập trung vào **kiến trúc multi-tenant** (shared DB vs. isolated DB) nhưng **ít đề cập cụ thể** cách triển khai bảo mật tầng database bằng **Row-Level Security (RLS)** kết hợp **Audit Trail** bất biến và **SOAR phản ứng tự động** trong thực tế.
- Thiếu nghiên cứu thực nghiệm đo lường **chi phí hiệu năng (Cost of Security)** và ánh xạ giữa **kiến trúc kỹ thuật RLS** với **khung quản trị rủi ro ISO 27017** cho nền tảng cloud SaaS.

---

## 2. Mục tiêu nghiên cứu

### 2.1 Mục tiêu tổng quát
Nghiên cứu và thiết kế kiến trúc phần mềm an toàn cho nền tảng đa khách hàng theo mô hình **Zero Trust**, trong đó bảo mật dữ liệu được thực thi cứng ở tầng database thay vì tầng ứng dụng, đồng thời xây dựng hệ thống nhật ký kiểm toán bất biến và động cơ phản ứng chủ động phục vụ quản trị rủi ro thông tin.

### 2.2 Mục tiêu cụ thể
1. **Thiết kế mô hình cô lập dữ liệu** theo phương pháp Shared Database — Shared Schema, sử dụng PostgreSQL Row-Level Security (RLS) kết hợp tối ưu hóa JWT Claims để triệt tiêu độ trễ JOIN query.
2. **Xây dựng mô hình phân quyền lai RBAC + ABAC**, xác định vai trò cơ bản (RBAC) kết hợp các thuộc tính ngữ cảnh (giờ hành chính, IP mạng) để ngăn chặn lạm quyền đặc quyền ngoài giờ.
3. **Triển khai hệ thống Audit Log bất biến** — bảo vệ log ở cấp độ CSDL chống can thiệp bằng triggers chặn UPDATE/DELETE, nâng cấp module sổ cái mã hóa liên kết chuỗi SHA-256 (WORM Vault) chống giả mạo vật lý.
4. **Xây dựng cơ chế phòng vệ chủ động (SOAR Active Defense):** Tự động khóa cô lập Tenant bị tấn công dồn dập (3 vi phạm/phút) và gửi webhook cảnh báo khẩn cấp Telegram định dạng phân dòng rõ nét.
5. **Thiết kế cơ chế chống nghẽn tải (Noisy Neighbor Protection):** Điều phối lưu lượng concurrent queries qua Supavisor connection pooling và Rate Limiting ở chiều ghi.
6. **Xây dựng trang đo đạc thực nghiệm (Performance Benchmarking):** Đo lường trực quan tốc độ xử lý trên **111,000 bản ghi dữ liệu thật**, chứng minh khả năng triệt tiêu overhead xác thực về mức thời gian hằng số (Constant-time context resolution) và tối ưu hóa lọc dữ liệu ở độ phức tạp $O(\log N_{\text{tenant}})$ (B-Tree Index Scan) của giải pháp đề xuất.
7. **Ánh xạ kiến trúc kỹ thuật** với khung tiêu chuẩn **ISO/IEC 27017** — chứng minh tính tuân thủ và khả năng triển khai trong môi trường doanh nghiệp thực tế.

---

## 3. Đối tượng & Phạm vi nghiên cứu

### 3.1 Đối tượng nghiên cứu
- Kiến trúc phần mềm SaaS đa khách hàng (Multi-tenant Architecture).
- Cơ chế Row-Level Security (RLS) trong PostgreSQL và tối ưu hóa JWT Custom Claims.
- Hệ thống Audit Log bất biến mật mã học (WORM Ledger) và giám sát hành vi.
- Công cụ phản ứng tự động ứng phó sự cố bảo mật (SOAR Engine).
- Khung quản trị rủi ro thông tin đám mây ISO/IEC 27017.

### 3.2 Phạm vi kỹ thuật

| Lớp | Công nghệ sử dụng thực tế | Vai trò trong đề tài |
|---|---|---|
| **Frontend** | Next.js 16 (App Router), Recharts, TailwindCSS | Giao diện quản trị, Cyber SOC Dashboard & Performance Benchmarking |
| **Backend** | Next.js Server Actions, API Routes, Edge Runtime | Điểm kiểm tra phân vùng mạng, điều phối tải, gateway bảo mật |
| **Database** | PostgreSQL (Supabase), pgvector | **Core:** RLS Policies, ABAC Functions, Database Triggers |
| **Auth** | Supabase Auth (JWT Custom Claims) | Xác thực danh tính và giải quyết identity trong RAM với chi phí overhead hằng số (Constant-time) cho RLS |
| **Security Vault** | SHA-256 Hash-chaining (WORM Vault) | Module lưu trữ sổ cái audit log mật mã học bất biến chống tampering |
| **Resource Pooler** | Supavisor (Connection Limit Engine) | Tránh starvation, cô lập connection slots theo gói tài khoản của tenant |
| **Active Alerting** | Telegram Webhook API (bất đồng bộ `net.http_post`) | Kênh bắn cảnh báo SOS thời gian thực cho kỹ sư SOC |
| **AI (Phụ trợ)** | Deno Edge Functions, Hybrid Search, Concept Traversal | **Phụ trợ:** Trợ lý AI hỏi đáp quy trình và sinh quiz tự động |

### 3.3 Giới hạn phạm vi
- Đề tài **tập trung 100% vào kiến trúc bảo mật cốt lõi, cô lập dữ liệu và thực nghiệm hiệu năng**.
- Không bao gồm phát triển Mobile App và hệ thống GIS/PostGIS.
- Phân hệ AI/RAG (Trợ lý AI Doanh nghiệp & GraphRAG) chỉ là **tính năng phụ trợ thử nghiệm (Supplementary Feature)** nhằm làm phong phú hệ sinh thái SaaS và tăng trải nghiệm người dùng cuối, hoàn toàn không phải mục tiêu an ninh cốt lõi của đồ án.
- Đánh giá bảo mật dừng ở mức **kiến trúc, thiết kế và giả lập tấn công thực tế (threat simulation)**, không thực hiện penetration testing hệ thống hạ tầng cloud.

---

## 4. Phương pháp nghiên cứu

### 4.1 Nghiên cứu lý thuyết
- Tổng quan mô hình Multi-tenant Architecture: Shared DB — Shared Schema.
- Nghiên cứu PostgreSQL RLS: cơ chế hoạt động, CREATE POLICY, SECURITY DEFINER functions.
- Cơ chế mật mã học băm SHA-256 và liên kết chuỗi khối phục vụ lưu trữ bất biến.
- Phân tích khung tiêu chuẩn ISO/IEC 27017 và ánh xạ sang kiến trúc kỹ thuật.

### 4.2 Thiết kế & Triển khai
- Thiết kế kiến trúc Defense-in-depth 4 lớp theo mô hình Zero Trust: Middleware Edge $\rightarrow$ App Auth (JWT) $\rightarrow$ Database RLS $\rightarrow$ DB Triggers.
- Triển khai mô hình RBAC (6 vai trò) + ABAC (time-based, IP-based).
- Triển khai Audit Log System bất biến ở cấp DB kết hợp WORM Vault mã hóa SHA-256.
- Triển khai SOAR Engine tự động khóa tenant bị tấn công dồn dập và webhook Telegram cảnh báo đỏ khẩn cấp.
- Triển khai Dashboard Threat Simulator v4 giả lập 4 cuộc tấn công thực tế (Cross-tenant, Path Traversal, SQL Injection, Cache Pollution/Noisy Neighbor).
- Triển khai Performance Benchmarking trên 111,000 dòng dữ liệu thực tế.

### 4.3 Đánh giá & Kiểm chứng
- **Kiểm chứng cô lập dữ liệu:** Viết test suite Vitest giả lập tấn công chéo tenant — chứng minh RLS ngăn chặn thành công và ghi nhận vi phạm an ninh.
- **Đo lường hiệu năng (Benchmark):** So sánh trực tiếp P50/P95/P99 latency của 3 phương pháp lọc khi dữ liệu phình to lên đến 100,000 dòng.
- **Ánh xạ ISO 27017:** Lập ma trận đối chiếu từng control domain với minh chứng file mã nguồn cụ thể.

---

## 5. Nội dung chính dự kiến

### Chương 1: Tổng quan
- Bối cảnh và tính cấp thiết của đề tài.
- Mục tiêu, đối tượng và phạm vi nghiên cứu.
- Đóng góp khoa học và thực tiễn của đề tài.

### Chương 2: Cơ sở lý thuyết & Công nghệ nền tảng
- **Mô hình Multi-tenant Architecture:** So sánh các kiến trúc cô lập dữ liệu.
- **PostgreSQL Row-Level Security (RLS) & JWT Custom Claims:** Cơ chế trích xuất context bảo mật trong bộ nhớ và thuật toán quét chỉ mục B-Tree Index.
- **Mô hình phân quyền lai RBAC + ABAC:** Phân kiểm soát truy cập dựa trên vai trò doanh nghiệp và ngữ cảnh thuộc tính động (giờ làm việc, IP Whitelist).
- **Tính bất biến của Audit Trail (ISO 27017 CLD.12.4.1):** Cơ chế trigger CSDL kết hợp thuật toán băm liên kết chuỗi khối SHA-256 (WORM Vault Ledger) chống chối bỏ.
- **Cơ chế phản ứng tự động SOAR & Active Defense:** Định nghĩa rules-based anomaly detection và tự động khóa cô lập nguy cơ (Auto-suspension).
- **Cơ chế chống Noisy Neighbor:** Nguyên lý Rate Limiting ở chiều ghi và điều phối kết nối cô lập (Supavisor Connection Limits).
- **Phân vùng Edge Security:** Nguyên lý hoạt động của Edge Middleware Smart Router (<4ms) và Intranet Lockdown.
- **Nguyên lý thiết kế an toàn Zero Trust Architecture (ZTA).**

### Chương 3: Phân tích & Thiết kế Kiến trúc
- Thiết kế kiến trúc tổng thể hệ thống (System Architecture) theo triết lý Zero Trust.
- Thiết kế mô hình dữ liệu đa khách hàng Shared Schema.
- Thiết kế kiến trúc hình phễu Defense-in-depth 4 lớp bảo vệ.
- Thiết kế RLS Policy Engine & thuật toán trích xuất claim in-memory đạt tốc độ phân giải hằng số (Constant-time) trong RAM và truy xuất dữ liệu đạt $O(\log N)$ Indexed Scan.
- Thiết kế sổ cái Audit Trail mật mã học bất biến (Cryptographic WORM Vault) dùng SHA-256.
- Thiết kế động cơ SOAR tự động khóa tenant bị tấn công (3 vi phạm/phút) và Telegram alert bất đồng bộ.
- Thiết kế Tenant-scoped Connection Limits (Supavisor) chống nghẽn tài nguyên ghi.
- Thiết kế cơ chế khôi phục dữ liệu cô lập cấp Tenant (Disaster Recovery) dùng cơ chế UPSERT chống rollback chéo.

### Chương 4: Triển khai Hệ thống thực tế
- Triển khai Edge Middleware Smart Router động và Intranet Lockdown IP check động dựa trên database.
- Triển khai hệ thống RLS Policies tối ưu hóa trên PostgreSQL.
- Triển khai các hàm kiểm tra thuộc tính ABAC (giờ hành chính, IP nội bộ).
- Triển khai module mã hóa sổ cái audit logs bất biến [worm-vault.ts](file:///e:/PTIT_THESIS_SAAS/lib/security/worm-vault.ts).
- Triển khai module điều phối giới hạn kết nối [tenant-pooler.ts](file:///e:/PTIT_THESIS_SAAS/lib/security/tenant-pooler.ts) của Supavisor.
- Triển khai trigger SOAR `soc_active_alert_trigger` và webhook Telegram Bot (`CHR(10)` ngắt dòng).
- Triển khai Dashboard Threat Simulator v4 hỗ trợ giả lập 4 kịch bản tấn công thực tế kèm PostgreSQL EXPLAIN ANALYZE và terminal giải thích lý do chặn (Why Blocked).
- Triển khai trang Performance Benchmarking trên 111,000 dòng dữ liệu thật, giải quyết triệt để các lỗi kiểu TypeScript của Recharts Tooltip.

### Chương 5: Đánh giá & Thực nghiệm đo lường
- **Xây dựng mô hình Threat Modeling (STRIDE):** Phân tích 6 attack vectors chính đối với hệ thống đa khách hàng và cách kiến trúc đề xuất ngăn chặn từng nguy cơ.
- **Đo lường hiệu năng thực tế (Performance Benchmarking):**
  - So sánh trực tiếp P50, P95, P99 Latency của 3 baseline: App-side filtering vs RLS JOIN vs Optimized JWT Claims.
  - Phân tích biểu đồ Scaling: Chứng minh giải pháp đề xuất triệt tiêu hoàn toàn chi phí JOIN phân quyền, duy trì độ trễ overhead an ninh ở mức hằng số (Constant-time) độc lập với quy mô tại mốc 100,000 bản ghi.
- **Thực nghiệm giả lập tấn công (Threat Simulation):** Ghi nhận tỷ lệ chặn đứng thành công 100% của RLS và kích hoạt SOAR bảo vệ chủ động.
- **Ánh xạ Ma trận tuân thủ tiêu chuẩn an toàn đám mây ISO/IEC 27017:** Đối chiếu các điều khoản CLD.6.3.1, CLD.9.5.1, CLD.12.4.1 và CLD.13.1.2.

### Chương 6: Kết luận & Hướng phát triển
- Tổng kết kết quả đạt được.
- **Hạn chế:**
  - Rủi ro dừng hệ thống (RTO) khi khôi phục dữ liệu (UPSERT) ở quy mô cực lớn có các ràng buộc FK phức tạp.
  - Audit log vẫn nằm trên cùng một CSDL vật lý với dữ liệu ứng dụng.
- **Hướng phát triển chiến lược:**
  - Tích hợp Audit Log Forwarding ra AWS S3 WORM Storage (Object Lock) bên ngoài độc lập.
  - Thiết lập Tenant-scoped Connection Limits trực tiếp trên Supavisor.
  - Phát triển hệ thống AI RAG & GraphRAG (Knowledge Graph RAG) làm phân hệ phụ trợ truy vấn log an ninh bằng ngôn ngữ tự nhiên và truy vết Attack Path (Patient Zero).

---

## 6. Kế hoạch thực hiện (Chi tiết Học kỳ cuối thực hiện đồ án)

| Giai đoạn | Nội dung công việc | Thời gian |
|---|---|---|
| 1 | Nghiên cứu lý thuyết nền tảng (Zero Trust, RLS, ISO 27017) | Tuần 1–3 |
| 2 | Thiết kế kiến trúc tổng thể & mô hình RLS Policy Engine | Tuần 4–6 |
| 3 | Triển khai RLS, ABAC, Audit Log bất biến và WORM Vault | Tuần 7–10 |
| 4 | Xây dựng SOAR Engine, Threat Simulator và SOC Dashboard | Tuần 11–12 |
| 5 | Chạy thực nghiệm benchmark, đo lường số liệu và viết báo cáo | Tuần 13–16 |
| 6 | Chỉnh sửa hoàn thiện báo cáo và bảo vệ đồ án tốt nghiệp | Tuần 17–18 |

---

## 7. Định hướng chiến lược & Lộ trình thực hiện (2 năm)

### 7.1 Định hướng chiến lược phát triển
Đề tài được xây dựng theo định hướng **Nghiên cứu ứng dụng kết hợp Đo lường kiểm chứng kỹ thuật**, tận dụng lợi thế chuyên sâu về Kỹ thuật phần mềm và An toàn thông tin để tạo ra sản phẩm thực thi chất lượng cao và có đóng góp khoa học rõ ràng:
- **Sản phẩm thực thi chạy được:** Làm minh chứng kỹ thuật cụ thể cho các luận điểm an toàn dữ liệu.
- **Đánh giá kiểm chứng có số liệu:** Thực hiện benchmark hiệu năng cụ thể và lập bảng đối chiếu compliance (ISO 27017) để khẳng định tính khoa học của đề án.
- **Tập trung cao độ:** Không sa đà vào tối ưu giao diện UI/UX phức tạp hay các tính năng nghiệp vụ thừa, ưu tiên bảo mật cốt lõi và tính cô lập hệ thống.

---

### 7.2 Cập nhật triển khai thực tế (Đối chiếu ngày 25/05/2026)

Hệ thống đã được hiện thực hóa xuất sắc với các kết quả cụ thể:
- **Mục 2.2.4 & 4.3 (SOC Dashboard & Audit Log):** Hoàn thành SOC Dashboard hiển thị log an ninh, tích hợp quy tắc phát hiện bất thường (20 thao tác/giờ) và tính năng kết xuất báo cáo Excel, xuất dữ liệu JSON độc lập cho từng Tenant phục vụ Disaster Recovery.
- **Mục 2.2.5 (Noisy Neighbor / Connection Limit):** Tích hợp module điều phối [tenant-pooler.ts](file:///e:/PTIT_THESIS_SAAS/lib/security/tenant-pooler.ts) cô lập slots kết nối của Supavisor và điều tiết lưu lượng API ghi (Rate Limiting).
- **Mục 2.2.6 & 4.3 (Active Defense & SOAR Engine):** Hoàn thành **SOAR Active Defense Engine** tự động suspend tenant khi phát hiện 3 vi phạm/phút. Middleware Edge Runtime lập tức chặn đứng mọi truy cập từ bên ngoài, trả về giao diện SOAR LOCKDOWN cao cấp.
- **Mục 2.2.6 (Dynamic Telegram Webhook SOC Alerts):** Hoàn thành tích hợp cảnh báo đỏ khẩn cấp trực tiếp về Telegram cá nhân của Admin qua `net.http_post` bất đồng bộ, tối ưu hóa loại bỏ ký tự `%0A` thừa bằng phép nối chuỗi `CHR(10)`.
- **Mục 2.2.3 & 4.3 (Immutable Audit Logs - ISO 27017 CLD.12.4.1):** Áp dụng database trigger chặn hoàn toàn lệnh `UPDATE` hoặc `DELETE` tác động lên bảng `audit_logs` của toàn bộ người dùng, kết hợp module lưu trữ băm SHA-256 chuỗi khối [worm-vault.ts](file:///e:/PTIT_THESIS_SAAS/lib/security/worm-vault.ts).
- **Chương 5 (Performance Benchmarking):** Thiết lập môi trường đo lường hiệu năng thật 100% trên **111,000 bản ghi dữ liệu seed thực tế** trên Supabase Cloud. Vẽ biểu đồ so sánh phân kỳ hiệu năng rõ rệt giữa Custom JWT Claims (tối ưu hóa overhead xác thực bằng cơ chế Constant-time trong RAM) và RLS JOIN (phương pháp JOIN truyền thống tốn kém), khắc phục triệt để lỗi TypeScript trên giao diện.
- **Threat Simulator v4:** Mở rộng đầy đủ 4 kịch bản tấn công giả lập thực tế kèm tab EXPLAIN ANALYZE và Why Blocked Terminal, giúp hệ thống tự nói lên các ưu điểm bảo mật của mình.

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
