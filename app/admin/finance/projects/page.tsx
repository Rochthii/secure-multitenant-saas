import React from 'react';
import { requirePermission, checkPermission } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/server';
import { getBankAccounts } from '@/app/actions/admin/finance';
import { ProjectsTable } from '../../../../components/admin/campaigns-table';

export const revalidate = 0;

export default async function GlobalProjectsPage() {
    await requirePermission('finance', 'read');
    
    const supabase = await createClient();
    
    // Fetch ALL projects across all tenants
    const { data: projects } = await (supabase as any)
        .from('transaction_projects')
        .select(`
            *,
            tenants (name)
        `)
        .order('created_at', { ascending: false });

    // Fetch ALL tenants for the selection dropdown
    const { data: tenants } = await (supabase as any)
        .from('tenants')
        .select('id, name')
        .order('name');

    // Fetch Global Bank Accounts (from the company)
    const { data: company } = await (supabase as any)
        .from('tenants')
        .select('id')
        .eq('tenant_type', 'company')
        .maybeSingle(); 
    
    const { accounts: bankAccounts } = company ? await getBankAccounts(company.id) : { accounts: [] };

    const canUpdate = await checkPermission('finance', 'update');
    const canDelete = await checkPermission('finance', 'delete');

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-playfair font-bold">Hạng mục (Projects)</h1>
                <p className="text-gray-500">
                    Quản lý tất cả các Quỹ chung và Dự án thanh toán cụ thể trên hệ thống.
                </p>
            </div>

            <ProjectsTable 
                initialProjects={projects?.map((c: any) => ({
                    ...c,
                    title: c.title_vi,
                    description: c.description_vi,
                })) as any || []} 
                bankAccounts={bankAccounts} 
                canUpdate={canUpdate}
                canDelete={canDelete}
                tenants={tenants || []}
                companyTenantId={company?.id}
            />
        </div>
    );
}
