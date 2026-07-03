# Kiến trúc Clean Architecture & Domain Driven Design

## Mục tiêu
- Tách biệt các layer (Presentation, Application, Domain, Infrastructure) để giảm phụ thuộc lẫn nhau.
- Đảm bảo các khối nghiệp vụ (Domain) không phụ thuộc vào framework hay chi tiết triển khai.

## Các thành phần chính
| Layer | Trách nhiệm | Ví dụ trong dự án |
|-------|--------------|-------------------|
| **Presentation** | Giao diện người dùng, API Controllers | Next.js, React components, API route handlers |
| **Application** | Orchestration, Use‑case services | Service classes trong `src/services/` |
| **Domain** | Business logic, Entities, Value Objects | Entities trong `src/domain/`, DDD aggregates |
| **Infrastructure** | Implementations of external services (DB, cache, messaging) | Repositories trong `src/infrastructure/` |

## Lợi ích
- Dễ dàng thay đổi công nghệ UI mà không ảnh hưởng tới business logic.
- Test unit cho Domain được thực hiện mà không cần khởi tạo DB hay framework.
- Mở rộng tính năng mới bằng cách thêm Use‑case mới trong Application layer.

## Áp dụng trong dự án
- Các policy RLS, claim extraction được đặt trong **Domain** như các rule objects.
- Các service thực thi SOAR được triển khai trong **Application** và chỉ gọi các repository của **Infrastructure**.

*Tham khảo: *"Clean Architecture" của Robert C. Martin và các tài liệu DDD.
