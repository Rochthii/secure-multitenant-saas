/**
 * lib/queries/public-content.ts
 * 
 * Query layer chuẩn cho tất cả nội dung hiển thị công khai (Frontend).
 * 
 * Logic Multi-tenant:
 *   Bài viết hiển thị nếu: tenant_id = tenantId HOẶC tenantId có trong published_to
 *   Phải dùng Supabase filter: (tenant_id.eq.X OR published_to.cs.["X"])
 */

import { createClient } from '@/lib/supabase/server';
import { unstable_cache } from 'next/cache';

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildPublicFilter(supabase: any, table: string, tenantId: string) {
    // Lấy bài của chi nhánh + bài được broadcast đến chi nhánh này
    return supabase
        .from(table)
        .or(`tenant_id.eq.${tenantId},published_to.cs.["${tenantId}"]`);
}

// ─── Tin tức công khai ────────────────────────────────────────────────────────

export const fetchPublicNews = unstable_cache(
    async (tenantId: string, { limit = 20, offset = 0, categoryId }: { limit?: number; offset?: number; categoryId?: string } = {}) => {
        const supabase = await createClient();

        let query = buildPublicFilter(supabase, 'news', tenantId)
            .select('id, title_vi, title_km, title_en, slug, excerpt_vi, thumbnail_url, published_at, status, tenant_id, published_to, category_id')
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (categoryId) {
            query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;
        if (error) {
            console.error('fetchPublicNews error:', error.message);
            return [];
        }
        return data || [];
    },
    ['public-news'],
    { revalidate: 300, tags: ['news'] } // Cache 5 phút
);

// ─── Sự kiện công khai ────────────────────────────────────────────────────────

export const fetchPublicEvents = unstable_cache(
    async (tenantId: string, { limit = 20, upcoming = false }: { limit?: number; upcoming?: boolean } = {}) => {
        const supabase = await createClient();

        let query = buildPublicFilter(supabase, 'events', tenantId)
            .select('id, title_vi, title_km, title_en, slug, excerpt_vi, thumbnail_url, start_date, end_date, start_time, location, status, approval_status, tenant_id, published_to')
            .eq('approval_status', 'published')
            .order('start_date', { ascending: true })
            .limit(limit);

        if (upcoming) {
            query = query.gte('start_date', new Date().toISOString().split('T')[0]);
        }

        const { data, error } = await query;
        if (error) {
            console.error('fetchPublicEvents error:', error.message);
            return [];
        }
        return data || [];
    },
    ['public-events'],
    { revalidate: 300, tags: ['events'] }
);

// ─── Pháp thoại công khai ────────────────────────────────────────────────────

export const fetchPublicDharmaTalks = unstable_cache(
    async (tenantId: string, { limit = 20, featured = false, categoryId }: { limit?: number; featured?: boolean; categoryId?: string } = {}) => {
        const supabase = await createClient();

        let query = buildPublicFilter(supabase, 'dharma_talks', tenantId)
            .select('id, title_vi, title_km, title_en, media_url, thumbnail_url, speaker_name_vi, topic_vi, duration_minutes, view_count, order_position, is_featured, category_id, tenant_id, published_to, approval_status')
            .eq('is_active', true)
            .eq('approval_status', 'published')
            .order('order_position', { ascending: true })
            .limit(limit);

        if (featured) {
            query = query.eq('is_featured', true);
        }
        if (categoryId) {
            query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;
        if (error) {
            console.error('fetchPublicDharmaTalks error:', error.message);
            return [];
        }
        return data || [];
    },
    ['public-dharma-talks'],
    { revalidate: 300, tags: ['dharma_talks'] }
);

// ─── Chiến dịch quyên góp công khai ─────────────────────────────────────────

export const fetchPublicTransactionProjects = unstable_cache(
    async (tenantId: string) => {
        const supabase = await createClient();

        const { data, error } = await (supabase as any)
            .from('transaction_projects')
            .select('id, title_vi, title_km, description_vi, thumbnail_url, target_amount, current_amount, status, start_date, end_date, tenant_id')
            .eq('tenant_id', tenantId)
            .eq('approval_status', 'published')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('fetchPublicTransactionProjects error:', error.message);
            return [];
        }
        return data || [];
    },
    ['public-transaction-projects'],
    { revalidate: 600, tags: ['transaction_projects'] } // Cache 10 phút
);

// ─── FAQs công khai ──────────────────────────────────────────────────────────

export const fetchPublicFAQs = unstable_cache(
    async (tenantId: string) => {
        const supabase = await createClient();

        const { data, error } = await (supabase as any)
            .from('faqs')
            .select('id, question_vi, question_km, question_en, answer_vi, answer_km, answer_en, category, display_order')
            .eq('tenant_id', tenantId)
            .eq('approval_status', 'published')
            .order('display_order', { ascending: true });

        if (error) {
            console.error('fetchPublicFAQs error:', error.message);
            return [];
        }
        return data || [];
    },
    ['public-faqs'],
    { revalidate: 3600, tags: ['faqs'] } // Cache 1 giờ (FAQs ít thay đổi)
);
