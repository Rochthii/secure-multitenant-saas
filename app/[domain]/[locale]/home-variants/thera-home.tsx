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
// Layout: theravāda — Hệ tư tưởng nguyên thủy
// Triết lý: Thanh tịnh, trang nghiêm, ấm áp (nâu/vàng/kem)
// Typography: Serif (Merriweather) làm trọng tâm
// Sections:
//   1. TheraHero           — split 50/50 ảnh trái text phải
//   2. TheraFeature        — tin tức editorial 1 main + 2 phụ
//   3. TheraDharmaTalks    — nền tối #5C432A, số thứ tự vàng lớn
//   4. TheraQuoteBanner    — câu kinh centered, plug-and-play
//   5. TheraEventGrid      — grid sự kiện 3-col nền kem nhạt
//   6. TheraContactStrip   — footer strip nâu tối, địa chỉ + CTA
// ──────────────────────────────────────────────────────────

import { TheraHero } from '@/components/sections/thera/TheraHero';
import { TheraFeature } from '@/components/sections/thera/TheraFeature';
import { TheraDharmaTalks } from '@/components/sections/thera/TheraDharmaTalks';
import { TheraQuoteBanner } from '@/components/sections/thera/TheraQuoteBanner';
import { TheraEventGrid } from '@/components/sections/thera/TheraEventGrid';
import { TheraContactStrip } from '@/components/sections/thera/TheraContactStrip';

export default async function TheraHome({ locale, tenantId }: { locale: string; tenantId: string }) {
    const { getTenantBaseUrl } = await import('@/lib/utils/seo');
    const baseUrl = getTenantBaseUrl((tenantId as any)?.domain || '');

    // Fetch toàn bộ data server-side
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
        name: settings['site_name_vi'] || (isCompany ? 'Công ty thành viên' : 'Chi nhánh Phật giáo Nam tông Theravāda'),
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

    const quote = settings['home_quote'] || settings['site_description_vi'] || undefined;
    const quoteAttribution = settings['home_quote_attribution'] || (isCompany ? 'Triết lý kinh doanh' : 'Kinh Pháp Cú');

    return (
        <div style={{ backgroundColor: '#FFF9F0' }}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationSchema }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: generatePlaceSchema() }} />

            {/* Preload LCP image */}
            {heroSlides?.[0]?.image_url && (
                <link rel="preload" as="image" href={heroSlides[0].image_url} fetchPriority="high" />
            )}

            {/* 1. Hero — split 50/50 */}
            <TheraHero slides={heroSlides || []} settings={settings} />

            {/* 2. Tin tức nổi bật — 1 main + 2 phụ */}
            <TheraFeature news={news || []} />

            {/* 3. Pháp thoại — dark background with gold numbers */}
            <TheraDharmaTalks talks={dharmaTalks || []} />

            {/* 4. Câu kinh / quote — plug-and-play */}
            <TheraQuoteBanner 
                quote={quote}
                attribution={quoteAttribution}
            />

            {/* 5. Lịch Phật sự — grid 3 cột */}
            <TheraEventGrid upcomingEvents={upcomingEvents || []} />

            {/* 6. Footer strip — địa chỉ, lịch lễ, CTA */}
            <TheraContactStrip settings={settings} siteName={settings['site_name_vi']} />
        </div>
    );
}
