import dynamic from 'next/dynamic';
import { getCachedHeroSlides, getCachedDharmaTalks } from '@/lib/cache/queries';
import { getSiteSettings } from '@/lib/site-settings';
import { generatePlaceSchema, generateOrganizationSchema } from '@/lib/seo/json-ld';

// ──────────────────────────────────────────────────────────
// Layout: festival — Bon Khmer (Lễ Hội Khmer)
// Triết lý: Tím sậm + vàng rực + tím sáng — không khí lễ hội, năng động, ánh đèn lồng đêm hội
// Sections: Countdown Hero (lễ hội tiếp theo), Lễ Hội Cards cuộn ngang, Dark Dharma Player, Gallery Pháo Hoa
// ──────────────────────────────────────────────────────────
import { FestivalCountdownHero } from '@/components/sections/festival/FestivalCountdownHero';
import { FestivalEventCards } from '@/components/sections/festival/FestivalEventCards';
import { FestivalDharmaPlayer } from '@/components/sections/festival/FestivalDharmaPlayer';
import { FestivalGallery } from '@/components/sections/festival/FestivalGallery';
import { FestivalNewsSection } from '@/components/sections/festival/FestivalNewsSection';

export default async function FestivalHome({ locale, tenantId }: { locale: string; tenantId: string }) {
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

            {/* 1. Countdown Hero — đếm ngược đến lễ hội tiếp theo, nền tím sậm, đèn lồng animated */}
            <FestivalCountdownHero slides={heroSlides || []} settings={settings} tenantId={tenantId} />

            {/* 2. Lễ Hội Cards cuộn ngang — card tím gradient với ảnh lễ hội */}
            <FestivalEventCards locale={locale} />

            {/* 3. Pháp Thoại Player tím/đen — glow neon effect */}
            <FestivalDharmaPlayer talks={dharmaTalks || []} />

            {/* 4. Gallery Lễ Hội — masonry dark mode ảnh lễ hội Khmer */}
            <FestivalGallery />

            {/* 5. Tin tức trên nền tím sậm */}
            <FestivalNewsSection locale={locale} />
        </>
    );
}
