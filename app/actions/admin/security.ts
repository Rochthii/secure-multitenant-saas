'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { requirePermission, getUserContext } from '@/lib/permissions';
import { redisClient } from '@/lib/security/redis-client';
import { revalidatePath } from 'next/cache';

/**
 * Server Action chặn địa chỉ IP thủ công
 */
export async function blockIpAction(
    ip: string,
    tenantId: string,
    durationHours: number,
    reason: string
) {
    try {
        const user = await requireAdmin();
        await requirePermission('settings', 'update'); // Quản lý an ninh yêu cầu quyền settings update
        
        const context = await getUserContext();
        if (!context) {
            return { success: false, error: 'Unauthorized: Phiên làm việc không hợp lệ.' };
        }

        // Kiểm tra phân quyền: Chỉ super_admin/company_editor hoặc tenant_admin của đúng chi nhánh
        if (!['super_admin', 'company_editor'].includes(context.role)) {
            if (context.tenantId !== tenantId || context.role !== 'tenant_admin') {
                return { success: false, error: 'Unauthorized: Bạn không có quyền quản lý cấu hình an ninh của chi nhánh này.' };
            }
        }

        const supabase = await createClient();
        
        // Gọi RPC block_ip trong database
        const { error } = await (supabase as any).rpc('block_ip', {
            p_ip: ip,
            p_tenant_id: tenantId,
            p_duration_hours: durationHours,
            p_reason: reason,
            p_admin_email: user.email || 'admin@system.security'
        });

        if (error) {
            console.error('[SOC Action] Lỗi block_ip RPC:', error);
            return { success: false, error: error.message };
        }

        // ĐỒNG BỘ CACHE EDGE: Xóa ngay cache IP chặn trên Redis
        const redisKey = `blocklist:${ip}`;
        await redisClient.del(redisKey);
        console.log(`[SOC Action] Đã xóa cache Redis cho IP bị chặn: ${ip}`);

        revalidatePath('/admin/security');
        return { success: true };
    } catch (err: any) {
        console.error('[SOC Action] Lỗi hệ thống blockIpAction:', err);
        return { success: false, error: err?.message || 'Lỗi xử lý hệ thống.' };
    }
}

/**
 * Server Action mở khóa địa chỉ IP thủ công
 */
export async function unblockIpAction(ip: string, tenantId: string) {
    try {
        const user = await requireAdmin();
        await requirePermission('settings', 'update');

        const context = await getUserContext();
        if (!context) {
            return { success: false, error: 'Unauthorized: Phiên làm việc không hợp lệ.' };
        }

        if (!['super_admin', 'company_editor'].includes(context.role)) {
            if (context.tenantId !== tenantId || context.role !== 'tenant_admin') {
                return { success: false, error: 'Unauthorized: Bạn không có quyền quản lý cấu hình an ninh của chi nhánh này.' };
            }
        }

        const supabase = await createClient();

        // Gọi RPC unblock_ip trong database
        const { error } = await (supabase as any).rpc('unblock_ip', {
            p_ip: ip,
            p_tenant_id: tenantId,
            p_admin_email: user.email || 'admin@system.security'
        });

        if (error) {
            console.error('[SOC Action] Lỗi unblock_ip RPC:', error);
            return { success: false, error: error.message };
        }

        // ĐỒNG BỘ CACHE EDGE: Xóa ngay cache IP chặn trên Redis (hoặc gán false để Negative Cache)
        const redisKey = `blocklist:${ip}`;
        await redisClient.del(redisKey);
        console.log(`[SOC Action] Đã xóa cache Redis cho IP được mở chặn: ${ip}`);

        revalidatePath('/admin/security');
        return { success: true };
    } catch (err: any) {
        console.error('[SOC Action] Lỗi hệ thống unblockIpAction:', err);
        return { success: false, error: err?.message || 'Lỗi xử lý hệ thống.' };
    }
}
