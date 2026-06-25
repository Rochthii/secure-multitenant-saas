import { unstable_cache } from 'next/cache';
import { getPublicClient, getBaseSlug, TTL, type NewsRow } from './shared';
import { createClient } from '@/lib/supabase/server';

// ─── News ─────────────────────────────────────────────────────────────────────
export const getCachedNews = async (limit = 9, tenantId?: string): Promise<NewsRow[]> => {
    try {
        return await unstable_cache(
            async () => {
                const supabase = getPublicClient();
                let query = supabase
                    .from('news')
                    .select('*')
                    .eq('status', 'published');

                if (tenantId) {
                    query = query.or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`);
                }

                const { data, error } = await query
                    .order('published_at', { ascending: false })
                    .limit(limit);

                if (error) {
                    console.error('[Cache] news error:', error.message);
                    return [];
                }
                return (data ?? []) as NewsRow[];
            },
            ['news-list', limit.toString(), tenantId || 'all'],
            { revalidate: TTL.NEWS, tags: ['news', tenantId ? `news-${tenantId}` : 'news-all'] }
        )();
    } catch (e) {
        console.error('[Cache] Critical error in getCachedNews:', e);
        return [];
    }
};

// ─── News Categories (cached) ─────────────────────────────────────────────────
export const getCachedNewsCategories = async (tenantId?: string, tenantType: string = 'tenant') => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            let query = supabase
                .from('categories')
                .select('*')
                .eq('module', 'news');

            if (tenantId) {
                query = query.or(`tenant_id.eq.55555555-5555-5555-5555-555555555555,tenant_id.eq.${tenantId}`);
            } else {
                if (tenantType !== 'company') {
                    query = query.eq('tenant_id', '55555555-5555-5555-5555-555555555555');
                }
            }

            const { data, error } = await query.order('order_position', { ascending: true }).order('created_at', { ascending: true });
            if (error) {
                console.error('[Cache] news_categories error:', error.message);
                return [];
            }
            return data ?? [];
        },
        ['news-categories-module-v2', tenantId || 'all', tenantType],
        { revalidate: TTL.CATEGORIES, tags: ['categories', tenantId ? `categories-${tenantId}` : 'categories-all'] }
    )();
};

// ─── News paginated listing ───────────────────────────────────────────────────
export const getCachedNewsPage = async (
    page: number,
    category: string,
    itemsPerPage: number,
    tenantId?: string
): Promise<{ news: any[]; total: number }> => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage - 1;

            let query = supabase
                .from('news')
                .select('*, categories(*)', { count: 'exact' })
                .eq('status', 'published');

            if (tenantId) {
                query = query.or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`);
            }

            if (category !== 'all') {
                const { data: currentCat } = await supabase.from('categories').select('slug').eq('id', category).single();
                
                let categoryIds = [category];
                if (currentCat?.slug) {
                    const baseSlug = getBaseSlug(currentCat.slug);
                    const { data: relatedCats } = await supabase
                        .from('categories')
                        .select('id')
                        .or(`slug.eq.${baseSlug},slug.ilike.${baseSlug}-%`);
                    
                    if (relatedCats && relatedCats.length > 0) {
                        const baseIds = relatedCats.map(c => c.id);
                        const { data: childCats } = await supabase
                            .from('categories')
                            .select('id')
                            .in('parent_id', baseIds);
                        
                        categoryIds = [...new Set([...baseIds, ...(childCats?.map(c => c.id) || [])])];
                    }
                }
                query = query.in('category_id', categoryIds);
            }

            const { data, count, error } = await query
                .order('published_at', { ascending: false })
                .range(start, end);

            if (error) {
                console.error('[Cache] news_page error:', error.message);
                return { news: [], total: 0 };
            }
            return { news: data ?? [], total: count ?? 0 };
        },
        ['news-page', page.toString(), category, itemsPerPage.toString(), tenantId || 'all'],
        { revalidate: TTL.NEWS_PAGE, tags: ['news', tenantId ? `news-${tenantId}` : 'news-all'] }
    )();
};

// ─── News paginated by category group ─────────────────────────────────────────
export const getCachedNewsByCategoryGroup = async (
    categoryIds: string[],
    limit: number = 8,
    tenantId?: string
): Promise<any[]> => {
    return unstable_cache(
        async () => {
            if (!categoryIds || categoryIds.length === 0) return [];

            const supabase = getPublicClient();
            let finalCategoryIds = [...categoryIds];
            
            const { data: inputCats } = await supabase.from('categories').select('slug').in('id', categoryIds);
            if (inputCats && inputCats.length > 0) {
                const baseSlugs = [...new Set(inputCats.map(c => getBaseSlug(c.slug)))];
                
                const { data: relatedCats } = await supabase
                    .from('categories')
                    .select('id')
                    .or(baseSlugs.map(s => `slug.eq.${s},slug.ilike.${s}-%`).join(','));
                
                if (relatedCats && relatedCats.length > 0) {
                    const baseIds = relatedCats.map(c => c.id);
                    const { data: childCats } = await supabase.from('categories').select('id').in('parent_id', baseIds);
                    finalCategoryIds = [...new Set([...finalCategoryIds, ...baseIds, ...(childCats?.map(c => c.id) || [])])];
                }
            }

            let query = supabase
                .from('news')
                .select('*, categories(*)')
                .eq('status', 'published')
                .in('category_id', finalCategoryIds);

            if (tenantId) {
                query = query.or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`);
            }

            const { data, error } = await query
                .order('published_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('[Cache] news_by_category_group error:', error.message);
                return [];
            }
            return data ?? [];
        },
        ['news-by-category-group', categoryIds.join(','), limit.toString(), tenantId || 'all'],
        { revalidate: TTL.NEWS_PAGE, tags: ['news', tenantId ? `news-${tenantId}` : 'news-all'] }
    )();
};

// ─── News paginated for uncategorized elements ────────────────────────────────
export const getCachedUncategorizedNews = async (
    limit: number = 8,
    tenantId?: string
): Promise<any[]> => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();

            let catQuery = supabase.from('categories').select('id').eq('module', 'news');
            if (tenantId) {
                catQuery = catQuery.or(`tenant_id.is.null,tenant_id.eq.55555555-5555-5555-5555-555555555555,tenant_id.eq.${tenantId}`);
            }
            const { data: tenantCats } = await catQuery;
            const tenantCatIds = (tenantCats || []).map(c => c.id);

            let query = supabase
                .from('news')
                .select('*, categories(*)')
                .eq('status', 'published');

            if (tenantId) {
                query = query.or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`);
            }

            const { data, error } = await query.order('published_at', { ascending: false });

            if (error) {
                console.error('[Cache] uncategorized_news error:', error.message);
                return [];
            }

            const filtered = (data ?? []).filter(item =>
                !item.category_id || !tenantCatIds.includes(item.category_id)
            ).slice(0, limit);

            return filtered;
        },
        ['news-uncategorized-v3', limit.toString(), tenantId || 'all'],
        { revalidate: TTL.NEWS_PAGE, tags: ['news', tenantId ? `news-${tenantId}` : 'news-all'] }
    )();
};

// ─── Admin News List ──────────────────────────────────────────────────────────
export const getAdminNewsList = async (query: string, status: string, page: number, itemsPerPage: number, tenantId: string) => {
    const supabase = await createClient();
    let dbQuery = supabase
        .from('news')
        .select('id, title_vi, slug, status, created_at, thumbnail_url, category_id, categories(id, name_vi)', { count: 'exact' })
        .eq('tenant_id', tenantId);

    if (query) {
        dbQuery = dbQuery.ilike('title_vi', `%${query}%`);
    }

    if (status && status !== 'all') {
        dbQuery = dbQuery.eq('status', status as any);
    }

    const offset = (page - 1) * itemsPerPage;
    const { data, count } = await dbQuery
        .order('created_at', { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

    return { data, count };
};

// ─── News Detail Bundle ───────────────────────────────────────────────────────
export const getCachedNewsDetail = async (
    slug: string,
    tenantId?: string
) => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            
            let articleQuery = supabase
                .from('news')
                .select('*, categories(*)')
                .eq('slug', slug)
                .eq('status', 'published');

            if (tenantId) {
                articleQuery = articleQuery.or(`tenant_id.eq.${tenantId},tenant_id.eq.55555555-5555-5555-5555-555555555555,published_to.cs.{${tenantId}}`);
            }

            const { data: articleData } = await articleQuery.maybeSingle();

            if (!articleData) return null;

            let relatedQuery = supabase
                .from('news')
                .select('*, categories(*)')
                .eq('status', 'published')
                .neq('id', articleData.id);

            if (articleData.category_id) {
                const { data: currentCat } = await supabase.from('categories').select('slug').eq('id', articleData.category_id).single();
                if (currentCat?.slug) {
                    const { data: relatedCats } = await supabase.from('categories').select('id').eq('slug', currentCat.slug);
                    const categoryIds = relatedCats?.map(c => c.id) || [articleData.category_id];
                    relatedQuery = relatedQuery.in('category_id', categoryIds);
                } else {
                    relatedQuery = relatedQuery.eq('category_id', articleData.category_id);
                }
            }

            if (tenantId) {
                relatedQuery = relatedQuery.or(`tenant_id.eq.${tenantId},tenant_id.eq.55555555-5555-5555-5555-555555555555,published_to.cs.{${tenantId}}`);
            }

            const tagsQuery = supabase
                .from('news_tags')
                .select('tags(*)')
                .eq('news_id', articleData.id);

            const [
                { data: relatedData },
                { data: tagData }
            ] = await Promise.all([
                relatedQuery.order('published_at', { ascending: false }).limit(3),
                tagsQuery
            ]);

            const tags = tagData?.map((t: any) => t.tags).filter(Boolean) || [];
            
            return {
                article: articleData,
                relatedNews: relatedData || [],
                tags
            };
        },
        ['news-detail-bundle-v2', slug, tenantId || 'all'],
        { revalidate: TTL.NEWS, tags: ['news', tenantId ? `news-${tenantId}` : 'news-all', `news-${slug}`] }
    )();
};
