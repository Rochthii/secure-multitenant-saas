'use server';

import { createClient } from '@/lib/supabase/server';
import {
    revalidatePath, // @ts-ignore
    revalidateTag
} from 'next/cache';
import { requireAdmin } from '@/lib/auth/require-admin';
import { requirePermission, enforceTenantScopeForRecord } from '@/lib/permissions';
import { createAuditLog } from '@/lib/audit';
import { TransactionUpdateSchema } from '@/lib/validations/admin';
import { notifyAllUsers } from '@/lib/notifications';
import { CACHE_TAGS } from '@/lib/cache/tags';

/**
 * Xác nhận thanh toán (admin) — set status = 'confirmed'
 */
export async function confirmTransaction(id: string) {
    try {
        const user = await requireAdmin(); // fallback compatible
        await requirePermission('transactions', 'update');
        await enforceTenantScopeForRecord('transactions', id);
        const supabase = await createClient();

        if (!id || typeof id !== 'string') {
            return { success: false, error: 'ID giao dịch không hợp lệ' };
        }

        const { data: roleData } = await (supabase as any)
            .from('user_roles')
            .select('tenant_id, role')
            .eq('user_id', user.id)
            .maybeSingle();

        let query = (supabase as any).from('transactions').select('*').eq('id', id);

        if (roleData?.role !== 'super_admin' && roleData?.tenant_id) {
            query = query.eq('tenant_id', roleData.tenant_id);
        }

        const { data: oldData } = await query.single();

        if (!oldData) {
            return { success: false, error: 'Không tìm thấy giao dịch hoặc bạn không có quyền' };
        }

        const updateData = {
            status: 'confirmed',
            completed_at: new Date().toISOString(),
        };

        const { data: updated, error } = await (supabase as any)
            .from('transactions')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Confirm transaction error:', error);
            return { success: false, error: 'Có lỗi khi xác nhận thanh toán: ' + error.message };
        }

        // Tự động kiểm tra và cộng dồn tiến độ nếu mục đích này thuộc về một Hạng mục/Chiến dịch
        if (oldData?.project_id && oldData?.amount) {
            // Check in transaction_projects
            const { data: project } = await (supabase as any)
                .from('transaction_projects')
                .select('id, current_amount')
                .eq('id', oldData.project_id)
                .eq('tenant_id', oldData.tenant_id)
                .single();
        
            if (project) {
                const newAmount = (project.current_amount || 0) + oldData.amount;
                const { error: projectUpdateError } = await (supabase as any)
                    .from('transaction_projects')
                    .update({ current_amount: newAmount })
                    .eq('id', project.id)
                    .eq('tenant_id', oldData.tenant_id);
        
                if (projectUpdateError) {
                    console.error('Failed to update project progress:', projectUpdateError);
                }
            }
        }

        if (!updated) {
            return { success: false, error: 'Không tìm thấy giao dịch.' };
        }

        await createAuditLog({
            user,
            action: 'approve',
            tableName: 'transactions',
            recordId: id,
            oldData: oldData ?? null,
            newData: updateData,
            tenantId: (oldData as any)?.tenant_id,
        });

        revalidatePath('/admin/transactions');
        revalidatePath('/admin/dashboard');

        const tenantId = (oldData as any)?.tenant_id;
        if (tenantId) {
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.projects.tenant(tenantId));
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.confirmed.tenant(tenantId));
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.recent.tenant(tenantId));
            // @ts-ignore
            revalidateTag(CACHE_TAGS.system.dashboardStats(tenantId));
        } else {
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.projects.all);
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.confirmed.all);
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.recent.all);
            // @ts-ignore
            revalidateTag(CACHE_TAGS.system.dashboardStatsGlobal);
        }
        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Confirm transaction error:', err);
        return { success: false, error: 'Có lỗi xảy ra: ' + (err.message || 'Unknown') };
    }
}

/**
 * Hủy/Từ chối thanh toán (admin) — set status = 'cancelled'
 */
export async function cancelTransaction(id: string, note?: string) {
    try {
        const user = await requireAdmin(); // fallback compatible
        await requirePermission('transactions', 'update');
        await enforceTenantScopeForRecord('transactions', id);
        const supabase = await createClient();

        if (!id || typeof id !== 'string') {
            return { success: false, error: 'ID giao dịch không hợp lệ' };
        }

        const { data: oldData } = await (supabase as any)
            .from('transactions').select('*').eq('id', id).single();

        if (!oldData) {
            return { success: false, error: 'Không tìm thấy giao dịch' };
        }

        const updateData: Record<string, any> = {
            status: 'cancelled',
        };
        if (note) updateData.note = note;

        const { error } = await (supabase as any)
            .from('transactions')
            .update(updateData)
            .eq('id', id);

        if (error) {
            console.error('Cancel transaction error:', error);
            return { success: false, error: 'Có lỗi khi hủy: ' + error.message };
        }

        await createAuditLog({
            user,
            action: 'reject',
            tableName: 'transactions',
            recordId: id,
            oldData: oldData ?? null,
            newData: updateData,
            tenantId: (oldData as any)?.tenant_id,
        });

        revalidatePath('/admin/transactions');
        revalidatePath('/admin/dashboard');

        const tenantId = (oldData as any)?.tenant_id;
        if (tenantId) {
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.projects.tenant(tenantId));
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.confirmed.tenant(tenantId));
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.recent.tenant(tenantId));
            // @ts-ignore
            revalidateTag(CACHE_TAGS.system.dashboardStats(tenantId));
        } else {
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.projects.all);
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.confirmed.all);
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.recent.all);
            // @ts-ignore
            revalidateTag(CACHE_TAGS.system.dashboardStatsGlobal);
        }
        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Cancel transaction error:', err);
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}

/**
 * Cập nhật trạng thái thanh toán (admin) — full control
 */
export async function updateTransactionStatus(id: string, formData: FormData) {
    try {
        const user = await requireAdmin(); // fallback compatible
        await requirePermission('transactions', 'update');
        await enforceTenantScopeForRecord('transactions', id);
        const supabase = await createClient();

        const statusValue = formData.get('status') as string;
        const raw = {
            status: statusValue,
            note: formData.get('note') as string || null,
            transaction_id: formData.get('transaction_id') as string || null,
            // Set completed_at khi chuyển sang confirmed
            completed_at: statusValue === 'confirmed' ? new Date().toISOString() : null,
        };

        const parsed = TransactionUpdateSchema.safeParse(raw);
        if (!parsed.success) {
            const issues = parsed.error.issues ?? [];
            return { success: false, error: issues[0]?.message ?? 'Dữ liệu không hợp lệ' };
        }

        const { data: oldData } = await (supabase as any)
            .from('transactions').select('*').eq('id', id).single();
        const { error } = await (supabase as any)
            .from('transactions').update(parsed.data).eq('id', id);

        if (error) {
            console.error('Update transaction error:', error);
            return { success: false, error: 'Có lỗi khi cập nhật: ' + error.message };
        }

        // Nếu admin trực tiếp đổi trạng thái thành Confirmed từ Pending (Full Update)
        if (statusValue === 'confirmed' && oldData?.status !== 'confirmed' && oldData?.project_id && oldData?.amount) {
            const { data: project } = await (supabase as any)
                .from('transaction_projects')
                .select('id, current_amount')
                .eq('id', oldData.project_id)
                .eq('tenant_id', oldData.tenant_id)
                .single();
        
            if (project) {
                const newAmount = (project.current_amount || 0) + oldData.amount;
                await (supabase as any)
                    .from('transaction_projects')
                    .update({ current_amount: newAmount })
                    .eq('id', project.id)
                    .eq('tenant_id', oldData.tenant_id);
            }
        }
        // Admin đổi Confirmed về trạng thái khác (Trừ tiền)
        else if (statusValue !== 'confirmed' && oldData?.status === 'confirmed' && oldData?.project_id && oldData?.amount) {
            const { data: project } = await (supabase as any)
                .from('transaction_projects')
                .select('id, current_amount')
                .eq('id', oldData.project_id)
                .eq('tenant_id', oldData.tenant_id)
                .single();
        
            if (project) {
                const newAmount = Math.max(0, (project.current_amount || 0) - oldData.amount);
                await (supabase as any)
                    .from('transaction_projects')
                    .update({ current_amount: newAmount })
                    .eq('id', project.id)
                    .eq('tenant_id', oldData.tenant_id);
            }
        }

        await createAuditLog({
            user,
            action: 'update',
            tableName: 'transactions',
            recordId: id,
            oldData: oldData ?? null,
            newData: parsed.data,
            tenantId: (oldData as any)?.tenant_id,
        });

        revalidatePath('/admin/transactions');
        revalidatePath('/admin/dashboard');

        const tenantId = (oldData as any)?.tenant_id;
        if (tenantId) {
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.projects.tenant(tenantId));
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.recent.tenant(tenantId));
            // @ts-ignore
            revalidateTag(CACHE_TAGS.system.dashboardStats(tenantId));
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.confirmed.tenant(tenantId));
        } else {
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.projects.all);
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.recent.all);
            // @ts-ignore
            revalidateTag(CACHE_TAGS.system.dashboardStatsGlobal);
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.confirmed.all);
        }
        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Update transaction error:', err);
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}

/**
 * Thu hồi thanh toán đã xác nhận — đưa về pending để xem xét lại
 */
export async function revokeTransaction(id: string) {
    try {
        const user = await requireAdmin(); // fallback compatible
        await requirePermission('transactions', 'update');
        await enforceTenantScopeForRecord('transactions', id);
        const supabase = await createClient();

        if (!id || typeof id !== 'string') {
            return { success: false, error: 'ID giao dịch không hợp lệ' };
        }

        const { data: oldData } = await (supabase as any)
            .from('transactions').select('*').eq('id', id).single();

        if (!oldData) {
            return { success: false, error: 'Không tìm thấy giao dịch' };
        }

        if (oldData.status !== 'confirmed') {
            return { success: false, error: 'Chỉ có thể thu hồi giao dịch đã xác nhận' };
        }

        const updateData = {
            status: 'pending',
            completed_at: null,
        };

        const { error } = await (supabase as any)
            .from('transactions')
            .update(updateData)
            .eq('id', id);

        if (error) {
            console.error('Revoke transaction error:', error);
            return { success: false, error: 'Có lỗi khi thu hồi: ' + error.message };
        }

        if (oldData?.project_id && oldData?.amount) {
            const { data: project } = await (supabase as any)
                .from('transaction_projects')
                .select('id, current_amount')
                .eq('id', oldData.project_id)
                .eq('tenant_id', oldData.tenant_id)
                .single();
        
            if (project) {
                const newAmount = Math.max(0, (project.current_amount || 0) - oldData.amount);
                await (supabase as any)
                    .from('transaction_projects')
                    .update({ current_amount: newAmount })
                    .eq('id', project.id)
                    .eq('tenant_id', oldData.tenant_id);
            }
        }

        await createAuditLog({
            user,
            action: 'update',
            tableName: 'transactions',
            recordId: id,
            oldData: oldData ?? null,
            newData: updateData,
            tenantId: (oldData as any)?.tenant_id,
        });

        revalidatePath('/admin/transactions');
        revalidatePath('/admin/dashboard');

        const tenantId = (oldData as any)?.tenant_id;
        if (tenantId) {
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.projects.tenant(tenantId));
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.recent.tenant(tenantId));
            // @ts-ignore
            revalidateTag(CACHE_TAGS.system.dashboardStats(tenantId));
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.confirmed.tenant(tenantId));
        } else {
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.projects.all);
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.recent.all);
            // @ts-ignore
            revalidateTag(CACHE_TAGS.system.dashboardStatsGlobal);
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.confirmed.all);
        }
        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Revoke transaction error:', err);
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}

/**
 * Xóa vĩnh viễn giao dịch thanh toán — chỉ super_admin hoặc admin
 */
export async function deleteTransaction(id: string) {
    try {
        const user = await requireAdmin(); // fallback compatible
        await requirePermission('transactions', 'delete');
        await enforceTenantScopeForRecord('transactions', id);
        const supabase = await createClient();

        if (!id || typeof id !== 'string') {
            return { success: false, error: 'ID giao dịch không hợp lệ' };
        }

        const { data: oldData } = await (supabase as any)
            .from('transactions').select('*').eq('id', id).single();

        if (!oldData) {
            return { success: false, error: 'Không tìm thấy giao dịch' };
        }

        const { error } = await (supabase as any)
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete transaction error:', error);
            return { success: false, error: 'Có lỗi khi xóa: ' + error.message };
        }

        await createAuditLog({
            user,
            action: 'delete',
            tableName: 'transactions',
            recordId: id,
            oldData: oldData ?? null,
            tenantId: (oldData as any)?.tenant_id,
        });

        revalidatePath('/admin/transactions');
        revalidatePath('/admin/dashboard');

        const tenantId = (oldData as any)?.tenant_id;
        if (tenantId) {
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.projects.tenant(tenantId));
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.recent.tenant(tenantId));
            // @ts-ignore
            revalidateTag(CACHE_TAGS.system.dashboardStats(tenantId));
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.confirmed.tenant(tenantId));
        } else {
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.projects.all);
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.recent.all);
            // @ts-ignore
            revalidateTag(CACHE_TAGS.transactions.confirmed.all);
        }
        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Delete transaction error:', err);
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}

