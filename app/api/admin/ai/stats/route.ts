import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/ai/stats
// Trả về tổng quan thống kê hệ thống RAG
export async function GET() {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    try {
        const [docResult, embResult, catResult] = await Promise.all([
            supabase.from("dharma_documents").select("id", { count: "exact", head: true }),
            supabase.from("dharma_embeddings").select("id", { count: "exact", head: true }),
            supabase.from("dharma_categories").select("id", { count: "exact", head: true }),
        ]);

        // Phân bố tài liệu theo chuyên đề (dùng LEFT JOIN thông qua Supabase embed)
        const { data: distribution, error: distErr } = await supabase
            .from("dharma_categories")
            .select("id, name, dharma_documents(count)")
            .order("name");

        if (distErr) throw distErr;

        const categoryDistribution = (distribution || [])
            .map((cat: any) => ({
                id: cat.id,
                name: cat.name,
                count: cat.dharma_documents?.[0]?.count ?? 0,
            }))
            .sort((a: any, b: any) => b.count - a.count);

        return NextResponse.json({
            success: true,
            stats: {
                total_documents:  docResult.count ?? 0,
                total_vectors:    embResult.count ?? 0,
                total_categories: catResult.count ?? 0,
                category_distribution: categoryDistribution,
            },
        });
    } catch (error: any) {
        console.error('[API] GET /stats error:', error);
        return NextResponse.json({ error: "Không thể tải thống kê hệ thống." }, { status: 500 });
    }
}
