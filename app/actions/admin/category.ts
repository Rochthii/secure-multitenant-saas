'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { generateSlug } from '@/lib/utils';
import { requireAdmin } from '@/lib/auth/require-admin';
import { requirePermission, enforceTenantScopeForRecord, getTenantScope } from '@/lib/permissions';
import { createAuditLog } from '@/lib/audit';
import { saveRevision } from './revisions';

import { CACHE_TAGS } from '@/lib/cache/tags';

function revalidateCategoryCache(tenantId?: string | null, module?: string | null) {
    // @ts-ignore
    revalidateTag(CACHE_TAGS.CATEGORIES);
    
    // Also revalidate the main layout bundle tag
    // @ts-ignore
    revalidateTag('layout-bundle-v2');

    if (tenantId) {
        // @ts-ignore
        revalidateTag(CACHE_TAGS.categories.tenant(tenantId));
        // @ts-ignore
        revalidateTag(CACHE_TAGS.system.dashboardStats(tenantId));
        // Revalidate layout bundle for this tenant
        // @ts-ignore
        revalidateTag(`layout-bundle-${tenantId}`);
    } else {
        // @ts-ignore
        revalidateTag(CACHE_TAGS.categories.all);
        // @ts-ignore
        revalidateTag(CACHE_TAGS.system.dashboardStatsGlobal);
    }

    // Revalidate specific module caches if provided
    if (module === 'news') {
        // @ts-ignore
        revalidateTag(tenantId ? CACHE_TAGS.news.tenant(tenantId) : CACHE_TAGS.news.all);
        revalidatePath('/admin/news');
    } else if (module === 'events') {
        // @ts-ignore
        revalidateTag(tenantId ? CACHE_TAGS.events.tenant(tenantId) : CACHE_TAGS.events.all);
        revalidatePath('/admin/events');
    } else if (module === 'dharma') {
        // @ts-ignore
        revalidateTag(tenantId ? CACHE_TAGS.dharmaTalks.tenant(tenantId) : CACHE_TAGS.dharmaTalks.all);
    }
}


import { CategorySchema, BatchOrderSchema, formatZodError } from '@/lib/validations/admin';

export async function createCategory(formData: FormData) {
    try {
        const user = await requireAdmin(); // fallback compatible
        await requirePermission('categories', 'create');
        const adminDb = await createClient();

        const raw = {
            name_vi: formData.get('name_vi') as string,
            name_km: (formData.get('name_km') as string) || null,
            name_en: (formData.get('name_en') as string) || null,
            slug: (formData.get('slug') as string) || generateSlug(formData.get('name_vi') as string),
            module: formData.get('module') as string,
            parent_id: (!formData.get('parent_id') || formData.get('parent_id') === 'null' || formData.get('parent_id') === '') ? null : formData.get('parent_id') as string,
            image_url: (formData.get('image_url') as string) || null,
            description_vi: (formData.get('description_vi') as string) || null,
            description_km: (formData.get('description_km') as string) || null,
            description_en: (formData.get('description_en') as string) || null,
            tenant_id: (formData.get('tenant_id') as string) || null,
            order_position: parseInt(formData.get('order_position') as string) || 0,
            is_visible: formData.get('is_visible') === 'true' || formData.get('is_visible') === 'on',
            published_to: formData.get('published_to') ? JSON.parse(formData.get('published_to') as string) : [],
        };

        const parsed = CategorySchema.safeParse(raw);
        if (!parsed.success) {
            return { success: false, error: formatZodError(parsed.error) };
        }

        // Tự động gán tenant_id: Ưu tiên scope của user
        let finalTenantId = parsed.data.tenant_id;
        const scope = await getTenantScope();

        if (scope) {
            finalTenantId = scope;
        } else if (!finalTenantId) {
            const { data: roleData } = await (adminDb as any)
                .from('user_roles')
                .select('tenant_id')
                .eq('user_id', user.id)
                .maybeSingle();
            finalTenantId = roleData?.tenant_id;
        }

        const categoryData = {
            ...parsed.data,
            type: parsed.data.module.substring(0, 50), // Backward compatibility
            tenant_id: finalTenantId || null,
        };

        const { data, error } = await (adminDb as any).from('categories').insert(categoryData).select().single();

        if (error) {
            console.error('Lỗi khi tạo danh mục:', error);
            if (error.code === '23505') return { success: false, error: 'Danh mục này đã tồn tại' };
            return { success: false, error: error.message };
        }

        await createAuditLog({
            user,
            action: 'create',
            tableName: 'categories',
            recordId: data.id,
            newData: data,
            tenantId: data.tenant_id,
        });

        revalidatePath('/admin/categories');
        revalidateCategoryCache(data.tenant_id, raw.module);
        return { success: true, data };
    } catch (error: any) {
        console.error('Lỗi server:', error);
        return { success: false, error: error.message || 'Có lỗi hệ thống xảy ra' };
    }
}

export async function updateCategory(id: string, formData: FormData) {
    try {
        const user = await requireAdmin(); // fallback compatible
        await requirePermission('categories', 'update');
        await enforceTenantScopeForRecord('categories', id);
        const adminDb = await createClient();

        const raw = {
            name_vi: formData.get('name_vi') as string,
            name_km: (formData.get('name_km') as string) || null,
            name_en: (formData.get('name_en') as string) || null,
            slug: (formData.get('slug') as string) || generateSlug(formData.get('name_vi') as string),
            module: formData.get('module') as string,
            parent_id: (!formData.get('parent_id') || formData.get('parent_id') === 'null' || formData.get('parent_id') === '') ? null : formData.get('parent_id') as string,
            image_url: (formData.get('image_url') as string) || null,
            description_vi: (formData.get('description_vi') as string) || null,
            description_km: (formData.get('description_km') as string) || null,
            description_en: (formData.get('description_en') as string) || null,
            tenant_id: (formData.get('tenant_id') as string) || null,
            order_position: parseInt(formData.get('order_position') as string) || 0,
            is_visible: formData.get('is_visible') === 'true' || formData.get('is_visible') === 'on',
            published_to: formData.get('published_to') ? JSON.parse(formData.get('published_to') as string) : [],
        };

        const parsed = CategorySchema.safeParse(raw);
        if (!parsed.success) {
            return { success: false, error: formatZodError(parsed.error) };
        }

        // Security: Prevent local admin from transferring category to another tenant
        const scope = await getTenantScope();
        if (scope && parsed.data.tenant_id !== scope) {
            parsed.data.tenant_id = scope;
        }

        const updateData = {
            ...parsed.data,
            type: parsed.data.module.substring(0, 50), // Backward compatibility
        };

        const { data: oldData } = await (adminDb as any).from('categories').select('*').eq('id', id).single();
        const { data, error } = await (adminDb as any)
            .from('categories')
            .update(updateData)
            .eq('id', id)
            .select().single();

        if (error) {
            console.error('Lỗi khi cập nhật danh mục:', error);
            if (error.code === '23505') return { success: false, error: 'Đường dẫn (slug) này đã bị trùng' };
            return { success: false, error: error.message };
        }

        await createAuditLog({
            user,
            action: 'update',
            tableName: 'categories',
            recordId: id,
            oldData,
            newData: data,
            tenantId: data.tenant_id || oldData?.tenant_id,
        });

        await saveRevision({
            tableName: 'categories',
            recordId: id,
            changedBy: user.id,
            oldData,
            newData: data,
            changeSummary: 'Cập nhật danh mục'
        });

        revalidatePath('/admin/categories');
        revalidateCategoryCache(data.tenant_id, raw.module);
        return { success: true, data };
    } catch (error: any) {
        console.error('Lỗi server:', error);
        return { success: false, error: error.message || 'Có lỗi hệ thống xảy ra' };
    }
}

export async function deleteCategory(id: string) {
    try {
        // SECURITY: Xác thực TRƯỚC khi thực hiện bất kỳ thao tác DB nào
        const user = await requireAdmin(); // fallback compatible
        await requirePermission('categories', 'delete');
        await enforceTenantScopeForRecord('categories', id);
        const adminDb = await createClient();

        const { count: childCount } = await (adminDb as any)
            .from('categories')
            .select('*', { count: 'exact', head: true })
            .eq('parent_id', id);

        if (childCount && childCount > 0) {
            return { success: false, error: 'Không thể xóa danh mục này vì phần tử đang có danh mục con.' };
        }

        // Fetch và kiểm tra quyền sở hữu
        const { data: oldData } = await (adminDb as any)
            .from('categories')
            .select('*')
            .eq('id', id)
            .single();

        if (!oldData) {
            return { success: false, error: 'Không tìm thấy danh mục hoặc bạn không có quyền xóa.' };
        }

        // Xóa (an toàn vì đã có enforceTenantScopeForRecord)
        let deleteQuery = (adminDb as any).from('categories').delete().eq('id', id);
        const { error } = await deleteQuery;

        if (error) {
            console.error('Lỗi khi xoá danh mục:', error);
            if (error.code === '23503') {
                return { success: false, error: 'Không thể xoá danh mục này vì đang có bài viết hoặc dữ liệu liên kết.' };
            }
            return { success: false, error: error.message };
        }

        revalidatePath('/admin/categories');
        revalidateCategoryCache(oldData?.tenant_id, oldData?.module);
        return { success: true };
    } catch (error: any) {
        if ((error as any).name === 'UnauthorizedError') return { success: false, error: error.message, unauthorized: true };
        console.error('Lỗi server:', error);
        return { success: false, error: error.message };
    }
}



export async function updateCategoriesOrder(updates: { id: string; order_position: number }[]) {
    try {
        const user = await requireAdmin(); // fallback compatible
        await requirePermission('categories', 'update');
        const adminDb = await createClient();

        const parsed = BatchOrderSchema.safeParse(updates);
        if (!parsed.success) {
            return { success: false, error: formatZodError(parsed.error) };
        }

        const scope = await getTenantScope();

        // Use individual updates instead of upsert to avoid requiring all NOT NULL columns (like name_vi, slug, module)
        for (const item of parsed.data) {
            let q = (adminDb as any)
                .from('categories')
                .update({ order_position: item.order_position })
                .eq('id', item.id);

            if (scope) q = q.eq('tenant_id', scope);

            const { error: updateError } = await q;

            if (updateError) throw updateError;
        }

        await createAuditLog({
            user,
            action: 'update',
            tableName: 'categories',
            recordId: 'batch_reorder',
            newData: { updates },
        });

        revalidatePath('/admin/categories');
        // @ts-ignore
        revalidateTag(CACHE_TAGS.CATEGORIES);
        // @ts-ignore
        revalidateTag(CACHE_TAGS.categories.all);

        return { success: true };
    } catch (error: any) {
        console.error('Lỗi server:', error);
        return { success: false, error: error.message };
    }
}

export async function seedCategoriesFromTemplate(targetTenantId: string) {
    try {
        const user = await requireAdmin();
        await requirePermission('categories', 'create');
        const adminDb = await createClient();

        const TEMPLATE_TENANT_ID = '55555555-5555-5555-5555-555555555555';

        // 1. Fetch template categories
        const { data: templateCategories, error: fetchError } = await (adminDb as any)
            .from('categories')
            .select('*')
            .eq('tenant_id', TEMPLATE_TENANT_ID);

        if (fetchError) throw fetchError;
        if (!templateCategories || templateCategories.length === 0) {
            return { success: false, error: 'Không tìm thấy dữ liệu mẫu trong hệ thống.' };
        }

        // 2. Fetch existing categories of target tenant to avoid duplicates
        const { data: existingCategories } = await (adminDb as any)
            .from('categories')
            .select('id, slug')
            .eq('tenant_id', targetTenantId);
        
        const existingSlugs = new Set(existingCategories?.map((c: any) => c.slug) || []);
        const idMap = new Map<string, string>();
        
        // Map existing items to idMap by slug
        existingCategories?.forEach((c: any) => {
            // Find if this slug exists in template
            const templateItem = templateCategories.find((t: any) => t.slug === c.slug);
            if (templateItem) {
                idMap.set(templateItem.id, c.id);
            }
        });

        // 3. Process categories level by level
        // We calculate depth or just iterate until all are processed
        let remaining = [...templateCategories];
        let insertedCount = 0;
        let iterations = 0;

        while (remaining.length > 0 && iterations < 10) {
            const nextRound: any[] = [];
            const toProcess = remaining.filter(cat => !cat.parent_id || idMap.has(cat.parent_id));
            
            // Items that still need their parents to be inserted
            const waiting = remaining.filter(cat => cat.parent_id && !idMap.has(cat.parent_id));

            for (const cat of toProcess) {
                if (idMap.has(cat.id)) continue; // Already exists/mapped

                if (existingSlugs.has(cat.slug)) {
                    // Skip insertion but map the ID
                    const existing = existingCategories!.find((e: any) => e.slug === cat.slug);
                    if (existing) idMap.set(cat.id, existing.id);
                    continue;
                }

                const { id: oldId, created_at, updated_at, parent_id, ...rest } = cat;
                const newParentId = parent_id ? idMap.get(parent_id) : null;

                const newCat = {
                    ...rest,
                    tenant_id: targetTenantId,
                    parent_id: newParentId || null,
                    id: undefined,
                };

                const { data, error } = await (adminDb as any)
                    .from('categories')
                    .insert(newCat)
                    .select()
                    .single();

                if (!error && data) {
                    idMap.set(oldId, data.id);
                    insertedCount++;
                }
            }
            
            remaining = waiting;
            iterations++;
        }

        if (insertedCount > 0) {
            await createAuditLog({
                user,
                action: 'create',
                tableName: 'categories',
                recordId: 'batch_seed',
                newData: { count: insertedCount, targetTenantId },
                tenantId: targetTenantId,
            });

            revalidatePath('/admin/categories');
            revalidateCategoryCache(targetTenantId, null);
            // Revalidate layout bundle tag to refresh header
            // @ts-ignore
            revalidateTag('layout-bundle-v2');
            // @ts-ignore
            if (targetTenantId) revalidateTag(`layout-bundle-${targetTenantId}`);
            
            return { success: true, count: insertedCount, message: `Đã đồng bộ thành công ${insertedCount} danh mục mới.` };
        }

        return { success: true, count: 0, message: 'Dữ liệu danh mục đã đầy đủ, không cần bổ sung.' };
    } catch (error: any) {
        console.error('Lỗi khi khởi tạo dữ liệu mẫu:', error);
        return { success: false, error: error.message || 'Có lỗi hệ thống xảy ra' };
    }
}

/**
 * Toggle nhanh trạng thái Hiển thị (is_visible) của một danh mục.
 * Được gọi từ nút gạt trong danh sách categories, không cần vào form sửa đầy đủ.
 */
export async function toggleCategoryVisibility(id: string, newValue: boolean) {
    try {
        await requirePermission('categories', 'update');
        await enforceTenantScopeForRecord('categories', id);
        const adminDb = await createClient();

        const { data: category, error: fetchError } = await (adminDb as any)
            .from('categories')
            .select('id, tenant_id, module, is_visible')
            .eq('id', id)
            .single();

        if (fetchError || !category) {
            return { success: false, error: 'Không tìm thấy danh mục.' };
        }

        const { error } = await (adminDb as any)
            .from('categories')
            .update({ is_visible: newValue })
            .eq('id', id);

        if (error) {
            return { success: false, error: error.message };
        }

        const user = await requireAdmin();
        await createAuditLog({
            user,
            action: 'update',
            tableName: 'categories',
            recordId: id,
            oldData: { is_visible: !newValue },
            newData: { is_visible: newValue },
            tenantId: category.tenant_id,
        });

        revalidateCategoryCache(category.tenant_id, category.module);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Lỗi hệ thống' };
    }
}
