import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getUserContext } from '@/lib/permissions';

/**
 * GET /api/admin/benchmark-debug
 * Kiểm tra xem RPC measure_db_rls_join và measure_db_rls_claims có tồn tại trên Supabase Cloud không.
 * Trả về kết quả test với limit_count = 100 (nhanh).
 * Chỉ super_admin mới có thể gọi.
 */
export async function GET(req: NextRequest) {
    const ctx = await getUserContext();
    if (!ctx || ctx.role !== 'super_admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createAdminClient();
    const report: Record<string, any> = {};

    // Test 1: measure_db_rls_join với 100 dòng
    const { data: joinData, error: joinErr } = await supabase.rpc('measure_db_rls_join', { limit_count: 100 });
    report.rpc_join = {
        exists: !joinErr,
        value_ms: joinData,
        error: joinErr?.message ?? null,
        hint: joinErr?.hint ?? null,
    };

    // Test 2: measure_db_rls_claims với 100 dòng
    const { data: claimsData, error: claimsErr } = await supabase.rpc('measure_db_rls_claims', { limit_count: 100 });
    report.rpc_claims = {
        exists: !claimsErr,
        value_ms: claimsData,
        error: claimsErr?.message ?? null,
        hint: claimsErr?.hint ?? null,
    };

    // Test 3: Đếm dòng trong bảng benchmark_legacy
    const { count: legacyCount, error: legacyErr } = await supabase
        .from('benchmark_legacy')
        .select('*', { count: 'exact', head: true });
    report.table_benchmark_legacy = {
        row_count: legacyCount,
        error: legacyErr?.message ?? null,
    };

    // Test 4: Đếm dòng trong bảng benchmark_jwt
    const { count: jwtCount, error: jwtErr } = await supabase
        .from('benchmark_jwt')
        .select('*', { count: 'exact', head: true });
    report.table_benchmark_jwt = {
        row_count: jwtCount,
        error: jwtErr?.message ?? null,
    };

    // Chẩn đoán
    report.diagnosis = [];
    if (joinErr) report.diagnosis.push('❌ RPC measure_db_rls_join KHÔNG TỒN TẠI → cần chạy migration 20260531090000');
    else if (Number(joinData) === 0) report.diagnosis.push('⚠️ RPC join tồn tại nhưng trả về 0ms → bảng trống hoặc không có dữ liệu match');
    else report.diagnosis.push(`✅ RPC join hoạt động đúng: ${joinData}ms`);

    if (claimsErr) report.diagnosis.push('❌ RPC measure_db_rls_claims KHÔNG TỒN TẠI → cần chạy migration 20260531090000');
    else if (Number(claimsData) === 0) report.diagnosis.push('⚠️ RPC claims tồn tại nhưng trả về 0ms → bảng trống hoặc không có dữ liệu match');
    else report.diagnosis.push(`✅ RPC claims hoạt động đúng: ${claimsData}ms`);

    if ((legacyCount ?? 0) < 1000) report.diagnosis.push(`⚠️ benchmark_legacy chỉ có ${legacyCount} dòng → cần seed thêm để benchmark có ý nghĩa`);
    if ((jwtCount ?? 0) < 1000) report.diagnosis.push(`⚠️ benchmark_jwt chỉ có ${jwtCount} dòng → cần seed thêm`);

    return NextResponse.json(report, { status: 200 });
}
