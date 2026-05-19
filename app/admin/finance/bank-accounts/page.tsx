import React from 'react';
import { requirePermission, checkPermission } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/server';
import { getBankAccounts } from '@/app/actions/admin/finance';
import { BankAccountsManager } from '@/components/admin/bank-accounts-manager';

export const revalidate = 0;

export default async function BankAccountsPage() {
    await requirePermission('settings', 'read');
    
    const supabase = await createClient();
    
    // Fetch Global Bank Accounts (from the company)
    const { data: company } = await (supabase as any)
        .from('tenants')
        .select('id')
        .eq('tenant_type', 'company')
        .maybeSingle(); // For multi-tenant setup where some banks might live in Company
    
    // Or we could fetch everything if super admin. Let's keep existing logic.
    const { accounts: bankAccounts } = company ? await getBankAccounts(company.id) : { accounts: [] };

    const canUpdate = await checkPermission('settings', 'update');

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-playfair font-bold">Cơ cấu Tài khoản Ngân hàng</h1>
                <p className="text-gray-500">
                    Quản lý tài khoản ngân hàng để tiếp nhận đóng góp thanh toán.
                </p>
            </div>

            {company ? (
                <BankAccountsManager 
                    initialAccounts={bankAccounts} 
                    companyTenantId={company.id} 
                    canUpdate={canUpdate}
                />
            ) : (
                <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-xl">
                    <h2 className="text-lg font-bold text-slate-700">Chưa có đơn vị quản lý Tài khoản trung tâm</h2>
                    <p className="text-slate-500 mt-2">Hệ thống yêu cầu có một đơn vị (tenant) với loại 'company' để lưu trữ ngân hàng chung.</p>
                </div>
            )}
        </div>
    );
}
