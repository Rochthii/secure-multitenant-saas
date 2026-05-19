import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

export async function POST(req: Request) {
    try {
        // metadata học thuật: { sutta_code, verse_number, section, book_name }
        const { documentId, chunkText, metadata } = await req.json();
        const safeMetadata = (metadata && typeof metadata === 'object') ? metadata : {};

        if (!documentId || !chunkText) {
            return NextResponse.json(
                { error: "Missing documentId or chunkText" },
                { status: 400 }
            );
        }

        // 1. Tạo vector embedding từ Gemini 2 (1536 dims - Chuẩn 2026)
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2-preview:embedContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: { parts: [{ text: chunkText }] },
                    output_dimensionality: 1536,
                }),
            }
        );

        const aiData = await response.json();
        const embedding = aiData.embedding?.values;

        if (!embedding) {
            throw new Error("Không thể trích xuất Vector từ Gemini API.");
        }

        // 2. Lưu vào Supabase kèm metadata học thuật
        // metadata ví dụ: { sutta_code: "Sn 2.4", verse_number: "262", book_name: "Sutta Nipāta" }
        const { error } = await supabase.from("dharma_embeddings").insert({
            document_id: documentId,
            content: chunkText,
            embedding: embedding,
            metadata: safeMetadata,
        });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Embed Chunk Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to embed chunk" },
            { status: 500 }
        );
    }
}
