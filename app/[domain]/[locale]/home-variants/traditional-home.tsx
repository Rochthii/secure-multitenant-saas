import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { HeroCarouselWrapper } from '@/components/sections/HeroCarouselWrapper';
import { FeatureMosaicSection } from '@/components/sections/FeatureMosaicSection';
import { HomeIntroSection } from '@/components/sections/HomeIntroSection';
import { DailyDharmaQuoteSection } from '@/components/sections/DailyDharmaQuoteSection';
import { TransactionCTASection } from '@/components/sections/DonationCTASection';
import { CulturePreviewSection } from '@/components/sections/CulturePreviewSection';
import { generatePlaceSchema, generateOrganizationSchema } from '@/lib/seo/json-ld';
import { getCachedHeroSlides, getCachedDharmaTalks, getCachedAboutSection } from '@/lib/cache/queries';
import { getSiteSettings } from '@/lib/site-settings';
import { PhapAmSkeleton, NewsHomeSkeleton, CalendarSkeleton, FacebookFeedSkeleton } from '@/components/ui/section-skeletons';
import { getVietnamTime } from '@/lib/utils/date';

// ISR: 5 phút — homepage có hero slides + news + events thay đổi thường xuyên.
// Vercel sẽ cache toàn bộ HTML ở CDN edge → TTFB ~20ms thay vì 200-500ms cold Lambda.


// Lazy load client-heavy sections — only JS is fetched when visible
const PhapAmPreviewSection = dynamic(
    () => import('@/components/sections/PhapAmPreviewSection').then(mod => ({ default: mod.PhapAmPreviewSection })),
    { loading: () => <PhapAmSkeleton /> }
);

const LatestNewsSectionClient = dynamic(
    () => import('@/components/sections/LatestNewsSectionClient').then(mod => ({ default: mod.LatestNewsSectionClient })),
    { loading: () => <NewsHomeSkeleton /> }
);

const KhmerCalendarSection = dynamic(
    () => import('@/components/sections/KhmerCalendarSection').then(mod => ({ default: mod.KhmerCalendarSection })),
    { loading: () => <CalendarSkeleton /> }
);

const FacebookFeedSection = dynamic(
    () => import('@/components/sections/FacebookFeedSection').then(mod => ({ default: mod.FacebookFeedSection })),
    { loading: () => <FacebookFeedSkeleton /> }
);

export default async function TraditionalHome({ locale, tenantId }: { locale: string, tenantId: string }) {
    const { getTenantBaseUrl } = await import('@/lib/utils/seo');
    const baseUrl = getTenantBaseUrl((tenantId as any)?.domain || '');
    
    const today = getVietnamTime();
    // Fetch critical data in parallel — hero, dharma talks, abbot, intro, calendar events, settings
    const [heroSlides, dharmaTalks, abbotSection, introSection, architectureSection, calendarEvents, settings] = await Promise.all([
        getCachedHeroSlides(),
        getCachedDharmaTalks(3),
        getCachedAboutSection('truyen-thua-tiep-noi/tru-tri-duong-nhiem'),
        getCachedAboutSection('dong-chay-lich-su'),
        getCachedAboutSection('di-san-nghe-thuat/kien-truc-dieu-khac'),
        import('@/lib/cache/queries').then(mod => mod.getCachedMonthEvents(today.getFullYear(), today.getMonth() + 1)),
        getSiteSettings(tenantId)
    ]);

    // JSON-LD Structured Data
    const organizationSchema = generateOrganizationSchema({
        name: 'Chi nhánh Chantarangsay',
        alternateName: 'ចន្ទរង្សី',
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        description: 'Ngôi chi nhánh Phật giáo Nam tông Khmer giữa lòng Sài Gòn',
        address: {
            '@type': 'PostalAddress',
            streetAddress: settings['address'] || '',
            addressLocality: 'Quận 3',
            addressRegion: 'TP. Hồ Chí Minh',
            addressCountry: 'VN',
        },
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: settings['contact_phone'] || '0938 787 165',
            contactType: 'Customer Service',
            email: settings['contact_email'] || 'contact@chantarangsay.org',
        },
    });

    const placeSchema = generatePlaceSchema();

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: organizationSchema }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: placeSchema }}
            />

            {/* 1. Hero - First impression (above fold, NOT lazy) */}
            {heroSlides?.[0]?.image_url && (
                <link
                    rel="preload"
                    as="image"
                    href={heroSlides[0].image_url}
                    fetchPriority="high"
                />
            )}
            <HeroCarouselWrapper slides={heroSlides || []} />

            {/* 2. Daily Dharma Quote — static server-rendered */}
            <DailyDharmaQuoteSection />

            {/* 3. Intro Section — server-rendered */}
            <HomeIntroSection introSection={introSection} />

            {/* 4. Feature Mosaic — server-rendered */}
            <FeatureMosaicSection
                abbotSection={abbotSection}
                introSection={introSection}
                architectureSection={architectureSection}
            />

            {/* 5. Culture Preview — server-rendered (no use client) */}
            <CulturePreviewSection />

            {/* 6. Dharma Talks — lazy loaded (YouTube modal needs client JS) */}
            <Suspense fallback={<PhapAmSkeleton />}>
                <PhapAmPreviewSection talks={dharmaTalks || []} />
            </Suspense>

            {/* 7. Transaction CTA — server-rendered */}
            <TransactionCTASection />

            {/* 8. Latest News — lazy loaded (Intersection Observer + Carousel) */}
            <Suspense fallback={<NewsHomeSkeleton />}>
                <LatestNewsSectionClient locale={locale} />
            </Suspense>

            {/* 9. Khmer Calendar Widget — lazy loaded, below-fold */}
            <Suspense fallback={<CalendarSkeleton />}>
                <KhmerCalendarSection initialEvents={calendarEvents || []} />
            </Suspense>

            {/* 10. Facebook Feed — lazy loaded, below-fold */}
            <Suspense fallback={<FacebookFeedSkeleton />}>
                <FacebookFeedSection facebookUrl={settings['facebook_url']} />
            </Suspense>
        </>
    );
}
