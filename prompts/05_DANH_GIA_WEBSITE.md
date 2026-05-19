# 📋 PROMPT: ĐÁNH GIÁ TOÀN DIỆN WEBSITE CHANTARANGSAY

**Mục đích:** Phân tích chi tiết từng trang, UI/UX, component reusability, và navigation flow của dự án website Chi nhánh Chantarangsay.

---

## 🎯 YÊU CẦU ĐÁNH GIÁ

Hãy phân tích toàn bộ website theo các khía cạnh sau:

### 1. INVENTORY - Danh sách trang hiện có
- Liệt kê tất cả pages trong `app/[locale]/`
- Xác định purpose của từng page
- Đánh giá tính hoàn thiện (content có đủ không)
- Xếp hạng priority (Critical / Important / Nice-to-have)

### 2. UI/UX ANALYSIS - Phân tích giao diện
- Layout consistency (có nhất quán không)
- Visual hierarchy (thứ bậc thông tin rõ ràng không)
- Color scheme usage (màu sắc harmonious không)
- Typography scale (font sizes hợp lý không)
- Spacing & padding (khoảng cách đều đặn không)
- Mobile responsiveness (responsive tốt không)

### 3. COMPONENT REUSABILITY - Tái sử dụng component
- Components nào đang được dùng chung
- Components nào có thể abstract thành reusable
- Patterns lặp lại có thể optimize
- Opportunities để tạo shared components mới

### 4. NAVIGATION FLOW - Luồng điều hướng
- User journey giữa các pages
- Internal linking có hợp lý không
- Breadcrumbs / back navigation
- CTAs lead đến đâu
- Dead ends (trang không có link thoát)

### 5. PERFORMANCE & OPTIMIZATION
- Loading states có đầy đủ không
- Images có optimize không
- Unnecessary re-renders
- Code splitting opportunities

---

## 📄 DANH SÁCH PAGES CẦN ĐÁNH GIÁ

### A. PUBLIC PAGES (Trang công khai)

#### 1. **Homepage** (`/`)
**Routes:** `app/[locale]/page.tsx`

**Đánh giá:**
- [ ] Hero section có hấp dẫn không?
- [ ] Featured content có đủ (news, events)?
- [ ] Quick access navigation rõ ràng không?
- [ ] Call-to-actions hiệu quả không?
- [ ] First impression tốt không?

**Components sử dụng:**
- HeroSection
- QuickAccessSection
- LatestNewsSection
- UpcomingEventsSection

**Cải thiện gợi ý:**
- Cần: Hero image/video background
- Cần: Statistics section (số liệu chi nhánh)
- Cần: Testimonials từ Nhân sự
- Cần: Photo gallery preview

---

#### 2. **Giới thiệu** (`/gioi-thieu`)
**Routes:** `app/[locale]/gioi-thieu/page.tsx`

**Đánh giá:**
- [ ] Có kể câu chuyện về chi nhánh không?
- [ ] Thông tin lịch sử đầy đủ không?
- [ ] Photos của chi nhánh, sư thầy có không?
- [ ] Mission/Vision statement rõ ràng không?

**Components cần:**
- Timeline component (lịch sử)
- Team cards (giới thiệu sư thầy)
- Image gallery
- Stats/achievements

**Liên kết với:**
- Homepage → "Khám phá chi nhánh"
- Footer → About link

---

#### 3. **Tin tức** (`/tin-tuc`)
**Routes:**
- `app/[locale]/tin-tuc/page.tsx` (listing)
- `app/[locale]/tin-tuc/[slug]/page.tsx` (detail)

**Đánh giá:**
- [ ] Grid layout đẹp không?
- [ ] Filters (category) hoạt động tốt không?
- [ ] Pagination/infinite scroll có không?
- [ ] Images thumbnail hiển thị đẹp không?
- [ ] Detail page có share buttons không?

**Components sử dụng:**
- NewsCard
- NewsSkeleton
- Category filters

**Cải thiện:**
- Featured article hero
- Related articles
- Comments section
- Newsletter signup

---

#### 4. **Lịch lễ** (`/lich-le`)
**Routes:**
- `app/[locale]/lich-le/page.tsx` (calendar)
- `app/[locale]/lich-le/[id]/page.tsx` (event detail)

**Đánh giá:**
- [ ] Calendar view vs List view toggle
- [ ] Date filters hoạt động tốt không?
- [ ] Event registration flow smooth không?
- [ ] Past events có lưu trữ không?

**Components sử dụng:**
- EventCard
- EventSkeleton
- RegistrationForm
- Date range filter

**Cải thiện:**
- Add to calendar button
- Share event
- Event photo gallery
- Reminder signup

---

#### 5. **Thanh toán** (`/cung-duong`)
**Routes:**
- `app/[locale]/cung-duong/page.tsx` (main)
- `app/[locale]/cung-duong/thanh-toan/momo/page.tsx` (payment)

**Đánh giá:**
- [ ] Purpose selection rõ ràng không?
- [ ] Transaction form dễ dùng không?
- [ ] Payment methods đầy đủ không?
- [ ] Thank you page có không?
- [ ] Receipt email gửi ngay không?

**Components sử dụng:**
- TransactionPurposeSelector
- TransactionForm
- AmountSelector
- PaymentMethodSelector
- RecentTransactions

**Cải thiện:**
- Progress bars cho projects
- Donor wall/recognition
- Monthly recurring option
- Tax receipt generation

---

#### 6. **Hỏi đáp** (`/hoi-dap`)
**Routes:** `app/[locale]/hoi-dap/page.tsx`

**Đánh giá:**
- [ ] FAQ categories rõ ràng không?
- [ ] Search function hoạt động tốt không?
- [ ] Accordion expand/collapse mượt không?
- [ ] Có "Không tìm thấy câu trả lời" CTA không?

**Components sử dụng:**
- FAQPageClient
- Accordion
- Search input
- Category tabs

**Cải thiện:**
- Add voting (helpful/not helpful)
- Related questions
- Contact form nếu không tìm thấy
- Popular questions highlight

---

#### 7. **Tìm kiếm** (`/tim-kiem`)
**Routes:** `app/[locale]/tim-kiem/page.tsx`

**Đánh giá:**
- [ ] Search results layout đẹp không?
- [ ] Empty state có friendly không?
- [ ] Results grouping (news/events) rõ ràng không?
- [ ] Highlighting search terms có không?

**Components:**
- SearchDialog
- Search results cards

**Cải thiện:**
- Filters sidebar
- Sort options
- Search suggestions
- Recent searches

---

#### 8. **Liên hệ** (`/lien-he`)
**Routes:** `app/[locale]/lien-he/page.tsx`

**Đánh giá:**
- [ ] Contact form đầy đủ fields không?
- [ ] Map integration có không?
- [ ] Office hours hiển thị không?
- [ ] Social media links có không?

**Cải thiện cần:**
- Google Maps embed
- Contact info cards
- Directions
- Alternative contact methods

---

### B. ADMIN PAGES (Trang quản trị)

#### 9. **Admin Dashboard** (`/admin`)
**Routes:** `app/admin/page.tsx`

**Đánh giá:**
- [ ] Stats overview có useful không?
- [ ] Quick actions accessible không?
- [ ] Recent activity feed có không?

---

#### 10. **Approvals** (`/admin/approvals`)
**Routes:** `app/admin/approvals/page.tsx`

**Đánh giá:**
- [ ] Pending items rõ ràng không?
- [ ] Approve/reject workflow smooth không?
- [ ] Filter by type có không?

---

#### 11. **Analytics** (`/admin/analytics`)
**Routes:** `app/admin/analytics/page.tsx`

**Đánh giá:**
- [ ] Charts đẹp và informative không?
- [ ] Date range selector có không?
- [ ] Export data có không?

---

## 🎨 COMPONENT INVENTORY & REUSABILITY

### Shared Components (Đang dùng chung)

#### Layout Components
- `Header` - Global navigation
- `Footer` - Site footer
- `TopBar` - Language/accessibility
- `SkipToContent` - Accessibility

**Đánh giá:** ✅ Good reuse, consistent across pages

---

#### UI Components (từ `components/ui/`)
- `Button`, `Input`, `Card`, `Badge`
- `Accordion`, `Tabs`, `Dialog`
- `Skeleton`, `Progress`
- `KhmerHeading`

**Đánh giá:** ✅ Well abstracted, reusable

**Thiếu:**
- Modal/Drawer component
- Toast notifications
- Loading spinner
- Empty state component

---

#### Feature Components

**News:**
- `NewsCard` - Reusable ✅
- `NewsSkeleton` - Reusable ✅
- Could add: `NewsGrid`, `NewsList`

**Events:**
- `EventCard` - Reusable ✅
- `EventSkeleton` - Reusable ✅
- `RegistrationForm` - Specific to events
- Could add: `EventCalendar`, `EventList`

**Transactions:**
- `TransactionForm` - Reusable ✅
- `AmountSelector` - Reusable ✅
- `PaymentMethodSelector` - Reusable ✅
- `TransactionPurposeSelector` - Specific
- `RecentTransactions` - Could be more generic

**Search:**
- `SearchDialog` - Global ✅
- `SearchResultsPage` - Specific

**Accessibility:**
- `AccessibilityControls` - Global ✅
- `SkipToContent` - Global ✅

---

### Opportunities for New Shared Components

#### 1. **PageHeader Component**
```tsx
// Many pages repeat this pattern
<div className="text-center mb-12">
  <KhmerHeading level={1} withDivider>Title</KhmerHeading>
  <p className="text-gray-600">Description</p>
</div>
```

**Proposal:**
```tsx
<PageHeader 
  title="Tin tức"
  subtitle="Cập nhật hoạt động mới nhất"
  khmer="ព័ត៌មាន"
/>
```

---

#### 2. **ContentSection Component**
```tsx
<ContentSection 
  title="Latest News"
  background="white"
  spacing="large"
>
  {children}
</ContentSection>
```

---

#### 3. **EmptyState Component**
```tsx
<EmptyState
  icon={Search}
  title="Không tìm thấy kết quả"
  description="Thử tìm kiếm với từ khóa khác"
  action={<Button>Về trang chủ</Button>}
/>
```

---

#### 4. **StatsCard Component**
```tsx
<StatsCard
  value="150+"
  label="Nhân sự"
  icon={Users}
  trend="+12% so với tháng trước"
/>
```

---

#### 5. **ImageGallery Component**
```tsx
<ImageGallery
  images={photos}
  layout="masonry"
  lightbox={true}
/>
```

---

## 🔗 NAVIGATION FLOW ANALYSIS

### Current Navigation Structure

```
Homepage (/)
├─ Header Navigation
│  ├─ Giới thiệu (/gioi-thieu)
│  ├─ Tin tức (/tin-tuc)
│  ├─ Lịch lễ (/lich-le)
│  ├─ Thanh toán (/cung-duong)
│  ├─ Hỏi đáp (/hoi-dap)
│  └─ Liên hệ (/lien-he)
│
├─ Quick Access Section (Homepage)
│  ├─ → Sự kiện
│  ├─ → Thanh toán
│  ├─ → Tin tức
│  ├─ → FAQ
│  ├─ → Liên hệ
│  └─ → Giới thiệu
│
├─ Featured Content
│  ├─ Latest News → /tin-tuc/[slug]
│  └─ Upcoming Events → /lich-le/[id]
│
└─ Footer Links
   ├─ Quick Links (same as header)
   ├─ Contact Info
   └─ Social Media
```

### User Journeys to Evaluate

#### Journey 1: Đăng ký sự kiện
```
1. Homepage → Click "Lịch lễ"
2. Events page → Browse events
3. Event detail → Click "Đăng ký"
4. Registration form → Submit
5. Confirmation page → Email sent
```

**Issues:**
- ❌ Confirmation page missing
- ❌ No back to events link after registration

---

#### Journey 2: Thanh toán
```
1. Homepage → Click "Thanh toán"
2. Transaction page → Select purpose
3. Fill form → Select amount
4. Payment → Choose method
5. Payment gateway → Complete
6. Thank you page → Receipt
```

**Issues:**
- ❌ Payment integration incomplete
- ❌ Thank you page missing
- ❌ No transaction history page

---

#### Journey 3: Tìm tin tức
```
1. Any page → Click search icon
2. Search dialog → Type query
3. Press Enter → Results page
4. Click news item → Article detail
5. Read → Share or back to news
```

**Issues:**
- ✅ Flow works well
- ⚠️ Related articles missing in detail page

---

### Navigation Gaps Identified

#### Missing Internal Links
- [ ] Event detail → Related events
- [ ] News detail → Related articles
- [ ] News detail → Back to news list
- [ ] Transaction success → View transaction history
- [ ] FAQ → Contact if not helpful

#### Missing Pages
- [ ] `/cung-duong/thanh-cong` - Transaction success
- [ ] `/lich-le/dang-ky-thanh-cong` - Registration success
- [ ] `/lien-he/cam-on` - Contact form success
- [ ] `/404` - Custom 404 (đã có ✅)

#### Suggested Additions
- [ ] `/album` - Photo galleries
- [ ] `/video` - Video library
- [ ] `/lich-su` - Tenant history timeline
- [ ] `/su-thay` - Monk profiles

---

## 📊 UI/UX CONSISTENCY CHECKLIST

### Layout Patterns

| Pattern | Homepage | News | Events | Donate | FAQ | Contact |
|---------|----------|------|--------|--------|-----|---------|
| Page Header | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Breadcrumbs | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Container Max-width | ✅ | ✅ | ✅ | ✅ | ✅ | ? |
| Responsive Grid | ✅ | ✅ | ✅ | ✅ | N/A | ? |
| Loading States | ✅ | ✅ | ✅ | ✅ | N/A | N/A |
| Empty States | N/A | ❌ | ❌ | N/A | ✅ | N/A |

**Action Items:**
- Add breadcrumbs to all pages
- Standardize page headers
- Add empty states where needed
- Ensure consistent spacing

---

### Color Usage

| Element | Color | Usage |
|---------|-------|-------|
| Primary CTA | gold-primary | Donate, Register buttons |
| Secondary CTA | gray-200 | Cancel, Back buttons |
| Headings | gray-900 | All headings |
| Body text | gray-700 | Paragraphs |
| Muted text | gray-500 | Captions, metadata |
| Links | gold-primary | Hover: gold-dark |
| Success | green-600 | Success messages |
| Error | red-600 | Error messages |

**Consistency:** ✅ Good, mostly following design system

---

### Typography Scale

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| Hero | 3.5rem | Bold | Homepage hero |
| H1 | 2.5rem | Bold | Page titles |
| H2 | 2rem | Bold | Section headings |
| H3 | 1.5rem | SemiBold | Card titles |
| Body | 1rem | Normal | Paragraphs |
| Small | 0.875rem | Normal | Captions |

**Issues:**
- ⚠️ Some pages use inconsistent heading sizes
- ⚠️ Need better hierarchy in some sections

---

## 🎯 PRIORITY IMPROVEMENTS

### HIGH Priority (Must Fix)

1. **Homepage Hero Section**
   - Add compelling hero image/video
   - Better typography
   - Clear CTAs

2. **Missing Success Pages**
   - Transaction thank you
   - Registration confirmation
   - Contact form success

3. **Component Reusability**
   - Create PageHeader component
   - Create EmptyState component
   - Create StatsCard component

4. **Navigation Enhancements**
   - Add breadcrumbs
   - Add back buttons
   - Add related content links

5. **Liên hệ Page**
   - Add map integration
   - Add contact form
   - Add office hours

---

### MEDIUM Priority

1. **Visual Enhancements**
   - Add more images throughout
   - Better spacing/padding
   - Subtle animations

2. **Content Sections**
   - About page content
   - Tenant history
   - Monk profiles

3. **Advanced Features**
   - Photo gallery
   - Video library
   - Download resources

---

### LOW Priority (Nice to Have)

1. **Social Features**
   - Comments on news
   - Share buttons everywhere
   - Social media feed

2. **Personalization**
   - Save favorite events
   - Transaction history
   - Newsletter preferences

---

## 📝 EVALUATION FRAMEWORK

Cho mỗi page, đánh giá theo thang điểm 1-5:

### 1. Visual Appeal (Hấp dẫn thị giác)
- 5: Stunning, professional, memorable
- 4: Good looking, polished
- 3: Acceptable, functional
- 2: Plain, needs improvement
- 1: Unattractive, unprofessional

### 2. User Experience (Trải nghiệm người dùng)
- 5: Intuitive, delightful
- 4: Easy to use, clear
- 3: Functional, some friction
- 2: Confusing, difficult
- 1: Broken, unusable

### 3. Content Quality (Chất lượng nội dung)
- 5: Complete, engaging, valuable
- 4: Good, informative
- 3: Adequate, basic info
- 2: Incomplete, lacks detail
- 1: Missing, placeholder only

### 4. Performance (Hiệu suất)
- 5: Lightning fast, optimized
- 4: Fast, good performance
- 3: Acceptable load times
- 2: Slow, noticeable delays
- 1: Very slow, poor UX

### 5. Mobile Experience (Trải nghiệm mobile)
- 5: Perfect on mobile
- 4: Good mobile UX
- 3: Functional on mobile
- 2: Issues on mobile
- 1: Broken on mobile

---

## 🎨 OUTPUT FORMAT YÊU CẦU

Sau khi đánh giá, hãy tạo document với format:

```markdown
# PAGE EVALUATION REPORT

## Summary
- Total pages: X
- Average score: Y/5
- Critical issues: Z

## Individual Page Scores

### Homepage
- Visual Appeal: 2/5
- User Experience: 3/5
- Content Quality: 2/5
- Performance: 4/5
- Mobile: 4/5
- **Overall: 3.0/5**

**Issues:**
- No hero image
- Too much white space
- Missing featured content

**Recommendations:**
1. Add hero section with image
2. Add quick stats
3. Show recent transactions

---

(Repeat for all pages)

## Component Reusability Analysis
- Currently reusable: X components
- Can be abstracted: Y components
- Recommended new components: Z

## Navigation Flow Analysis
- Complete journeys: A
- Incomplete journeys: B
- Missing pages: C

## Action Items (Priority Order)
1. [HIGH] Fix homepage hero
2. [HIGH] Create success pages
3. [MEDIUM] Add breadcrumbs
...
```

---

**READY TO START EVALUATION!**

Hãy phân tích dựa trên framework này và đưa ra detailed report.
