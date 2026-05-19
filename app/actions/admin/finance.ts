'use server';

import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/permissions';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAuditLog } from '@/lib/audit';

export interface BankAccount {
    id: string;
    tenant_id: string;
    bank_code: string;
    bank_name: string;
    account_number: string;
    account_name: string;
    qr_template: string;
    is_active: boolean;
    is_default: boolean;
    created_at: string;
}

// ------- READ -------

export async function getBankAccounts(tenantId?: string): Promise<{ accounts: BankAccount[]; error?: string }> {
    await requirePermission('settings', 'read');
    const supabase = await createClient() as any;

    let query = supabase.from('bank_accounts').select('*');
    if (tenantId) {
        query = query.eq('tenant_id', tenantId);
    }
    
    // Default sort
    query = query.order('is_default', { ascending: false }).order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) return { accounts: [], error: error.message };
    return { accounts: (data as BankAccount[]) || [] };
}

// ------- CREATE -------

export async function createBankAccount(formData: FormData): Promise<{ success: boolean; data?: BankAccount; error?: string }> {
    try {
        const user = await requireAdmin();
        await requirePermission('settings', 'update');

        const insertData = {
            tenant_id: formData.get('tenant_id') as string,
            bank_code: formData.get('bank_code') as string,
            bank_name: formData.get('bank_name') as string,
            account_number: formData.get('account_number') as string,
            account_name: (formData.get('account_name') as string).toUpperCase(),
            qr_template: (formData.get('qr_template') as string) || 'compact2',
            is_active: formData.get('is_active') === 'true',
            is_default: formData.get('is_default') === 'true',
        };

        const supabase = await createClient() as any;
        const { data, error } = await supabase.from('bank_accounts').insert(insertData).select().single();

        if (error) return { success: false, error: error.message };

        await createAuditLog({
            user,
            action: 'create',
            tableName: 'bank_accounts',
            recordId: data.id,
            newData: data,
        });

        revalidatePath('/admin/finance/bank-accounts');
        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message || 'Lỗi server khi tạo tài khoản' };
    }
}

// ------- UPDATE -------

export async function updateBankAccount(id: string, formData: FormData): Promise<{ success: boolean; data?: BankAccount; error?: string }> {
    try {
        const user = await requireAdmin();
        await requirePermission('settings', 'update');

        const updateData = {
            bank_code: formData.get('bank_code') as string,
            bank_name: formData.get('bank_name') as string,
            account_number: formData.get('account_number') as string,
            account_name: (formData.get('account_name') as string).toUpperCase(),
            qr_template: (formData.get('qr_template') as string) || 'compact2',
            is_active: formData.get('is_active') === 'true',
            is_default: formData.get('is_default') === 'true',
        };

        const supabase = await createClient() as any;
        const { data: oldData } = await supabase.from('bank_accounts').select('*').eq('id', id).single();
        const { error } = await supabase.from('bank_accounts').update(updateData).eq('id', id);

        if (error) return { success: false, error: error.message };

        await createAuditLog({
            user,
            action: 'update',
            tableName: 'bank_accounts',
            recordId: id,
            oldData,
            newData: updateData,
        });

        revalidatePath('/admin/finance/bank-accounts');
        const { data: updatedData } = await supabase.from('bank_accounts').select('*').eq('id', id).single();
        return { success: true, data: updatedData };
    } catch (err: any) {
        return { success: false, error: err.message || 'Lỗi server khi cập nhật tài khoản' };
    }
}

// ------- DELETE -------

export async function deleteBankAccount(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const user = await requireAdmin();
        await requirePermission('settings', 'delete');

        const supabase = await createClient() as any;
        const { data: oldData } = await supabase.from('bank_accounts').select('*').eq('id', id).single();
        const { error } = await supabase.from('bank_accounts').delete().eq('id', id);

        if (error) return { success: false, error: error.message };

        await createAuditLog({
            user,
            action: 'delete',
            tableName: 'bank_accounts',
            recordId: id,
            oldData,
        });

        revalidatePath('/admin/finance/bank-accounts');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Lỗi server khi xóa tài khoản' };
    }
}

// ------- REPORTING -------

export async function getTransactionReportData(filters: {
    startDate?: string;
    endDate?: string;
    tenantId?: string;
    recipientType?: 'tenant_fund' | 'charity_fund' | 'all';
    status?: 'pending' | 'confirmed' | 'cancelled' | 'all';
    purposeId?: string;
}) {
    try {
        await requirePermission('transactions', 'read');
        const supabase = await createClient() as any;

        let query = supabase.from('transactions').select(`
            *,
            tenants (name),
            transaction_projects!project_id (title_vi, type),
            bank_accounts (bank_name, account_number, account_name)
        `);

        if (filters.tenantId && filters.tenantId !== 'all') {
            query = query.eq('tenant_id', filters.tenantId);
        }

        if (filters.recipientType && filters.recipientType !== 'all') {
            query = query.eq('recipient_type', filters.recipientType);
        }

        if (filters.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        }

        if (filters.purposeId && filters.purposeId !== 'all') {
            query = query.eq('project_id', filters.purposeId);
        }

        if (filters.startDate) {
            query = query.gte('created_at', filters.startDate);
        }

        if (filters.endDate) {
            // Add 23:59:59 to end date to include the whole day
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59, 999);
            query = query.lte('created_at', end.toISOString());
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (err: any) {
        console.error('Report data fetch error:', err);
        return { success: false, error: err.message };
    }
}
