# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2026-05-05] - Agentic GraphRAG V2 Launch
### Added
- **GraphRAG V2 Engine**: Chuyển đổi sang kiến trúc Agentic hoàn chỉnh.
- **Active Entity Extraction (NER)**: Tích hợp LLM (Gemini) để trích xuất thực thể từ query người dùng.
- **Recursive Multi-hop Traversal**: Triển khai Recursive CTE hỗ trợ tìm kiếm quan hệ 2-hop đa chiều (bi-directional).
- **Graph-Aware Reranking**: Cơ chế boosting điểm số cho tài liệu dựa trên kiến thức từ Knowledge Graph.
- **Knowledge Base Expansion**: Mở rộng lên >210 entities và >230 relations (Tứ Diệu Đế, Bát Chánh Đạo, Thập Nhị Nhân Duyên, Hệ phái Khất Sĩ...).
- **Evaluation Pipeline**: Script đánh giá 30 cases relational logic đạt 100% độ chính xác.

### Changed
- Refactor **rag-chat** Edge Function: Tách biệt pipeline NER, Search và Rerank.
- Nâng cấp schema Graph sang mô hình thực thể (Entities) và quan hệ (Relations) chuẩn.

### Fixed
- Lỗi đệ quy vô hạn (infinite loop) trong SQL CTE traversal.
- Lỗi mismatch kiểu dữ liệu (text vs uuid) trong quá trình thu thập path quan hệ.

## [2026-04-17] - Dharma AI RAG Optimization
### Added
- Dự án Nghiên cứu Khoa học (NCKH): **Agentic GraphRAG Engine**.
- Tích hợp **Dharma Ontology** với 300+ thuật ngữ Pali, Hán-Việt.
- Cơ chế **Hybrid Search** (Vector + Semantic) và Re-rank.
- Hệ thống **Multi-turn Memory** cho AI Chat (Contents Array).
- Pipeline đánh giá tự động **Ragas** (Faithfulness, Relevancy).
- Module **Trắc nghiệm AI (Quiz Engine)** tự động sinh câu hỏi.

### Changed
- Nâng cấp **rag-chat** Edge Function lên kiến trúc Agentic.
- Cải thiện hệ thống **LLM Fallback** (Gemini 2.0 Flash -> Pro).
- Mở rộng logic **Query Expansion** với 120+ pattern đàm thoại.

### Fixed
- Lỗi mất Header trên Mobile Web AI Portal.
- Lỗi cuộn màn hình (Smart Scroll) khi AI đang phản hồi.
- Lỗi mất bộ nhớ hội thoại của người dùng ẩn danh.

---

## [2026-04-15] - Dharma Chat Intelligence & Continuity Overhaul
 
 ### Added
 - **Neural Conversational Memory**: Kích hoạt hệ thống ghi nhớ bối cảnh với cửa sổ 10 tin nhắn và quản lý `session_id` xuyên suốt phiên chat.
 - **Reasoning-First Prompting**: Thiết kế lại toàn bộ System Prompt theo quy trình "Nghiên cứu -> Tổng hợp -> Diễn giải", giúp AI giải thích giáo lý dễ hiểu nhưng vẫn chuẩn xác.
 - **Session Handshake**: Đồng bộ hóa `session_id` giữa React Hook (`useWebRag`) và Supabase Edge Function để duy trì mạch hội thoại.
 
 ### Changed
 - **AI Core Models Upgrade**: Chuyển đổi sang `gemini-2.5-flash-lite` (ổn định) và `gemini-embedding-2-preview` (1536 chiều).
 - **Precision Tuning**: Giảm `temperature` xuống 0.2 để ưu tiên tính logic và độ chính xác đối với kinh điển.
 - **Mobile-First UX Optimization**: 
   - Sử dụng `h-[100dvh]` để xử lý linh hoạt bàn phím ảo trên di động.
   - Áp dụng `break-words` và `overflow-wrap` cho toàn bộ khung chat để triệt tiêu lỗi tràn màn hình.
 
 ### Fixed
 - **Citation Redundancy**: Loại bỏ định dạng trích dẫn lặp thừa, mang lại giao diện học thuật tinh gọn.
 - **Mobile Layout Glitches**: Sửa lỗi Citations không tự ngắt dòng trên các thiết bị màn hình nhỏ.
 
 ---
 
 ## [2026-04-14] - Dharma Chat RAG Production-Ready & Feedback Loop

### Added
- **AI Feedback Loop (Human-in-the-loop)**: Triển khai hệ thống ghi nhận phản hồi tiêu cực (👎) thực tế, lưu log vào `ai_low_quality_logs`.
- **Admin AI Correction Dashboard**: Tab quản trị mới cho phép Admin hiệu đính câu trả lời kém chất lượng và nạp lại vào bộ đệm (re-cache) ngay từ app Mobile.
- **Premium Thinking Experience**: Nâng cấp hiệu ứng AI đang suy nghĩ với 3 dấu chấm nhảy (staggered dots) và hào quang (pulse aura) xung quanh Avatar.
- **Academic Markdown Rendering**: Tích hợp `react-markdown` và `@tailwindcss/typography` để hiển thị nội dung AI chuẩn học thuật (in đậm, danh sách, trích dẫn).

### Changed
- **Multi-tenant RAG Isolation**: Nâng cấp Edge Function hỗ trợ lọc cache và tài liệu theo `tenant_id`, đảm bảo cách ly dữ liệu giữa các chi nhánh.
- **Performance Upgrade**: Chuyển đổi sang model `text-embedding-3-small` (1536 chiều) và `Gemini 1.5 Pro` để tăng độ chính xác trích dẫn.
- **Documentation Overhaul**: Cập nhật toàn diện tài liệu Workflow AI (`docs/16`) và DB Migration (`docs/15`) để khớp với kiến trúc thực tế.

### Fixed
- **TypeScript & Build Errors**: Khắc phục các lỗi định nghĩa kiểu của `react-markdown` v10 và loại bỏ dead-code trong bộ test Auth.

---

## [2026-04-13] - Dharma Chat AI Portal & RAG Infrastructure Release

### Added
- **Dharma Chat AI Portal**: Giao diện chat chuyên biệt cho Nhân sự (Standalone Layout Style: `ai_portal`).
- **RAG Management Dashboard**: Công cụ quản trị tri thức cho Super Admin, nạp PDF và quản lý Embedding tự động.
- **RBAC for AI**: Hệ thống bảo mật Role-Based chặn người dùng không có quyền gán layout AI.
- **Academic Citations**: Hiển thị nguồn trích dẫn từ Kinh điển Nam tông với metadata chi tiết (tác giả, tập, trang).
- **Comprehensive AI Testing**: Bộ 15 unit tests phủ toàn bộ Hook (`useWebRag`) và UI Components (`DharmaChatInput`, `DharmaChatBubble`).
- **AI Semantic Cache**: Tự động lưu vết và tái sử dụng phản hồi chất lượng cao để tiết kiệm Token và tăng tốc độ trả lời.

### Changed
- **Tenant Configuration**: Nâng cấp `TenantForm` hỗ trợ lọc layout theo quyền hạn của người dùng đang đăng nhập.
- **RAG Category Taxonomy**: Mở rộng hệ thống danh mục để hỗ trợ phân loại sâu (Kinh - Luật - Luận).

### Fixed
- **Next.js 15+ Compatibility**: Chuyển đổi API route params sang định dạng `await` để đảm bảo tương thích với các phiên bản Next.js mới nhất (Fix lỗi build production).
- **SSE Stream Robustness**: Cải thiện thuật ngữ xử lý lỗi trong Hook streaming để tránh bị treo khi API RAG gặp sự cố.

### Database
- New tables: `ai_chat_logs`, `ai_semantic_cache`, `dharma_embeddings`, `ai_quiz_engine`, `ai_portal_users`.
- Cascade delete logic updated to handle AI-related data assets safely.

---

## [2026-04-11] - Platform Logo Standardization & Admin UX Modernization

### Added
- **Global Logo Standardization**: Triển khai component `TenantLogo` thống nhất cho toàn bộ hệ thống, hỗ trợ tự động xử lý hình ảnh, scaling và fallback chuyên nghiệp (adaptive/circle).
- **Artistic Culture Components**: Bổ sung 4 khối giao diện (blocks) nghệ thuật cho trang Văn hóa, hỗ trợ hiển thị nội dung đặc thù của chi nhánh trên trang chủ.
- **Enhanced Icon API**: Nâng cấp bộ `KhmerIcon` hỗ trợ prop `size`, cho phép tùy chỉnh kích thước linh hoạt và an toàn (type-safe) cho tất cả 8 icon bản sắc.

### Changed
- **Unified Header/Footer Architecture**: Refactor thành công **22 component** (11 Header & 11 Footer) trên tất cả 11 theme để sử dụng `TenantLogo`, đảm bảo tính nhất quán thương hiệu tuyệt đối.
- **Modernized Admin Project UI**: Nâng cấp giao diện thêm/sửa Dự án với các input hiện đại, giao diện trực quan và trải nghiệm tương tự module Tin tức/Pháp thoại cao cấp.
- **Editorial Culture Page**: Tái thiết kế trang Văn hóa (`/van-hoa`) theo phong cách biên tập, tận dụng tối đa không gian trắng và typography để truyền tải nội dung nghệ thuật.

### Fixed
- **TypeScript Prop Type Error**: Khắc phục các lỗi định nghĩa kiểu của `react-markdown` v10 và loại bỏ dead-code trong bộ test Auth.
- **Branding Consistency**: Loại bỏ hoàn toàn các logic render logo thủ công (img/div) trong lớp layout, đảm bảo mọi chi nhánh (tenant) đều hiển thị logo chuẩn xác.

---

## [2026-04-07] - Standardized Category Selection & Admin Stabilization

### Added
- **Standardized Category Selection**: Triển khai `CustomCategorySelect` cho module Sự kiện và Thư viện ở cả cấp Chi nhánh và Toàn hệ thống.
- **Hierarchical Filtering**: Bộ lọc danh mục mới hỗ trợ cấu trúc cây (nested) và phân tách tab "Hệ thống / Chi nhánh".
- **Global Event Filter**: Bổ sung bộ lọc danh mục cho trang Quản lý Sự kiện toàn hệ thống (`/admin/events`).
- **Dynamic Category Labeling**: Tự động hiển thị tên chi nhánh nguồn gốc cho các danh mục khi xem ở chế độ Global Admin.

### Changed
- **Admin UX**: Cải thiện trải nghiệm chọn danh mục với giao diện hiện đại, hỗ trợ tìm kiếm và phân tách nguồn gốc rõ ràng.
- **Standardized Data Fetching**: Chuyển đổi toàn bộ logic lấy danh mục sang `getCachedCategoriesTree` để tối ưu hiệu năng và tính nhất quán.

### Fixed
- **Critical System Restoration**: Khôi phục tệp định nghĩa kiểu dữ liệu `database.types.ts` bị lỗi làm trống, đảm bảo tính toàn vẹn của hệ thống Type-safe.
- **Media List Corruption**: Sửa lỗi cấu trúc và import trong `MediaListClient.tsx` sau khi bị ghi đè lỗi.

---

## [2026-04-02] - Multitenant Library Sharing & Global Admin
### Added
- **Cross-tenant Media Distribution**: Cơ chế phát sóng (Broadcast) cho Thư viện Số, cho phép chia sẻ tài liệu, video, audio giữa các chi nhánh.
- **Global Media Admin**: Trang quản trị tổng `/admin/media` dành cho Super Admin để quản lý thư viện trên toàn hệ thống.
- **Global Categories Management**: Trang `/admin/categories` tập trung quản lý phân loại nội dung cho tất cả các phân hệ.
- **Broadcast Target Selection**: Tích hợp bộ chọn chi nhánh đích (filtered by `tenant_type='tenant'`) vào Media Detail Dialog và Category Form.
- **Cross-tenant Visibility**: Cập nhật RLS và Query logic để nội dung được chia sẻ tự động xuất hiện tại các Dashboard của chi nhánh đích.

### Changed
- **Admin Navigation**: Mở rộng quyền truy cập và hiển thị các trang Global Admin cho `super_admin` và `company_editor`.
- **Tenant Filtering**: Bộ chọn chi nhánh trong các tính năng Broadcast giờ đây chỉ hiển thị các "Chi nhánh" (tenant), ẩn các thực thể dạng công ty/tổ chức khác.

### Fixed
- **Category UI Consistency**: Đảm bảo icon và nhãn của danh mục được phát sóng hiển thị chính xác tại chi nhánh đích.
- **TypeScript Strictness**: Khắc phục các lỗi ép kiểu (casting) trong các trang Admin tổng.

## [2026-03-25] - Unified Projects & Modern Hub Release

### Added
- **Unified Project System**: Gộp `transaction_purposes` và `transaction_projects` vào bảng `transaction_projects` duy nhất. 
- **Modernized Knowledge Hub**: Giao diện tin tức mới tối giản, chuyên nghiệp cho các Tenant dạng doanh nghiệp (McAaron theme).
- **Comprehensive Test Suite**: Bổ sung bộ 46 unit & integration tests cho toàn bộ hệ thống Thanh toán, Báo cáo và Navigation.
- **Adaptive Header**: Header McAaron tự động thay đổi Menu (responsive) và lấy danh mục động từ Database.
- **Bank Account Mapping**: Cho phép gán tài khoản ngân hàng riêng cho từng Chiến dịch/Dự án.

### Changed
- **Transaction Flow**: Quy trình phát tâm tự động nhận diện `project_id` và gán tài khoản ngân hàng + loại quỹ tương ứng.
- **Admin Projects UI**: Giao diện quản lý gộp mới với các bộ lọc thông minh cho dự án/quỹ chung.
- **Transparency Portal**: Hệ thống minh bạch và Impact Dashboard đã chuyển sang sử dụng dữ liệu Chiến dịch thời gian thực.
- **Switch UI**: Cải thiện độ hiển thị cho nút bật/tắt trên các theme màu vàng (gold).

### Fixed
- **Navigation Redundancy**: Xóa bỏ các mục Menu bị trùng lặp trong phần Dự án và Kiến thức.
- **Security Hardening**: Khắc phục các chính sách RLS cũ và củng cố quyền hạn cho các vai trò `tenant_accountant`, `company_editor`.
- **Legacy Test Regressions**: Cập nhật toàn bộ các bài viết test cũ để khớp với cấu trúc Schema mới.
- **Header Overflow**: Sửa lỗi Menu bị che khuất trên màn hình Desktop cỡ nhỏ (1024px-1280px).

---

## [2026-03-14] - Foundation & Multi-tenant Init
### Added
- Core multi-tenant architecture with Supabase RLS.
- Basic transaction flow and News/Events modules.
- Dynamic branding & theme system.
