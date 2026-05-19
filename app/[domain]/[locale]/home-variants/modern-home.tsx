import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { getCachedHeroSlides, getCachedDharmaTalks } from '@/lib/cache/queries';
import { getSiteSettings } from '@/lib/site-settings';
import { generatePlaceSchema, generateOrganizationSchema } from '@/lib/seo/json-ld';
import { HeroCarouselWrapper } from '@/components/sections/HeroCarouselWrapper';
import { ModernMoonCTA } from '@/components/sections/modern/ModernMoonCTA';

import { DharmaTickerSection } from '@/components/sections/modern/DharmaTickerSection';
import { ModernDharmaPlayer } from '@/components/sections/modern/ModernDharmaPlayer';
import { ModernLatestNewsSection } from '@/components/sections/modern/ModernLatestNewsSection';
import { FacebookFeedSection } from '@/components/sections/FacebookFeedSection';

export default async function ModernHome({ locale, tenantId }: { locale: string; tenantId: string }) {
    const { getTenantBaseUrl } = await import('@/lib/utils/seo');
    const baseUrl = getTenantBaseUrl((tenantId as any)?.domain || '');

    // Fetch song song: hero slides, dharma talks (nhiều hơn để ticker đủ), settings
    const [heroSlides, dharmaTalks, settings] = await Promise.all([
        getCachedHeroSlides(tenantId),
        getCachedDharmaTalks(12, tenantId),  // Nhiều hơn để ticker phong phú
        getSiteSettings(tenantId),
    ]);

    // JSON-LD Structured Data
    const organizationSchema = generateOrganizationSchema({
        name: settings['site_name_vi'] || 'Chi nhánh Phật giáo Nam tông',
        alternateName: settings['site_name_km'] || 'ចន្តារង្សី',
        url: baseUrl,
        logo: settings['site_logo'] || `${baseUrl}/logo.png`,
        description: settings['site_description_vi'] || 'Ngôi chi nhánh Phật giáo Nam tông Khmer',
        address: {
            '@type': 'PostalAddress',
            streetAddress: settings['address'] || '',
            addressLocality: 'TP. Hồ Chí Minh',
            addressRegion: 'TP. Hồ Chí Minh',
            addressCountry: 'VN',
        },
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: settings['contact_phone'] || '',
            contactType: 'Customer Service',
            email: settings['contact_email'] || '',
        },
    });

    const placeSchema = generatePlaceSchema();

    return (
        <>
            {/* JSON-LD */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationSchema }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: placeSchema }} />

            {/* 1. Hero Carousel (Above fold — LCP critical) */}
            {heroSlides?.[0]?.image_url && (
                <link rel="preload" as="image" href={heroSlides[0].image_url} fetchPriority="high" />
            )}
            <HeroCarouselWrapper slides={heroSlides || []} />

            {/* 2. Dharma Ticker — chạy ngay dưới Hero, khác biệt hoàn toàn với Traditional */}
            <DharmaTickerSection talks={dharmaTalks || []} siteName={settings['site_name_vi']} />

            {/* 3. Tin tức mới nhất — Magazine Layout (Lazy, dưới fold) */}
            <ModernLatestNewsSection locale={locale} />

            {/* 4. Pháp Thoại Dark Player — lazy load */}
            <ModernDharmaPlayer talks={(dharmaTalks || []).slice(0, 8)} />

            {/* 5. Moon CTA Transaction — Server Rendered (pure CSS, no client JS) */}
            <ModernMoonCTA />

            {/* 6. Facebook Feed — lazy */}
            <FacebookFeedSection facebookUrl={settings['facebook_url']} />
        </>
    );
}
