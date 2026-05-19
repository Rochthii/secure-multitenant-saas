'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdmin, requireEditor } from '@/lib/auth/require-admin';
import { requirePermission, enforceTenantScopeForRecord, getTenantScope } from '@/lib/permissions';
import { createAuditLog } from '@/lib/audit';
import { saveRevision } from './revisions';
import { EventSchema, formatZodError } from '@/lib/validations/admin';

import { revalidateTenantHomepage } from '@/lib/cache/revalidate';

import { CACHE_TAGS } from '@/lib/cache/tags';

async function revalidateEventsCache(tenantId?: string | null) {
    if (tenantId) {
        // Cực kỳ tiết kiệm CPU: Gọi hàm tiện ích xóa HTML gốc trang chủ + data tags 
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

export async function createEvent(formData: FormData) {
    try {
        const user = await requireEditor();
        await requirePermission('events', 'create');
        const supabase = await createClient();

        const raw = {
            title_vi: formData.get('title_vi') as string,
            title_en: formData.get('title_en') as string || null,
            title_km: formData.get('title_km') as string || null,
            slug: formData.get('slug') as string || null,
            description_vi: formData.get('description_vi') as string || null,
            description_en: formData.get('description_en') as string || null,
            description_km: formData.get('description_km') as string || null,
            excerpt_vi: formData.get('excerpt_vi') as string || null,
            excerpt_en: formData.get('excerpt_en') as string || null,
            excerpt_km: formData.get('excerpt_km') as string || null,
            start_date: formData.get('start_date') as string,
            end_date: formData.get('end_date') as string || null,
            start_time: formData.get('start_time') as string || null,
            end_time: formData.get('end_time') as string || null,
            location: formData.get('location') as string || null,
            thumbnail_url: formData.get('thumbnail_url') as string || null,
            status: (formData.get('status') as string) || 'upcoming',
            category: formData.get('category') as string || null,
            registration_required: formData.get('registration_required') === 'true',
            max_participants: formData.get('max_participants')
                ? parseInt(formData.get('max_participants') as string)
                : null,
            is_recurring: formData.get('is_recurring') === 'true',
            tenant_id: (() => {
                const tid = formData.get('tenant_id');
                if (!tid || tid === 'null' || tid === '') return null;
                return tid as string;
            })(),
            published_to: (() => {
                const val = formData.get('published_to');
                if (!val || val === 'null' || val === '') return null;
                try {
                    const parsed = JSON.parse(val as string);
                    return Array.isArray(parsed) ? parsed.filter((id) => id && id !== 'null' && id !== '') : null;
                } catch { return null; }
            })(),
        };

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
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Create event error:', err);
        return { success: false, error: 'Có lỗi hệ thống xảy ra' };
    }
}

export async function updateEvent(id: string, formData: FormData) {
    try {
        const user = await requireEditor();
        await requirePermission('events', 'update');
        await enforceTenantScopeForRecord('events', id);
        const supabase = await createClient();

        const raw = {
            title_vi: formData.get('title_vi') as string,
            title_en: formData.get('title_en') as string || null,
            title_km: formData.get('title_km') as string || null,
            slug: formData.get('slug') as string || null,
            description_vi: formData.get('description_vi') as string || null,
            description_en: formData.get('description_en') as string || null,
            description_km: formData.get('description_km') as string || null,
            excerpt_vi: formData.get('excerpt_vi') as string || null,
            excerpt_en: formData.get('excerpt_en') as string || null,
            excerpt_km: formData.get('excerpt_km') as string || null,
            start_date: formData.get('start_date') as string,
            end_date: formData.get('end_date') as string || null,
            start_time: formData.get('start_time') as string || null,
            end_time: formData.get('end_time') as string || null,
            location: formData.get('location') as string || null,
            thumbnail_url: formData.get('thumbnail_url') as string || null,
            status: (formData.get('status') as string) || 'upcoming',
            category: formData.get('category') as string || null,
            registration_required: formData.get('registration_required') === 'true',
            max_participants: formData.get('max_participants')
                ? parseInt(formData.get('max_participants') as string)
                : null,
            is_recurring: formData.get('is_recurring') === 'true',
            tenant_id: (!formData.get('tenant_id') || formData.get('tenant_id') === 'null' || formData.get('tenant_id') === '') ? null : formData.get('tenant_id') as string,
            published_to: (() => {
                const val = formData.get('published_to');
                if (!val || val === 'null' || val === '') return null;
                try {
                    const parsed = JSON.parse(val as string);
                    return Array.isArray(parsed) ? parsed.filter((id) => id && id !== 'null' && id !== '') : null;
                } catch { return null; }
            })(),
        };

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
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Update event error:', err);
        return { success: false, error: 'Có lỗi hệ thống xảy ra' };
    }
}

export async function deleteEvent(id: string) {
    try {
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
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Delete event error:', err);
        if (err.code === '23503') return { success: false, error: 'Sự kiện này đang có dữ liệu liên kết, không thể xóa' };
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}

export async function approveEvent(id: string, note?: string) {
    try {
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
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}

export async function rejectEvent(id: string, note: string) {
    try {
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
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}

export async function submitEventForReview(id: string) {
    try {
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
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}
