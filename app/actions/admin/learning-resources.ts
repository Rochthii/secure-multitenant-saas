'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdmin, requireEditor } from '@/lib/auth/require-admin';
import { requirePermission, getUserContext, enforceTenantScopeForRecord, getTenantScope } from '@/lib/permissions';
import { createAuditLog } from '@/lib/audit';
import { updateItemTags } from './tags';
import { z } from 'zod';
import { generateSlug } from '@/lib/utils';
import { LearningResourceSchema, BatchOrderSchema, formatZodError, LearningResourceInput } from '@/lib/validations/admin';
import { executeSafeAction } from '@/lib/utils/action-handler';

import { CACHE_TAGS } from '@/lib/cache/tags';

function revalidateLearningCache(tenantId?: string | null) {
    if (tenantId) {
        // @ts-ignore
        revalidateTag(CACHE_TAGS.learningResources.list(tenantId));
        // @ts-ignore
        revalidateTag(CACHE_TAGS.system.dashboardStats(tenantId));
        // @ts-ignore
        revalidateTag('learning-resources');
    } else {
        // @ts-ignore
        revalidateTag(CACHE_TAGS.learningResources.all);
        // @ts-ignore
        revalidateTag('learning-resources');
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
 * Lấy danh sách tất cả tài liệu học tập / SOP (admin page — không cache)
 */
export async function getLearningResourcesAdmin(tenantId?: string) {
    await requireEditor();
    const supabase = await createClient();

    let query = (supabase as any)
        .from('learning_resources')
        .select('*');

    if (tenantId) {
        // Bao gồm tài liệu của chính chi nhánh này HOẶC tài liệu được broadcast tới
        query = query.or(`tenant_id.eq.${tenantId},published_to.cs.{${tenantId}}`);
    }

    const { data, error } = await query
        .order('order_position', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('getLearningResourcesAdmin error:', error);
        return [];
    }
    return data || [];
}

/**
 * Tạo tài liệu học tập mới
 */
export const createLearningResource = executeSafeAction(async (input: LearningResourceInput, tagIds?: string[]) => {
    const user = await requireEditor();
    await requirePermission('dharma-talks', 'create'); // Dùng chung permission key để tránh sửa DB permission table
    const supabase = await createClient();
    const context = await getUserContext();

    const parsed = LearningResourceSchema.safeParse(input);
    if (!parsed.success) {
        return { success: false, error: formatZodError(parsed.error) };
    }

    const videoId = extractYouTubeId(parsed.data.media_url);
    const thumbnail = parsed.data.thumbnail_url ||
        (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null);

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
        instructor_name_vi: parsed.data.instructor_name_vi || 'Multi-tenant Ecosystem',
        instructor_name_km: null,
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
        .from('learning_resources')
        .insert(payload)
        .select('id')
        .single();

    if (error) {
        console.error('createLearningResource error:', error);
        return { success: false, error: error.message };
    }

    await createAuditLog({
        user,
        action: 'create',
        tableName: 'learning_resources',
        recordId: (data as any).id,
        newData: payload,
        tenantId: payload.tenant_id,
    });

    revalidatePath('/admin/documents');
    revalidateLearningCache(parsed.data.tenant_id);

    if (tagIds && tagIds.length > 0) {
        await updateItemTags('learning_resource_tags', data.id, tagIds, parsed.data.tenant_id || undefined);
    }

    return { success: true, id: data.id };
});

/**
 * Cập nhật tài liệu học tập
 */
export const updateLearningResource = executeSafeAction(async (id: string, input: Partial<LearningResourceInput>, tagIds?: string[]) => {
    const user = await requireEditor();
    await requirePermission('dharma-talks', 'update');
    await enforceTenantScopeForRecord('learning_resources', id);
    const supabase = await createClient();

    const parsed = LearningResourceSchema.partial().safeParse(input);
    if (!parsed.success) {
        return { success: false, error: formatZodError(parsed.error) };
    }

    const { data: oldData } = await (supabase as any)
        .from('learning_resources').select('*').eq('id', id).single();

    if (!oldData) {
        return { success: false, error: 'Không tìm thấy tài liệu hướng dẫn' };
    }

    const rootId = '55555555-5555-5555-5555-555555555555';
    const scope = await getTenantScope();
    const isGlobalPost = !oldData.tenant_id || oldData.tenant_id === rootId;
    
    if (scope && isGlobalPost) {
        return { success: false, error: 'Bạn không có quyền chỉnh sửa tài liệu của hệ thống. Vui lòng liên hệ Admin Tổng.' };
    }

    let thumbnail = parsed.data.thumbnail_url;
    if (parsed.data.media_url && !parsed.data.thumbnail_url) {
        const videoId = extractYouTubeId(parsed.data.media_url);
        if (videoId) thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }

    const payload: any = { ...parsed.data };
    if (thumbnail !== undefined) payload.thumbnail_url = thumbnail;
    if (payload.category_id === '') payload.category_id = null;
    if (payload.tenant_id === '') payload.tenant_id = null;

    if (!payload.tenant_id && payload.category_id) {
        const { data: catData } = await (supabase as any).from('categories').select('tenant_id').eq('id', payload.category_id).single();
        if (catData?.tenant_id) {
            payload.tenant_id = catData.tenant_id;
        }
    }
    if (payload.published_to !== undefined && payload.published_to?.length === 0) payload.published_to = null;

    delete payload.approval_status;

    const { error } = await (supabase as any)
        .from('learning_resources')
        .update(payload)
        .eq('id', id);

    if (error) {
        console.error('updateLearningResource error:', error);
        return { success: false, error: error.message };
    }

    await createAuditLog({
        user,
        action: 'update',
        tableName: 'learning_resources',
        recordId: id,
        oldData: oldData ?? null,
        newData: payload,
        tenantId: payload.tenant_id || (oldData as any).tenant_id,
    });

    revalidatePath('/admin/documents');
    revalidatePath(`/admin/documents/${id}`);
    revalidateLearningCache(payload.tenant_id || oldData?.tenant_id);

    if (tagIds) {
        await updateItemTags('learning_resource_tags', id, tagIds, (payload.tenant_id || oldData?.tenant_id) || undefined);
    }

    return { success: true };
});

/**
 * Xóa tài liệu học tập
 */
export const deleteLearningResource = executeSafeAction(async (id: string) => {
    const user = await requireAdmin();
    await requirePermission('dharma-talks', 'delete');
    await enforceTenantScopeForRecord('learning_resources', id);
    const supabase = await createClient();

    const { data: oldData } = await (supabase as any).from('learning_resources').select('*').eq('id', id).single();
    
    if (!oldData) {
        return { success: false, error: 'Không tìm thấy tài liệu học tập hoặc bạn không có quyền xóa.' };
    }

    const scope = await getTenantScope();
    const rootId = '55555555-5555-5555-5555-555555555555';
    const isOwner = !scope || oldData.tenant_id === scope;
    const isBroadcastedToMe = scope && oldData.published_to?.includes(scope);

    if (!isOwner && isBroadcastedToMe) {
        const newPublishedTo = (oldData.published_to || []).filter((tid: string) => tid !== scope);
        const { error: updateError } = await (supabase as any)
            .from('learning_resources')
            .update({ published_to: newPublishedTo.length > 0 ? newPublishedTo : null })
            .eq('id', id);

        if (updateError) return { success: false, error: 'Lỗi khi gỡ tài liệu hệ thống: ' + updateError.message };

        await createAuditLog({
            user, action: 'update', tableName: 'learning_resources',
            recordId: id, oldData, newData: { published_to: newPublishedTo },
            tenantId: scope,
        });

        revalidatePath('/admin/documents');
        revalidateLearningCache(scope);
        return { success: true, message: 'Đã gỡ tài liệu hệ thống khỏi danh sách của bạn.' };
    }

    const { error } = await (supabase as any).from('learning_resources').delete().eq('id', id);

    if (error) {
        console.error('deleteLearningResource error:', error);
        if (error.code === '23503') return { success: false, error: 'Tài liệu này đang được tham chiếu, không thể xóa' };
        return { success: false, error: error.message };
    }

    await createAuditLog({
        user,
        action: 'delete',
        tableName: 'learning_resources',
        recordId: id,
        oldData: oldData ?? null,
        tenantId: oldData?.tenant_id || scope,
    });

    revalidatePath('/admin/documents');
    revalidateLearningCache(oldData?.tenant_id);

    return { success: true };
});

/**
 * Cập nhật thứ tự (order_position) hàng loạt
 */
export const reorderLearningResources = executeSafeAction(async (items: { id: string; order_position: number }[]) => {
    const user = await requireEditor();
    await requirePermission('dharma-talks', 'update');
    const supabase = await createClient();

    const parsed = BatchOrderSchema.safeParse(items);
    if (!parsed.success) {
        return { success: false, error: formatZodError(parsed.error) };
    }

    const { error } = await (supabase as any)
        .from('learning_resources')
        .upsert(parsed.data.map(i => ({ id: i.id, order_position: i.order_position })), { onConflict: 'id' });

    if (error) {
        console.error('Reorder learning resources error:', error);
        return { success: false, error: 'Có lỗi khi sắp xếp tài liệu: ' + error.message };
    }

    let batchTenantId = null;
    if (items.length > 0) {
        const { data } = await (supabase as any).from('learning_resources').select('tenant_id').eq('id', items[0].id).single();
        batchTenantId = data?.tenant_id;
    }

    await createAuditLog({
        user,
        action: 'update',
        tableName: 'learning_resources',
        recordId: 'batch_reorder',
        newData: { reordered_count: items.length, items },
        tenantId: batchTenantId,
    });

    revalidatePath('/admin/documents');
    revalidateLearningCache(batchTenantId);

    return { success: true };
});

export const submitLearningResourceForReview = executeSafeAction(async (id: string) => {
    const user = await requireEditor();
    await requirePermission('dharma-talks', 'update');
    await enforceTenantScopeForRecord('learning_resources', id);
    const supabase = await createClient();
    const { error } = await (supabase as any)
        .from('learning_resources')
        .update({ approval_status: 'pending_review' })
        .eq('id', id);

    if (error) return { success: false, error: 'Có lỗi khi gửi duyệt' };
    revalidatePath('/admin/documents');
    const { data: oldData } = await (supabase as any).from('learning_resources').select('tenant_id').eq('id', id).single();
    revalidateLearningCache(oldData?.tenant_id);
    return { success: true };
});

export const approveLearningResource = executeSafeAction(async (id: string, note?: string) => {
    const user = await requireAdmin();
    await requirePermission('dharma-talks', 'update');
    await enforceTenantScopeForRecord('learning_resources', id);
    const supabase = await createClient();
    const { data: oldData } = await (supabase as any).from('learning_resources').select('*').eq('id', id).single();
    const { error } = await (supabase as any).from('learning_resources').update({ approval_status: 'published' }).eq('id', id);

    if (error) return { success: false, error: 'Có lỗi khi duyệt bài: ' + error.message };

    await createAuditLog({
        user,
        action: 'approve',
        tableName: 'learning_resources',
        recordId: id,
        oldData,
        newData: { approval_status: 'published', note },
        tenantId: oldData?.tenant_id,
    });

    revalidatePath('/admin/documents');
    revalidatePath(`/admin/documents/${id}`);
    revalidateLearningCache(oldData?.tenant_id);
    return { success: true };
});

export const rejectLearningResource = executeSafeAction(async (id: string, note: string) => {
    const user = await requireAdmin();
    await requirePermission('dharma-talks', 'update');
    await enforceTenantScopeForRecord('learning_resources', id);
    const supabase = await createClient();
    const { data: oldData } = await (supabase as any).from('learning_resources').select('*').eq('id', id).single();
    const { error } = await (supabase as any).from('learning_resources').update({ approval_status: 'rejected' }).eq('id', id);

    if (error) return { success: false, error: 'Có lỗi khi từ chối bài: ' + error.message };

    await createAuditLog({
        user,
        action: 'reject',
        tableName: 'learning_resources',
        recordId: id,
        oldData,
        newData: { approval_status: 'rejected', note },
        tenantId: oldData?.tenant_id,
    });

    revalidatePath('/admin/documents');
    revalidateLearningCache(oldData?.tenant_id);
    return { success: true };
});
