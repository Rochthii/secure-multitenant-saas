import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Temporary debug endpoint — DELETE AFTER USE
// Usage: GET /api/debug-categories?domain=chuaphuly.web.app
export async function GET(request: NextRequest) {
    const domain = request.nextUrl.searchParams.get('domain') || 'chuaphuly.web.app';
    
    const supabase = await createAdminClient();
    
    // 1. Get tenant
    const { data: tenant } = await supabase
        .from('tenants' as any)
        .select('id, name, tenant_type')
        .or(`domain.eq.${domain},custom_domain.eq.${domain}`)
        .single();

    if (!tenant) {
        return NextResponse.json({ error: 'Tenant not found', domain });
    }

    const tenantId = (tenant as any).id;

    // 2. Get ALL categories for this tenant (with null + 55555555 + tenant)
    const { data: cats } = await supabase
        .from('categories')
        .select('id, name_vi, slug, module, parent_id, tenant_id, is_visible, order_position')
        .or(`tenant_id.eq.55555555-5555-5555-5555-555555555555,tenant_id.eq.${tenantId}`)
        .in('module', ['news', 'dharma', 'documents'])
        .eq('is_visible', true)
        .order('module')
        .order('order_position');

    // 3. Group by slug to find duplicates
    const slugMap: Record<string, any[]> = {};
    (cats || []).forEach((c: any) => {
        if (!slugMap[c.slug]) slugMap[c.slug] = [];
        slugMap[c.slug].push(c);
    });
    const duplicates = Object.entries(slugMap).filter(([, items]) => items.length > 1);

    // 4. Orphan check — categories whose parent_id doesn't exist in fetched list
    const catIds = new Set((cats || []).map((c: any) => c.id));
    const orphans = (cats || []).filter((c: any) => c.parent_id && !catIds.has(c.parent_id));

    return NextResponse.json({
        tenant: { id: tenantId, name: (tenant as any).name, type: (tenant as any).tenant_type },
        totalCategories: (cats || []).length,
        categories: cats,
        duplicateSlugs: duplicates.map(([slug, items]) => ({ slug, count: items.length, items })),
        orphanCategories: orphans,
    }, { status: 200 });
}
