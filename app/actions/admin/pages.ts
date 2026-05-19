'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdmin, requireEditor } from '@/lib/auth/require-admin';
import { createAuditLog } from '@/lib/audit';
import { saveRevision } from './revisions';
import { PageSchema } from '@/lib/validations/admin';

export async function updatePage(slug: string, formData: FormData) {
    try {
        const user = await requireEditor();
        const supabase = await createClient();

        const raw = {
            title_vi: formData.get('title_vi') as string,
            title_en: formData.get('title_en') as string || null,
            slug,
            content_vi: formData.get('content_vi') as string || null,
            content_en: formData.get('content_en') as string || null,
            meta_description_vi: formData.get('meta_description_vi') as string || null,
            meta_description_en: formData.get('meta_description_en') as string || null,
            status: (formData.get('status') as string) || 'published',
            tenant_id: (!formData.get('tenant_id') || formData.get('tenant_id') === 'null' || formData.get('tenant_id') === '') ? null : formData.get('tenant_id') as string,
            parent_id: (!formData.get('parent_id') || formData.get('parent_id') === 'null' || formData.get('parent_id') === '') ? null : formData.get('parent_id') as string,
            order_index: parseInt(formData.get('order_index') as string || '0', 10),
            show_in_menu: formData.get('show_in_menu') === 'true',
        };

        const parsed = PageSchema.safeParse(raw);
        if (!parsed.success) {
            return { success: false, error: (parsed as any).error.errors[0].message };
        }

        const pageData = { ...parsed.data, updated_at: new Date().toISOString() };

        const tenantId = parsed.data.tenant_id ?? null;
        const oldDataBaseQ = (supabase as any).from('pages').select('*').eq('slug', slug);
        const { data: oldData } = await (tenantId
            ? oldDataBaseQ.eq('tenant_id', tenantId)
            : oldDataBaseQ.is('tenant_id', null)
        ).single();
        // @ts-ignore
        const updateQ = (supabase as any).from('pages').update(pageData).eq('slug', slug);
        const { error } = await (tenantId ? updateQ.eq('tenant_id', tenantId) : updateQ.is('tenant_id', null));

        if (error) {
            console.error('Update page error:', error);
            return { success: false, error: 'Có lỗi khi cập nhật trang: ' + error.message };
        }

        await createAuditLog({ user, action: 'update', tableName: 'pages', recordId: slug, oldData: oldData ?? null, newData: pageData });

        // Ghi lại phiên bản nội dung
        if (oldData) {
            await saveRevision({
                tableName: 'pages',
                recordId: oldData.id,
                changedBy: user.id,
                oldData: oldData,
                newData: pageData,
                changeSummary: `Cập nhật trang: ${pageData.title_vi}`
            });
        }

        revalidatePath(`/admin/t/${parsed.data.tenant_id}/pages`);
        revalidatePath(`/admin/t/${parsed.data.tenant_id}/pages/${slug}`);
        // @ts-ignore
        revalidateTag(`pages-${parsed.data.tenant_id || 'global'}`);
        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Update page error:', err);
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}

export async function createPage(formData: FormData) {
    try {
        const user = await requireEditor();
        const supabase = await createClient();

        const raw = {
            title_vi: formData.get('title_vi') as string,
            title_en: formData.get('title_en') as string || null,
            slug: formData.get('slug') as string,
            content_vi: formData.get('content_vi') as string || null,
            content_en: formData.get('content_en') as string || null,
            meta_description_vi: formData.get('meta_description_vi') as string || null,
            meta_description_en: formData.get('meta_description_en') as string || null,
            status: (formData.get('status') as string) || 'draft',
            tenant_id: (!formData.get('tenant_id') || formData.get('tenant_id') === 'null' || formData.get('tenant_id') === '') ? null : formData.get('tenant_id') as string,
            parent_id: (!formData.get('parent_id') || formData.get('parent_id') === 'null' || formData.get('parent_id') === '') ? null : formData.get('parent_id') as string,
            order_index: parseInt(formData.get('order_index') as string || '0', 10),
            show_in_menu: formData.get('show_in_menu') === 'true',
        };

        const parsed = PageSchema.safeParse(raw);
        if (!parsed.success) {
            return { success: false, error: (parsed as any).error.errors[0].message };
        }

        // Tự động gán tenant_id: Ưu tiên input > User Role
        let finalTenantId = parsed.data.tenant_id;
        if (!finalTenantId) {
            const { data: roleData } = await (supabase as any)
                .from('user_roles')
                .select('tenant_id')
                .eq('user_id', user.id)
                .maybeSingle();
            finalTenantId = roleData?.tenant_id;
        }

        const pageData = {
            ...parsed.data,
            tenant_id: finalTenantId || null,
        };

        const { error } = await (supabase as any).from('pages').insert(pageData);

        if (error) {
            console.error('Create page error:', error);
            if (error.code === '23505') return { success: false, error: 'Đường dẫn (slug) đã tồn tại' };
            return { success: false, error: 'Có lỗi khi tạo trang: ' + error.message };
        }

        await createAuditLog({ user, action: 'create', tableName: 'pages', recordId: parsed.data.slug, oldData: null, newData: pageData });

        revalidatePath(`/admin/t/${parsed.data.tenant_id}/pages`);
        // @ts-ignore
        revalidateTag(`pages-${parsed.data.tenant_id || 'global'}`);
        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Create page error:', err);
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}

export async function deletePage(slug: string, tenantId: string) {
    try {
        const user = await requireAdmin();
        const supabase = await createClient();

        const { data: oldData } = await (supabase as any).from('pages').select('*').eq('slug', slug).eq('tenant_id', tenantId).single();
        if (!oldData) return { success: false, error: 'Trang không tồn tại' };

        const { error } = await (supabase as any).from('pages').delete().eq('slug', slug).eq('tenant_id', tenantId);

        if (error) {
            console.error('Delete page error:', error);
            return { success: false, error: 'Lỗi khi xóa: ' + error.message };
        }

        await createAuditLog({ user, action: 'delete', tableName: 'pages', recordId: slug, oldData, newData: null });

        revalidatePath(`/admin/t/${tenantId}/pages`);
        // @ts-ignore
        revalidateTag(`pages-${tenantId || 'global'}`);
        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Delete page error:', err);
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}

export async function updatePageStructure(updates: { id: string; parent_id: string | null; order_index: number }[], tenantId: string) {
    try {
        const user = await requireEditor();
        const supabase = await createClient();

        for (const update of updates) {
            const parentId = (update.parent_id === 'null' || !update.parent_id) ? null : update.parent_id;
            const { error } = await (supabase as any)
                .from('pages')
                .update({ parent_id: parentId, order_index: update.order_index })
                .eq('id', update.id)
                .eq('tenant_id', tenantId);

            if (error) {
                console.error('Error updating page struct for id:', update.id, error);
                throw new Error(error.message);
            }
        }

        await createAuditLog({ user, action: 'update', tableName: 'pages', recordId: 'bulk-structure', oldData: null, newData: { updates } });

        revalidatePath(`/admin/t/${tenantId}/pages`);
        // @ts-ignore
        revalidateTag(`pages-${tenantId || 'global'}`);

        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Update structure error:', err);
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}
