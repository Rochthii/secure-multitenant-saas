# PROMPT 06-12: REMAINING FEATURES

> **Lưu ý:** File này gộp các prompts còn lại để tiết kiệm token. Mỗi task vẫn độc lập.

---

## PROMPT 06: NEWS & BLOG

### Task: Trang tin tức với listing, detail, categories

```tsx
// src/app/[locale]/tin-tuc/page.tsx
- News listing với pagination
- Filter by category
- Search functionality
- Card layout responsive

// src/app/[locale]/tin-tuc/[slug]/page.tsx
- Fetch news by slug
- Rich content display
- Related news sidebar
- Social share buttons
```

**Key code:**
```tsx
const { data: news, count } = await supabase
  .from('news')
  .select('*, categories(*)', { count: 'exact' })
  .eq('status', 'published')
  .order('published_at', { ascending: false })
  .range(start, end);
```

---

## PROMPT 07: EVENTS & CALENDAR

### Task: Lịch lễ với calendar view, event detail

```tsx
// src/app/[locale]/lich-le/page.tsx
- Calendar component (react-big-calendar hoặc custom)
- Event list view
- Filter upcoming/past
- Month navigation

// src/app/[locale]/lich-le/[id]/page.tsx
- Event detail page
- Registration button
- Location map
- Share functionality
```

**Install:**
```bash
npm install react-big-calendar date-fns
```

**Key code:**
```tsx
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';

const events = data?.map(e => ({
  title: e.title_vi,
  start: new Date(e.start_date),
  end: new Date(e.end_date || e.start_date),
  resource: e,
}));
```

---

## PROMPT 08: EVENT REGISTRATION

### Task: Form đăng ký tham gia lễ

```tsx
// src/app/[locale]/dang-ky/cau-an/page.tsx
// src/app/[locale]/dang-ky/cau-sieu/page.tsx

Multi-step form:
1. Chọn loại lễ
2. Thông tin người đứng lễ
3. Thông tin chi tiết
4. Xác nhận

Features:
- Form validation (Zod)
- Save to event_registrations table
- Email confirmation
- Admin notification
```

**Schema:**
```ts
const registrationSchema = z.object({
  event_id: z.string().uuid(),
  full_name: z.string().min(2),
  phone: z.string().regex(/^[0-9]{10}$/),
  email: z.string().email().optional(),
  num_participants: z.number().min(1).max(50),
  note: z.string().optional(),
});
```

---

## PROMPT 10: MEDIA GALLERY

### Task: Thư viện ảnh, video, audio

```tsx
// src/app/[locale]/thu-vien/page.tsx
Tabs: Ảnh | Video | Audio | Tài liệu

// Ảnh: Masonry grid với lightbox
npm install yet-another-react-lightbox

// Video: YouTube embed grid
// Audio: Custom player với playlist
// Tài liệu: PDF viewer
```

**Key code:**
```tsx
const { data: media } = await supabase
  .from('media')
  .select('*')
  .eq('type', 'image')
  .order('created_at', { ascending: false });
```

---

## PROMPT 11: ADMIN DASHBOARD

### Task: Admin panel với auth, CRUD operations

```tsx
// src/app/admin/layout.tsx
- Middleware check admin role
- Sidebar navigation
- Protected routes

// src/app/admin/dashboard/page.tsx
- Statistics cards
- Recent activities
- Quick actions

// src/app/admin/tin-tuc/page.tsx
- DataTable component
- CRUD operations
- Rich text editor (Tiptap)

// src/app/admin/su-kien/page.tsx
// src/app/admin/thu-vien/page.tsx
// src/app/admin/dang-ky/page.tsx
// src/app/admin/cung-duong/page.tsx
```

**Install editor:**
```bash
npm install @tiptap/react @tiptap/starter-kit
```

**Middleware:**
```ts
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient({ req: request });
  const { data: { user } } = await supabase.auth.getUser();
  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
}
```

---

## PROMPT 12: SEO OPTIMIZATION

### Task: SEO, sitemap, robots.txt, meta tags

```ts
// src/app/[locale]/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
  title: {
    template: '%s | Chi nhánh Chantarangsay',
    default: 'Chi nhánh Chantarangsay',
  },
  description: 'Ngôi chi nhánh Khmer Nam tông giữa lòng Sài Gòn',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/',
    siteName: 'Chi nhánh Chantarangsay',
    images: '/og-image.jpg',
  },
};

// src/app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();
  
  const { data: news } = await supabase
    .from('news')
    .select('slug, updated_at')
    .eq('status', 'published');
  
  return [
    { url: '/', lastModified: new Date() },
    ...news?.map(n => ({
      url: `/tin-tuc/${n.slug}`,
      lastModified: new Date(n.updated_at),
    })) || [],
  ];
}

// src/app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/',
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
```

**JSON-LD for rich snippets:**
```tsx
// In pages
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: 'Chi nhánh Chantarangsay',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Quận 3',
        addressRegion: 'TP.HCM',
        addressCountry: 'VN',
      },
    }),
  }}
/>
```

---

## PROMPT 13: DEPLOYMENT

### Task: Deploy to Vercel

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/chantarangsay.git
git push -u origin main

# 2. Connect Vercel
- Login to vercel.com
- Import GitHub repository
- Add environment variables:
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  NEXT_PUBLIC_SITE_URL

# 3. Deploy
- Auto deploy on push to main
- Preview deployments for PRs

# 4. Custom domain
- Add domain in Vercel settings
- Update DNS records
- Enable SSL (automatic)

# 5. Performance monitoring
- Vercel Analytics
- Core Web Vitals
- Speed Insights
```

**Optimization checklist:**
- [ ] Image optimization (next/image)
- [ ] Font optimization (next/font)
- [ ] Code splitting
- [ ] Compression enabled
- [ ] Cache headers
- [ ] CDN configured

---

## TỔNG KẾT CÁC PROMPTS

| # | Prompt | Thời gian | Độ phức tạp |
|---|--------|-----------|-------------|
| 01 | Setup Project | 30-45p | ⭐⭐⭐ |
| 02 | Design System | 2-3h | ⭐⭐⭐⭐ |
| 03 | Database | 1-2h | ⭐⭐⭐⭐ |
| 04 | Homepage | 2-3h | ⭐⭐⭐⭐ |
| 05 | Static Pages | 2-3h | ⭐⭐⭐ |
| 06 | News | 2-3h | ⭐⭐⭐ |
| 07 | Events/Calendar | 3-4h | ⭐⭐⭐⭐ |
| 08 | Registration | 2-3h | ⭐⭐⭐⭐ |
| 09 | Transaction | 4-6h | ⭐⭐⭐⭐⭐ |
| 10 | Gallery | 2-3h | ⭐⭐⭐ |
| 11 | Admin | 6-8h | ⭐⭐⭐⭐⭐ |
| 12 | SEO | 1-2h | ⭐⭐⭐ |
| 13 | Deployment | 1h | ⭐⭐ |
| **TOTAL** | **~30-40h** | |

---

## START PROMPTS

### Prompt 06: News
```
Tạo hệ thống tin tức:
1. Listing page với pagination, filter, search
2. Detail page với rich content, related news
3. Category navigation
4. Social share buttons

Fetch từ Supabase news table, status='published'
```

### Prompt 07: Events
```
Tạo lịch sự kiện:
1. Calendar view (react-big-calendar)
2. Event list
3. Detail page với registration link
4. Upcoming/past filter

Fetch từ events table, join với event_registrations
```

### Prompt 08: Registration
```
Tạo form đăng ký lễ:
1. Multi-step form
2. Validation (Zod)
3. Email confirmation
4. Save to event_registrations table
```

### Prompt 10: Gallery
```
Tạo thư viện:
1. Tabs: Ảnh, Video, Audio, PDF
2. Masonry grid cho ảnh với lightbox
3. YouTube embed cho video
4. Custom audio player

Filter by event, year, tags
```

### Prompt 11: Admin
```
Tạo admin dashboard:
1. Auth middleware (check role=admin)
2. CRUD cho news, events, media
3. Rich text editor (Tiptap)
4. View registrations, transactions
5. Statistics dashboard
```

### Prompt 12: SEO
```
Tối ưu SEO:
1. Meta tags động
2. sitemap.xml, robots.txt
3. JSON-LD structured data
4. Open Graph images
5. Performance optimization
```

### Prompt 13: Deploy
```
Deploy to Vercel:
1. Push to GitHub
2. Connect Vercel
3. Add env variables
4. Configure domain
5. Enable analytics
```

---

**Mỗi prompt trên có thể expand thành file riêng nếu cần chi tiết hơn!**
