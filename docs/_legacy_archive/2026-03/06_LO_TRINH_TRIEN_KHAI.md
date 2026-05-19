# 📅 LỘ TRÌNH TRIỂN KHAI DỰ ÁN

> **Timeline chi tiết từng phase của dự án**

---

## 1. TỔNG QUAN LỘ TRÌNH

```
┌──────────────────────────────────────────────────────────────────────┐
│                    LỘ TRÌNH TRIỂN KHAI - 16 TUẦN                     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  PHASE 0        PHASE 1         PHASE 2         PHASE 3              │
│  Chuẩn bị       Foundation      Core Features   Launch               │
│  (2 tuần)       (4 tuần)        (8 tuần)        (2 tuần)             │
│                                                                       │
│  ┌────┐        ┌────────┐       ┌────────────┐  ┌────┐               │
│  │ W1 │────────▶│ W3-W6  │──────▶│  W7-W14   │──▶│W15 │              │
│  │ W2 │        │        │       │            │  │W16 │              │
│  └────┘        └────────┘       └────────────┘  └────┘               │
│   ▼              ▼                 ▼              ▼                  │
│  Setup         UI/UX            Features       Testing               │
│  Planning      Base Code        Payment        Deploy                │
│  Content       Database         Content        Go Live               │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. PHASE 0: CHUẨN BỊ (TUẦN 1-2)

### Mục tiêu
Thiết lập môi trường, thu thập yêu cầu, chuẩn bị tài nguyên

### Checklist

**Tuần 1: Setup & Thiết kế**
- [ ] Đăng ký domain: `chantarangsay.org` hoặc `chuachantarangsay.org`
- [ ] Tạo Supabase project
- [ ] Setup Vercel account
- [ ] Khởi tạo Next.js project
- [ ] Cấu hình Git repository
- [ ] Thiết kế logo (nếu chưa có)
- [ ] Finalize color palette
- [ ] Chọn & test Khmer fonts

**Tuần 2: Content Planning**
- [ ] Họp với đại diện chi nhánh lấy yêu cầu chi tiết
- [ ] Thu thập nội dung: lịch sử, ảnh, video hiện có
- [ ] Lên danh sách ảnh cần chụp mới
- [ ] Xác nhận thông tin ngân hàng thanh toán
- [ ] Viết nội dung trang "Giới thiệu" (draft)
- [ ] Lên lịch các lễ trong năm 2026

### Deliverables
- [x] Báo cáo phân tích (tài liệu này)
- [ ] Project repository initialized
- [ ] Supabase project ready
- [ ] Content brief từ chi nhánh

---

## 3. PHASE 1: FOUNDATION (TUẦN 3-6)

### Mục tiêu
Xây dựng nền tảng UI/UX, database, authentication

### Chi tiết công việc

**Tuần 3: UI Foundation**
```
├── Setup Tailwind CSS với custom theme
├── Tạo design system components (shadcn/ui)
│   ├── Button variants
│   ├── Card components
│   ├── Form inputs
│   └── Typography
├── Implement Khmer patterns/decorations
└── Build Header & Footer components
```

**Tuần 4: Layout & Navigation**
```
├── Implement i18n (next-intl)
│   ├── Language routing
│   ├── Translation files structure
│   └── Language switcher
├── Build responsive navigation
├── Create page layouts
└── Setup meta tags & SEO base
```

**Tuần 5: Database & Auth**
```
├── Create Supabase migrations
│   ├── Categories table
│   ├── News table
│   ├── Events table
│   ├── Media table
│   └── Audit logs table
├── Setup RLS policies
├── Implement Supabase Auth
└── Create admin login flow
```

**Tuần 6: Admin Panel Base**
```
├── Admin dashboard layout
├── Authentication middleware
├── Basic CRUD for News
├── Image upload to Supabase Storage
└── Role-based access control
```

### Deliverables
- [ ] Design system documented
- [ ] Multi-language routing working
- [ ] Database schema deployed
- [ ] Admin login functional
- [ ] News CRUD complete

---

## 4. PHASE 2: CORE FEATURES (TUẦN 7-14)

### Sprint 1: Content Management (Tuần 7-8)

**Tuần 7: News & Events**
```
├── News listing page (public)
├── News detail page
├── Events calendar component
├── Event detail page
├── Admin: Event management
└── Event registration form
```

**Tuần 8: Media Library**
```
├── Gallery component with lightbox
├── Video embed component
├── Audio player component
├── Document viewer
├── Admin: Media upload management
└── Filter by category/year/event
```

### Sprint 2: Interactive Features (Tuần 9-10)

**Tuần 9: Registration System**
```
├── Multi-step registration form
│   ├── Step 1: Choose ceremony type
│   ├── Step 2: Personal info
│   ├── Step 3: Details
│   └── Step 4: Confirmation
├── Email notification (SendGrid/Resend)
├── Admin: View registrations
└── Registration status management
```

**Tuần 10: Transaction System**
```
├── Transaction page UI
├── Purpose selection
├── Amount input with presets
├── VietQR integration
├── MoMo payment gateway
├── Webhook handling
├── Thank you page
└── Admin: Transaction reports
```

### Sprint 3: Static Pages & SEO (Tuần 11-12)

**Tuần 11: Static Pages**
```
├── About page (History)
├── Architecture page
├── Buddhist teachings page
├── Khmer customs page
├── Leadership page
├── Contact page with form
└── Google Maps integration
```

**Tuần 12: SEO & Performance**
```
├── Structured data (JSON-LD)
├── Open Graph images
├── Sitemap.xml generation
├── robots.txt
├── Image optimization
├── Core Web Vitals optimization
└── Analytics setup (GA4)
```

### Sprint 4: Polish & Content (Tuần 13-14)

**Tuần 13: Content Entry**
```
├── Enter all static page content (3 languages)
├── Upload initial media library
├── Create sample news articles
├── Add upcoming events
├── Test all forms thoroughly
└── Cross-browser testing
```

**Tuần 14: Final Polish**
```
├── UI/UX refinements
├── Mobile testing on real devices
├── Accessibility audit
├── Performance testing
├── Security audit
└── Bug fixes
```

### Deliverables
- [ ] All public pages complete
- [ ] Registration system working
- [ ] Transaction with payment working
- [ ] Content entered (3 languages)
- [ ] SEO optimized

---

## 5. PHASE 3: LAUNCH (TUẦN 15-16)

### Tuần 15: Pre-launch

**Testing**
```
├── User Acceptance Testing (UAT) với đại diện chi nhánh
├── Payment gateway production test
├── Email delivery test
├── Load testing
├── Security penetration test
└── Backup & restore test
```

**Documentation**
```
├── Admin user guide
├── Content management guide
├── FAQ for common operations
└── Emergency contact list
```

### Tuần 16: Go Live

**Deployment**
```
├── Production environment setup
├── Domain DNS configuration
├── SSL certificate verify
├── Final data migration
├── Go live!
└── Monitor for issues
```

**Post-launch**
```
├── 24/7 monitoring first week
├── Collect feedback
├── Quick fixes if needed
├── Training session for admin team
└── Handover documentation
```

---

## 6. CHECKLIST TỔNG HỢP

### Phase 0: Chuẩn bị
- [ ] Domain registered
- [ ] Supabase setup
- [ ] Git repository
- [ ] Design assets ready
- [ ] Content collected

### Phase 1: Foundation
- [ ] Next.js project scaffolded
- [ ] UI components library
- [ ] i18n working
- [ ] Database deployed
- [ ] Admin auth working

### Phase 2: Features
- [ ] News system complete
- [ ] Events system complete
- [ ] Media library complete
- [ ] Registration form working
- [ ] Transaction payment working
- [ ] Contact form working
- [ ] All static pages
- [ ] SEO implemented
- [ ] Content entered

### Phase 3: Launch
- [ ] UAT passed
- [ ] Production deployed
- [ ] DNS configured
- [ ] SSL verified
- [ ] Go live approved
- [ ] Admin trained

---

## 7. NGUỒN LỰC CẦN THIẾT

### Team

| Vai trò | Số lượng | Công việc chính |
|---------|----------|-----------------|
| **Full-stack Developer** | 1 | Code frontend, backend, integrations |
| **UI/UX Designer** | 1 (part-time) | Design system, custom illustrations |
| **Content Manager** | 1 | Viết/dịch nội dung, upload media |
| **Project Manager** | 1 (part-time) | Coordination với chi nhánh |

### Công cụ

| Tool | Mục đích | Chi phí |
|------|----------|---------|
| Supabase | Database, Auth, Storage | Free tier |
| Vercel | Hosting | Free tier |
| GitHub | Code repository | Free |
| Figma | Design | Free |
| SendGrid | Email | Free tier |
| Cloudinary | Image CDN | Free tier |

### Ước tính Chi phí

| Hạng mục | Chi phí/năm |
|----------|-------------|
| Domain (.org) | ~$15 |
| Supabase Pro (nếu scale) | ~$25/tháng |
| Vercel Pro (nếu cần) | ~$20/tháng |
| **Tổng (minimum)** | **~$15/năm** |
| **Tổng (scaled)** | **~$540/năm** |

---

## 8. RỦI RO VÀ GIẢM THIỂU

| Rủi ro | Xác suất | Tác động | Giảm thiểu |
|--------|----------|----------|------------|
| Chậm nhận content từ chi nhánh | Cao | Cao | Buffer time 2 tuần |
| Payment gateway delay | Trung bình | Cao | Đăng ký sớm, test kỹ |
| Khmer font issues | Trung bình | Trung bình | Test sớm trên nhiều devices |
| Scope creep | Cao | Trung bình | Document changes, say no |
| Technical debt | Trung bình | Thấp | Code review, refactor time |

---

## 9. TIẾP THEO

Sau khi hoàn thành Phase 1-3, các tính năng Phase 2 (SHOULD-HAVE) có thể được triển khai:

- Widget Lịch Khmer
- Audio player nâng cao
- Newsletter system
- Full-text search
- User accounts
- PWA support

Và Phase 3 (NICE-TO-HAVE) cho tương lai:
- Tour ảo 360°
- Live streaming
- AI Chatbot
- E-learning tiếng Khmer
