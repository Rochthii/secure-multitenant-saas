import { Metadata } from 'next';
import { getTenantConfig } from '@/lib/tenant';
import { getTenantBaseUrl } from '@/lib/utils/seo';

export async function generateMetadata({ params }: { params: Promise<{ domain: string; locale: string }> }): Promise<Metadata> {
    const { domain, locale } = await params;
    const tenant = await getTenantConfig(domain);
    const tenantBaseUrl = getTenantBaseUrl(domain);
    const siteName = tenant?.name || 'Chi nhánh Khmer';

    return {
        title: `Văn hóa Phật giáo Nam Tông Khmer | ${siteName}`,
        description: `Khám phá văn hóa, nghi lễ, bản sắc Khmer và những nét đặc trưng của Phật giáo Nam Tông tại ${siteName}. Hướng dẫn nghi lễ cơ bản, nội quy tự viện và di sản ngàn năm.`,
        alternates: {
            canonical: `${tenantBaseUrl}/${locale}/van-hoa`,
            languages: {
                'vi-VN': `${tenantBaseUrl}/vi/van-hoa`,
                'km-KH': `${tenantBaseUrl}/km/van-hoa`,
                'en-US': `${tenantBaseUrl}/en/van-hoa`,
            },
        },
        openGraph: {
            title: `Văn hóa Phật giáo Nam Tông Khmer | ${siteName}`,
            description: `Nghi lễ cơ bản, bản sắc Khmer, nên và không nên khi đến chi nhánh — tất cả tại ${siteName}.`,
            url: `${tenantBaseUrl}/${locale}/van-hoa`,
        },
    };
}

export default function VanHoaLayout({ children }: { children: React.ReactNode }) {
    return children;
}
