'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAuditLog } from '@/lib/audit';
import { revalidateTenantLayout } from '@/lib/cache/revalidate';

const THEME_KEYS = [
    'theme_color_primary',
    'theme_color_secondary',
    'theme_color_text',
    'theme_color_accent',
    'theme_background_start',
    'theme_background_end',
    'theme_pattern_opacity',
    'theme_hero',
    'theme_surface',
    'theme_header_bg',
    'theme_footer_bg',
    'custom_theme_presets',
];

/**
 * Cập nhật theme của một chi nhánh cụ thể.
 * SECURITY: Chỉ super_admin hoặc company_editor mới được gọi action này.
 * Admin chi nhánh cụ thể KHÔNG có quyền thay đổi theme.
 */
export async function updateThemeSettings(formData: FormData) {
    try {
        const user = await requireAdmin();
        const supabase = await createClient();

        // SECURITY: Kiểm tra role — chỉ allow super_admin & company_editor
        const { data: roleData } = await (supabase as any)
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle();

        const role = roleData?.role || user.app_metadata?.role;
        const allowedRoles = ['super_admin', 'company_editor'];
        if (!allowedRoles.includes(role)) {
            return { success: false, error: 'Bạn không có quyền thay đổi giao diện (Theme). Chỉ Super Admin mới được phép.' };
        }

        const tenant_id = formData.get('tenant_id') as string;
        if (!tenant_id) {
            return { success: false, error: 'Thiếu Tenant ID.' };
        }

        // Batch upsert theme keys
        const updates: Record<string, string> = {};
        const settingsBatch = THEME_KEYS.map(key => {
            const value = formData.get(key) as string | null;
            if (value === null || value === undefined) return null;
            updates[key] = value;
            return {
                key,
                value,
                tenant_id,
                updated_at: new Date().toISOString(),
                updated_by: user.id,
            };
        }).filter((s): s is NonNullable<typeof s> => s !== null);

        if (settingsBatch.length > 0) {
            const { error: batchError } = await (supabase as any)
                .from('site_settings')
                .upsert(settingsBatch, { onConflict: 'tenant_id,key' });
            if (batchError) {
                return { success: false, error: `Lỗi lưu theme: ${batchError.message}` };
            }
        }

        // Sync theme colors → tenants.theme_colors JSONB
        const { data: tenant } = await (supabase as any)
            .from('tenants')
            .select('theme_colors')
            .eq('id', tenant_id)
            .single();

        const currentColors = (tenant as any)?.theme_colors || {};
        const themeColors = {
            ...currentColors,
            primary: updates['theme_color_primary'] ?? currentColors.primary,
            secondary: updates['theme_color_secondary'] ?? currentColors.secondary,
            text: updates['theme_color_text'] ?? currentColors.text,
            accent: updates['theme_color_accent'] ?? currentColors.accent,
            bgStart: updates['theme_background_start'] ?? currentColors.bgStart,
            bgEnd: updates['theme_background_end'] ?? currentColors.bgEnd,
            hero: updates['theme_hero'] ?? currentColors.hero,
            surface: updates['theme_surface'] ?? currentColors.surface,
            opacity: updates['theme_pattern_opacity'] ?? currentColors.opacity,
            headerBg: updates['theme_header_bg'] ?? currentColors.headerBg,
            footerBg: updates['theme_footer_bg'] ?? currentColors.footerBg,
        };

        await (supabase as any)
            .from('tenants')
            .update({ theme_colors: themeColors })
            .eq('id', tenant_id);

        // Audit log
        await createAuditLog({
            user,
            action: 'settings_change',
            tableName: 'site_settings',
            newData: { ...updates, _context: 'theme_update', tenant_id },
        });

        // Invalidate cache của đúng tenant
        // Bằng cách gọi revalidateTenantLayout, ta đảm bảo NÂNG CAO TUYỆT ĐỐI cache
        // của mọi Domain và Subdomain của chi nhánh này đều bị dọn sạch.
        await revalidateTenantLayout(tenant_id, ['site_settings']);

        return { success: true };
    } catch (error: any) {
        if (error.name === 'UnauthorizedError') {
            return { success: false, error: 'Không có quyền truy cập.' };
        }
        console.error('updateThemeSettings error:', error);
        return { success: false, error: error.message || 'Có lỗi xảy ra' };
    }
}
