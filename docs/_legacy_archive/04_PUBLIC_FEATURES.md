# 04 — Public Features Specification

**Tài liệu chuẩn chức năng public (Canonical v2)**  
**Cập nhật:** 2026-03-14

---

## 1) Mục tiêu

Mô tả đầy đủ các chức năng phía public site theo route thực tế trong `app/[domain]/[locale]/**`, bao gồm behavior chính, dữ liệu nền, và luồng tích hợp action/API.

---

## 2) Cấu trúc routing public

### 2.1 Root per-tenant per-locale

- Route gốc: `/{domain}/{locale}`.
- Locale: `vi`, `km`, `en`.
- Domain được resolve qua middleware + tenant config.

### 2.2 Nhóm route nội dung chính

- Trang chủ: `/{domain}/{locale}`
- Tin tức: `/{domain}/{locale}/tin-tuc`, `/{domain}/{locale}/tin-tuc/[...slug]`
- Sự kiện/lịch lễ: `/{domain}/{locale}/lich-le`, `/{domain}/{locale}/lich-le/[slug]`
- Đăng ký sự kiện: `/{domain}/{locale}/dang-ky-su-kien/[slug]`
- Pháp thoại: `/{domain}/{locale}/documents`, `/{domain}/{locale}/documents/[...slug]`
- Phước điền: `/{domain}/{locale}/transactions` + các nhánh thanh toán/hạng mục
- Tài liệu số: `/{domain}/{locale}/tai-lieu-so`, `/{domain}/{locale}/tai-lieu-so/[slug]`, `/{domain}/{locale}/tai-lieu-so/album/[id]`
- Giới thiệu: `/{domain}/{locale}/gioi-thieu` + các route con (`su-menh`, `doi-ngu`, `noi-quy-tu-vien`, `doanh-nghiep-xa-hoi`, `[...slug]`)
- Văn hóa: `/{domain}/{locale}/van-hoa` + route con
- Tìm kiếm: `/{domain}/{locale}/tim-kiem`
- FAQ: `/{domain}/{locale}/hoi-dap`
- Liên hệ: `/{domain}/{locale}/lien-he`
- Các route mở rộng theo nội dung: `dong-hanh`, `minh-bach`, `giai-phap/**`, `chu-de/[slug]`, `kien-truc`
- Trang Tam Bảo: `/{domain}/{locale}/tam-bao` (Trang tĩnh chuyên sâu về Phật - Pháp - Tăng)

---

## 3) Trang chủ & sections động

### 3.1 Nguồn dữ liệu section

- `/api/sections/news-events` → trả news + events cho section lazy-load.
- `/api/sections/categories` → danh mục tin.
- `/api/sections/about` → about sections.

### 3.2 Đặc điểm cache

- API section phản hồi `Cache-Control: no-store`.
- Dữ liệu gốc vẫn lấy từ cache server (`unstable_cache`) trong `lib/cache/queries.ts`.

---

## 4) Luồng sự kiện (public)

### 4.1 Xem sự kiện

- Danh sách hiển thị theo trạng thái/schedule và tenant.
- Trang chi tiết sự kiện hiển thị nội dung + trạng thái đăng ký.

### 4.2 Đăng ký sự kiện

Action: `registerForEvent` (`app/actions/register-event.ts`)

Luồng xử lý:

1. Rate limit đăng ký.
2. Validate schema input.
3. Kiểm tra event tồn tại/chưa quá hạn/chưa bị hủy.
4. Kiểm tra sức chứa (`max_participants`) nếu bật registration.
5. Insert `event_registrations` với trạng thái `confirmed`.
6. Audit log guest action.
7. RPC tăng số lượng tham gia (`increment_participants`).
8. Gửi email xác nhận nếu có email.

---

## 5) Luồng phước điền (public)

### 5.1 Các route liên quan

- `transactions` (form chính)
- `transactions/thanh-toan/bank`
- `transactions/thanh-toan/momo`
- `transactions/cung-duong`
- `transactions/cong-duc-ghi-danh`
- `transactions/hang-muc-du-an/*`

### 5.2 Action tạo phước điền

Action: `createTransaction` (`app/actions/create-transaction.ts`)

Luồng xử lý:

1. Rate limit theo tenant.
2. Validate payload transaction.
3. Cross-check `tenant_id` với host thực tế.
4. Xác thực chiến dịch: `general` hoặc `project_id` của một Chiến dịch/Dự án đang giai đoạn `ongoing`.
5. Tự động gán `bank_account_id` và `recipient_type` từ cấu hình của Chiến dịch đó.
6. Insert `transactions` với `status=pending` và liên kết `project_id`.
7. Audit log guest transaction.
8. Trả dữ liệu để render bước thanh toán (QR động).

---

## 6) Luồng liên hệ & newsletter

### 6.1 Liên hệ

Action: `submitContactForm` (`app/actions/submit-contact.ts`)

- Rate limit theo tenant.
- Validate form bằng Zod.
- Insert `contact_messages`.
- Audit log.

### 6.2 Newsletter

API: `POST /api/newsletter/subscribe`

- Rate limit endpoint.
- Validate email cơ bản.
- Chặn duplicate subscriber.
- Insert `newsletter_subscribers`.

---

## 7) Luồng tìm kiếm public

API: `GET /api/search`

Đặc điểm:

- Resolve tenant theo host (có fallback dev qua query `tenant`).
- Chạy `performGlobalSearch` theo tenant.
- Trả kết quả có cache header ngắn (`s-maxage` + `stale-while-revalidate`).

---

## 8) i18n & locale behavior

- Locale prefix luôn hiện trong URL.
- Route public phục vụ đủ `vi/km/en`.
- Message files nằm tại `messages/vi.json`, `messages/km.json`, `messages/en.json`.

---

## 9) UX behaviors đã có test E2E

Theo test trong `e2e/`:

- Trang chủ hiển thị hero, menu, news/events section, language switcher.
- Luồng đăng ký sự kiện gồm validation, giới hạn chỗ, trạng thái đầy.
- Luồng phước điền gồm chọn số tiền, phương thức thanh toán, bước xác nhận.

---

## 11) Hệ thống Khối (Blocks) Nghệ thuật mới

Dự án đã mở rộng thư viện linh kiện cho Visual Page Builder với 12 khối chuyên biệt:

### 11.1 Biến thể Giới thiệu (About/Mosaic - Alt1-7)
- **Alt1-4**: Các bố cục bất đối xứng, Panorama, Dark Editorial, và Zen Columns.
- **Alt5**: Dòng thời gian Parallax.
- **Alt6**: Thẻ nổi Abstract.
- **Alt7**: Split Screen Minimalist.
- **Cơ chế**: Tự động ánh xạ bài viết từ bảng `about_sections` dựa trên từ khóa thông minh (Smart Mapping).

### 11.2 Biến thể Tam Bảo (Triple Gem - Alt1-5)
- **Alt1**: Classic Triptych (3 cột cổ điển).
- **Alt2**: Mandala Flow (Bố cục vòng tròn kết nối).
- **Alt3**: Sacred Scrolls (Giao diện kinh lá bối).
- **Alt4**: Vertical Immersive (Cuộn dọc tràn màn hình).
- **Alt5**: Bento Modern (Bố cục Bento hiện đại).

### 11.3 Tinh chỉnh Tâm linh & Đa chi nhánh
- Toàn bộ nội dung được chuẩn hóa phong cách Phật giáo Nam Tông (Theravada).
- Sử dụng thuật ngữ chuyên sâu: Chánh Biến Tri, Pháp bảo nhiệm mầu, Ruộng phước tối thắng.
- Hỗ trợ Multi-tenant: Không dùng tên riêng chi nhánh trong mã nguồn khối, mọi thông tin đều lấy từ DB hoặc cấu hình tổng quát.

---

## 13) Trợ lý Pháp học AI (Sư Số)

Tính năng cốt lõi dựa trên công nghệ RAG (Retrieval-Augmented Generation) để tư vấn giáo lý cho Nhân sự.

### 13.1 Đặc điểm
- **Tên gọi:** Sư Số.
- **Dữ liệu nguồn:** Kinh điển Nam tông Khmer, các bài giảng của chư Tăng.
- **Phong cách:** Tư vấn từ bi, đúng giáo luật, hỗ trợ stream SSE (real-time typing).

### 13.2 Công nghệ
- **LLM:** Gemini 3 Flash.
- **Vector Search:** Supabase `pgvector` (Cosine Similarity).
- **Backend:** Supabase Edge Functions.

### 13.3 Giao diện Dharma Chat (AI Portal)
- **Standalone Layout:** Sử dụng `layout_style = 'ai_portal'` để tối ưu trải nghiệm tập trung.
- **SSE Streaming:** Trả lời trực tiếp từng ký tự (typing effect).
- **Smart Citations:** Hiển thị trích dẫn Kinh điển dưới dạng thẻ tương tác, cho phép xem trước nội dung gốc.
- **Academic Metadata:** Hiển thị thông tin tác giả, tập, trang của nguồn trích dẫn.
- **RAG Semantic Cache:** Tự động lưu vết và tái sử dụng các câu trả lời chất lượng cao cho các câu hỏi tương tự.

---

## 14) Checklist khi thêm route public mới

1. Gắn tenant/locale đúng chuẩn routing.
2. Không làm lộ dữ liệu private tenant khác.
3. Nếu có mutate: thêm action với validation + audit + rate limit.
4. Nếu có dữ liệu cache: định nghĩa tag revalidate rõ ràng.
5. Cập nhật docs file này và API/Actions catalog.
