'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdmin, requireEditor } from '@/lib/auth/require-admin';
import { requirePermission, enforceTenantScopeForRecord, getTenantScope } from '@/lib/permissions';
import { createAuditLog } from '@/lib/audit';
import { saveRevision } from './revisions';
import { EventSchema, formatZodError } from '@/lib/validations/admin';
import { parseEventFormData } from '@/lib/utils/event-parser';
import { executeSafeAction } from '@/lib/utils/action-handler';
import { revalidateTenantHomepage } from '@/lib/cache/revalidate';
import { CACHE_TAGS } from '@/lib/cache/tags';

async function revalidateEventsCache(tenantId?: string | null) {
    if (tenantId) {
        await revalidateTenantHomepage(tenantId, [CACHE_TAGS.events.tenant(tenantId), CACHE_TAGS.system.dashboardStats(tenantId)]);
        // @ts-ignore
        revalidateTag('events');
    } else {
        // @ts-ignore
        revalidateTag(CACHE_TAGS.events.all);
        // @ts-ignore
        revalidateTag('events');
        // @ts-ignore
        revalidateTag(CACHE_TAGS.system.dashboardStatsGlobal);
    }
}

function buildSlug(title: string): string {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

export const createEvent = executeSafeAction(async (formData: FormData) => {
    const user = await requireEditor();
    await requirePermission('events', 'create');
    const supabase = await createClient();

    const raw = parseEventFormData(formData);
    const parsed = EventSchema.safeParse(raw);
    if (!parsed.success) {
        return { success: false, error: formatZodError(parsed.error) };
    }

    // Tự động gán tenant_id: Ưu tiên scope của user
    const scope = await getTenantScope();
    let finalTenantId = parsed.data.tenant_id;

    if (scope) {
        finalTenantId = scope; // Force local admin to only create in their own tenant
    }

    const eventData = {
        ...parsed.data,
        slug: parsed.data.slug || buildSlug(parsed.data.title_vi),
        tenant_id: finalTenantId || null,
    };

    // @ts-ignore - Supabase type inference issue
    const { data, error } = await (supabase as any).from('events').insert(eventData).select('id').single();

    if (error) {
        console.error('Create event error:', error);
        if (error.code === '23505') return { success: false, error: 'Đường dẫn (slug) này đã tồn tại.' };
        return { success: false, error: 'Có lỗi khi tạo sự kiện: ' + error.message };
    }

    await createAuditLog({
        user,
        action: 'create',
        tableName: 'events',
        recordId: data.id,
        newData: eventData,
        tenantId: eventData.tenant_id,
    });

    revalidatePath('/admin/events');
    revalidateEventsCache(eventData.tenant_id);
    return { success: true, id: data.id };
});

export const updateEvent = executeSafeAction(async (id: string, formData: FormData) => {
    const user = await requireEditor();
    await requirePermission('events', 'update');
    await enforceTenantScopeForRecord('events', id);
    const supabase = await createClient();

    const raw = parseEventFormData(formData);
    const parsed = EventSchema.safeParse(raw);
    if (!parsed.success) {
        return { success: false, error: formatZodError(parsed.error) };
    }

    // Security: Prevent local admin from transferring event to another tenant
    const scope = await getTenantScope();
    if (scope && parsed.data.tenant_id !== scope) {
        parsed.data.tenant_id = scope;
    }

    const { data: oldData } = await supabase.from('events').select('*').eq('id', id).single();

    if (!oldData) {
        return { success: false, error: 'Không tìm thấy sự kiện' };
    }

    // CHẶN: Admin chi nhánh không được sửa bài của Admin Tổng hoặc bài được broadcast tới
    const rootId = '55555555-5555-5555-5555-555555555555';
    const isGlobalPost = !oldData.tenant_id || oldData.tenant_id === rootId;
    
    if (scope && isGlobalPost) {
        return { success: false, error: 'Bạn không có quyền chỉnh sửa sự kiện của hệ thống. Vui lòng liên hệ Admin Tổng.' };
    }

    const eventData = { ...parsed.data, updated_at: new Date().toISOString() };
    // @ts-ignore - Supabase type inference issue
    const { error } = await (supabase as any).from('events').update(eventData).eq('id', id);

    if (error) {
        console.error('Update event error:', error);
        if (error.code === '23505') return { success: false, error: 'Đường dẫn (slug) này đã bị trùng.' };
        return { success: false, error: 'Có lỗi khi cập nhật sự kiện: ' + error.message };
    }

    await createAuditLog({
        user,
        action: 'update',
        tableName: 'events',
        recordId: id,
        oldData: oldData ?? null,
        newData: eventData,
        tenantId: eventData.tenant_id || (oldData as any)?.tenant_id,
    });

    // Ghi lại phiên bản nội dung
    if (oldData) {
        await saveRevision({
            tableName: 'events',
            recordId: id,
            changedBy: user.id,
            oldData,
            newData: eventData,
            changeSummary: `Cập nhật sự kiện: ${eventData.title_vi}`
        });
    }

    revalidatePath('/admin/events');
    revalidatePath(`/admin/events/${id}`);
    revalidateEventsCache(eventData.tenant_id || (oldData as any)?.tenant_id);
    return { success: true };
});

export const deleteEvent = executeSafeAction(async (id: string) => {
    const user = await requireAdmin(); // fallback compatible
    await requirePermission('events', 'delete');
    await enforceTenantScopeForRecord('events', id);
    const supabase = await createClient();

    // Fetch sự kiện và kiểm tra quyền sở hữu
    let fetchQuery = (supabase as any).from('events').select('*').eq('id', id);
    const { data: oldData } = await fetchQuery.single();

    if (!oldData) {
        return { success: false, error: 'Không tìm thấy sự kiện hoặc bạn không có quyền xóa.' };
    }

    const scope = await getTenantScope();
    const rootId = '55555555-5555-5555-5555-555555555555';
    const isOwner = !scope || oldData.tenant_id === scope;
    const isBroadcastedToMe = scope && oldData.published_to?.includes(scope);

    if (!isOwner && isBroadcastedToMe) {
        // LOGIC "XÓA ẢO": Chỉ gỡ tên chi nhánh khỏi danh sách nhận tin
        const newPublishedTo = (oldData.published_to || []).filter((tid: string) => tid !== scope);
        const { error: updateError } = await (supabase as any)
            .from('events')
            .update({ published_to: newPublishedTo.length > 0 ? newPublishedTo : null })
            .eq('id', id);

        if (updateError) return { success: false, error: 'Lỗi khi gỡ sự kiện hệ thống: ' + updateError.message };

        await createAuditLog({
            user, action: 'update', tableName: 'events',
            recordId: id, oldData, newData: { published_to: newPublishedTo },
            tenantId: scope,
        });

        revalidatePath('/admin/events');
        revalidateEventsCache(scope);
        return { success: true, message: 'Đã gỡ sự kiện hệ thống khỏi danh sách của bạn.' };
    }

    // Xóa (an toàn vì đã có enforceTenantScopeForRecord chặn trước)
    let deleteQuery = (supabase as any).from('events').delete().eq('id', id);
    const { error } = await deleteQuery;

    if (error) {
        console.error('Delete event error:', error);
        return { success: false, error: 'Có lỗi khi xóa sự kiện: ' + error.message };
    }

    revalidatePath('/admin/events');
    revalidateEventsCache((oldData as any)?.tenant_id);
    return { success: true };
});

export const approveEvent = executeSafeAction(async (id: string, note?: string) => {
    const user = await requireAdmin();
    await requirePermission('events', 'update');
    await enforceTenantScopeForRecord('events', id);
    const supabase = await createClient();

    const { data: oldData } = await supabase.from('events').select('*').eq('id', id).single();
    const { error } = await supabase.from('events').update({ approval_status: 'approved' }).eq('id', id);

    if (error) {
        return { success: false, error: 'Có lỗi khi duyệt sự kiện: ' + error.message };
    }

    await createAuditLog({
        user,
        action: 'approve',
        tableName: 'events',
        recordId: id,
        oldData,
        newData: { approval_status: 'approved', note },
        tenantId: (oldData as any)?.tenant_id,
    });

    revalidatePath('/admin/events');
    revalidateEventsCache((oldData as any)?.tenant_id);
    return { success: true };
});

export const rejectEvent = executeSafeAction(async (id: string, note: string) => {
    const user = await requireAdmin();
    await requirePermission('events', 'update');
    await enforceTenantScopeForRecord('events', id);
    const supabase = await createClient();

    const { data: oldData } = await supabase.from('events').select('*').eq('id', id).single();
    const { error } = await supabase.from('events').update({ approval_status: 'rejected' }).eq('id', id);

    if (error) {
        return { success: false, error: 'Có lỗi khi từ chối sự kiện: ' + error.message };
    }

    await createAuditLog({
        user,
        action: 'reject',
        tableName: 'events',
        recordId: id,
        oldData,
        newData: { approval_status: 'rejected', note },
        tenantId: (oldData as any)?.tenant_id,
    });

    revalidatePath('/admin/events');
    revalidateEventsCache((oldData as any)?.tenant_id);
    return { success: true };
});

export const submitEventForReview = executeSafeAction(async (id: string) => {
    const user = await requireEditor();
    await requirePermission('events', 'update');
    await enforceTenantScopeForRecord('events', id);
    const supabase = await createClient();

    const { data: oldData } = await supabase.from('events').select('*').eq('id', id).single();
    const { error } = await supabase.from('events').update({ approval_status: 'pending' }).eq('id', id);

    if (error) {
        return { success: false, error: 'Có lỗi khi gửi duyệt sự kiện: ' + error.message };
    }

    await createAuditLog({
        user,
        action: 'submit_review',
        tableName: 'events',
        recordId: id,
        oldData,
        newData: { approval_status: 'pending' },
        tenantId: (oldData as any)?.tenant_id,
    });

    revalidatePath('/admin/events');
    revalidateEventsCache((oldData as any)?.tenant_id);
    return { success: true };
});
