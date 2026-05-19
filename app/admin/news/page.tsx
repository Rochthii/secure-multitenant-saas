import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { NewsListView } from '@/components/admin/news-list-view';
import { getUserContext } from '@/lib/permissions';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Quản lý Tin Tức Hệ Thống | Admin',
};

export default async function GlobalNewsListPage({ searchParams }: { searchParams: any }) {
    const supabase = await createClient();
    const ctx = await getUserContext();

    if (!ctx || !['super_admin', 'company_editor', 'admin'].includes(ctx.role)) {
        redirect('/admin/select-tenant');
    }

    // Fetch all tenants for filtering
    const { data: tenants } = await (supabase as any)
        .from('tenants')
        .select('id, name')
        .eq('tenant_type', 'tenant')
        .order('name', { ascending: true });

    return (
        <NewsListView
            searchParams={searchParams}
            basePath="/admin/news"
            dbClient={supabase}
            tenantId={undefined}
            tenants={tenants || []}
        />
    );
}
