import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const { scenario } = await request.json();
        
        // Nhận dạng IP thực tế của khách truy cập (chống spoofing)
        const clientIp = (request as any).ip || 
                         request.headers.get('x-vercel-forwarded-for')?.split(',')[0] || 
                         request.headers.get('x-forwarded-for')?.split(',')[0] || 
                         request.headers.get('x-real-ip') || 
                         '127.0.0.1';

        const userAgent = request.headers.get('user-agent') || 'Council Portal Mobile';

        // Lấy Tenant đầu tiên trong DB để gán kiểm thử
        const supabase = await createAdminClient();
        const { data: tenants } = await (supabase as any).from('tenants').select('id').limit(1);
        if (!tenants || tenants.length === 0) {
            return NextResponse.json({ error: 'Không tìm thấy Tenant nào trong hệ thống.' }, { status: 404 });
        }
        const tenantId = tenants[0].id;

        let action = '';
        let details = {};

        if (scenario === 'sql') {
            action = 'sql_injection_attempt';
            details = {
                reason: "Tấn công chèn mã SQL Injection vào form tìm kiếm: ' OR 1=1 --",
                query: "SELECT * FROM news WHERE title = '' OR 1=1 --'",
                severity: "CRITICAL"
            };
        } else if (scenario === 'rls') {
            action = 'cross_tenant_violation';
            details = {
                reason: "Thực hiện truy cập chéo trái phép đặc quyền của Tenant khác.",
                target_tenant: "99999999-9999-9999-9999-999999999999",
                severity: "CRITICAL"
            };
        } else if (scenario === 'noisy') {
            action = 'cache_pollution_attempt';
            details = {
                reason: "Starvation attack! Gửi dồn dập 5 requests đồng thời làm quá tải connection limits.",
                concurrent_connections: 5,
                severity: "HIGH"
            };
        } else if (scenario === 'tamper') {
            action = 'audit_log_tampering_attempt';
            details = {
                reason: "Cố ý sửa đổi tệp tin audit log thô trong database để xóa dấu vết phá hoại.",
                tampered_record: "news_123",
                severity: "CRITICAL"
            };
        } else {
            return NextResponse.json({ error: 'Kịch bản tấn công không hợp lệ.' }, { status: 400 });
        }

        // Chèn log trực tiếp vào DB để kích hoạt trigger SOAR & CRS
        const { data, error } = await (supabase as any).from('audit_logs').insert({
            tenant_id: tenantId,
            user_email: 'anonymous-hacker@council.ptit',
            action: action,
            table_name: scenario === 'tamper' ? 'audit_logs' : 'news',
            record_id: 'council-mock-id',
            ip_address: clientIp,
            user_agent: userAgent,
            details: details,
            severity: scenario === 'noisy' ? 'HIGH' : 'CRITICAL'
        }).select();

        if (error) {
            console.error('[Council API] Lỗi ghi log an ninh:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, clientIp, action });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || 'Lỗi xử lý máy chủ.' }, { status: 500 });
    }
}
