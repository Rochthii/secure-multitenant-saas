import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getUserContext } from '@/lib/permissions';

/**
 * GET /api/admin/benchmark-debug
 * Kiểm tra xem RPC measure_db_rls_join/claims có tồn tại và bảng benchmark có đủ dữ liệu không.
 * Chỉ super_admin mới có thể gọi.
 */
export async function GET(req: NextRequest) {
    const ctx = await getUserContext();
    if (!ctx || ctx.role !== 'super_admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createAdminClient();
    // Dùng unknown cast vì benchmark_legacy, benchmark_jwt và measure_db_rls_* chưa có trong Supabase type-gen
    // (các bảng/RPC này tồn tại trên DB nhưng chưa được chạy supabase gen types)
    const db = supabase as unknown as {
        rpc: (fn: string, params?: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string; hint?: string } | null }>;
        from: (table: string) => { select: (cols: string, opts?: Record<string, unknown>) => Promise<{ count: number | null; error: { message: string } | null }> };
    };

    const report: Record<string, unknown> = {};

    // Test 1: measure_db_rls_join với 100 dòng
    const { data: joinData, error: joinErr } = await db.rpc('measure_db_rls_join', { limit_count: 100 });
    report.rpc_join = {
        exists: !joinErr,
        value_ms: joinData,
        error: joinErr?.message ?? null,
        hint: joinErr?.hint ?? null,
    };

    // Test 2: measure_db_rls_claims với 100 dòng
    const { data: claimsData, error: claimsErr } = await db.rpc('measure_db_rls_claims', { limit_count: 100 });
    report.rpc_claims = {
        exists: !claimsErr,
        value_ms: claimsData,
        error: claimsErr?.message ?? null,
        hint: claimsErr?.hint ?? null,
    };

    // Test 3: Đếm dòng trong bảng benchmark_legacy
    const { count: legacyCount, error: legacyErr } = await db
        .from('benchmark_legacy')
        .select('*', { count: 'exact', head: true });
    report.table_benchmark_legacy = {
        row_count: legacyCount,
        error: legacyErr?.message ?? null,
    };

    // Test 4: Đếm dòng trong bảng benchmark_jwt
    const { count: jwtCount, error: jwtErr } = await db
        .from('benchmark_jwt')
        .select('*', { count: 'exact', head: true });
    report.table_benchmark_jwt = {
        row_count: jwtCount,
        error: jwtErr?.message ?? null,
    };

    // Chẩn đoán tự động
    const diagnosis: string[] = [];
    if (joinErr) diagnosis.push('❌ RPC measure_db_rls_join KHÔNG TỒN TẠI → cần chạy migration 20260531090000');
    else if (Number(joinData) === 0) diagnosis.push('⚠️ RPC join tồn tại nhưng trả về 0ms → bảng trống hoặc không match tenant');
    else diagnosis.push(`✅ RPC join hoạt động đúng: ${joinData}ms`);

    if (claimsErr) diagnosis.push('❌ RPC measure_db_rls_claims KHÔNG TỒN TẠI → cần chạy migration 20260531090000');
    else if (Number(claimsData) === 0) diagnosis.push('⚠️ RPC claims tồn tại nhưng trả về 0ms → bảng trống hoặc không match tenant');
    else diagnosis.push(`✅ RPC claims hoạt động đúng: ${claimsData}ms`);

    if ((legacyCount ?? 0) < 1000) diagnosis.push(`⚠️ benchmark_legacy chỉ có ${legacyCount ?? 0} dòng → cần seed ≥ 100k`);
    else diagnosis.push(`✅ benchmark_legacy: ${legacyCount} dòng`);

    if ((jwtCount ?? 0) < 1000) diagnosis.push(`⚠️ benchmark_jwt chỉ có ${jwtCount ?? 0} dòng → cần seed ≥ 100k`);
    else diagnosis.push(`✅ benchmark_jwt: ${jwtCount} dòng`);

    report.diagnosis = diagnosis;

    return NextResponse.json(report, { status: 200 });
}
