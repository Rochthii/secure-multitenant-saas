# HỒ SƠ CÔNG NHẬN TÀI SẢN TRÍ TUỆ: DHARMA CHAT RAG ENGINE

Hồ sơ này nhằm xác định ranh giới kỹ thuật và quyền sở hữu đối với hệ thống trí tuệ nhân tạo **Dharma Chat RAG AI**, tách biệt với nền tảng SaaS chính. Đây là cơ sở để thực hiện đăng ký bản quyền và sở hữu trí tuệ chung giữa hai đồng sáng lập.

## 1. Thành phần Sở hữu chung (Joint Assets)

Hệ thống AI RAG được định nghĩa bao gồm các thành phần độc đáo sau:

### A. Hạ tầng Dữ liệu & Tri thức (Content Architecture)
- **Cơ sở dữ liệu Kinh điển:** Các bảng `ai_engine.dharma_documents` và `ai_engine.dharma_embeddings`.
- **Dữ liệu Vector hóa:** Hàng chục ngàn đoạn trích dẫn (chunks) đã được xử lý và gán nhãn metadata học thuật (mã kinh, dịch giả, số kệ).
- **Hệ thống chuyên đề:** Cấu trúc phân loại từ vựng và chủ đề Phật học đặc thù phục vụ tìm kiếm ngữ nghĩa.

### B. Lõi Kỹ thuật (Technical Engine)
- **Thuật toán RAG (Retrieval-Augmented Generation):** Logic xử lý tại `supabase/functions/rag-chat/`.
- **Semantic Caching Engine:** Thuật toán tối ưu hóa bộ nhớ đệm dựa trên độ tương đồng (Cosine Similarity) tại bảng `ai_query_cache`.
- **Smart Query Expansion:** Cơ chế tự động giải nghĩa câu hỏi tiếp nối dựa trên ngữ cảnh lịch sử hội thoại.
- **Academic Citation System:** Thuật toán tự động tạo trích dẫn chuẩn học thuật từ dữ liệu thô.

### C. Giao diện Trải nghiệm (UI/UX Identity)
- **Thiết kế Signature:** Phong cách "Giấy Dó & Hào Quang" đặc trưng.
- **Component thư viện:** `DharmaChatBubble`, `DharmaChatInput` và luồng streaming chữ.

## 2. Phân nhiệm Quyền hạn (Roles & Contributions)

| Thành viên | Phụ trách chính | Tài sản đóng góp |
| :--- | :--- | :--- |
| **Đồng sáng lập A (SaaS Owner)** | Kỹ thuật & Hạ tầng | Kiến trúc hệ thống, Thuật toán RAG, Caching, Cloud Infra. |
| **Đồng sáng lập B (Content Lead)** | Kinh sách & Biên mục | Tuyển tập kinh điển, Số hóa, Gán nhãn học thuật, Kiểm định nội dung. |

## 3. Kế hoạch xác thực Bản quyền (Zero-Risk Execution)

Để bảo vệ bản quyền mà không làm ảnh hưởng đến hệ thống SaaS đang chạy, chúng ta sẽ thực hiện:

### Giai đoạn 1: Khai báo sở hữu (Ngay bây giờ)
- Tạo file `LEGAL_MANIFEST.md` trong root của project.
- Thêm chú thích bản quyền vào đầu tất cả các file mã nguồn liên quan (Header tagging).

### Giai đoạn 2: Module hóa logic (An toàn)
- Group tất cả logic AI vào một thư mục `core/ai_engine` trong code.
- Đảm bảo logic AI có thể "xuất khẩu" (Export) sang một domain khác mà không bị chết.

---
**Tôi đã chuẩn bị xong danh mục này. Bạn có muốn tôi thực hiện việc "đóng dấu" bản quyền vào các file mã nguồn (bước quan trọng nhất về mặt kỹ thuật để làm bằng chứng bản quyền) không?** 
*Thao tác này chỉ là thêm comment vào đầu file, hoàn toàn không có rủi ro về logic chương trình.*
