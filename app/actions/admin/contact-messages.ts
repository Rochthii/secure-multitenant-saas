'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin, requireEditor } from '@/lib/auth/require-admin';
import { createAuditLog } from '@/lib/audit';

export async function getContactMessages(tenantId: string, filter?: 'unread' | 'read' | 'replied') {
    // 1. Check permission
    await requireEditor();

    // 2. Use Admin Client to bypass RLS
    const supabase = await createClient();

    let query = supabase
        .from('contact_messages')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

    if (filter) {
        query = query.eq('status', filter);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Get contact messages error:', error);
        return [];
    }

    return data;
}

export async function getContactMessage(tenantId: string, id: string) {
    await requireEditor();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single();

    if (error) {
        console.error('Get contact message error:', error);
        return null;
    }

    return data;
}

export async function updateMessageStatus(tenantId: string, id: string, status: 'unread' | 'read' | 'replied') {
    try {
        const user = await requireEditor();
        const supabase = await createClient();

        // FIXED: Runtime validate status — TypeScript type không đủ với server actions
        const VALID_STATUSES = ['unread', 'read', 'replied'] as const;
        if (!VALID_STATUSES.includes(status as any)) {
            return { success: false, error: `Trạng thái không hợp lệ: "${status}"` };
        }

        const updateData: any = { status };

        if (status === 'replied') {
            updateData.replied_at = new Date().toISOString();
            updateData.replied_by = user.id;
        }

        // @ts-ignore
        const { error } = await (supabase as any)
            .from('contact_messages')
            .update(updateData)
            .eq('id', id)
            .eq('tenant_id', tenantId);

        if (error) throw error;

        await createAuditLog({
            user,
            action: 'update',
            tableName: 'contact_messages',
            recordId: id,
            newData: { status },
        });

        revalidatePath(`/admin/t/${tenantId}/messages`);
        revalidatePath(`/admin/t/${tenantId}/messages/${id}`);

        return { success: true };
    } catch (error: any) {
        console.error('Update message status error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteContactMessage(tenantId: string, id: string) {
    try {
        const user = await requireAdmin();
        const supabase = await createClient();

        const { error } = await supabase
            .from('contact_messages')
            .delete()
            .eq('id', id)
            .eq('tenant_id', tenantId);

        if (error) throw error;

        await createAuditLog({
            user,
            action: 'delete',
            tableName: 'contact_messages',
            recordId: id,
        });

        revalidatePath(`/admin/t/${tenantId}/messages`);

        return { success: true };
    } catch (error: any) {
        console.error('Delete message error:', error);
        if (error.code === '23503') return { success: false, error: 'Tin nhắn này đang có dữ liệu liên quan, không thể xóa' };
        return { success: false, error: error.message };
    }
}
