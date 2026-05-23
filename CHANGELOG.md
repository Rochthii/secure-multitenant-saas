# Changelog

Tất cả các thay đổi đáng chú ý đối với nền tảng Secure Multi-tenant SaaS sẽ được ghi lại trong tệp này.

## [1.5.0] - 2026-05-23

### Tích hợp & Refactor hoàn chỉnh AI Security Copilot & GraphRAG (SecOps Alignment)
- **Tái thiết lập CSDL RAG & GraphRAG**: Áp dụng migrations khởi tạo schema và 10 PostgreSQL RPCs nâng cao cho tìm kiếm lai (hybrid search) và duyệt đồ thị tri thức (GraphRAG traversal) cô lập an toàn giữa các tenant.
- **Dữ liệu mẫu Chính sách ISO 27001 thực tế**: Nạp dữ liệu mẫu chính sách doanh nghiệp chuyên sâu qua 4 chuyên đề tương ứng với các phòng ban cốt lõi (`THERAVADA` -> HR & NDA, `MAHAYANA` -> IT Security & ISO 27001, `VAJRAYANA` -> Finance Audit, `KHATTSI` -> Executive Board).
- **Refactor Edge Function**: Chuyển đổi system prompt, classifier, expander và các nhãn UX của Edge Function `rag-chat` sang vai trò Sĩ quan An ninh (SecOps Officer), loại bỏ sạch sẽ các từ ngữ tôn giáo/chùa chiền cũ để tương thích hoàn toàn với đồ án PTIT.
- **AI Đàm thoại An ninh & Phòng thủ chủ động**: 
  - Phát triển Widget đàm thoại AI floating widget cao cấp (Premium Dark Mode, Glassmorphism, Neon LED status) nhúng toàn cục vào Admin layout.
  - Tích hợp tính năng AI tự động phòng vệ (Active Defense): AI tự động phân tích logs an ninh và bóp cò API Force Logout tài khoản nghi vấn chỉ trong 2 giây mà không cần phê duyệt thủ công khi bật "Auto Defense".
  - Tích hợp nút xuất báo cáo an ninh Markdown (.md) chuẩn ISO 27001 chỉ với 1 click tải về máy.
- **Kiểm thử liên thông Vitest**: Viết test suite `__tests__/integration/ai-copilot-context.test.ts` kiểm định API an toàn, đạt 100% PASS kiểm soát phân quyền.

### Đồng bộ & Dọn dẹp hệ thống Tài liệu Đồ án PTIT (Docs Synchronization)
- **Refactor 6 Tài liệu RAG chuyên sâu**: Cập nhật toàn diện các tệp tin trong `/docs/ai-rag/` (`INGESTION_GUIDE.md`, `DECOUPLING_GUIDE.md`, `IP_MANIFESTO.md`, `TECHNICAL_ARCHITECTURE.md`, `NCKH_LONG_FORM_STRUCTURE.md`, `NCKH_GRAPHRAG_RESEARCH_GUIDE.md`) chuyển dịch hoàn toàn sang ngữ cảnh doanh nghiệp, quản trị rủi ro an ninh thông tin.
- **Loại bỏ từ khóa cũ**: Sửa đổi tệp tin đề cương tốt nghiệp `docs/17_GRADUATION_THESIS_PROPOSAL.md` loại bỏ hoàn toàn từ khóa "tự viện" sót lại tại dòng 71.
- **Dọn dẹp không gian Workspace**: Di chuyển các tài liệu lịch sử sprint cũ (`docs/sprint` và `docs/sprints`) sang `/docs/_legacy_archive` để giữ cho thư mục `/docs/` hoạt động hoàn toàn nhất quán, thuần túy SecOps/ISO 27001.

## [1.4.0] - 2026-05-23

### Bảo mật cấp Doanh nghiệp (Enterprise-grade Security Hardening)
- **Lưu trữ Audit Log bất biến WORM (Write Once, Read Many)**: Thiết lập module sổ cái mật mã học [worm-vault.ts](file:///e:/PTIT_THESIS_SAAS/lib/security/worm-vault.ts) tự động đồng bộ audit logs từ Postgres thành các khối liên kết chuỗi mã hóa (Hash-chained immutable blocks) sử dụng SHA-256. Hệ thống thực hiện kiểm toán tính toàn vẹn (cryptographic integrity check) và đối chiếu chéo cơ sở dữ liệu để cảnh báo tức thì mọi hành vi can thiệp hay xóa dấu vết.
- **Bảo vệ tài nguyên chống Noisy Neighbor**: Triển khai module điều tiết tài nguyên kết nối [tenant-pooler.ts](file:///e:/PTIT_THESIS_SAAS/lib/security/tenant-pooler.ts) mô phỏng chính sách giới hạn kết nối đồng thời cô lập (Isolated Connection Slots) của Supavisor. Tự động kiểm soát lưu lượng concurrent queries theo kế hoạch Tenant Plan (Free: 3 slots, Pro: 10 slots, Enterprise: 40 slots), chặn đứng và trả về mã lỗi 429 Too Many Requests khi có hiện tượng query flood để bảo toàn tài nguyên cho các chi nhánh lành mạnh.
- **Giao diện Giám sát SOC Mới**:
  - Bổ sung **WORM Cryptographic Vault widget** hiển thị trực quan trạng thái liên kết chuỗi mã hóa, lịch sử block, và cung cấp nút giả lập can thiệp phá vỡ chuỗi để chứng minh tính tự kiểm toán.
  - Bổ sung **Tenant Connection Pooler widget** hiển thị thời gian thực mức độ chiếm dụng slot kết nối của từng Tenant, đi kèm bảng điều khiển giả lập tấn công dồn dập (Noisy Neighbor flood query) trả về mã lỗi 429 từ server.
  - Tích hợp 2 widget mới này vào trang quản trị an ninh [page.tsx (security-center)](file:///e:/PTIT_THESIS_SAAS/app/admin/security-center/page.tsx).
- **Mở rộng kịch bản Threat Simulator**: Tích hợp kịch bản giả lập thứ 4 **Noisy Neighbor connection limits** vào API `/api/admin/security/simulate-attack` và component [threat-simulator.tsx](file:///e:/PTIT_THESIS_SAAS/components/admin/threat-simulator.tsx), chứng minh hoàn hảo nguyên lý giới hạn tài nguyên và điều phối tải (Rate Limiting & Connection Limit) cho đồ án tốt nghiệp.

## [1.3.0] - 2026-05-23

### Nâng cấp Threat Simulator (Security Platform Engineering)
- **Chuẩn hóa học thuật độ phức tạp**: Điều chỉnh thông số hiệu năng của Postgres RLS trên UI sang dạng $O(\log N)$ optimized (Index Scan) và tiệm cận $O(1)$ cho in-memory JWT claims, đi kèm chú thích nguồn gốc thực nghiệm và điều kiện dataset benchmark.
- **Tích hợp PostgreSQL EXPLAIN ANALYZE**: Bổ sung tab **Database Plan** hiển thị chi tiết cây truy vấn thực tế dưới database engine (B-Tree Index Scan, planning/execution time) cho cả 3 kịch bản giả lập.
- **Bổ sung bản tin log SOC (Why Blocked)**: Tích hợp trường `why_blocked` chi tiết từ API hiển thị dưới dạng monospace terminal để chứng minh chính xác logic chặn và từ chối truy cập chéo tenant hoặc escape SQL Injection.
- **Tăng cường Security Impact**: Tích hợp phân loại mức độ nguy hại chuẩn học thuật bao gồm: Severity level, điểm số CVSS, MITRE ATT&CK mapping ID, và OWASP Top 10 category.
- **Mã nguồn mẫu SQL Injection thực tế**: Thay thế mã Hacker Code trong kịch bản SQL Injection bằng ví dụ nối chuỗi truy vấn thô (Vulnerable code - Raw SQL query string concatenation) để tăng tính thực tiễn học thuật của lỗ hổng.
- **Trực quan hóa luồng tấn công (Dynamic Attack Flow)**: Thiết kế sơ đồ Attack Flow động mô phỏng đường đi của request và các chốt chặn (Edge Cache, Router, JWT Claims, DB RLS, Parameterized) tương ứng cho từng Scenario.
- **Vá lỗi False-Positive của Cache Pollution**: Thêm filter `.eq('tenant_id', tenantA.id)` khi kiểm tra chéo cache dưới quyền Super Admin, ngăn chặn cảnh báo rò rỉ giả và hiển thị màu xanh "CHẶN THÀNH CÔNG" chính xác.

### Kiểm thử & Tích hợp (Testing & Integration)
- **Tạo test tích hợp Vitest**: Viết test case `__tests__/integration/simulate-attack.test.ts` kiểm chứng toàn diện API route giả lập tấn công, bao gồm quyền hạn Admin, phản hồi dữ liệu và cấu trúc metadata an ninh.
- **Kiểm định chất lượng Next.js**: Chạy biên dịch Next.js build hoàn thành 100% không có lỗi compile.

### Đồng bộ tài liệu luận văn (Docs Sync)
- **Cập nhật báo cáo kỹ thuật**: Sửa đổi toàn bộ các tài liệu học thuật [21_TECHNICAL_SECURITY_ANALYSIS.md](file:///e:/PTIT_THESIS_SAAS/docs/21_TECHNICAL_SECURITY_ANALYSIS.md), [18_PROPOSAL_MAPPING_ANALYSIS.md](file:///e:/PTIT_THESIS_SAAS/docs/18_PROPOSAL_MAPPING_ANALYSIS.md), và [17_GRADUATION_THESIS_PROPOSAL.md](file:///e:/PTIT_THESIS_SAAS/docs/17_GRADUATION_THESIS_PROPOSAL.md) để đồng nhất định nghĩa độ phức tạp phân quyền tiệm cận $O(1)$ và lọc bản ghi CSDL đạt $O(\log N)$ nhờ chỉ mục B-Tree.

## [1.2.0] - 2026-05-22

### Bảo mật & SOAR Active Defense (Security & Incident Response)
- **Tự động phòng vệ SOAR Engine**: Thiết lập trigger an ninh `soc_active_alert_trigger` tự động đếm tần suất tấn công chéo tenant, SQL injection hoặc cache pollution. Khi phát hiện từ 3 hành vi tấn công trong 1 phút, hệ thống tự động chuyển trạng thái chi nhánh sang `suspended` để cô lập rủi ro.
- **Khắc phục lỗi xuống dòng Telegram Webhook**: Thay thế toàn bộ ký tự `%0A` thô trong PL/pgSQL bằng phép ghép chuỗi với `CHR(10)` để tự động serialize thành `\n` trong JSON payload. Bot Telegram gửi tin nhắn cảnh báo đỏ Cyber SOC phân dòng đẹp mắt, có tích hợp emoji linh hoạt theo mức độ hiểm họa (CRITICAL: 🟥, HIGH: 🟧).
- **Dynamic Intranet & Status Lockdown**: Cải tiến Next.js Edge Middleware để fetch trực tiếp `ip_whitelist` và `lifecycle_status` của Tenant từ Supabase qua PostgREST API. Chặn truy cập tức thời các tenant bị khóa hoặc IP lạ ngoài Whitelist với giao diện Modern Dark Mode cao cấp.
- **Nhật ký bất biến (Immutable Audit Logs - ISO 27017 CLD.12.4.1)**: Áp dụng trigger database chặn đứng 100% mọi thao tác `UPDATE` và `DELETE` của toàn bộ người dùng (kể cả Super Admin), trả về mã lỗi bảo mật `SECURITY VIOLATION [CLD.12.4.1]`.

### Học thuật & Thực nghiệm (Academic Benchmarking)
- **Chuẩn hóa API đo lường hiệu năng**: Cập nhật hàm RPC `benchmark_rls_join` trên PostgreSQL tương thích cấu trúc bảng `tenants` mới. Nâng cấp `scaling-engine.ts` để gọi API đo lường thật dựa trên Session Context thực tế của tenant đang hoạt động thay vì hardcode tĩnh.
- **Seed dữ liệu quy mô lớn**: Cài đặt thành công **111,000 bản ghi dữ liệu benchmark** trên cơ sở dữ liệu Supabase Cloud thật để vẽ đường cong phân kỳ hiệu năng chính xác của Custom JWT Claims (O(1)) so with RLS JOIN (O(N)).
- **Tối ưu hóa giao diện đồ thị**: Khắc phục triệt để các lỗi TypeScript liên quan đến Recharts Tooltip trong giao diện Premium Dark Mode tại `/admin/performance` giúp vẽ biểu đồ trực quan, đẹp mắt và trơn tru.

### Tài liệu & Tuân thủ (Documentation & Compliance)
- **Báo cáo Phân tích Kỹ thuật & Chứng minh Học thuật chuyên sâu**: Biên soạn tài liệu [21_TECHNICAL_SECURITY_ANALYSIS.md](file:///e:/PTIT_THESIS_SAAS/docs/21_TECHNICAL_SECURITY_ANALYSIS.md) chi tiết hóa 4 chủ đề bảo mật nặng ký phục vụ viết luận án và phản biện trước hội đồng.
- **Ma trận tuân thủ đám mây**: Xây dựng tài liệu [ISO_27017_COMPLIANCE_MATRIX.md](file:///e:/PTIT_THESIS_SAAS/docs/ISO_27017_COMPLIANCE_MATRIX.md) ánh xạ trực tiếp các tính năng bảo mật vật lý sang khung tiêu chuẩn quốc tế.
- **Ý tưởng bảo vệ đồ án đột phá**: Biên soạn Phụ lục [y_tuong_trinh_bay_do_an.md](file:///C:/Users/Admin/.gemini/antigravity-ide/brain/d2a388ae-f564-429f-b223-2272cdd4d9ac/y_tuong_trinh_bay_do_an.md) định hướng khung slide thuyết trình và sơ đồ Mermaid trực quan để ghi điểm tối đa trước Hội đồng.

## [1.1.0] - 2026-05-21

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