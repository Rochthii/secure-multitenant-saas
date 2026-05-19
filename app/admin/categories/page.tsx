import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getUserContext } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { CategoriesClient } from '@/app/admin/t/[tenant_id]/categories/categories-client';
import { GlobalCategory, TenantMetadata } from '@/types/admin';

export const metadata = {
    title: 'Quản lý Danh mục Hệ Thống | Admin',
};

export default async function GlobalCategoriesAdminPage() {
    const ctx = await getUserContext();
    if (!ctx || !['super_admin', 'company_editor', 'admin'].includes(ctx.role)) {
        redirect('/admin/select-tenant');
    }

    const supabase = await createClient();

    // Fetch all tenants
    const { data: tenantsData } = await (supabase as any)
        .from('tenants')
        .select('id, name')
        .eq('tenant_type', 'tenant')
        .order('name');
    const tenants = (tenantsData as unknown as TenantMetadata[]) || [];

    // Fetch all categories (no tenant filter)
    const { data: categoriesRaw } = await supabase
        .from('categories')
        .select('*')
        .order('order_position', { ascending: true })
        .order('created_at', { ascending: true });

    // Label categories by tenant for clarity in global view
    const categories = ((categoriesRaw as any[]) || []).map((cat: GlobalCategory) => {
        const isGlobal = cat.tenant_id === '55555555-5555-5555-5555-555555555555' || !cat.tenant_id;
        const tenant = tenants.find((t) => t.id === cat.tenant_id);

        return {
            ...cat,
            name_vi: isGlobal ? `DANH MỤC HỆ THỐNG > ${cat.name_vi}` : (tenant ? `${tenant.name} > ${cat.name_vi}` : `Danh mục chung > ${cat.name_vi}`)
        };
    });

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-playfair font-bold">Quản lý Danh mục Hệ thống</h1>
            </div>

            <CategoriesClient 
                initialCategories={categories as any} 
                tenantId={undefined as any} // Using undefined to signal global context
            />
        </div>
    );
}
