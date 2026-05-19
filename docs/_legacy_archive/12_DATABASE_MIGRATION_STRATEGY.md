# Chiến lược Di chuyển & Thay thế Database (Future-proofing)

Tài liệu này cung cấp lộ trình và giải pháp kỹ thuật nếu dự án muốn chuyển đổi hoàn toàn khỏi Supabase trong tương lai.

## 1. Phân tích hiện trạng
Hệ thống hiện tại đang sử dụng **Supabase** cho 3 dịch vụ chính:
- **Database (PostgreSQL)**: Lưu trữ nội dung, settings, người dùng.
- **Auth**: Quản lý đăng nhập và phiên làm việc.
- **Storage**: Lưu trữ ảnh, tài liệu (một phần dùng Cloudinary).

### 2.1 Database (PostgreSQL)

| Dịch vụ | Dung lượng Free | Đặc điểm |
| :--- | :--- | :--- |
| **Vercel Postgres** | **0.5 GB** | **Cực kỳ tiện**: Quản trị ngay trong dashboard Vercel. Thực chất là dùng hạ tầng của Neon nhưng tối ưu cho Next.js. |
| **Neon.tech** | **0.5 GB - 3 GB** | **Mạnh hơn**: Là "cha đẻ" của Vercel Postgres. Nếu dùng trực tiếp Neon, bạn có nhiều quyền cấu hình hơn và giới hạn thường thoáng hơn. |
| **Supabase** | 0.5 GB | **All-in-one**: Có sẵn Auth/Storage nhưng bị nhược điểm "ngủ đông" 7 ngày. |

#### Vercel Postgres có gì hay?
- **Zero Configuration**: Không cần tạo tài khoản mới, dùng luôn tài khoản Vercel đang có.
- **Edge Compatible**: Truy vấn cực nhanh từ Middleware và Edge Functions của Vercel.
- **Tự động thức dậy**: Giống Neon, nó tự "tỉnh" khi có khách, không bao giờ bị tạm dừng website như Supabase.

### 2.1 Tại sao 100 giờ của Neon lại "đắt giá"?
Cơ chế của Neon là **Autoscaling to 2 CU** và **Scale to Zero**.
- Khi không có ai truy cập: Database tắt hoàn toàn (không tốn giờ).
- Khi có khách vào: Nó tự bật dậy trong < 1 giây (Auto-resume).

## 3. Lộ trình di chuyển (Migration Steps)

### Bước 1: Trừu tượng hóa tầng dữ liệu (Data Abstraction)
Hiện tại dự án đã làm rất tốt việc tập trung query vào `lib/cache/queries.ts`. Để di chuyển, chỉ cần sửa code bên trong các hàm này mà không cần động vào UI components.

### Bước 2: Chuyển đổi Auth
Thay thế Supabase Auth bằng **Auth.js (NextAuth)**. Đây là giải pháp 0đ, lưu data người dùng ngay trong DB chính.

### Bước 3: Di chuyển Storage
Chuyển từ Supabase Storage sang **Cloudflare R2** (10GB Free, không tính phí băng thông).

### Bước 4: Chuyển đổi Database
Sử dụng `pg_dump` để xuất dữ liệu và nhập vào Neon. Cấu nhật lại `lib/cache/queries.ts` để dùng `drizzle-orm` hoặc `prisma` để kết nối Postgres mới.

## 4. Đánh giá độ khó
- **Mức độ**: Trung bình.
- **Thời gian ước tính**: 2-4 tuần.
- **Lý do**: Kiến trúc Next.js App Router và Unified Query Layer giúp việc "thay lõi" diễn ra độc lập với giao diện.

---

> [!TIP]
> **Khuyên dùng**: Hiện tại **Supabase + Vercel** vẫn là sự kết hợp tối ưu nhất về tốc độ triển khai. Chỉ nên thực hiện di chuyển khi Supabase có thay đổi lớn về chính sách hoặc gặp sự cố nghiêm trọng kéo dài.
