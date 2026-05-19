import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { getCachedHeroSlides, getCachedDharmaTalks } from '@/lib/cache/queries';
import { getSiteSettings } from '@/lib/site-settings';
import { generatePlaceSchema, generateOrganizationSchema } from '@/lib/seo/json-ld';

// ──────────────────────────────────────────────────────────
// Layout: minimal — Vedanā Thuần Khiết
// Triết lý: Typography-first, khoảng trắng, không ảnh to, chữ là vương.
// Màu: Trắng ngà + vàng tối (B8860B) + nền sáng tuyền
// ──────────────────────────────────────────────────────────

import { MinimalHeroText } from '@/components/sections/minimal/MinimalHeroText';
import { MinimalNewsList } from '@/components/sections/minimal/MinimalNewsList';
import { MinimalDharmaList } from '@/components/sections/minimal/MinimalDharmaList';
import { MinimalEventCalendar } from '@/components/sections/minimal/MinimalEventCalendar';
import { MinimalCTA } from '@/components/sections/minimal/MinimalCTA';

export default async function MinimalHome({ locale, tenantId }: { locale: string; tenantId: string }) {
    const { getTenantBaseUrl } = await import('@/lib/utils/seo');
    const baseUrl = getTenantBaseUrl((tenantId as any)?.domain || '');
    const [dharmaTalks, settings] = await Promise.all([
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

            {/* 1. Hero: Typography lớn, không ảnh — bản văn thiền định */}
            <MinimalHeroText siteName={settings['site_name_vi']} siteDescription={settings['site_description_vi']} locale={locale} />

            {/* 2. Tin tức dạng danh sách đọc báo (text-first) */}
            <MinimalNewsList locale={locale} />

            {/* 3. Pháp Thoại list đơn giản */}
            <MinimalDharmaList talks={dharmaTalks || []} />

            {/* 4. Sự kiện / Lịch bản kinh nhỏ gọn */}
            <MinimalEventCalendar locale={locale} />

            {/* 5. CTA thuần text */}
            <MinimalCTA />
        </>
    );
}
