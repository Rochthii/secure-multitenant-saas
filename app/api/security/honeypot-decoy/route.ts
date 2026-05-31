import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        // Nhận dạng IP thực tế của khách truy cập (chống spoofing)
        const clientIp = (request as any).ip || 
                         request.headers.get('x-vercel-forwarded-for')?.split(',')[0] || 
                         request.headers.get('x-forwarded-for')?.split(',')[0] || 
                         request.headers.get('x-real-ip') || 
                         '127.0.0.1';

        const userAgent = request.headers.get('user-agent') || 'Unknown Scanner / Custom Exploit Script';

        const supabase = await createAdminClient();

        // Lấy Tenant đầu tiên trong DB để gán thử nghiệm
        const { data: tenants } = await (supabase as any).from('tenants').select('id').limit(1);
        if (!tenants || tenants.length === 0) {
            return NextResponse.json({ error: 'Không tìm thấy Tenant nào trong hệ thống.' }, { status: 404 });
        }
        const tenantId = tenants[0].id;

        // 1. Chèn log cảnh báo vi phạm cực kỳ nghiêm trọng
        const { error: logError } = await (supabase as any).from('audit_logs').insert({
            tenant_id: tenantId,
            user_email: 'anonymous-hacker@honeypot.ptit',
            action: 'honeypot_decoy_triggered',
            table_name: 'sensitive_financial_decoy',
            record_id: 'honeypot-decoy-trap',
            ip_address: clientIp,
            user_agent: userAgent,
            details: {
                reason: 'Tác nhân xâm nhập sập bẫy Honeypot mật ngọt. Truy cập trái phép tài nguyên giả lập hệ thống tối mật.',
                target_resource: '/api/security/honeypot-decoy',
                exploit_attempted: 'Reconnaissance / Probe / Directory Enumeration',
                severity: 'CRITICAL',
                certainty_score: 1.0
            },
            severity: 'CRITICAL',
            risk_score: 100
        });

        if (logError) {
            console.error('[Honeypot Decoy] Lỗi ghi log:', logError);
            return NextResponse.json({ error: logError.message }, { status: 500 });
        }

        // 2. Gọi trực tiếp RPC block_ip để kích hoạt Edge Block mà không cần qua đếm ngưỡng
        const { error: blockError } = await (supabase as any).rpc('block_ip', {
            p_ip: clientIp,
            p_tenant_id: tenantId,
            p_duration_hours: 24,
            p_reason: 'Tự động chặn tức thì bởi SOAR do sập bẫy Honeypot Decoy chủ động.',
            p_admin_email: 'soar@system.security'
        });

        if (blockError) {
            console.error('[Honeypot Decoy] Lỗi thực thi block_ip RPC:', blockError);
            return NextResponse.json({ error: blockError.message }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            clientIp, 
            action: 'honeypot_decoy_triggered',
            blocked: true
        });
    } catch (err: any) {
        console.error('[Honeypot Decoy] Lỗi hệ thống:', err);
        return NextResponse.json({ error: err?.message || 'Lỗi xử lý máy chủ.' }, { status: 500 });
    }
}
