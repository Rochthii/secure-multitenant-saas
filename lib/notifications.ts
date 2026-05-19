import { createAdminClient } from '@/lib/supabase/server';
import { sendNotification as sendFCM } from '@/lib/fcm-edge';

/**
 * Lấy danh sách FCM tokens có lọc theo tenant_id.
 *
 * Logic:
 *  - Lấy user_id từ user_roles WHERE tenant_id = tenantId (hoặc tất cả nếu global)
 *  - Join với fcm_tokens theo user_id
 *  - Chỉ gửi notification đến đúng admin/editor của chi nhánh đó
 *
 * @param tenantId - nếu null → global (super_admin scope, gửi tất cả)
 */
async function fetchTokensForTenant(tenantId: string | null): Promise<string[]> {
    const supabase = await createAdminClient();

    // Lấy FCM tokens join qua user_roles để filter theo tenant
    let query = (supabase as any)
        .from('fcm_tokens')
        .select('token, user_roles!inner(tenant_id, role)');

    if (tenantId) {
        // Chỉ lấy tokens của admin/editor thuộc đúng chi nhánh này
        query = query.eq('user_roles.tenant_id', tenantId);
    }
    // Nếu tenantId = null → global scope, lấy tất cả (chỉ dùng cho super_admin context)

    const { data, error } = await query;

    if (error) {
        console.error('[Notifications] fetchTokensForTenant error:', error.message);
        return [];
    }

    return (data as any[])?.map((row: any) => row.token).filter(Boolean) ?? [];
}

/**
 * Gửi push notification đến tất cả admin của một chi nhánh cụ thể.
 *
 * QUAN TRỌNG: tenantId là bắt buộc — tránh broadcast cross-tenant.
 */
export async function notifyTenantAdmins(
    tenantId: string,
    { title, body, url }: { title: string; body: string; url?: string }
): Promise<void> {
    try {
        const tokens = await fetchTokensForTenant(tenantId);

        if (tokens.length === 0) {
            console.info('[Notifications] No tokens found for tenant:', tenantId);
            return;
        }

        await sendFCM({ title, body, tokens, url });
    } catch (error) {
        console.error('[Notifications] notifyTenantAdmins error:', error);
    }
}

/**
 * Gửi push notification đến tất cả super_admin / global admins.
 * Chỉ dùng trong context super_admin (backup alerts, system events, v.v.)
 */
export async function notifyGlobalAdmins(
    { title, body, url }: { title: string; body: string; url?: string }
): Promise<void> {
    try {
        const supabase = await createAdminClient();

        // Chỉ lấy tokens của super_admin / company_editor
        const { data, error } = await (supabase as any)
            .from('fcm_tokens')
            .select('token, user_roles!inner(role)')
            .in('user_roles.role', ['super_admin', 'company_editor']);

        if (error) {
            console.error('[Notifications] notifyGlobalAdmins error:', error.message);
            return;
        }

        const tokens = (data as any[])?.map((row: any) => row.token).filter(Boolean) ?? [];

        if (tokens.length === 0) return;

        await sendFCM({ title, body, tokens, url });
    } catch (error) {
        console.error('[Notifications] notifyGlobalAdmins error:', error);
    }
}

// ─── Legacy aliases — deprecated, sẽ xóa sau khi migrate hết caller ──────────

/** @deprecated Dùng notifyTenantAdmins(tenantId, ...) thay thế */
export async function notifyAdmins({ title, body, url }: { title: string; body: string; url?: string }): Promise<void> {
    console.warn('[Notifications] notifyAdmins() is deprecated and UNSAFE (no tenant filter). Use notifyTenantAdmins() instead.');
    await notifyGlobalAdmins({ title, body, url });
}

/** @deprecated Dùng notifyTenantAdmins(tenantId, ...) thay thế */
export async function notifyAllUsers({ title, body, url }: { title: string; body: string; url?: string }): Promise<void> {
    console.warn('[Notifications] notifyAllUsers() is deprecated and UNSAFE (no tenant filter). Use notifyTenantAdmins() instead.');
    await notifyGlobalAdmins({ title, body, url });
}
