import React from 'react';
import { checkPermission, requireTenantAccess } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/server';
import { getBankAccounts } from '@/app/actions/admin/finance';
import { ProjectsTable } from '@/components/admin/campaigns-table';

export const revalidate = 0;

export default async function TenantProjectsPage({ params }: { params: Promise<{ tenant_id: string }> }) {
    const { tenant_id } = await params;
    await requireTenantAccess(tenant_id);
    
    // Fetch permissions based on contextual module
    const canUpdate = await checkPermission('transactions', 'update') || await checkPermission('settings', 'update');
    const canDelete = await checkPermission('transactions', 'delete') || await checkPermission('settings', 'delete');
    
    const supabase = await createClient();
    
    // Fetch ONLY projects across specific tenant
    const { data: projects } = await (supabase as any)
        .from('transaction_projects')
        .select(`
            *,
            tenants (name)
        `)
        .eq('tenant_id', tenant_id)
        .order('order_position', { ascending: true })
        .order('created_at', { ascending: false });

    // Bank Accounts: Fetch accounts specific to this tenant
    const { accounts: bankAccounts } = await getBankAccounts(tenant_id);

    return (
        <div className="space-y-6" suppressHydrationWarning>
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-playfair font-bold">Hạng mục đóng góp quỹ</h1>
                <p className="text-gray-500">
                    Quản lý các danh mục nhận quỹ chung và tiến độ các dự án cụ thể của cơ sở.
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
                currentTenantId={tenant_id}
                tenants={[]} // Empty implies it belongs contextually to this tenant
            />
        </div>
    );
}
