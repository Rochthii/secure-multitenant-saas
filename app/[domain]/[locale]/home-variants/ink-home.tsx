import {
    getCachedHeroSlides,
    getCachedDharmaTalks,
    getCachedNews,
    getCachedUpcomingEvents,
} from '@/lib/cache/queries';
import { getSiteSettings } from '@/lib/site-settings';
import { generatePlaceSchema, generateOrganizationSchema } from '@/lib/seo/json-ld';
import { getTenantConfig } from '@/lib/tenant';

// ──────────────────────────────────────────────────────────
// Layout: ink — Editorial Magazine Á Đông
// Triết lý: Trắng tinh + đen ink + 1 accent đỏ son #C41E3A
//            Bố cục bất đối xứng kiểu tạp chí cao cấp
// Mobile-first: 90% người dùng trên điện thoại
// Sections:
//   1. InkHero           — split 60/40, ảnh trái text phải
//   2. InkFeatureStory   — editorial news: 1 main + 2 phụ
//   3. InkDharmaBand     — dark band, pháp thoại numbered
//   4. InkQuoteBanner    — câu kinh centered, plug-and-play
//   5. InkEventGrid      — grid sự kiện 3-col, border-top hover
//   6. InkContactStrip   — footer strip đen, địa chỉ + CTA
// ──────────────────────────────────────────────────────────

import { InkHero } from '@/components/sections/ink/InkHero';
import { InkFeatureStory } from '@/components/sections/ink/InkFeatureStory';
import { InkDharmaBand } from '@/components/sections/ink/InkDharmaBand';
import { InkQuoteBanner } from '@/components/sections/ink/InkQuoteBanner';
import { InkEventGrid } from '@/components/sections/ink/InkEventGrid';
import { InkContactStrip } from '@/components/sections/ink/InkContactStrip';

export default async function InkHome({ locale, tenantId }: { locale: string; tenantId: string }) {
    const { getTenantBaseUrl } = await import('@/lib/utils/seo');
    const baseUrl = getTenantBaseUrl((tenantId as any)?.domain || '');

    // ── Fetch toàn bộ data server-side — unstable_cache warm = 0 CPU ──
    const tenantConfig = await getTenantConfig((tenantId as any)?.domain || '');
    const isCompany = tenantConfig?.tenant_type !== 'tenant';

    const [heroSlides, dharmaTalks, news, upcomingEvents, settings] = await Promise.all([
        getCachedHeroSlides(tenantId),
        getCachedDharmaTalks(5, tenantId),
        getCachedNews(6, tenantId),
        getCachedUpcomingEvents(6, tenantId),
        getSiteSettings(tenantId),
    ]);

    const organizationSchema = generateOrganizationSchema({
        name: settings['site_name_vi'] || (isCompany ? 'Công ty thành viên' : 'Chi nhánh Phật giáo Nam tông'),
        alternateName: settings['site_name_km'] || '',
        url: baseUrl,
        logo: settings['site_logo'] || `${baseUrl}/logo.png`,
        description: settings['site_description_vi'] || '',
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

    // Quote từ settings hoặc default
    const quote = settings['home_quote'] || settings['site_description_vi'] || undefined;
    const quoteAttribution = settings['home_quote_attribution'] || (isCompany ? 'Sứ mệnh cốt lõi' : 'Kinh Pháp Cú');

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationSchema }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: generatePlaceSchema() }} />

            {/* Preload LCP image */}
            {heroSlides?.[0]?.image_url && (
                <link rel="preload" as="image" href={heroSlides[0].image_url} fetchPriority="high" />
            )}

            {/* 1. Hero — split editorial, ảnh trái / text phải */}
            <InkHero slides={heroSlides || []} settings={settings} />

            {/* 2. Tin tức nổi bật — 1 main + 2 phụ, data từ DB */}
            <InkFeatureStory news={news || []} />

            {/* 3. Pháp thoại — dark band, numbered list */}
            <InkDharmaBand talks={dharmaTalks || []} />

            {/* 4. Câu kinh / quote thiền định — plug-and-play */}
            <InkQuoteBanner
                quote={quote}
                attribution={quoteAttribution}
                subAttribution={isCompany ? 'Core Values' : 'Dhammapada'}
            />

            {/* 5. Lịch Phật sự — grid 3 cột sự kiện từ DB */}
            <InkEventGrid upcomingEvents={upcomingEvents || []} />

            {/* 6. Footer strip — địa chỉ, giờ lễ, CTA */}
            <InkContactStrip settings={settings} siteName={settings['site_name_vi']} />
        </>
    );
}
