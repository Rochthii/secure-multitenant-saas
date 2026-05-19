import { NextResponse } from 'next/server';
import { sendNotification } from '@/lib/fcm-edge';
import { createAdminClient } from '@/lib/supabase/server';
import { requireMinRole } from '@/lib/auth/require-admin';

/**
 * POST /api/notifications/send
 *
 * Gửi push notification đến admin/editor của một chi nhánh cụ thể.
 * Yêu cầu: Phải là super_admin hoặc admin của chi nhánh đó.
 *
 * Body:
 *   - title: string
 *   - body: string
 *   - tenantId: string  (bắt buộc — để filter đúng tenant)
 *   - tokens?: string[] (nếu truyền trực tiếp, bỏ qua DB lookup)
 *   - url?: string
 */
export async function POST(req: Request) {
    try {
        // Auth Guard — bắt buộc đăng nhập ít nhất là admin
        await requireMinRole('admin');

        const { title, body, tenantId, tokens, url } = await req.json();

        if (!title || !body) {
            return NextResponse.json(
                { error: 'title và body là bắt buộc' },
                { status: 400 }
            );
        }

        let targetTokens: string[] = tokens ?? [];

        // Nếu không truyền tokens trực tiếp → fetch từ DB có filter tenant
        if (targetTokens.length === 0) {
            const supabase = await createAdminClient();

            let query = (supabase as any)
                .from('fcm_tokens')
                .select('token, user_roles!inner(tenant_id, role)');

            if (tenantId) {
                // Gửi đến admin/editor của chi nhánh cụ thể
                query = query.eq('user_roles.tenant_id', tenantId);
            } else {
                // Không có tenantId → chỉ gửi đến super_admin (global context)
                query = query.in('user_roles.role', ['super_admin', 'company_editor']);
            }

            const { data: tokenData, error } = await query;

            if (error) {
                console.error('[Notifications API] DB error:', error.message);
                return NextResponse.json({ error: 'Không thể lấy danh sách thiết bị' }, { status: 500 });
            }

            targetTokens = (tokenData as any[])?.map((row: any) => row.token).filter(Boolean) ?? [];
        }

        if (targetTokens.length === 0) {
            return NextResponse.json({ success: true, message: 'Không có thiết bị nào để nhận thông báo' });
        }

        const response = await sendNotification({
            title,
            body,
            data: { url: url ?? '' },
            tokens: targetTokens,
        });

        if (!response.success) {
            return NextResponse.json({ error: response.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            successCount: response.successCount ?? 0,
            failureCount: response.failureCount ?? 0,
        });

    } catch (error: any) {
        if (error?.name === 'UnauthorizedError') {
            return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });
        }
        console.error('[Notifications API] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
