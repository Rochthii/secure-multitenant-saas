'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdmin, requireEditor } from '@/lib/auth/require-admin';
import { requirePermission, getUserContext, enforceTenantScopeForRecord, getTenantScope } from '@/lib/permissions';
import { createAuditLog } from '@/lib/audit';
import { updateItemTags } from './tags';
import { z } from 'zod';
import { generateSlug } from '@/lib/utils';
import { DharmaTalkSchema, BatchOrderSchema, formatZodError, DharmaTalkInput } from '@/lib/validations/admin';

import { CACHE_TAGS } from '@/lib/cache/tags';

function revalidateDharmaCache(tenantId?: string | null) {
    if (tenantId) {
        // @ts-ignore
        revalidateTag(CACHE_TAGS.dharmaTalks.list(tenantId));
        // @ts-ignore
        revalidateTag(CACHE_TAGS.system.dashboardStats(tenantId));
        // @ts-ignore
        revalidateTag('dharma-talks');
    } else {
        // @ts-ignore
        revalidateTag(CACHE_TAGS.dharmaTalks.all);
        // @ts-ignore
        revalidateTag('dharma-talks');
        // @ts-ignore
        revalidateTag(CACHE_TAGS.system.dashboardStatsGlobal);
    }
}

// ─── YouTube helpers ──────────────────────────────────────────────────────────

function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

/**
 * Lấy thông tin video YouTube qua oEmbed API (không cần API key)
 */
export async function fetchYouTubeInfo(url: string): Promise<{
    title: string;
    thumbnail_url: string;
    author_name: string;
    videoId: string | null;
} | null> {
    const videoId = extractYouTubeId(url);
    if (!videoId) return null;

    try {
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const res = await fetch(oembedUrl, { next: { revalidate: 3600 } });
        if (!res.ok) throw new Error('oEmbed failed');
        const data = await res.json();
        return {
            title: data.title || '',
            thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            author_name: data.author_name || '',
            videoId,
        };
    } catch {
        return {
            title: '',
            thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            author_name: '',
            videoId,
        };
    }
}

/**
 * Lấy danh sách tất cả dharma talks (admin page — không cache)
 * FIXED: thêm requireEditor() để ngăn unauthenticated read
 */
export async function getDharmaTalksAdmin(tenantId?: string) {
    await requireEditor();
    const supabase = await createClient();

    let query = (supabase as any)
        .from('dharma_talks')
        .select('*');

    if (tenantId) {
        // Bao gồm bài viết của chính chi nhánh này HOẶC bài từ chi nhánh khác được broadcast tới
        query = query.or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`);
    }

    const { data, error } = await query
        .order('order_position', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('getDharmaTalksAdmin error:', error);
        return [];
    }
    return data || [];
}

/**
 * Tạo dharma talk mới
 * FIXED: requireEditor() thay vì requireAdmin() — editor có thể thêm nội dung
 */
export async function createDharmaTalk(input: DharmaTalkInput, tagIds?: string[]) {
    try {
        const user = await requireEditor();
        await requirePermission('dharma-talks', 'create');
        const supabase = await createClient();
        const context = await getUserContext();

        // FIXED: Runtime validation thay vì chỉ TypeScript type check
        const parsed = DharmaTalkSchema.safeParse(input);
        if (!parsed.success) {
            return { success: false, error: formatZodError(parsed.error) };
        }

        const videoId = extractYouTubeId(parsed.data.media_url);
        const thumbnail = parsed.data.thumbnail_url ||
            (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null);

        // Tự động gán tenant_id: Ưu tiên input > Category > User Role
        let finalTenantId = parsed.data.tenant_id;

        if (context && !['super_admin', 'company_editor'].includes(context.role) && context.tenantId) {
            finalTenantId = context.tenantId;
        }
        const payload = {
            title_vi: parsed.data.title_vi,
            title_km: parsed.data.title_km || null,
            title_en: parsed.data.title_en || null,
            description_vi: parsed.data.description_vi || null,
            media_type: 'video',
            media_url: parsed.data.media_url,
            thumbnail_url: thumbnail,
            speaker_name_vi: parsed.data.speaker_name_vi || 'Multi-tenant Ecosystem',
            speaker_name_km: null,
            topic_vi: parsed.data.topic_vi || null,
            duration_minutes: parsed.data.duration_minutes || null,
            is_active: parsed.data.is_active ?? true,
            is_featured: parsed.data.is_featured ?? true,
            order_position: parsed.data.order_position ?? 99,
            category_id: (!parsed.data.category_id || parsed.data.category_id === '') ? null : parsed.data.category_id,
            view_count: 0,
            slug: parsed.data.slug || generateSlug(parsed.data.title_vi),
            tenant_id: finalTenantId || null,
            published_to: parsed.data.published_to || null,
        };
        const { data, error } = await (supabase as any)
            .from('dharma_talks')
            .insert(payload)
            .select('id')
            .single();

        if (error) {
            console.error('createDharmaTalk error:', error);
            return { success: false, error: error.message };
        }

        await createAuditLog({
            user,
            action: 'create',
            tableName: 'dharma_talks',
            recordId: (data as any).id,
            newData: payload,
            tenantId: payload.tenant_id,
        });

        revalidatePath('/admin/dharma-talks');
        revalidateDharmaCache(parsed.data.tenant_id);

        // --- TAGS INTEGRATION ---
        if (tagIds && tagIds.length > 0) {
            await updateItemTags('dharma_talk_tags', data.id, tagIds, parsed.data.tenant_id || undefined);
        }
        // -----------------------

        return { success: true, id: data.id };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('createDharmaTalk error:', err);
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}

/**
 * Cập nhật dharma talk
 * FIXED: requireEditor() + fetch oldData cho audit log
 */
export async function updateDharmaTalk(id: string, input: Partial<DharmaTalkInput>, tagIds?: string[]) {
    try {
        const user = await requireEditor();
        await requirePermission('dharma-talks', 'update');
        await enforceTenantScopeForRecord('dharma_talks', id);
        const supabase = await createClient();

        // Validate các field được truyền vào
        const parsed = DharmaTalkSchema.partial().safeParse(input);
        if (!parsed.success) {
            return { success: false, error: formatZodError(parsed.error) };
        }

        // FIXED: Fetch oldData trước khi update để audit log đầy đủ
        const { data: oldData } = await (supabase as any)
            .from('dharma_talks').select('*').eq('id', id).single();

        if (!oldData) {
            return { success: false, error: 'Không tìm thấy bài giảng' };
        }

        // CHẶN: Admin chi nhánh không được sửa bài của Admin Tổng hoặc bài được broadcast tới
        const rootId = '55555555-5555-5555-5555-555555555555';
        const scope = await getTenantScope();
        const isGlobalPost = !oldData.tenant_id || oldData.tenant_id === rootId;
        
        if (scope && isGlobalPost) {
            return { success: false, error: 'Bạn không có quyền chỉnh sửa bài giảng của hệ thống. Vui lòng liên hệ Admin Tổng.' };
        }

        // Nếu URL thay đổi, tự động cập nhật thumbnail
        let thumbnail = parsed.data.thumbnail_url;
        if (parsed.data.media_url && !parsed.data.thumbnail_url) {
            const videoId = extractYouTubeId(parsed.data.media_url);
            if (videoId) thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }

        const payload: any = { ...parsed.data };
        if (thumbnail !== undefined) payload.thumbnail_url = thumbnail;
        if (payload.category_id === '') payload.category_id = null;
        if (payload.tenant_id === '') payload.tenant_id = null;

        // Tự động gán tenant_id từ danh mục nếu chưa có (Admin tổng sửa bài)
        if (!payload.tenant_id && payload.category_id) {
            const { data: catData } = await (supabase as any).from('categories').select('tenant_id').eq('id', payload.category_id).single();
            if (catData?.tenant_id) {
                payload.tenant_id = catData.tenant_id;
            }
        }
        // ensure published_to is handled correctly
        if (payload.published_to !== undefined && payload.published_to?.length === 0) payload.published_to = null;

        // Xóa các trường không có trong schema cache DB
        delete payload.approval_status;

        const { error } = await (supabase as any)
            .from('dharma_talks')
            .update(payload)
            .eq('id', id);

        if (error) {
            console.error('updateDharmaTalk error:', error);
            return { success: false, error: error.message };
        }

        await createAuditLog({
            user,
            action: 'update',
            tableName: 'dharma_talks',
            recordId: id,
            oldData: oldData ?? null,
            newData: payload,
            tenantId: payload.tenant_id || (oldData as any).tenant_id,
        });

        revalidatePath('/admin/dharma-talks');
        revalidatePath(`/admin/dharma-talks/${id}`);
        revalidateDharmaCache(payload.tenant_id || oldData?.tenant_id);

        // --- TAGS INTEGRATION ---
        if (tagIds) {
            await updateItemTags('dharma_talk_tags', id, tagIds, (payload.tenant_id || oldData?.tenant_id) || undefined);
        }
        // -----------------------

        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}

/**
 * Xóa dharma talk — giữ requireAdmin()
 */
export async function deleteDharmaTalk(id: string) {
    try {
        const user = await requireAdmin();
        await requirePermission('dharma-talks', 'delete');
        await enforceTenantScopeForRecord('dharma_talks', id);
        const supabase = await createClient();

        const { data: oldData } = await (supabase as any).from('dharma_talks').select('*').eq('id', id).single();
        
        if (!oldData) {
            return { success: false, error: 'Không tìm thấy bài giảng hoặc bạn không có quyền xóa.' };
        }

        const scope = await getTenantScope();
        const rootId = '55555555-5555-5555-5555-555555555555';
        const isOwner = !scope || oldData.tenant_id === scope;
        const isBroadcastedToMe = scope && oldData.published_to?.includes(scope);

        if (!isOwner && isBroadcastedToMe) {
            // LOGIC "XÓA ẢO": Chỉ gỡ tên chi nhánh khỏi danh sách nhận tin
            const newPublishedTo = (oldData.published_to || []).filter((tid: string) => tid !== scope);
            const { error: updateError } = await (supabase as any)
                .from('dharma_talks')
                .update({ published_to: newPublishedTo.length > 0 ? newPublishedTo : null })
                .eq('id', id);

            if (updateError) return { success: false, error: 'Lỗi khi gỡ bài giảng hệ thống: ' + updateError.message };

            await createAuditLog({
                user, action: 'update', tableName: 'dharma_talks',
                recordId: id, oldData, newData: { published_to: newPublishedTo },
                tenantId: scope,
            });

            revalidatePath('/admin/dharma-talks');
            revalidateDharmaCache(scope);
            return { success: true, message: 'Đã gỡ bài giảng hệ thống khỏi danh sách của bạn.' };
        }

        const { error } = await (supabase as any).from('dharma_talks').delete().eq('id', id);

        if (error) {
            console.error('deleteDharmaTalk error:', error);
            return { success: false, error: error.message };
        }

        await createAuditLog({
            user,
            action: 'delete',
            tableName: 'dharma_talks',
            recordId: id,
            oldData: oldData ?? null,
            tenantId: oldData?.tenant_id || scope,
        });

        revalidatePath('/admin/dharma-talks');
        revalidateDharmaCache(oldData?.tenant_id);

        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        if (err.code === '23503') return { success: false, error: 'Bài giảng này đang được tham chiếu, không thể xóa' };
        return { success: false, error: err.message || 'Có lỗi xảy ra' };
    }
}

/**
 * Cập nhật thứ tự (order_position) hàng loạt
 * FIXED: requireEditor() thay vì requireAdmin()
 */
export async function reorderDharmaTalks(items: { id: string; order_position: number }[]) {
    try {
        const user = await requireEditor();
        await requirePermission('dharma-talks', 'update');
        const supabase = await createClient();

        const parsed = BatchOrderSchema.safeParse(items);
        if (!parsed.success) {
            return { success: false, error: formatZodError(parsed.error) };
        }

        const { error } = await (supabase as any)
            .from('dharma_talks')
            .upsert(parsed.data.map(i => ({ id: i.id, order_position: i.order_position })), { onConflict: 'id' });

        if (error) throw error;

        // Fetch tenant_id of first item for revalidation and audit log
        let batchTenantId = null;
        if (items.length > 0) {
            const { data } = await (supabase as any).from('dharma_talks').select('tenant_id').eq('id', items[0].id).single();
            batchTenantId = data?.tenant_id;
        }

        await createAuditLog({
            user,
            action: 'update',
            tableName: 'dharma_talks',
            recordId: 'batch_reorder',
            newData: { reordered_count: items.length, items },
            tenantId: batchTenantId,
        });

        revalidatePath('/admin/dharma-talks');
        revalidateDharmaCache(batchTenantId);

        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Reorder dharma talks error:', err);
        return { success: false, error: 'Có lỗi khi sắp xếp bài giảng: ' + err.message };
    }
}

export async function submitDharmaTalkForReview(id: string) {
    try {
        const user = await requireEditor();
        await requirePermission('dharma-talks', 'update');
        await enforceTenantScopeForRecord('dharma_talks', id);
        const supabase = await createClient();
        const { error } = await (supabase as any)
            .from('dharma_talks')
            .update({ approval_status: 'pending_review' })
            .eq('id', id);

        if (error) return { success: false, error: 'Có lỗi khi gửi duyệt' };
        revalidatePath('/admin/dharma-talks');
        const { data: oldData } = await (supabase as any).from('dharma_talks').select('tenant_id').eq('id', id).single();
        revalidateDharmaCache(oldData?.tenant_id);
        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}

export async function approveDharmaTalk(id: string, note?: string) {
    try {
        const user = await requireAdmin();
        await requirePermission('dharma-talks', 'update');
        await enforceTenantScopeForRecord('dharma_talks', id);
        const supabase = await createClient();
        const { data: oldData } = await (supabase as any).from('dharma_talks').select('*').eq('id', id).single();
        const { error } = await (supabase as any).from('dharma_talks').update({ approval_status: 'published' }).eq('id', id);

        if (error) return { success: false, error: 'Có lỗi khi duyệt bài: ' + error.message };

        await createAuditLog({
            user,
            action: 'approve',
            tableName: 'dharma_talks',
            recordId: id,
            oldData,
            newData: { approval_status: 'published', note },
            tenantId: oldData?.tenant_id,
        });

        revalidatePath('/admin/dharma-talks');
        revalidatePath(`/admin/dharma-talks/${id}`);
        revalidateDharmaCache(oldData?.tenant_id);
        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}

export async function rejectDharmaTalk(id: string, note: string) {
    try {
        const user = await requireAdmin();
        await requirePermission('dharma-talks', 'update');
        await enforceTenantScopeForRecord('dharma_talks', id);
        const supabase = await createClient();
        const { data: oldData } = await (supabase as any).from('dharma_talks').select('*').eq('id', id).single();
        const { error } = await (supabase as any).from('dharma_talks').update({ approval_status: 'rejected' }).eq('id', id);

        if (error) return { success: false, error: 'Có lỗi khi từ chối bài: ' + error.message };

        await createAuditLog({
            user,
            action: 'reject',
            tableName: 'dharma_talks',
            recordId: id,
            oldData,
            newData: { approval_status: 'rejected', note },
            tenantId: oldData?.tenant_id,
        });

        revalidatePath('/admin/dharma-talks');
        revalidateDharmaCache(oldData?.tenant_id);
        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}
