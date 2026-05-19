import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/require-admin';
// @ts-ignore
import { NewsForm } from '@/components/admin/news-form';
import { notFound, redirect } from 'next/navigation';
import { getUserContext } from '@/lib/permissions';

export default async function GlobalNewsEditPage({ params }: { params: Promise<{ id: string }> }) {
    // Auth guard
    const ctx = await getUserContext();
    if (!ctx || !['super_admin', 'company_editor', 'admin'].includes(ctx.role)) {
        redirect('/admin/login');
    }

    const { id } = await params;
    const supabase = await createClient();

    const currentUserRole = ctx.role;

    // Fetch tenants for broadcasting since this is global mode
    const { data: tenantsData } = await (supabase as any)
        .from('tenants')
        .select('id, name, domain')
        .order('name');
    const tenants = tenantsData || [];

    // Fetch categories: All categories for news, labeled by tenant
    const { data: categoriesRaw } = await (supabase as any)
        .from('categories')
        .select('*')
        .eq('module', 'news')
        .order('name_vi');

    const categories = (categoriesRaw || []).map((cat: any) => {
        const isGlobal = cat.tenant_id === '55555555-5555-5555-5555-555555555555' || !cat.tenant_id;
        const tenant = tenants.find((t: any) => t.id === cat.tenant_id);

        return {
            ...cat,
            name_vi: isGlobal ? `DANH MỤC HỆ THỐNG > ${cat.name_vi}` : (tenant ? `${tenant.name} > ${cat.name_vi}` : `Danh mục chung > ${cat.name_vi}`)
        };
    });

    // Tạo mới
    if (id === 'new') {
        return (
            <div>
                <NewsForm
                    categories={categories || []}
                    currentUserRole={currentUserRole}
                    tenants={tenants}
                    contextTenantId={undefined}
                />
            </div>
        );
    }

    // Chỉnh sửa
    const { data: news, error } = await (supabase as any)
        .from('news')
        .select('*, categories(name_vi)')
        .eq('id', id)
        .single();

    if (!news || error) {
        notFound();
    }

    return (
        <div>
            <NewsForm
                news={news}
                categories={categories || []}
                currentUserRole={currentUserRole}
                tenants={tenants}
                contextTenantId={undefined} // Important: keep undefined for global mode
            />
        </div>
    );
}
