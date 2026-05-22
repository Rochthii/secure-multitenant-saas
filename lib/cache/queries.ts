/**
 * Centralized Supabase queries
 *
 * Mixed Architecture:
 * 1. Public Data (Cached): Dùng unstable_cache + Service Role Client để tối ưu CPU.
 *    Các query này an toàn vì chỉ lấy dữ liệu được đánh dấu là 'published'.
 * 2. Admin Data (Real-time): Dùng createClient (SSR) để thực thi RLS.
 *    Đảm bảo tính bảo mật tuyệt đối và dữ liệu luôn mới nhất cho trang quản trị.
 */
import { BUDDHIST_THEMES } from '../themes-config';
import { unstable_cache } from 'next/cache';
import { CACHE_TAGS } from './tags';
import { createClient as createSupabaseJSClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';
import { hexToRgbString, darkenRgbString, lightenRgbString } from '@/lib/utils/colors';

type NewsRow = Database['public']['Tables']['news']['Row'];
// EventRow extended with fields not yet in database.types.ts
type EventRow = Database['public']['Tables']['events']['Row'] & {
    is_major_festival?: boolean;
};

export type HeroSlideRow = Database['public']['Tables']['hero_slides']['Row'];

/**
 * Dharma talks — use generated Row type.
 */
export type DharmaTalkRow = Database['public']['Tables']['dharma_talks']['Row'];

/**
 * Media gallery item — use generated Row type.
 */
export type MediaRow = Database['public']['Tables']['media']['Row'];

// ─── Singleton Clients (Persistent between invocations if container is warm) ──
let globalPublicClient: ReturnType<typeof createSupabaseJSClient<Database>> | null = null;
let globalServiceRoleClient: ReturnType<typeof createSupabaseJSClient<Database>> | null = null;

// ─── Public client factory (không dùng cookies, an toàn với unstable_cache) ──
function getPublicClient() {
    if (globalPublicClient) return globalPublicClient;
    
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error('[Supabase] Missing Public Client config');
        throw new Error('Hệ system chưa được cấu hình Supabase Public Key. Vui lòng kiểm tra biến môi trường.');
    }

    globalPublicClient = createSupabaseJSClient<Database>(url, key);
    return globalPublicClient;
}

// ─── Service Role client factory (cho các bảng RLS chưa mở public select) ──
function getServiceRoleClient() {
    if (globalServiceRoleClient) return globalServiceRoleClient;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        // Tránh log warning lặp lại trong production để bảo vệ CPU
        return getPublicClient();
    }

    // Tối ưu: Bật chế độ "stateless" tối đa cho Service Role
    globalServiceRoleClient = createSupabaseJSClient<Database>(url, key, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    });
    return globalServiceRoleClient;
}

// ─── Cache Strategy: PERMANENT (Surgical Revalidation) ─────────────────────
// Tối ưu CPU tối đa: cache vĩnh viễn, chỉ xóa khi admin thao tác CRUD.
// revalidateTag() trong Server Actions đóng vai trò "công tắc" phẫu thuật tiêu điểm.
const TTL = {
    HERO_SLIDES: false as const,     // Vĩnh viễn — revalidateTag('hero-slides-{tenantId}')
    NEWS: false as const,            // Vĩnh viễn — revalidateTag('news-{tenantId}')
    NEWS_PAGE: false as const,       // Vĩnh viễn — revalidateTag('news-{tenantId}')
    CATEGORIES: false as const,      // Vĩnh viễn — revalidateTag('categories-{tenantId}')
    EVENTS: false as const,          // Vĩnh viễn — revalidateTag('events-{tenantId}')
    DHARMA_TALKS: false as const,    // Vĩnh viễn — revalidateTag('dharma-talks-{tenantId}')
    MEDIA: false as const,           // Vĩnh viễn — revalidateTag('media-{tenantId}')
    ABOUT_SECTIONS: false as const,  // Vĩnh viễn — revalidateTag('about-{tenantId}')
} as const;

/**
 * Trích xuất Base Slug từ một slug có hậu tố tenant ID (ví dụ: tin-tuc-le-hoi-33333333 -> tin-tuc-le-hoi)
 * Hỗ trợ các định dạng suffix: --uuid, -first8charsOfUuid, v.v.
 */
function getBaseSlug(slug: string): string {
    if (!slug) return '';
    // Một số slug dùng -- làm phân tách (chuẩn mới)
    if (slug.includes('--')) return slug.split('--')[0];
    
    // Một số slug cũ dùng - kèm theo chuỗi hex 8 ký tự (vừa khớp McAaron ID suffix)
    // Ví dụ: thien-vipassana-55555555 -> thien-vipassana
    const hexSuffixRegex = /-[0-9a-f]{8}$/;
    if (hexSuffixRegex.test(slug)) {
        return slug.replace(hexSuffixRegex, '');
    }
    
    return slug;
}

// Shared keywords for filtering religious content from secular/company tenants
const BUDDHIST_KEYWORDS = ['phật', 'tăng sự', 'tu viện', 'pali', 'khmer', 'kinh tụng', 'nghi thức', 'thiền môn', 'tam tạng', 'chú giải', 'pháp thoại'];


// ─── About Section type ───────────────────────────────────────────────────────
export type AboutSectionRow = Database['public']['Tables']['about_sections']['Row'];


// ─── Hero Slides ─────────────────────────────────────────────────────────────
export const getCachedHeroSlides = async (tenantId?: string): Promise<HeroSlideRow[]> => {
    try {
        return await unstable_cache(
            async () => {
                const supabase = getServiceRoleClient(); // Bypass RLS for slides
                let query = supabase
                    .from('hero_slides')
                    .select('*')
                    .eq('is_active', true);

                if (tenantId) {
                    query = query.eq('tenant_id', tenantId);
                }

                const { data, error } = await query.order('order_position', { ascending: true });

                if (error) {
                    console.error('[Cache] hero_slides error:', error.message);
                    return [];
                }
                return (data ?? []) as unknown as HeroSlideRow[];
            },
            ['hero-slides-v2', tenantId || 'default'], // Changed key to force refresh
            { revalidate: TTL.HERO_SLIDES, tags: ['hero-slides', tenantId ? `hero-slides-${tenantId}` : 'hero-slides-all'] }
        )();
    } catch (e) {
        console.error('[Cache] Critical error in getCachedHeroSlides:', e);
        return [];
    }
};

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
// Danh mục hầu như không đổi → TTL 1 giờ
export const getCachedNewsCategories = async (tenantId?: string, tenantType: string = 'tenant') => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            let query = supabase
                .from('categories')
                .select('*')
                .eq('module', 'news')

            if (tenantId) {
                // For companies: only McAaron global + own categories.
                // For tenants: only McAaron global + own categories.
                // NOTE: We deliberately exclude tenant_id.is.null to prevent orphan-node duplication.
                query = query.or(`tenant_id.eq.55555555-5555-5555-5555-555555555555,tenant_id.eq.${tenantId}`);
            } else {
                if(tenantType !== 'company'){
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

// ─── DYNAMIC CATEGORIES TREE (Cho Mega Menu) ──────────────────────────────────
export interface CategoryNode {
    id: string;
    tenant_id: string | null;
    name_vi: string;
    name_km: string | null;
    name_en: string | null;
    slug: string;
    module: string | null;
    parent_id: string | null;
    image_url: string | null;
    description_vi: string | null;
    description_km: string | null;
    description_en: string | null;
    is_visible: boolean;
    children: CategoryNode[];
}

export const getCachedCategoriesTree = async (tenantId?: string, tenantType: string = 'tenant'): Promise<{ news: CategoryNode[], dharma: CategoryNode[], documents: CategoryNode[], media: CategoryNode[], events: CategoryNode[], transactions: CategoryNode[] }> => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();

            // Gọi DB lọc những category thuộc 3 module chính tránh lôi rác
            let query = supabase
                .from('categories')
                .select('*')
                .in('module', ['news', 'dharma', 'documents', 'media', 'transactions', 'events'])
                .eq('is_visible', true);

            if (tenantId) {
                // NOTE: We deliberately exclude tenant_id.is.null to prevent orphan-node duplication.
                // Nếu là công ty, không lấy các danh mục Global thuần túy của chi nhánh
                if (tenantType === 'company') {
                     query = query.or(`tenant_id.eq.55555555-5555-5555-5555-555555555555,tenant_id.eq.${tenantId}`);
                } else {
                     query = query.or(`tenant_id.eq.55555555-5555-5555-5555-555555555555,tenant_id.eq.${tenantId}`);
                }
            } else {
                if(tenantType === 'company'){
                    query = query.eq('tenant_id', '55555555-5555-5555-5555-555555555555');
                }
            }

            const { data, error } = await query.order('order_position', { ascending: true }).order('created_at', { ascending: true });

            if (error) {
                console.error('[Cache] categories_tree error:', error.message);
                return { news: [], dharma: [], documents: [], media: [], transactions: [], events: [] };
            }

            const rawItems = data || [];
            
            // --- XỬ LÝ KHỬ TRÙNG (DEDUPLICATION) THEO BASE SLUG ---
            // Tránh lặp UI khi có cả category Global và Tenant có cùng vai trò/slug.
            const keptItemsMap = new Map<string, any>(); // baseSlug -> item
            const idMapping = new Map<string, string>(); // inputId -> keptId
            
            const filteredCategoriesData = rawItems.filter(item => {
                if (tenantType === 'company') {
                    const name = (item.name_vi || '').toLowerCase();
                    return !BUDDHIST_KEYWORDS.some((kw: string) => name.includes(kw));
                }
                return true;
            });

            filteredCategoriesData.forEach(item => {
                const baseSlug = getBaseSlug(item.slug);
                const existing = keptItemsMap.get(baseSlug);
                
                if (!existing) {
                    keptItemsMap.set(baseSlug, item);
                    idMapping.set(item.id, item.id);
                } else {
                    // Ưu tiên: Tenant Category > Global Category
                    const isNewItemTenant = tenantId && item.tenant_id === tenantId;
                    const isExistingTenant = tenantId && existing.tenant_id === tenantId;
                    
                    if (isNewItemTenant && !isExistingTenant) {
                        keptItemsMap.set(baseSlug, item);
                        idMapping.set(existing.id, item.id);
                        idMapping.set(item.id, item.id);
                    } else {
                        idMapping.set(item.id, existing.id);
                    }
                }
            });

            const items = Array.from(keptItemsMap.values()).map(item => ({
                ...item,
                // Chuyển parent_id sang ID của category được giữ lại tương ứng
                parent_id: item.parent_id ? (idMapping.get(item.parent_id) || item.parent_id) : null,
                is_visible: (item as any).is_visible !== false,
                children: [] 
            })) as CategoryNode[];

            const treeMap: Record<string, CategoryNode> = {};

            // Chỉ duyệt 1 vòng MAP
            items.forEach(item => {
                treeMap[item.id] = item;
            });

            const newsTree: CategoryNode[] = [];
            const dharmaTree: CategoryNode[] = [];
            const documentsTree: CategoryNode[] = [];
            const mediaTree: CategoryNode[] = [];
            const eventsTree: CategoryNode[] = [];
            const transactionsTree: CategoryNode[] = [];

            // Duyệt gắn Parent/Child
            items.forEach(item => {
                if (item.parent_id && treeMap[item.parent_id]) {
                    treeMap[item.parent_id].children.push(treeMap[item.id]);
                } else {
                    if (item.module === 'news') newsTree.push(treeMap[item.id]);
                    else if (item.module === 'dharma') dharmaTree.push(treeMap[item.id]);
                    else if (item.module === 'documents') documentsTree.push(treeMap[item.id]);
                    else if (item.module === 'media') mediaTree.push(treeMap[item.id]);
                    else if (item.module === 'events') eventsTree.push(treeMap[item.id]);
                    else if (item.module === 'transactions') transactionsTree.push(treeMap[item.id]);
                }
            });

            return { news: newsTree, dharma: dharmaTree, documents: documentsTree, media: mediaTree, transactions: transactionsTree, events: eventsTree };
        },
        ['categories-mega-tree-final-v7', tenantId || 'all', tenantType], // V7 - excludes null-tenant to prevent orphan node duplication
        { revalidate: TTL.CATEGORIES, tags: ['categories', tenantId ? `categories-${tenantId}` : 'categories-all'] }
    )();
};

// ─── News paginated listing ───────────────────────────────────────────────────
// Cache key = ['news-page'] + serialised (page, category, perPage) args
export const getCachedNewsPage = async (
    page: number,
    category: string,     // 'all' | category_id
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
                // Lấy slug của danh mục hiện tại để tìm các danh mục tương ứng ở các chi nhánh khác
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

// ─── News paginated by category group (for category blocks layout) ────────────
export const getCachedNewsByCategoryGroup = async (
    categoryIds: string[], // Id của category cha và các con
    limit: number = 8,
    tenantId?: string
): Promise<any[]> => {
    return unstable_cache(
        async () => {
            if (!categoryIds || categoryIds.length === 0) return [];

            const supabase = getPublicClient();
            
            // Tìm các ID tương đương cho toàn bộ categoryIds đầu vào
            let finalCategoryIds = [...categoryIds];
            
            const { data: inputCats } = await supabase.from('categories').select('slug').in('id', categoryIds);
            if (inputCats && inputCats.length > 0) {
                const baseSlugs = [...new Set(inputCats.map(c => getBaseSlug(c.slug)))];
                
                // Fetch tất cả ID có base slug tương đương
                const { data: relatedCats } = await supabase
                    .from('categories')
                    .select('id')
                    .or(baseSlugs.map(s => `slug.eq.${s},slug.ilike.${s}-%`).join(','));
                
                if (relatedCats && relatedCats.length > 0) {
                    const baseIds = relatedCats.map(c => c.id);
                    // Lấy thêm con của các category tương đương này
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

            // 1. Lấy tất cả danh mục của tenant này để loại trừ
            let catQuery = supabase.from('categories').select('id').eq('module', 'news');
            if (tenantId) {
                catQuery = catQuery.or(`tenant_id.is.null,tenant_id.eq.55555555-5555-5555-5555-555555555555,tenant_id.eq.${tenantId}`);
            }
            const { data: tenantCats } = await catQuery;
            const tenantCatIds = (tenantCats || []).map(c => c.id);

            // 2. Query news: lấy bài của tenant (hoặc được broadcast tới)
            // Lọc: category_id is null HOẶC category_id NOT IN tenantCatIds
            let query = supabase
                .from('news')
                .select('*, categories(*)')
                .eq('status', 'published');

            if (tenantId) {
                query = query.or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`);
            }

            // Phức tạp hóa filter: Supabase JS không hỗ trợ logic NOT IN trong .or phỏng đoán.
            // Ta sẽ lấy data về rồi lọc ở code (vì limit nhỏ) HOẶC dùng filter postgrest.
            // Tuy nhiên, để tối ưu DB, ta dùng .not('category_id', 'in', `(${tenantCatIds.join(',')})`)
            // Nhưng ta vẫn muốn lấy category_id IS NULL.
            // Giải pháp: (category_id IS NULL) OR (category_id NOT IN tenantCatIds)

            const { data, error } = await query
                .order('published_at', { ascending: false });

            if (error) {
                console.error('[Cache] uncategorized_news error:', error.message);
                return [];
            }

            // Lọc ở mức application vì Supabase .or() không hỗ trợ .not.in
            const filtered = (data ?? []).filter(item =>
                !item.category_id || !tenantCatIds.includes(item.category_id)
            ).slice(0, limit);

            return filtered;
        },
        ['news-uncategorized-v3', limit.toString(), tenantId || 'all'],
        { revalidate: TTL.NEWS_PAGE, tags: ['news', tenantId ? `news-${tenantId}` : 'news-all'] }
    )();
};

export const getCachedUpcomingEvents = async (limit = 4, tenantId?: string): Promise<EventRow[]> => {
    try {
        // Validation
        const safeLimit = Math.max(1, Math.min(limit, 100));
        
        return await unstable_cache(
            async () => {
                const supabase = getPublicClient();
                const today = getVietnamDateString();
                let query = supabase
                    .from('events')
                    .select('*')
                    .or('approval_status.eq.approved,status.eq.published') // Only show approved
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
                    .eq('is_major_festival', true)
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

export const getCachedMonthEvents = async (year: number, month: number, tenantId?: string): Promise<EventRow[]> => {
    try {
        // Strict validation to prevent Invalid Date in constructor
        if (!year || year < 1900 || year > 2100 || !month || month < 1 || month > 12) {
            console.warn(`[Cache] Invalid year/month for getCachedMonthEvents: ${year}/${month}`);
            return [];
        }

        return await unstable_cache(
            async () => {
                const supabase = getPublicClient();
                
                // Calculate start and end of month safely
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

import { getVietnamDateString, getVietnamMonthRange } from '../utils/date';

// ─── Events paginated (lich-le page) ─────────────────────────────────────────
// Replaces direct Supabase call in lich-le/page.tsx → 3-4s → ~80ms after warm
export const getCachedEventsPage = async (
    filter: string,   // 'upcoming' | 'past' | 'this-month' | 'next-month'
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

                // Date ranges chuẩn giờ Việt Nam (ICT)
                const todayStr = getVietnamDateString();
                const { start: thisMonthStart, end: thisMonthEnd } = getVietnamMonthRange(0);
                const { start: nextMonthStart, end: nextMonthEnd } = getVietnamMonthRange(1);

                let query = supabase
                    .from('events')
                    .select('*, excerpt_vi, excerpt_km, excerpt_en', { count: 'exact' })
                    .neq('status', 'cancelled');  // Chỉ ẩn events bị hủy

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

// ─── Dharma Talks ─────────────────────────────────────────────────────────────
export const getCachedDharmaTalks = async (limit = 3, tenantId?: string): Promise<DharmaTalkRow[]> => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            let query = supabase
                .from('dharma_talks')
                .select('*')
                .eq('is_active', true)
                .eq('is_featured', true);

            if (tenantId) {
                query = query.or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`);
            }

            const { data, error } = await query
                .order('order_position', { ascending: true })
                .limit(limit);

            if (error) {
                console.error('[Cache] dharma_talks error:', error.message);
                return [];
            }

            return (data ?? []) as DharmaTalkRow[];
        },
        ['dharma-talks-featured', limit.toString(), tenantId || 'all'],
        { revalidate: TTL.DHARMA_TALKS, tags: ['dharma-talks', tenantId ? `dharma-talks-${tenantId}` : 'dharma-talks-all'] }
    )();
};

export const getAllDharmaTalks = async (limit = 100, tenantId?: string): Promise<DharmaTalkRow[]> => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            let query = supabase
                .from('dharma_talks' as any)
                .select('*')
                .eq('is_active', true);

            if (tenantId) {
                query = query.or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`);
            }

            const { data, error } = await query
                .order('order_position', { ascending: true })
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('[Cache] all_dharma_talks error:', error.message);
                return [];
            }
            return (data ?? []) as unknown as DharmaTalkRow[];
        },
        ['dharma-talks-all', limit.toString(), tenantId || 'all'],
        { revalidate: TTL.DHARMA_TALKS, tags: ['dharma-talks', tenantId ? `dharma-talks-${tenantId}` : 'dharma-talks-all'] }
    )();
};

// ─── Dharma Talks paginated by category group ─────────────────────────────
export const getCachedDharmaTalksByCategoryGroup = async (
    categoryIds: string[],
    limit: number = 8,
    tenantId?: string
): Promise<DharmaTalkRow[]> => {
    return unstable_cache(
        async () => {
            if (!categoryIds || categoryIds.length === 0) return [];

            const supabase = getPublicClient();
            
            // Tìm các ID tương đương cho toàn bộ categoryIds đầu vào
            let finalCategoryIds = [...categoryIds];
            
            const { data: inputCats } = await supabase.from('categories').select('slug').in('id', categoryIds);
            if (inputCats && inputCats.length > 0) {
                const baseSlugs = [...new Set(inputCats.map(c => getBaseSlug(c.slug)))];
                
                // Fetch tất cả ID có base slug tương đương
                const { data: relatedCats } = await supabase
                    .from('categories')
                    .select('id')
                    .or(baseSlugs.map(s => `slug.eq.${s},slug.ilike.${s}-%`).join(','));
                
                if (relatedCats && relatedCats.length > 0) {
                    const baseIds = relatedCats.map(c => c.id);
                    // Lấy thêm con của các category tương đương này
                    const { data: childCats } = await supabase.from('categories').select('id').in('parent_id', baseIds);
                    finalCategoryIds = [...new Set([...finalCategoryIds, ...baseIds, ...(childCats?.map(c => c.id) || [])])];
                }
            }

            let query = supabase
                .from('dharma_talks' as any)
                .select('*')
                .eq('is_active', true)
                .in('category_id', finalCategoryIds);

            if (tenantId) {
                query = query.or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`);
            }

            const { data, error } = await query
                .order('order_position', { ascending: true })
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('[Cache] dharma_talks_by_category_group error:', error.message);
                return [];
            }
            return (data ?? []) as unknown as DharmaTalkRow[];
        },
        ['dharma-talks-by-category-group', categoryIds.join(','), limit.toString(), tenantId || 'all'],
        { revalidate: TTL.DHARMA_TALKS, tags: ['dharma-talks', tenantId ? `dharma-talks-${tenantId}` : 'dharma-talks-all'] }
    )();
};

// ─── Dharma Talks paginated for uncategorized elements ────────────────────────────────
export const getCachedUncategorizedDharmaTalks = async (
    limit: number = 8,
    tenantId?: string
): Promise<any[]> => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();

            // 1. Lấy IDs danh mục của tenant hiện tại
            let catQuery = supabase.from('categories').select('id').eq('module', 'dharma');
            if (tenantId) {
                catQuery = catQuery.or(`tenant_id.is.null,tenant_id.eq.55555555-5555-5555-5555-555555555555,tenant_id.eq.${tenantId}`);
            }
            const { data: tenantCats } = await catQuery;
            const tenantCatIds = (tenantCats || []).map(c => c.id);

            // 2. Query talks
            let query = supabase
                .from('dharma_talks')
                .select('*')
                .eq('is_active', true);

            if (tenantId) {
                query = query.or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`);
            }

            const { data, error } = await query
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[Cache] uncategorized_dharma_talks error:', error.message);
                return [];
            }

            // Lọc những bài không thuộc danh mục hiện tại của tenant (hoặc null)
            const filtered = (data ?? []).filter(item =>
                !item.category_id || !tenantCatIds.includes(item.category_id)
            ).slice(0, limit);

            return filtered;
        },
        ['dharma-talks-uncategorized-v3', limit.toString(), tenantId || 'all'],
        { revalidate: TTL.DHARMA_TALKS, tags: ['dharma-talks', tenantId ? `dharma-talks-${tenantId}` : 'dharma-talks-all'] }
    )();
};

// ─── Media paginated by category group ─────────────────────────────
export const getCachedMediaByCategoryGroup = async (
    categoryIds: string[],
    limit: number = 12,
    tenantId?: string,
    filters?: { search?: string; type?: string; author?: string }
): Promise<any[]> => {
    return unstable_cache(
        async () => {
            if (!categoryIds || categoryIds.length === 0) return [];

            const supabase = getPublicClient();
            
            // Tìm các ID tương đương nếu chỉ truyền 1 ID gốc
            let finalCategoryIds = categoryIds;
            if (categoryIds.length === 1) {
                const { data: currentCat } = await supabase.from('categories').select('slug').eq('id', categoryIds[0]).single();
                if (currentCat?.slug) {
                    const { data: relatedCats } = await supabase.from('categories').select('id').eq('slug', currentCat.slug);
                    if (relatedCats && relatedCats.length > 0) {
                        const baseIds = relatedCats.map(c => c.id);
                        const { data: childCats } = await supabase.from('categories').select('id').in('parent_id', baseIds);
                        finalCategoryIds = [...new Set([...baseIds, ...(childCats?.map(c => c.id) || [])])];
                    }
                }
            }

            let query = supabase
                .from('media')
                .select('*')
                .in('category_id', finalCategoryIds);

            if (tenantId) {
                query = query.eq('tenant_id', tenantId);
            }

            // --- FILTERING ---
            if (filters?.search) {
                // ILIKE search on VI title
                query = query.ilike('title_vi', `%${filters.search}%`);
            }
            if (filters?.type && (filters.type as any) !== 'all') {
                query = query.eq('type', filters.type as any);
            }
            if (filters?.author && filters.author !== 'all') {
                query = query.eq('author_name_vi', filters.author);
            }

            const { data, error } = await query
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('[Cache] media_by_category_group error:', error.message);
                return [];
            }
            return data ?? [];
        },
        ['media-by-category-group', categoryIds.join(','), limit.toString(), tenantId || 'all', JSON.stringify(filters || {})],
        { revalidate: false, tags: ['media', tenantId ? `media-${tenantId}` : 'media-all'] }
    )();
};

// ─── Media paginated for uncategorized elements ────────────────────────────────
export const getCachedUncategorizedMedia = async (
    limit: number = 12,
    tenantId?: string,
    filters?: { search?: string; type?: string; author?: string }
): Promise<any[]> => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();

            // 1. Lấy IDs danh mục (media và documents) của tenant hiện tại để loại trừ khỏi "Chưa phân loại"
            let catQuery = supabase.from('categories').select('id').in('module', ['media', 'documents']);
            if (tenantId) {
                catQuery = catQuery.or(`tenant_id.is.null,tenant_id.eq.55555555-5555-5555-5555-555555555555,tenant_id.eq.${tenantId}`);
            }
            const { data: tenantCats } = await catQuery;
            const tenantCatIds = (tenantCats || []).map(c => c.id);

            // 2. Query media
            let query = supabase
                .from('media')
                .select('*');

            if (tenantId) {
                query = query.eq('tenant_id', tenantId);
            }

            // --- FILTERING ---
            if (filters?.search) {
                query = query.ilike('title_vi', `%${filters.search}%`);
            }
            if (filters?.type && (filters.type as any) !== 'all') {
                query = query.eq('type', filters.type as any);
            }
            if (filters?.author && filters.author !== 'all') {
                query = query.eq('author_name_vi', filters.author);
            }

            const { data, error } = await query
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('[Cache] uncategorized_media error:', error.message);
                return [];
            }

            const filtered = (data ?? []).filter(item =>
                !item.category_id || !tenantCatIds.includes(item.category_id)
            ).slice(0, limit);

            return filtered;
        },
        ['media-uncategorized-v4', limit.toString(), tenantId || 'all', JSON.stringify(filters || {})],
        { revalidate: false, tags: ['media', tenantId ? `media-${tenantId}` : 'media-all'] }
    )();
};

/**
 * ─── Lấy số lượng media trong từng danh mục ───────────────────────────────────
 * Trả về Map { category_id: count } cho các danh mục thuộc module media/documents
 */
export const getCachedCategoryItemCounts = async (tenantId?: string): Promise<Record<string, number>> => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            
            // Lấy counts qua group by (Supabase filter logic)
            let query = supabase
                .from('media')
                .select('category_id');

            if (tenantId) {
                query = query.eq('tenant_id', tenantId);
            }

            const { data, error } = await query;
            if (error) {
                console.error('[Cache] category_item_counts error:', error.message);
                return {};
            }

            const counts: Record<string, number> = {};
            data?.forEach(item => {
                if (item.category_id) {
                    counts[item.category_id] = (counts[item.category_id] || 0) + 1;
                }
            });
            return counts;
        },
        ['category-item-counts', tenantId || 'all'],
        { revalidate: false, tags: ['media', tenantId ? `media-${tenantId}` : 'media-all'] }
    )();
};

// ─── About Sections (tất cả) ─────────────────────────────────────────────────
export const getCachedAboutSections = async (tenantId: string): Promise<AboutSectionRow[]> => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            const { data, error } = await supabase
                .from('about_sections')
                .select('*')
                .eq('is_active', true)
                .eq('tenant_id', tenantId)
                .order('display_order', { ascending: true });

            const sections = (data ?? []) as unknown as AboutSectionRow[];
            return sections;
        },
        ['about-sections-v4', tenantId || 'all'],
        { revalidate: TTL.ABOUT_SECTIONS, tags: ['about-sections', tenantId ? `about-sections-${tenantId}` : 'about-sections-all'] }
    )();
};

// ─── About Section (theo key) ─────────────────────────────────────────────────
export const getCachedAboutSection = async (key: string, tenantId?: string): Promise<AboutSectionRow | null> => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            let query = supabase
                .from('about_sections')
                .select('*')
                .eq('key', key)
                .eq('is_active', true);

            if (tenantId) {
                query = query.eq('tenant_id', tenantId);
            }

            const { data, error } = await query
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error(`[Cache] about_sections[${key}] error:`, error.message);
                return null;
            }
            return (data ?? null) as unknown as AboutSectionRow | null;
        },
        ['about-section-by-key-v4', key, tenantId || 'all'],
        { revalidate: TTL.ABOUT_SECTIONS, tags: ['about-sections', tenantId ? `about-sections-${tenantId}` : 'about-sections-all'] }
    )();
};



// ─── ADMIN QUERIES (Cached) ───────────────────────────────────────────────────

// ─── ADMIN QUERIES (Realtime & Secure via RLS) ───────────────────────────────

export const getAdminDashboardStats = async (tenantId: string) => {
    const supabase = await createClient();
    
    // Lấy thông tin tenant để biết có phải công ty không (RLS applied)
    const { data: tenantData } = await (supabase as any).from('tenants').select('tenant_type').eq('id', tenantId).maybeSingle();
    const isMaster = tenantData?.tenant_type === 'company';

    // Company Tenant (isMaster) sees global stats; other tenants are siloed
    let newsQuery = supabase.from('news').select('*', { count: 'exact', head: true });
    let eventsQuery = supabase.from('events').select('*', { count: 'exact', head: true });
    let projectsQuery = supabase.from('transaction_projects' as any).select('*', { count: 'exact', head: true }).eq('is_active', true);
    let transactionConfirmedQuery = supabase.from('transactions').select('amount, created_at, status').eq('status', 'confirmed');
    let eventRegQuery = supabase.from('event_registrations').select(`*, events!inner(id)`, { count: 'exact', head: true }).eq('status', 'confirmed');
    let recentNewsQuery = supabase.from('news').select('id, title_vi, created_at, status').order('created_at', { ascending: false }).limit(5);
    let recentTransactionQuery = supabase.from('transactions').select('*, transaction_projects(title_vi)').order('created_at', { ascending: false }).limit(5);
    let allTransactionQuery = supabase.from('transactions').select('amount, status, purpose, payment_method, project_id, transaction_projects(title_vi)');

    if (!isMaster) {
        newsQuery = newsQuery.eq('tenant_id', tenantId);
        eventsQuery = eventsQuery.eq('tenant_id', tenantId);
        projectsQuery = projectsQuery.eq('tenant_id', tenantId);
        transactionConfirmedQuery = transactionConfirmedQuery.eq('tenant_id', tenantId);
        eventRegQuery = eventRegQuery.eq('events.tenant_id', tenantId);
        recentNewsQuery = recentNewsQuery.eq('tenant_id', tenantId);
        recentTransactionQuery = recentTransactionQuery.eq('tenant_id', tenantId);
        allTransactionQuery = allTransactionQuery.eq('tenant_id', tenantId);
    }

    const [
        { count: newsCount },
        { count: eventsCount },
        { count: projectsCount },
        { data: transactionData },
        { count: pendingRegistrations },
        { data: recentNews },
        { data: recentTransactions },
        { data: allTransactions },
    ] = await Promise.all([
        newsQuery,
        eventsQuery,
        projectsQuery,
        transactionConfirmedQuery,
        eventRegQuery,
        recentNewsQuery,
        recentTransactionQuery,
        allTransactionQuery,
    ]);

    const totalTransactions = (transactionData as any[])?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;

    // Tính breakdown tại server để không gửi raw data lên client
    const arr = (allTransactions as any[]) || [];

    const byStatus = {
        pending: { count: 0, total: 0 },
        confirmed: { count: 0, total: 0 },
        cancelled: { count: 0, total: 0 },
    } as Record<string, { count: number; total: number }>;

    const byPurpose = {} as Record<string, { count: number; total: number }>;
    const byMethod = {} as Record<string, { count: number; total: number }>;

    for (const d of arr) {
        const st = d.status || 'pending';
        if (!byStatus[st]) byStatus[st] = { count: 0, total: 0 };
        byStatus[st].count++;
        byStatus[st].total += d.amount || 0;

        // Prefer project title for purpose breakdown
        let pu = d.purpose || 'general';
        if (d.transaction_projects?.title_vi) {
            pu = d.transaction_projects.title_vi;
        }
        
        if (!byPurpose[pu]) byPurpose[pu] = { count: 0, total: 0 };
        byPurpose[pu].count++;
        byPurpose[pu].total += d.amount || 0;

        const me = d.payment_method || 'cash';
        if (!byMethod[me]) byMethod[me] = { count: 0, total: 0 };
        byMethod[me].count++;
        byMethod[me].total += d.amount || 0;
    }

    return {
        newsCount: newsCount || 0,
        eventsCount: eventsCount || 0,
        projectsCount: projectsCount || 0,
        totalTransactions,
        pendingRegistrations: pendingRegistrations || 0,
        recentNews: recentNews || [],
        recentTransactions: recentTransactions || [],
        transactions: transactionData || [],
        transactionSummary: {
            total: arr.length,
            byStatus,
            byPurpose,
            byMethod,
        },
    };
};

/**
 * GLOBAL DASHBOARD STATS (System-wide for Super Admins)
 */
export const getGlobalDashboardStats = async () => {
    const supabase = await createClient();
    
    // Fetch everything in parallel across ALL tenants (Role-based access will be enforced by Supabase)
    const [
        { count: newsCount },
        { count: eventsCount },
        { count: tenantsCount },
        { data: transactions },
        { data: registrations },
        { data: recentTenants },
    ] = await Promise.all([
        supabase.from('news').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('tenants' as any).select('*', { count: 'exact', head: true }),
        supabase.from('transactions').select('amount, status, tenant_id, created_at'),
        supabase.from('event_registrations').select('id, status, created_at'),
        supabase.from('tenants' as any).select('id, name, domain, created_at').order('created_at', { ascending: false }).limit(5),
    ]);

    const confirmedTransactions = (transactions || []).filter(d => d.status === 'confirmed');
    const totalVolume = confirmedTransactions.reduce((sum, d) => sum + (d.amount || 0), 0);

    // Group by tenant for "Top Tenants" table
    const tenantStats = (transactions || []).reduce((acc: any, d) => {
        const tid = d.tenant_id || 'unassigned';
        if (!acc[tid]) acc[tid] = { count: 0, total: 0 };
        acc[tid].count++;
        if (d.status === 'confirmed') acc[tid].total += d.amount || 0;
        return acc;
    }, {});

    return {
        newsCount: newsCount || 0,
        eventsCount: eventsCount || 0,
        tenantsCount: tenantsCount || 0,
        totalVolume,
        pendingRegistrations: (registrations || []).filter(r => r.status === 'pending').length,
        recentTenants: recentTenants || [],
        tenantStats,
        recentTransactions: (transactions || []).slice(0, 5),
    };
};


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

// ─── Media gallery (thu-vien page) ───────────────────────────────────────────
// Replaces force-dynamic + direct DB call → cache 30 min
export const getCachedMedia = async (tenantId?: string): Promise<MediaRow[]> => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            let query = supabase
                .from('media' as any)
                .select('*');

            if (tenantId) {
                query = query.eq('tenant_id', tenantId);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) {
                console.error('[Cache] media error:', error.message);
                return [];
            }
            return (data ?? []) as unknown as MediaRow[];
        },
        ['media-gallery', tenantId || 'all'],
        { revalidate: false, tags: ['media', tenantId ? `media-${tenantId}` : 'media-all'] }   // 30 phút
    )();
};

export const getCachedMediaEvents = async (tenantId?: string): Promise<Array<{ id: string; title_vi: string }>> => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            let query = supabase
                .from('events')
                .select('id, title_vi')
                .neq('status', 'cancelled');  // Hiện tất cả events không bị hủy

            if (tenantId) {
                query = query.or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`);
            }

            const { data, error } = await query.order('start_date', { ascending: false });

            if (error) {
                console.error('[Cache] media_events error:', error.message);
                return [];
            }
            return data ?? [];
        },
        ['media-events-v2', tenantId || 'all'],
        { revalidate: false, tags: ['events', 'media', tenantId ? `events-${tenantId}` : 'events-all', tenantId ? `media-${tenantId}` : 'media-all'] }
    )();
};
// ─── Tài Liệu Số (Digital Documents) ──────────────────────────────────────────
export const getCachedDocumentCategories = async (tenantId?: string) => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            let query = supabase
                .from('categories')
                .select('id, name_vi, name_km, name_en, slug, parent_id')
                .eq('module', 'documents');

            if (tenantId) {
                query = query.or(`tenant_id.is.null,tenant_id.eq.55555555-5555-5555-5555-555555555555,tenant_id.eq.${tenantId}`);
            }

            const { data, error } = await query.order('order_position', { ascending: true }).order('created_at', { ascending: true });

            if (error) {
                console.error('[Cache] document_categories error:', error.message);
                return [];
            }
            return data || [];
        },
        ['document-categories', tenantId || 'all'],
        { revalidate: TTL.CATEGORIES, tags: ['categories', tenantId ? `categories-${tenantId}` : 'categories-all'] }
    )();
};

export const getCachedDocumentsPage = async (page: number, categoryId: string, limit: number, tenantId?: string) => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            // media type enum: 'image' | 'video' | 'audio' | 'document'
            let query = supabase
                .from('media')
                .select('*', { count: 'exact' });

            if (tenantId) {
                query = query.eq('tenant_id', tenantId);
            }

            if (categoryId && categoryId !== 'all') {
                const { data: children } = await supabase.from('categories').select('id').eq('parent_id', categoryId);
                const categoryIds = [categoryId];
                if (children && children.length > 0) {
                    categoryIds.push(...children.map(c => c.id));
                }
                query = query.in('category_id', categoryIds);
            }

            const offset = (page - 1) * limit;
            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) {
                console.error('[Cache] documents error:', error.message);
                return { documents: [], total: 0 };
            }
            return { documents: (data as MediaRow[]) || [], total: count || 0 };
        },
        ['documents-page', page.toString(), categoryId, limit.toString(), tenantId || 'all'],
        { revalidate: false, tags: ['media', tenantId ? `media-${tenantId}` : 'media-all'] } // 30 phút
    )();
};

export type PageNode = {
    id: string;
    slug: string;
    title_vi: string;
    title_en?: string | null;
    title_km?: string | null;
    parent_id?: string | null;
    show_in_menu?: boolean;
    children?: PageNode[];
};

export const getCachedPagesTree = async (tenantId?: string): Promise<PageNode[]> => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            let query = supabase
                .from('pages' as any)
                .select('id, slug, title_vi, title_en, title_km, parent_id, show_in_menu, order_index')
                .eq('status', 'published')
                .order('order_index', { ascending: true })
                .order('created_at', { ascending: true });

            if (tenantId) {
                query = query.eq('tenant_id', tenantId);
            }

            const { data, error } = await query;

            if (error) {
                console.error('[Cache] pages_tree error:', error.message);
                return [];
            }

            const items = (data || []) as unknown as PageNode[];
            const treeMap: Record<string, PageNode> = {};
            const rootNodes: PageNode[] = [];

            items.forEach((item: PageNode) => {
                treeMap[item.id] = { ...item, children: [] } as PageNode;
            });

            items.forEach((item: PageNode) => {
                if (item.parent_id && treeMap[item.parent_id]) {
                    treeMap[item.parent_id].children!.push(treeMap[item.id]);
                } else {
                    rootNodes.push(treeMap[item.id]);
                }
            });

            return rootNodes;
        },
        ['pages-tree', tenantId || 'all'],
        { revalidate: TTL.ABOUT_SECTIONS, tags: ['pages', tenantId ? `pages-${tenantId}` : 'pages-all'] }
    )();
};

// ─── Tags & Relationships (Consolidated) ──────────────────────────────────
export const getCachedDharmaTalkTags = async (talkIds: string[]) => {
    if (!talkIds || talkIds.length === 0) return {};
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            const { data: tagLinks, error } = await supabase
                .from('dharma_talk_tags')
                .select('dharma_talk_id, tags(*)')
                .in('dharma_talk_id', talkIds);

            if (error) {
                console.error('[Cache] dharma_talk_tags error:', error.message);
                return {};
            }

            const tagsMap: Record<string, any[]> = {};
            tagLinks?.forEach((link: any) => {
                if (!tagsMap[link.dharma_talk_id]) tagsMap[link.dharma_talk_id] = [];
                if (link.tags) tagsMap[link.dharma_talk_id].push(link.tags);
            });
            return tagsMap;
        },
        ['dharma-talk-tags', talkIds.sort().join(',')],
        { revalidate: TTL.DHARMA_TALKS, tags: ['tags', 'dharma_talks'] }
    )();
};

export const getCachedMediaTags = async (mediaIds: string[]) => {
    if (!mediaIds || mediaIds.length === 0) return {};
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            const { data: tagLinks, error } = await supabase
                .from('media_tags')
                .select('media_id, tags(*)')
                .in('media_id', mediaIds);

            if (error) {
                console.error('[Cache] media_tags error:', error.message);
                return {};
            }

            const tagsMap: Record<string, any[]> = {};
            tagLinks?.forEach((link: any) => {
                if (!tagsMap[link.media_id]) tagsMap[link.media_id] = [];
                if (link.tags) tagsMap[link.media_id].push(link.tags);
            });
            return tagsMap;
        },
        ['media-tags', mediaIds.sort().join(',')],
        { revalidate: TTL.MEDIA, tags: ['tags', 'media'] }
    )();
};

// ─── Transaction Projects (Consolidated) ──────────────────────────────────────
export const getCachedTransactionProjects = async (limit: number = 2, tenantId?: string) => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            let query = supabase
                .from('transaction_projects')
                .select('*')
                .eq('is_active', true)
                .eq('status', 'ongoing')
                .eq('approval_status', 'published');

            if (tenantId) {
                query = query.eq('tenant_id', tenantId);
            }

            const { data, error } = await query
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('[Cache] transaction_projects error:', error.message);
                return [];
            }
            return data || [];
        },
        ['transaction-projects-active', limit.toString(), tenantId || 'all'],
        { revalidate: false, tags: ['transaction_projects'] }
    )();
};

/**
 * UNIFIED LAYOUT DATA — Absolute CPU Optimization
 * BUNDLES: settings, categories, pages, about-sections, and pre-calculated theme-vars
 * Reduces 5+ cache lookups and 50+ lines of CPU logic in layout.tsx to ONE hit.
 */
export const getCachedLayoutData = async (domain: string, tenantId: string) => {
    return unstable_cache(
        async () => {
            // We need to avoid cyclic imports, so we use local fetchers here or pass them in.
            // But since this is inside unstable_cache, we can just call our other cached functions
            // OR fetch them manually for even less overhead.

            // 1. Fetch EVERYTHING in parallel
            const supabase = getServiceRoleClient();
            
            // First fetch tenant to know its type
            const { data: tenantDataObj } = await supabase.from('tenants' as any).select('tenant_type').eq('id', tenantId).single();
            const tType = (tenantDataObj as any)?.tenant_type || 'tenant';

            const [
                { data: settingsData },
                { data: categoriesData },
                { data: pagesData },
                { data: aboutData },
                { data: tenantData },
                projectsResult
            ] = await Promise.all([
                supabase.from('site_settings').select('key, value').eq('tenant_id', tenantId),
                supabase.from('categories')
                    .select('*')
                    // NOTE: We deliberately exclude tenant_id.is.null to prevent orphan-node
                    // duplication in mega-menu (null-tenant parent + McAaron parent share same slug
                    // but different IDs → children become orphans → appear twice as root nodes).
                    .or(tType === 'company'
                         ? `tenant_id.eq.55555555-5555-5555-5555-555555555555,tenant_id.eq.${tenantId}`
                         : `tenant_id.eq.55555555-5555-5555-5555-555555555555,tenant_id.eq.${tenantId}`)
                    .eq('is_visible', true)
                    .order('order_position', { ascending: true })
                    .order('created_at', { ascending: true }),
                supabase.from('pages').select('*').or(`tenant_id.is.null,tenant_id.eq.55555555-5555-5555-5555-555555555555,tenant_id.eq.${tenantId}`),
                supabase.from('about_sections').select('*').or(`tenant_id.is.null,tenant_id.eq.55555555-5555-5555-5555-555555555555,tenant_id.eq.${tenantId}`).eq('is_active', true).order('display_order', { ascending: true }),
                supabase.from('tenants' as any).select('*').eq('id', tenantId).single(),
                supabase.from('transaction_projects').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('is_active', true).eq('status', 'ongoing').eq('approval_status', 'published')
            ]);

            const projectsCount = (projectsResult as any)?.count || 0;

            // 1.1 Category Leakage Protection — Filter global categories by tenant type
            const filteredCategoriesData = (categoriesData || []).filter(cat => {
                if (tType === 'company') {
                    const name = (cat.name_vi || '').toLowerCase();
                    return !BUDDHIST_KEYWORDS.some((kw: string) => name.includes(kw));
                }
                return true;
            });

            // 2. Process Settings
            const settings = (settingsData || []).reduce((acc: any, curr: any) => {
                acc[curr.key] = typeof curr.value === 'string' ? curr.value : JSON.stringify(curr.value);
                return acc;
            }, {} as Record<string, string>);

            // 3. Process Trees (Abbreviated logic for trees)
            // 3. Process Trees - SINGLE PASS OPTIMIZATION
            const buildTree = (items: any[]) => {
                if (!items?.length) return [];
                const treeMap: Record<string, any> = {};
                const rootNodes: any[] = [];
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    treeMap[item.id] = { ...item, children: [] };
                }
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    if (item.parent_id && treeMap[item.parent_id]) {
                        treeMap[item.parent_id].children.push(treeMap[item.id]);
                    } else {
                        rootNodes.push(treeMap[item.id]);
                    }
                }
                return rootNodes;
            };

            const newsItems: any[] = [];
            const dharmaItems: any[] = [];
            const docItems: any[] = [];
            const transactionsItems: any[] = [];

            if (categoriesData) {
                // --- XỬ LÝ KHỬ TRÙNG (DEDUPLICATION) THEO BASE SLUG ---
                // Thống nhất logic dedup với getCachedCategoriesTree.
                // Tránh lặp UI khi có cả category Global và Tenant có cùng vai trò/slug.
                const keptCatsMap = new Map<string, any>(); // baseSlug -> item
                const catIdMapping = new Map<string, string>(); // inputId -> keptId

                filteredCategoriesData.forEach(item => {
                    const baseSlug = getBaseSlug(item.slug);
                    const existing = keptCatsMap.get(baseSlug);
                    if (!existing) {
                        keptCatsMap.set(baseSlug, item);
                        catIdMapping.set(item.id, item.id);
                    } else {
                        // Ưu tiên: Tenant Category > Global Category (McAaron)
                        const isNewTenant = item.tenant_id === tenantId;
                        const isExistingTenant = existing.tenant_id === tenantId;
                        if (isNewTenant && !isExistingTenant) {
                            keptCatsMap.set(baseSlug, item);
                            catIdMapping.set(existing.id, item.id);
                            catIdMapping.set(item.id, item.id);
                        } else {
                            catIdMapping.set(item.id, existing.id);
                        }
                    }
                });

                const dedupedCats = Array.from(keptCatsMap.values()).map(c => ({
                    ...c,
                    // Chuyển parent_id sang ID của category được giữ lại tương ứng
                    parent_id: c.parent_id ? (catIdMapping.get(c.parent_id) || c.parent_id) : null,
                    children: []
                }));

                for (let i = 0; i < dedupedCats.length; i++) {
                    const c = dedupedCats[i];
                    if (c.module === 'news') newsItems.push(c);
                    else if (c.module === 'dharma') dharmaItems.push(c);
                    else if (c.module === 'documents') docItems.push(c);
                    else if (c.module === 'transactions') transactionsItems.push(c);
                }
            }


            const categoriesTree = {
                news: buildTree(newsItems),
                dharma: buildTree(dharmaItems),
                documents: buildTree(docItems),
                transactions: buildTree(transactionsItems)
            };
            const pagesTree = buildTree(pagesData || []);

            // 4. Process About Sections Tree (Deduplicated by key)
            const keptAboutMap = new Map<string, any>();
            (aboutData || []).forEach(sec => {
                const existing = keptAboutMap.get(sec.key);
                // Ưu tiên Tenant Section > Global Section
                if (!existing || (sec.tenant_id === tenantId && existing.tenant_id !== tenantId)) {
                    keptAboutMap.set(sec.key, sec);
                }
            });

            const flatAbout = Array.from(keptAboutMap.values());
            const aboutMap: Record<string, any> = {};
            const aboutSectionsTree: any[] = [];

            // First pass: create nodes
            flatAbout.forEach(sec => {
                if (sec.key && sec.key !== 'noi-quy-tu-vien') {
                    aboutMap[sec.key] = {
                        id: sec.id,
                        name_vi: sec.title_vi,
                        name_km: sec.title_km,
                        name_en: sec.title_en,
                        slug: sec.key,
                        children: []
                    };
                }
            });

            // Second pass: link nodes
            flatAbout.forEach(sec => {
                if (!sec.key || sec.key === 'noi-quy-tu-vien') return;
                const node = aboutMap[sec.key];
                if (!node) return;

                const parts = sec.key.split('/');
                if (parts.length > 1) {
                    const parentKey = parts.slice(0, -1).join('/');
                    if (aboutMap[parentKey]) {
                        aboutMap[parentKey].children.push(node);
                    } else {
                        // Orphan or top-level with slashes
                        aboutSectionsTree.push(node);
                    }
                } else {
                    aboutSectionsTree.push(node);
                }
            });

            // 5. Pre-calculate Theme Variables
            const t = tenantData || {};
            const tColors = (t as any).theme_colors || {};
            
            // Find theme preset from themes-config based on tenant ID, fallback to layout_style preset
            const themePreset = BUDDHIST_THEMES.find(th => th.tenantId === tenantId)?.colors 
                || BUDDHIST_THEMES.find(th => th.id === (t as any).layout_style)?.colors;

            const primaryStr = hexToRgbString(tColors.primary || settings['theme_color_primary'] || themePreset?.primary, '245 158 11');
            const secondaryStr = hexToRgbString(tColors.secondary || settings['theme_color_secondary'] || themePreset?.secondary, '92 64 51');
            const textStr = hexToRgbString(tColors.text || settings['theme_color_text'] || themePreset?.text, '44 24 16');
            const accentStr = hexToRgbString(tColors.accent || settings['theme_color_accent'] || themePreset?.accent, '255 140 0');
            const bgStartStr = hexToRgbString(tColors.bgStart || settings['theme_background_start'] || themePreset?.background, '254 249 243');
            const bgEndStr = hexToRgbString(tColors.bgEnd || settings['theme_background_end'] || themePreset?.bgEnd, '253 245 235');
            const primaryDarkStr = tColors.primaryDark ? hexToRgbString(tColors.primaryDark, '218 165 32') : darkenRgbString(primaryStr, 0.85);
            const primaryLightStr = tColors.primaryLight ? hexToRgbString(tColors.primaryLight, '253 183 26') : lightenRgbString(primaryStr, 0.25);
            const heroStr = (tColors.hero || settings['theme_hero'] || themePreset?.hero) 
                ? hexToRgbString(tColors.hero || settings['theme_hero'] || themePreset?.hero!, '26 15 9') 
                : darkenRgbString(textStr, 0.55);
            const surfaceStr = (tColors.surface || settings['theme_surface'] || themePreset?.surface)
                ? hexToRgbString(tColors.surface || settings['theme_surface'] || themePreset?.surface!, '250 250 247') 
                : lightenRgbString(bgStartStr, 0.4);

            const themeVars = {
                primary: primaryStr,
                secondary: secondaryStr,
                text: textStr,
                accent: accentStr,
                bgStart: bgStartStr,
                bgEnd: bgEndStr,
                primaryDark: primaryDarkStr,
                primaryLight: primaryLightStr,
                hero: heroStr,
                surface: surfaceStr,
                patternOpacity: tColors.opacity || settings['theme_pattern_opacity'] || '0.05',
                // Custom Header/Footer background (raw hex, not RGB — used as direct color values)
                headerBg: tColors.headerBg || settings['theme_header_bg'] || '',
                footerBg: tColors.footerBg || settings['theme_footer_bg'] || '',
            };

            return {
                settings,
                categoriesTree,
                pagesTree,
                aboutSectionsTree,
                themeVars,
                tenant: t as any,
                hasProjects: projectsCount > 0
            };
        },
        ['unified-layout-v16-final-visibility-fix', domain, tenantId],
        { revalidate: false, tags: [CACHE_TAGS.SITE_SETTINGS, CACHE_TAGS.CATEGORIES, CACHE_TAGS.pages.list(tenantId), CACHE_TAGS.pages.aboutSections(tenantId), CACHE_TAGS.system.tenantConfig(tenantId || domain), `tenant-config-${domain}`] }
    )();
};

// ─── UNIFIED DETAIL PAGE DATA BUNDLES ──────────────────────────────────────────

export const getCachedNewsDetail = async (
    slug: string,
    tenantId?: string
) => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            
            // 1. Lấy bài viết chính
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

            // 2. Lấy dữ liệu liên quan NGAY TRONG LẦN NÀY
            // Chạy song song Related News & Tags
            let relatedQuery = supabase
                .from('news')
                .select('*, categories(*)')
                .eq('status', 'published')
                .neq('id', articleData.id);

            if (articleData.category_id) {
                // Tìm tất cả ID danh mục có cùng slug với danh mục của bài viết này
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
        { revalidate: TTL.NEWS, tags: [CACHE_TAGS.news.all, tenantId ? CACHE_TAGS.news.tenant(tenantId) : 'news-all', CACHE_TAGS.news.item(slug)] }
    )();
};

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

            // Hỗ trợ tìm theo slug hoặc ID cũ    
            query = query.or(`slug.eq.${slugOrId},id.eq.${slugOrId}`);

            if (tenantId) {
                query = query.or(`tenant_id.eq.${tenantId},tenant_id.eq.55555555-5555-5555-5555-555555555555,published_to.cs.{${tenantId}}`);
            }

            const { data: eventData } = await query.maybeSingle();
            
            if (!eventData) return null;

            // Related Events
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

            // Fetch registration count
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
        { revalidate: TTL.EVENTS, tags: [CACHE_TAGS.events.all, tenantId ? CACHE_TAGS.events.tenant(tenantId) : 'events-all', CACHE_TAGS.events.item(slugOrId)] }
    )();
};

export const getCachedDharmaTalkDetail = async (
    slugOrId: string,
    tenantId?: string
) => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            let query = supabase
                .from('dharma_talks')
                .select('*, categories(*)')
                .eq('is_active', true)
                .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`);

            if (tenantId) {
                query = query.or(`tenant_id.eq.${tenantId},tenant_id.eq.55555555-5555-5555-5555-555555555555,published_to.cs.{${tenantId}}`);
            }

            const { data: talkData } = await query.maybeSingle();
            if (!talkData) return null;

            // Related Talks
            let relatedQuery = supabase
                .from('dharma_talks')
                .select('*, categories(*)')
                .eq('is_active', true)
                .neq('id', talkData.id);

            if (talkData.category_id) {
                relatedQuery = relatedQuery.eq('category_id', talkData.category_id);
            }

            if (tenantId) {
                relatedQuery = relatedQuery.or(`tenant_id.eq.${tenantId},tenant_id.eq.55555555-5555-5555-5555-555555555555,published_to.cs.{${tenantId}}`);
            }

            const tagsQuery = supabase
                .from('dharma_talk_tags')
                .select('tags(*)')
                .eq('dharma_talk_id', talkData.id);

            const [
                { data: relatedTalks },
                { data: tagData }
            ] = await Promise.all([
                relatedQuery.order('created_at', { ascending: false }).limit(3),
                tagsQuery
            ]);

            const tags = tagData?.map((t: any) => t.tags).filter(Boolean) || [];

            return {
                talk: talkData,
                relatedTalks: relatedTalks || [],
                tags
            };
        },
        ['talk-detail-bundle-v3', slugOrId, tenantId || 'all'],
        { revalidate: TTL.DHARMA_TALKS, tags: [CACHE_TAGS.dharmaTalks.all, tenantId ? CACHE_TAGS.dharmaTalks.list(tenantId) : 'dharma-talks-all', CACHE_TAGS.dharmaTalks.item(slugOrId)] }
    )();
};


export const getCachedDharmaTalksPage = async (
    page: number,
    categoryId: string,
    limit: number,
    tenantId?: string
) => {
    return unstable_cache(
        async () => {
            const supabase = getPublicClient();
            let query = supabase
                .from('dharma_talks')
                .select('*', { count: 'exact' })
                // .eq('category_id', categoryId) -> Thay bằng slug-based matching
                .eq('is_active', true);
            
            const { data: currentCat } = await supabase.from('categories').select('slug').eq('id', categoryId).single();
            if (currentCat?.slug) {
                const { data: relatedCats } = await supabase.from('categories').select('id').eq('slug', currentCat.slug);
                const categoryIds = relatedCats?.map(c => c.id) || [categoryId];
                query = query.in('category_id', categoryIds);
            } else {
                query = query.eq('category_id', categoryId);
            }

            if (tenantId) {
                query = query.or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`);
            }

            const offset = (page - 1) * limit;
            const { data, count } = await query
                .order('order_position', { ascending: true })
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            return {
                talks: data || [],
                total: count || 0
            };
        },
        ['dharma-talks-page-v1', page.toString(), categoryId, limit.toString(), tenantId || 'all'],
        { revalidate: TTL.DHARMA_TALKS, tags: ['dharma-talks', tenantId ? `dharma-talks-${tenantId}` : 'dharma-talks-all'] }
    )();
};

