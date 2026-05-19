import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getUserContext } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { MediaListClient } from '@/app/admin/t/[tenant_id]/media/media-list-client';
import { getCachedCategoriesTree, CategoryNode } from '@/lib/cache/queries';

export const metadata = {
    title: 'Quản lý Thư viện Media Hệ Thống | Admin',
};

const GLOBAL_TENANT_ID = '55555555-5555-5555-5555-555555555555';

export default async function GlobalMediaAdminPage() {
    const ctx = await getUserContext();
    if (!ctx || !['super_admin', 'company_editor', 'admin'].includes(ctx.role)) {
        redirect('/admin/select-tenant');
    }

    const supabase = await createClient();

    // Fetch all tenants for labeling categories in global view
    const { data: tenantsData } = await (supabase as any)
        .from('tenants')
        .select('id, name, domain')
        .eq('tenant_type', 'tenant')
        .order('name');
    const tenants = tenantsData || [];

    // Fetch all media (Library) - No tenant filter for global view
    const { data: media } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

    // Fetch standardized category tree for global view (no tenantId = fetches all)
    const allCategoriesTree = await getCachedCategoriesTree(undefined, 'company');

    // Combine media + documents categories for MediaListClient
    // Merge into a single flat list at root level, labelling tenant categories with the tenant name
    const labelNodeWithTenant = (node: CategoryNode, tenantsMap: Record<string, string>): CategoryNode => {
        const isGlobal = node.tenant_id === GLOBAL_TENANT_ID || !node.tenant_id;
        const tenantName = node.tenant_id ? tenantsMap[node.tenant_id] : null;
        return {
            ...node,
            name_vi: (!isGlobal && tenantName) ? `${tenantName} › ${node.name_vi}` : node.name_vi,
            children: (node.children || []).map(child => labelNodeWithTenant(child, tenantsMap)),
        };
    };

    const tenantsMap: Record<string, string> = {};
    tenants.forEach((t: any) => { tenantsMap[t.id] = t.name; });

    // Merge media + documents into one flat root-level tree for MediaListClient
    const mediaCategoryNodes = (allCategoriesTree.media || []).map((n: CategoryNode) => labelNodeWithTenant(n, tenantsMap));
    const documentsCategoryNodes = (allCategoriesTree.documents || []).map((n: CategoryNode) => labelNodeWithTenant(n, tenantsMap));
    const categoriesTree: CategoryNode[] = [...mediaCategoryNodes, ...documentsCategoryNodes];

    return (
        <div className="max-w-6xl mx-auto">
            <MediaListClient
                tenantId={undefined as any}
                media={media || []}
                categoriesTree={categoriesTree}
                tenants={tenants}
            />
        </div>
    );
}
