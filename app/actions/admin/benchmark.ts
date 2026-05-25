'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/require-admin';

export interface BenchmarkResult {
    method: 'legacy' | 'jwt';
    avg_ms: number;
    p50_ms: number;
    p90_ms: number;
    p99_ms: number;
    total_time_ms: number;
    success_count: number;
    error_count: number;
}

export async function runRlsBenchmark(iterations: number = 100): Promise<{ legacy: BenchmarkResult | null; jwt: BenchmarkResult | null; error?: string }> {
    try {
        // Yêu cầu quyền admin (đảm bảo token hợp lệ)
        await requireAdmin();

        // Sử dụng authenticated client (Sẽ tự động gửi Authorization header với JWT token)
        const supabase = await createClient();

        // --- 1. Đo lường Legacy (JOIN - Gọi hàm SELECT public.get_current_user_role()) ---
        const legacyResult = await runTest(supabase, 'benchmark_legacy', iterations);

        // --- 2. Đo lường JWT (RAM session claims lookup - Đọc auth.jwt()->>'role') ---
        const jwtResult = await runTest(supabase, 'benchmark_jwt', iterations);

        return { legacy: legacyResult, jwt: jwtResult };
    } catch (error: any) {
        console.error('[Benchmark] Error:', error);
        return { legacy: null, jwt: null, error: error.message || 'Lỗi chạy benchmark' };
    }
}

/**
 * Hàm hỗ trợ: Gọi table n lần, lưu lại thời gian phản hồi (Latency) của từng query.
 */
async function runTest(supabase: any, tableName: string, iterations: number): Promise<BenchmarkResult> {
    const latencies: number[] = [];
    let successCount = 0;
    let errorCount = 0;
    
    const startTotal = performance.now();

    for (let i = 0; i < iterations; i++) {
        const startReq = performance.now();
        const { error } = await supabase.from(tableName).select('id').limit(1);
        const reqTime = performance.now() - startReq;
        
        if (error) {
            errorCount++;
        } else {
            successCount++;
            latencies.push(reqTime);
        }
    }

    const totalTime = performance.now() - startTotal;

    // Tính toán Percentiles
    latencies.sort((a, b) => a - b);
    
    const getPercentile = (arr: number[], q: number) => {
        if (arr.length === 0) return 0;
        const pos = (arr.length - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (arr[base + 1] !== undefined) {
            return arr[base] + rest * (arr[base + 1] - arr[base]);
        } else {
            return arr[base];
        }
    };

    const avg = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
    const p50 = getPercentile(latencies, 0.50);
    const p90 = getPercentile(latencies, 0.90);
    const p99 = getPercentile(latencies, 0.99);

    return {
        method: tableName === 'benchmark_legacy' ? 'legacy' : 'jwt',
        avg_ms: Number(avg.toFixed(2)),
        p50_ms: Number(p50.toFixed(2)),
        p90_ms: Number(p90.toFixed(2)),
        p99_ms: Number(p99.toFixed(2)),
        total_time_ms: Number(totalTime.toFixed(2)),
        success_count: successCount,
        error_count: errorCount
    };
}
