import { getTenantConfig } from '@/lib/tenant';
import { setRequestLocale } from 'next-intl/server';
import DynamicPageBuilder from './home-variants/dynamic-page-builder';
import { DEFAULT_LAYOUT_BLOCKS, DEFAULT_COMPANY_BLOCKS, DEFAULT_TECH_BLOCKS } from '@/lib/types/layout-blocks';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/site-settings';
import { getTenantBaseUrl } from '@/lib/utils/seo';

// Vĩnh viễn (On-demand): Chỉ revalidate khi Admin lưu thay đổi (revalidateTag)
export const revalidate = false;

import AiPortalClient from './home-variants/ai-portal-client';

export async function generateMetadata({ params }: { params: Promise<{ domain: string; locale: string }> }): Promise<Metadata> {
    const { domain, locale } = await params;
    const tenant = await getTenantConfig(domain);
    if (!tenant) return { title: 'Trang chủ' };

    const settings = await getSiteSettings(tenant.id);
    const siteName = settings['site_name_vi'] || tenant.name || 'Workspace Doanh nghiệp';
    const isCompany = tenant?.tenant_type !== 'tenant';
    const tenantBaseUrl = getTenantBaseUrl(domain);

    const description = settings['site_description_vi'] || `${siteName} — Hệ thống quản trị nội bộ công nghệ phụng sự doanh nghiệp`;

    const ogImage = settings['site_og_image'] || tenant.logo_url || `${tenantBaseUrl}/default-og-image.jpg`;

    return {
        title: {
            absolute: `${siteName} — ${description}`,
        },
        description,
        openGraph: {
            title: siteName,
            description,
            url: `${tenantBaseUrl}/${locale}`,
            images: [{ url: ogImage, width: 1200, height: 630, alt: siteName }],
            type: 'website',
        },
        alternates: {
            canonical: `${tenantBaseUrl}/${locale}`,
            languages: {
                'vi-VN': `${tenantBaseUrl}/vi`,
                'km-KH': `${tenantBaseUrl}/km`,
                'en-US': `${tenantBaseUrl}/en`,
            },
        },
    };
}

export default async function HomePage({ params }: { params: Promise<{ domain: string; locale: string }> }) {
    const { domain, locale } = await params;
    setRequestLocale(locale);

    const tenant = await getTenantConfig(domain);

    // Nếu không tìm thấy chi nhánh cho tên miền này -> 404
    if (!tenant) {
        const { notFound } = await import('next/navigation');
        notFound();
    }

    const isHomeContext = true;

    const tenantId = tenant!.id;
    const isCompany = tenant?.tenant_type !== 'tenant';
    const layoutStyle = tenant!.layout_style || 'saas_violet';

    // Nếu là chế độ AI Portal riêng biệt
    if (layoutStyle === 'ai_portal') {
        return <AiPortalClient tenantId={tenantId} domain={domain} locale={locale} settings={tenant!} />;
    }

    // ─── Lấy Blocks cấu hình từ DB hoặc Defaults —————————————————──────────────
    // Nếu có blocks tùy chỉnh trong DB thì dùng, nếu không thì lấy blocks mặc định của theme đó
    const defaultBlocks = layoutStyle === 'modern_tech'
        ? DEFAULT_TECH_BLOCKS
        : isCompany
            ? DEFAULT_COMPANY_BLOCKS
            : DEFAULT_LAYOUT_BLOCKS;
    const blocks = tenant?.layout_blocks || defaultBlocks;

    return (
        <DynamicPageBuilder
            blocks={blocks}
            locale={locale}
            tenantId={tenantId}
            domain={domain}
        />
    );
}
