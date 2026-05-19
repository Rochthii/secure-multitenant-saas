import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;
 
    try {
        const { title, tenantId = "GLOBAL", categoryId, traditionId, sourceMetadata, allowOverwrite = false } = await req.json();

        if (!title) {
            return NextResponse.json({ error: "Missing title" }, { status: 400 });
        }

        // 1. DEDUPLICATION & OVERWRITE CHECK (Chống trùng lặp & Ghi đè)
        if (sourceMetadata?.source_url) {
            const { data: existingDoc } = await supabase
                .from("dharma_documents")
                .select("id, title")
                .contains("source_metadata", { source_url: sourceMetadata.source_url })
                .limit(1)
                .maybeSingle();
                
            if (existingDoc) {
                if (!allowOverwrite) {
                    return NextResponse.json({ 
                        error: `URL này đã được nạp vào hệ thống trước đó với tiêu đề "${existingDoc.title}". Vui lòng không nạp lại để tránh trùng lặp dữ liệu.`,
                        existingDoc: existingDoc,
                        canOverwrite: true 
                    }, { status: 400 });
                } else {
                    // Nếu cho phép ghi đè, xóa sạch các embedding cũ của document này để nạp mới hoàn toàn
                    const { error: deleteError } = await supabase
                        .from("dharma_embeddings")
                        .delete()
                        .eq("document_id", existingDoc.id);
                    
                    if (deleteError) throw deleteError;

                    // Cập nhật lại thông tin Document
                    const { data: updatedDoc, error: updateError } = await supabase
                        .from("dharma_documents")
                        .update({
                            title,
                            category_id: categoryId,
                            tradition_id: traditionId,
                            source_metadata: sourceMetadata || {},
                            source_tier: sourceMetadata?.source_tier || 'UNKNOWN',
                            publisher: sourceMetadata?.publisher || null,
                            pali_ref: sourceMetadata?.sutta_code || null,
                        })
                        .eq("id", existingDoc.id)
                        .select()
                        .single();

                    if (updateError) throw updateError;
                    return NextResponse.json({ success: true, document: updatedDoc, isOverwrite: true });
                }
            }
        }

        const { data, error } = await supabase
            .from("dharma_documents")
            .insert({ 
                title, 
                tenant_id: tenantId,
                category_id: categoryId,
                tradition_id: traditionId,
                source_metadata: sourceMetadata || {},
                // Map top-level academic columns from sourceMetadata if they exist
                source_tier: sourceMetadata?.source_tier || 'UNKNOWN',
                publisher: sourceMetadata?.publisher || null,
                pali_ref: sourceMetadata?.sutta_code || null, // Map sutta_code to pali_ref
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, document: data });
    } catch (error: any) {
        console.error("Init Document Error:", error);
        return NextResponse.json({ error: error.message || "Failed to init document" }, { status: 500 });
    }
}
