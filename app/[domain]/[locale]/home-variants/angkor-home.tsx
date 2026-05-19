import { getCachedHeroSlides, getCachedDharmaTalks, getCachedNews, getCachedUpcomingEvents, getCachedAboutSections } from '@/lib/cache/queries';
import { getSiteSettings } from '@/lib/site-settings';
import { generatePlaceSchema, generateOrganizationSchema } from '@/lib/seo/json-ld';

// ──────────────────────────────────────────────────────────
// Layout: angkor — Prasat Khmer (Đền Tháp Angkor)
// Triết lý: đá nâu + vàng cổ kính (sáng thoáng hơn), font serif,
//            toàn bộ data fetch server-side / unstable_cache
// Sections:
//   1. AngkorParallaxHero   — fullscreen hero, overlay nhẹ thấy ảnh
//   2. AngkorArchShowcase   — grid kiến trúc about_sections
//   3. AngkorEventList      — timeline 2-col sự kiện (props SSR)
//   4. AngkorDharmaScroll   — danh sách pháp thoại
//   5. AngkorNewspaper      — layout báo giấy cổ điển, ivory bg
// ──────────────────────────────────────────────────────────
import { AngkorParallaxHero } from '@/components/sections/angkor/AngkorParallaxHero';
import { AngkorArchShowcase } from '@/components/sections/angkor/AngkorArchShowcase';
import { AngkorEventList } from '@/components/sections/angkor/AngkorEventList';
import { AngkorDharmaScroll } from '@/components/sections/angkor/AngkorDharmaScroll';
import { AngkorNewspaper } from '@/components/sections/angkor/AngkorNewspaper';

export default async function AngkorHome({ locale, tenantId }: { locale: string; tenantId: string }) {
    const { getTenantBaseUrl } = await import('@/lib/utils/seo');
    const baseUrl = getTenantBaseUrl((tenantId as any)?.domain || '');

    // ── Fetch tất cả data server-side (unstable_cache — không tốn CPU khi warm) ──
    const [heroSlides, dharmaTalks, news, events, aboutSections, settings] = await Promise.all([
        getCachedHeroSlides(tenantId),
        getCachedDharmaTalks(6, tenantId),
        getCachedNews(6, tenantId),
        getCachedUpcomingEvents(6, tenantId),
        getCachedAboutSections(tenantId).catch(() => []),
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

            {/* 1. Parallax Hero — overlay giảm, thấy ảnh kiến trúc rõ ràng */}
            {heroSlides?.[0]?.image_url && <link rel="preload" as="image" href={heroSlides[0].image_url} fetchPriority="high" />}
            <AngkorParallaxHero slides={heroSlides || []} settings={settings} />

            {/* 2. Architecture Showcase — grid kiến trúc from about_sections */}
            <AngkorArchShowcase aboutSections={aboutSections || []} />

            {/* 3. Event List — timeline 2-cột, data server-side */}
            <AngkorEventList events={events || []} />

            {/* 4. Dharma Scroll — danh sách pháp thoại tối nền nâu */}
            <AngkorDharmaScroll talks={dharmaTalks || []} />

            {/* 5. Newspaper — layout báo cổ ivory, data server-side */}
            <AngkorNewspaper news={news || []} locale={locale} />
        </>
    );
}
