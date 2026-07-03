# So sánh Single Tenant vs Multi Tenant & Multi‑schema vs Shared DB + RLS

## Mục tiêu
- Đánh giá ưu, nhược điểm của mô hình **Single‑Tenant** (cơ sở dữ liệu riêng) so với **Multi‑Tenant** (cơ sở dữ liệu chia sẻ).
- So sánh **Multi‑schema** (mỗi tenant có schema riêng) với **Shared DB + Row‑Level Security (RLS)**.
- Cung cấp benchmark latency và các test case: tenant isolation, RLS bypass, RBAC/ABAC.

## Nội dung
| Kiến trúc | Mô tả | Ưu điểm | Nhược điểm |
|---|---|---|---|
| **Single‑Tenant (isolated DB)** | Mỗi tenant có DB riêng | Độ cô lập tuyệt đối, dễ backup/restore | Tốn tài nguyên, quản lý DB nhiều |
| **Multi‑Tenant – Shared Schema** | Tất cả tenant dùng chung một schema, phân biệt bằng `tenant_id` | Tiết kiệm tài nguyên, quản lý đơn giản | Cần RLS để bảo vệ dữ liệu |
| **Multi‑Tenant – Multi‑schema** | Mỗi tenant có schema riêng trong cùng DB | Cô lập tốt hơn, backup schema riêng | Quản lý schema nhiều |
| **Shared DB + RLS** | Dữ liệu chung, RLS policy dựa trên JWT claim | Hiệu năng cao, chi phí thấp, bảo mật mạnh | Phức tạp viết policy, cần audit |

## Test Cases (Vitest)
1. **Tenant Isolation** – Tạo 2 tenant, cố gắng truy cập dữ liệu của nhau; RLS phải ngăn.
2. **RLS Bypass** – Thử bỏ claim, truy vấn trực tiếp; phải trả lỗi.
3. **RBAC/ABAC** – Kiểm tra quyền dựa trên role + thời gian/IP.

## Benchmark (Latency)
- **P50 / P95 / P99** cho 3 mô hình trên 100k bản ghi.
- Kết quả sẽ được ghi trong `22_PERFORMANCE_VS_SECURITY_MATRIX.md`.

*Tham khảo: PostgreSQL docs, Supabase security guide.*
