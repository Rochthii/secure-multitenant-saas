# 📋 BÁO CÁO PHÂN TÍCH DỰ ÁN WEBSITE CHÙA CHANTARANGSAY

> **Phiên bản:** 1.0  
> **Ngày lập:** 27/01/2026  
> **Dự án:** Website Chi nhánh Chantarangsay - Phật giáo Nam tông Khmer  

---

## 📑 MỤC LỤC TỔNG THỂ

| STT | Tài liệu | Mô tả |
|-----|----------|-------|
| 01 | [Báo cáo Tổng quan](./01_BAO_CAO_TONG_QUAN.md) | Tổng quan dự án, mục tiêu, phạm vi |
| 02 | [Phân tích Website Tham khảo](./02_PHAN_TICH_WEBSITE_THAM_KHAO.md) | Phân tích các website chi nhánh VN & quốc tế |
| 03 | [Thiết kế UI/UX](./03_THIET_KE_UI_UX.md) | Moodboard, màu sắc, typography, layout |
| 04 | [Kiến trúc Kỹ thuật](./04_KIEN_TRUC_KY_THUAT.md) | Stack công nghệ, cấu trúc dự án |
| 05 | [Cấu trúc Nội dung](./05_CAU_TRUC_NOI_DUNG.md) | Sitemap, wireframe, tính năng |
| 06 | [Lộ trình Triển khai](./06_LO_TRINH_TRIEN_KHAI.md) | Phases, timeline, checklist |

---

## 1. GIỚI THIỆU DỰ ÁN

### 1.1 Bối cảnh

**Chi nhánh Chantarangsay** (tiếng Khmer: ចន្ទរង្សី - "Ánh Trăng") là ngôi chi nhánh Phật giáo Nam tông Khmer tọa lạc tại **Quận 3, TP.HCM**, được thành lập năm **1946** bởi Hòa thượng Lâm Em. Đây là một trong những ngôi chi nhánh Khmer lớn nhất và có ảnh hưởng nhất tại TP.HCM.

### 1.2 Tầm nhìn Dự án

Xây dựng một **"Ngôi chi nhánh số"** (Digital Tenant) đẳng cấp, giàu bản sắc văn hóa Khmer, phục vụ:
- Nhân sự Khmer trong và ngoài nước
- Khách tham quan, du lịch quốc tế
- Nhà nghiên cứu văn hóa, kiến trúc

### 1.3 Mục tiêu Cụ thể

| Mục tiêu | Chỉ số đo lường |
|----------|-----------------|
| **Giới thiệu di sản** | 100% nội dung về lịch sử, kiến trúc, văn hóa |
| **Phục vụ Nhân sự** | Đăng ký lễ, thanh toán online hoạt động 24/7 |
| **Thu hút du khách** | Đa ngôn ngữ (Việt, Khmer, Anh) |
| **Hiện đại hóa** | Mobile-first, PWA, tốc độ < 3s |
| **Bảo tồn văn hóa** | Thư viện số với 100+ tài liệu |

---

## 2. PHẠM VI DỰ ÁN

### 2.1 Trong phạm vi (In Scope)

- ✅ Website đa ngôn ngữ (Việt - Khmer - English)
- ✅ Hệ thống quản trị nội dung (CMS)
- ✅ Đăng ký lễ/sự kiện trực tuyến
- ✅ Thanh toán/Transaction qua nhiều kênh
- ✅ Thư viện số (ảnh, video, audio, PDF)
- ✅ Lịch sự kiện tương tác
- ✅ SEO & tích hợp mạng xã hội
- ✅ Responsive design (Mobile-first)

### 2.2 Ngoài phạm vi (Out of Scope - Phase 1)

- ❌ Ứng dụng Mobile native (iOS/Android)
- ❌ Tour thực tế ảo 360° (Nice-to-have, Phase 2)
- ❌ AI Chatbot tư vấn (Phase 3)
- ❌ E-commerce bán vật phẩm

---

## 3. NGUYÊN TẮC THIẾT KẾ

### 3.1 Nguyên tắc Cốt lõi

```
┌─────────────────────────────────────────────────────────────┐
│                    THIẾT KẾ WEBSITE                        │
│                                                            │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐  │
│   │  VĂN HÓA     │   │  HIỆN ĐẠI    │   │  DỄ DÙNG     │  │
│   │  KHMER       │ + │  CHUYÊN      │ + │  TRUY CẬP    │  │
│   │  NAM TÔNG    │   │  NGHIỆP      │   │  MỌI NƠI     │  │
│   └──────────────┘   └──────────────┘   └──────────────┘  │
│                                                            │
│   ══════════════════════════════════════════════════════   │
│                         ║                                  │
│                         ▼                                  │
│              ┌─────────────────────┐                       │
│              │  TRẢI NGHIỆM        │                       │
│              │  TÂM LINH SỐ        │                       │
│              │  ĐẲNG CẤP           │                       │
│              └─────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Đặc thù Phật giáo Nam tông Khmer

| Yếu tố | Ứng dụng trong Website |
|--------|------------------------|
| **Màu Vàng-Cam** | Màu chủ đạo của áo cà sa, biểu tượng trí tuệ |
| **Rắn Naga** | Họa tiết trang trí, biểu tượng che chở |
| **Hoa Sen** | Icon, divider, background pattern |
| **Mái chi nhánh cong** | Logo, header illustration |
| **Lịch Khmer** | Widget hiển thị ngày Seil, lễ hội |

---

## 4. YÊU CẦU QUAN TRỌNG

> [!CAUTION]
> **NGUYÊN TẮC BẮT BUỘC THEO USER RULES**
> - Không có logic demo/giả lập
> - Mọi chức năng phải thực hiện action thật
> - Dữ liệu phải lưu trữ, validate, có thể truy xuất
> - RBAC phải được enforce ở backend
> - Audit log cho mọi hành động quan trọng

### 4.1 Checklist Tuân thủ

- [ ] Mọi form submit → ghi database thật
- [ ] Mọi thanh toán → tích hợp cổng thanh toán thật
- [ ] Mọi đăng ký → gửi email xác nhận thật
- [ ] Admin panel → có phân quyền rõ ràng
- [ ] Backup → backup thật, có thể restore

---

## 5. ĐỐI TƯỢNG SỬ DỤNG

### 5.1 Persona chính

| Persona | Đặc điểm | Nhu cầu chính |
|---------|----------|---------------|
| **Nhân sự Khmer** | 30-70 tuổi, nói tiếng Khmer/Việt | Đăng ký lễ, xem lịch, thanh toán |
| **Du khách quốc tế** | 25-50 tuổi, nói tiếng Anh | Tìm hiểu kiến trúc, lịch sử, hướng dẫn tham quan |
| **Thanh niên Khmer** | 18-30 tuổi, sử dụng mobile nhiều | Xem video, podcast, học tiếng Khmer |
| **Nhà nghiên cứu** | Học giả, sinh viên | Tài liệu, hình ảnh chất lượng cao |

---

## 6. TIẾP THEO

Xem các tài liệu chi tiết:
- → [02_PHAN_TICH_WEBSITE_THAM_KHAO.md](./02_PHAN_TICH_WEBSITE_THAM_KHAO.md)
- → [03_THIET_KE_UI_UX.md](./03_THIET_KE_UI_UX.md)
- → [04_KIEN_TRUC_KY_THUAT.md](./04_KIEN_TRUC_KY_THUAT.md)
