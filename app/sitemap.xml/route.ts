import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getTenantBaseUrl } from '@/lib/utils/seo';
import { createClient } from '@/lib/supabase/server';
import { getTenantConfig } from '@/lib/tenant';

const ITEMS_PER_SITEMAP = 10000;

export async function GET() {
    const supabase = await createClient();
    const headersList = await headers();
    const domain = headersList.get('host') || '';
    const baseUrl = getTenantBaseUrl(domain);
    const tenant = await getTenantConfig(domain);
    const tenantId = tenant?.id;

    const now = new Date().toISOString();
    
    // Count items accurately for pagination
    let newsQuery = supabase.from('news').select('id', { count: 'exact', head: true }).eq('status', 'published');
    let eventsQuery = supabase.from('events').select('id', { count: 'exact', head: true }).in('status', ['upcoming', 'ongoing', 'completed']);
    let dharmaQuery = supabase.from('dharma_talks').select('id', { count: 'exact', head: true }).eq('is_active', true);
    let projectsQuery = supabase.from('transaction_projects').select('id', { count: 'exact', head: true }).in('status', ['ongoing', 'completed']);
    
    if (tenantId) {
        newsQuery = newsQuery.or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`);
        eventsQuery = eventsQuery.or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`);
        dharmaQuery = dharmaQuery.or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`);
        projectsQuery = projectsQuery.or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`);
    }

    const [newsRes, eventsRes, dharmaRes, projectsRes] = await Promise.all([newsQuery, eventsQuery, dharmaQuery, projectsQuery]);
    
    const newsPages = Math.ceil((newsRes.count || 0) / ITEMS_PER_SITEMAP) || 1;
    const eventsPages = Math.ceil((eventsRes.count || 0) / ITEMS_PER_SITEMAP) || 1;
    const dharmaPages = Math.ceil((dharmaRes.count || 0) / ITEMS_PER_SITEMAP) || 1;
    const projectsPages = Math.ceil((projectsRes.count || 0) / ITEMS_PER_SITEMAP) || 1;

    let sitemapNodes = `    <sitemap>
        <loc>${baseUrl}/sitemap-pages.xml</loc>
        <lastmod>${now}</lastmod>
    </sitemap>\n`;

    for (let i = 0; i < newsPages; i++) {
        sitemapNodes += `    <sitemap>
        <loc>${baseUrl}/sitemap-news.xml?page=${i}</loc>
        <lastmod>${now}</lastmod>
    </sitemap>\n`;
    }

    for (let i = 0; i < eventsPages; i++) {
        sitemapNodes += `    <sitemap>
        <loc>${baseUrl}/sitemap-events.xml?page=${i}</loc>
        <lastmod>${now}</lastmod>
    </sitemap>\n`;
    }

    for (let i = 0; i < dharmaPages; i++) {
        sitemapNodes += `    <sitemap>
        <loc>${baseUrl}/sitemap-dharma.xml?page=${i}</loc>
        <lastmod>${now}</lastmod>
    </sitemap>\n`;
    }

    for (let i = 0; i < projectsPages; i++) {
        sitemapNodes += `    <sitemap>
        <loc>${baseUrl}/sitemap-projects.xml?page=${i}</loc>
        <lastmod>${now}</lastmod>
    </sitemap>\n`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapNodes}</sitemapindex>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'text/xml',
            // Cache 1 hour at edge, stale-while-revalidate for 1 day
            'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
        }
    });
}
