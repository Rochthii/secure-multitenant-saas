import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getUserContext } from '@/lib/permissions';
import { runScalingBenchmark } from '@/app/admin/performance/scaling-engine';

/**
 * API Route: POST /api/admin/benchmark
 * Chạy bộ đo lường hiệu năng RLS Benchmark và trả về kết quả JSON.
 *
 * Lý do cần route riêng:
 * - runScalingBenchmark cần createAdminClient() (server-only, bypass RLS cho App-side test)
 * - Cần getUserContext() để lấy currentTenantId thực tế của người dùng
 * - Page /admin/performance là 'use client' nên không thể gọi trực tiếp server functions
 */
export async function POST(req: NextRequest) {
    // Xác thực quyền: chỉ Global Admin mới được chạy Benchmark
    const ctx = await getUserContext();
    if (!ctx) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!['super_admin', 'company_editor', 'admin'].includes(ctx.role)) {
        return NextResponse.json(
            { error: 'Forbidden: Chỉ Global Admin mới có quyền chạy Performance Benchmark.' },
            { status: 403 }
        );
    }

    try {
        const supabaseAdmin = await createAdminClient();

        // Dùng tenantId thực của user hiện tại (fallback về dummy nếu là super_admin không có tenant)
        const currentTenantId = ctx.tenantId ?? '55555555-5555-5555-5555-555555555555';

        const results = await runScalingBenchmark(supabaseAdmin, currentTenantId);

        return NextResponse.json({ success: true, results });
    } catch (err: any) {
        console.error('[Benchmark Error]:', err);
        return NextResponse.json(
            { error: err.message || 'Lỗi server khi chạy benchmark.' },
            { status: 500 }
        );
    }
}
