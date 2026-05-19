import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getTenantBaseUrl, escapeXml } from '@/lib/utils/seo';
import { createClient } from '@/lib/supabase/server';
import { getTenantConfig } from '@/lib/tenant';

const ITEMS_PER_SITEMAP = 10000;
const LOCALES = ['vi', 'en', 'km'] as const;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0', 10);
    
    const supabase = await createClient();
    const headersList = await headers();
    const domain = headersList.get('host') || '';
    const baseUrl = getTenantBaseUrl(domain);
    const tenant = await getTenantConfig(domain);
    const tenantId = tenant?.id;

    const start = page * ITEMS_PER_SITEMAP;
    const end = start + ITEMS_PER_SITEMAP - 1;

    // Query news WITH category slug to build correct URL path
    let query = supabase
        .from('news')
        .select('id, slug, updated_at, title_vi, categories!inner(slug)')
        .eq('status', 'published')
        .range(start, end);

    if (tenantId) {
        query = query.or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`);
    }

    const { data: news } = await query;
    const siteName = tenant?.name || 'Hệ thống';

    // Build URLs with hreflang alternates for each news item
    const urlsXml = (news || []).map(item => {
        const categorySlug = (item as any).categories?.slug;
        const newsSlug = item.slug || item.id;
        // Build full path: /tin-tuc/category-slug/news-slug or /tin-tuc/news-slug
        const pathSuffix = categorySlug ? `${categorySlug}/${newsSlug}` : newsSlug;

        const hreflangLinks = LOCALES.map(locale =>
            `        <xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(`${baseUrl}/${locale}/tin-tuc/${pathSuffix}`)}"/>`
        ).join('\n');
        const xDefault = `        <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(`${baseUrl}/vi/tin-tuc/${pathSuffix}`)}"/>`;

        return `    <url>
        <loc>${escapeXml(`${baseUrl}/vi/tin-tuc/${pathSuffix}`)}</loc>
        <news:news>
            <news:publication>
                <news:name>${escapeXml(siteName)}</news:name>
                <news:language>vi</news:language>
            </news:publication>
            <news:publication_date>${item.updated_at ? new Date(item.updated_at).toISOString() : new Date().toISOString()}</news:publication_date>
            <news:title>${escapeXml(item.title_vi || 'Tin tức')}</news:title>
        </news:news>
        <lastmod>${item.updated_at ? new Date(item.updated_at).toISOString() : new Date().toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
${hreflangLinks}
${xDefault}
    </url>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlsXml}
</urlset>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'text/xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
        }
    });
}
