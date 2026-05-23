# 📑 NCKH-02: Cấu Trúc Luận Văn Đồ Án Tốt Nghiệp / Bài Báo NCKH (Bản Dài)
## Đề tài: Thiết kế hệ thống truy xuất và kiểm toán chính sách an ninh đa bộ phận trong nền tảng SaaS dựa trên kiến trúc GraphRAG
### Quy mô dự kiến: 60 - 80 trang | Đồ án Tốt nghiệp xuất sắc hệ Kỹ sư PTIT

---

## 📅 PHÂN BỔ TỔNG THỂ BÁO CÁO

1. **Phần thủ tục (Bìa, Lời cam đoan, Mục lục, Danh mục chữ viết tắt, Danh mục bảng biểu):** 5 trang
2. **Mở đầu:** 5 trang
3. **Chương 1: Tổng quan bảo mật SaaS đa khách thuê và Thực trạng kiểm toán chính sách:** 15 trang
4. **Chương 2: Kiến trúc hệ thống và Giải pháp kỹ thuật GraphRAG Security Copilot:** 20 trang
5. **Chương 3: Thực nghiệm, Đo lường hiệu năng và Đánh giá thực tế:** 15 trang
6. **Kết luận và Hướng phát triển:** 5 trang
7. **Tài liệu tham khảo & Phụ lục kiểm chứng:** 10+ trang

---

## 🏛️ CHI TIẾT TỪNG CHƯƠNG LUẬN VĂN

### PHẦN MỞ ĐẦU (5 Trang)
*Trả lời câu hỏi: Tại sao đề tài này cấp thiết cho môi trường doanh nghiệp cloud hiện nay?*
- **Tính cấp thiết:** Rủi ro rò rỉ dữ liệu chéo (Cross-tenant leak) ở các SaaS truyền thống và khó khăn của các Information Security Officer (ISO) khi giám sát kiểm toán tuân thủ chính sách bảo mật quy mô lớn.
- **Mục tiêu:** Xây dựng hệ thống RAG kiểm toán chính sách an ninh doanh nghiệp với độ trung thực tuyệt đối (Zero Hallucination), hỗ trợ phòng thủ chủ động (Active Defense).
- **Đối tượng & Phạm vi:** Chính sách bảo mật đa bộ phận (Nhân sự & Pháp lý, An toàn thông tin ISO 27001, Kiểm toán Tài chính, Quy chế Ban Điều hành).
- **Phương pháp nghiên cứu:** Thực nghiệm đo lường latency, threat simulation kiểm chứng RLS, thống kê độ tin cậy trích dẫn nguồn.

### CHƯƠNG 1: CƠ SỞ LÝ THUYẾT VÀ THỰC TRẠNG (15 Trang)
*Trả lời câu hỏi: Thế giới và Việt Nam đang giải quyết bài toán này như thế nào?*
- **1.1. Công nghệ RAG và Mô hình ngôn ngữ lớn (LLM):** Lý thuyết về Embedding, Vector Database, hạn chế bịa đặt thông tin (Hallucination) của LLM thương mại hộp đen.
- **1.2. GraphRAG và Đồ thị tri thức (Knowledge Graph):** Tại sao quan hệ giữa các điều khoản chính sách (Ví dụ: quy định kiểm soát truy cập dẫn chiếu đến điều khoản xử phạt nhân sự) lại quan trọng hơn tìm kiếm từ khóa đơn thuần.
- **1.3. Khung tiêu chuẩn bảo mật đám mây ISO/IEC 27017:** Phân tích các điều khoản kiểm soát bảo mật thông tin nội bộ.
- **1.4. Thực trạng các công cụ kiểm toán chính sách:** Sự thiếu hụt của các giải pháp tra cứu chính sách an ninh tự động trong doanh nghiệp và lý do tại sao các chatbot AI thông thường không có khả năng dẫn chiếu nguồn chuẩn xác.

### CHƯƠNG 2: KIẾN TRÚC HỆ THỐNG VÀ GIẢI PHÁP KỸ THUẬT (20 Trang)
*Mô tả chi tiết giải pháp kỹ thuật đề xuất (Chương cốt lõi nhất để lấy điểm tối đa)*
- **2.1. Quy trình xử lý và Cắt đoạn tài liệu chính sách (Policy Chunking):** Cách chuẩn hóa dữ liệu chính sách PDF thô sang không gian Vector.
- **2.2. Xây dựng Đồ thị tri thức an ninh (Security Knowledge Graph):** Thiết kế các Node (Chính sách, Điều khoản, Vai trò áp dụng) và Cạnh (Quan hệ dẫn chiếu, quan hệ xử phạt, quan hệ loại trừ).
- **2.3. Thuật toán Hybrid Retrieval & Phân tầng nguồn:** Công thức xếp hạng lai Dense (Vector) + Sparse (BM25/FTS) kết hợp ưu tiên tuyệt đối văn bản chính thức so với văn bản hướng dẫn diễn giải.
- **2.4. Hạ tầng Công nghệ hệ thống:**
  - Lớp Dữ liệu: Supabase PostgreSQL (pgvector, Full-Text Search).
  - Lớp Edge Stream: Deno Edge Runtime (`ReadableStream` & SSE) giúp tối ưu hóa thời gian phản hồi, vượt qua giới hạn timeout serverless.
  - Lớp AI Gateway: Bộ phân loại intent (Router) và tác tử mở rộng câu hỏi dựa trên lịch sử đàm thoại dùng Gemini.
- **2.5. Phòng thủ chủ động (Active Defense SOAR) & Bất biến:**
  - Tích hợp động cơ SOAR tự động khóa tài khoản/tenant khi phát hiện xâm nhập và gửi thông báo đỏ về Telegram Bot của Admin qua `net.http_post`.
  - Triển khai tệp lưu trữ bất biến WORM (Write Once Read Many) bảo vệ nhật ký kiểm toán chống chối bỏ.

### CHƯƠNG 3: THỰC NGHIỆM VÀ ĐÁNH GIÁ (15 Trang)
*Trình bày các số liệu thực tế đo đạc được trên hệ thống chạy thực*
- **3.1. Giới thiệu bộ dữ liệu kiểm thử SecurityQA:** Quy trình biên soạn bộ câu hỏi tuân thủ bảo mật từ chuyên gia an ninh hệ thống.
- **3.2. Kết quả định lượng (Metrics):** Cải thiện vượt trội các chỉ số Faithfulness, Answer Relevancy, Citation Accuracy của GraphRAG Security Copilot so với RAG thông thường.
- **3.3. Thực nghiệm tối ưu hóa RLS PostgreSQL ($O(1)$ vs $O(N)$):** Bảng số liệu, biểu đồ đường cong chứng minh hiệu quả giảm độ trễ tuyệt đối của Custom Claims JWT so với JOIN truyền thống trên dataset scaling từ 1,000 đến 100,000 bản ghi dữ liệu seed thực tế.
- **3.4. Thực nghiệm mô phỏng tấn công chéo (Threat Simulation):** Bằng chứng ảnh chụp chứng minh RLS tầng cơ sở dữ liệu ngăn chặn 100% tấn công Cross-tenant read/write.

### KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN (5 Trang)
- Tổng kết các đóng góp học thuật và thực tiễn của đề án an toàn thông tin multi-tenant.
- Hướng phát triển: Tích hợp AWS S3 Object Lock làm WORM vault thực tế, tự động quét lỗ hổng mã nguồn bằng AI Agent.

---

## ✍️ PHƯƠNG PHÁP TĂNG ĐỘ DÀY VÀ ĐỘ CHUYÊN SÂU CHO LUẬN VĂN

1. **Sơ đồ kiến trúc chuẩn học thuật:** Vẽ các sơ đồ luồng dữ liệu Zero Trust, sơ đồ phân cấp Defense-in-depth, và sơ đồ mô hình dữ liệu (ERD) chi tiết.
2. **Postgres Query Execution Plans (EXPLAIN ANALYZE):** Trích xuất mã văn bản cây truy vấn của PostgreSQL trước và sau khi tối ưu hóa RLS để đưa vào phụ lục luận văn.
3. **Bảng ánh xạ tuân thủ ISO 27017:** Trình bày chi tiết bảng đối chiếu từng điều khoản kiểm soát bảo mật an ninh đám mây với bằng chứng mã nguồn đã triển khai trong đồ án.

---
*Cấu trúc đề cương luận văn tốt nghiệp xuất sắc — PTIT 2026*
