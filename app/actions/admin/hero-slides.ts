'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin, requireEditor } from '@/lib/auth/require-admin';
import { requirePermission, getUserContext, enforceTenantScopeForRecord } from '@/lib/permissions';
import { createAuditLog } from '@/lib/audit';
import { HeroSlideSchema } from '@/lib/validations/admin';
import { revalidateTag } from 'next/cache';
import { saveRevision } from './revisions';

import { CACHE_TAGS } from '@/lib/cache/tags';

function revalidateHeroCache(tenantId?: string | null) {
    if (tenantId) {
        // @ts-ignore
        revalidateTag(CACHE_TAGS.heroSlides.tenant(tenantId));
        // @ts-ignore
        revalidateTag(CACHE_TAGS.system.dashboardStats(tenantId));
    } else {
        // @ts-ignore
        revalidateTag(CACHE_TAGS.heroSlides.all);
        // @ts-ignore
        revalidateTag(CACHE_TAGS.system.dashboardStatsGlobal);
    }
}

export async function getHeroSlides(tenantId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('order_position', { ascending: true });

    if (error) {
        console.error('Get hero slides error:', error);
        return [];
    }

    return data;
}

export async function createHeroSlide(formData: FormData) {
    try {
        const user = await requireEditor();
        await requirePermission('settings', 'update');
        const supabase = await createClient();
        const context = await getUserContext();

        const rawData = {
            title_vi: formData.get('title_vi'),
            title_en: formData.get('title_en'),
            title_km: formData.get('title_km'),
            subtitle_vi: formData.get('subtitle_vi'),
            subtitle_en: formData.get('subtitle_en'),
            subtitle_km: formData.get('subtitle_km'),
            image_url: formData.get('image_url'),
            cta1_enabled: formData.get('cta1_enabled') === 'true',
            cta1_text_key: formData.get('cta1_text_key'),
            cta1_link: formData.get('cta1_link'),
            cta2_enabled: formData.get('cta2_enabled') === 'true',
            cta2_text_key: formData.get('cta2_text_key'),
            cta2_link: formData.get('cta2_link'),
            is_active: formData.get('is_active') === 'true',
            order_position: Number(formData.get('order_position')) || 0,
            tenant_id: formData.get('tenant_id') as string,
        };

        const parsed = HeroSlideSchema.safeParse(rawData);

        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0].message };
        }

        // Tự động gán tenant_id: Ưu tiên input > User Role
        let finalTenantId = parsed.data.tenant_id;
        if (context && !['super_admin', 'company_editor'].includes(context.role) && context.tenantId) {
            finalTenantId = context.tenantId;
        }

        const slideData = {
            id: (formData.get('id') as string) || crypto.randomUUID(),
            ...parsed.data,
            tenant_id: finalTenantId || null,
        };

        // @ts-ignore - Supabase type inference issue since table is not in types
        const { data, error } = await (supabase as any).from('hero_slides').insert(slideData).select().single();

        if (error) throw error;

        await createAuditLog({
            user,
            action: 'create',
            tableName: 'hero_slides',
            recordId: data.id,
            newData: parsed.data,
            tenantId: parsed.data.tenant_id,
        });

        revalidatePath(`/admin/t/${parsed.data.tenant_id}/homepage/slides`);
        revalidateHeroCache(parsed.data.tenant_id);
        return { success: true };
    } catch (error: any) {
        console.error('Create hero slide error:', error);
        return { success: false, error: error.message };
    }
}

export async function updateHeroSlide(tenantId: string, id: string, formData: FormData) {
    try {
        const user = await requireEditor();
        await requirePermission('settings', 'update');
        await enforceTenantScopeForRecord('hero_slides', id);
        const supabase = await createClient();

        const rawData = {
            title_vi: formData.get('title_vi'),
            title_en: formData.get('title_en'),
            title_km: formData.get('title_km'),
            subtitle_vi: formData.get('subtitle_vi'),
            subtitle_en: formData.get('subtitle_en'),
            subtitle_km: formData.get('subtitle_km'),
            image_url: formData.get('image_url'),
            cta1_enabled: formData.get('cta1_enabled') === 'true',
            cta1_text_key: formData.get('cta1_text_key'),
            cta1_link: formData.get('cta1_link'),
            cta2_enabled: formData.get('cta2_enabled') === 'true',
            cta2_text_key: formData.get('cta2_text_key'),
            cta2_link: formData.get('cta2_link'),
            is_active: formData.get('is_active') === 'true',
            order_position: Number(formData.get('order_position')),
            tenant_id: tenantId,
        };

        const parsed = HeroSlideSchema.safeParse(rawData);

        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0].message };
        }

        const { data: oldData } = await (supabase as any).from('hero_slides').select('*').eq('id', id).eq('tenant_id', tenantId).single();

        // @ts-ignore
        const { error } = await (supabase as any)
            .from('hero_slides')
            .update({
                ...parsed.data,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('tenant_id', tenantId);

        if (error) throw error;

        await createAuditLog({
            user,
            action: 'update',
            tableName: 'hero_slides',
            recordId: id,
            oldData,
            newData: parsed.data,
            tenantId: tenantId,
        });

        await saveRevision({
            tableName: 'hero_slides',
            recordId: id,
            changedBy: user.id,
            oldData,
            newData: parsed.data,
            changeSummary: 'Cập nhật Hero Slide'
        });

        revalidatePath(`/admin/t/${tenantId}/homepage/slides`);

        revalidateHeroCache(tenantId);
        return { success: true };
    } catch (error: any) {
        console.error('Update hero slide error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteHeroSlide(tenantId: string, id: string) {
    try {
        const user = await requireAdmin();
        await requirePermission('settings', 'delete');
        await enforceTenantScopeForRecord('hero_slides', id);
        const supabase = await createClient();

        const { data: oldData } = await (supabase as any).from('hero_slides').select('*').eq('id', id).eq('tenant_id', tenantId).single();

        // @ts-ignore
        const { error } = await (supabase as any).from('hero_slides').delete().eq('id', id).eq('tenant_id', tenantId);

        if (error) throw error;

        await createAuditLog({
            user,
            action: 'delete',
            tableName: 'hero_slides',
            recordId: id,
            oldData,
            tenantId: tenantId,
        });

        revalidatePath(`/admin/t/${tenantId}/homepage/slides`);

        revalidateHeroCache(tenantId);
        return { success: true };
    } catch (error: any) {
        console.error('Delete hero slide error:', error);
        if (error.code === '23503') return { success: false, error: 'Trình chiếu này đang được sử dụng ở nơi khác, không thể xóa' };
        return { success: false, error: error.message };
    }
}

export async function updateHeroSlideOrder(tenantId: string, items: { id: string; order_position: number }[]) {
    try {
        const user = await requireEditor();
        await requirePermission('settings', 'update');
        const supabase = await createClient();

        if (!Array.isArray(items) || items.length === 0) {
            return { success: false, error: 'Danh sách sắp xếp không hợp lệ' };
        }

        for (const item of items) {
            // @ts-ignore
            await (supabase as any).from('hero_slides')
                .update({ order_position: item.order_position })
                .eq('id', item.id)
                .eq('tenant_id', tenantId);
        }

        // FIXED: Thêm audit log cho reorder
        await createAuditLog({
            user,
            action: 'update',
            tableName: 'hero_slides',
            recordId: 'batch_reorder',
            newData: { reordered_count: items.length, items },
            tenantId: tenantId,
        });

        revalidatePath(`/admin/t/${tenantId}/homepage/slides`);

        revalidateHeroCache(tenantId);
        return { success: true };
    } catch (error: any) {
        console.error('Reorder slides error:', error);
        return { success: false, error: error.message };
    }
}
