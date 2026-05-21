/**
 * GET /api/admin/backup-history
 *
 * Trả về lịch sử các lần backup tự động (cron) từ bảng cron_job_logs.
 * Lọc những job có job_name LIKE '%backup%', ORDER BY executed_at DESC LIMIT 10.
 *
 * SECURITY: Chỉ super_admin / global admin mới có quyền xem.
 * Sử dụng createAdminClient để đọc cron_job_logs (bảng có RLS chỉ service_role).
 */
import { NextResponse } from 'next/server';
import { getUserContext } from '@/lib/permissions';
import { createAdminClient } from '@/lib/supabase/server';

const GLOBAL_ADMIN_ROLES = ['super_admin', 'company_editor', 'admin', 'agency_admin'];

export async function GET() {
    try {
        // 1. Xác thực quyền
        const ctx = await getUserContext();
        if (!ctx) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (!GLOBAL_ADMIN_ROLES.includes(ctx.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. Query cron_job_logs với admin client (bypass RLS)
        const adminDb = await createAdminClient();
        const { data, error } = await (adminDb as any)
            .from('cron_job_logs')
            .select('id, job_name, status, message, metadata, duration_ms, executed_at')
            .ilike('job_name', '%backup%')
            .order('executed_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('[backup-history] DB error:', error.message);
            return NextResponse.json({ error: 'Không thể lấy lịch sử backup' }, { status: 500 });
        }

        return NextResponse.json(data ?? []);
    } catch (err: any) {
        console.error('[backup-history] Unexpected error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
