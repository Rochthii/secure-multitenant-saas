# 📂 CẤU TRÚC NỘI DUNG & TÍNH NĂNG

> **Sitemap, wireframes, và danh sách tính năng chi tiết**

---

## 1. SITEMAP ĐẦY ĐỦ

```
🏠 CHANTARANGSAY.ORG
│
├── 🏠 Trang chủ (/)
│   ├── Hero Section (Video/Slider)
│   ├── Quick Access Cards
│   ├── Sự kiện sắp tới
│   ├── Tin tức mới nhất
│   └── Call-to-action (Thanh toán)
│
├── 📖 Giới thiệu (/gioi-thieu)
│   ├── /lich-su - Lịch sử chi nhánh (từ 1946)
│   ├── /kien-truc - Kiến trúc & Nghệ thuật
│   │   ├── Chánh điện
│   │   ├── Nhà Sala
│   │   ├── Tháp cốt
│   │   └── Biểu tượng (Naga, Garuda, Kayno)
│   ├── /giao-ly - Giáo lý Theravada
│   ├── /phong-tuc - Phong tục Khmer
│   └── /ban-lanh-dao - Thầy trụ trì & Chư tăng
│
├── 📅 Lịch Lễ (/lich-le)
│   ├── Lịch tháng (Calendar view)
│   ├── /seil - Các ngày Seil
│   ├── /tet-khmer - Chol Chnam Thmay
│   ├── /don-ta - Lễ Đôn Ta
│   └── /ok-om-bok - Lễ Ok Om Bok
│
├── 📰 Tin tức (/tin-tuc)
│   ├── Danh sách tin (paginated)
│   ├── /[slug] - Chi tiết tin
│   ├── Filter by: Danh mục, Năm
│   └── Search
│
├── 🎬 Thư viện (/thu-vien)
│   ├── /anh - Album ảnh
│   │   └── Filter by: Lễ hội, Năm
│   ├── /video - Video pháp âm
│   ├── /audio - Podcast/MP3
│   └── /tai-lieu - Kinh sách PDF
│
├── 🙏 Thanh toán (/cung-duong)
│   ├── Giới thiệu & Mục đích
│   ├── Các quỹ đóng góp
│   ├── Hình thức thanh toán
│   └── Danh sách giao dịch (public)
│
├── ✍️ Đăng ký (/dang-ky)
│   ├── /cau-an - Đăng ký cầu an
│   ├── /cau-sieu - Đăng ký cầu siêu
│   ├── /khoa-tu - Khóa tu gieo duyên
│   └── /tham-quan - Đặt lịch tham quan đoàn
│
├── 📞 Liên hệ (/lien-he)
│   ├── Thông tin liên lạc
│   ├── Bản đồ Google Maps
│   ├── Form liên hệ
│   └── Hướng dẫn di chuyển
│
├── 🔐 Admin (/admin) [Protected]
│   ├── Dashboard
│   ├── /tin-tuc - Quản lý tin tức
│   ├── /su-kien - Quản lý sự kiện
│   ├── /thu-vien - Quản lý media
│   ├── /dang-ky - Xem đăng ký
│   ├── /cung-duong - Quản lý transactions
│   └── /cai-dat - Settings
│
└── 📄 Trang phụ
    ├── /chinh-sach-bao-mat
    ├── /dieu-khoan-su-dung
    └── /sitemap.xml
```

---

## 2. DANH SÁCH TÍNH NĂNG

### 2.1 MUST-HAVE (Bắt buộc - Phase 1)

| # | Tính năng | Mô tả | Độ phức tạp |
|---|-----------|-------|-------------|
| 1 | **Đa ngôn ngữ** | Việt, Khmer, English với URL routing | ⭐⭐⭐⭐ |
| 2 | **Responsive Design** | Mobile-first, tối ưu mọi màn hình | ⭐⭐⭐ |
| 3 | **CMS Admin** | Quản lý tin tức, sự kiện, media | ⭐⭐⭐⭐ |
| 4 | **Lịch sự kiện** | Calendar view, filter, subscribe .ics | ⭐⭐⭐ |
| 5 | **Thư viện ảnh** | Gallery với lightbox, filter theo lễ hội | ⭐⭐⭐ |
| 6 | **Thư viện video** | Embed YouTube, playlist | ⭐⭐ |
| 7 | **Form đăng ký lễ** | Multi-step form, email confirm | ⭐⭐⭐ |
| 8 | **Thanh toán online** | QR VietQR, MoMo integration | ⭐⭐⭐⭐⭐ |
| 9 | **Form liên hệ** | Validate, email notification | ⭐⭐ |
| 10 | **SEO** | Meta tags, sitemap, structured data | ⭐⭐⭐ |
| 11 | **Google Maps** | Vị trí, hướng dẫn đi | ⭐⭐ |
| 12 | **Social sharing** | Facebook, Zalo share buttons | ⭐⭐ |

### 2.2 SHOULD-HAVE (Nên có - Phase 2)

| # | Tính năng | Mô tả | Độ phức tạp |
|---|-----------|-------|-------------|
| 13 | **Widget Lịch Khmer** | Hiển thị ngày âm lịch Khmer | ⭐⭐⭐⭐ |
| 14 | **Audio Player** | Playlist pháp âm, background play | ⭐⭐⭐ |
| 15 | **Newsletter** | Đăng ký nhận tin, send email | ⭐⭐⭐ |
| 16 | **Search** | Full-text search across content | ⭐⭐⭐ |
| 17 | **User Account** | Đăng ký, lịch sử đăng ký lễ | ⭐⭐⭐⭐ |
| 18 | **Transaction Progress** | Progress bar cho các quỹ | ⭐⭐ |
| 19 | **Print-friendly** | In bài viết, kinh sách | ⭐⭐ |

### 2.3 NICE-TO-HAVE (Tính năng nâng cao - Phase 3)

| # | Tính năng | Mô tả | Độ phức tạp |
|---|-----------|-------|-------------|
| 20 | **Tour ảo 360°** | Panorama tham quan chi nhánh | ⭐⭐⭐⭐⭐ |
| 21 | **Live Streaming** | Embed phát trực tiếp lễ | ⭐⭐⭐ |
| 22 | **PWA** | Offline mode, install app | ⭐⭐⭐⭐ |
| 23 | **Push Notifications** | Thông báo sự kiện sắp tới | ⭐⭐⭐⭐ |
| 24 | **AI Chatbot** | Trả lời câu hỏi tự động | ⭐⭐⭐⭐⭐ |
| 25 | **E-learning** | Khóa học tiếng Khmer online | ⭐⭐⭐⭐⭐ |

---

## 3. CHI TIẾT TÍNH NĂNG QUAN TRỌNG

### 3.1 Hệ thống Đa ngôn ngữ

```
URL Structure:
├── chantarangsay.org/vi/...     (Tiếng Việt - mặc định)
├── chantarangsay.org/km/...     (Tiếng Khmer)
└── chantarangsay.org/en/...     (English)

Implementation:
- next-intl hoặc next-i18next
- JSON translation files
- Language switcher dropdown
- Persist preference in cookie
- SEO: hreflang tags
```

### 3.2 Form Đăng ký Lễ

```
Steps:
1. Chọn loại lễ (Cầu an / Cầu siêu / Khác)
2. Điền thông tin người đứng lễ
   - Họ tên *
   - Điện thoại *
   - Email
   - Địa chỉ
3. Điền thông tin người cầu nguyện
   - Danh sách tên (có thể nhiều)
   - Ghi chú
4. Chọn ngày (từ calendar)
5. Xác nhận & Gửi

After Submit:
- Gửi email xác nhận với mã đăng ký
- Admin nhận notification
- Lưu vào database với status = 'pending'
- Admin có thể confirm/reject
```

### 3.3 Hệ thống Thanh toán

```
Payment Flow:
1. Chọn mục đích đóng góp
   - Quỹ tổng
   - Quỹ tu sửa chánh điện
   - Quỹ học bổng tiếng Khmer
   - Quỹ từ thiện
2. Nhập số tiền (hoặc chọn preset: 100K, 500K, 1M, 5M)
3. Thông tin người cúng (có thể ẩn danh)
4. Chọn phương thức thanh toán
   - QR VietQR (chuyển khoản ngân hàng)
   - MoMo
   - ZaloPay
   - PayPal (cho Việt Kiều)
5. Redirect đến trang thanh toán
6. Callback xác nhận
   - Thành công: Hiển thị thư cảm ơn, gửi email
   - Thất bại: Hiển thị lỗi, hướng dẫn thử lại

Backend:
- Webhook receive từ payment gateway
- Verify signature
- Update transaction status
- Trigger email
- Log audit
```

### 3.4 Thư viện Số

```
Media Types:
├── Images
│   ├── Gallery grid view
│   ├── Lightbox với zoom
│   ├── Filter: Lễ hội, Năm, Album
│   └── Download original
├── Videos
│   ├── YouTube embed
│   ├── Playlist theo chủ đề
│   └── Thumbnail grid
├── Audio
│   ├── Custom player với playlist
│   ├── Download MP3
│   └── Background play
└── Documents
    ├── PDF viewer embed
    ├── Download link
    └── Kinh sách Khmer-Việt-Pali
```

---

## 4. WIREFRAME CHI TIẾT

### 4.1 Trang Lịch Lễ

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER                                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LỊCH LỄ CHÙA CHANTARANGSAY                                │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  < Tháng 4, 2026 >              [Tháng] [Tuần]     │   │
│  ├─────┬─────┬─────┬─────┬─────┬─────┬─────┤          │   │
│  │ CN  │ T2  │ T3  │ T4  │ T5  │ T6  │ T7  │          │   │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤          │   │
│  │     │     │     │ 1   │ 2   │ 3   │ 4   │          │   │
│  │     │     │     │     │     │     │     │          │   │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤          │   │
│  │ 5   │ 6   │ 7   │ 8   │ 9   │ 10  │ 11  │          │   │
│  │     │     │     │●Seil│     │     │     │          │   │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤          │   │
│  │ 12  │ 13  │ 14  │ 15  │ 16  │ 17  │ 18  │          │   │
│  │     │     │★TẾT │★   │★   │     │     │          │   │
│  └─────┴─────┴─────┴─────┴─────┴─────┴─────┘          │   │
│                                                             │
│  ★ TẾT CHOL CHNAM THMAY                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📅 14-16/04/2026                                    │   │
│  │ 📍 Chánh điện chi nhánh Chantarangsay                   │   │
│  │ 📝 Tết cổ truyền Khmer, lễ tắm Phật...             │   │
│  │ [Xem chi tiết]  [Đăng ký tham dự]                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ● NGÀY SEIL THÁNG 4                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📅 08/04, 15/04, 23/04, 30/04                       │   │
│  │ ⏰ 5:00 - 18:00                                     │   │
│  │ 📍 Chánh điện                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  FOOTER                                                     │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Trang Thanh toán

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER                                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🙏 CÚNG DƯỜNG - CÔNG ĐỨC                                  │
│                                                             │
│  "Của cho không bằng cách cho"                              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CHỌN MỤC ĐÍCH ĐÓNG GÓP                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ 🏛️          │ │ 📚          │ │ ❤️          │           │
│  │ Quỹ Tu sửa  │ │ Quỹ Học     │ │ Quỹ Từ      │           │
│  │ Chánh điện  │ │ bổng Khmer  │ │ thiện       │           │
│  │ ───────────│ │ ───────────│ │ ───────────│           │
│  │ █████░░ 70%│ │ ███░░░░ 40%│ │ ██████░ 85%│           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│  SỐ TIỀN                                                    │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │ 100.000│ │ 500.000│ │1.000.000│ │ Khác   │              │
│  └────────┘ └────────┘ └────────┘ └────────┘              │
│                                                             │
│  THÔNG TIN NGƯỜI CÚNG                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Họ tên: [____________________________]              │   │
│  │ SĐT:    [____________________________]              │   │
│  │ Email:  [____________________________]              │   │
│  │ [✓] Ẩn danh (không hiển thị trong danh sách)       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  PHƯƠNG THỨC THANH TOÁN                                     │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │ 🏦     │ │ 💜     │ │ 💙     │ │ 🌐     │              │
│  │ QR Bank│ │ MoMo   │ │ ZaloPay│ │ PayPal │              │
│  └────────┘ └────────┘ └────────┘ └────────┘              │
│                                                             │
│        [        TIẾN HÀNH CÚNG DƯỜNG        ]              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  FOOTER                                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. NỘI DUNG CẦN CHUẨN BỊ

### 5.1 Content từ Chi nhánh

| Nội dung | Trách nhiệm | Trạng thái |
|----------|-------------|------------|
| Lịch sử chi nhánh (chi tiết) | Chi nhánh cung cấp | [ ] Chưa có |
| Tiểu sử Thầy trụ trì | Chi nhánh cung cấp | [ ] Chưa có |
| Danh sách lễ hội trong năm | Chi nhánh cung cấp | [ ] Chưa có |
| Ảnh chất lượng cao | Chụp mới/Collect | [ ] Cần chụp |
| Video giới thiệu | Quay mới | [ ] Chưa có |
| Kinh sách PDF | Số hóa | [ ] Chưa có |
| Thông tin liên hệ chính thức | Chi nhánh cung cấp | [ ] Chưa có |
| Thông tin ngân hàng thanh toán | Chi nhánh cung cấp | [ ] Chưa có |

### 5.2 Ảnh cần chụp

- [ ] Toàn cảnh chi nhánh (drone nếu có)
- [ ] Chánh điện (ngoài + trong)
- [ ] Nhà Sala
- [ ] Chi tiết: Rắn Naga, mái chóp, họa tiết
- [ ] Tháp cốt
- [ ] Khuôn viên, cây xanh
- [ ] Lễ hội (chờ đến mùa)
- [ ] Chư tăng (nếu được phép)
