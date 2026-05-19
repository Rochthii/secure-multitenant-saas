# 09 — Release & Handoff Checklist

**Cập nhật gần nhất:** 2026-03-14  
**Mục tiêu:** Chuẩn hóa phát hành production và bàn giao vận hành, giảm rủi ro thiếu bước.

---

## 1) Pre-release gate (bắt buộc)

## 1.1 Gate mã nguồn

- Pull request đã review đủ phạm vi module liên quan.
- Không còn conflict migration hoặc thay đổi DB chưa mô tả.
- Không có thay đổi nóng chưa được ghi vào canonical docs.

## 1.2 Gate chất lượng

- Unit tests quan trọng chạy pass.
- E2E smoke tối thiểu pass trên route công khai cốt lõi.
- Không có lỗi build chặn deploy.

## 1.3 Gate dữ liệu

- Migration đã có rollback strategy.
- Script seed/patch dữ liệu có idempotency hoặc điều kiện chặn chạy lặp.
- RLS thay đổi đã được kiểm thử ít nhất trên: anon, authenticated, admin/tenant_admin.

---

## 2) Checklist deploy production

1. Xác nhận branch/tag phát hành.
2. Xác nhận đầy đủ env production (xem tài liệu 10).
3. Deploy lên Vercel.
4. Theo dõi build log đến khi hoàn tất.
5. Chạy smoke test ngay sau deploy (mục 3).
6. Chạy warmup endpoint nếu cần ổn định cache ban đầu.
7. Xác nhận cron vẫn hiện diện đúng lịch trong môi trường production.

---

## 3) Smoke test sau deploy (15–30 phút)

## 3.1 Public flow

- Mở trang chủ tenant chính ở đủ locale đang hoạt động.
- Vào trang tin tức, sự kiện, thư viện số, liên hệ và xác nhận render ổn định.
- Thực hiện 1 lượt tìm kiếm public có kết quả.

## 3.2 Admin flow

- Đăng nhập admin và tải dashboard.
- Thử cập nhật một nội dung nhỏ (ví dụ trạng thái draft/published của bài test).
- Xác nhận cache revalidate thành công (public phản ánh thay đổi).

## 3.3 API/Cron flow

- Gọi kiểm tra `/api/warmup` (nếu có bảo vệ secret thì dùng token đúng).
- Kiểm tra endpoint cron quan trọng trả trạng thái hợp lệ.
- Kiểm tra log không có chuỗi lỗi lặp (401/500 liên tiếp).

---

## 4) Checklist bàn giao cho ca vận hành

## 4.1 Bàn giao kỹ thuật

- Commit hash phát hành.
- Danh sách migration đã chạy.
- Danh sách biến môi trường thay đổi.
- Danh sách endpoint mới/chỉnh sửa có rủi ro cao.

## 4.2 Bàn giao vận hành

- Người trực on-call chính và backup.
- Kênh thông báo sự cố.
- Runbook liên quan (02, 08, 10, 11) đã đính kèm trong ticket bàn giao.

## 4.3 Bàn giao sản phẩm

- Module nào thay đổi hành vi.
- Chức năng nào cần theo dõi dữ liệu sau phát hành (24h đầu).

---

## 5) Rollback plan chuẩn

## 5.1 Rollback code

- Redeploy bản stable trước đó trên Vercel.
- Xác nhận lại smoke test tối thiểu.

## 5.2 Rollback dữ liệu

- Chỉ rollback migration khi đã đánh giá tác động dữ liệu.
- Nếu có backup hợp lệ trong ngày, ưu tiên khôi phục chọn lọc bảng bị ảnh hưởng.

## 5.3 Rollback cache

- Sau rollback code/data, trigger revalidate theo tag/path để tránh hiển thị lệch cache.

---

## 6) Điều kiện đóng đợt phát hành

- Không còn lỗi SEV-1/SEV-2 mở trong 24 giờ đầu.
- Monitoring ổn định, không có tăng đột biến lỗi 5xx.
- Ticket bàn giao có đủ: changelog, migration, env diff, runbook tham chiếu.
