Tốt — kết hợp cả hai là hướng mạnh nhất, nhưng cần một "sợi chỉ đỏ" kết nối chúng lại.

---

## Luận điểm trung tâm đề xuất

Viết lại "Đóng góp khoa học" thành một câu duy nhất:

> **"Đề tài chứng minh rằng kiến trúc RLS+JWT Claims đạt O(1) authorization complexity — không chỉ trên giấy mà dưới điều kiện tấn công thực tế — và đo lường được cost of security ở từng lớp Defense-in-depth."**

Mọi thứ trong hệ thống đều phục vụ câu này. Benchmark chứng minh O(1). Threat Simulation chứng minh "dưới tấn công thực tế". ISO 27017 matrix chứng minh "từng lớp".

---

## Roadmap 2 năm — cụ thể theo từng giai đoạn

### Giai đoạn 1 — Hết năm 2 *(không build thêm, chỉ củng cố)*

**Mục tiêu:** Có nền tảng vững trước khi mở rộng.

3 việc cần làm:

**Việc 1 — Viết lại Đóng góp khoa học** theo luận điểm trên. Mình có thể giúp soạn ngay hôm nay.

**Việc 2 — Fix benchmark narrative.** Chạy lại benchmark với 3 mức dataset:

```
1,000 rows  → đo AVG/P50/P95/P99
10,000 rows → đo AVG/P50/P95/P99
100,000 rows → đo AVG/P50/P95/P99
```

Vẽ 1 đường cong: Legacy O(N) tệ dần khi data tăng, JWT Claims O(1) giữ flat. Một biểu đồ này có giá trị hơn toàn bộ con số hiện tại.

**Việc 3 — Document Threat Simulation hiện có** thành test case chuẩn:

```
Test ID: TC-001
Attack: Cross-tenant read (Tenant A cố đọc data Tenant B)
Method: Đổi tenant_id trong JWT payload
Expected: 0 rows returned, audit log ghi nhận, alert trigger
Actual: [chụp screenshot]
RLS Layer: tenant_id = auth.jwt()->>'tenant_id'
```

---

### Giai đoạn 2 — Năm 3 *(build có mục tiêu, 2 feature thôi)*

**Feature 1 — Auto-suspend + Webhook alert** *(Q1 năm 3)*

Đây là thứ biến SOC từ "hiển thị" thành "phản ứng". Logic đơn giản:

```
Khi audit_log ghi nhận > 20 actions/giờ từ 1 user
  → UPDATE tenants SET status = 'suspended'
  → POST webhook đến Telegram/Slack với context
  → Ghi audit entry với flag is_security_incident = true
```

Không cần AI, không cần Isolation Forest. Đây là **rule-based incident response** — đơn giản, chứng minh được, và thực tế hơn.

**Feature 2 — Security-Performance Trade-off Matrix** *(Q2 năm 3)*

Đây là đóng góp khoa học thực sự mà không ai làm ở cấp đồ án. Cấu trúc như sau:

| Security Layer | Latency Added | Attack Vector Blocked |
|---|---|---|
| Middleware JWT check | +2ms | Unauthenticated access |
| RLS tenant isolation | +X ms (O(1)) | Cross-tenant read/write |
| ABAC time-based | +Y ms | Off-hours privilege abuse |
| Audit trigger | +Z ms | Non-repudiation |
| Rate limiting | +W ms | Brute force, Noisy Neighbor |

Bạn đã có data để fill vào bảng này từ benchmark. Chỉ cần đo từng lớp riêng lẻ.

---

### Giai đoạn 3 — Đầu năm 4 *(hoàn thiện, không thêm mới)*

**Tập trung viết báo cáo** theo cấu trúc narrative rõ ràng:

```
Chương 1: Vấn đề — Cross-tenant data leakage xảy ra như thế nào
Chương 2: Lý thuyết — Tại sao O(1) RLS là giải pháp đúng
Chương 3: Thiết kế — Kiến trúc Defense-in-depth 4 lớp
Chương 4: Triển khai — Evidence từng lớp
Chương 5: Chứng minh — Benchmark + Threat Simulation + ISO Matrix
Chương 6: Kết luận — Bài học và giới hạn trung thực
```

---

### Giai đoạn 4 — Cuối năm 4 *(chuẩn bị bảo vệ)*

**Demo flow 10 phút:**

```
1. Mở SOC Dashboard → Security Score 100%, ISO Compliant
2. Chạy Threat Simulation → show 0 rows returned, audit log nhảy
3. Trigger Auto-suspend → tenant bị khóa, Telegram nhận alert
4. Mở Performance Dashboard → show đường cong O(1) vs O(N)
5. Mở ISO 27017 Matrix → show từng control có evidence
```

5 bước, 10 phút, không cần giải thích dài — **hệ thống tự nói**.

---

## Thứ tự ưu tiên tuyệt đối

```
Quan trọng nhất:   Benchmark đường cong (dataset scaling)
Quan trọng thứ 2:  Auto-suspend + Webhook alert
Quan trọng thứ 3:  Security-Performance Trade-off Matrix
Không cần làm:     k6 scripts, Python attack tools, AI/Isolation Forest
```

---

Bạn muốn bắt đầu từ đâu — mình giúp viết lại phần Đóng góp khoa học ngay bây giờ, hay plan chi tiết cho benchmark đường cong trước?