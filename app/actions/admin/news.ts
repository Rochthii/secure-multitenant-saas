'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdmin, requireEditor, requireRole, requireVolunteer, requireViewer } from '@/lib/auth/require-admin';
import { requirePermission, enforceTenantScopeForRecord, getTenantScope } from '@/lib/permissions';
import { createAuditLog } from '@/lib/audit';
import { saveRevision } from './revisions';
import { NewsSchema, formatZodError } from '@/lib/validations/admin';
import { notifyAllUsers, notifyAdmins } from '@/lib/notifications';
import { updateItemTags } from './tags';

import { revalidateTenantHomepage, revalidateMultiTenantNews } from '@/lib/cache/revalidate';

import { CACHE_TAGS } from '@/lib/cache/tags';

async function revalidateNewsCache(tenantId?: string | null, publishedTo?: string[] | null) {
    const tenantsToRevalidate = new Set<string>();
    if (tenantId) tenantsToRevalidate.add(tenantId);
    if (publishedTo && Array.isArray(publishedTo)) {
        publishedTo.forEach(id => tenantsToRevalidate.add(id));
    }

    if (tenantsToRevalidate.size > 0) {
        await revalidateMultiTenantNews(Array.from(tenantsToRevalidate), [CACHE_TAGS.news.all]);
    } else {
        // @ts-ignore
        revalidateTag(CACHE_TAGS.news.all);
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

/** Lấy tên hiển thị từ user metadata */
function getAuthorName(user: any): string {
    return user.user_metadata?.full_name
        || user.user_metadata?.name
        || user.email?.split('@')[0]
        || 'Không rõ';
}

// ─── CREATE NEWS ─────────────────────────────────────────────────────────────

export async function createNews(formData: FormData) {
    try {
        const user = await requireVolunteer();
        await requirePermission('news', 'create');
        const adminDb = await createClient();

        const raw = {
            title_vi: formData.get('title_vi') as string,
            title_en: formData.get('title_en') as string || null,
            title_km: formData.get('title_km') as string || null,
            content_vi: formData.get('content_vi') as string,
            content_en: formData.get('content_en') as string || null,
            content_km: formData.get('content_km') as string || null,
            excerpt_vi: formData.get('excerpt_vi') as string || null,
            excerpt_en: formData.get('excerpt_en') as string || null,
            excerpt_km: formData.get('excerpt_km') as string || null,
            slug: formData.get('slug') as string || null,
            thumbnail_url: formData.get('thumbnail_url') as string || null,
            category_id: (!formData.get('category_id') || formData.get('category_id') === 'null' || formData.get('category_id') === '') ? null : formData.get('category_id') as string,
            tenant_id: (!formData.get('tenant_id') || formData.get('tenant_id') === 'null' || formData.get('tenant_id') === '') ? null : formData.get('tenant_id') as string,
            status: (formData.get('status') as string) || 'draft',
            published_at: formData.get('published_at') as string || null,
            published_to: (() => {
                const val = formData.get('published_to');
                if (!val || val === 'null' || val === '') return null;
                try {
                    const parsed = JSON.parse(val as string);
                    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                    return Array.isArray(parsed) ? parsed.filter((id) => id && typeof id === 'string' && uuidRegex.test(id)) : null;
                } catch { return null; }
            })(),
        };

        const parsed = NewsSchema.safeParse(raw);
        if (!parsed.success) {
            console.error('[news action] Validation failed:', JSON.stringify(parsed.error.issues, null, 2));
            return { success: false, error: formatZodError(parsed.error) };
        }

        // Tự động gán tenant_id từ danh mục nếu chưa có (Admin tổng tạo bài)
        const scope = await getTenantScope();
        let finalTenantId = raw.tenant_id;

        if (scope) {
            finalTenantId = scope; // Force local admin to only create in their own tenant
        }

        const scheduledAt = formData.get('scheduled_at') as string || null;
        const userRole = (user.app_metadata?.role ?? user.user_metadata?.role) as string;

        // Editor không được xuất bản trực tiếp — phải qua duyệt
        const canPublish = ['admin', 'super_admin', 'tenant_admin', 'company_editor'].includes(userRole);

        let effectiveStatus = parsed.data.status;
        if (scheduledAt && effectiveStatus !== 'published') {
            effectiveStatus = 'scheduled';
        } else if (effectiveStatus === 'published' && !canPublish) {
            // Editor cố publish → chuyển sang pending_review
            effectiveStatus = 'pending_review';
        }

        const newsData = {
            ...parsed.data,
            tenant_id: finalTenantId,
            status: effectiveStatus,
            slug: parsed.data.slug || buildSlug(parsed.data.title_vi),
            author_id: user.id,
            author_name: getAuthorName(user),
            scheduled_at: scheduledAt || null,
            published_at: effectiveStatus === 'published' && !parsed.data.published_at
                ? new Date().toISOString()
                : parsed.data.published_at,
        };

        const { data, error } = await (adminDb as any).from('news').insert(newsData).select('id').single();

        if (error) {
            console.error('Create news error:', error);
            if (error.code === '23505') return { success: false, error: 'Đường dẫn (slug) này đã tồn tại.' };
            return { success: false, error: 'Có lỗi khi tạo tin tức: ' + error.message };
        }

        await createAuditLog({
            user, action: 'create', tableName: 'news',
            recordId: data.id, newData: newsData,
            tenantId: newsData.tenant_id,
        });

        // Notify Admins if it needs review
        if (effectiveStatus === 'pending_review') {
            await notifyAdmins({
                title: 'Tin tức mới chờ duyệt',
                body: `Bài viết "${newsData.title_vi}" đang chờ được phê duyệt.`,
                url: `/admin/news/${data.id}`
            });
        }

        // Notify Users if it's published immediately (by Admin)
        if (effectiveStatus === 'published') {
            await notifyAllUsers({
                title: 'Tin tức mới',
                body: newsData.title_vi,
                url: `/tin-tuc/${newsData.slug}`
            });
        }

        revalidatePath('/admin/news');
        revalidateNewsCache(newsData.tenant_id, newsData.published_to);

        // --- TAGS INTEGRATION ---
        const tagIdsRaw = formData.get('tag_ids') as string;
        if (tagIdsRaw) {
            try {
                const tagIds = JSON.parse(tagIdsRaw);
                if (Array.isArray(tagIds) && tagIds.length > 0) {
                    await updateItemTags('news_tags', data.id, tagIds);
                }
            } catch (e) {
                console.error('Error parsing tags in createNews:', e);
            }
        }
        // -----------------------

        return { success: true, id: data.id };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Create news error:', err);
        return { success: false, error: err?.message ?? 'Có lỗi xảy ra khi tạo tin tức' };
    }
}

// ─── UPDATE NEWS ─────────────────────────────────────────────────────────────

export async function updateNews(id: string, formData: FormData) {
    try {
        const user = await requireVolunteer();
        await requirePermission('news', 'update');
        await enforceTenantScopeForRecord('news', id);
        const adminDb = await createClient();

        const raw = {
            title_vi: formData.get('title_vi') as string,
            title_en: formData.get('title_en') as string || null,
            title_km: formData.get('title_km') as string || null,
            content_vi: formData.get('content_vi') as string,
            content_en: formData.get('content_en') as string || null,
            content_km: formData.get('content_km') as string || null,
            excerpt_vi: formData.get('excerpt_vi') as string || null,
            excerpt_en: formData.get('excerpt_en') as string || null,
            excerpt_km: formData.get('excerpt_km') as string || null,
            slug: formData.get('slug') as string || null,
            thumbnail_url: formData.get('thumbnail_url') as string || null,
            category_id: (!formData.get('category_id') || formData.get('category_id') === 'null' || formData.get('category_id') === '') ? null : formData.get('category_id') as string,
            tenant_id: (!formData.get('tenant_id') || formData.get('tenant_id') === 'null' || formData.get('tenant_id') === '') ? null : formData.get('tenant_id') as string,
            status: (formData.get('status') as string) || 'draft',
            published_at: formData.get('published_at') as string || null,
            published_to: (() => {
                const val = formData.get('published_to');
                if (!val || val === 'null' || val === '') return null;
                try {
                    const parsed = JSON.parse(val as string);
                    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                    return Array.isArray(parsed) ? parsed.filter((id) => id && typeof id === 'string' && uuidRegex.test(id)) : null;
                } catch { return null; }
            })(),
        };

        const parsed = NewsSchema.safeParse(raw);
        if (!parsed.success) {
            console.error('[news action] Validation failed:', JSON.stringify(parsed.error.issues, null, 2));
            return { success: false, error: formatZodError(parsed.error) };
        }

        const { data: oldData } = await (adminDb as any).from('news').select('*').eq('id', id).single();

        if (!oldData) {
            return { success: false, error: 'Không tìm thấy bài viết' };
        }

        const userRole = (user.app_metadata?.role ?? user.user_metadata?.role) as string;

        // Tự động gán tenant_id từ danh mục nếu chưa có (Admin tổng sửa bài)
        let finalTenantId = raw.tenant_id;
        if (parsed.data.category_id) {
            const { data: catData } = await (adminDb as any).from('categories').select('tenant_id').eq('id', parsed.data.category_id).single();
            if (catData && catData.tenant_id) { // Nếu danh mục thuộc về chi nhánh nhánh
                finalTenantId = catData.tenant_id;
            } else if (catData && catData.tenant_id === null && ['super_admin', 'company_editor'].includes(userRole)) {
                finalTenantId = null; // Kế thừa vĩnh viễn tính chất global của danh mục
            }
        }
        // FIXED: Editor chỉ được sửa bài của chính mình
        const canPublish = ['admin', 'super_admin', 'tenant_admin', 'company_editor'].includes(userRole);
        const isEditor = !canPublish;

        if (isEditor && (oldData as any).author_id !== user.id) {
            return { success: false, error: 'Bạn chỉ có thể chỉnh sửa bài viết của mình', unauthorized: true };
        }

        // CHẶN: Admin chi nhánh không được sửa bài của Admin Tổng hoặc bài được broadcast tới
        const scope = await getTenantScope();
        const rootId = '55555555-5555-5555-5555-555555555555';
        const isGlobalPost = !oldData.tenant_id || oldData.tenant_id === rootId;
        
        if (scope && isGlobalPost) {
            return { success: false, error: 'Bạn không có quyền chỉnh sửa bài viết của hệ thống. Vui lòng liên hệ Admin Tổng.' };
        }

        const scheduledAt = formData.get('scheduled_at') as string || null;

        let effectiveStatus = parsed.data.status;
        if (scheduledAt && effectiveStatus !== 'published') {
            effectiveStatus = 'scheduled';
        } else if (effectiveStatus === 'published' && !canPublish) {
            // Editor cố publish → chuyển sang pending_review
            effectiveStatus = 'pending_review';
        }

        const newsData = {
            ...parsed.data,
            tenant_id: finalTenantId,
            status: effectiveStatus,
            scheduled_at: scheduledAt || null,
            updated_at: new Date().toISOString(),
            published_at: effectiveStatus === 'published' && !parsed.data.published_at && !(oldData as any)?.published_at
                ? new Date().toISOString()
                : parsed.data.published_at,
        };

        const { error } = await (adminDb as any).from('news').update(newsData).eq('id', id);

        if (error) {
            console.error('Update news error:', error);
            if (error.code === '23505') return { success: false, error: 'Đường dẫn (slug) này đã bị trùng.' };
            return { success: false, error: 'Có lỗi khi cập nhật tin tức: ' + error.message };
        }

        await createAuditLog({
            user, action: 'update', tableName: 'news',
            recordId: id, oldData: oldData ?? null, newData: newsData,
            tenantId: newsData.tenant_id || (oldData as any).tenant_id,
        });

        // Ghi lại phiên bản nội dung
        if (oldData) {
            await saveRevision({
                tableName: 'news',
                recordId: id,
                changedBy: user.id,
                oldData,
                newData: newsData,
                changeSummary: `Cập nhật tin tức: ${newsData.title_vi}`
            });
        }

        // If it was just published, notify users
        if (effectiveStatus === 'published' && (oldData as any).status !== 'published') {
            await notifyAllUsers({
                title: 'Tin tức mới',
                body: newsData.title_vi,
                url: `/tin-tuc/${newsData.slug}`
            });
        }

        revalidatePath('/admin/news');
        revalidatePath(`/admin/news/${id}`);
        revalidateNewsCache(newsData.tenant_id || (oldData as any).tenant_id, newsData.published_to);

        // --- TAGS INTEGRATION ---
        const tagIdsRaw = formData.get('tag_ids') as string;
        if (tagIdsRaw) {
            try {
                const tagIds = JSON.parse(tagIdsRaw);
                if (Array.isArray(tagIds)) {
                    await updateItemTags('news_tags', id, tagIds);
                }
            } catch (e) {
                console.error('Error parsing tags in updateNews:', e);
            }
        }
        // -----------------------

        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Update news error:', err);
        return { success: false, error: err?.message ?? 'Có lỗi xảy ra khi cập nhật tin tức' };
    }
}

// ─── DELETE NEWS ─────────────────────────────────────────────────────────────

export async function deleteNews(id: string) {
    try {
        const user = await requireViewer();
        await requirePermission('news', 'delete');
        await enforceTenantScopeForRecord('news', id);
        const adminDb = await createClient();

        // Fetch bài viết và kiểm tra quyền sở hữu
        let query = (adminDb as any).from('news').select('*').eq('id', id);
        const { data: oldData } = await query.single();

        if (!oldData) {
            return { success: false, error: 'Không tìm thấy bài viết hoặc bạn không có quyền xóa bài này.' };
        }

        const scope = await getTenantScope();
        const rootId = '55555555-5555-5555-5555-555555555555';
        const isOwner = !scope || oldData.tenant_id === scope;
        const isBroadcastedToMe = scope && oldData.published_to?.includes(scope);

        if (!isOwner && isBroadcastedToMe) {
            // LOGIC "XÓA ẢO": Chỉ gỡ tên chi nhánh khỏi danh sách nhận tin
            const newPublishedTo = (oldData.published_to || []).filter((tid: string) => tid !== scope);
            const { error: updateError } = await (adminDb as any)
                .from('news')
                .update({ published_to: newPublishedTo.length > 0 ? newPublishedTo : null })
                .eq('id', id);

            if (updateError) return { success: false, error: 'Lỗi khi gỡ bài viết hệ thống: ' + updateError.message };

            await createAuditLog({
                user, action: 'update', tableName: 'news',
                recordId: id, oldData, newData: { published_to: newPublishedTo },
                tenantId: scope,
            });

            revalidatePath('/admin/news');
            revalidateNewsCache(scope);
            return { success: true, message: 'Đã gỡ bài viết hệ thống khỏi danh sách của bạn.' };
        }

        // Xóa (an toàn vì đã sử dụng enforceTenantScopeForRecord hoặc là chủ sở hữu)
        let deleteQuery = (adminDb as any).from('news').delete().eq('id', id);
        const { error } = await deleteQuery;

        if (error) {
            console.error('Delete news error:', error);
            return { success: false, error: 'Có lỗi khi xóa tin tức: ' + error.message };
        }

        revalidatePath('/admin/news');
        revalidateNewsCache(oldData?.tenant_id);
        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Delete news error:', err);
        return { success: false, error: err?.message ?? 'Có lỗi xảy ra' };
    }
}

// ─── SUBMIT FOR REVIEW ───────────────────────────────────────────────────────

export async function submitForReview(id: string) {
    try {
        const user = await requireVolunteer();
        await requirePermission('news', 'update');
        await enforceTenantScopeForRecord('news', id);
        const adminDb = await createClient();

        const { data: oldData } = await (adminDb as any).from('news').select('*').eq('id', id).single();
        if (!oldData) return { success: false, error: 'Không tìm thấy tin tức' };

        const { error } = await (adminDb as any).from('news').update({
            status: 'pending_review',
            updated_at: new Date().toISOString(),
        }).eq('id', id);

        if (error) return { success: false, error: 'Lỗi gửi duyệt: ' + error.message };

        await createAuditLog({
            user, action: 'submit_review', tableName: 'news',
            recordId: id, oldData, newData: { status: 'pending_review' },
            tenantId: oldData?.tenant_id,
        });

        // Notify Admins
        await notifyAdmins({
            title: 'Tin tức mới chờ duyệt',
            body: `Bài viết "${oldData.title_vi}" đã được gửi yêu cầu phê duyệt.`,
            url: `/admin/news/${id}`
        });

        revalidatePath('/admin/news');
        revalidatePath(`/admin/news/${id}`);
        revalidateNewsCache(oldData?.tenant_id);
        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        return { success: false, error: err?.message ?? 'Có lỗi xảy ra' };
    }
}

// ─── APPROVE NEWS ────────────────────────────────────────────────────────────

export async function approveNews(id: string, note?: string) {
    try {
        const user = await requireViewer();
        await requirePermission('news', 'update'); // Currently, approval implies updating
        await enforceTenantScopeForRecord('news', id);
        const adminDb = await createClient();

        const { data: oldData } = await (adminDb as any).from('news').select('*').eq('id', id).single();
        if (!oldData) return { success: false, error: 'Không tìm thấy tin tức' };

        const now = new Date().toISOString();
        const updateData = {
            status: 'published',
            published_at: (oldData as any).published_at || now,
            reviewed_by: user.id,
            reviewer_name: getAuthorName(user),
            reviewed_at: now,
            review_note: note || null,
            updated_at: now,
        };

        const { error } = await (adminDb as any).from('news').update(updateData).eq('id', id);

        if (error) return { success: false, error: 'Lỗi duyệt bài: ' + error.message };

        await createAuditLog({
            user, action: 'approve', tableName: 'news',
            recordId: id, oldData, newData: updateData,
            tenantId: oldData?.tenant_id,
        });

        // Notify Users
        await notifyAllUsers({
            title: 'Tin tức mới',
            body: oldData.title_vi,
            url: `/tin-tuc/${oldData.slug}`
        });

        revalidatePath('/admin/news');
        revalidatePath(`/admin/news/${id}`);
        revalidateNewsCache(oldData?.tenant_id);
        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        return { success: false, error: err?.message ?? 'Có lỗi xảy ra' };
    }
}

// ─── REJECT NEWS ─────────────────────────────────────────────────────────────

export async function rejectNews(id: string, note: string) {
    try {
        const user = await requireViewer();
        await requirePermission('news', 'update');
        await enforceTenantScopeForRecord('news', id);
        const adminDb = await createClient();

        const { data: oldData } = await (adminDb as any).from('news').select('*').eq('id', id).single();
        if (!oldData) return { success: false, error: 'Không tìm thấy tin tức' };

        const now = new Date().toISOString();
        const updateData = {
            status: 'rejected',
            reviewed_by: user.id,
            reviewer_name: getAuthorName(user),
            reviewed_at: now,
            review_note: note,
            updated_at: now,
        };

        const { error } = await (adminDb as any).from('news').update(updateData).eq('id', id);

        if (error) return { success: false, error: 'Lỗi từ chối bài: ' + error.message };

        await createAuditLog({
            user, action: 'reject', tableName: 'news',
            recordId: id, oldData, newData: updateData,
            tenantId: oldData?.tenant_id,
        });

        revalidatePath('/admin/news');
        revalidatePath(`/admin/news/${id}`);
        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        return { success: false, error: err?.message ?? 'Có lỗi xảy ra' };
    }
}
