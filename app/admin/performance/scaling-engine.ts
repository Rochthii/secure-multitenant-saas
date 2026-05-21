/**
 * Scaling Benchmark Engine
 * Mục đích: Đo lường Latency khi Dataset tăng trưởng (1k -> 10k -> 100k)
 */
export type BenchmarkResult = {
    datasetSize: number;
    appFilterMs: number;
    rlsJoinMs: number;
    rlsClaimsMs: number; // Mục tiêu O(1)
};

export async function runScalingBenchmark(supabase: any): Promise<BenchmarkResult[]> {
    const sizes = [1000, 10000, 100000];
    const results: BenchmarkResult[] = [];

    for (const size of sizes) {
        // 1. Giả lập App-side filtering (Fetch hết rồi filter trong JS)
        // Lưu ý: Trong thực tế ta chỉ fetch top [size] để so sánh latency
        const startApp = performance.now();
        const { data: allData } = await supabase.from('audit_logs').select('*').limit(size);
        // Giả lập filter logic
        const filtered = allData?.filter((i: any) => i.tenant_id === 'some-id');
        const endApp = performance.now();

        // 2. RLS truyền thống (Sử dụng JOIN/Subquery trong DB)
        // Chúng ta gọi một RPC hoặc Query mà DB buộc phải JOIN để check quyền
        const startJoin = performance.now();
        await supabase.rpc('benchmark_rls_join', { limit_count: size });
        const endJoin = performance.now();

        // 3. RLS Tối ưu (Sử dụng JWT Custom Claims - O(1))
        const startClaims = performance.now();
        await supabase.rpc('benchmark_rls_claims', { limit_count: size });
        const endClaims = performance.now();

        results.push({
            datasetSize: size,
            appFilterMs: endApp - startApp,
            rlsJoinMs: endJoin - startJoin,
            rlsClaimsMs: endClaims - startClaims
        });
    }

    return results;
}

/**
 * SQL hỗ trợ (Cần chạy trong Supabase SQL Editor)
 * 
 * CREATE OR REPLACE FUNCTION benchmark_rls_join(limit_count int) 
 * RETURNS SETOF audit_logs AS $$
 * BEGIN
 *   -- Giả lập truy vấn buộc phải JOIN với bảng tenants/roles
 *   RETURN QUERY SELECT al.* FROM audit_logs al 
 *   JOIN tenants t ON al.tenant_id = t.id WHERE t.status = 'active' LIMIT limit_count;
 * END; $$ LANGUAGE plpgsql;
 * 
 * CREATE OR REPLACE FUNCTION benchmark_rls_claims(limit_count int) 
 * RETURNS SETOF audit_logs AS $$
 * BEGIN
 *   -- Giả lập truy vấn sử dụng claim có sẵn trong session (không JOIN)
 *   RETURN QUERY SELECT * FROM audit_logs 
 *   WHERE tenant_id = auth.jwt()->>'tenant_id'::uuid LIMIT limit_count;
 * END; $$ LANGUAGE plpgsql;
 */