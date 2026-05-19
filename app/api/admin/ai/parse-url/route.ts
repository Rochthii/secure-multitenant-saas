import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

export async function POST(req: Request) {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    try {
        const { url } = await req.json();
        if (!url) {
            return NextResponse.json({ error: "Vui lòng cung cấp link website." }, { status: 400 });
        }

        // 1. Fetch content
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            }
        });
        
        if (!res.ok) {
            throw new Error(`Không thể truy cập trang web (${res.status}). Vui lòng kiểm tra lại link.`);
        }

        const contentType = res.headers.get('content-type') || '';
        let rawText = '';
        let isPdf = contentType.includes('application/pdf') || url.toLowerCase().endsWith('.pdf');

        if (isPdf) {
            // Xử lý PDF từ URL
            const arrayBuffer = await res.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            // Polyfill for DOMMatrix
            if (typeof (global as any).DOMMatrix === 'undefined') {
                (global as any).DOMMatrix = class DOMMatrix {
                    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
                    constructor() {}
                };
            }

            const pdfModule = (await import("pdf-parse")) as any;
            const PDFParse = pdfModule.PDFParse || pdfModule.default?.PDFParse;
            
            if (PDFParse) {
                const parser = new PDFParse({ data: buffer });
                const data = await parser.getText();
                rawText = data.text;
                await parser.destroy();
            } else {
                throw new Error("Không tìm thấy bộ thư viện xử lý PDF.");
            }
        } else {
            // Xử lý HTML
            const html = await res.text();

            // 2. Clean HTML to save tokens
            let cleanHtml = html
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
                .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
                .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
                .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
                .replace(/<!--[\s\S]*?-->/g, '');

            cleanHtml = cleanHtml.replace(/ (class|style|id|data-[a-z0-9-]+|on[a-z]+|aria-[a-z]+|role|target|rel|title|alt|loading|width|height|src)="[^"]*"/gi, (match, attr) => {
                if (attr.toLowerCase() === 'href') return match;
                return '';
            });

            rawText = cleanHtml;
        }

        // 3. Use AI to extract main content and title
        const truncatedContent = rawText.substring(0, 50000); 

        const prompt = `Bạn là một chuyên gia bóc tách dữ liệu Phật học. Hãy phân tích nội dung sau từ URL: ${url}
        
        NHIỆM VỤ:
        1. Trích xuất "title" (Tiêu đề chính của bài kinh/bài viết).
        2. Trích xuất "content" (Nội dung bài viết dưới dạng Markdown sạch, giữ nguyên cấu trúc kinh văn, đoạn văn).
        3. Kiểm tra xem đây có phải là trang "Mục lục / Sitemap / Danh sách" không.
        4. Nếu là trang Mục lục, hãy liệt kê tối đa 15 link con (child links) quan trọng nhất.
        5. Trích xuất metadata (mã kinh, người dịch) nếu có.

        YÊU CẦU ĐỊNH DẠNG JSON:
        {
          "title": "Tiêu đề",
          "content": "Nội dung markdown...",
          "is_index": true/false,
          "child_links": [{"title": "Tên bài", "url": "link..."}],
          "metadata": { "sutta_code": "...", "translator": "...", "source_tier": "PRIMARY/COMMENTARY/MODERN" }
        }

        NỘI DUNG:
        ${truncatedContent}`;

        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { 
                      temperature: 0.1,
                      response_mime_type: "application/json",
                    }
                })
            }
        );

        if (!geminiRes.ok) {
            const error = await geminiRes.json();
            // Fallback: Nếu AI lỗi (do quá tải 429), hãy trả về nội dung thô đã dọn dẹp
            if (geminiRes.status === 429) {
                 return NextResponse.json({ 
                    success: true, 
                    text: isPdf ? rawText : "AI đang bận xử lý, vui lòng thử lại sau giây lát hoặc dán nội dung thủ công.",
                    title: "Đang chờ xử lý...",
                    isIndex: false,
                    childLinks: [],
                    metadata: {},
                    pages: 1
                });
            }
            throw new Error(`Lỗi AI (${geminiRes.status}): ${error.error?.message || "Không thể xử lý nội dung."}`);
        }

        const geminiData = await geminiRes.json();
        const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!responseText) {
            throw new Error("Không thể trích xuất nội dung từ URL này.");
        }

        let extractedData;
        try {
            extractedData = JSON.parse(responseText);
        } catch (e) {
            throw new Error("Máy chủ AI trả về dữ liệu không hợp lệ.");
        }

        return NextResponse.json({ 
            success: true, 
            text: extractedData.content || rawText, // Ưu tiên nội dung AI đã làm sạch, nếu không thì lấy toàn bộ nội dung thô
            title: extractedData.title || "Tài liệu mới",
            isIndex: extractedData.is_index || false,
            childLinks: extractedData.child_links || [],
            metadata: extractedData.metadata || {},
            pages: 1
        });

    } catch (error: any) {
        console.error("URL Parse Error:", error);
        return NextResponse.json({ 
            error: error.message || "Lỗi xử lý URL" 
        }, { status: 500 });
    }
}
