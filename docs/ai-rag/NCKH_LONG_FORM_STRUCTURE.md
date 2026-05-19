# 📑 NCKH-02: Cấu Trúc Báo Cáo Đề Tài Nghiên Cứu Khoa Học (Dài)
## Đề tài: Hệ thống Trí tuệ nhân tạo Truy xuất Tri thức Phật giáo đa hệ phái dựa trên kiến trúc GraphRAG
### Độ dài dự kiến: 60 - 80 trang | Chuẩn Nghiệm thu Đề tài / Luận văn nộp Học viện

---

## 📅 PHÂN BỔ TỔNG THỂ

1. **Phần thủ tục (Bìa, Lời cam đoan, Mục lục, Danh mục bảng biểu):** 5 trang
2. **Mở đầu:** 5 trang
3. **Chương 1: Tổng quan lý thuyết và Thực trạng:** 15 trang
4. **Chương 2: Kiến trúc và Giải pháp kỹ thuật GraphRAG-Dharma:** 20 trang
5. **Chương 3: Triển khai thực nghiệm và Đánh giá:** 15 trang
6. **Kết luận và Kiến nghị:** 5 trang
7. **Tài liệu tham khảo & Phụ lục:** 10+ trang

---

## 🏛️ CHI TIẾT TỪNG CHƯƠNG

### PHẦN MỞ ĐẦU (5 Trang)
*Trả lời câu hỏi: Tại sao phải làm đề tài này ngay bây giờ?*
- **Tính cấp thiết:** Sự bùng nổ của AI và nhu cầu bảo tồn kinh điển số.
- **Mục tiêu:** Xây dựng hệ thống RAG không Hallucination.
- **Đối tượng & Phạm vi:** Các bộ kinh Theravada, Đại Thừa, Thiền Tông (Việt-Pali-Khmer).
- **Phương pháp nghiên cứu:** Thực nghiệm, thống kê, phân tích định tính từ chuyên gia.

### CHƯƠNG 1: CƠ SỞ LÝ THUYẾT VÀ THỰC TRẠNG (15 Trang)
*Trả lời câu hỏi: Thế giới và Việt Nam đang làm đến đâu rồi?*
- **1.1. Công nghệ RAG và Mô hình ngôn ngữ lớn:** Giải thích sâu về Transformer, Embedding, Vector Database.
- **1.2. GraphRAG và Đồ thị tri thức:** Tại sao quan hệ giữa các văn bản lại quan trọng hơn tìm kiếm từ khóa đơn thuần.
- **1.3. Hệ thống kinh điển Phật giáo Việt Nam:** Phân tích đặc điểm ngữ liệu của các hệ phái (PH viết chính).
- **1.4. Thực trạng các công cụ tra cứu hiện nay:** Phân tích ưu nhược điểm của các website hiện có, chỉ ra lỗi "bịa nội dung" của ChatGPT khi hỏi về kinh điển.

### CHƯƠNG 2: KIẾN TRÚC VÀ GIẢI PHÁP KỸ THUẬT (20 Trang)
*Trả lời câu hỏi: "Cỗ máy" này cấu tạo như thế nào? (Chương quan trọng nhất)*
- **2.1. Quy trình xử lý dữ liệu đa ngôn ngữ:** Cách chuẩn hóa tiếng Pali, Hán-Việt sang Vector.
- **2.2. Xây dựng Đồ thị tri thức (Knowledge Graph):** Mô tả chi tiết các Node (Kinh, Khái niệm, Tác giả) và các Edge (Quan hệ chú giải, quan hệ tương đồng).
- **2.3. Thuật toán Hybrid Retrieval:** Công thức phối hợp Dense (Vector) + Sparse (BM25/FTS) + Graph Power thông qua Reciprocal Rank Fusion (RRF).
- **2.4. Hệ thống phân tầng nguồn học thuật:** Giải thích logic ưu tiên nguồn gốc (Primary sources) so với chú giải.
- **2.5. Hạ tầng Công nghệ cốt lõi:**
  - Lớp Dữ liệu: Supabase PostgreSQL (pgvector, Full-Text Search).
  - Lớp Edge Streaming: Native Deno Edge (`ReadableStream` & Server-Sent Events) giúp loại bỏ bộ đệm thư viện trung gian (như Vercel AI SDK), tối đa hóa tốc độ phản hồi. Kháng Timeout của Serverless.
  - Lớp AI: Tích hợp Đa tác tử (Multi-Agent). Cửa ngõ Routing dùng Gemini Flash-Lite. Sinh văn bản dùng Google Gemini 1.5 Pro. Nhúng qua `gemini-embedding-2-preview` (1536 chiều).
  - Lớp Giao diện: Next.js App Router, Tailwind CSS, hiển thị Rich Markdown, Toán học (KaTeX/LaTeX) trực tiếp.
- **2.6. Tính năng Quản trị và Trải nghiệm người dùng:**
  - Quản lý định danh qua JWT với cấu trúc RLS nghiêm ngặt giúp cách ly dữ liệu Multi-tenant.
  - Cơ chế Semantic Caching với khả năng tự quét dữ liệu rác (Self-Healing Cache).
  - Multi-key Failover tự động xoay vòng khóa API (Round-robin) bảo mật Availability 99.9%.
  - Cơ chế phản hồi học thuật (Human-in-the-loop Upvote/Downvote feedback).

### CHƯƠNG 3: TRIỂN KHAI THỰC NGHIỆM VÀ ĐÁNH GIÁ (15 Trang)
*Trả lời câu hỏi: Nó chạy tốt đến mức nào? (Số liệu thực tế)*
- **3.1. Giới thiệu bộ dữ liệu kiểm thử BuddhaQA:** Quy trình biên soạn câu hỏi từ chuyên gia Học viện.
- **3.2. Kết quả định lượng (Metrics):** Bảng biểu, biểu đồ về Faithfulness, Relevancy, Citation Accuracy.
- **3.3. Đánh giá định tính (Case Studies):** Phân tích chi tiết 5-10 câu hỏi khó, so sánh câu trả lời của hệ thống với ChatGPT thông thường.
- **3.4. Phân tích lỗi và Hạn chế:** Tại sao hệ thống vẫn sai ở một số điểm và hướng khắc phục.

### KẾT LUẬN VÀ KIẾN NGHỊ (5 Trang)
- Tóm lược các đạt được về mặt kỹ thuật và Phật học.
- Đề xuất ứng dụng thực tế vào thư viện số của các chi nhánh và Học viện.

---

## ✍️ LÀM SAO ĐỂ VIẾT "DÀY" MÀ CHẤT LƯỢNG?

Bố và chuyên gia Phật học lưu ý tăng độ dày ở các phần sau:

1. **Hình ảnh minh họa:** Mỗi trang nên có 1 sơ đồ hoặc bảng biểu. Con sẽ hỗ trợ bố vẽ các sơ đồ kiến trúc phức tạp để chèn vào.
2. **Bảng thuật ngữ:** Một bảng danh mục ~100 thuật ngữ Pali/Hán-Việt kèm định nghĩa và vị trí trong đồ thị tri thức sẽ chiếm khoảng 3-4 trang cực kỳ giá trị.
3. **Mô tả dữ liệu:** Thay vì nói "tôi có 100 cuốn sách", hãy mô tả từng bộ kinh (lịch sử, số trang, tầm quan trọng giáo lý). Mỗi bộ kinh viết 1/2 trang là bố đã có ngay 10 trang nội dung rất sâu.

---

> [!TIP]
> **Lời khuyên của con:** Bố hãy coi bản 10 trang (Paper) là "bản tóm tắt tinh hoa" để nộp quốc tế, còn bản 60 trang này là "kho tàng tri thức" để lưu trữ và nghiệm thu đề tài. Bố muốn con viết chi tiết nội dung mẫu cho chương nào trước không ạ?
