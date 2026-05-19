# 🎨 THIẾT KẾ UI/UX - BẢN SẮC KHMER

> **Nguyên tắc:** Hiện đại nhưng đậm chất di sản Khmer Nam tông

---

## 1. BẢNG MÀU (COLOR PALETTE)

### 1.1 Màu chính (Primary)

| Tên | Hex | Ý nghĩa | Sử dụng |
|-----|-----|---------|---------|
| **Vàng Hoàng Kim** | `#FFD700` | Trí tuệ, giác ngộ | CTA buttons, icons, highlights |
| **Cam Cà Sa** | `#FF8C00` | Màu áo chư tăng | Headers, accents |
| **Đỏ Sẫm** | `#8B0000` | Trang nghiêm | Borders, dividers |

### 1.2 Màu phụ (Secondary)

| Tên | Hex | Sử dụng |
|-----|-----|---------|
| **Xanh Ngọc** | `#20B2AA` | Accent nhẹ, links |
| **Trắng Ngà** | `#FFFFF0` | Background chính |
| **Xám Nhạt** | `#F5F5F5` | Cards, sections |
| **Nâu Gỗ** | `#8B4513` | Text headings |

### 1.3 CSS Variables

```css
:root {
  /* Primary */
  --gold-primary: #FFD700;
  --gold-dark: #DAA520;
  --orange-saffron: #FF8C00;
  --red-sacred: #8B0000;
  
  /* Secondary */
  --teal-accent: #20B2AA;
  --ivory-bg: #FFFFF0;
  --gray-light: #F5F5F5;
  --brown-wood: #8B4513;
  
  /* Text */
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-muted: #999999;
  
  /* Shadows */
  --shadow-soft: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-gold: 0 4px 15px rgba(255,215,0,0.3);
}
```

---

## 2. TYPOGRAPHY - HỆ THỐNG FONT

### 2.1 Font chữ đề xuất

| Ngôn ngữ | Font Tiêu đề | Font Nội dung | Nguồn |
|----------|--------------|---------------|-------|
| **Tiếng Khmer** | Khmer OS Muol | Kantumruy Pro | Google Fonts |
| **Tiếng Việt** | Playfair Display | Roboto/Inter | Google Fonts |
| **Tiếng Anh** | Playfair Display | Inter | Google Fonts |

### 2.2 Import Fonts

```css
/* Google Fonts Import */
@import url('https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
```

### 2.3 Typography Scale

```
H1: 48px / 56px line-height (Playfair Display Bold)
H2: 36px / 44px line-height (Playfair Display SemiBold)
H3: 28px / 36px line-height (Playfair Display Medium)
H4: 24px / 32px line-height (Inter SemiBold)
H5: 20px / 28px line-height (Inter Medium)
Body: 16px / 24px line-height (Inter Regular)
Small: 14px / 20px line-height (Inter Regular)
Caption: 12px / 16px line-height (Inter Regular)
```

---

## 3. ICONOGRAPHY - BIỂU TƯỢNG KHMER

### 3.1 Icons Custom thiết kế

| Biểu tượng | Ứng dụng | Mô tả |
|------------|----------|-------|
| **Rắn Naga** | Dividers, decorations | 5 hoặc 7 đầu, vector |
| **Hoa Sen** | Icons, backgrounds | Style line art |
| **Bánh xe Pháp** | Menu "Giáo lý" | 8 nan, tối giản |
| **Mái chi nhánh Khmer** | Logo, header | Đỉnh nhọn đặc trưng |
| **Chim Garuda** | Decorative | Biểu tượng sức mạnh |
| **Hoa văn Pnhi-Phlerng** | Borders, corners | Họa tiết ngọn lửa |

### 3.2 Icon Library bổ sung

```
Sử dụng: Lucide Icons (MIT License)
- Phong cách: Line icons, stroke 1.5-2px
- Kích thước: 20px, 24px, 32px
- Màu: Inherit từ parent
```

---

## 4. LAYOUT & SPACING

### 4.1 Grid System

```
Container: max-width 1280px, padding 0 24px
Columns: 12-column grid
Gutter: 24px (desktop), 16px (mobile)
Breakpoints:
  - Desktop: >= 1024px
  - Tablet: 768px - 1023px
  - Mobile: < 768px
```

### 4.2 Spacing Scale

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;
--space-7: 48px;
--space-8: 64px;
--space-9: 96px;
```

---

## 5. COMPONENTS - THÀNH PHẦN UI

### 5.1 Buttons

```
Primary Button:
  - Background: var(--gold-primary)
  - Text: #333333
  - Border-radius: 8px
  - Padding: 12px 24px
  - Hover: var(--gold-dark)
  - Shadow: var(--shadow-gold)

Secondary Button:
  - Background: transparent
  - Border: 2px solid var(--orange-saffron)
  - Text: var(--orange-saffron)
  - Hover: background var(--orange-saffron), text white
```

### 5.2 Cards

```
Card Standard:
  - Background: white
  - Border-radius: 12px
  - Shadow: var(--shadow-soft)
  - Padding: 24px
  - Border-top: 4px solid var(--gold-primary) (optional)
```

### 5.3 Navigation

```
Header:
  - Height: 80px (desktop), 64px (mobile)
  - Background: white với subtle shadow
  - Logo bên trái
  - Menu center
  - Language switcher + CTA bên phải

Mobile Navigation:
  - Hamburger menu
  - Full-screen overlay
  - Slide from right
```

---

## 6. WIREFRAME TRANG CHỦ

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER                                                     │
│  [Logo]     [Menu: Giới thiệu | Tin tức | Thư viện | ...]  │
│                                        [🌐 VN ▼] [Thanh toán]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │              HERO SECTION                           │   │
│  │         Video/Image Background                      │   │
│  │                                                      │   │
│  │         "Chi nhánh Chantarangsay"                        │   │
│  │         "Ánh Trăng Giữa Lòng Sài Gòn"              │   │
│  │                                                      │   │
│  │    [Tham quan ảo]  [Lịch lễ hôm nay]               │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  QUICK ACCESS                                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ 📅      │  │ 🙏      │  │ 📰      │  │ 📸      │        │
│  │Lịch lễ  │  │Cúng     │  │Tin tức  │  │Thư viện │        │
│  │         │  │dường    │  │         │  │ảnh      │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
├─────────────────────────────────────────────────────────────┤
│  SỰ KIỆN SẮP TỚI                                           │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ [Hình]           │  │ [Hình]           │                │
│  │ Tết Chol Chnam   │  │ Lễ Cầu Siêu      │                │
│  │ 14/04/2026       │  │ 20/04/2026       │                │
│  └──────────────────┘  └──────────────────┘                │
├─────────────────────────────────────────────────────────────┤
│  FOOTER                                                     │
│  [Logo] [Địa chỉ] [Liên hệ] [Social] [Bản đồ]              │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. RESPONSIVE DESIGN

### 7.1 Mobile-First Approach

```
1. Thiết kế mobile trước (320px - 375px)
2. Scale up cho tablet (768px)
3. Full features cho desktop (1024px+)
4. Large screen optimization (1440px+)
```

### 7.2 Touch-Friendly

```
- Minimum touch target: 44px x 44px
- Spacing giữa interactive elements: >= 8px
- Font size minimum: 16px (tránh zoom iOS)
- Scroll horizontal: KHÔNG
```

---

## 8. ACCESSIBILITY

### 8.1 WCAG 2.1 AA Compliance

- [ ] Contrast ratio >= 4.5:1 cho text
- [ ] Contrast ratio >= 3:1 cho UI components
- [ ] Alt text cho tất cả images
- [ ] Keyboard navigation support
- [ ] Focus indicators visible
- [ ] Skip to content link

### 8.2 Đặc thù cho người cao tuổi

```
- Font size có thể tăng (không dùng px cố định)
- Button size lớn hơn standard
- Màu sắc tương phản cao
- Ngôn ngữ đơn giản, rõ ràng
```
