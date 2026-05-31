/**
 * Scaling Benchmark Engine (v2.0)
 * Đồ án Tốt nghiệp PTIT - Chăm Rốch Thi
 * Mục đích: Đo lường độ trễ thực thi (Latency) và tính toán phân vị (Percentiles - P50, P95, P99)
 *   khi quy mô dữ liệu tăng trưởng (1k -> 10k -> 100k).
 */

export type PercentileData = {
    p50: number; // Median (50% người dùng có độ trễ dưới mức này)
    p95: number; // 95th Percentile (Phản ánh độ trễ phổ biến ở tải cao)
    p99: number; // 99th Percentile (Đuôi độ trễ - Worst case scenario)
};

export type BenchmarkResult = {
    datasetSize: number;
    appFilter: PercentileData;
    rlsJoin: PercentileData;
    rlsClaims: PercentileData;
};

/**
 * Hàm tiện ích tính toán giá trị phân vị từ mảng dữ liệu độ trễ
 */
function calculatePercentile(latencies: number[], percentile: number): number {
    if (!latencies || latencies.length === 0) return 0;
    
    // Sắp xếp mảng độ trễ tăng dần
    const sorted = [...latencies].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    const clampedIndex = Math.max(0, Math.min(index, sorted.length - 1));
    
    // Làm tròn đến 3 chữ số thập phân
    return Number(sorted[clampedIndex].toFixed(3));
}

/**
 * Động cơ đo lường và tính toán thống kê phân vị hiệu năng
 * Chạy lặp lại mỗi phép đo 50 lần để đảm bảo tính hội tụ thống kê chuẩn khoa học.
 */
export async function runScalingBenchmark(supabase: any): Promise<BenchmarkResult[]> {
    const sizes = [1000, 10000, 100000];
    const iterations = 50; // Số lần chạy lặp lại để lấy dữ liệu thống kê
    const results: BenchmarkResult[] = [];

    for (const size of sizes) {
        const appLatencies: number[] = [];
        const joinLatencies: number[] = [];
        const claimsLatencies: number[] = [];

        for (let i = 0; i < iterations; i++) {
            // ==============================================================================
            // 1. ĐO LƯỜNG APP-SIDE FILTERING (Lọc ở tầng Client Next.js)
            // Đo lường thời gian fetch và filter thực tế ở Client.
            // ==============================================================================
            const startApp = performance.now();
            const { data: allData } = await supabase
                .from('audit_logs')
                .select('id, tenant_id')
                .limit(size);
            
            // Giả lập logic lọc trong JS
            const filtered = allData?.filter((item: any) => item.tenant_id === '55555555-5555-5555-5555-555555555555');
            const endApp = performance.now();
            appLatencies.push(endApp - startApp);

            // ==============================================================================
            // 2. ĐO LƯỜNG RLS JOIN (Legacy - Đo trực tiếp Execution Time ở Database-side)
            // Gọi RPC đo lường bằng clock_timestamp() để triệt tiêu nhiễu mạng HTTP.
            // ==============================================================================
            const { data: joinTime, error: joinErr } = await supabase.rpc('measure_db_rls_join', { 
                limit_count: size 
            });
            if (!joinErr && joinTime !== null) {
                joinLatencies.push(joinTime);
            }

            // ==============================================================================
            // 3. ĐO LƯỜNG RLS CLAIMS (Optimized JWT - Đo trực tiếp Execution Time ở Database-side)
            // Gọi RPC đo lường bằng clock_timestamp() để triệt tiêu nhiễu mạng HTTP.
            // ==============================================================================
            const { data: claimsTime, error: claimsErr } = await supabase.rpc('measure_db_rls_claims', { 
                limit_count: size 
            });
            if (!claimsErr && claimsTime !== null) {
                claimsLatencies.push(claimsTime);
            }
        }

        // Tính toán các chỉ số phân vị P50, P95, P99
        results.push({
            datasetSize: size,
            appFilter: {
                p50: calculatePercentile(appLatencies, 50),
                p95: calculatePercentile(appLatencies, 95),
                p99: calculatePercentile(appLatencies, 99)
            },
            rlsJoin: {
                p50: calculatePercentile(joinLatencies, 50),
                p95: calculatePercentile(joinLatencies, 95),
                p99: calculatePercentile(joinLatencies, 99)
            },
            rlsClaims: {
                p50: calculatePercentile(claimsLatencies, 50),
                p95: calculatePercentile(claimsLatencies, 95),
                p99: calculatePercentile(claimsLatencies, 99)
            }
        });
    }

    return results;
}