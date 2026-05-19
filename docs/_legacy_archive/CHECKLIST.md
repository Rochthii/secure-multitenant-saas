# ✅ CHECKLIST HOÀN THÀNH DỰ ÁN

> **Sử dụng file này để theo dõi tiến độ khi thực hiện dự án**

---

## 📋 PHASE 0: CỰU CHUẨN BỊ

### Tài khoản & Dịch vụ
- [ ] Đăng ký Supabase account (supabase.com)
- [ ] Đăng ký Vercel account (vercel.com)
- [ ] Tạo GitHub repository
- [ ] Đăng ký domain (hoặc dùng .vercel.app tạm)

### Môi trường
- [ ] Cài Node.js >= 18
- [ ] Cài Git
- [ ] Cài VS Code / Cursor
- [ ] Cài pnpm hoặc npm

### Nội dung
- [ ] Thu thập ảnh chi nhánh (ít nhất 10 ảnh)
- [ ] Viết lịch sử chi nhánh (tiếng Việt)
- [ ] Danh sách lễ hội 2026
- [ ] Thông tin tài khoản ngân hàng thanh toán
- [ ] Logo chi nhánh (nếu có)

---

## 💻 PHASE 1: FOUNDATION

### Prompt 01: Setup Project (30-45 phút) ✅ COMPLETE
- [x] Chạy `npx create-next-app@latest`
- [x] Cài đặt dependencies (Supabase, next-intl, Zod, etc)
- [x] Tạo folder structure
- [x] Config Tailwind với Khmer colors
- [x] Setup next-intl (3 ngôn ngữ: vi, km, en)
- [x] Tạo Supabase clients (browser & server)
- [x] **Test:** `npm run dev` chạy được ở /vi, /km, /en

### Prompt 02: Design System (2-3 giờ) ✅ COMPLETE
- [x] Install shadcn/ui
- [x] Add components: button, card, input, etc
- [x] Update globals.css với Khmer palette
- [x] Tạo KhmerHeading component
- [x] Tạo IconCard component
- [x] Tạo GoldButton component
- [x] Tạo Header component (logo, nav, language switcher)
- [x] Tạo Footer component
- [x] **Test:** Header/Footer hiển thị, responsive mobile

### Prompt 03: Database Setup (1-2 giờ) ✅ COMPLETE
- [x] Login Supabase CLI
- [x] Tạo migration file
- [x] Tạo tất cả tables (categories, news, events, transactions, media, pages)
- [x] Enable RLS policies
- [x] Create indexes
- [x] Seed initial data (categories)
- [x] Generate TypeScript types
- [x] **Test:** Connect từ Next.js, query data thành công

---

## 🎨 PHASE 2: PAGES

### Prompt 04: Homepage (2-3 giờ)
- [ ] Tạo HeroSection component
- [ ] Tạo QuickAccessSection (4 cards)
- [ ] Tạo UpcomingEventsSection (fetch Supabase)
- [ ] Tạo LatestNewsSection (fetch Supabase)
- [ ] Update translations (vi/km/en)
- [ ] **Test:** Trang chủ hiển thị đẹp, fetch data thành công

### Prompt 05: Static Pages (2-3 giờ)
- [ ] About page với timeline
- [ ] Contact page với form
- [ ] Architecture page với grid
- [ ] Form validation (Zod)
- [ ] Submit to Supabase contact_messages
- [ ] **Test:** Form submit thành công, data vào DB

### Prompt 06: News Pages (2-3 giờ)
- [ ] News listing page với pagination
- [ ] Filter by category
- [ ] News detail page
- [ ] Related news sidebar
- [ ] **Test:** Listing hiển thị, detail page hoạt động

### Prompt 07: Events & Calendar (3-4 giờ)
- [ ] Install react-big-calendar
- [ ] Tạo calendar view
- [ ] Event list view
- [ ] Event detail page
- [ ] Filter upcoming/past
- [ ] **Test:** Calendar hiển thị, click event → detail

---

## 🔧 PHASE 3: FEATURES

### Prompt 08: Event Registration (2-3 giờ)
- [ ] Multi-step form (loại lễ, thông tin, chi tiết, xác nhận)
- [ ] Validation (Zod)
- [ ] Save to event_registrations
- [ ] Email confirmation
- [ ] **Test:** Đăng ký → nhận email → data vào DB

### Prompt 09: Transaction System (4-6 giờ) ⭐
- [x] Transaction purpose selector (4 quỹ)
- [x] Progress bars
- [x] Amount selection (preset + custom)
- [x] Donor info form
- [x] Payment method selection
- [x] VietQR integration (generate QR)
- [x] Save to transactions table
- [x] Payment confirmation page
- [x] Recent transactions display (với anonymous)
- [x] **Test:** Toàn bộ flow → QR code hiển thị đúng

### Prompt 10: Media Gallery (2-3 giờ)
- [ ] Tabs: Ảnh, Video, Audio, PDF
- [ ] Masonry grid cho ảnh
- [ ] Lightbox (yet-another-react-lightbox)
- [ ] YouTube embed cho video
- [ ] Custom audio player
- [ ] Filter by event/year/tags
- [ ] **Test:** All media types hiển thị, lightbox hoạt động

---

## 👨‍💼 PHASE 4: ADMIN

### Prompt 11: Admin Dashboard (6-8 giờ)
- [ ] Middleware check admin role
- [ ] Admin layout với sidebar
- [ ] Dashboard page (statistics)
- [ ] News CRUD (với Tiptap editor)
- [ ] Events CRUD
- [ ] Media management (upload to Supabase Storage)
- [ ] View registrations
- [x] View transactions (Centralized Global Management)
- [ ] **Test:** Admin login, tất cả CRUD hoạt động

---

## 🚀 PHASE 5: POLISH & LAUNCH

### Prompt 12: SEO Optimization (1-2 giờ)
- [ ] Dynamic meta tags
- [ ] sitemap.xml
- [ ] robots.txt
- [ ] JSON-LD structured data
- [ ] Open Graph images
- [ ] Performance optimization
- [ ] **Test:** Google Lighthouse score > 90

### Prompt 13: Deployment (1 giờ)
- [ ] Push code to GitHub
- [ ] Connect Vercel
- [ ] Add environment variables
- [ ] Deploy to production
- [ ] Configure custom domain
- [ ] Enable Vercel Analytics
- [ ] **Test:** Site live, không có errors

---

## 🎉 POST-LAUNCH

### Content Entry
- [ ] Upload tất cả ảnh chi nhánh
- [ ] Nhập nội dung tiếng Việt
- [ ] Dịch sang tiếng Khmer
- [ ] Dịch sang tiếng Anh
- [ ] Tạo 10+ tin tức mẫu
- [ ] Nhập lịch sự kiện 2026

### Testing
- [ ] Test trên Chrome, Firefox, Safari
- [ ] Test trên iPhone
- [ ] Test trên Android
- [ ] Test form submissions
- [ ] Test payment flow (sandbox)
- [ ] UAT với đại diện chi nhánh

### Training
- [ ] Viết hướng dẫn sử dụng admin
- [ ] Train nhân viên quản lý content
- [ ] Train nhân viên xử lý đơn đăng ký

### Monitoring
- [ ] Setup error monitoring (Sentry)
- [ ] Setup analytics (GA4)
- [ ] Monitor performance
- [ ] Collect user feedback

---

## 📊 PROGRESS TRACKER

```
Foundation:  [x] [x] [x]        3/3    (Prompts 01-03) ✅ FOUNDATION COMPLETE!
Pages:       [x] [x] [x] [x]    4/4    (Prompts 04-07) ✅ PAGES COMPLETE!
Features:    [x] [x] [x]        3/3    (Prompts 08-10) ✅ FEATURES COMPLETE!
Admin:       [/]                0/1    (Prompt 11) - IN PROGRESS (Dashboard, Finance Center)
Launch:      [ ] [ ]            0/2    (Prompts 12-13)

TOTAL:                          10/13   (77%)
```

---

## 🏆 MILESTONES

- [ ] **Week 1 Complete:** Foundation done, site running
- [ ] **Week 2 Complete:** All pages done
- [ ] **Week 3 Complete:** Core features working
- [ ] **Week 4 Complete:** Admin panel functional
- [ ] **Week 6 Complete:** PRODUCTION LAUNCH! 🎉

---

## 💡 NOTES

**Tips:**
- Làm đúng thứ tự prompts
- Test sau mỗi prompt
- Commit code thường xuyên
- Đừng skip validation
- Hỏi khi không rõ

**Common Issues:**
- Supabase RLS block queries → Check policies
- Images không load → Check Supabase Storage permissions
- i18n không work → Check locale routing
- Deploy fail → Check environment variables

---

**Good luck! 🚀**
