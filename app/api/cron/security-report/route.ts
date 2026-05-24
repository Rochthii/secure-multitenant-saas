import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { generateAndSendSecurityPDFReport } from '@/lib/security/telegram-report-service';

// Cron job: Tự động gửi báo cáo an ninh PDF định kỳ (Vercel Cron chạy mỗi ngày lúc 00:00)
// Security: Authorization: Bearer CRON_SECRET

export async function POST(request: NextRequest) {
    const startTime = Date.now();
    let logId: string | null = null;
    const supabase = await createAdminClient();

    // 1. Xác thực bảo mật Cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        console.error('[security-report-cron] Unauthorized attempt');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 2. Xác định loại báo cáo cần chạy dựa trên ngày hoặc tham số
        const searchParams = request.nextUrl.searchParams;
        const manualType = searchParams.get('type') as 'daily' | 'weekly' | 'monthly' | null;

        const today = new Date();
        const isMonday = today.getDay() === 1;
        const isFirstOfMonth = today.getDate() === 1;

        const typesToGenerate: ('daily' | 'weekly' | 'monthly')[] = [];
        
        if (manualType) {
            typesToGenerate.push(manualType);
        } else {
            // Mặc định: Luôn gửi báo cáo Daily mỗi ngày
            typesToGenerate.push('daily');
            
            // Thứ Hai hàng tuần gửi thêm báo cáo Weekly
            if (isMonday) {
                typesToGenerate.push('weekly');
            }
            
            // Ngày 1 hàng tháng gửi thêm báo cáo Monthly
            if (isFirstOfMonth) {
                typesToGenerate.push('monthly');
            }
        }

        // 3. Lấy tất cả các chi nhánh (tenants) đang hoạt động + Global (null)
        const { data: tenants } = await supabase.from('tenants').select('id, name');
        const activeTenants = tenants || [];

        // Lập danh sách các lượt cần xuất báo cáo
        const runs: { tenantId: string | null, tenantName: string, type: 'daily' | 'weekly' | 'monthly' }[] = [];
        
        for (const type of typesToGenerate) {
            // Lượt Global
            runs.push({ tenantId: null, tenantName: 'Hệ thống Trung tâm', type });
            
            // Lượt cho từng chi nhánh
            for (const t of activeTenants) {
                runs.push({ tenantId: t.id, tenantName: t.name, type });
            }
        }

        // 4. Ghi log cron job bắt đầu chạy
        const { data: logEntry } = await supabase.from('cron_job_logs').insert({
            job_name: 'security-report-cron',
            status: 'running',
            message: `Bắt đầu gửi tự động ${runs.length} báo cáo an ninh định kỳ...`,
            metadata: { 
                runs_count: runs.length, 
                types: typesToGenerate, 
                triggered_at: new Date().toISOString() 
            },
        }).select('id').single();
        logId = logEntry?.id ?? null;

        console.log(`[security-report-cron] Triggered for ${runs.length} report tasks...`);

        // 5. Chạy tuần tự và lưu kết quả
        const successRuns: any[] = [];
        const failedRuns: any[] = [];

        for (const run of runs) {
            try {
                console.log(`[security-report-cron] Executing ${run.type} report for: ${run.tenantName}...`);
                const result = await generateAndSendSecurityPDFReport(run.tenantId, run.type);
                
                successRuns.push({
                    tenantId: run.tenantId,
                    tenantName: run.tenantName,
                    type: run.type,
                    fileName: result.fileName
                });
            } catch (err: any) {
                console.error(`[security-report-cron] Failed for ${run.tenantName} (${run.type}):`, err);
                failedRuns.push({
                    tenantId: run.tenantId,
                    tenantName: run.tenantName,
                    type: run.type,
                    error: err.message || String(err)
                });
            }
        }

        // 6. Ghi audit log hệ thống
        await supabase.from('audit_logs').insert({
            user_id: null,
            user_email: 'system@cron',
            action: 'auto_report_dispatch',
            resource: 'security_report',
            table_name: 'audit_logs',
            record_id: null,
            new_data: {
                success_count: successRuns.length,
                failed_count: failedRuns.length,
                total_runs: runs.length,
                types: typesToGenerate
            },
            created_at: new Date().toISOString()
        });

        // 7. Cập nhật trạng thái cron logs
        if (logId) {
            await supabase.from('cron_job_logs').update({
                status: failedRuns.length === 0 ? 'success' : 'failed',
                message: `Đã tự động gửi thành công ${successRuns.length}/${runs.length} báo cáo. Lỗi: ${failedRuns.length} báo cáo.`,
                duration_ms: Date.now() - startTime,
                metadata: {
                    success: successRuns,
                    failures: failedRuns
                }
            }).eq('id', logId);
        }

        return NextResponse.json({
            success: failedRuns.length === 0,
            total: runs.length,
            successCount: successRuns.length,
            failedCount: failedRuns.length,
            successRuns,
            failedRuns: failedRuns.length > 0 ? failedRuns : undefined
        });

    } catch (error: any) {
        console.error('[security-report-cron] Crash error:', error);
        
        if (logId) {
            try {
                await supabase.from('cron_job_logs').update({
                    status: 'failed',
                    message: error.message || String(error),
                    duration_ms: Date.now() - startTime
                }).eq('id', logId);
            } catch (_) {}
        }

        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message || String(error) },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    return POST(request);
}
