# Changelog

Tất cả các thay đổi đáng chú ý đối với nền tảng Secure Multi-tenant SaaS sẽ được ghi lại trong tệp này.

## [1.10.0] - 2026-06-26

### Cô Lập Kết Nối & Chống "Người Hàng Xóm Ồn Ào" (Supavisor Connection Limits)
- **Database Migration ([20260626100000_update_get_tenant_routing_config.sql](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/supabase/migrations/20260626100000_update_get_tenant_routing_config.sql)):** Cập nhật RPC `get_tenant_routing_config` trả về thêm `tenant_type` (Plan) và `name` phục vụ cho việc tính toán hạn mức kết nối ở Edge/Middleware.
- **Phần Giải cấu hình ở Edge ([edge-defense.ts](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/lib/security/edge-defense.ts)):** Cập nhật hàm `checkEdgeDefense` để phân giải thêm `tenantId`, `tenantPlan`, `tenantName`, hỗ trợ local mode (bỏ qua check whitelist IP nhưng vẫn load cấu hình để chạy simulator local).
- **Chuyển tiếp Headers ở Middleware ([middleware.ts](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/middleware.ts)):** Đọc cấu hình từ Edge Defense và luôn đính kèm các thông tin tenant qua các headers (`x-tenant-id`, `x-tenant-plan`, `x-tenant-name`, `x-client-ip`) cho mọi request được xử lý trên server.
- **Dynamic Resource Limiter ở Connection Client ([server.ts](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/lib/supabase/server.ts)):** Tích hợp custom `fetch` bọc trong `createClient()`. Trước khi thực thi bất kỳ truy vấn nào, client tự động kiểm tra hạn mức kết nối qua `tenantConnectionPooler.acquireSlot()` (Free = 3, Pro = 10, Enterprise = 40). 
  - Chặn đứng các truy vấn vượt ngưỡng và trả về mã lỗi `HTTP 429 Too Many Requests` thật.
  - Sử dụng admin client để ghi nhận audit log an ninh `connection_exhaustion_attempt` với mức độ `warning` kèm chi tiết connection slot vào database.
  - Hỗ trợ trì hoãn giả lập connection giữ slot trong 1.2s cho các requests từ simulator.
- **Nâng cấp Sandbox giả lập tấn công ([simulate-attack/route.ts](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/app/api/admin/security/simulate-attack/route.ts)):** Cập nhật kịch bản `noisy_neighbor` thực hiện bắn 8 HTTP requests thật song song tới endpoint `/api/search` công khai để kiểm chứng và đếm số lượng response (200 vs 429) thực tế, chứng minh tính hiệu quả của phòng vệ.

## [1.9.0] - 2026-06-25

### Nâng Cấp Threat Simulator Panel v1.5.0 (Live Demo Readiness)
- **Tích hợp 5 kịch bản Zero Trust**: Nâng cấp `/api/admin/security/simulate-attack/route.ts` và `components/admin/threat-simulator.tsx` hỗ trợ đầy đủ 5 kịch bản, trong đó có 2 kịch bản mới cực kỳ thực tế:
  - **Bypass JWT (Lớp 2)**: Gửi request với token giả mạo chữ ký đến REST API của Supabase và nhận lỗi 401 Unauthorized thật từ Supabase Auth Gateway.
  - **ABAC Time Restriction (Lớp 4)**: Cố tình chèn bài viết ngoài giờ hành chính (23:00) thông qua RPC `simulate_abac_outside_hours_attack(tenant_id)`. RPC sẽ thiết lập mock hour và giả lập context `tenant_editor` trong transaction để trigger lỗi RLS ABAC Policy thật từ database.
- **Tối ưu Bản Đồ Luồng Phòng Thủ (Zero Trust SVG Map)**: Cập nhật `attack-flow-map.tsx` để điều phối hoạt ảnh hoạt động và chốt chặn nhấp nháy đỏ chính xác tại Lớp Identity & JWT (Node 3) và Lớp Context ABAC (Node 5). Hiển thị Postgres `EXPLAIN` và logs cho cả 5 kịch bản.

### Hoàn Thiện Cơ Chế Disaster Recovery & Isolated UPSERT (Chống Rollback Chéo)
- **Isolated Restore API**: Cập nhật `/api/admin/backup/restore/route.ts` hỗ trợ nhận tham số `tenant_id`. Khi thực hiện khôi phục cô lập cho tenant được chỉ định (hoặc theo phân quyền của tenant_admin), API sẽ tự động lọc bỏ tất cả dữ liệu chéo của các tenant khác trong file snapshot và chỉ thực hiện `UPSERT` (Insert on Conflict Update) theo khóa chính, giải quyết triệt để bài toán "Rollback chéo" và bảo toàn dữ liệu các chi nhánh khác.
- **Tích hợp UI Quản trị Lưu trữ**: Cập nhật `app/admin/backup/page.tsx` bổ sung select box lọc khôi phục cho Workspace, bổ sung cảnh báo học thuật chống rollback chéo và thông báo chi tiết số lượng dòng khôi phục/bảo toàn. Ghi nhận audit logs an ninh cụ thể.

### Loại bỏ Hoàn toàn Phân hệ AI RAG & GraphRAG (System Simplification)
- **Ẩn widget AI khỏi Admin UI**: Gỡ bỏ hoàn toàn `AISecurityCopilotWidget` khỏi file [layout.tsx](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/app/admin/layout.tsx), vô hiệu hóa hoàn toàn khung chat AI đàm thoại trên trang quản trị.
- **Xóa bỏ tài liệu AI RAG**: Xóa sạch toàn bộ thư mục tài liệu `docs/ai-rag/` chứa các cẩm nang hướng dẫn nạp dữ liệu RAG và GraphRAG.
- **Dọn dẹp tài liệu đồ án**: Loại bỏ hoàn toàn tất cả các phần nhắc đến AI, RAG, GraphRAG và cơ chế Patient Zero trong các tài liệu tốt nghiệp cốt lõi bao gồm [README.md](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/README.md), [GRADUATION_WALKTHROUGH.md](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/docs/GRADUATION_WALKTHROUGH.md), [ACADEMIC_DEFENSE_BLUEPRINT.md](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/docs/ACADEMIC_DEFENSE_BLUEPRINT.md), [21_TECHNICAL_SECURITY_ANALYSIS.md](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/docs/21_TECHNICAL_SECURITY_ANALYSIS.md) và [17_GRADUATION_THESIS_PROPOSAL.md](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/docs/17_GRADUATION_THESIS_PROPOSAL.md).
- **Thuần khiết hóa Đề tài**: Khẳng định hệ thống tập trung 100% vào kỹ nghệ phần mềm và các chốt chặn an toàn cốt lõi (RLS, ABAC, WORM Ledger, SOAR Active Defense, Isolated Restore).

## [1.8.0] - 2026-06-02

### Bộ đệm Edge Cache thông minh & Tối ưu mạng biên (Upstash Redis Edge Cache)
- **Tích hợp máy khách Redis Edge ([redis-client.ts](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/lib/security/redis-client.ts)):** Cài đặt và tích hợp thư viện máy khách Edge `@upstash/redis` hỗ trợ cơ chế tự động dự phòng sang **Local Memory Cache** (trong bộ nhớ RAM của Next.js server) khi các biến môi trường trống. Cho phép chạy offline/local mượt mà không cần tài khoản Upstash thực tế để trình diễn và phát triển cục bộ.
- **Đồng bộ cơ sở dữ liệu thời gian thực ([sync-webhook/route.ts](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/app/api/security/sync-webhook/route.ts)):** Triển khai API Route nhận Supabase Database Webhooks (bảo mật bằng token) để tự động cập nhật, thêm mới hoặc xóa key trên cache Redis mỗi khi bảng `blocked_ips` hoặc `tenants` có biến động.
- **Tối ưu mạng biên Edge Middleware ([middleware.ts](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/middleware.ts)):** Tái cấu trúc Edge Middleware đọc trực tiếp cấu hình Tenant và trạng thái IP Block từ cache Redis với độ trễ phản hồi < 3ms. Áp dụng cơ chế **Negative Caching** (lưu lại trạng thái IP an toàn hoặc Tenant lỗi trong 15-30s) nhằm chặn đứng các cuộc tấn công DDoS brute force liên tiếp vắt kiệt tài nguyên PostgreSQL.

### Bản đồ trực quan hóa luồng an ninh Zero Trust (Dynamic Attack Flow Map)
- **Thiết kế sơ đồ SVG Cyberpunk ([attack-flow-map.tsx](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/components/admin/security/attack-flow-map.tsx)):** Xây dựng component React mới sử dụng đồ họa SVG động trực quan hóa 5 chốt chặn Zero Trust (Client IP, Edge Security Middleware, Identity JWT, Database RLS, và Context ABAC).
- **Tích hợp Threat Simulator v5 ([threat-simulator.tsx](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/components/admin/threat-simulator.tsx)):** Nhúng trực tiếp bản đồ SVG tương tác và đồng bộ các trạng thái phản ứng SOAR (`running`, `phase`, `result`). Khi chạy giả lập, chấm sáng hoạt ảnh di chuyển dọc theo các lớp kết nối và nhấp nháy viền đỏ neon tại lớp chịu trách nhiệm chặn đứng cuộc tấn công thực tế từ kết quả API.

### Bản đồ Ma trận Tương tác Học thuật & Động cơ QR Động (SOC Live Fire Presentation)
- **Bản đồ ma trận học thuật tương tác ([matrix-blueprint.tsx](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/components/admin/security/matrix-blueprint.tsx)):** Xây dựng bảng ma trận 4x4 cyberpunk tương tác, trình bày chi tiết phân tích học thuật độ phức tạp thuật toán ($O(1)$ RAM Session claims, $O(\log N_{\text{tenant}})$ B-Tree Index Scan), mã nguồn thực tế và điều khoản tuân thủ **ISO/IEC 27017 CLD** cho 4 tầng bảo vệ Zero Trust.
- **Tích hợp Premium SOC Tabs ([security-tabs-container.tsx](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/components/admin/security/security-tabs-container.tsx)):** Thiết kế và bố trí layout menu responsive Grid 4 tab mượt mà để chuyển đổi nhanh giữa Giám sát SOC, Sổ cái WORM, Giả lập Sandbox và Ma trận học thuật.
- **Động cơ mã QR động thích ứng ([page.tsx (security-center)](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/app/admin/security-center/page.tsx)):** Đọc động HTTP Host của request để sinh mã QR trỏ chính xác về trang `/council` của môi trường chạy thực tế (hỗ trợ localhost và staging cloud). Khắc phục triệt để việc hardcode domain tĩnh giúp hội đồng PTIT dễ dàng quét QR và trải nghiệm chặn IP tức thời trên máy local.

## [1.7.0] - 2026-05-31

### Phòng thủ chủ động — Bẫy Honeypot Chủ động (Active Honeypot Decoy)
- **Triển khai API bẫy mật ngọt thực tế [`/api/security/honeypot-decoy`](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/app/api/security/honeypot-decoy/route.ts):** Endpoint hoạt động hoàn toàn trong môi trường production — không phải demo. Khi attacker gọi vào endpoint này, hệ thống tự động:
  1. Trích xuất IP thực tế từ `x-forwarded-for` / `x-real-ip` / địa chỉ kết nối socket.
  2. Ghi ngay một bản ghi kiểm toán vào PostgreSQL với `risk_score = 100` và `action = 'honeypot_decoy_triggered'`, gắn đầy đủ metadata (`user_agent`, `referer`, `request_id`).
  3. Gọi RPC `block_ip(ip, reason, blocked_by)` chặn lập tức IP đó khỏi tất cả các request tiếp theo tại tầng Edge Middleware (độ trễ phản hồi Edge < 4ms).
- **Tích hợp Threat Simulator — Kịch bản 5 "Honeypot Decoy Trap"** vào [`/app/council/page.tsx`](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/app/council/page.tsx): Nút bấm màu emerald gọi thẳng endpoint honeypot (không đi qua route attack chung), cho phép hội đồng kiểm tra hành trình tấn công → log → block theo thời gian thực ngay trên giao diện.
- **Cảnh báo giọng nói AI đặc thù cho sự kiện Honeypot** trong [`soc-realtime-listener.tsx`](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/components/admin/security/soc-realtime-listener.tsx): Nhận sự kiện Supabase Realtime `honeypot_decoy_triggered`, phát cảnh báo giọng nói tiếng Việt khẩn cấp riêng biệt: *"Báo động cấp đỏ! Tác nhân đã sập bẫy Honeypot. Hệ thống đang truy vết và chặn IP tấn công."*

### Thẩm định Mật mã học — Forensic WORM Chain Auditor
- **Nâng cấp [`worm-vault-widget.tsx`](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/components/admin/worm-vault-widget.tsx) — Bộ thẩm định sổ cái mật mã học pháp lý:** Triển khai nút "Thẩm định Sổ cái" kích hoạt bộ quét SHA-256 chain forensic thực sự chạy client-side theo từng block, xác minh:
  1. **Hash toàn vẹn block hiện tại:** Tính lại `SHA-256(content)` và đối chiếu với `hash` đã lưu trong WORM Vault.
  2. **Liên kết chuỗi (`prev_hash` continuity):** Đảm bảo `block[n].prev_hash === block[n-1].hash` — nếu bị cắt đứt → phát hiện tamper.
  3. **Đối chiếu cơ sở dữ liệu chéo:** Kiểm tra xem log entry tương ứng trong PostgreSQL có tồn tại không, bảo đảm không bị xóa ngoài WORM.
  - Mỗi block đang được quét được tô sáng bằng viền **Neon vàng nhấp nháy** và badge "Đang quét..."; block bị phát hiện tamper tô đỏ `rose-500` rực.
  - Terminal console log màu sắc: 🔍 trắng (đang quét) → ✅ xanh `emerald` (toàn vẹn) → 🚨 đỏ `rose` (vi phạm phát hiện) → 📋 cyan (báo cáo tổng kết).
- **Kết quả xác minh kỹ thuật:** `npx tsc --noEmit` → **0 lỗi TypeScript**. Commit `0ad5f15` đã được push lên `origin/main`.

## [1.6.0] - 2026-05-31


### Động cơ Phát hiện Bất thường Lai (HBCAD Anomaly Engine)
- **Thiết kế & Triển khai Động cơ phát hiện lai (HBCAD)**: Thêm cột `risk_score` vào bảng `audit_logs` và tạo bảng `user_activity_baselines` để lưu trữ baseline tần suất hoạt động trung bình ($\mu$) và độ lệch chuẩn ($\sigma$) của User.
- **Thuật toán tính điểm rủi ro CRS thời gian thực**: Phát triển hàm `calculate_event_risk_score()` chạy `BEFORE INSERT` trên `audit_logs` kết hợp:
  - *Base Context Risk (ABAC)*: Phạt ngoài giờ hành chính (x2.5), ngoài IP whitelist (x3.5) và trọng số hành động.
  - *Outlier Deviation (Z-Score)*: Xác định đột biến tần suất hoạt động so với baseline của User ($Z = \frac{x-\mu}{\sigma}$).
  - *Sequential Pattern Penalty (SPP)*: Cộng phạt khi phát hiện chuỗi dò quét RLS (+50), chuỗi xóa dữ liệu phá hoại (+60), hoặc chuỗi càn quét SELECT (+40).
- **Giao diện SOC Telemetry & LED Neon**: Tích hợp hiển thị CRS dynamic và đèn Neon dynamic (High Risk $\ge 75$, Warning $35\text{-}74$) trong danh sách log an ninh.

### Phòng vệ Chủ động Phân tầng & Edge IP Block (Tiered SOAR Active Defense)
- **Triệt tiêu lỗ hổng Reverse DDoS**: Nâng cấp trigger SOAR `soc_active_alert_trigger()` sang mô hình **Phản ứng Phân tầng (Tiered Mitigation)**. Khi phát hiện IP lạ vi phạm $\ge 3$ lần/phút, SOAR tự động chèn IP đó vào danh sách cấm `blocked_ips` để Edge Middleware chặn đứng tại biên thay vì khóa cả Tenant (Reverse DDoS).
- **Bảo vệ Whitelist Admin**: Cơ chế đối chiếu IP Whitelist động để tuyệt đối **không tự khóa nhầm** IP của Admin hợp pháp.
- **Edge Middleware IP Lock**: Cập nhật `middleware.ts` check động blocked_ips với cache Edge `15s` giữ nguyên thời gian phản hồi siêu tốc $< 4\text{ms}$ và hiển thị trang HTML 403 Cyber SOC chi tiết lý do.
- **Premium IP Blocklist Widget**: Tạo component [ip-blocklist-widget.tsx](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/components/admin/security/ip-blocklist-widget.tsx) hỗ trợ hiển thị danh sách IP bị chặn thời gian thực và cung cấp nút gỡ chặn (Unblock) kiểm toán đầy đủ.

### Công cụ Hỗ trợ Phát triển AI (CodeGraph Development Tools)
- **Tích hợp CodeGraph MCP Server**: Cài đặt global package `@colbymchenry/codegraph` và khởi tạo lập chỉ mục đồ thị tri thức mã nguồn thành công cho **729 file**, tạo ra **7.071 node** và **14.499 edge** quan hệ cục bộ. Đã tự động đăng ký cổng kết nối MCP Server với các AI coding assistants lớn (Cursor, Claude Code, Gemini CLI, Antigravity IDE) nhằm tối ưu hóa chi phí token và tăng tốc độ phân tích mã nguồn.

### Kiểm thử Tự động An ninh Database (pgTAP Database Testing)
- **Triển khai bộ Unit Test pgTAP chuyên sâu**: Thiết lập thư mục kiểm thử `/supabase/tests/database/` và hoàn thiện tệp kiểm thử tự động [security_features.test.sql](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/supabase/tests/database/security_features.test.sql) tích hợp **6 test case** chính, bảo chứng khoa học cho hai trụ cột an ninh:
  - Lọc cô lập tenant RLS chéo (Cross-tenant RLS Isolation).
  - Tính bất biến chống sửa đổi/xóa dấu vết của WORM Audit Log (tamper-proofing audit logs via triggers).
- **Loại bỏ phụ thuộc dbdev**: Sửa đổi tệp migration [20260531080000_install_pgsodium_and_test_helpers.sql](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/supabase/migrations/20260531080000_install_pgsodium_and_test_helpers.sql) để chỉ kích hoạt cứng extension `pgsodium` (mặc định có sẵn trên Supabase), tinh giản loại bỏ sự phụ thuộc vào các thư viện bên thứ ba giúp dự án biên dịch thành công 100% trên cả Supabase Local và Supabase Cloud (Production).

### Kiểm thử Động cơ đo lường Scaling & Giao diện Percentiles (Vitest & UI Testing)
- **Tích hợp các chỉ số phân vị Percentiles (P50, P95, P99)**: Nâng cấp `scaling-engine.ts` lên phiên bản v2.0 chạy lặp 50 lần mỗi mốc dữ liệu để đảm bảo tính hội tụ thống kê, tích hợp đo lường trực tiếp Execution Time phía database nhằm loại bỏ nhiễu mạng HTTP.
- **Phát triển bộ chuyển đổi phân vị Glassmorphic Tabs Selector**: Cập nhật Next.js UI `/admin/performance` hiển thị bộ chuyển đổi phân vị trực quan, cho phép chuyển đổi động toàn bộ LineChart, các widget phân tích và bảng số liệu tương ứng.
- **Kiểm định Unit Test bằng Vitest**: Thiết lập tệp unit test `__tests__/lib/scaling-engine.test.ts` kiểm thử logic tính phân vị và cấu trúc dữ liệu mới, chạy thực tế thành công (100% PASS).

### Triển khai Sổ cái Bất biến Cục bộ (immudb Ledger Server)
- **Tích hợp Máy chủ immudb cục bộ (v1.9.6)**: 
  - Phát triển script PowerShell [install-immudb.ps1](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/scripts/install-immudb.ps1) tự động kích hoạt TLS 1.2 và tải binary Windows của `immudb` và `immuclient` về thư mục `/bin/`.
  - Thiết kế tệp script chạy nhanh [START_IMMUDB.bat](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/START_IMMUDB.bat) tại thư mục gốc giúp khởi động máy chủ sổ cái bất biến Merkle Tree local trên cổng `3322` và Web Console quản trị tại cổng `8080`.
  - Chạy thử nghiệm thành công kiểm chứng chứng thực mã hóa cục bộ qua các lệnh client `safeset` và `safeget` với kết quả xác thực tuyệt đối `verified: true`.

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
- **Lưu trữ Audit Log bất biến WORM (Write Once, Read Many)**: Thiết lập module sổ cái mật mã học [worm-vault.ts](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/lib/security/worm-vault.ts) tự động đồng bộ audit logs từ Postgres thành các khối liên kết chuỗi mã hóa (Hash-chained immutable blocks) sử dụng SHA-256. Hệ thống thực hiện kiểm toán tính toàn vẹn (cryptographic integrity check) và đối chiếu chéo cơ sở dữ liệu để cảnh báo tức thì mọi hành vi can thiệp hay xóa dấu vết.
- **Bảo vệ tài nguyên chống Noisy Neighbor**: Triển khai module điều tiết tài nguyên kết nối [tenant-pooler.ts](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/lib/security/tenant-pooler.ts) mô phỏng chính sách giới hạn kết nối đồng thời cô lập (Isolated Connection Slots) của Supavisor. Tự động kiểm soát lưu lượng concurrent queries theo kế hoạch Tenant Plan (Free: 3 slots, Pro: 10 slots, Enterprise: 40 slots), chặn đứng và trả về mã lỗi 429 Too Many Requests khi có hiện tượng query flood để bảo toàn tài nguyên cho các chi nhánh lành mạnh.
- **Giao diện Giám sát SOC Mới**:
  - Bổ sung **WORM Cryptographic Vault widget** hiển thị trực quan trạng thái liên kết chuỗi mã hóa, lịch sử block, và cung cấp nút giả lập can thiệp phá vỡ chuỗi để chứng minh tính tự kiểm toán.
  - Bổ sung **Tenant Connection Pooler widget** hiển thị thời gian thực mức độ chiếm dụng slot kết nối của từng Tenant, đi kèm bảng điều khiển giả lập tấn công dồn dập (Noisy Neighbor flood query) trả về mã lỗi 429 từ server.
  - Tích hợp 2 widget mới này vào trang quản trị an ninh [page.tsx (security-center)](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/app/admin/security-center/page.tsx).
- **Mở rộng kịch bản Threat Simulator**: Tích hợp kịch bản giả lập thứ 4 **Noisy Neighbor connection limits** vào API `/api/admin/security/simulate-attack` và component [threat-simulator.tsx](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/components/admin/threat-simulator.tsx), chứng minh hoàn hảo nguyên lý giới hạn tài nguyên và điều phối tải (Rate Limiting & Connection Limit) cho đồ án tốt nghiệp.

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
- **Cập nhật báo cáo kỹ thuật**: Sửa đổi toàn bộ các tài liệu học thuật [21_TECHNICAL_SECURITY_ANALYSIS.md](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/docs/21_TECHNICAL_SECURITY_ANALYSIS.md), [18_PROPOSAL_MAPPING_ANALYSIS.md](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/docs/18_PROPOSAL_MAPPING_ANALYSIS.md), và [17_GRADUATION_THESIS_PROPOSAL.md](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/docs/17_GRADUATION_THESIS_PROPOSAL.md) để đồng nhất định nghĩa độ phức tạp phân quyền tiệm cận $O(1)$ và lọc bản ghi CSDL đạt $O(\log N)$ nhờ chỉ mục B-Tree.

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
- **Báo cáo Phân tích Kỹ thuật & Chứng minh Học thuật chuyên sâu**: Biên soạn tài liệu [21_TECHNICAL_SECURITY_ANALYSIS.md](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/docs/21_TECHNICAL_SECURITY_ANALYSIS.md) chi tiết hóa 4 chủ đề bảo mật nặng ký phục vụ viết luận án và phản biện trước hội đồng.
- **Ma trận tuân thủ đám mây**: Xây dựng tài liệu [ISO_27017_COMPLIANCE_MATRIX.md](file:///e:/Projects/Project_TN/PTIT_THESIS_SAAS/docs/ISO_27017_COMPLIANCE_MATRIX.md) ánh xạ trực tiếp các tính năng bảo mật vật lý sang khung tiêu chuẩn quốc tế.
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