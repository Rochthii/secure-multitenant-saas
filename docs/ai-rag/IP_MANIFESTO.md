# HỒ SƠ XÁC NHẬN TÀI SẢN TRÍ TUỆ: ENTERPRISE SECURITY & COMPLIANCE COPILOT RAG ENGINE

Tài liệu này xác định ranh giới kiến trúc kỹ thuật và quyền sở hữu đối với hệ thống trí tuệ nhân tạo **Enterprise Security Policy & IT Audit Copilot RAG**, được phát triển như một phân hệ bảo mật nâng cao tách biệt logic với cấu trúc nghiệp vụ cơ bản của nền tảng SaaS đa khách hàng. Đây là minh chứng học thuật quan trọng chứng minh năng lực tự chủ công nghệ trong đồ án tốt nghiệp PTIT.

## 1. Các thành phần thuộc Phân hệ AI RAG (Core AI Assets)

Hệ thống Security Copilot được xây dựng dựa trên sự tích hợp chặt chẽ của các thành phần kỹ thuật đặc thù sau:

### A. Hạ tầng Dữ liệu Chính sách (Compliance Knowledge base)
- **Cơ sở dữ liệu tri thức vật lý:** Bảng `public.dharma_documents` (lưu trữ chính sách an ninh thô) và `public.dharma_embeddings` (lưu trữ vector 1536 chiều). Cấu trúc vật lý được giữ nguyên để bảo đảm tính tương thích ngược tuyệt đối.
- **Tập dữ liệu chuẩn hóa (Structured Chunks):** Hàng chục ngàn đoạn trích dẫn điều khoản chính sách doanh nghiệp, chuẩn hóa ISO 27001, các nghị định bảo vệ dữ liệu cá nhân kèm metadata phân lớp chi tiết theo phòng ban (`department_id` - ánh xạ vật lý sang `tradition_id`).
- **Phân loại chuyên đề:** Đồ thị quan hệ thuật ngữ quản trị rủi ro thông tin phục vụ truy xuất ngữ nghĩa nâng cao (Knowledge Graph).

### B. Lõi xử lý thông minh (Technical RAG Engine)
- **Động cơ RAG Lai (Hybrid Retrieval-Augmented Generation):** Logic tích hợp xử lý stream tại `supabase/functions/rag-chat/index.ts`.
- **Semantic Caching Engine:** Thuật toán tối ưu hóa truy vấn trùng lặp dựa trên độ tương đồng Cosine (Cosine Similarity) tại bảng `public.ai_query_cache` kết hợp cơ chế tự động dọn rác (Self-Healing).
- **Multi-Agent Classifier & Policy Expander:** Cơ chế tự động định tuyến câu hỏi dựa vào bộ phận chuyên môn (`THERAVADA` -> HR, `MAHAYANA` -> IT, `VAJRAYANA` -> Finance, `KHATTSI` -> Board) bằng `Gemini Flash Lite` trước khi thực hiện truy xuất sâu.
- **Compliance Citation System:** Thuật toán tự động tạo thẻ dẫn chiếu chính xác điều khoản chính sách doanh nghiệp hoặc Annex ISO 27001 từ dữ liệu thô.

### C. Giao diện Vận hành & Giám sát (Admin Security UI)
- **Giao diện Console cao cấp:** Thiết kế floating widget Glassmorphism với viền Neon Amber sang trọng tích hợp trực tiếp vào góc phải `/admin` layout.
- **Thành phần tương tác thực tế:** Component `AiSecurityCopilotWidget` tích hợp biểu đồ giám sát an ninh (Security Score), luồng phản hồi streaming byte, nút kích hoạt auto defense (Force Logout tài khoản xâm nhập trái phép) và xuất báo cáo an ninh Markdown chuẩn.

## 2. Phân nhiệm Đóng góp Kỹ thuật (Roles & Contributions)

| Thành viên | Vai trò | Phần đóng góp cốt lõi |
| :--- | :--- | :--- |
| **Kỹ sư Hạ tầng (SaaS Architect)** | Kỹ thuật & Infra | Thiết kế RLS Database, JWT Custom Claims, Connection Pooling (Supavisor), WORM Vault, Webhook Alerting, Node JS Ingestion Scripts. |
| **Kỹ sư AI & Compliance (AI Specialist)** | thuật toán & Tri thức | Thiết kế Edge Function Hybrid Search, Prompt Engineering, Semantic Caching, Xây dựng bộ test suite dữ liệu chính sách ISO 27001. |

## 3. Kế hoạch Cô lập & Bảo vệ mã nguồn (Modular Protection Plan)

Nhằm đảm bảo phân hệ AI có thể dễ dàng cắm ráp hoặc chuyển giao công nghệ mà không ảnh hưởng tới vận hành của trang SaaS chính:
- **Logical Grouping:** Toàn bộ logic giao diện AI được đóng gói hoàn toàn trong file `components/admin/ai-security-copilot-widget.tsx`.
- **Database Isolation:** Toàn bộ dữ liệu tri thức được quản lý tách biệt qua cơ chế Row Level Security (RLS) ở mức database, tự động lọc theo `tenant_id` để ngăn chặn rò rỉ dữ liệu chéo (Cross-tenant Leakage) giữa các khách hàng doanh nghiệp.

---
*Tài liệu xác nhận quyền tài sản trí tuệ — Đồ án tốt nghiệp Chăm Rốch Thi — PTIT 2026*
