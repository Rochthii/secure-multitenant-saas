# BÁO CÁO PHÂN TÍCH KHOẢNG CÁCH & KẾ HOẠCH KHẮC PHỤC (GAP ANALYSIS & REMEDIATION PLAN)

> **Dự án:** Secure Multi-tenant SaaS Platform (Row-Level Security & Audit Log)  
> **Đơn vị đào tạo:** Học viện Công nghệ Bưu chính Viễn thông (PTIT)  
> **Tác giả:** Chăm Rốch Thi  
> **Ngày báo cáo:** 22/05/2026

---

## 1. GIỚI THIỆU CHUNG
Trong quá trình rà soát độc lập toàn diện mã nguồn của dự án đối chiếu với đề cương chi tiết **"Nghiên cứu và thiết kế kiến trúc phần mềm an toàn cho nền tảng đa khách hàng (Secure Multi-tenant SaaS)"**, chúng tôi đã thực hiện phương pháp **Code & Database Integrity Auditing**.

Mục tiêu của báo cáo này nhằm:
1. **Xác định các "khoảng cách" (Gaps):** Những điểm thiếu sót, sai lệch hoặc chưa hoàn thiện giữa tuyên bố trong đề cương đồ án tốt nghiệp với mã nguồn thực tế.
2. **Ngăn chặn lỗi nghiêm trọng (Zero-day/Crash):** Phát hiện các lỗi logic sẽ gây sập (crash) hệ thống 100% trong quá trình chạy thử nghiệm thực tế trước mặt Hội đồng chấm đồ án.
3. **Kế hoạch hành động cụ thể (Remediation Plan):** Thiết kế giải pháp kỹ thuật, phân công các task cụ thể để nâng cấp hệ thống đạt trạng thái hoàn hảo nhất phục vụ phòng vệ và bảo vệ luận án.

---

## 2. PHÂN TÍCH CÁC KHOẢNG CÁCH (GAPS AUDIT)

### 🔴 VẤN ĐỀ 1: Sập (Crash) Benchmark Hiệu năng RLS (Mức độ: Tối cao)
*   **Khoảng cách:** Đồ án Chương 5 tuyên bố đã có Performance Benchmarking hoàn tất đo lường các Baseline: App Filtering vs. RLS JOIN vs. Optimized RLS Custom Claims.
*   **Thực tế mã nguồn:** File [scaling-engine.ts](file:///e:/PTIT_THESIS_SAAS/app/admin/performance/scaling-engine.ts) gọi 2 hàm RPC database: `benchmark_rls_join` và `benchmark_rls_claims`. Tuy nhiên, **2 hàm RPC này chưa từng được tạo trong database**. Chúng mới chỉ tồn tại dưới dạng comment chú thích trong code TypeScript.
*   **Hậu quả:** Khi Hội đồng yêu cầu bấm nút "Bắt đầu Benchmark" trên giao diện `/admin/performance`, hệ thống sẽ trả về lỗi HTTP 500/DB Error và **biểu đồ trống rỗng, sập hoàn toàn**.

---

### 🔴 VẤN ĐỀ 2: App-side Benchmark đo lường sai bản chất (Mức độ: Cao)
*   **Khoảng cách:** Đo lường App-side filtering (tải toàn bộ dữ liệu rồi lọc bằng Javascript ở ứng dụng) để làm baseline so sánh với RLS.
*   **Thực tế mã nguồn:** Code benchmark đang hard-code lọc dữ liệu bằng string `'some-id'` tĩnh:
    ```typescript
    const filtered = allData?.filter((i: any) => i.tenant_id === 'some-id');
    ```
    Điều này làm sai lệch kết quả đo đạc vì nó không phản ánh đúng tenant thực tế đang thực hiện truy vấn và số lượng bản ghi trả về sẽ luôn bằng 0 (vì không có tenant nào có ID dạng `'some-id'`).
*   **Hậu quả:** Số liệu đo lường thiếu thuyết phục trước câu hỏi phản biện của các thầy cô ATTT về tính chân thực của dữ liệu thực nghiệm.

---

### 🟡 VẤN ĐỀ 3: Webhook Active SOC Alert sử dụng Placeholder (Mức độ: Cao)
*   **Khoảng cách:** Tuyên bố có cơ chế phòng vệ chủ động (Active Defense) phát hiện noisy neighbor/tấn công và gửi cảnh báo tự động qua Slack/Telegram/Email.
*   **Thực tế mã nguồn:** Migration [20260517000000_active_soc_webhook_alerts.sql](file:///e:/PTIT_THESIS_SAAS/supabase/migrations/20260517000000_active_soc_webhook_alerts.sql) đang cấu hình Bearer Token và URL của nhà cung cấp dịch vụ dưới dạng placeholder giả lập:
    ```sql
    webhook_url TEXT := 'https://api.resend.com/emails';
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_RESEND_OR_SLACK_KEY"}'::jsonb
    ```
*   **Hậu quả:** Khi có tấn công giả lập dồn dập, trigger DB sẽ cố gọi API nhưng bị lỗi Unauthorized hoặc Bad Request. Mặc dù có exception block để tránh crash luồng chính, nhưng tính năng cảnh báo tự động sẽ hoàn toàn tê liệt.

---

### 🟡 VẤN ĐỀ 4: Nhật ký Audit Logs chưa thực sự bất biến ở cấp DB (Mức độ: Cao)
*   **Khoảng cách:** Tuyên bố Audit Log bất biến (Immutable Audit Trail) đáp ứng tiêu chuẩn an toàn ISO 27017 và tính chất chống chối bỏ (Non-repudiation).
*   **Thực tế mã nguồn:** Đã có trigger DB tự động lưu snapshot dữ liệu trước khi xóa (`trg_audit_before_delete` trên 13 bảng). Tuy nhiên, **bảng `audit_logs` chính lại chưa có trigger chặn thao tác sửa đổi hoặc xóa dữ liệu trực tiếp**.
*   **Hậu quả:** Nếu một kẻ tấn công chiếm được quyền quản trị viên cấp cao (Super Admin) hoặc truy cập trực tiếp vào DB, họ hoàn toàn có thể chạy lệnh `DELETE FROM audit_logs` hoặc `UPDATE audit_logs SET action = 'read'` để xóa sạch mọi dấu vết vi phạm dữ liệu. Ràng buộc bất biến bị phá vỡ.

---

### 🟡 VẤN ĐỀ 5: Kịch bản giả lập tấn công (Threat Simulator) quá nghèo nàn (Mức độ: Cao)
*   **Khoảng cách:** Đề cương Chương 5 cam kết giả lập thành công các kịch bản tấn công: Path Traversal, Cache Pollution, SQL Injection và Cross-tenant Access.
*   **Thực tế mã nguồn:** API `/api/admin/security/simulate-attack` mới chỉ triển khai duy nhất kịch bản `cross_tenant_read`.
*   **Hậu quả:** Không khớp với nội dung thuyết minh trong báo cáo đồ án gửi Hội đồng.

---

### 🟡 VẤN ĐỀ 6: Ràng buộc ngữ cảnh ABAC quá mỏng (Mức độ: Trung bình)
*   **Khoảng cách:** Cam kết xây dựng mô hình phân quyền lai nâng cao kết hợp RBAC và ABAC (đọc ngữ cảnh thời gian và IP để phân quyền).
*   **Thực tế mã nguồn:** Mới chỉ cài đặt duy nhất một chính sách ABAC kiểm tra giờ làm việc (`is_within_business_hours()`) trên bảng `news` đối với thao tác `INSERT`. Các bảng tài chính, sự kiện nhạy cảm chưa hề được bảo vệ bằng ABAC.
*   **Hậu quả:** Lý thuyết viết rất hoành tráng nhưng mã nguồn thực thi quá sơ sài, dễ bị đánh giá là "làm đối phó".

---

### 🟡 VẤN ĐỀ 7: Intranet Lockdown bị hard-code (Mức độ: Trung bình)
*   **Khoảng cách:** Tuyên bố có cơ chế khóa mạng nội bộ của Tenant (Intranet Lockdown) chống truy cập trái phép từ bên ngoài IP văn phòng.
*   **Thực tế mã nguồn:** Code logic kiểm tra IP trong [middleware.ts](file:///e:/PTIT_THESIS_SAAS/middleware.ts#L18) đang được hard-code trực tiếp mảng IP tĩnh thay vì truy vấn từ cấu hình động của tenant trong database.
*   **Hậu quả:** Không có khả năng sử dụng thực tế cho nhiều tenant khác nhau (mỗi tenant phải có IP whitelist riêng do chính họ cấu hình ở trang `/security`).

---

## 3. KẾ HOẠCH KHẮC PHỤC (REMEDIATION ROADMAP)

Để đưa hệ thống đạt trạng thái hoàn hảo nhất, chúng tôi đề xuất lộ trình xử lý chia thành 3 nhóm task ưu tiên từ cao xuống thấp:

### 🚀 GIAI ĐOẠN 1: KHẮC PHỤC LỖI CRASH VÀ SAI LỆCH SỐ LIỆU (Ưu tiên Tối cao)
1. **Task 1:** Tạo migration tạo 2 hàm RPC `benchmark_rls_join` và `benchmark_rls_claims` trong database PostgreSQL.
2. **Task 2:** Cập nhật lại [scaling-engine.ts](file:///e:/PTIT_THESIS_SAAS/app/admin/performance/scaling-engine.ts) để App-side filtering sử dụng tenant_id thực tế từ context truy vấn thay vì string `'some-id'` tĩnh.
3. **Task 3:** Viết script SQL seed dữ liệu mẫu gồm 3 mức dataset (1,000, 10,000, 100,000 bản ghi) để vẽ biểu đồ so sánh hiệu năng theo dạng đường cong scaling (Legacy O(N) tăng vọt, Optimized O(1) đi ngang flat).

### 🛡️ GIAI ĐOẠN 2: THỰC THI BẢO MẬT TUYỆT ĐỐI (Ưu tiên Cao)
4. **Task 4 (Audit Immutability):** Tạo trigger DB chặn hoàn toàn mọi lệnh `UPDATE` hoặc `DELETE` tác động lên bảng `public.audit_logs`. Trả về exception báo lỗi bảo mật cấp cao.
5. **Task 5 (Active SOC Alert):** Triển khai endpoint webhook thực (gửi alert cấu hình an toàn về Telegram Bot hoặc Discord Channel).
6. **Task 6 (Threat Simulator Expansion):** Nâng cấp API giả lập tấn công để hỗ trợ thêm 2 kịch bản: **Cache Pollution** (Tấn công rò rỉ cache chéo giữa các tenant) và **SQL Injection Bypass Attempt**.
7. **Task 7 (Intranet Lockdown Dynamic):** Chuyển cơ chế IP Whitelisting từ hard-code ở Middleware sang đọc động từ trường `modules_config->'security_settings'->>'ip_whitelist'` trong bảng `tenants`.

### 📊 GIAI ĐOẠN 3: HOÀN THIỆN LÝ THUYẾT & MA TRẬN CHỨNG MINH (Ưu tiên Trung bình)
8. **Task 8 (ABAC Extension):** Thiết lập thêm chính sách ABAC kiểm soát quyền viết/sửa đổi dựa trên IP và thời gian đối với các thao tác chuyển tiền/donations.
9. **Task 9 (ISO 27017 Matrix Document):** Soạn thảo bảng đối chiếu chi tiết 15 điều khoản kiểm soát bảo mật đám mây của tiêu chuẩn ISO/IEC 27017 tương ứng với bằng chứng file mã nguồn cụ thể trong dự án làm phụ lục đồ án.
10. **Task 10 (Auto-suspend Incident Response):** Triển khai logic phản ứng tự động: Khi phát hiện Anomaly nghiêm trọng (>20 operations/giờ hoặc tấn công dồn dập), hệ thống tự động khóa tạm thời tenant (`status = 'suspended'`) và gửi thông báo khẩn cấp đến quản trị viên cấp cao.

---

## 4. KẾT LUẬN & CAM KẾT
Bằng việc thực thi đầy đủ kế hoạch khắc phục trên, đồ án tốt nghiệp của bạn sẽ đạt được độ chính xác tuyệt đối về số liệu thực nghiệm, tính vững chắc vượt bậc về mặt an ninh bảo mật và tự tin đạt điểm **Xuất sắc** trước bất kỳ Hội đồng chấm thi khó tính nào tại PTIT.
