import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getCachedCategoriesTree } from '@/lib/cache/queries';
// @ts-ignore
import { MediaListClient } from './media-list-client';
import { requireTenantAccess } from '@/lib/permissions';

export default async function MediaPage({ params }: { params: Promise<{ tenant_id: string }> }) {
    const { tenant_id: tenantId } = await params;
    await requireTenantAccess(tenantId);
    const supabase = await createClient();

    const [mediaRes, categoriesRes, tenantsRes] = await Promise.all([
        (supabase as any)
            .from('media')
            .select('*')
            .or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`)
            .order('created_at', { ascending: false }),
        getCachedCategoriesTree(tenantId),
        (supabase as any).from('tenants').select('id, name, domain').eq('tenant_type', 'tenant').order('name')
    ]);

    return (
        <MediaListClient
            tenantId={tenantId}
            media={mediaRes.data || []}
            categoriesTree={[...(categoriesRes.documents || []), ...(categoriesRes.media || [])]}
            tenants={tenantsRes.data || []}
        />
    );
}
