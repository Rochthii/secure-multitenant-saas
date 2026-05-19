import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getTenantBaseUrl, escapeXml } from '@/lib/utils/seo';

const LOCALES = ['vi', 'en', 'km'] as const;

export async function GET() {
    const headersList = await headers();
    const domain = headersList.get('host') || '';
    const baseUrl = getTenantBaseUrl(domain);
    const now = new Date().toISOString();

    const staticRoutes = [
        { path: '', priority: 1.0, freq: 'daily' },
        { path: '/gioi-thieu', priority: 0.8, freq: 'weekly' },
        { path: '/giai-phap', priority: 0.8, freq: 'weekly' },
        { path: '/dong-hanh', priority: 0.7, freq: 'weekly' },
        { path: '/tin-tuc', priority: 0.8, freq: 'daily' },
        { path: '/su-kien', priority: 0.8, freq: 'daily' },
        { path: '/documents', priority: 0.7, freq: 'weekly' },
        { path: '/tam-bao', priority: 0.7, freq: 'weekly' },
        { path: '/minh-bach', priority: 0.9, freq: 'daily' },
        { path: '/transactions', priority: 0.8, freq: 'weekly' },
        { path: '/van-hoa', priority: 0.7, freq: 'weekly' },
        { path: '/lien-he', priority: 0.6, freq: 'monthly' },
    ];

    // Build URLs with hreflang alternates for each static route
    const urlsXml = staticRoutes.map(route => {
        const hreflangLinks = LOCALES.map(locale =>
            `        <xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(`${baseUrl}/${locale}${route.path}`)}"/>`
        ).join('\n');
        const xDefault = `        <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(`${baseUrl}/vi${route.path}`)}"/>`;

        return `    <url>
        <loc>${escapeXml(`${baseUrl}/vi${route.path}`)}</loc>
        <lastmod>${now}</lastmod>
        <changefreq>${route.freq}</changefreq>
        <priority>${route.priority}</priority>
${hreflangLinks}
${xDefault}
    </url>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlsXml}
</urlset>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'text/xml',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800'
        }
    });
}
