/**
 * API Route: /api/sections/categories
 * Trả về danh sách news categories cho Zen Study Cards và các client components.
 * Kết quả được cache client-side trong sessionStorage.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCachedNewsCategories } from '@/lib/cache/queries';
import { getTenantConfig } from '@/lib/tenant';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const headersList = await headers();
        const host = headersList.get('host') || '';
        const tenant = await getTenantConfig(host);
        const tenantId = tenant?.id;

        const categories = await getCachedNewsCategories(tenantId);

        return NextResponse.json(
            { categories },
            {
                headers: { 'Cache-Control': 'no-store, max-age=0' },
            }
        );
    } catch (error) {
        console.error('[API] categories error:', error);
        return NextResponse.json({ categories: [] }, { status: 200 });
    }
}
