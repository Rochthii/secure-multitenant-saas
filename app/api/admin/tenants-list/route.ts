/**
 * GET /api/admin/tenants-list
 * 
 * Trả về danh sách tenants {id, name}[] để dùng cho filter trong export backup.
 * Chỉ super_admin mới có quyền gọi API này.
 * 
 * SECURITY: Sử dụng createAdminClient (service_role) sau khi đã verify JWT.
 */
import { NextResponse } from 'next/server';
import { getUserContext } from '@/lib/permissions';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        // 1. Xác thực người dùng — chỉ super_admin mới được gọi
        const ctx = await getUserContext();
        if (!ctx) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (ctx.role !== 'super_admin') {
            return NextResponse.json({ error: 'Forbidden: Chỉ super_admin mới có quyền truy cập' }, { status: 403 });
        }

        // 2. Dùng admin client để bypass RLS và lấy danh sách tenants
        const adminDb = await createAdminClient();
        const { data, error } = await (adminDb as any)
            .from('tenants')
            .select('id, name')
            .order('name', { ascending: true });

        if (error) {
            console.error('[tenants-list] DB error:', error.message);
            return NextResponse.json({ error: 'Không thể lấy danh sách tenant' }, { status: 500 });
        }

        return NextResponse.json(data ?? []);
    } catch (err: any) {
        console.error('[tenants-list] Unexpected error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
