'use server';

import { createClient } from '@/lib/supabase/server';
import { unstable_cache } from 'next/cache';

/**
 * Gets cached visitor statistics from real database data.
 * - Total page views: aggregated from page_views table
 * 
 * Note: "Online" count is not tracked server-side to save Vercel CPU.
 * Use Vercel Web Analytics or PostHog for real-time online users.
 */
export async function getVisitorStats() {
    return getCachedVisitorStats();
}

/**
 * No-op: Visit tracking disabled to save Vercel CPU/DB costs.
 * Use Vercel Web Analytics (@vercel/analytics) or PostHog instead.
 */
export async function trackVisit(_path: string) {
    return;
}

const getCachedVisitorStats = unstable_cache(
    async () => {
        try {
            const supabase = await createClient();
            const sb = supabase as any;

            const { data: totalData } = await sb
                .from('page_views')
                .select('view_count');

            const totalViews = totalData?.reduce((acc: number, curr: any) => acc + (curr.view_count || 0), 0) || 0;

            return {
                online: 0,
                total: totalViews
            };
        } catch (e) {
            console.error('Error fetching visitor stats:', e);
            return { online: 0, total: 0 };
        }
    },
    ['global-visitor-stats'],
    { revalidate: 3600, tags: ['visitor-stats'] }
);
