# 11 — SEV-1 Scenarios & Communication Templates

> **Tài liệu kịch bản sự cố — Đồ Án Tốt Nghiệp PTIT**  
> **Đề tài:** Secure Multi-tenant SaaS: Áp dụng RLS và Audit Log trong quản trị rủi ro thông tin.  
> **Cập nhật:** 2026-05-16  
> **Mục tiêu:** Cung cấp kịch bản xử lý SEV-1 dạng thực chiến + mẫu thông báo + mẫu postmortem điền nhanh. Đáp ứng yêu cầu Incident Management của ISO/IEC 27017.

## 1) Điều kiện kích hoạt SEV-1

Kích hoạt SEV-1 ngay khi xảy ra ít nhất 1 điều kiện:

- Nhiều tenant không truy cập được public site.
- Admin diện rộng không đăng nhập hoặc không thể thao tác module cốt lõi.
- Cron quan trọng fail liên tục gây rủi ro dữ liệu/vận hành.
- Lỗi bảo mật nghiêm trọng có khả năng ảnh hưởng dữ liệu nhiều tenant.

Mốc thời gian mục tiêu:

- Triage ban đầu: trong 15 phút.
- Khôi phục tạm thời: trong 60 phút.

---

## 2) Kịch bản SEV-1 theo tình huống thực tế

## 2.1 Kịch bản A — Public site down diện rộng

**Dấu hiệu**

- 5xx tăng đột biến ở nhiều route public.
- Người dùng báo lỗi truy cập ở nhiều domain tenant.

**Playbook 0–60 phút**

1. Phút 0–5: xác nhận phạm vi (tenant nào, route nào, locale nào).
2. Phút 5–10: đóng băng deploy mới, chỉ giữ luồng khôi phục.
3. Phút 10–20: kiểm tra build/deploy gần nhất, env diff, Sentry issues mới.
4. Phút 20–35: rollback về bản ổn định gần nhất nếu chưa xác định root cause.
5. Phút 35–50: smoke test public theo 2–3 tenant đại diện.
6. Phút 50–60: cập nhật trạng thái “đã khôi phục tạm thời”, tiếp tục điều tra sâu.

---

## 2.2 Kịch bản B — Admin không thao tác được diện rộng

**Dấu hiệu**

- Admin nhận 401/403 hàng loạt hoặc action fail đồng loạt.

**Playbook 0–60 phút**

1. Phút 0–10: kiểm tra session/auth service và middleware guard.
2. Phút 10–20: kiểm tra role mapping (`user_roles`) và thay đổi policy gần nhất.
3. Phút 20–35: xác minh action bị fail do guard hay do DB policy.
4. Phút 35–45: khôi phục nhanh (rollback migration/policy hoặc rollback code).
5. Phút 45–60: xác thực lại các module admin cốt lõi: news/events/transactions/settings.

---

## 2.3 Kịch bản C — Cron quan trọng hỏng liên tục

**Dấu hiệu**

- Backup không sinh file mới.
- Publish scheduled không chạy nhiều chu kỳ.
- Reminder không gửi trong khung giờ vận hành.

**Playbook 0–60 phút**

1. Phút 0–10: xác nhận lỗi theo endpoint cron, response code, và log.
2. Phút 10–20: kiểm tra `CRON_SECRET`, quyền truy cập endpoint, lịch `vercel.json`.
3. Phút 20–35: trigger thủ công endpoint để khôi phục tạm.
4. Phút 35–50: xử lý nguyên nhân gốc (secret mismatch, env thiếu, quota/provider lỗi).
5. Phút 50–60: xác nhận một chu kỳ chạy thành công + ghi nhận tác vụ bù nếu cần.

---

## 2.4 Kịch bản D — Rò rỉ dữ liệu chéo (Cross-tenant Data Breach)

**Dấu hiệu (Anomaly)**

- User báo cáo nhìn thấy dữ liệu không thuộc tổ chức của mình (ví dụ: Admin Tenant A thấy bài viết/cấu hình của Tenant B).
- Alert từ hệ thống SOC: Một IP có hành vi fetch dữ liệu nhiều tenant liên tiếp.
- `get_rls_coverage()` báo cáo điểm số sụt giảm < 90%.

**Playbook 0–60 phút (Cấp cứu RLS)**

1. **Phút 0–5:** Tạm dừng hệ thống (Maintenance Mode) đối với các module liên quan để ngăn chặn rò rỉ tiếp diễn. Khởi tạo ticket SEV-1 khẩn cấp.
2. **Phút 5–15:** Truy vấn `audit_logs` bằng SQL để xác định chính xác user/role nào đã truy cập, và lượng dữ liệu bị lộ (Exfiltration scope).
3. **Phút 15–30:** Rà soát `pg_policies` trên database. Tìm kiếm nguyên nhân (thường là do developer đẩy nhầm migration xóa RLS policy hoặc viết sai logic trong `get_current_tenant_id()`).
4. **Phút 30–45:** Khôi phục RLS policy (chạy lại migration an toàn nhất) hoặc disable tạm thời user accounts nghi ngờ bị compromise.
5. **Phút 45–60:** Tắt Maintenance Mode, gửi cảnh báo vi phạm dữ liệu (Data Breach Notification) cho các Tenant bị ảnh hưởng theo chuẩn ISO 27017 §CLD.16.1.2.

---

## 3) Mẫu thông báo nội bộ (copy/paste)

## 3.1 Mẫu thông báo mở incident

```
[INCIDENT][SEV-1][OPEN]
Thời gian phát hiện: <YYYY-MM-DD HH:mm TZ>
Người mở: <name>
Phạm vi ảnh hưởng: <tenant/module/route>
Triệu chứng chính: <mô tả ngắn>
Tác động người dùng: <cao/rất cao>
Hành động đang thực hiện: <triage/rollback/check env>
Cập nhật kế tiếp lúc: <HH:mm>
```

## 3.2 Mẫu cập nhật định kỳ (15 phút/lần)

```
[INCIDENT][SEV-1][UPDATE #<n>]
Thời gian: <HH:mm>
Tình trạng hiện tại: <đang điều tra/đã khoanh vùng/đã khôi phục tạm>
Nguyên nhân tạm thời: <nếu có>
Hành động vừa làm: <...>
Rủi ro còn lại: <...>
ETA cập nhật tiếp: <HH:mm>
```

## 3.3 Mẫu thông báo đã khôi phục

```
[INCIDENT][SEV-1][MITIGATED]
Thời gian khôi phục tạm: <YYYY-MM-DD HH:mm TZ>
Tổng thời gian ảnh hưởng: <xx phút>
Biện pháp khôi phục: <rollback/fix/rotate secret>
Phạm vi còn theo dõi: <nếu có>
Postmortem dự kiến: <ngày giờ>
```

---

## 4) Mẫu postmortem chi tiết (điền sẵn khung)

```
# Postmortem — Incident SEV-1

1) Tổng quan
- Incident ID:
- Thời gian bắt đầu:
- Thời gian kết thúc:
- Tổng downtime/ảnh hưởng:

2) Ảnh hưởng
- Tenant/route/module bị ảnh hưởng:
- Số lượng người dùng bị ảnh hưởng (ước lượng):
- Chức năng mất ổn định:

3) Dòng thời gian
- T0 phát hiện:
- T+15 triage:
- T+30 khoanh vùng:
- T+60 khôi phục tạm:
- T+kết thúc:

4) Root cause
- Nguyên nhân trực tiếp:
- Nguyên nhân hệ thống:
- Vì sao không được phát hiện sớm:

5) Khôi phục và xác minh
- Hành động khôi phục đã làm:
- Cách xác minh đã ổn định:
- Rủi ro còn tồn tại:

6) Hành động phòng ngừa
- Action 1 (owner/deadline):
- Action 2 (owner/deadline):
- Action 3 (owner/deadline):

7) Cập nhật tài liệu
- Runbook đã cập nhật ở file:
- Checklist release/handoff đã cập nhật:
```

---

## 5) Danh sách xác minh sau SEV-1 (24 giờ)

- Không còn spike 5xx bất thường ở route đã ảnh hưởng.
- Không còn lỗi lặp liên quan trong Sentry/logs.
- Cron quan trọng chạy đủ 1 chu kỳ kiểm chứng sau fix.
- Đã tạo ticket hành động phòng ngừa với owner rõ ràng.
- Đã liên kết postmortem vào ticket release/handoff tương ứng.
