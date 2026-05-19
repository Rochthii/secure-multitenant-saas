/**
 * API Route: /api/sections/news-events
 * Tráº£ vá» news + events cho homepage section.
 * Chá»‰ Ä‘Æ°á»£c gá»i khi user scroll Ä‘áº¿n section Ä‘Ã³ (lazy load).
 * Káº¿t quáº£ Ä‘Æ°á»£c cache phÃ­a client trong sessionStorage.
 */
import { NextResponse } from 'next/server';
import { getCachedNews, getCachedUpcomingEvents } from '@/lib/cache/queries';
import { getTenantConfig } from '@/lib/tenant';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic'; // Uses headers() â€” cannot be static


export async function GET() {
    try {
        const headersList = await headers();
        const host = headersList.get('host') || '';
        const tenant = await getTenantConfig(host);
        const tenantId = tenant?.id;

        const [news, events] = await Promise.all([
            getCachedNews(9, tenantId),
            getCachedUpcomingEvents(4, tenantId),
        ]);

        return NextResponse.json(
            { news, events },
            {
                headers: {
                    // Xóa cache API hoàn toàn để bài mới hiện ngay lập tức
                    // Dữ liệu đã được cache ở server RAM qua unstable_cache nên không tốn CPU DB
                    'Cache-Control': 'no-store, max-age=0, must-revalidate',
                },
            }
        );
    } catch (error) {
        console.error('[API] news-events error:', error);
        return NextResponse.json({ news: [], events: [] }, { status: 200 });
    }
}
