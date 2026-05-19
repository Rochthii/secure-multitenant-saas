# 18 — AI Testing Suite & QA

**Tài liệu hướng dẫn kiểm thử hệ thống AI (Dharma Chat & RAG)**  
**Cập nhật:** 2026-04-15 (Version 2.0)

---

## 1) Tổng quan

Bộ kiểm thử AI được thiết kế để đảm bảo tính ổn định của luồng Chat hỗ trợ RAG (Retrieval-Augmented Generation). Do tính chất bất định của LLM, chúng ta tập trung kiểm thử vào:
- **Client Logic:** Xử lý luồng SSE (Server-Sent Events), Abort Controller, và State management.
- **UI Components:** Render tin nhắn, citation, và hiệu ứng streaming.
- **API Robustness:** Xử lý lỗi từ phía server (Next.js 15 compatibility).

---

## 2) Cấu trúc bộ Test

Toàn bộ test sử dụng **Vitest** + **React Testing Library**.

### 2.1 Các tệp quan trọng
- `hooks/__tests__/use-web-rag.test.ts`: Kiểm thử logic streaming, gom gộp token, và xử lý lỗi.
- `components/templates/ai-portal/__tests__/dharma-chat-input.test.tsx`: Kiểm thử tương tác input, validate, và trạng thái loading.
- `components/templates/ai-portal/__tests__/dharma-chat-bubble.test.tsx`: Kiểm thử việc render trích dẫn (citations) và nội dung markdown.

---

## 3) Hướng dẫn chạy Test

Chạy toàn bộ test suite:
```bash
npm test
```

Chạy riêng các test liên quan đến AI:
```bash
npx vitest tests/unit/ai
# Hoặc chạy theo pattern tên file
npx vitest dharma-chat
```

---

## 4) Các tình huống (Test Cases) trọng tâm

### 4.1 Luồng Hook `useWebRag`
- [x] Khởi tạo state mặc định rỗng.
- [x] Gửi message thành công và nhận stream.
- [x] Xử lý lỗi 500 từ AI API.
- [x] Tự động cuộn và cập nhật mảng tin nhắn khi có token mới.
- [x] Hủy stream (Abort) khi người dùng yêu cầu hoặc chuyển trang.

### 4.2 Giao diện Chat
- [x] Input không gửi tin nhắn rỗng.
- [x] Bubble hiển thị icon user/bot phân biệt.
- [x] Hiển thị thẻ trích dẫn (Academic Metadata) khi bot trả về citations.
- [x] Hiệu ứng "typing" indicator khi đang chờ phản hồi.

### 4.3 Quản trị & Nạp liệu (Admin RAG)
- [x] Tự động bóc tách Metadata (Mã kinh, dịch giả...) khi để trống và nhấn Vector hóa.
- [x] Ưu tiên dữ liệu nhập tay của người dùng so với dữ liệu AI bóc tách.
- [x] Xử lý lỗi khi Gemini API bóc tách metadata không thành công (Vẫn cho phép nạp liệu tiếp tục).
- [x] Phê duyệt Cache (HITL): Admin có thể sửa và nhấn "Phê duyệt" để ưu tiên câu trả lời trong cache.

### 4.4 Hạ tầng & Chi phí (Infra & Cost Protection)
- [x] **Rate Limit:** Gửi 6 câu hỏi/phút từ cùng 1 IP. Kiểm tra xem câu 6 có bị chặn với mã 429 không.
- [x] **Semantic Cache:** Hỏi 2 câu tương tự nhau (vd: "Thế nào là vô ngã?" và "Vô ngã là gì?"). Kiểm tra xem lần 2 có trả về kết quả tức thì từ cache không.
- [x] **Lean Optimizer:** Đợi 24h và kiểm tra xem tin nhắn của khách vãng lai đã bị xóa khỏi DB chưa.
- [x] **Persistence:** Reset trình duyệt (không xóa cache) và kiểm tra xem `localStorage` có khôi phục được lịch sử chat cho Guest không.

---

## 5) Lưu ý cho Next.js 15+

Hệ thống đã được fix lỗi **Sync Access to Params**. Khi viết thêm các API route phục vụ AI (như preview document), luôn phải tuân thủ:
```typescript
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Params phải là Promise
) {
  const { id } = await params;
  // logic...
}
```

---

## 6) Checklist khi cập nhật tính năng AI mới

1. Cập nhật `mock` cho `fetch` trong test suite nếu cấu trúc JSON phản hồi từ RAG API thay đổi.
2. Kiểm tra tính tương thích của `AbortController`.
3. Đảm bảo các trích dẫn (Citations) mới có đầy đủ metadata để tránh lỗi render `undefined`.
4. Chạy `npm run build` để kiểm tra lỗi type-check trên toàn hệ thống.
