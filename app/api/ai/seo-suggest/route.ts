import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Rate limiting đơn giản: tối đa 20 req/phút mỗi IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || entry.resetAt < now) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
        return true;
    }
    if (entry.count >= 20) return false;
    entry.count++;
    return true;
}

export async function POST(req: NextRequest) {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    if (!checkRateLimit(ip)) {
        return NextResponse.json({ error: 'Rate limit exceeded. Vui lòng thử lại sau 1 phút.' }, { status: 429 });
    }

    try {
        const body = await req.json();
        const { title, content: inputContent, locale = 'vi' } = body;

        if (!title && !inputContent) {
            return NextResponse.json({ error: 'Cần ít nhất tiêu đề hoặc nội dung' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'AI chưa được cấu hình (thiếu GEMINI_API_KEY)' }, { status: 503 });
        }

        const prompt = `Bạn là chuyên gia SEO cho website của Chi nhánh Phật giáo Nam Tông Khmer Chantarangsay tại Việt Nam.
        
Dựa trên tiêu đề và nội dung bài viết dưới đây, hãy tạo ra:
1. meta_title (tối đa 60 ký tự, hấp dẫn, có từ khóa)
2. meta_description (tối đa 160 ký tự, tóm tắt giá trị, kêu gọi nhấp)
3. keywords (5-8 từ khóa tiếng Việt liên quan, cách nhau bởi dấu phẩy)

Tiêu đề: ${title || '(chưa có)'}
Nội dung (tóm tắt): ${(inputContent || '').substring(0, 2000)}

Trả về JSON theo đúng format:
{
  "meta_title": "...",
  "meta_description": "...",  
  "keywords": "..."
}

Chỉ trả JSON, không giải thích thêm.`;

        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { 
                        temperature: 0.7,
                        response_mime_type: "application/json",
                    }
                })
            }
        );

        if (!geminiRes.ok) {
            const errText = await geminiRes.text();
            console.error('Gemini API error:', errText);
            return NextResponse.json({ error: 'AI không phản hồi được' }, { status: 502 });
        }

        const data = await geminiRes.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
            return NextResponse.json({ error: 'AI trả về rỗng' }, { status: 500 });
        }

        try {
            const suggestions = JSON.parse(responseText);
            return NextResponse.json(suggestions);
        } catch (e) {
            console.error('Gemini parse error:', e, responseText);
            return NextResponse.json({ error: 'AI trả về định dạng lỗi' }, { status: 500 });
        }
    } catch (err: any) {
        console.error('SEO suggest error:', err);
        return NextResponse.json({ error: 'Có lỗi khi gọi AI: ' + err.message }, { status: 500 });
    }
}
