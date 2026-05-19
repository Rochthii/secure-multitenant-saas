# 🎯 KẾ HOẠCH CẢI TIẾN WEBSITE CHÙA CHANTARANGSAY
## Dựa trên Báo cáo Kiểm toán Chuyên gia

**Ngày lập:** 04/02/2026  
**Người thực hiện:** Development Team  
**Dựa trên:** BAO_CAO_KIEM_TOAN_DU_AN.md

---

## 🔴 ƯU TIÊN 1: KHẨN CẤP (Trước khi Go-live)

### 1.1 ✅ Rate Limiting API Routes
**Thời gian:** 2-4 giờ  
**Lý do:** Bảo mật, chống API abuse

**Công việc:**
- [ ] Cài đặt `next-rate-limit` hoặc `@upstash/ratelimit`
- [ ] Áp dụng rate limiting cho:
  - `/api/transactions/*` - 10 requests/minute
  - `/api/events/register` - 5 requests/minute
  - `/api/contact` - 3 requests/minute
- [ ] Thêm error handling cho rate limit exceeded
- [ ] Test với curl/Postman

**File cần sửa:**
- `app/api/*/route.ts` (tất cả API routes)
- `lib/rate-limit.ts` (tạo mới)

---

### 1.2 ✅ Xóa Code Django Legacy
**Thời gian:** 30 phút  
**Lý do:** Dọn dẹp code không dùng

**Công việc:**
- [ ] Xóa toàn bộ thư mục `cms_backend/`
- [ ] Xóa `RUN_DJANGO_ADMIN.bat`
- [ ] Cập nhật `.gitignore` nếu cần
- [ ] Cập nhật README.md (xóa phần Django)

---

### 1.3 ✅ Regenerate TypeScript Types
**Thời gian:** 15 phút  
**Lý do:** Đồng bộ types với database schema mới nhất

**Công việc:**
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
```
- [ ] Chạy lệnh gen types
- [ ] Kiểm tra `@ts-ignore` comments
- [ ] Fix type errors nếu có
- [ ] Test build: `npm run build`

---

### 1.4 ✅ Xác minh Thông tin với Ban Quản trị
**Thời gian:** 1-2 ngày  
**Lý do:** Đảm bảo thông tin chính xác 100%

**Checklist xác minh:**
- [ ] **Tài khoản quyên góp:**
  - Số tài khoản ngân hàng
  - Tên chủ tài khoản
  - Ngân hàng
  - Mã QR MoMo (nếu có)
- [ ] **Thông tin liên hệ:**
  - Số điện thoại chính xác
  - Email chính thức
  - Giờ mở cửa
- [ ] **Lịch sử:**
  - Xác nhận lại các mốc: 1946, 1949, 1953
  - Thông tin về Đại đức Lâm Em
  - Thông tin về Hòa thượng Danh Lung
- [ ] **Hình ảnh:**
  - Quyền sử dụng hình ảnh
  - Chú thích hình ảnh chính xác

---

### 1.5 ✅ Lighthouse Audit
**Thời gian:** 2 giờ  
**Lý do:** Đảm bảo performance > 90

**Công việc:**
```bash
npm run build
npm start
# Mở Chrome DevTools > Lighthouse
```
- [ ] Chạy Lighthouse cho:
  - Homepage (/)
  - Tin tức (/tin-tuc)
  - Sự kiện (/lich-le)
  - Thanh toán (/cung-duong)
- [ ] Target scores:
  - Performance: > 90
  - Accessibility: > 95
  - Best Practices: > 95
  - SEO: > 95
- [ ] Fix issues nếu điểm thấp

---

### 1.6 ✅ Production Environment Variables
**Thời gian:** 1 giờ  
**Lý do:** Cấu hình production đúng

**File:** `.env.production`
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=your-auth-token

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Site
NEXT_PUBLIC_SITE_URL=https://chantarangsay.vn
```

- [ ] Tạo file `.env.production`
- [ ] Cấu hình trên Vercel/hosting
- [ ] Test với `npm run build`
- [ ] Không commit secrets vào Git!

---

## 🟡 ƯU TIÊN 2: TÁC ĐỘNG CAO (Sau Go-live 1-4 tuần)

### 2.1 📝 Storytelling Content - Viết lại "Giới thiệu"
**Thời gian:** 1 ngày  
**Tác động:** Cao - Tăng emotional connection

**Nội dung mới (đã draft):**
```json
{
  "intro": {
    "title": "Chi nhánh Chantarangsay - Ánh Trăng Giữa Lòng Sài Gòn",
    "subtitle": "ចន្ទរង្សី (Candaraṅsī) - GIỚI THIỆU",
    "description": "Từ năm 1946, giữa lòng Sài Gòn đang còn hoang vắng, 
                    Đại đức Lâm Em - một vị sư người Khmer quê Sóc Trăng, 
                    từng là Hiệu trưởng trường Phật học Phnôm Pênh - đã dựng lên 
                    một căn nhà sàn đơn giản bên bờ kênh Nhiêu Lộc - Thị Nghè. 
                    Đó là khởi đầu của Chi nhánh Chantarangsay (ចន្ទរង្សី - \"Ánh Trăng\"), 
                    nơi trú ngụ cho các sư sãi và cộng đồng người Khmer đang tránh chiến tranh.
                    
                    Sau 78 năm (1946-2024), từ căn nhà sàn khiêm tốn, ngôi chi nhánh đã trở thành 
                    di sản kiến trúc độc đáo với diện tích 4.500m², chánh điện hai tầng hướng Đông, 
                    mái ba tầng với ba ngọn tháp Tam Bảo, và những bức tranh khắc nổi kể về 
                    hành trình tu tập của Đức Phật Thích Ca Mâu Ni.
                    
                    Chi nhánh Chantarangsay không chỉ là chốn tâm linh thanh tịnh, mà còn là 
                    trung tâm văn hóa với các lớp dạy chữ Khmer miễn phí, là biểu tượng của 
                    sự đoàn kết cộng đồng người Khmer tại TP. Hồ Chí Minh. Đây là nơi 
                    \"Ánh Trăng\" của giác ngộ vẫn chiếu sáng qua bao thế hệ."
  }
}
```

**File cần sửa:**
- [ ] `messages/vi.json`
- [ ] `messages/km.json` (dịch Khmer)
- [ ] `messages/en.json` (dịch Anh)
- [ ] `components/sections/HomeIntroSection.tsx` (nếu cần adjust layout)

---

### 2.2 🎨 Tăng Size Date Badges
**Thời gian:** 2 giờ  
**Tác động:** Trung bình - Cải thiện visual hierarchy

**Công việc:**
- [ ] Mobile: Tăng từ `text-sm` → `text-base`
- [ ] Desktop: Tăng từ `text-base` → `text-lg`
- [ ] Thêm hover animation: `hover:scale-110 transition-transform`

**File cần sửa:**
- `components/news/news-card.tsx`
- `components/events/event-card.tsx`
- `components/sections/LatestNewsSection.tsx`

---

### 2.3 💾 Auto Backup Hàng ngày
**Thời gian:** 3 giờ  
**Tác động:** Cao - Data safety

**Options:**
1. **Supabase Backup (Recommended)**
   - Tự động daily backup trên Supabase (Pro plan)
   - Restore dễ dàng

2. **Custom Script (Nếu cần)**
```typescript
// scripts/backup-database.ts
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabase = createClient(...)

async function backupDatabase() {
  const tables = ['news', 'events', 'transactions', 'profiles']
  
  for (const table of tables) {
    const { data } = await supabase.from(table).select('*')
    fs.writeFileSync(
      `backups/${table}-${new Date().toISOString()}.json`,
      JSON.stringify(data, null, 2)
    )
  }
}
```

- [ ] Setup backup script
- [ ] Schedule với cron job hoặc Vercel Cron
- [ ] Test restore process
- [ ] Document backup/restore procedure

---

### 2.4 🔍 Admin UX: Search & Filter
**Thời gian:** 3 ngày  
**Tác động:** Cao - Admin experience

**Tính năng:**
- [ ] **Search bar** trong các admin tables:
  - News: Search by title, content
  - Events: Search by name, date
  - Users: Search by email, name
- [ ] **Filters:**
  - Status: Draft, Published, Archived
  - Date range
  - Category
- [ ] **Sort:**
  - Created date (newest/oldest)
  - Title (A-Z)
  - Views, Registrations

**File cần sửa:**
- `app/admin/news/page.tsx`
- `app/admin/events/page.tsx`
- `components/admin/data-table.tsx` (tạo reusable component)

---

### 2.5 📸 Multi-file Upload
**Thời gian:** 2 ngày  
**Tác động:** Trung bình - Admin productivity

**Công việc:**
- [ ] Cài đặt `react-dropzone`
- [ ] Cho phép upload nhiều ảnh cùng lúc
- [ ] Progress bar cho từng file
- [ ] Preview thumbnails
- [ ] Drag & drop

**File cần sửa:**
- `components/admin/media-uploader.tsx` (tạo mới)
- `app/admin/media/page.tsx`
- `components/admin/image-picker.tsx`

---

### 2.6 📚 Training Cho Ban Quản trị
**Thời gian:** 2 ngày (1 ngày chuẩn bị + 1 ngày training)  
**Tác động:** Cao - Adoption success

**Nội dung training:**
1. **Session 1: Cơ bản (2 giờ)**
   - Đăng nhập admin
   - Dashboard overview
   - Đăng tin tức mới
   - Upload hình ảnh
   - Quản lý sự kiện

2. **Session 2: Nâng cao (1.5 giờ)**
   - Workflow phê duyệt
   - Quản lý đăng ký
   - Theo dõi quyên góp
   - Analytics cơ bản

3. **Tài liệu:**
   - [ ] Viết user guide (PDF/video)
   - [ ] Screenshots cho mỗi bước
   - [ ] FAQ thường gặp
   - [ ] Video hướng dẫn (Loom/YouTube)

**Deliverables:**
- [ ] `docs/USER_GUIDE_ADMIN.md`
- [ ] `docs/FAQ_ADMIN.md`
- [ ] Video tutorials (5-10 phút mỗi video)

---

### 2.7 🔔 Sentry Alerting
**Thời gian:** 1 ngày  
**Tác động:** Trung bình - Monitoring

**Công việc:**
- [ ] Cấu hình Sentry alerts cho:
  - Error rate > 1% (email ngay lập tức)
  - 404 errors spike
  - API response time > 3s
- [ ] Slack/Email integration
- [ ] Assign team members

---

## 🟢 ƯU TIÊN 3: PHÁT TRIỂN CHIẾN LƯỢC (1-6 tháng)

### 3.1 🤖 AI Translation Integration
**Thời gian:** 2 tuần  
**ROI:** Cao - Giảm 80% thời gian dịch

**Tech stack:**
- OpenAI GPT-4 API hoặc Claude API
- Context: Phật giáo Nam tông Khmer

**Features:**
- [ ] Button "Dịch tự động" trong admin
- [ ] Dịch vi → km, vi → en
- [ ] Review & edit sau khi dịch
- [ ] Lưu draft trước khi publish

**File:**
- `lib/ai-translation.ts`
- `app/admin/news/[id]/edit/page.tsx`

---

### 3.2 🌐 Virtual Tour 360°
**Thời gian:** 1 tháng  
**ROI:** Cao - Thu hút du khách

**Tech:**
- Matterport hoặc Ricoh Theta 360
- Three.js hoặc A-Frame.js
- Hotspots với thông tin

**Scope:**
- [ ] Chụp 360° các khu vực:
  - Chánh điện
  - Sân chi nhánh
  - Tháp Cốt
  - Sala
- [ ] Embed vào trang "Kiến trúc"
- [ ] Mobile-friendly

---

### 3.3 💳 International Payment (Stripe)
**Thời gian:** 2 tuần  
**ROI:** Trung bình - Quyên góp quốc tế

**Integration:**
- Stripe Checkout
- Multi-currency: USD, EUR, GBP
- Webhook để track transactions

**File:**
- `app/api/stripe/checkout/route.ts`
- `app/api/stripe/webhook/route.ts`
- `components/transactions/stripe-button.tsx`

---

### 3.4 🎙️ Podcast Platform với RSS
**Thời gian:** 2 tuần  
**ROI:** Trung bình - Reach wider audience

**Features:**
- [ ] RSS feed generator
- [ ] Submit to:
  - Apple Podcasts
  - Spotify
  - Google Podcasts
- [ ] Transcript cho accessibility

---

### 3.5 🤖 AI Chatbot
**Thời gian:** 1 tháng  
**ROI:** Trung bình - Tự động hỗ trợ

**Scope:**
- RAG với nội dung website
- Answer questions về:
  - Lịch lễ
  - Địa chỉ, giờ mở cửa
  - Lịch sử chi nhánh
- Widget góc phải màn hình

---

### 3.6 📱 Progressive Web App (PWA)
**Thời gian:** 1 tuần  
**ROI:** Thấp - Nice to have

**Features:**
- Offline access
- Add to home screen
- Push notifications

---

## 📊 CHECKLIST GO-LIVE

### Trước khi Launch:
- [ ] ✅ Rate limiting deployed
- [ ] ✅ Django code removed
- [ ] ✅ TypeScript types updated
- [ ] ✅ Thông tin quyên góp verified
- [ ] ✅ Lịch sử verified với Wikipedia
- [ ] ✅ Environment variables configured
- [ ] ✅ Lighthouse score > 90
- [ ] ✅ SSL certificate active
- [ ] ✅ DNS configured
- [ ] ✅ Backup tested
- [ ] ✅ Sentry alerts configured
- [ ] ✅ Admin training completed

### Ngay sau Launch:
- [ ] Monitor Sentry errors (first 24h)
- [ ] Monitor Vercel analytics
- [ ] Check mobile responsiveness
- [ ] Test payment flows
- [ ] Test registration flows
- [ ] Gather user feedback

---

## 🎯 METRICS ĐỂ THEO DÕI

| Metric | Target | Tool |
|--------|--------|------|
| Page Load Time | < 2s | Lighthouse, PostHog |
| Lighthouse Score | > 90 | Chrome DevTools |
| Error Rate | < 0.1% | Sentry |
| Uptime | 99.9% | Vercel |
| Test Coverage | > 70% | Vitest |
| Weekly Active Users | Track growth | PostHog |
| Transaction Conversion | Track | PostHog Funnels |
| Event Registration Rate | Track | PostHog |
| Admin Task Time | Reduce 50% | Manual tracking |

---

## 📅 TIMELINE TỔNG THỂ

```
Week 1-2: Ưu tiên 1 (Khẩn cấp)
├─ Rate limiting
├─ Xóa Django
├─ Types update
├─ Xác minh thông tin
└─ Lighthouse audit

Week 3-6: Ưu tiên 2 (Tác động cao)
├─ Storytelling content
├─ Date badges
├─ Auto backup
├─ Admin search/filter
├─ Multi-upload
├─ Training
└─ Sentry alerts

Month 2-6: Ưu tiên 3 (Chiến lược)
├─ AI translation (Month 2)
├─ Virtual tour (Month 3)
├─ Stripe (Month 4)
├─ Podcast (Month 5)
└─ Chatbot (Month 6)
```

---

*Kế hoạch được lập bởi: Development Team*  
*Dựa trên: BAO_CAO_KIEM_TOAN_DU_AN.md*  
*Ngày: 04/02/2026*
