import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/ai/documents/[id]/preview
// Trả về 3 chunks đầu tiên của tài liệu để xem trước nội dung
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "Thiếu ID tài liệu" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("dharma_embeddings")
            .select("id, content, metadata, created_at")
            .eq("document_id", id)
            .order("created_at", { ascending: true })
            .limit(3);

        if (error) throw error;

        return NextResponse.json({ success: true, chunks: data || [] });
    } catch (error: any) {
        console.error('[API] GET /documents/preview error:', error);
        return NextResponse.json({ error: "Không thể tải nội dung xem trước." }, { status: 500 });
    }
}
