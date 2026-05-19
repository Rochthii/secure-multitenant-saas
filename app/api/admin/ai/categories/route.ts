import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/ai/categories
// Trả về danh sách chuyên đề + số lượng tài liệu trong mỗi chuyên đề
export async function GET() {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    try {
        const { data, error } = await supabase
            .from("dharma_categories")
            .select(`
                id,
                name,
                description,
                group_name,
                created_at,
                dharma_documents(count)
            `)
            .order("name", { ascending: true });

        if (error) throw error;

        const categories = (data || []).map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            group_name: cat.group_name,
            created_at: cat.created_at,
            document_count: cat.dharma_documents?.[0]?.count ?? 0,
        }));

        return NextResponse.json({ success: true, categories });
    } catch (error: any) {
        console.error('[API] GET /categories error:', error);
        return NextResponse.json({ error: "Không thể tải danh sách chuyên đề." }, { status: 500 });
    }
}

// POST /api/admin/ai/categories
// Tạo chuyên đề mới
export async function POST(req: Request) {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    try {
        const body = await req.json();
        const name = body?.name?.trim();
        const description = body?.description?.trim() || null;
        const group_name = body?.group_name?.trim() || null;

        if (!name) {
            return NextResponse.json({ error: "Tên chuyên đề không được để trống" }, { status: 400 });
        }
        if (name.length > 200) {
            return NextResponse.json({ error: "Tên chuyên đề không được vượt quá 200 ký tự" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("dharma_categories")
            .insert({ name, description, group_name })
            .select()
            .single();

        if (error) {
            if (error.code === "23505") {
                return NextResponse.json({ error: "Chuyên đề này đã tồn tại" }, { status: 409 });
            }
            throw error;
        }

        return NextResponse.json({ success: true, category: data }, { status: 201 });
    } catch (error: any) {
        console.error('[API] POST /categories error:', error);
        return NextResponse.json({ error: "Không thể tạo chuyên đề. Vui lòng thử lại." }, { status: 500 });
    }
}

// DELETE /api/admin/ai/categories
// Xóa chuyên đề — bị chặn nếu còn tài liệu
export async function DELETE(req: Request) {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    try {
        const body = await req.json();
        const id = body?.id;
        if (!id) return NextResponse.json({ error: "Thiếu ID chuyên đề" }, { status: 400 });

        // Guard: kiểm tra còn tài liệu không
        const { count, error: countErr } = await supabase
            .from("dharma_documents")
            .select("id", { count: "exact", head: true })
            .eq("category_id", id);

        if (countErr) throw countErr;

        if ((count ?? 0) > 0) {
            return NextResponse.json(
                { error: `Chuyên đề này còn ${count} tài liệu. Hãy di chuyển hoặc xóa tài liệu trước.` },
                { status: 409 }
            );
        }

        const { error } = await supabase.from("dharma_categories").delete().eq("id", id);
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[API] DELETE /categories error:', error);
        return NextResponse.json({ error: "Không thể xóa chuyên đề. Vui lòng thử lại." }, { status: 500 });
    }
}

// PATCH /api/admin/ai/categories
// Cập nhật tên hoặc mô tả chuyên đề
export async function PATCH(req: Request) {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    try {
        const body = await req.json();
        const id = body?.id;
        const name = body?.name?.trim();
        const description = body?.description?.trim() || null;
        const group_name = body?.group_name?.trim() || null;

        if (!id) return NextResponse.json({ error: "Thiếu ID chuyên đề" }, { status: 400 });
        if (!name) return NextResponse.json({ error: "Tên chuyên đề không được để trống" }, { status: 400 });

        const { data, error } = await supabase
            .from("dharma_categories")
            .update({ name, description, group_name })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            if (error.code === "23505") {
                return NextResponse.json({ error: "Tên chuyên đề này đã tồn tại" }, { status: 409 });
            }
            throw error;
        }

        return NextResponse.json({ success: true, category: data });
    } catch (error: any) {
        console.error('[API] PATCH /categories error:', error);
        return NextResponse.json({ error: "Không thể cập nhật chuyên đề. Vui lòng thử lại." }, { status: 500 });
    }
}

