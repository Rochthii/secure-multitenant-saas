import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

export async function POST(req: Request) {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "Missing text content" }, { status: 400 });
        }

        // Limit text to ~8000 characters to keep within token limits and focus on intro/title pages
        const snippet = text.substring(0, 8000);

        const systemPrompt = `You are a Buddhist Scholar and Metadata Expert. 
Your task is to extract scholarly metadata from the provided text snippet of a Buddhist scripture (typically from the title page or introduction).

EXTRACT THESE FIELDS:
1. sutta_code: The formal code (e.g., SN 2.4, MN 10, DN 2, Dhp 1). If not found, leave blank.
2. verse_number: Specific verse or section numbers mentioned (e.g., 262, 1-38, Phẩm 1).
3. book_name: The title of the book or collection (e.g., Sutta Nipāta, Kinh Trung Bộ, Tương Ưng Bộ).
4. translator: The name of the translator, usually prefixed with "HT." (Hòa thượng), "Tỳ kheo", or "Dịch giả".
5. publisher: The publishing house or institution (e.g., Viện Nghiên Cứu Phật Học Việt Nam).
6. source_tier: Categorize the text into one of these types:
   - PRIMARY: Canonical scriptures (Nikayas, Agamas, Dhammapada, Vinaya).
   - COMMENTARY: Ancient or scholarly commentaries (Atthakatha, Abhidhamma, Shastras).
   - MODERN: Modern Buddhist books, lectures, or biographies.

OUTPUT RULES:
- Return ONLY a valid JSON object.
- Use empty strings for missing fields (except source_tier which must be guessed).
- For sutta_code, normalize to a standard format (uppercase prefix, space, number).
- Target language: Vietnamese for book_name, translator, and publisher if available in text.

TEXT SNIPPET:
${snippet}`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: systemPrompt }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.1,
                        response_mime_type: "application/json",
                    }
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API error: ${errorText}`);
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!content) {
            throw new Error("Gemini returned an empty response.");
        }

        let metadata;
        try {
            metadata = JSON.parse(content);
        } catch (e) {
            // Fallback if JSON is wrapped in code blocks
            const match = content.match(/\{[\s\S]*\}/);
            if (match) {
                metadata = JSON.parse(match[0]);
            } else {
                throw new Error("Failed to parse metadata JSON.");
            }
        }

        return NextResponse.json({ success: true, metadata });
    } catch (error: any) {
        console.error("Extract Metadata Error:", error);
        return NextResponse.json({ error: error.message || "Failed to extract metadata" }, { status: 500 });
    }
}
