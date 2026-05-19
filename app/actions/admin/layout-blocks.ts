'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requirePermission, requireTenantAccess, requireSuperAdmin, getUserContext } from '@/lib/permissions';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAuditLog } from '@/lib/audit';
import { BlockConfig, DEFAULT_LAYOUT_BLOCKS } from '@/lib/types/layout-blocks';

/**
 * Lấy layout_blocks của một tenant từ DB.
 * Trả về DEFAULT_LAYOUT_BLOCKS nếu tenant chưa có cấu hình.
 */
export async function getLayoutBlocks(tenantId: string): Promise<BlockConfig[]> {
    const supabase = await createClient();

    const { data, error } = await (supabase as any)
        .from('tenants')
        .select('layout_blocks')
        .eq('id', tenantId)
        .single();

    if (error || !data?.layout_blocks) {
        return DEFAULT_LAYOUT_BLOCKS;
    }

    // Return the exactly saved blocks from DB.
    // If we merge with DEFAULT_LAYOUT_BLOCKS, we break the user's ability
    // to permanently remove a block or save specific settings without it being overwritten.
    return data.layout_blocks as BlockConfig[];
}

import { revalidateTenantHomepage } from '@/lib/cache/revalidate';

/**
 * Lưu layout_blocks mới vào DB và revalidate trang chủ của tenant.
 */
export async function saveLayoutBlocks(
    tenantId: string,
    blocks: BlockConfig[]
): Promise<{ success: boolean; error?: string }> {
    try {
        // Sử dụng requireSuperAdmin từ lib/permissions (Ma trận quyền)
        await requireSuperAdmin();
        const ctx = await getUserContext();
        if (!ctx) return { success: false, error: 'Unauthorized' };
        
        const user = { id: ctx.userId, app_metadata: { role: ctx.role } } as any;
        await requireTenantAccess(tenantId);

        const supabase = await createClient();

        const { data: tenant } = await (supabase as any)
            .from('tenants')
            .select('id, domain, layout_blocks')
            .eq('id', tenantId)
            .single();

        if (!tenant) return { success: false, error: 'Không tìm thấy chi nhánh' };

        const { error, count } = await (supabase as any)
            .from('tenants')
            .update({ layout_blocks: blocks })
            .eq('id', tenantId)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('[saveLayoutBlocks] Error:', error);
            return { success: false, error: error.message };
        }

        if (count === 0) {
            console.error('[saveLayoutBlocks] Zero rows affected. RLS may be blocking update.');
            return { success: false, error: 'Bạn không có quyền cập nhật thông tin này (RLS)' };
        }

        await createAuditLog({
            user,
            action: 'update',
            tableName: 'tenants',
            recordId: tenantId,
            oldData: { layout_blocks: tenant.layout_blocks },
            newData: { layout_blocks: blocks },
        });

        // Revalidate các cache liên quan đến homepage
        // Cực kỳ tiết kiệm CPU: Gọi hàm tiện ích xóa HTML gốc trang chủ + data tags 
        await revalidateTenantHomepage(tenantId, [
            'tenant-config', 
            'site_settings', 
            `hero-slides-${tenantId}`,
            `hero-slides-all`
        ]);

        // 3. Revalidate đường dẫn admin
        revalidatePath(`/admin/t/${tenantId}/homepage`);

        return { success: true };
    } catch (err: any) {
        console.error('[saveLayoutBlocks] Exception:', err);
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}
