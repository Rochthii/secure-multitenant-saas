import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { getCachedHeroSlides, getCachedDharmaTalks } from '@/lib/cache/queries';
import { getSiteSettings } from '@/lib/site-settings';
import { generatePlaceSchema, generateOrganizationSchema } from '@/lib/seo/json-ld';

// ──────────────────────────────────────────────────────────
// Layout: lotus — Champa Neak (Hoa Sứ Khmer)
// Triết lý: Màu đỏ son + cam vàng, hoa văn lá Bồ Đề, văn hóa Khmer sống động
// Sections: Collage Hero ngang, Event Horizontal Scroll, Culture Gallery, Pháp Âm Poster Card
// ──────────────────────────────────────────────────────────
import { LotusCollageHero } from '@/components/sections/lotus/LotusCollageHero';
import { LotusEventScroll } from '@/components/sections/lotus/LotusEventScroll';
import { LotusCultureGallery } from '@/components/sections/lotus/LotusCultureGallery';
import { LotusDharmaPoster } from '@/components/sections/lotus/LotusDharmaPoster';
import { LotusNewsGrid } from '@/components/sections/lotus/LotusNewsGrid';

export default async function LotusHome({ locale, tenantId }: { locale: string; tenantId: string }) {
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

            {/* 1. Collage Hero: 3-4 ảnh ghép + nền hoa văn Khmer SVG */}
            {heroSlides?.[0]?.image_url && <link rel="preload" as="image" href={heroSlides[0].image_url} fetchPriority="high" />}
            <LotusCollageHero slides={heroSlides || []} settings={settings} />

            {/* 2. Sự kiện cuộn ngang — card màu đỏ son */}
            <LotusEventScroll locale={locale} />

            {/* 3. Gallery văn hóa Khmer — masonry ảnh */}
            <LotusCultureGallery />

            {/* 4. Pháp Thoại Poster Card — 3 cards lớn kiểu poster */}
            <LotusDharmaPoster talks={dharmaTalks || []} />

            {/* 5. Tin tức grid đỏ son */}
            <LotusNewsGrid locale={locale} />
        </>
    );
}
