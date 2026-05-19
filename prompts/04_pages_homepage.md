# PROMPT 04: HOMEPAGE

**Task:** Tạo trang chủ với hero section, quick access, events, news

**Thời gian ước tính:** 2-3 giờ

---

## 📋 CONTEXT

Trang chủ là ấn tượng đầu tiên, cần thiết kế đẹp, thu hút với bản sắc Khmer.

**Reference:**
- `docs/_legacy_archive/2026-03/05_CAU_TRUC_NOI_DUNG.md` (section 6 - wireframe trang chủ - legacy)
- `docs/04_PUBLIC_FEATURES.md` (đặc tả public hiện tại)

**Prerequisites:**
- Đã hoàn thành Prompt 01, 02, 03

---

## 🎯 YÊU CẦU

### 1. Hero Section với background

`src/components/sections/HeroSection.tsx`:

```tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { GoldButton } from '@/components/ui/gold-button';
import { Calendar, Image as ImageIcon } from 'lucide-react';

export function HeroSection() {
  const t = useTranslations('home');

  return (
    <section className="relative h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-chua.jpg"
          alt="Chi nhánh Chantarangsay"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4">
        <div className="mb-6">
          <div className="inline-block p-4 bg-gold-primary/20 rounded-full mb-4">
            <div className="text-6xl">☸️</div>
          </div>
        </div>
        
        <h1 className="font-playfair font-bold text-4xl md:text-6xl lg:text-7xl mb-4">
          {t('title')}
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 text-gold-primary font-khmer">
          {t('subtitle')}
        </p>
        
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          {t('description')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <GoldButton size="lg" className="text-lg">
            <Calendar className="mr-2 h-5 w-5" />
            {t('viewCalendar')}
          </GoldButton>
          <GoldButton size="lg" variant="outline" className="text-lg border-white text-white hover:bg-white/10">
            <ImageIcon className="mr-2 h-5 w-5" />
            {t('virtualTour')}
          </GoldButton>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}
```

### 2. Quick Access Cards

`src/components/sections/QuickAccessSection.tsx`:

```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Calendar, HandHeart, Newspaper, Image as ImageIcon } from 'lucide-react';
import { IconCard } from '@/components/ui/icon-card';

const quickLinks = [
  {
    icon: Calendar,
    key: 'calendar',
    href: '/lich-le',
    color: 'text-gold-primary',
  },
  {
    icon: HandHeart,
    key: 'donate',
    href: '/cung-duong',
    color: 'text-red-500',
  },
  {
    icon: Newspaper,
    key: 'news',
    href: '/tin-tuc',
    color: 'text-blue-600',
  },
  {
    icon: ImageIcon,
    key: 'gallery',
    href: '/thu-vien',
    color: 'text-teal-accent',
  },
];

export function QuickAccessSection() {
  const t = useTranslations('home.quickAccess');

  return (
    <section className="py-16 bg-ivory">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickLinks.map((link) => (
            <Link key={link.key} href={link.href}>
              <IconCard
                icon={link.icon}
                title={t(`${link.key}.title`)}
                description={t(`${link.key}.description`)}
                iconColor={link.color}
                className="h-full hover:scale-105 transition-transform cursor-pointer"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### 3. Upcoming Events Section

`src/components/sections/UpcomingEventsSection.tsx`:

```tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';
import { KhmerHeading } from '@/components/ui/khmer-heading';
import { GoldButton } from '@/components/ui/gold-button';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export async function UpcomingEventsSection() {
  const t = useTranslations('home.events');
  const supabase = await createClient();

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .gte('start_date', new Date().toISOString().split('T')[0])
    .eq('status', 'upcoming')
    .order('start_date', { ascending: true })
    .limit(3);

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <KhmerHeading level={2} withDivider className="text-center mb-12">
          {t('title')}
        </KhmerHeading>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link key={event.id} href={`/lich-le/${event.id}`}>
              <Card className="h-full hover:shadow-xl transition-shadow overflow-hidden group">
                {event.thumbnail_url && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={event.thumbnail_url}
                      alt={event.title_vi}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(event.start_date), 'dd/MM/yyyy', { locale: vi })}</span>
                  </div>
                  <CardTitle className="line-clamp-2 group-hover:text-gold-primary transition-colors">
                    {event.title_vi}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 line-clamp-3 text-sm mb-4">
                    {event.description_vi}
                  </p>
                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <GoldButton asChild>
            <Link href="/lich-le">{t('viewAll')}</Link>
          </GoldButton>
        </div>
      </div>
    </section>
  );
}
```

### 4. Latest News Section

`src/components/sections/LatestNewsSection.tsx`:

```tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { KhmerHeading } from '@/components/ui/khmer-heading';
import { GoldButton } from '@/components/ui/gold-button';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export async function LatestNewsSection() {
  const supabase = await createClient();

  const { data: news } = await supabase
    .from('news')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(4);

  if (!news || news.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <KhmerHeading level={2} withDivider className="text-center mb-12">
          Tin tức mới nhất
        </KhmerHeading>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {news.map((item) => (
            <Link key={item.id} href={`/tin-tuc/${item.slug}`}>
              <article className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow h-full flex flex-col">
                {item.thumbnail_url && (
                  <div className="relative h-48">
                    <Image
                      src={item.thumbnail_url}
                      alt={item.title_vi}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-4 flex-1 flex flex-col">
                  <time className="text-sm text-gray-500 mb-2">
                    {format(new Date(item.published_at), 'dd/MM/yyyy', { locale: vi })}
                  </time>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-gold-primary transition-colors">
                    {item.title_vi}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 flex-1">
                    {item.excerpt_vi}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <GoldButton asChild>
            <Link href="/tin-tuc">Xem tất cả tin tức</Link>
          </GoldButton>
        </div>
      </div>
    </section>
  );
}
```

### 5. Update Homepage

`src/app/[locale]/page.tsx`:

```tsx
import { HeroSection } from '@/components/sections/HeroSection';
import { QuickAccessSection } from '@/components/sections/QuickAccessSection';
import { UpcomingEventsSection } from '@/components/sections/UpcomingEventsSection';
import { LatestNewsSection } from '@/components/sections/LatestNewsSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <QuickAccessSection />
      <UpcomingEventsSection />
      <LatestNewsSection />
    </>
  );
}
```

### 6. Add translations

Update `messages/vi.json`:

```json
{
  "home": {
    "title": "Chi nhánh Chantarangsay",
    "subtitle": "ចន្ទរង្សី - Ánh Trăng Giữa Lòng Sài Gòn",
    "description": "Ngôi chi nhánh Khmer Nam tông lưu giữ bản sắc văn hóa dân tộc",
    "viewCalendar": "Xem lịch lễ",
    "virtualTour": "Tham quan ảo",
    "quickAccess": {
      "calendar": {
        "title": "Lịch lễ",
        "description": "Xem lịch cúng bái hằng ngày"
      },
      "donate": {
        "title": "Thanh toán",
        "description": "Đóng góp giao dịch"
      },
      "news": {
        "title": "Tin tức",
        "description": "Thông tin mới nhất"
      },
      "gallery": {
        "title": "Thư viện",
        "description": "Ảnh và video"
      }
    },
    "events": {
      "title": "Sự kiện sắp tới",
      "viewAll": "Xem tất cả sự kiện"
    }
  }
}
```

### 7. Add placeholder image

Create `public/images/hero-chua.jpg` - Hoặc dùng placeholder tạm:

```tsx
// Trong HeroSection, thêm fallback:
<div className="absolute inset-0 bg-gradient-to-br from-gold-primary/20 to-sacred-red/20" />
```

---

## ✅ ACCEPTANCE CRITERIA

- [ ] Hero section với background đẹp
- [ ] Quick access cards có icons
- [ ] Upcoming events fetch từ Supabase
- [ ] Latest news hiển thị
- [ ] Responsive mobile/desktop
- [ ] Hover effects smooth
- [ ] Links navigate đúng

---

--- START PROMPT ---

Tạo trang chủ cho website Chi nhánh Chantarangsay:

1. Hero section với background image, overlay, title lớn, CTA buttons
2. Quick Access section với 4 cards (Lịch lễ, Thanh toán, Tin tức, Thư viện)
3. Upcoming Events section - fetch 3 sự kiện sắp tới từ Supabase
4. Latest News section - fetch 4 tin mới nhất
5. Responsive design, hover effects
6. Translations cho tất cả text

Dùng components đã tạo: KhmerHeading, IconCard, GoldButton
Màu sắc: gold-primary, sacred-red, teal-accent

Test responsive và data fetching từ Supabase!
