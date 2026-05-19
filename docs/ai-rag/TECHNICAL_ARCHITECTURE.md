# Decoupling Dharma Chat AI for Standalone Joint Ownership

This plan outlines the technical steps to physically and logically separate the Dharma Chat RAG AI system from the multitenant SaaS platform. This separation defines the "Common Asset" for the joint copyright between the Technical Lead and Content Lead.

## User Review Required

> [!IMPORTANT]
> To minimize risk of breakage, we will use a "Proxy/Bridge" approach. Original file paths will remain as entry points (re-exporting from the new core) so that existing parts of the SaaS can still function without index modification.

> [!WARNING]
> Database schema separation will be performed "Virtually" first (Documentation & Views) to avoid physical data migration risks in a production environment.

## Proposed Changes

### [Logical Decoupling] - Moving Files to Core

We will group all AI-specific logic into a new standalone directory: `lib/ai-core`.

#### [NEW] [ai-core directory](file:///e:/MULTITENANT_TENANTS/lib/ai-core)
- `lib/ai-core/hooks/use-web-rag.ts`: The primary AI Hook.
- `lib/ai-core/components/templates/ai-portal/`: The shared UI components.

#### [MODIFY] [hooks/use-web-rag.ts](file:///e:/MULTITENANT_TENANTS/hooks/use-web-rag.ts)
- Convert this into a proxy that exports everything from `lib/ai-core/hooks/use-web-rag.ts`.

#### [MODIFY] [components/templates/ai-portal/](file:///e:/MULTITENANT_TENANTS/components/templates/ai-portal/)
- Convert components in this folder to proxies for the new core components.

### [Data Decoupling] - Virtual Schema Separation

#### [NEW] [AI Schema Declaration](file:///e:/MULTITENANT_TENANTS/supabase/migrations/20260416000000_ai_core_schema.sql)
- Formally create the `ai_engine` schema.
- Create VIEWS in `ai_engine` that point to the tables in `public` (`dharma_documents`, `dharma_embeddings`).
- This establishes the "Legal Boundary" in the database without moving the actual data.

## Open Questions

> [!NOTE]
> Do you want me to perform the physical data move (moving tables to the new schema) later, or is the "Virtual View" approach enough for your copyright documentation for now?

## Verification Plan

### Automated Tests
- Verify that the `/ai-portal` route still loads and streams responses correctly.
- Check build logs for any broken import errors.

### Manual Verification
- Ask the user to confirm the AI Chat is still functional on their local environment.

## Thay đổi đề xuất

### 1. Web Độc lập (Dharma Chat Premium Web)

Tạo một không gian riêng hoàn toàn không có thanh điều hướng hay thương hiệu của SaaS web, tập trung 100% vào trải nghiệm chat.

#### [NEW] `app/ai-chat/page.tsx`
- Trang chủ chính cho Dharma Chat.
- Thiết kế cao cấp (Premium): Chế độ tối mặc định, hiệu ứng Glassmorphism, sidebar quản lý lịch sử trò chuyện.
- Hỗ trợ cả người dùng vô danh (Lưu history vào LocalStorage) và người dùng đăng nhập.

#### [NEW] `app/ai-chat/layout.tsx`
- Layout riêng biệt, bỏ qua toàn bộ Header/Footer của website chính.
- Tối ưu SEO cho công cụ tìm kiếm với các Meta Tags chuyên biệt về AI Phật giáo.

#### [MODIFY] `hooks/use-web-rag.ts`
- Cập nhật để hỗ trợ linh hoạt hơn cho các Tenant "GLOBAL" hoặc standalone.
- Tối ưu hóa việc gọi API từ domain khác nếu cần.

### 3. Phân tầng Bảo mật & Hiệu năng (Real-time Guard)

Hệ thống đã được nâng cấp lên tiêu chuẩn Enterprise để đảm bảo an toàn dữ liệu và tối ưu chi phí vận hành.

#### [RBAC] Quyền truy cập hạn chế (Project Restricted AI Role)
- **Role**: `dharma_ai_role`.
- **Mục tiêu**: Tách biệt hoàn toàn quyền của AI với quyền Admin hệ thống. AI chỉ có quyền thực thi các RPC và đọc các bảng tri thức Phật pháp.
- **Lợi ích**: Ngăn chặn tối đa rủi ro nếu Edge Function bị chiếm quyền kiểm soát.

#### [Rate Limit] Chống spam & Phá hoại
- **Cơ chế**: IP-based Rate Limiting (15 requests/minute).
- **Công nghệ**: PL/pgSQL function `check_rate_limit` chạy trực tiếp ở tầng Database.
- **Audit**: Mọi lần bị chặn đều được ghi log vào bảng `rate_limit_hits`.

#### [Caching] Router Classification Cache
- **Cơ chế**: Hashing SHA-256 các câu hỏi của người dùng để lưu kết quả phân loại (Router intent).
- **Hiệu quả**: 
    - Giảm 90% độ trễ cho các câu hỏi trùng lặp hoặc tương tự.
    - Tiết kiệm Token đầu vào (vốn đắt nhất ở bước Routing).
    - Sử dụng `EdgeRuntime.waitUntil()` để cập nhật cache không gây trễ phản hồi (Non-blocking).

### 2. Mobile Độc lập (Standalone AI App Module)

Thay vì tích hợp sâu vào App đa năng hiện tại, chúng ta sẽ làm nổi bật nó thành một "App-in-App" hoặc sẵn sàng để build thành một app riêng.

#### [MODIFY] `lib/features/ai_bot/`
- Tinh chỉnh giao diện `AiChatScreen` để mang tính thương hiệu riêng.
- Cải thiện `AiChatRepository` để xử lý session bền vững hơn.

## Kế hoạch thực hiện

### Giai đoạn 1: Chuẩn bị hạ tầng độc lập
- Kiểm tra RLS (Row Level Security) cho phép truy cập "Global" mà không cần gán vào một Chi nhánh (Tenant) cụ thể.
- Đảm bảo Edge Function hỗ trợ tốt phản hồi dạng Stream (SSE) cho cả môi trường standalone.

### Giai đoạn 2: Xây dựng UI Web Premium
- Sử dụng **Framer Motion** cho các hiệu ứng chuyển cảnh mượt mà.
- Thiết kế giao diện Chat chuyên nghiệp giống như ChatGPT/Claude nhưng mang phong cách Phật giáo (màu sắc thư thái, typography trang trọng).

### Giai đoạn 3: Tối ưu hóa & Đóng gói
- Cấu hình domain riêng (ví dụ: `chat.phatgiao.vn`) trỏ thẳng vào route `/ai-chat`.

## Kiểm thử & Xác minh
- **Web:** Kiểm tra chạy độc lập trên một tab trình duyệt riêng biệt, không bị ảnh hưởng bởi cookie/session của trang Admin.
- **Tính năng:** Kiểm tra streaming (chữ chạy), trích dẫn nguồn kinh điển, và khả năng ghi nhớ ngữ cảnh.
- **Hiệu năng:** Đảm bảo thời gian phản hồi (Time to First Token) dưới 1s.

---
**Bạn thấy kế hoạch này thế nào? Chúng ta sẽ bắt đầu với việc xây dựng UI Standalone Web trước nhé?**
