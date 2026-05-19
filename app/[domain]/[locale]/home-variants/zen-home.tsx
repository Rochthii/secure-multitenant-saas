import dynamic from 'next/dynamic';
import { getCachedHeroSlides, getCachedDharmaTalks } from '@/lib/cache/queries';
import { getSiteSettings } from '@/lib/site-settings';
import { generatePlaceSchema, generateOrganizationSchema } from '@/lib/seo/json-ld';

// ──────────────────────────────────────────────────────────
// Layout: zen — Anapanasati (Hơi Thở Thiền)
// Triết lý: Xanh lá rừng + trắng + vàng nhẹ, thiên nhiên, khoảnh khắc hiện tại, hơi thở
// Sections: Fullscreen Nature Hero (ảnh rừng/ao sen), Breathing Animation, Tu Học Cards, Gallery Fade-in
// ──────────────────────────────────────────────────────────
import { ZenNatureHero } from '@/components/sections/zen/ZenNatureHero';
import { ZenBreathingBanner } from '@/components/sections/zen/ZenBreathingBanner';
import { ZenStudyCards } from '@/components/sections/zen/ZenStudyCards';
import { ZenDharmaPlayer } from '@/components/sections/zen/ZenDharmaPlayer';
import { ZenNewsSection } from '@/components/sections/zen/ZenNewsSection';
import { ZenCTA } from '@/components/sections/zen/ZenCTA';

export default async function ZenHome({ locale, tenantId }: { locale: string; tenantId: string }) {
    const { getTenantBaseUrl } = await import('@/lib/utils/seo');
    const baseUrl = getTenantBaseUrl((tenantId as any)?.domain || '');
    const [heroSlides, dharmaTalks, settings] = await Promise.all([
        getCachedHeroSlides(tenantId),
        getCachedDharmaTalks(8, tenantId),
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

            {/* 1. Nature Fullscreen Hero — ảnh thiên nhiên, overlay mỏng, chữ nhỏ thanh thoát */}
            {heroSlides?.[0]?.image_url && <link rel="preload" as="image" href={heroSlides[0].image_url} fetchPriority="high" />}
            <ZenNatureHero slides={heroSlides || []} settings={settings} />

            {/* 2. Breathing Animation Banner — vòng tròn pháp hơi thở, chỉ dẫn thiền */}
            <ZenBreathingBanner />

            {/* 3. Tu Học Cards — 6 card xanh lá, icon thiên nhiên, link tới tài liệu tu học */}
            <ZenStudyCards tenantId={tenantId} />

            {/* 4. Pháp Thoại Player xanh thiên nhiên */}
            <ZenDharmaPlayer talks={dharmaTalks || []} />

            {/* 5. Tin tức dạng text-card sáng, font nhỏ, line-height rộng */}
            <ZenNewsSection locale={locale} />

            {/* 6. CTA Đóng góp — nền rừng xanh nhạt */}
            <ZenCTA />
        </>
    );
}
