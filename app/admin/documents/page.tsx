import React from 'react';
import { getDharmaTalksAdmin } from '@/app/actions/admin/dharma-talks';
import { DharmaTalksClient } from '@/app/admin/t/[tenant_id]/documents/dharma-talks-client';
import { createClient } from '@/lib/supabase/server';
import { getUserContext } from '@/lib/permissions';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Quản lý Tài liệu & SOP Hệ thống | Admin',
};

export default async function GlobalDocumentsAdminPage() {
    const ctx = await getUserContext();
    if (!ctx || !['super_admin', 'company_editor', 'admin'].includes(ctx.role)) {
        redirect('/admin/select-tenant');
    }

    const talks = await getDharmaTalksAdmin(undefined); // No tenant ID filters to global or gets all
    const supabase = await createClient();

    const currentUserRole = ctx.role;

    // Fetch tenants for broadcast selection and labeling (lấy danh sách các công ty/workspace thành viên)
    const { data: tenantsData } = await (supabase as any)
        .from('tenants')
        .select('id, name, domain')
        .eq('tenant_type', 'company')
        .order('name');
    const tenants = tenantsData || [];

    // Fetch all categories for dharma, labeled by tenant
    const { data: categoriesRaw } = await (supabase as any)
        .from('categories')
        .select('*')
        .eq('module', 'dharma')
        .order('name_vi');

    const categories = (categoriesRaw || []).map((cat: any) => {
        const isGlobal = cat.tenant_id === '55555555-5555-5555-5555-555555555555' || !cat.tenant_id;
        const tenant = tenants.find((t: any) => t.id === cat.tenant_id);

        return {
            ...cat,
            name_vi: isGlobal ? `DANH MỤC HỆ THỐNG > ${cat.name_vi}` : (tenant ? `${tenant.name} > ${cat.name_vi}` : `Danh mục chung > ${cat.name_vi}`)
        };
    });

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-150">Học Liệu & Quy Trình SOP Hệ Thống</h1>
                    <p className="text-xs text-slate-500 dark:text-zinc-450 mt-1">Danh sách tập trung toàn bộ tài liệu hướng dẫn và video SOP trên toàn hệ thống.</p>
                </div>
            </div>
            <DharmaTalksClient
                initialTalks={talks as any}
                categories={categories || []}
                tenants={tenants || []}
                contextTenantId={undefined as any}
                currentUserRole={currentUserRole}
            />
        </div>
    );
}
