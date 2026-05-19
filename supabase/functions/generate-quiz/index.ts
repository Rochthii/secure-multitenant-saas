/**
 * COPYRIGHT (C) 2026 - DHARMA CHAT RAG ENGINE
 * Edge Function: generate-quiz
 */

// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY          = Deno.env.get("GEMINI_API_KEY") || "";
const GEMINI_API_KEY_2        = Deno.env.get("GEMINI_API_KEY_2") || "";
const GROQ_API_KEY            = Deno.env.get("GROQ_API_KEY") || "";
const SUPABASE_URL            = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// ============================================================
// HỆ THỐNG DỰ PHÒNG (MULTI-KEY FAILOVER)
// ============================================================
async function fetchGemini(urlPath: string, options: any) {
  const keys = [GEMINI_API_KEY, GEMINI_API_KEY_2].filter(k => k && k.length > 5);
  if (keys.length === 0) throw new Error("No Gemini API Keys configured. Please set GEMINI_API_KEY in secrets.");
  
  let lastRes = null;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const separator = urlPath.includes('?') ? '&' : '?';
    const finalUrl = `https://generativelanguage.googleapis.com/v1beta/${urlPath}${separator}key=${key}`;
    
    try {
      const res = await fetch(finalUrl, options);
      if (res.ok) return res;
      if (res.status !== 429 && res.status < 500) return res;
      console.warn(`[Quiz Failover] Gemini Key ${i+1} failed (${res.status}).`);
      lastRes = res;
      
      if (res.status === 429 && i < keys.length - 1) {
        await new Promise(r => setTimeout(r, 1000)); // Chờ 1s trước khi đổi key
      }
    } catch (e) {
      console.error(`[Quiz Failover] Fetch error with Key ${i+1}:`, e);
    }
  }
  return lastRes;
}

// ============================================================
// PROMPT ENGINEERING: Sinh câu hỏi trắc nghiệm chuẩn học thuật
// ============================================================
function buildQuizPrompt(context: string, difficulty: string, count: number, traditionName: string): string {
  const bloomMap: Record<string, string> = {
    EASY:   "REMEMBER — Nhớ lại sự kiện, tên gọi, định nghĩa cơ bản",
    MEDIUM: "UNDERSTAND — Hiểu nghĩa, giải thích khái niệm, diễn đạt lại",
    HARD:   "APPLY/ANALYZE — Áp dụng vào tình huống, so sánh, phân tích nguyên nhân",
    EXPERT: "EVALUATE — Đánh giá quan điểm, biện luận, tổng hợp nhiều nguồn",
  };

  return `Bạn là một Giáo sư Phật học tại Học viện Phật giáo Việt Nam, chuyên về ${traditionName}.
Dựa trên các đoạn kinh điển dưới đây, hãy tạo ĐÚNG ${count} câu hỏi trắc nghiệm.

ĐỘ KHÓ: ${difficulty}
BLOOM'S TAXONOMY: ${bloomMap[difficulty] || bloomMap.MEDIUM}

YÊU CẦU BẮT BUỘC:
1. Mỗi câu có 4 lựa chọn (A, B, C, D) rõ ràng, không mơ hồ
2. Chỉ 1 đáp án đúng duy nhất
3. 3 đáp án sai phải "hợp lý về mặt tu học" nhưng SAI về giáo lý
4. Phần GIẢI THÍCH phải trích dẫn trực tiếp từ đoạn kinh điển được cung cấp
5. KHÔNG bịa đặt thông tin không có trong đoạn kinh điển

[Kinh điển tham chiếu]:
${context}

OUTPUT FORMAT (JSON array, không có gì khác):
[
  {
    "question_text": "...",
    "option_a": "...",
    "option_b": "...",
    "option_c": "...",
    "option_d": "...",
    "correct_answer": "A",
    "explanation": "Theo đoạn kinh... [trích dẫn trực tiếp]",
    "source_citation": "(Ví dụ: MN 22)",
    "bloom_level": "REMEMBER"
  }
]`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json();

    const {
      tradition_id = "THERAVADA",
      category_id  = null,
      difficulty   = "MEDIUM",
      count        = 10,
    } = body;

    // 1. Rate Limiting Check
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    const { data: { user } } = await supabase.auth.getUser(token);
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    
    const { data: allowed } = await supabase.rpc("check_rate_limit", {
      p_ip: user ? user.id : `ip:${clientIp}`,
      p_action: "generate-quiz",
      p_max_hits: 20,
      p_window_seconds: 86400,
      p_tenant_id: null,
      p_user_id: user ? user.id : null,
    });

    if (allowed === false) {
      return new Response(JSON.stringify({ error: "Giới hạn lượt tạo câu hỏi trong ngày đã hết. Vui lòng quay lại sau!" }), { status: 429, headers: corsHeaders });
    }

    // 2. Thử lấy câu hỏi có sẵn từ DB (đã duyệt hoặc đang chờ)
    const { data: existingQuestions } = await supabase.rpc("get_random_quiz_questions", {
      p_tradition_id: tradition_id,
      p_category_id: category_id,
      p_difficulty: difficulty,
      p_count: parseInt(count) || 10,
    });

    if (existingQuestions && existingQuestions.length >= 5) {
      return new Response(JSON.stringify({ questions: existingQuestions, source: "db" }), { status: 200, headers: corsHeaders });
    }

    // 3. Nếu không đủ -> Sinh bằng AI
    const { data: tradition } = await supabase.from("dharma_traditions").select("name_vi").eq("id", tradition_id).single();
    const traditionName = tradition?.name_vi || "Phật Giáo";

    // RAG Search
    const searchQuery = `Giáo lý Phật giáo ${traditionName} về ${category_id || 'tổng quát'}`;
    const embedRes = await fetchGemini(`models/gemini-embedding-2-preview:embedContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/gemini-embedding-2-preview",
        content: { parts: [{ text: searchQuery }] },
        output_dimensionality: 1536,
      }),
    });

    const embedData = await embedRes.json();
    const queryEmbedding = embedData.embedding?.values;

    if (!queryEmbedding) throw new Error("Không thể tạo embedding cho tìm kiếm Quiz");

    const { data: chunks, error: matchError } = await supabase.rpc("hybrid_search_dharma", {
      query_text: searchQuery,
      query_embedding: queryEmbedding,
      match_threshold: 0.4,
      match_count: 8,
      tenant_filter: null,
      tradition_filter: tradition_id,
    });

    if (matchError || !chunks || chunks.length === 0) throw new Error("Không tìm thấy kinh điển phù hợp để tạo câu hỏi");

    const context = chunks.map(c => `[Tài liệu: ${c.document_title}]\n${c.content}`).join("\n\n---\n\n");

    // Gọi AI sinh câu hỏi
    const geminiRes = await fetchGemini(`models/gemini-2.0-flash-lite:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: buildQuizPrompt(context, difficulty, count, traditionName) }] }],
        generationConfig: { temperature: 0.3, responseMimeType: "application/json" },
      }),
    });

    if (!geminiRes || !geminiRes.ok) throw new Error("AI không phản hồi hoặc hết hạn ngạch");

    const geminiData = await geminiRes.json();
    const rawJson = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const generated = JSON.parse(rawJson);

    // Lưu vào DB
    const toInsert = generated.map(q => ({
      tradition_id: tradition_id,
      category_id: category_id,
      question_text: q.question_text,
      question_type: "MCQ",
      difficulty: difficulty,
      bloom_level: q.bloom_level || "UNDERSTAND",
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      source_citation: q.source_citation,
      status: "PENDING"
    }));

    const { data: saved } = await supabase.from("quiz_questions").insert(toInsert).select();

    return new Response(JSON.stringify({ questions: saved || generated, source: "ai" }), { status: 200, headers: corsHeaders });

  } catch (error: any) {
    console.error("[Quiz] Fatal:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
