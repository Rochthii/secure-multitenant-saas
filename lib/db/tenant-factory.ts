/**
 * ============================================================================
 * TENANT FACTORY — lib/db/tenant-factory.ts
 * ============================================================================
 * "Nhà máy" trung tâm cho mọi truy vấn dữ liệu đa chi nhánh.
 *
 * NGUYÊN TẮC:
 *   1. Mọi query PUBLIC phải qua createTenantQuery()
 *   2. Mọi query ADMIN phải qua createAdminTenantQuery()
 *   3. Cache tự động với tags đúng chuẩn: `[module]-${tenantId}`
 *   4. Không bao giờ quên filter tenant_id
 *
 * SỬ DỤNG:
 *   import { getTenantData, getTenantDataCached } from '@/lib/db/tenant-factory';
 *
 *   // Fetch có cache (dùng cho frontend pages):
 *   const news = await getTenantDataCached('news', tenantId, {
 *       filter: [{ column: 'status', value: 'published' }],
 *       order: { column: 'published_at', ascending: false },
 *       limit: 10,
 *       cacheTag: 'news',
 *   });
 *
 *   // Fetch không cache (dùng cho admin pages):
 *   const news = await getTenantData('news', tenantId, { ... });
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import type { Database } from '@/lib/supabase/database.types';

// ─── Types ────────────────────────────────────────────────────────────────────

type TableName = keyof Database['public']['Tables'];

export interface TenantQueryOptions {
    /** Điều kiện lọc bổ sung (ngoài tenant_id) */
    filter?: Array<{
        column: string;
        value: string | number | boolean | null;
        operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'is' | 'in';
    }>;
    /** Sắp xếp kết quả */
    order?: {
        column: string;
        ascending?: boolean;
    };
    /** Giới hạn số kết quả */
    limit?: number;
    /** Các cột cần lấy (mặc định '*') */
    select?: string;
    /** Tag cache (sẽ được tự động kết hợp với tenantId) */
    cacheTag?: string;
    /** TTL cache (giây, mặc định false = vĩnh viễn) */
    cacheTtl?: number | false;
}

// ─── Public Client (không có cookies, an toàn với unstable_cache) ─────────────

function createPublicClient() {
    return createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

// ─── Core Query Builder ───────────────────────────────────────────────────────

/**
 * Xây dựng và thực thi query có filter tenant_id tự động.
 * KHÔNG có cache — dùng cho admin pages hoặc data real-time.
 */
export async function getTenantData<T = any>(
    tableName: string,
    tenantId: string,
    options: Omit<TenantQueryOptions, 'cacheTag' | 'cacheTtl'> = {}
): Promise<T[]> {
    const supabase = createPublicClient();

    let query = supabase
        .from(tableName as any)
        .select(options.select || '*')
        .eq('tenant_id', tenantId);

    // Áp dụng các filter bổ sung
    if (options.filter) {
        for (const f of options.filter) {
            const op = f.operator || 'eq';
            if (op === 'eq') query = (query as any).eq(f.column, f.value);
            else if (op === 'neq') query = (query as any).neq(f.column, f.value);
            else if (op === 'gt') query = (query as any).gt(f.column, f.value);
            else if (op === 'gte') query = (query as any).gte(f.column, f.value);
            else if (op === 'lt') query = (query as any).lt(f.column, f.value);
            else if (op === 'lte') query = (query as any).lte(f.column, f.value);
            else if (op === 'is') query = (query as any).is(f.column, f.value);
            else if (op === 'in' && Array.isArray(f.value)) query = (query as any).in(f.column, f.value);
        }
    }

    if (options.order) {
        query = (query as any).order(options.order.column, {
            ascending: options.order.ascending ?? false,
        });
    }

    if (options.limit) {
        query = (query as any).limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error(`[TenantFactory] Error fetching ${tableName} for tenant ${tenantId}:`, error.message);
        return [];
    }

    return (data || []) as T[];
}

/**
 * Xây dựng và thực thi query có filter tenant_id tự động.
 * CÓ cache với unstable_cache — dùng cho frontend pages.
 *
 * Tags tự động: ['[cacheTag]-[tenantId]', '[cacheTag]-all']
 */
export async function getTenantDataCached<T = any>(
    tableName: string,
    tenantId: string,
    options: TenantQueryOptions = {}
): Promise<T[]> {
    const cacheTag = options.cacheTag || tableName;
    const ttl = options.cacheTtl !== undefined ? options.cacheTtl : false;

    const cacheKey = [
        tableName,
        tenantId,
        cacheTag,
        JSON.stringify(options.filter || []),
        options.order?.column || 'default',
        String(options.limit || 'all'),
        options.select || '*',
    ];

    return unstable_cache(
        async () => getTenantData<T>(tableName, tenantId, options),
        cacheKey,
        {
            revalidate: ttl,
            tags: [
                cacheTag,
                `${cacheTag}-${tenantId}`,
                `${cacheTag}-all`,
            ],
        }
    )();
}

/**
 * Lấy một bản ghi đơn theo ID và tenant_id.
 */
export async function getTenantRecord<T = any>(
    tableName: string,
    tenantId: string,
    id: string,
    select = '*'
): Promise<T | null> {
    const supabase = createPublicClient();

    const { data, error } = await supabase
        .from(tableName as any)
        .select(select)
        .eq('tenant_id', tenantId)
        .eq('id', id)
        .maybeSingle();

    if (error) {
        console.error(`[TenantFactory] Error fetching ${tableName}/${id}:`, error.message);
        return null;
    }

    return data as T | null;
}

/**
 * Lấy một bản ghi đơn theo slug và tenant_id.
 * Hữu ích cho routing slug-based.
 */
export async function getTenantRecordBySlug<T = any>(
    tableName: string,
    tenantId: string,
    slug: string,
    select = '*'
): Promise<T | null> {
    const supabase = createPublicClient();

    const { data, error } = await supabase
        .from(tableName as any)
        .select(select)
        .eq('tenant_id', tenantId)
        .eq('slug', slug)
        .maybeSingle();

    if (error) {
        console.error(`[TenantFactory] Error fetching ${tableName} by slug "${slug}":`, error.message);
        return null;
    }

    return data as T | null;
}

// ─── Cache Tag Helpers ────────────────────────────────────────────────────────

/**
 * Tạo tags chuẩn cho một module và tenant.
 * Dùng trong revalidateTag() của Server Actions.
 *
 * @example
 * import { buildCacheTags } from '@/lib/db/tenant-factory';
 * const tags = buildCacheTags('news', tenantId);
 * // → ['news', 'news-uuid-abc123', 'news-all']
 */
export function buildCacheTags(module: string, tenantId?: string | null): string[] {
    const base = [module, `${module}-all`];
    if (tenantId) base.push(`${module}-${tenantId}`);
    return base;
}

/**
 * Revalidate cache cho một module và tenant cụ thể.
 * Import và gọi trong Server Actions sau khi thao tác CRUD thành công.
 *
 * @example
 * import { revalidateTenantCache } from '@/lib/db/tenant-factory';
 * revalidateTenantCache('news', tenantId);
 */
export function revalidateTenantModule(module: string, tenantId?: string | null) {
    // Lazy import để tránh lỗi khi dùng ở server components không có revalidateTag
    const { revalidateTag } = require('next/cache');
    const tags = buildCacheTags(module, tenantId);
    for (const tag of tags) {
        revalidateTag(tag);
    }
}
