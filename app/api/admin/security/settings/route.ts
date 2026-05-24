import { NextRequest, NextResponse } from 'next/server';
import { isGlobalAdmin } from '@/lib/permissions';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Xác thực quyền Admin hệ thống
        const hasAccess = await isGlobalAdmin();
        if (!hasAccess) {
            return NextResponse.json({ error: 'Unauthorized. Access denied.' }, { status: 401 });
        }

        // 2. Đọc trạng thái từ bảng settings
        const supabase = (await createAdminClient()) as any;
        const { data } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'auto_defense')
            .maybeSingle();

        const isEnabled = data?.value === 'true';
        return NextResponse.json({ autoDefense: isEnabled });

    } catch (error: any) {
        console.error('[Security Settings GET] Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // 1. Xác thực quyền Admin hệ thống
        const hasAccess = await isGlobalAdmin();
        if (!hasAccess) {
            return NextResponse.json({ error: 'Unauthorized. Access denied.' }, { status: 401 });
        }

        // 2. Lấy tham số cấu hình
        const body = await request.json().catch(() => ({}));
        const autoDefense = body.autoDefense === true;

        const supabase = (await createAdminClient()) as any;

        // 3. Upsert vào bảng settings
        const { error } = await supabase
            .from('settings')
            .upsert({ 
                key: 'auto_defense', 
                value: String(autoDefense) 
            }, { onConflict: 'key' });

        if (error) throw error;

        // 4. Ghi Audit Log bất biến vào bảng audit_logs phục vụ kiểm toán (Compliance)
        await supabase.from('audit_logs').insert({
            user_id: null,
            user_email: 'admin@system',
            action: 'toggle_auto_defense',
            resource: 'security_settings',
            table_name: 'settings',
            record_id: 'auto_defense',
            new_data: { auto_defense: autoDefense },
            created_at: new Date().toISOString()
        });

        console.log(`[Security Settings] Auto Defense successfully set to ${autoDefense} and logged.`);

        return NextResponse.json({ success: true, autoDefense });

    } catch (error: any) {
        console.error('[Security Settings POST] Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 });
    }
}
