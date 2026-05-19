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

    let query = supabase.from('events').select('id, slug, updated_at').in('status', ['upcoming', 'ongoing', 'completed']).range(start, end);
    if (tenantId) {
        query = query.or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`);
    }

    const { data: events } = await query;

    // Build URLs with hreflang alternates
    const urlsXml = (events || []).map(item => {
        const itemSlug = item.slug || item.id;

        const hreflangLinks = LOCALES.map(locale =>
            `        <xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(`${baseUrl}/${locale}/lich-le/${itemSlug}`)}"/>`
        ).join('\n');
        const xDefault = `        <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(`${baseUrl}/vi/lich-le/${itemSlug}`)}"/>`;

        return `    <url>
        <loc>${escapeXml(`${baseUrl}/vi/lich-le/${itemSlug}`)}</loc>
        <lastmod>${item.updated_at ? new Date(item.updated_at).toISOString() : new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.6</priority>
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
            'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
        }
    });
}
