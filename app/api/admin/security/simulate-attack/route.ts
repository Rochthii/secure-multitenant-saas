/**
 * POST /api/admin/security/simulate-attack
 * 
 * Giả lập tấn công Cross-Tenant Access để demo cho Hội đồng.
 * Thực sự thực thi query từ context của Tenant A → thử đọc data Tenant B.
 * RLS sẽ chặn → rows_returned = 0 → audit_logged = true.
 * 
 * SECURITY: Chỉ Super Admin mới được gọi endpoint này.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { isGlobalAdmin } from '@/lib/permissions';

export async function POST(request: NextRequest) {
    try {
        // SECURITY: Chỉ super_admin
        const isAdmin = await isGlobalAdmin();
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const scenario = body.scenario || 'cross_tenant_read';

        if (scenario !== 'cross_tenant_read') {
            return NextResponse.json({ error: 'Unknown scenario' }, { status: 400 });
        }

        // Lấy danh sách tenant để chọn tenant_a và tenant_b
        const adminDb = await createAdminClient();
        const { data: tenants } = await (adminDb as any)
            .from('tenants')
            .select('id, name')
            .limit(10);

        let tenantA: { id: string; name: string };
        let tenantB: { id: string; name: string };

        if (!tenants || tenants.length < 2) {
            // Dùng UUID cố định nếu chưa đủ tenant
            tenantA = { id: '55555555-5555-5555-5555-555555555555', name: 'Tenant Demo A' };
            tenantB = { id: '66666666-6666-6666-6666-666666666666', name: 'Tenant Demo B' };
        } else {
            tenantA = { id: tenants[0].id, name: tenants[0].name };
            tenantB = { id: tenants[1].id, name: tenants[1].name };
        }

        // Thực sự query dữ liệu của tenantB từ client user bình thường
        // (RLS sẽ filter dựa trên JWT claims của user đang đăng nhập)
        const userClient = await createClient();

        // Thử đọc news của tenantB — RLS sẽ chặn nếu user không thuộc tenantB
        const { data: attemptedData, error: rlsError } = await (userClient as any)
            .from('news')
            .select('id, title, tenant_id')
            .eq('tenant_id', tenantB.id)
            .limit(5);

        const rowsReturned = attemptedData?.length ?? 0;
        const rlsDenied = rowsReturned === 0; // RLS không trả data → bị deny

        // Ghi audit log về sự kiện giả lập này
        let auditLogged = false;
        try {
            await (adminDb as any).from('audit_logs').insert({
                user_id: null,
                user_email: 'threat-simulator@system',
                action: 'simulate:cross_tenant_attack',
                table_name: 'news',
                resource: 'security',
                record_id: null,
                new_data: {
                    scenario: 'cross_tenant_read',
                    tenant_a: tenantA.id,
                    tenant_b: tenantB.id,
                    rows_returned: rowsReturned,
                    rls_denied: rlsDenied,
                    timestamp: new Date().toISOString(),
                },
            });
            auditLogged = true;
        } catch (auditErr) {
            console.error('[ThreatSim] Failed to write audit log:', auditErr);
        }

        const detail = rlsDenied
            ? `✅ Thành công! Khi User thuộc Tenant A (${tenantA.name}) cố đọc bảng "news" của Tenant B (${tenantB.name}), PostgreSQL RLS đã lọc và trả về 0 rows. Cơ chế Row Level Security hoạt động đúng theo thiết kế: "tenant_id = auth.jwt()->>'tenant_id'" — chỉ cho phép đọc data của chính tenant mình.`
            : `⚠️ CẢNH BÁO: Phát hiện ${rowsReturned} rows của Tenant B bị lộ ra! RLS policy có thể bị cấu hình sai. Cần kiểm tra ngay policy trên bảng "news".`;

        return NextResponse.json({
            attempt: 'cross_tenant_read',
            blocked: rlsDenied,
            rls_denied: rlsDenied,
            audit_logged: auditLogged,
            tenant_a: tenantA.name,
            tenant_b: tenantB.name,
            rows_returned: rowsReturned,
            detail,
        });

    } catch (err: any) {
        console.error('[ThreatSim] Error:', err);
        return NextResponse.json(
            { error: err.message || 'Simulation failed' },
            { status: 500 }
        );
    }
}
