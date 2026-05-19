import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

interface DbDoc {
  id: string;
  title: string;
}

interface DbChunk {
  content: string;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json().catch(() => ({}));
    const { documentId } = body;

    // 1. Lấy danh sách tài liệu cần chuẩn hóa (hoặc một tài liệu cụ thể)
    let query = supabase.from('dharma_documents' as any).select('id, title');
    
    if (documentId) {
      query = query.eq('id', documentId);
    } else {
      query = query.or('source_tier.eq.UNKNOWN,source_tier.is.null');
    }

    const { data, error: fetchError } = await query;
    if (fetchError) throw fetchError;
    
    const docs = data as unknown as DbDoc[];
    
    if (!docs || docs.length === 0) {
      return NextResponse.json({ message: 'Không có tài liệu nào cần chuẩn hóa.' });
    }

    const results = [];

    for (const doc of docs) {
      // 2. Lấy 1 đoạn nội dung đầu tiên của tài liệu từ embeddings để AI phân tích
      const { data: chunkData } = await supabase
        .from('dharma_embeddings' as any)
        .select('content')
        .eq('document_id', doc.id)
        .limit(1);

      const chunks = chunkData as unknown as DbChunk[];

      if (!chunks || chunks.length === 0) continue;

      const textSnippet = chunks[0].content.substring(0, 5000);

      // 3. Gọi Gemini để bóc tách Metadata
      const prompt = `Bạn là chuyên gia thư mục Phật giáo. Hãy phân tích đoạn trích sau của cuốn sách "${doc.title}" và trích xuất thông tin học thuật.
      Trả về JSON: { "source_tier": "PRIMARY" | "COMMENTARY" | "MODERN" | "TRANSLATION", "pali_ref": string, "publisher": string, "publish_year": number, "translator": string }
      
      QUY TẮC:
      - PRIMARY: Kinh gốc (Nikaya, Pháp Cú, Luật tạng).
      - COMMENTARY: Chú giải, Thanh Tịnh Đạo, luận...
      - MODERN: Sách hiện đại, bài giảng.
      
      ĐOẠN TRÍCH:
      ${textSnippet}`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { response_mime_type: "application/json", temperature: 0.1 }
          })
        }
      );

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) {
          try {
            const metadata = JSON.parse(responseText);
            
            // 4. Cập nhật vào Database
            const { error: updateError } = await supabase
              .from('dharma_documents' as any)
              .update({
                source_tier: metadata.source_tier,
                pali_ref: metadata.pali_ref,
                publisher: metadata.publisher,
                publish_year: metadata.publish_year,
              })
              .eq('id', doc.id);

            if (!updateError) {
              results.push({ id: doc.id, status: 'success', metadata });
            }
          } catch (e) {
            console.error("JSON parse error from Gemini:", e);
          }
        }
      }
    }

    return NextResponse.json({ success: true, processed: results.length, details: results });

  } catch (error: any) {
    console.error("Auto-standardize error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
