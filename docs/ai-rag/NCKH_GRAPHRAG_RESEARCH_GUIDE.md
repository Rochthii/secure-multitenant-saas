# HƯỚNG DẪN VIẾT BÀI NGHIÊN CỨU KHOA HỌC
## Đề tài: Ứng dụng GraphRAG và Đồ thị Tri thức trong Truy xuất Thông tin Phật học Đa hệ phái
### Chuẩn IEEE/ACM — Hợp tác 2 tác giả — Viết bằng Tiếng Việt

---

> **Phân công tác giả:**
>
> - 👨‍💻 **Tác giả Kỹ thuật (KT):** Phụ trách kiến trúc hệ thống, cài đặt thuật toán, thực nghiệm đánh giá
> - 🧘 **Tác giả Phật học (PH):** Phụ trách nội dung kinh điển, phân loại hệ phái, kiểm thử chất lượng học thuật
> - ✍️ **Cả hai (KT + PH):** Cùng viết, cùng chịu trách nhiệm về đoạn đó

---

## I. ĐỀ XUẤT TIÊU ĐỀ

**Tiêu đề chính:**
> Ứng dụng Đồ thị Tri thức và Mô hình RAG Lai trong Truy xuất Thông tin Phật học Đa hệ phái: Kiến trúc GraphRAG-Dharma

**Tiêu đề tiếng Anh** *(dùng khi nộp hội nghị quốc tế)*:
> Multi-School Buddhist Knowledge Retrieval via Graph-Augmented RAG: The GraphRAG-Dharma Architecture

**Từ khóa:** Truy xuất thông tin, RAG, Đồ thị tri thức, Phật học, Đa ngôn ngữ, Phân tầng nguồn

---

## II. SƠ ĐỒ TỔNG THỂ BÀI VIẾT

Mỗi chương trả lời đúng một câu hỏi lớn. Nếu không trả lời được câu hỏi đó thì chương đó chưa hoàn chỉnh.

```
[Tóm tắt]     → Người đọc cần biết gì trong 30 giây để quyết định đọc tiếp?
      ↓
[Chương 1]    → Vấn đề này có thực sự quan trọng không?
               Chúng tôi muốn chứng minh điều gì?
      ↓
[Chương 2]    → Đã có ai làm gì chưa?
               Bài báo này khác và mới ở điểm nào?
      ↓
[Chương 3]    → Hệ thống được xây dựng như thế nào?
               Người khác có thể tái tạo lại không?
      ↓
[Chương 4]    → Thực nghiệm được tiến hành theo điều kiện nào?
               Có đảm bảo tính công bằng và khoa học không?
      ↓
[Chương 5]    → Kết quả cụ thể là gì?
               Tại sao phương pháp đề xuất tốt hơn?
      ↓
[Chương 6]    → Bài học lớn nhất là gì?
               Tương lai của hướng nghiên cứu này là đâu?
```

---

## III. TÓM TẮT (Abstract)

### Mục đích
Giúp người đọc quyết định trong 30 giây có nên đọc toàn bộ bài không.

### Ai viết
✍️ KT + PH cùng đồng thuận từng câu — **Viết sau cùng** khi đã có kết quả thực nghiệm.

### Cấu trúc bắt buộc (~250 từ, 4 đoạn)

| Đoạn | Nội dung cần có | Câu hỏi phải trả lời |
|------|----------------|----------------------|
| **Bối cảnh** | Kho tàng kinh điển Phật giáo Việt Nam đa dạng, phức tạp | Vấn đề này tồn tại từ bao giờ? Nó quan trọng với ai? |
| **Khoảng trống** | Công cụ AI hiện tại không hiểu ngữ nghĩa Phật học | Các giải pháp cũ thiếu sót gì? |
| **Phương pháp** | GraphRAG-Dharma với đồ thị tri thức và phân tầng nguồn | Chúng tôi đề xuất gì? Điểm mới là gì? |
| **Kết quả** | Số liệu cụ thể (X% cải thiện Faithfulness so với baseline) | Kết quả đạt được gì? Có ý nghĩa không? |

### Ví dụ mở đầu đoạn Bối cảnh
> *"Phật giáo Việt Nam là tổng hòa của nhiều hệ phái lớn, từ Theravada Nam Tông, Đại Thừa Bắc Tông, Thiền Tông đến Phật giáo Khmer. Mỗi hệ phái lưu giữ một kho tàng kinh điển riêng biệt với hệ thống thuật ngữ, ngôn ngữ và truyền thừa khác nhau. Việc xây dựng một hệ thống trí tuệ nhân tạo có khả năng truy xuất thông tin chính xác, có trích dẫn nguồn học thuật trên toàn bộ kho tư liệu này là bài toán chưa có lời giải thỏa đáng..."*

> [!CAUTION]
> **Không viết Tóm tắt trước khi có số liệu thực nghiệm.** Viết placeholder trước, điền số liệu sau.

---

## IV. CHƯƠNG 1 — GIỚI THIỆU

### Câu hỏi chương này phải trả lời
> 1. Vấn đề là gì và tại sao nó quan trọng với cả giới khoa học lẫn cộng đồng Nhân sự?
> 2. Các giải pháp hiện tại đang thiếu sót gì cụ thể?
> 3. Bài báo này khẳng định điều gì? Đóng góp mới là gì?

### Ai viết
🧘 PH dẫn dắt phần 1.1 về bối cảnh Phật giáo — 👨‍💻 KT viết phần 1.2 về kỹ thuật

### Độ dài
800–1.000 từ

---

### 1.1 Bối cảnh và Động lực nghiên cứu *(PH viết — KT bổ sung số liệu)*

Trình bày 3 ý theo thứ tự:

**Ý 1 — Sự đa dạng và phong phú của kho tàng kinh điển Phật giáo Việt Nam**

Nêu rõ: Phật giáo Việt Nam không phải một hệ phái đồng nhất. Bao gồm:
- **Theravada Nam Tông:** Hệ thống Tam Tạng Pali (Tipitaka), phổ biến ở cộng đồng Khmer và miền Nam
- **Đại Thừa Bắc Tông:** Các bộ kinh Hán-Việt, Bát Nhã, Hoa Nghiêm, Pháp Hoa
- **Thiền Tông:** Ngữ lục thiền sư, Công án, Thoại Đầu
- **Mật Tông (Tạng Truyền):** Đang được tiếp nhận tại Việt Nam qua dịch thuật
- **Phật giáo Hòa Hảo, Bửu Sơn Kỳ Hương:** Hệ phái bản địa đặc thù Việt Nam

**Ý 2 — Hạn chế của công cụ tra cứu hiện tại**

Liệt kê cụ thể:
- Tìm kiếm từ khóa: không hiểu ngữ nghĩa, sai thuật ngữ Pali/Hán-Việt
- ChatGPT/Gemini: hay "bịa" kinh điển không tồn tại (Hallucination), không trích dẫn được nguồn
- Các website Phật học (thuvienhoasen.org, budsas.org): chỉ tìm kiếm đơn giản, không hiểu câu hỏi tự nhiên
- Không có hệ thống nào phân biệt được kinh gốc (Primary) với chú giải (Commentary)

**Ý 3 — Nhu cầu thực tiễn**

Ai đang cần giải pháp này:
- Tăng ni sinh các Học viện Phật giáo nghiên cứu giáo lý
- Nhân sự tự học cần tra cứu kinh điển
- Nhà nghiên cứu cần trích dẫn nguồn học thuật chuẩn xác

---

### 1.2 Hạn chế của các giải pháp hiện tại *(KT viết)*

Viết ngắn, mỗi hạn chế một đoạn:

| Giải pháp | Hạn chế cụ thể |
|-----------|----------------|
| Keyword Search (Google, trang web Phật học) | Không hiểu câu hỏi tự nhiên, không phân biệt hệ phái |
| Chatbot tổng quát (ChatGPT, Gemini) | Hallucination — bịa kinh điển, không có nguồn trích dẫn |
| RAG thông thường | Không phân biệt được tầm quan trọng của nguồn (kinh gốc vs chú giải) |
| Không có hệ thống nào | Kết nối quan hệ ngữ nghĩa giữa kinh văn theo đồ thị |

---

### 1.3 Câu hỏi nghiên cứu *(KT đề xuất, PH phê duyệt)*

Đây là "hợp đồng" với người đọc. Toàn bộ thực nghiệm phải trả lời đúng 3 câu hỏi này:

> **CĐ1:** Kiến trúc GraphRAG kết hợp đồ thị tri thức có cải thiện độ trung thực (Faithfulness) của câu trả lời về giáo lý Phật học so với RAG truyền thống không, và ở mức độ nào?

> **CĐ2:** Hệ thống phân tầng nguồn học thuật theo hệ phái (Theravada/Đại Thừa/Thiền Tông) ảnh hưởng thế nào đến độ chính xác của trích dẫn và khả năng phân biệt nguồn tin?

> **CĐ3:** Tìm kiếm lai (Dense + Sparse) mang lại lợi thế gì so với từng phương pháp đơn lẻ khi xử lý ngữ liệu Phật học đa ngôn ngữ (Việt–Pali–Hán–Khmer)?

---

### 1.4 Đóng góp của bài báo *(KT + PH thống nhất cùng liệt kê)*

Mỗi dòng = một đóng góp cụ thể, có thể kiểm chứng được:

- **[C1 — Kỹ thuật]** Đề xuất kiến trúc GraphRAG-Dharma với đồ thị tri thức 3 tầng (Kinh gốc / Chú giải / Tài liệu học thuật) đầu tiên cho ngữ liệu Phật giáo đa hệ phái tại Việt Nam
- **[C2 — Dữ liệu]** Xây dựng bộ dữ liệu kiểm thử BuddhaQA gồm N câu hỏi–trả lời được kiểm chứng bởi chuyên gia học viện Phật giáo, bao phủ đầy đủ các hệ phái chính
- **[C3 — Thuật toán]** Đề xuất hàm xếp hạng lai kết hợp Dense Search, Sparse Search và duyệt đồ thị theo trọng số tầng nguồn
- **[C4 — Hệ thống thực]** Triển khai và đánh giá thực tế hệ thống tại dharmachat.vercel.app với người dùng thực

---

### 1.5 Cấu trúc bài báo *(KT viết — 3–4 câu)*

> *"Phần còn lại của bài báo được tổ chức như sau: Phần 2 khảo sát các nghiên cứu liên quan về RAG, GraphRAG và xử lý ngôn ngữ Phật học. Phần 3 trình bày kiến trúc GraphRAG-Dharma được đề xuất. Phần 4 mô tả thiết lập thực nghiệm. Phần 5 phân tích và thảo luận kết quả. Phần 6 kết luận và đề xuất hướng nghiên cứu tiếp theo."*

---

## V. CHƯƠNG 2 — TỔNG QUAN NGHIÊN CỨU LIÊN QUAN

### Câu hỏi chương này phải trả lời
> 1. Nghiên cứu này đứng ở đâu trong bức tranh khoa học toàn cầu?
> 2. Tại sao không dùng các giải pháp đã có mà phải đề xuất mới?

### Ai viết
👨‍💻 KT viết mục 2.1–2.3 — 🧘 PH viết mục 2.4

> [!WARNING]
> **Yêu cầu tối thiểu: 15–20 tài liệu tham khảo, từ năm 2020 trở lại.** Đây là phần hội đồng phản biện kiểm tra đầu tiên.

### Độ dài
600–800 từ

---

### 2.1 Retrieval-Augmented Generation (RAG) *(KT)*

Trình bày ngắn gọn các bài báo nền tảng, không copy abstract — chỉ nêu điểm cốt lõi và hạn chế:

- **Lewis và cộng sự (2020)** — Định nghĩa RAG gốc: kết hợp truy xuất văn bản với sinh văn bản. Hạn chế: không có cơ chế phân cấp nguồn
- **Karpukhin và cộng sự (2020)** — Dense Passage Retrieval: tìm kiếm ngữ nghĩa bằng embedding. Hạn chế: bỏ qua từ khóa chính xác
- **Shi và cộng sự (2023)** — REPLUG: RAG cho mô hình ngôn ngữ lớn hộp đen
- **Asai và cộng sự (2024)** — Self-RAG: mô hình tự quyết định có cần truy xuất không

*→ Kết luận đoạn: Các hệ thống RAG hiện tại không xử lý được quan hệ ngữ nghĩa phức tạp giữa các tài liệu chuyên ngành, đặc biệt là kinh điển Phật học có cấu trúc phân cấp chú giải.*

---

### 2.2 GraphRAG và Đồ thị Tri thức *(KT)*

- **Edge và cộng sự (2024, Microsoft)** — GraphRAG gốc: xây đồ thị cộng đồng để tóm tắt tài liệu dài. Hạn chế: chỉ phục vụ tóm tắt, không phân tầng nguồn
- **Sanmartin (2024)** — KG-RAG: kết hợp Knowledge Graph với RAG. Hạn chế: chưa áp dụng cho domain tôn giáo
- **Gutierrez và cộng sự (2024)** — HippoRAG: lấy cảm hứng từ bộ nhớ dài hạn của não người
- **Hu và cộng sự (2024)** — GRAG: Graph Retrieval-Augmented Generation

*→ Kết luận đoạn: Chưa có nghiên cứu nào kết hợp GraphRAG với phân tầng nguồn học thuật theo hệ phái cho kinh điển Phật giáo.*

---

### 2.3 Xử lý ngôn ngữ tự nhiên cho văn bản tôn giáo và ngôn ngữ thấp tài nguyên *(KT + PH)*

- Nghiên cứu NLP cho tiếng Pali, Hán cổ, tiếng Khmer
- Thách thức: từ vựng chuyên ngành, đa ngôn ngữ trong một đoạn văn
- Hướng giải quyết đã được thử: từ điển Pali kỹ thuật số, SuttaCentral dataset

---

### 2.4 Thực trạng tra cứu và số hóa tài liệu Phật giáo Việt Nam *(PH viết — đây là phần độc quyền của PH)*

Đây là phần **chỉ chuyên gia Phật học mới có thể viết**, không thể thay thế bằng tìm kiếm Google:

- Các dự án số hóa hiện có: thuvienhoasen.org, budsas.org, SuttaCentral phần Việt ngữ
- Thực trạng tra cứu tại các Học viện Phật giáo: công cụ nào đang được dùng, hạn chế ra sao
- Các hệ phái lớn tại Việt Nam và kho tàng tài liệu đặc thù của mỗi hệ phái
- Nhu cầu chưa được đáp ứng: tra cứu liên hệ phái, phân biệt nguồn chú giải

---

### 2.5 Bảng tổng hợp so sánh *(KT tạo bảng)*

| Hệ thống | Đa hệ phái | Đồ thị | Phân tầng nguồn | Tiếng Việt | Năm |
|----------|-----------|--------|-----------------|------------|-----|
| Google tìm kiếm | Có | Không | Không | Có | — |
| ChatGPT/Gemini | Có | Không | Không | Có | 2023 |
| thuvienhoasen.org | Bắc Tông | Không | Không | Có | 2010 |
| SuttaCentral | Theravada | Không | Một phần | Một phần | 2019 |
| Microsoft GraphRAG | Tổng quát | Có | Không | Không | 2024 |
| **GraphRAG-Dharma (đề xuất)** | **Đa hệ phái** | **Có** | **Có** | **Có** | **2025** |

---

## VI. CHƯƠNG 3 — PHƯƠNG PHÁP ĐỀ XUẤT

### Câu hỏi chương này phải trả lời
> 1. Hệ thống hoạt động như thế nào từ đầu đến cuối?
> 2. Người đọc khác có thể tái tạo lại kết quả không?
> 3. Điểm khác biệt so với hệ thống RAG thông thường là gì?

### Ai viết
👨‍💻 KT viết toàn bộ phần kỹ thuật — 🧘 PH kiểm tra tính chính xác về nội dung giáo lý

### Độ dài
1.500–2.000 từ + sơ đồ + công thức + bảng

> [!IMPORTANT]
> **Đây là chương quan trọng nhất.** Hội đồng phản biện đọc chương này kỹ nhất để xem có tái tạo được không.

---

### 3.1 Tổng quan kiến trúc *(KT — phải có sơ đồ)*

Mô tả luồng xử lý từ đầu vào đến đầu ra:

```
Câu hỏi người dùng
        │
        ▼
[Mã hóa câu hỏi]  ←── Mô hình nhúng đa ngôn ngữ (text-embedding-004)
        │
        ▼
[Tìm kiếm Lai]  ←── Kết hợp Dense (cosine similarity) + Sparse (BM25/FTS)
        │
        ▼
[Duyệt Đồ thị]  ←── Mở rộng kết quả qua quan hệ kinh văn trong Knowledge Graph
        │
        ▼
[Xếp hạng theo Tầng nguồn]  ←── Ưu tiên Kinh gốc > Chú giải > Tài liệu học thuật
        │
        ▼
[Sinh câu trả lời]  ←── LLM (Gemini) với ngữ cảnh đã xếp hạng
        │
        ▼
Câu trả lời + Thẻ trích dẫn nguồn (Tên kinh, Chương, Hệ phái, Cấp độ nguồn)
```

---

### 3.2 Xây dựng Đồ thị Tri thức Phật học *(KT + PH phối hợp — phần cốt lõi)*

**Thiết kế nút (Nodes):**

| Loại nút | Mô tả | Ví dụ |
|----------|-------|-------|
| VanBan | Một đoạn kinh điển cụ thể | Kinh Từ Bi, Tâm Kinh Bát Nhã |
| KhaiNiem | Thuật ngữ Phật học | Vô thường, Hồi hướng, Bồ đề tâm |
| ChuDe | Chủ đề giáo lý lớn | Tứ Diệu Đế, Bát Nhã Ba La Mật |
| HePhaiXuatXu | Hệ phái xuất xứ của văn bản | Theravada, Đại Thừa, Thiền Tông |
| TaiLieuChuGiai | Một bản chú giải cụ thể | Thanh Tịnh Đạo, Đại Trí Độ Luận |

**Thiết kế cạnh (Edges):**

| Quan hệ | Ý nghĩa | Ví dụ |
|---------|---------|-------|
| laChuGiaiCua | Tài liệu này giải thích văn bản nào | Thanh Tịnh Đạo → Kinh Pháp Cú |
| chứaKhaiNiem | Văn bản này giải thích khái niệm nào | Tâm Kinh → Tánh Không |
| moRong | Văn bản này mở rộng chủ đề nào | Kinh Hoa Nghiêm → Bồ đề tâm |
| tuongTuVe | Hai hệ phái có điểm tương đồng | Thiền Tông ↔ Theravada về Thiền định |
| canHieuTruoc | Cần hiểu A trước khi hiểu B | Vô thường → Vô ngã → Niết bàn |

> **Phân công thực tế:** PH vẽ sơ đồ quan hệ trên giấy theo hiểu biết giáo lý. KT implement vào cơ sở dữ liệu PostgreSQL dưới dạng bảng `knowledge_graph_edges`.

---

### 3.3 Hệ thống Phân tầng Nguồn *(PH định nghĩa nguyên tắc — KT implement)*

Đây là điểm mới quan trọng nhất của bài báo. Không có hệ thống AI nào hiện tại có tính năng này:

```
TẦNG 1 — NGUỒN GỐC (Kinh điển chính thống)
  Theravada : Tam Tạng Pali — Vinaya, Sutta, Abhidhamma Pitaka
  Đại Thừa  : Bát Nhã, Pháp Hoa, Hoa Nghiêm, Duy Thức...
  Thiền Tông : Ngữ lục Lục Tổ Huệ Năng, các Thiền sư lớn
  Quy tắc   : Câu trả lời phải dựa trên tầng này trước tiên
  Trọng số  : 1.00

TẦNG 2 — CHÚ GIẢI (Luận giải kinh điển)
  Theravada : Thanh Tịnh Đạo Luận (Buddhaghosa), Atthakatha
  Đại Thừa  : Đại Trí Độ Luận, Thành Duy Thức Luận
  Thiền Tông : Bích Nham Lục, Vô Môn Quan
  Quy tắc   : Dùng để làm rõ ý nghĩa của Tầng 1
  Trọng số  : 0.80

TẦNG 3 — TÀI LIỆU HỌC THUẬT (Nghiên cứu đương đại)
  Bao gồm  : Sách Phật học hiện đại, luận văn, bài giảng
  Quy tắc  : Chỉ dùng khi Tầng 1 và Tầng 2 chưa đủ
             Phải ghi rõ "Đây là diễn giải đương đại"
  Trọng số : 0.60
```

---

### 3.4 Thuật toán Xếp hạng Lai *(KT — phần toán học)*

Điểm tổng hợp cuối cùng cho mỗi đoạn văn bản `d` với câu hỏi `q`:

```
Điểm(d, q) = α × Dense(d, q) + β × Sparse(d, q) + γ × ĐồThị(d, q) + δ × Tầng(d)
```

Trong đó:
- `Dense(d, q)` = cosine_similarity(nhúng(d), nhúng(q)) — Tìm kiếm theo nghĩa
- `Sparse(d, q)` = BM25(d, q) — Tìm kiếm từ khóa chính xác (thuật ngữ Pali, Hán-Việt)
- `ĐồThị(d, q)` = độ gần trong Knowledge Graph so với các thực thể trong câu hỏi
- `Tầng(d)` = {1,00 nếu Kinh gốc; 0,80 nếu Chú giải; 0,60 nếu Tài liệu học thuật}
- α, β, γ, δ: siêu tham số được tối ưu trên tập kiểm định (báo cáo giá trị tối ưu trong Chương 5)

---

### 3.5 Kho dữ liệu và Tiền xử lý *(KT + PH)*

**Bảng thống kê kho dữ liệu (bắt buộc):**

| Hệ phái | Tầng nguồn | Số tài liệu | Số đoạn văn | Ngôn ngữ chính |
|---------|-----------|------------|------------|----------------|
| Theravada | Kinh gốc (Pali) | N₁ | C₁ | Pali / Việt / Khmer |
| Theravada | Chú giải | N₂ | C₂ | Việt / Khmer |
| Đại Thừa | Kinh gốc | N₃ | C₃ | Hán-Việt / Việt |
| Đại Thừa | Luận | N₄ | C₄ | Hán-Việt / Việt |
| Thiền Tông | Ngữ lục | N₅ | C₅ | Hán-Việt / Việt |
| Học thuật | Tham khảo | N₆ | C₆ | Việt |
| **Tổng** | | **N** | **C** | **4 ngôn ngữ** |

**Quy trình xử lý dữ liệu:**

1. **Thu thập** — Tải PDF, tệp văn bản từ các nguồn uy tín *(PH xác nhận nguồn)*
2. **Phân loại** — Gán nhãn tầng nguồn và hệ phái cho từng tài liệu *(PH thực hiện)*
3. **Cắt đoạn** — Chia theo ranh giới kinh văn, mỗi đoạn 300–500 từ *(KT thực hiện)*
4. **Gán metadata** — Tên kinh, chương, hệ phái, tác giả, năm *(PH kiểm tra)*
5. **Nhúng vector** — Dùng text-embedding-004 đa ngôn ngữ *(KT)*
6. **Xây đồ thị** — Liên kết các đoạn văn theo quan hệ giáo lý *(PH + KT)*

---

### 3.6 Đặc tả Tính năng Hệ thống Dharma Chat RAG (Đã triển khai thực tế) *(KT)*

Để đáp ứng mức độ tải cao của môi trường đa khách thuê (Multi-tenant) và đảm bảo tính học thuật chống lại Hallucination, hệ thống đã loại bỏ các nền tảng trung gian (như Vercel AI SDK) để triển khai luồng xử lý thuần cấp thấp (Native Low-level) với các tính năng kỹ thuật nâng cao sau:

1. **Bộ não mồi đa tác tử (Router & Expander Agents):**
   - **Dynamic Router Agent:** Hệ thống sử dụng một mô hình ngôn ngữ siêu tốc (`Gemini Flash Lite`) chặn ở cửa ngõ để phân tích Zero-shot ý định của câu hỏi. Căn cứ vào đó, hệ thống gán nhãn hệ phái (Theravada, Đại Thừa, Khất Sĩ...) và kích hoạt System Prompt giả lập (Persona) của một nhà sư thuộc truyền thống tương ứng.
   - **Hybrid Query Expansion:** Áp dụng thuật toán Heuristics (đọc các từ khóa như *"thế còn cái đó"*, *"giải thích thêm"*) để gọi AI nối và mở rộng câu hỏi dựa vào lịch sử chat trước khi đưa vào không gian Vector, ngăn chặn lệch ngữ cảnh.

2. **Luồng sinh văn bản tối ưu cấp thấp (Native Edge Streaming & Failover):**
   - Thay vì sử dụng thư viện cồng kềnh, hệ thống sử dụng **thuần Deno Edge Function** (`ReadableStream`) kết hợp kiến trúc Server-Sent Events (SSE). Cách tiếp cận này giúp thoát khỏi giới hạn thời gian chờ (timeout) của nền tảng serverless, ép phản hồi trả về qua từng luồng byte theo thời gian thực.
   - Cơ chế **Multi-key Failover**: Tự động nhận diện lỗi HTTP 429 (Quá tải) để xoay vòng (round-robin) các khóa API Gemini dự phòng, đảm bảo tính sẵn sàng (Availability) 99.9%.

3. **Semantic Caching & Khả năng "Tự chữa lành" (Self-Healing Cache):**
   - Mọi câu trả lời được mã hóa (SHA-256) và đưa vào phân rã Vector. Khi có câu hỏi trùng lặp độ tương đồng nhúng (Cosine Similarity) > 97%, Edge Function sẽ chặt đứt vòng lặp LLM và bóp cò lấy dữ liệu thẳng từ PostgreSQL RPC.
   - Cơ chế rà soát dữ liệu rác: Tự động loại bỏ và quét (purge) các cache bị hỏng cấu trúc ký tự (ví dụ: tràn ký tự tiếng Trung do lỗi mô hình) giúp làm sạch dần bộ nhớ chung.

4. **Quản lý Định danh và Phân quyền chéo (JWT + Cấu trúc RLS):**
   - Quản lý phiên đàm đạo `chat_sessions` và tỷ lệ truy cập (IP/User Rate-limiting) hoàn toàn thông qua JWT. Row Level Security chia tách cô lập lịch sử để đảm bảo riêng tư dữ liệu người dùng tuyệt đối. Giao diện được kiểm thử với `react-markdown` kết xuất biểu thức toán học (Pali/Sanskrit).
   - Hệ thống đánh giá học thuật Vòng lặp người (Human-in-the-loop): Tích hợp luồng phản hồi ẩn danh (Upvote/Downvote/Góp ý), dữ liệu đổ vào bảng `ai_low_quality_logs` chuyển giao cho các chuyên gia Phật học xử lý và đánh giá.

---

## VII. CHƯƠNG 4 — THIẾT LẬP THỰC NGHIỆM

### Câu hỏi chương này phải trả lời
> Thực nghiệm được tiến hành như thế nào để đảm bảo tính công bằng và có thể kiểm chứng lại?

### Ai viết
👨‍💻 KT viết phần cài đặt kỹ thuật — 🧘 PH chủ trì xây dựng bộ câu hỏi BuddhaQA

### Độ dài
400–600 từ

---

### 4.1 Bộ câu hỏi kiểm thử BuddhaQA *(PH chủ trì — đóng góp không thể thay thế)*

> [!IMPORTANT]
> **Đây là đóng góp quan trọng nhất của tác giả Phật học.** Không có bộ câu hỏi này, không có thực nghiệm khoa học.

**Tiêu chí câu hỏi:**
- Bao phủ tất cả hệ phái chính: Theravada, Đại Thừa, Thiền Tông
- Có câu trả lời "vàng" do chuyên gia xác nhận kèm trích dẫn nguồn cụ thể
- Đủ 3 cấp độ độ khó

**Phân loại câu hỏi:**

| Cấp độ | Mô tả | Tỉ lệ | Ví dụ |
|--------|-------|-------|-------|
| **L1 — Sự kiện** | Tra cứu thông tin cụ thể | 35% | *"Kinh Từ Bi thuộc bộ kinh gì? Được tụng trong dịp nào?"* |
| **L2 — Suy luận** | Hiểu nguyên lý giáo lý | 40% | *"Vô thường trong Theravada khác với Vô thường trong Đại Thừa như thế nào?"* |
| **L3 — Tổng hợp liên hệ phái** | Kết nối nhiều nguồn, nhiều hệ phái | 25% | *"Khái niệm Tánh Không trong Tâm Kinh Bát Nhã liên hệ thế nào với Niết bàn trong Theravada?"* |

**Quy trình đảm bảo chất lượng:**
1. PH thứ nhất viết câu hỏi và câu trả lời vàng
2. PH thứ hai (từ học viện) đánh giá độc lập (*inter-annotator agreement cần ≥ 0,80*)
3. Giải quyết bất đồng qua thảo luận
4. KT chuyển sang định dạng JSON chuẩn cho hệ thống đánh giá RAGAS

---

### 4.2 Các hệ thống so sánh (Baselines) *(KT)*

| Hệ thống | Mô tả | Lý do chọn để so sánh |
|---------|-------|----------------------|
| BM25 | Tìm kiếm từ khóa thuần túy | Đường cơ sở cổ điển |
| RAG Dense | Chỉ tìm kiếm bằng vector, không đồ thị | Kiểm tra đóng góp của đồ thị |
| RAG Chuẩn | RAG thông thường, không phân tầng | Kiểm tra đóng góp của phân tầng |
| Gemini Pro (không RAG) | LLM thương mại không có truy xuất | Mức độ Hallucination của LLM thuần |
| **GraphRAG-Dharma** | **Phương pháp đề xuất** | — |

---

### 4.3 Chỉ số đánh giá *(KT — sử dụng khung RAGAS)*

| Chỉ số | Đo lường gì | Công cụ đánh giá |
|--------|------------|------------------|
| Faithfulness | AI có bịa đặt nội dung không trong ngữ cảnh? | RAGAS tự động |
| Answer Relevancy | Câu trả lời có đúng với câu hỏi không? | RAGAS tự động |
| Context Precision | Đoạn văn lấy về có thực sự liên quan không? | RAGAS tự động |
| Context Recall | Có bỏ sót thông tin quan trọng không? | RAGAS tự động |
| Citation Accuracy | Trích dẫn tên kinh, hệ phái có đúng không? | PH đánh giá thủ công |

---

### 4.4 Hạ tầng kỹ thuật thực tế (Tech Stack) *(KT)*

Hệ thống được thiết kế dưới dạng nền tảng phục vụ thực tế (Production-ready), đảm bảo hiệu năng độ trễ thấp và tính mở rộng đa người dùng:

```text
1. Lớp Edge Function / Serverless Streaming (Rất Tối Ưu)
   - Backbone: Native Deno Edge Stream (`ReadableStream`) kết nối Server-Sent Events (SSE). Không sử dụng Vercel AI SDK để loại bỏ độ trễ và gánh nặng node-modules.
   - AI Agent: Agent phân luồng (Router) và tác tử mở rộng ngữ nghĩa (Expander) bằng Gemini Flash-Lite.

2. Lớp Dữ liệu và Truy xuất (Vector & Document Storage)
   - CSDL Gốc: Supabase PostgreSQL 16.
   - Vector Extension: `pgvector`, sử dụng thuật toán tính khoảng cách (Cosine distance) kết hợp chỉ mục tối ưu HNSW.
   - Khớp nối văn bản (Sparse): PostgreSQL Full-Text Search (FTS) từ điển Tiếng Việt `to_tsvector('vietnamese_unaccent')`.

3. Lớp Xử lý Nhúng và Sinh Văn Bản (AI Layer)
   - Nhúng (Embeddings): Google `gemini-embedding-2-preview` (Đầu ra 1536 chiều ảnh xạ).
   - LLM: Google Gemini 1.5 Pro / Flash.

4. Lớp Giao diện & Trải nghiệm (Frontend & UI)
   - Nền tảng: Next.js (App Router), React 19, Tailwind CSS. Truy cập RPC PostgreSQL thông qua hooks tự định nghĩa không làm lộ JWT.
   - Hiển thị văn bản: `react-markdown` tích hợp `rehype-katex` để hiển thị trực tiếp đồ thị ngữ nghĩa hay cấu trúc logic Phật học.
   - Multi-tenant Platform URL: dharmachat.vercel.app
```

---

## VIII. CHƯƠNG 5 — KẾT QUẢ VÀ THẢO LUẬN

### Câu hỏi chương này phải trả lời
> 1. Ba câu hỏi nghiên cứu CĐ1, CĐ2, CĐ3 có được trả lời không?
> 2. Từng thành phần của hệ thống đóng góp bao nhiêu?
> 3. Hệ thống vẫn còn thất bại ở đâu?

### Ai viết
👨‍💻 KT tạo bảng số liệu và phân tích kỹ thuật — 🧘 PH diễn giải ý nghĩa Phật học và đánh giá Case Study

### Độ dài
1.000–1.200 từ

---

### 5.1 Kết quả tổng hợp *(KT tạo bảng)*

*(Điền sau khi có số liệu thực nghiệm)*

| Phương pháp | Faithfulness | Relevancy | Ctx Prec. | Ctx Rec. | Cit. Acc. |
|-------------|-------------|-----------|-----------|----------|-----------|
| BM25 | — | — | — | — | — |
| RAG Dense | — | — | — | — | — |
| RAG Chuẩn | — | — | — | — | — |
| Gemini Pro | — | — | — | — | — |
| **GraphRAG-Dharma** | **—** | **—** | **—** | **—** | **—** |

Sau bảng: viết 2–3 đoạn phân tích **tại sao** từng chỉ số tăng hoặc không tăng.

---

### 5.2 Phân tích Ablation — Đánh giá từng thành phần *(KT — BẮT BUỘC với IEEE)*

Mục đích: chứng minh mỗi thành phần có đóng góp thực sự, không phải trang trí.

| Biến thể | Thành phần bị bỏ | Faithfulness | Chênh lệch |
|----------|-----------------|-------------|-----------|
| Mô hình đầy đủ | — | — | — |
| Không có đồ thị | Bỏ Knowledge Graph | — | −X,XX |
| Không phân tầng nguồn | Tất cả nguồn ngang bằng | — | −X,XX |
| Không tìm kiếm thưa | Chỉ dùng Dense | — | −X,XX |
| Không tìm kiếm dày | Chỉ dùng BM25 | — | −X,XX |

*→ Thành phần nào thiếu làm giảm nhiều nhất là thành phần quan trọng nhất — nhấn mạnh trong phần thảo luận.*

---

### 5.3 Phân tích Case Study *(PH chủ trì — 3 ví dụ đại diện)*

Chọn 3 câu hỏi: 1 câu L1 (dễ), 1 câu L2 (trung bình), 1 câu L3 (khó liên hệ phái).

Với mỗi câu hỏi, trình bày:
- Câu trả lời của RAG Chuẩn
- Câu trả lời của GraphRAG-Dharma
- Phân tích của PH: câu trả lời nào chính xác hơn về giáo lý và tại sao

**Ví dụ câu L3 (khó):**
> Câu hỏi: *"Khái niệm Tánh Không trong Bát Nhã Tâm Kinh của Đại Thừa có điểm gì tương đồng và khác biệt với Vô Ngã trong Theravada?"*

> Phân tích: GPT thuần và RAG thường đưa ra câu trả lời chung chung hoặc nhầm lẫn nguồn. GraphRAG-Dharma có thể dẫn nguồn từ cả hai hệ phái, chỉ rõ sự khác biệt theo tầng chú giải.

---

### 5.4 Phân tích lỗi *(KT + PH)*

Phân loại 3 kiểu lỗi còn tồn tại:

| Kiểu lỗi | Nguyên nhân | Hướng khắc phục |
|----------|------------|-----------------|
| Trả lời thiếu khi câu hỏi liên hệ phái | Kho dữ liệu chưa đủ liên kết giữa hệ phái | Bổ sung cạnh liên hệ phái trong đồ thị |
| Nhầm thuật ngữ Hán-Việt | Mô hình nhúng chưa phân biệt đủ Hán-Việt cổ | Fine-tune mô hình nhúng |
| Trích dẫn sai chương/quyển | Metadata thiếu chính xác | PH review metadata |

---

### 5.5 Hạn chế nghiên cứu *(BẮT BUỘC — KT + PH thừa nhận trung thực)*

- Kho dữ liệu hiện tại chưa phủ toàn bộ Tam Tạng; ưu tiên các bộ kinh phổ biến nhất
- Đồ thị tri thức được xây dựng bán tự động; một số quan hệ tinh tế về giáo lý có thể bị bỏ sót
- Đánh giá Citation Accuracy phụ thuộc vào phán quyết thủ công của PH — có thể có sai lệch chủ quan
- Chi phí API LLM chưa được tối ưu cho triển khai quy mô lớn

---

## IX. CHƯƠNG 6 — KẾT LUẬN

### Câu hỏi chương này phải trả lời
> Bài học lớn nhất là gì? Ai hưởng lợi? Tương lai sẽ đi đâu?

### Ai viết
✍️ KT + PH cùng viết (~300 từ)

---

### 6.1 Tóm tắt đóng góp (2–3 câu — không nhắc lại số liệu)**

Viết lại đóng góp bằng ngôn ngữ tự nhiên, không copy từ Chương 1.

### 6.2 Ý nghĩa thực tiễn *(PH viết)*

Hệ thống này có ích với ai trong thực tế:
- Tăng ni sinh tra cứu giáo lý so sánh giữa các hệ phái
- Nhân sự tự học có nguồn trích dẫn đáng tin cậy
- Nhà nghiên cứu cần tổng hợp tài liệu đa hệ phái

### 6.3 Ý nghĩa lý thuyết *(KT viết)*

Đóng góp cho lĩnh vực NLP/AI:
- Kiến trúc GraphRAG với phân tầng nguồn học thuật có thể áp dụng cho các domain chuyên ngành khác (y học cổ truyền, pháp luật, v.v.)
- Bộ dữ liệu BuddhaQA là benchmark đầu tiên cho tra cứu Phật học đa hệ phái tiếng Việt

### 6.4 Hướng nghiên cứu tiếp theo

- Mở rộng corpus sang toàn bộ Tam Tạng Pali và kinh điển Đại Thừa chưa dịch
- Thêm giao diện giọng nói cho chư tăng cao tuổi ít quen gõ phím
- Phát triển mô hình ngôn ngữ chuyên biệt cho tiếng Pali và Hán cổ Phật học
- Nhân rộng kiến trúc sang các truyền thống Phật giáo châu Á khác (Tây Tạng, Nhật Bản)

---

## X. TÀI LIỆU THAM KHẢO

*(Định dạng IEEE — bắt buộc ≥ 20 tài liệu từ 2020 đến nay)*

```
[1]  P. Lewis và cộng sự, "Retrieval-Augmented Generation for Knowledge-Intensive
     NLP Tasks," NeurIPS, 2020.

[2]  V. Karpukhin và cộng sự, "Dense Passage Retrieval for Open-Domain Question
     Answering," EMNLP, 2020.

[3]  T. Edge và cộng sự, "From Local to Global: A Graph RAG Approach to Query-
     Focused Summarization," arXiv:2404.16130, 2024.

[4]  Y. Sanmartin, "KG-RAG: Bridging the Gap Between Knowledge and Creativity,"
     arXiv:2405.12035, 2024.

[5]  B. Gutierrez và cộng sự, "HippoRAG: Neurobiologically Inspired Long-Term
     Memory for Large Language Models," NeurIPS, 2024.

[6]  J. Shi và cộng sự, "REPLUG: Retrieval-Augmented Black-Box Language Models,"
     NAACL, 2023.

[7]  A. Asai và cộng sự, "Self-RAG: Learning to Retrieve, Generate, and Critique
     through Self-Reflection," ICLR, 2024.

[8]  SuttaCentral, "Digital Pali Canon with Translations,"
     https://suttacentral.net, 2019–2024.

     ← Cần bổ sung thêm 12–15 tài liệu từ các lĩnh vực:
        "Buddhist NLP", "Pali text processing", "Vietnamese NLP",
        "low-resource multilingual embeddings", "knowledge graph construction",
        "domain-specific RAG" →
```

---

## XI. PHỤ LỤC — CHECKLIST TRƯỚC KHI NỘP

### ✅ Kiểm tra nội dung

- `[ ]` Tóm tắt có đủ 4 phần: bối cảnh, khoảng trống, phương pháp, kết quả?
- `[ ]` Ba câu hỏi nghiên cứu (CĐ1, CĐ2, CĐ3) được trả lời rõ ràng trong Chương 5?
- `[ ]` Related Work có ≥ 15 tài liệu từ 2020 trở lại?
- `[ ]` Methodology có đủ chi tiết để tái tạo lại không?
- `[ ]` Có công thức toán học cho thuật toán đề xuất?
- `[ ]` So sánh với ít nhất 3 baselines?
- `[ ]` Có Ablation Study (bắt buộc với IEEE/ACM)?
- `[ ]` Có ít nhất 5 chỉ số đánh giá?
- `[ ]` Có phân tích lỗi (Error Analysis)?
- `[ ]` Hạn chế nghiên cứu được thừa nhận trung thực?

### ✅ Kiểm tra hình thức

- `[ ]` Tuân thủ template Word/LaTeX của hội nghị mục tiêu?
- `[ ]` Không vượt quá số trang quy định?
- `[ ]` Tất cả hình ảnh, bảng biểu có tiêu đề và được tham chiếu trong văn bản?
- `[ ]` Tài liệu tham khảo đúng định dạng IEEE?
- `[ ]` Không có lỗi chính tả (dùng Grammarly cho phần tiếng Anh)?

---

## XII. LỊCH TRÌNH VÀ PHÂN CÔNG

| Giai đoạn | Tuần | KT thực hiện | PH thực hiện |
|-----------|------|-------------|-------------|
| **Dữ liệu** | 1–3 | Thu thập, xử lý, nhúng vector corpus | Xác nhận nguồn, gán nhãn hệ phái, tầng |
| **Đồ thị** | 3–4 | Implement Knowledge Graph vào database | Vẽ sơ đồ quan hệ, kiểm tra tính đúng đắn |
| **BuddhaQA** | 2–5 | Thiết kế template JSON, tích hợp RAGAS | **Biên soạn 200 câu hỏi + câu trả lời vàng** |
| **Thực nghiệm** | 5–6 | Chạy tất cả baselines, thu số liệu | Đánh giá Citation Accuracy thủ công |
| **Viết bài** | 7–8 | Viết Chương 1.2, 3, 4, 5.1–5.2, 6.3 | Viết Chương 2.4, 5.3, 6.2; review toàn bộ |
| **Hoàn thiện** | 9–10 | Format IEEE, sửa theo phản hồi nội bộ | Final review thuật ngữ Phật học |
| **Nộp** | 10 | Submit hệ thống | Submit |

---

## XIII. ĐỀ XUẤT VENUE NỘP BÀI

| Hội nghị / Tạp chí | Cấp | Thời điểm | Ghi chú |
|--------------------|-----|-----------|---------|
| **Tạp chí Khoa học VNU-HCM** | Trong nước Q2 | Liên tục | Nộp phiên bản tiếng Việt trước |
| **RIVF 2025** | Hội nghị VN hạng A | ~tháng 8/2025 | Luyện nhận phản hồi phản biện |
| **IEEE Access** | Tạp chí quốc tế Q1 | Liên tục | Phiên bản tiếng Anh mở rộng |
| **COLING 2026** | Hội nghị quốc tế hạng A | ~tháng 9/2025 | Mục tiêu dài hạn sau RIVF |

> [!TIP]
> **Chiến lược được khuyến nghị:** Nộp bản tiếng Việt cho VNU-HCM hoặc RIVF trước để nhận phản hồi của hội đồng. Dùng phản hồi đó để hoàn thiện bài, sau đó dịch và mở rộng cho IEEE Access hoặc COLING.

---

*Tài liệu này thuộc dự án Dharma Chat — dharmachat.vercel.app*
*Phiên bản: 2.0 — Cập nhật mở rộng đa hệ phái, tiếng Việt*
*Cập nhật lần cuối: 2026-04-19*
