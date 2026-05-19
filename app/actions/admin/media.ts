'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdmin, requireEditor } from '@/lib/auth/require-admin';
import { requirePermission, enforceTenantScopeForRecord } from '@/lib/permissions';
import { createAuditLog } from '@/lib/audit';
import { MediaSchema } from '@/lib/validations/admin';
import { updateItemTags } from './tags';
import { v2 as cloudinary } from 'cloudinary';

// Configure cloudinary (Cloudinary auto-reads CLOUDINARY_URL or use env vars)
cloudinary.config({
    secure: true,
});

export async function updateMediaMetadata(tenantId: string, id: string, formData: FormData) {
    try {
        const user = await requireEditor();
        await requirePermission('media', 'update');
        await enforceTenantScopeForRecord('media', id);
        const supabase = await createClient();

        const rawCategoryId = formData.get('category_id') as string | null;
        const raw = {
            title_vi: formData.get('title_vi') as string,
            title_en: formData.get('title_en') as string || null,
            description_vi: formData.get('description_vi') as string || null,
            type: formData.get('type') as string,
            url: formData.get('url') as string || 'https://placeholder.invalid',
            thumbnail_url: formData.get('thumbnail_url') as string || null,
            category_id: (!rawCategoryId || rawCategoryId === 'null' || rawCategoryId === 'undefined' || rawCategoryId === '') ? null : rawCategoryId,
            year: formData.get('year') ? parseInt(formData.get('year') as string) : null,
            published_to: formData.get('published_to') ? JSON.parse(formData.get('published_to') as string) : [],
        };

        // FIXED: Validate input với MediaSchema trước khi update DB
        const parsed = MediaSchema.safeParse({ ...raw, tenant_id: tenantId });
        if (!parsed.success) {
            const issues = parsed.error.issues;
            return { success: false, error: issues[0]?.message ?? 'Dữ liệu không hợp lệ' };
        }

        // Chỉ lưu các field metadata — không update url/type (readonly sau upload)
        const mediaData: Record<string, any> = {
            title_vi: parsed.data.title_vi,
            title_en: parsed.data.title_en ?? null,
            description_vi: parsed.data.description_vi ?? null,
            category_id: parsed.data.category_id ?? null,
            year: parsed.data.year ?? null,
            thumbnail_url: parsed.data.thumbnail_url ?? null,
            published_to: parsed.data.published_to || null,
        };
        // title_km từ formData (không có trong MediaSchema — ghi trực tiếp nếu có)
        const title_km = formData.get('title_km') as string | null;
        if (title_km !== null) mediaData.title_km = title_km || null;

        const { data: oldData } = await supabase.from('media').select('*').eq('id', id).eq('tenant_id', tenantId).single();
        // @ts-ignore
        const { error } = await supabase.from('media').update(mediaData).eq('id', id).eq('tenant_id', tenantId);

        if (error) {
            console.error('Update media error:', error);
            return { success: false, error: 'Có lỗi khi cập nhật media: ' + error.message };
        }

        await createAuditLog({ user, action: 'update', tableName: 'media', recordId: id, oldData: oldData ?? null, newData: mediaData });

        revalidatePath('/admin/media');
        // @ts-ignore
        revalidateTag(`media-${tenantId}`);

        // --- TAGS INTEGRATION ---
        const tagIdsRaw = formData.get('tag_ids') as string;
        if (tagIdsRaw) {
            try {
                const tagIds = JSON.parse(tagIdsRaw);
                if (Array.isArray(tagIds)) {
                    await updateItemTags('media_tags', id, tagIds);
                }
            } catch (e) {
                console.error('Error parsing tags in updateMediaMetadata:', e);
            }
        }
        // -----------------------

        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Update media error:', err);
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}


/**
 * Helper to extract Cloudinary Public ID from URL
 * Cloudinary URL format: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[folder]/[public_id].[ext]
 */
function extractPublicIdFromUrl(url: string): string | null {
    if (!url.includes('cloudinary.com')) return null;

    try {
        const parts = url.split('/');
        // Cloudinary Public ID is after /upload/ (or /v[number]/)
        const uploadIdx = parts.indexOf('upload');
        if (uploadIdx === -1) return null;

        let pathParts = parts.slice(uploadIdx + 1);
        // If version starts with 'v', remove it
        if (pathParts[0].startsWith('v')) {
            pathParts = pathParts.slice(1);
        }

        // Take everything after version and before file extension
        const fullPath = pathParts.join('/');
        const lastDotIdx = fullPath.lastIndexOf('.');
        return lastDotIdx !== -1 ? fullPath.substring(0, lastDotIdx) : fullPath;
    } catch (e) {
        return null;
    }
}

export async function deleteMedia(tenantId: string, id: string) {
    try {
        const user = await requireAdmin(); // fallback compatible
        await requirePermission('media', 'delete');
        await enforceTenantScopeForRecord('media', id);
        const supabase = await createClient();

        const { data: media } = await supabase
            .from('media')
            .select('url')
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .single();

        if (!media) {
            return { success: false, error: 'Không tìm thấy media' };
        }

        // 1. Xóa file thực tế trên Cloudinary
        const publicId = extractPublicIdFromUrl(media.url);
        if (publicId) {
            try {
                // publicId for Cloudinary includes folders (e.g. "chantarangsay/mcaaron/2026/filename")
                await cloudinary.uploader.destroy(publicId);
            } catch (cloudError) {
                console.error('Error deleting from Cloudinary:', cloudError);
                // Continue with DB deletion even if Cloudinary fails (to avoid ghost records)
            }
        }

        // 2. Xóa metadata trong Database
        const { error: dbError } = await supabase.from('media').delete().eq('id', id).eq('tenant_id', tenantId);

        if (dbError) {
            console.error('Delete media error:', dbError);
            return { success: false, error: 'Có lỗi khi xóa media: ' + dbError.message };
        }

        revalidatePath('/admin/media');
        // @ts-ignore
        revalidateTag(`media-${tenantId}`);

        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Delete media error:', err);
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}

export async function bulkUpdateMediaMetadata(tenantId: string | undefined, mediaIds: string[], updateData: { category_id?: string | null, published_to?: string[] | null, tag_ids?: string[] }) {
    try {
        const user = await requireEditor();
        await requirePermission('media', 'update');
        const supabase = await createClient();

        let successCount = 0;
        let failCount = 0;

        for (const id of mediaIds) {
            try {
                const { data: record } = await supabase.from('media').select('tenant_id').eq('id', id).single();
                if (!record) { failCount++; continue; }
                const targetTenantId = record.tenant_id as string;
                
                if (tenantId && targetTenantId !== tenantId) { failCount++; continue; } 

                const mediaData: Record<string, any> = {};
                if ('category_id' in updateData) mediaData.category_id = updateData.category_id === 'null' || !updateData.category_id ? null : updateData.category_id;
                if ('published_to' in updateData) mediaData.published_to = updateData.published_to;

                if (Object.keys(mediaData).length > 0) {
                    const { data: oldData } = await supabase.from('media').select('*').eq('id', id).eq('tenant_id', targetTenantId).single();
                    const { error } = await supabase.from('media').update(mediaData).eq('id', id).eq('tenant_id', targetTenantId);
                    
                    if (!error) {
                        await createAuditLog({ user, action: 'update', tableName: 'media', recordId: id, oldData: oldData ?? null, newData: mediaData });
                        successCount++;
                    } else {
                        failCount++;
                    }
                } else {
                    successCount++;
                }

                if (updateData.tag_ids) {
                    await updateItemTags('media_tags', id, updateData.tag_ids);
                }
            } catch (e) {
                failCount++;
            }
        }
        revalidatePath('/admin/media');
        // @ts-ignore
        if (tenantId) revalidateTag(`media-${tenantId}`);
        return { success: true, successCount, failCount };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Bulk update error:', err);
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}

export async function bulkDeleteMedia(tenantId: string | undefined, mediaIds: string[]) {
    try {
        const user = await requireAdmin(); 
        await requirePermission('media', 'delete');
        const supabase = await createClient();

        let successCount = 0;
        let failCount = 0;

        for (const id of mediaIds) {
            try {
                const { data: record } = await supabase.from('media').select('tenant_id').eq('id', id).single();
                if (!record) { failCount++; continue; }
                const targetTenantId = record.tenant_id as string;
                
                if (tenantId && targetTenantId !== tenantId) { failCount++; continue; } 

                const result = await deleteMedia(targetTenantId, id);
                if (result.success) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch(e) {
                failCount++;
            }
        }
        return { success: true, successCount, failCount };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Bulk delete error:', err);
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}
