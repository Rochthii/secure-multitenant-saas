import dynamic from 'next/dynamic';
import { getCachedHeroSlides, getCachedDharmaTalks } from '@/lib/cache/queries';
import { getSiteSettings } from '@/lib/site-settings';
import { generatePlaceSchema, generateOrganizationSchema } from '@/lib/seo/json-ld';

// ──────────────────────────────────────────────────────────
// Layout: sunrise — Usha Khmer (Bình Minh Mekong)
// Triết lý: Cam rực + vàng ấm + trắng sáng — bình minh sông Mekong, cộng đồng, đời sống tu tập sáng sớm
// Sections: Panorama Hero (ảnh toàn cảnh chân trời), Kinh Sáng Banner, Cộng Đồng News, Event Calendar màu sắc
// ──────────────────────────────────────────────────────────

import { SunrisePanoramaHero } from '@/components/sections/sunrise/SunrisePanoramaHero';
import { SunriseMorningBanner } from '@/components/sections/sunrise/SunriseMorningBanner';
import { SunriseCommunityNews } from '@/components/sections/sunrise/SunriseCommunityNews';
import { SunriseEventCalendar } from '@/components/sections/sunrise/SunriseEventCalendar';
import { SunriseDharmaSection } from '@/components/sections/sunrise/SunriseDharmaSection';

export default async function SunriseHome({ locale, tenantId }: { locale: string; tenantId: string }) {
    const { getTenantBaseUrl } = await import('@/lib/utils/seo');
    const baseUrl = getTenantBaseUrl((tenantId as any)?.domain || '');
    const [heroSlides, dharmaTalks, settings] = await Promise.all([
        getCachedHeroSlides(tenantId),
        getCachedDharmaTalks(6, tenantId),
        getSiteSettings(tenantId),
    ]);

    const organizationSchema = generateOrganizationSchema({
        name: settings['site_name_vi'] || 'Chi nhánh Phật giáo Nam tông',
        alternateName: settings['site_name_km'] || '',
        url: baseUrl,
        logo: settings['site_logo'] || `${baseUrl}/logo.png`,
        description: settings['site_description_vi'] || '',
        address: { '@type': 'PostalAddress', streetAddress: settings['address'] || '', addressLocality: 'TP. Hồ Chí Minh', addressRegion: 'TP. Hồ Chí Minh', addressCountry: 'VN' },
        contactPoint: { '@type': 'ContactPoint', telephone: settings['contact_phone'] || '', contactType: 'Customer Service', email: settings['contact_email'] || '' },
    });

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationSchema }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: generatePlaceSchema() }} />

            {/* 1. Panorama Hero — 16:5 ratio, gradient cam bình minh phủ lên ảnh rộng */}
            {heroSlides?.[0]?.image_url && <link rel="preload" as="image" href={heroSlides[0].image_url} fetchPriority="high" />}
            <SunrisePanoramaHero slides={heroSlides || []} settings={settings} />

            {/* 2. Morning Dhamma Banner — "Kinh Sáng" với giờ tụng kinh hằng ngày */}
            <SunriseMorningBanner />

            {/* 3. Cộng Đồng News — cards cam ấm, 3 cột, focus ảnh con người */}
            <SunriseCommunityNews />

            {/* 4. Pháp Thoại dạng list đơn */}
            <SunriseDharmaSection talks={dharmaTalks || []} />

            {/* 5. Event Calendar màu cam — tháng view grid */}
            <SunriseEventCalendar />
        </>
    );
}
