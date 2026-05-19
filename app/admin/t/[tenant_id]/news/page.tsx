import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { NewsListView } from '@/components/admin/news-list-view';
import { requireTenantAccess } from '@/lib/permissions';

interface NewsListPageProps {
    searchParams?: any;
    params: Promise<{ tenant_id: string }>;
}

export default async function NewsListPage({ searchParams, params }: NewsListPageProps) {
    const supabase = await createClient();
    const resolvedParams = await params;
    const tenantId = resolvedParams.tenant_id;
    await requireTenantAccess(tenantId);

    return (
        <NewsListView
            searchParams={searchParams}
            basePath={`/admin/t/${tenantId}/news`}
            dbClient={supabase}
            tenantId={tenantId}
        />
    );
}
