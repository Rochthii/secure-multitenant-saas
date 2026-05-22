/**
 * Scaling Benchmark Engine — Chương 5 Đồ án Tốt nghiệp PTIT
 * Mục đích: Đo lường Latency so sánh 3 baseline lọc dữ liệu khi Dataset tăng trưởng:
 *   (1) App-side Filtering   — Fetch hết dữ liệu rồi lọc trong JavaScript → O(N) tệ nhất
 *   (2) Legacy RLS JOIN      — DB phải JOIN bảng để kiểm tra quyền → O(N) tốt hơn nhưng vẫn chậm
 *   (3) JWT Claims RLS       — Đọc trực tiếp từ JWT session, không JOIN → O(1) tối ưu nhất
 *
 * LƯU Ý QUAN TRỌNG:
 * - Cần chạy migration 20260522000000_create_benchmark_rpcs.sql trước khi sử dụng.
 * - Dataset benchmark là bảng `benchmark_legacy` và `benchmark_jwt` với 100,000 dòng.
 * - Chỉ dùng với `createAdminClient()` để đọc được dữ liệu đầy đủ (bypass RLS cho App-side test).
 */

export type BenchmarkResult = {
    datasetSize: number;
    appFilterMs: number;    // App-side filtering (worst case O(N))
    rlsJoinMs: number;      // Legacy RLS với JOIN (O(N))
    rlsClaimsMs: number;    // Optimized RLS với JWT Claims (O(1))
};

/**
 * Chạy bộ đo lường hiệu năng theo 3 mức dataset khác nhau.
 * @param supabaseAdmin - Client được khởi tạo bằng createAdminClient() (service_role)
 * @param currentTenantId - tenant_id thực tế của user đang đăng nhập (lấy từ getUserContext())
 */
export async function runScalingBenchmark(
    supabaseAdmin: any,
    currentTenantId: string
): Promise<BenchmarkResult[]> {
    // 3 mức dataset để vẽ đường cong hiệu năng (1k → 10k → 100k)
    const sizes = [1000, 10000, 100000];
    const results: BenchmarkResult[] = [];

    for (const size of sizes) {
        // ─────────────────────────────────────────────────────────────────────
        // Baseline 1: App-side Filtering (Mô phỏng Anti-pattern cổ điển)
        // Fetch toàn bộ [size] dòng từ DB (bypass RLS qua admin client),
        // rồi filter bằng JavaScript — đây là những gì "legacy app" không dùng
        // DB-level security thường làm. Đo thời gian FETCH + FILTER.
        // ─────────────────────────────────────────────────────────────────────
        const startApp = performance.now();
        const { data: allData, error: appError } = await supabaseAdmin
            .from('benchmark_legacy')
            .select('id, name, tenant_id, created_at')
            .limit(size);

        if (!appError && allData) {
            // Giả lập lọc theo tenant_id trong JavaScript (đây là anti-pattern)
            // Phải dùng currentTenantId thực tế để đảm bảo kết quả có ý nghĩa
            const _filtered = allData.filter(
                (row: { tenant_id: string }) => row.tenant_id === currentTenantId
            );
        }
        const endApp = performance.now();

        // ─────────────────────────────────────────────────────────────────────
        // Baseline 2: Legacy RLS JOIN (Gọi RPC benchmark_rls_join)
        // Hàm này buộc DB phải JOIN bảng tenants để kiểm tra quyền — O(N)
        // Mỗi dòng dữ liệu phải được kiểm tra lại điều kiện JOIN
        // ─────────────────────────────────────────────────────────────────────
        const startJoin = performance.now();
        await supabaseAdmin.rpc('benchmark_rls_join', { limit_count: size });
        const endJoin = performance.now();

        // ─────────────────────────────────────────────────────────────────────
        // Baseline 3: Optimized RLS JWT Claims (Gọi RPC benchmark_rls_claims)
        // Đọc tenant_id trực tiếp từ JWT session — O(1) constant time
        // Không cần bất kỳ JOIN nào, kiểm tra quyền nhanh như hằng số
        // ─────────────────────────────────────────────────────────────────────
        const startClaims = performance.now();
        await supabaseAdmin.rpc('benchmark_rls_claims', { limit_count: size });
        const endClaims = performance.now();

        results.push({
            datasetSize: size,
            appFilterMs: Math.round((endApp - startApp) * 100) / 100,
            rlsJoinMs: Math.round((endJoin - startJoin) * 100) / 100,
            rlsClaimsMs: Math.round((endClaims - startClaims) * 100) / 100,
        });
    }

    return results;
}