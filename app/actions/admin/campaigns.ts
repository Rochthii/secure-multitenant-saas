'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { requireAdmin, requireEditor } from '@/lib/auth/require-admin';
import { requirePermission, enforceTenantScopeForRecord, getUserTenantId, getUserContext } from '@/lib/permissions';
import { createAuditLog } from '@/lib/audit';
import { saveRevision } from './revisions';
import { generateSlug } from '@/lib/utils';
import { CACHE_TAGS } from '@/lib/cache/tags';

function revalidateProjectCache(tenantId?: string | null) {
    // @ts-ignore
    revalidateTag('transaction-projects');
    
    if (tenantId) {
        // @ts-ignore
        revalidateTag(CACHE_TAGS.transactions?.projects?.tenant?.(tenantId) || `transaction-projects-${tenantId}`);
        // @ts-ignore
        revalidateTag(CACHE_TAGS.transactions?.confirmed?.tenant?.(tenantId) || `confirmed-transactions-${tenantId}`);
        // @ts-ignore
        revalidateTag(CACHE_TAGS.system?.dashboardStats?.(tenantId) || `dashboard-stats-${tenantId}`);
    } else {
        // @ts-ignore
        revalidateTag(CACHE_TAGS.transactions?.projects?.all || 'transaction-projects-all');
        // @ts-ignore
        revalidateTag(CACHE_TAGS.transactions?.confirmed?.all || 'confirmed-transactions-all');
        // @ts-ignore
        revalidateTag(CACHE_TAGS.system?.dashboardStatsGlobal || 'dashboard-stats-global');
    }
}

export async function createTransactionProject(formData: FormData) {
    try {
        const user = await requireEditor();
        const type = formData.get('type') as 'general_fund' | 'specific_project';
        
        // Cần quyền settings update cho quỹ chung, quyền transactions create cho dự án
        if (type === 'general_fund') {
            await requirePermission('settings', 'update');
        } else {
            await requirePermission('transactions', 'create');
        }
        
        const supabase = await createClient();
        const context = await getUserContext();

        const titleVi = formData.get('title_vi') as string;
        
        let id = formData.get('id') as string;
        if (!id) {
            id = crypto.randomUUID();
        }

        const data = {
            id,
            type,
            title_vi: titleVi,
            title_km: (formData.get('title_km') as string) || null,
            slug: (formData.get('slug') as string) || (type === 'specific_project' ? generateSlug(titleVi) : null),
            description_vi: (formData.get('description_vi') as string) || null,
            description_km: (formData.get('description_km') as string) || null,
            content_vi: (formData.get('content_vi') as string) || null,
            content_km: (formData.get('content_km') as string) || null,
            thumbnail_url: (formData.get('thumbnail_url') as string) || null,
            target_amount: parseFloat(formData.get('target_amount') as string) || 0,
            current_amount: 0,
            status: ((formData.get('status') as string) || 'ongoing') as 'ongoing' | 'completed' | 'cancelled',
            is_active: formData.get('is_active') === 'true',
            bank_account_id: formData.get('bank_account_id') === 'none' ? null : formData.get('bank_account_id') as string || null,
            tenant_id: formData.get('tenant_id') as string || null,
            created_by: user.id
        };

        let finalTenantId = data.tenant_id;
        if (context && !['super_admin', 'company_editor'].includes(context.role) && context.tenantId) {
            finalTenantId = context.tenantId; // Ép buộc Tenant của chính admin
        }

        const projectData = {
            ...data,
            tenant_id: finalTenantId || null,
        };

        const { data: inserted, error } = await (supabase as any)
            .from('transaction_projects')
            .insert([projectData])
            .select('*, tenants(name)')
            .single();

        if (error) throw error;

        await createAuditLog({
            user,
            action: 'create',
            tableName: 'transaction_projects',
            recordId: inserted?.id || 'new',
            newData: projectData,
            tenantId: finalTenantId,
        });

        revalidatePath('/admin/finance/projects');
        revalidatePath('/admin/finance/purposes');
        
        if (finalTenantId) {
            revalidatePath(`/admin/t/${finalTenantId}/projects`);
            revalidatePath(`/admin/t/${finalTenantId}/dashboard`);
        } else {
            revalidatePath('/admin/projects');
        }
        
        revalidatePath('/transactions');
        revalidatePath('/');
        revalidateProjectCache(finalTenantId);

        return { success: true, data: inserted };
    } catch (error: any) {
        if (error.name === 'UnauthorizedError') return { success: false, error: 'Bạn không có quyền', unauthorized: true };
        console.error('Error creating transaction project:', error);
        return { success: false, error: error.message || 'Có lỗi khi tạo chiến dịch' };
    }
}

export async function updateTransactionProject(id: string, formData: FormData) {
    try {
        const user = await requireEditor();
        await enforceTenantScopeForRecord('transaction_projects', id);
        const supabase = await createClient();

        const type = formData.get('type') as 'general_fund' | 'specific_project';
        const titleVi = formData.get('title_vi') as string;

        if (type === 'general_fund') {
            await requirePermission('settings', 'update');
        } else {
            await requirePermission('transactions', 'update');
        }

        const data = {
            title_vi: titleVi,
            title_km: (formData.get('title_km') as string) || null,
            slug: (formData.get('slug') as string) || (type === 'specific_project' ? generateSlug(titleVi) : null),
            description_vi: (formData.get('description_vi') as string) || null,
            description_km: (formData.get('description_km') as string) || null,
            content_vi: (formData.get('content_vi') as string) || null,
            content_km: (formData.get('content_km') as string) || null,
            thumbnail_url: (formData.get('thumbnail_url') as string) || null,
            target_amount: parseFloat(formData.get('target_amount') as string) || 0,
            status: ((formData.get('status') as string) || 'ongoing') as 'ongoing' | 'completed' | 'cancelled',
            is_active: formData.get('is_active') === 'true',
            bank_account_id: formData.get('bank_account_id') === 'none' ? null : formData.get('bank_account_id') as string || null,
            updated_at: new Date().toISOString()
        };

        const { data: oldData } = await (supabase as any).from('transaction_projects').select('*').eq('id', id).single();
        const { data: updated, error } = await (supabase as any)
            .from('transaction_projects')
            .update(data)
            .eq('id', id)
            .select('*, tenants(name)')
            .single();

        if (error) throw error;

        await createAuditLog({
            user,
            action: 'update',
            tableName: 'transaction_projects',
            recordId: id,
            oldData,
            newData: data,
            tenantId: oldData?.tenant_id,
        });

        if (oldData && type === 'specific_project') {
            await saveRevision({
                tableName: 'transaction_projects',
                recordId: id,
                changedBy: user.id,
                oldData,
                newData: data,
                changeSummary: `Cập nhật dự án: ${data.title_vi}`
            });
        }

        revalidatePath('/admin/finance/projects');
        revalidatePath('/admin/finance/purposes');

        if (oldData?.tenant_id) {
            revalidatePath(`/admin/t/${oldData.tenant_id}/projects`);
            revalidatePath(`/admin/t/${oldData.tenant_id}/dashboard`);
        } else {
            revalidatePath('/admin/projects');
        }

        revalidatePath('/transactions');
        revalidatePath('/');
        revalidateProjectCache(oldData?.tenant_id);

        return { success: true, data: updated };
    } catch (error: any) {
        if (error.name === 'UnauthorizedError') return { success: false, error: 'Bạn không có quyền', unauthorized: true };
        console.error('Error updating transaction project:', error);
        return { success: false, error: error.message || 'Có lỗi khi cập nhật chiến dịch' };
    }
}

export async function deleteTransactionProject(id: string) {
    try {
        const user = await requireAdmin();
        await enforceTenantScopeForRecord('transaction_projects', id);
        const supabase = await createClient();
        
        const { data: oldData } = await (supabase as any).from('transaction_projects').select('*').eq('id', id).single();

        if (oldData?.type === 'general_fund') {
            await requirePermission('settings', 'delete');
        } else {
            await requirePermission('transactions', 'delete');
        }

        const { error } = await (supabase as any)
            .from('transaction_projects')
            .delete()
            .eq('id', id);

        if (error) {
            if (error.code === '23503') return { success: false, error: 'Chương trình này đã có giao dịch phát tâm, không thể xóa thẳng. Vui lòng chuyển trạng thái sang Đã kết thúc / Đã hủy.' };
            throw error;
        }

        await createAuditLog({
            user,
            action: 'delete',
            tableName: 'transaction_projects',
            recordId: id,
            oldData,
            tenantId: oldData?.tenant_id,
        });

        revalidatePath('/admin/finance/projects');
        revalidatePath('/admin/finance/purposes');

        if (oldData?.tenant_id) {
            revalidatePath(`/admin/t/${oldData.tenant_id}/projects`);
            revalidatePath(`/admin/t/${oldData.tenant_id}/dashboard`);
        } else {
            revalidatePath('/admin/projects');
        }

        revalidatePath('/transactions');
        revalidatePath('/');
        revalidateProjectCache(oldData?.tenant_id);

        return { success: true };
    } catch (error: any) {
        if (error.name === 'UnauthorizedError') return { success: false, error: 'Bạn không có quyền', unauthorized: true };
        console.error('Error deleting transaction project:', error);
        return { success: false, error: 'Có lỗi khi xóa chiến dịch' };
    }
}
