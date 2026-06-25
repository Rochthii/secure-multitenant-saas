import { unstable_cache } from 'next/cache';
import { getPublicClient, TTL, type EventRow } from './shared';
import { createClient } from '@/lib/supabase/server';
import { getVietnamDateString, getVietnamMonthRange } from '@/lib/utils/date';

// ─── Upcoming Events ─────────────────────────────────────────────────────────
export const getCachedUpcomingEvents = async (limit = 4, tenantId?: string): Promise<EventRow[]> => {
    try {
        const safeLimit = Math.max(1, Math.min(limit, 100));
        
        return await unstable_cache(
            async () => {
                const supabase = getPublicClient();
                const today = getVietnamDateString();
                let query = supabase
                    .from('events')
                    .select('*')
                    .or('approval_status.eq.approved,status.eq.published')
                    .gte('start_date', today);

                if (tenantId) {
                    query = query.or(`tenant_id.eq.${tenantId},tenant_id.eq.55555555-5555-5555-5555-555555555555,published_to.cs.{${tenantId}}`);
                }

                const { data, error } = await query
                    .order('start_date', { ascending: true })
                    .limit(safeLimit);

                if (error) {
                    console.error('[Cache] events error:', error.message);
                    return [];
                }
                return (data ?? []) as EventRow[];
            },
            ['upcoming-events-v3', safeLimit.toString(), tenantId || 'all'],
            { revalidate: TTL.EVENTS, tags: ['events', tenantId ? `events-${tenantId}` : 'events-all'] }
        )();
    } catch (e) {
        console.error('[Cache] Critical error in getCachedUpcomingEvents:', e);
        return [];
    }
};

// ─── Next Major Festival ─────────────────────────────────────────────────────
export const getCachedNextMajorFestival = async (tenantId?: string): Promise<EventRow | null> => {
    try {
        return await unstable_cache(
            async () => {
                const supabase = getPublicClient();
                const today = getVietnamDateString();
                let query = supabase
                    .from('events')
                    .select('*')
                    .or('approval_status.eq.approved,status.eq.published')
                    .eq('is_major_festival' as any, true)
                    .gte('start_date', today);

                if (tenantId) {
                    query = query.or(`tenant_id.eq.${tenantId},tenant_id.eq.55555555-5555-5555-5555-555555555555,published_to.cs.{${tenantId}}`);
                }

                const { data, error } = await query
                    .order('start_date', { ascending: true })
                    .limit(1)
                    .maybeSingle();

                if (error) {
                    console.error('[Cache] next_major_festival error:', error.message);
                    return null;
                }
                return data as EventRow | null;
            },
            ['next-major-festival-v2', tenantId || 'all'],
            { revalidate: TTL.EVENTS, tags: ['events', tenantId ? `events-${tenantId}` : 'events-all'] }
        )();
    } catch (e) {
        console.error('[Cache] Critical error in getCachedNextMajorFestival:', e);
        return null;
    }
};

// ─── Month Events ────────────────────────────────────────────────────────────
export const getCachedMonthEvents = async (year: number, month: number, tenantId?: string): Promise<EventRow[]> => {
    try {
        if (!year || year < 1900 || year > 2100 || !month || month < 1 || month > 12) {
            console.warn(`[Cache] Invalid year/month for getCachedMonthEvents: ${year}/${month}`);
            return [];
        }

        return await unstable_cache(
            async () => {
                const supabase = getPublicClient();
                
                const start = new Date(year, month - 1, 1);
                const end = new Date(year, month, 0);
                
                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                    return [];
                }

                const startDate = start.toISOString().split('T')[0];
                const endDate = end.toISOString().split('T')[0];

                let query = supabase
                    .from('events')
                    .select('*')
                    .neq('approval_status', 'rejected') 
                    .gte('start_date', startDate)
                    .lte('start_date', endDate);

                if (tenantId) {
                    query = query.or(`tenant_id.eq.${tenantId},tenant_id.eq.55555555-5555-5555-5555-555555555555,published_to.cs.{${tenantId}}`);
                }

                const { data, error } = await query;

                if (error) {
                    console.error('[Cache] month_events error:', error.message);
                    return [];
                }
                return (data ?? []) as EventRow[];
            },
            ['month-events-v4', year.toString(), month.toString(), tenantId || 'all'],
            { revalidate: TTL.EVENTS, tags: ['events', tenantId ? `events-${tenantId}` : 'events-all'] }
        )();
    } catch (e) {
        console.error('[Cache] Critical error in getCachedMonthEvents:', e);
        return [];
    }
};

// ─── Events Paginated (lich-le page) ─────────────────────────────────────────
export const getCachedEventsPage = async (
    filter: string,
    page: number,
    itemsPerPage: number,
    tenantId?: string
): Promise<{ events: EventRow[]; total: number }> => {
    try {
        return await unstable_cache(
            async () => {
                const supabase = getPublicClient();
                const start = (page - 1) * itemsPerPage;
                const end = start + itemsPerPage - 1;

                const todayStr = getVietnamDateString();
                const { start: thisMonthStart, end: thisMonthEnd } = getVietnamMonthRange(0);
                const { start: nextMonthStart, end: nextMonthEnd } = getVietnamMonthRange(1);

                let query = supabase
                    .from('events')
                    .select('*, excerpt_vi, excerpt_km, excerpt_en', { count: 'exact' })
                    .neq('status', 'cancelled');

                if (tenantId) {
                    query = query.or(`tenant_id.eq.${tenantId},tenant_id.eq.55555555-5555-5555-5555-555555555555,published_to.cs.{${tenantId}}`);
                }

                switch (filter) {
                    case 'past':
                        query = query.lt('start_date', todayStr).order('start_date', { ascending: false });
                        break;
                    case 'this-month':
                        query = query.gte('start_date', thisMonthStart).lte('start_date', thisMonthEnd).order('start_date', { ascending: true });
                        break;
                    case 'next-month':
                        query = query.gte('start_date', nextMonthStart).lte('start_date', nextMonthEnd).order('start_date', { ascending: true });
                        break;
                    default: // 'upcoming'
                        query = query.gte('start_date', todayStr).order('start_date', { ascending: true });
                }

                const { data, count, error } = await query.range(start, end);

                if (error) {
                    console.error('[Cache] events_page error:', error.message);
                    return { events: [], total: 0 };
                }
                return { events: (data ?? []) as EventRow[], total: count ?? 0 };
            },
            ['events-page-v3', filter, page.toString(), itemsPerPage.toString(), tenantId || 'all'],
            { revalidate: TTL.EVENTS, tags: ['events', tenantId ? `events-${tenantId}` : 'events-all'] }
        )();
    } catch (e) {
        console.error('[Cache] Critical error in getCachedEventsPage:', e);
        return { events: [], total: 0 };
    }
};

// ─── Admin Events List ───────────────────────────────────────────────────────
export const getAdminEventsList = async (query: string, status: string, page: number, itemsPerPage: number, tenantId: string) => {
    const supabase = await createClient();
    let dbQuery = supabase
        .from('events')
        .select('id, title_vi, slug, status, start_date, end_date, location, thumbnail_url', { count: 'exact' })
        .eq('tenant_id', tenantId);

    if (query) {
        dbQuery = dbQuery.ilike('title_vi', `%${query}%`);
    }

    if (status && status !== 'all') {
        dbQuery = dbQuery.eq('status', status as any);
    }

    const offset = (page - 1) * itemsPerPage;
    const { data, count } = await dbQuery
        .order('start_date', { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

    return { data, count };
};

// ─── Event Detail Bundle ─────────────────────────────────────────────────────
export const getCachedEventDetail = async (
    slugOrId: string,
    tenantId?: string
) => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            
            let query = supabase
                .from('events')
                .select('*')
                .neq('status', 'cancelled');
  
            query = query.or(`slug.eq.${slugOrId},id.eq.${slugOrId}`);

            if (tenantId) {
                query = query.or(`tenant_id.eq.${tenantId},tenant_id.eq.55555555-5555-5555-5555-555555555555,published_to.cs.{${tenantId}}`);
            }

            const { data: eventData } = await query.maybeSingle();
            
            if (!eventData) return null;

            let relatedQuery = supabase
                .from('events')
                .select('*')
                .neq('id', eventData.id)
                .neq('status', 'cancelled')
                .gte('start_date', new Date().toISOString().split('T')[0]);

            if (tenantId) {
                relatedQuery = relatedQuery.or(`tenant_id.eq.${tenantId},tenant_id.eq.55555555-5555-5555-5555-555555555555,published_to.cs.{${tenantId}}`);
            }

            const { data: relatedEvents } = await relatedQuery.order('start_date', { ascending: true }).limit(3);

            const { count: registrationCount } = await supabase
                .from('event_registrations')
                .select('*', { count: 'exact', head: true })
                .eq('event_id', eventData.id)
                .eq('status', 'confirmed');

            return {
                event: eventData,
                relatedEvents: relatedEvents || [],
                registrationCount: registrationCount || 0
            };
        },
        ['event-detail-bundle-v2', slugOrId, tenantId || 'all'],
        { revalidate: TTL.EVENTS, tags: ['events', tenantId ? `events-${tenantId}` : 'events-all', `event-${slugOrId}`] }
    )();
};
