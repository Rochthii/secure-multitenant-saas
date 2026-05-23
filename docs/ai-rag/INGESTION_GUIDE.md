# Hướng Dẫn Nạp Chính Sách An Ninh & Kiểm Toán Đa Bộ Phận (Enterprise Policy Ingestion)

## Tổng quan

Hệ thống **Security Policy & IT Audit Copilot RAG** hỗ trợ quản trị và phân tích chính sách bảo mật cho **4 bộ phận chuyên môn cốt lõi** trong doanh nghiệp. Mỗi tài liệu chính sách khi nạp vào hệ thống cần được phân loại đúng mã định danh bộ phận (`department_id` - tương đương với mã `tradition_id` vật lý của cơ sở dữ liệu nhằm tương thích ngược) để AI có thể phân loại ngữ cảnh và sinh câu hỏi kiểm tra tuân thủ bảo mật chính xác cho nhân viên.

---

## Danh sách Bộ Phận & Phân loại Chính sách (`tradition_id` mapping)

| Mã Database | Tên Bộ Phận | Tài liệu Chính sách tiêu biểu |
|:---|:---|:---|
| `THERAVADA` | **Nhân sự & Pháp lý (HR & Legal)** | Thỏa thuận bảo mật thông tin (NDA), Quy tắc ứng xử nhân viên, Chính sách bảo vệ dữ liệu cá nhân (NĐ 13/2023/NĐ-CP). |
| `MAHAYANA` | **An toàn thông tin (IT Security)** | Tiêu chuẩn ISO/IEC 27001:2013, Quy trình ứng phó sự cố an ninh (SOAR), RLS & Rủi ro cô lập dữ liệu Cloud. |
| `VAJRAYANA` | **Kiểm toán Tài chính (Finance Audit)** | Quy chế kiểm toán nội bộ, Quy trình quản lý ngân sách, Kiểm soát giao dịch đa chi nhánh. |
| `KHATTSI` | **Ban Điều hành (Executive Board)** | Nghị quyết chiến lược, Quy định phân cấp đặc quyền quản trị tập đoàn. |
| `GENERAL` | **Nội quy chung (General Policies)** | Quy chế vận hành doanh nghiệp, Chính sách làm việc hybrid. |

---

## Cách nạp chính sách mới (Web Admin)

### Bước 1: Quyền truy cập & Bảo mật (RBAC)
> [!IMPORTANT]
> Toàn bộ các API nạp tài liệu hiện đã được bảo vệ chặt chẽ bởi lớp phân quyền kiểm soát `requireAdmin`. Người dùng bắt buộc phải có vai trò **Super Admin** hoặc **Compliance Officer** của hệ thống mới có thể kích hoạt tiến trình nạp chính sách.

### Bước 2: Tải lên tài liệu PDF & Cung cấp Metadata
Truy cập vào **Admin → Security Center → AI Policy Management → Nạp tài liệu**. 
PDF sẽ được phân tích, cắt đoạn (chunking), trích xuất thực thể bảo mật và đẩy sang API xử lý `/api/admin/ai/parse-pdf`.

---

## Nạp liệu nâng cao (Sử dụng Script)

Đối với các tài liệu quy chuẩn kỹ thuật đồ sộ (ví dụ: toàn văn tài liệu ISO 27001 gồm hàng trăm trang), khuyến khích sử dụng Script Node.js để chạy ngầm qua terminal nhằm kiểm soát tiến trình, tránh bị timeout trình duyệt và xử lý rate limit API.

### Script mẫu: `scripts/ingest_policies.mjs`
Script được tối ưu hóa cho:
- **ESM Compatibility**: Nhập thư viện xử lý tài liệu PDF trong môi trường Node.js hiện đại.
- **Rate Limiting Guard**: Tự động trì hoãn (sleep 1000ms) sau mỗi phân đoạn nhúng (embedding chunk) để tránh cạn kiệt hạn ngạch (Rate Limit Exceeded) của Google Cloud API.
- **Environment Aware**: Tự động đọc thông tin xác thực từ tệp cấu hình `.env.local`.

**Cách thực thi:**
```powershell
node scripts/ingest_policies.mjs
```

---

## Quy chuẩn Cấu trúc Metadata theo từng Bộ phận

### 1. Nhân sự & Pháp lý (HR & Legal)
```json
{
  "author":            "Trưởng phòng Nhân sự / Pháp lý",
  "effective_date":    "2026-01-01",
  "classification":    "CONFIDENTIAL (Bảo mật nội bộ)",
  "legal_framework":   "Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân",
  "language":          "vi"
}
```

### 2. An toàn thông tin (IT Security)
```json
{
  "author":            "Chief Information Security Officer (CISO)",
  "framework":         "ISO/IEC 27001 Annex A",
  "iso_control":       "A.12.4.1 (Nhật ký sự kiện)",
  "target_systems":    "PostgreSQL RLS, Supabase Cloud, Next.js Serverless Edge",
  "language":          "vi"
}
```

### 3. Kiểm toán Tài chính (Finance Audit)
```json
{
  "author":            "Trưởng Ban Kiểm soát Tài chính",
  "auditor":           "Internal Audit Team",
  "regulation":        "Quy chế quản lý tài chính doanh nghiệp",
  "scope":             "Toàn tập đoàn và các chi nhánh (Tenants)",
  "language":          "vi"
}
```

---

## Quy trình Phê duyệt Câu hỏi Kiểm tra Tuân thủ (Compliance Assessment)

Sau khi tài liệu chính sách được nhúng thành công vào Vector Database, AI Copilot sẽ tự động biên soạn các câu hỏi trắc nghiệm kiểm tra tuân thủ. Các câu hỏi này phải qua **Ban Kiểm soát Tuân thủ (Compliance Team)** duyệt trước khi phân phối cho nhân viên:

1. Truy cập **Admin → Security Center → Assessment Panel → Chờ Duyệt**.
2. Kiểm tra kỹ lưỡng từng câu hỏi:
   - Nội dung câu hỏi có bám sát chính sách doanh nghiệp không?
   - Đáp án trắc nghiệm có chuẩn xác 100% không?  
   - Phần giải thích có dẫn chiếu cụ thể đến mục/điều khoản chính sách an ninh nào không?
3. Nhấp **"Phê duyệt câu hỏi"** hoặc **"Từ chối / Yêu cầu AI sinh lại"**.
4. Câu hỏi được duyệt sẽ tự động đưa vào ngân hàng đề kiểm tra định kỳ của doanh nghiệp.

---

## Xử lý Sự cố Kỹ thuật khi Nạp liệu (Troubleshooting)

| Sự cố thường gặp | Nguyên nhân phổ biến | Phương án xử lý |
| :--- | :--- | :--- |
| **500 Internal Server Error** | Lỗi phân tách tài liệu PDF phức tạp chứa bảng biểu quét scan | Đảm bảo tệp PDF đã được xử lý OCR hoặc kiểm tra cấu hình `dynamic import` của parser trong Edge runtime. |
| **403 Forbidden / Unauthorized** | JWT Token của người dùng hết hạn hoặc thiếu vai trò kiểm soát | Đăng xuất, thực hiện đăng nhập lại bằng tài khoản được cấp quyền Super Admin. |
| **429 Too Many Requests** | Vượt ngưỡng giới hạn gọi API nhúng của Google Gemini | Chờ 60 giây để khôi phục quota hoặc cấu hình khóa API dự phòng (Gemini Failover Key) trong `.env.local`. |

---

*Tài liệu kỹ thuật cập nhật: 23/05/2026 — Enterprise Security Copilot RAG Core v2.2.0 (Academic & Production Grade)*
