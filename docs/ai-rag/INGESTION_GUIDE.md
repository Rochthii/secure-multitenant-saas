# Hướng Dẫn Nạp Kinh Sách Đa Hệ Phái

## Tổng quan

Hệ thống Dharma Chat RAG đã hỗ trợ **5 hệ phái Phật giáo**. Mỗi tài liệu nạp vào cần được gắn đúng `tradition_id` để AI có thể lọc và sinh câu hỏi trắc nghiệm chính xác.

---

## Danh sách Hệ Phái (tradition_id)

| ID | Tên Việt | Ví dụ Kinh sách |
|:---|:---|:---|
| `THERAVADA` | Nam Tông Theravāda | Tam Tạng Pāli, Thanh Tịnh Đạo |
| `MAHAYANA` | Bắc Tông Đại Thừa | Kinh Pháp Hoa, Kim Cang, Hoa Nghiêm |
| `VAJRAYANA` | Kim Cang Thừa Mật Tông | Mật điển Tây Tạng |
| `KHATTSI` | Hệ Phái Khất Sĩ | Chơn Lý (69 bài) |
| `GENERAL` | Phật Học Phổ Thông | Lịch sử PG, So sánh tông phái |

---

## Cách nạp kinh sách mới (Web Admin)

### Bước 1: Quyền truy cập & Bảo mật
> [!IMPORTANT]
> Toàn bộ các API nạp liệu hiện đã được bảo vệ bởi lớp `requireAdmin`. Người dùng phải có quyền Admin hệ thống mới có thể kích hoạt tiến trình nạp.

### Bước 2: Upload file PDF + Điền metadata
Vào **Admin → Tab "AI Dharma" → Nạp Kinh sách**. PDF sẽ được xử lý qua API `/api/admin/ai/parse-pdf`. 

---

## Nạp liệu nâng cao (Sử dụng Script)

Đối với các bộ kinh đồ sộ hoặc cần nạp số lượng lớn, khuyến khích sử dụng Script Node.js để kiểm soát tốt tiến trình và tránh timeout trình duyệt.

### Script mẫu: `scripts/ingest_psychology.mjs`
Script này đã được tối ưu hóa cho:
- **ESM Compatibility**: Xử lý lỗi nạp thư viện `pdf-parse` trong môi trường Node hiện đại.
- **Rate Limiting**: Tự động trì hoãn 1s/đoạn để tránh bị Google chặn API.
- **Environment Aware**: Tự động lấy cấu hình từ `.env.local`.

**Cách chạy:**
```powershell
node scripts/ingest_psychology.mjs
```

---

## Quy chuẩn Metadata theo từng Hệ phái

### Theravāda (Nam Tông)
```json
{
  "author":      "Tên Ngài / Thượng Tọa",
  "translator":  "Tỳ Kheo Bodhi / Tỳ Kheo Nguyệt Thiên",
  "canon":       "Tipiṭaka (Tam Tạng Pāli)",
  "pali_ref":    "MN 22 / DN 2 / SN 22.59",
  "language":    "vi"
}
```

### Đại Thừa (Mahayana)
```json
{
  "author":      "Đức Phật / Long Thọ / Thế Thân",
  "translator":  "HT. Thích Trí Tịnh / HT. Thích Thanh Từ",
  "canon":       "Đại Chánh Tân Tu Đại Tạng Kinh (Taishō Tripiṭaka)",
  "taisho_number": "T0235",
  "language":    "vi"
}
```

### Khất Sĩ
```json
{
  "author":      "Tổ sư Minh Đăng Quang",
  "canon":       "Chơn Lý — 69 bài",
  "volume":      "Quyển 1 / Quyển 2",
  "language":    "vi"
}
```

---

## Danh sách Kinh sách Đại Thừa ưu tiên nạp (Sprint 6)

Giao nội dung cho **Content Lead (Học viện Phật giáo)**:

| Thứ tự | Tên Kinh | Taishō | Người dịch đề nghị |
|:---:|:---|:---|:---|
| 1 | Kinh Kim Cang | T0235 | HT. Thích Thanh Từ |
| 2 | Bát Nhã Tâm Kinh | T0251 | Thích Thiện Châu |
| 3 | Kinh A Di Đà | T0366 | HT. Thích Trí Tịnh |
| 4 | Kinh Duy Ma Cật | T0475 | Tuệ Sỹ |
| 5 | Kinh Pháp Hoa (trích) | T0262 | HT. Thích Trí Tịnh |
| 6 | Lục Tổ Đàn Kinh | T2008 | HT. Thích Thanh Từ |

---

## Quy trình Duyệt Câu Hỏi Trắc Nghiệm

Sau khi AI sinh câu hỏi, **Ban Tu Thư phải duyệt** trước khi câu hỏi vào ngân hàng:

1. Vào **Admin → Tab "Trắc Nghiệm" → Chờ Duyệt**
2. Mở từng câu, kiểm tra:
   - Nội dung có đúng giáo lý không?
   - Đáp án có chắc chắn đúng không?  
   - Giải thích có trích dẫn kinh điển không?
3. Click **"Duyệt câu hỏi"** hoặc **"Từ chối"**
4. Câu hỏi được duyệt sẽ tự động vào ngân hàng phục vụ sinh viên

---

## Lưu ý Kỹ thuật (Troubleshooting)

| Lỗi thường gặp | Nguyên nhân | Cách xử lý |
| :--- | :--- | :--- |
| **500 Internal Server Error** | Lỗi nạp thư viện PDF | Kiểm tra file đã được gỡ bỏ `import` tĩnh và dùng `dynamic import`. |
| **403 Forbidden / Unauthorized** | Chưa đăng nhập Admin | Đăng xuất và đăng nhập lại bằng tài khoản Admin hệ thống. |
| **429 Too Many Requests** | Vượt mức API Key | Chờ 1 phút hoặc chuyển sang dùng API Key dự phòng trong `.env.local`. |

---

*Tài liệu cập nhật: 17/04/2026 — Dharma Chat AI Core v2.2 (Enterprise Grade)*
