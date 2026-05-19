// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";
const GEMINI_API_KEY_2 = Deno.env.get("GEMINI_API_KEY_2") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// ============================================================
// HỆ THỐNG DỰ PHÒNG (MULTI-KEY FAILOVER)
// ============================================================
async function fetchGemini(urlPath: string, options: any) {
  const keys = [GEMINI_API_KEY, GEMINI_API_KEY_2].filter(k => k && k.length > 5);
  if (keys.length === 0) throw new Error("No Gemini API Keys configured. Please set GEMINI_API_KEY in Supabase secrets.");
  
  let lastRes = null;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const separator = urlPath.includes('?') ? '&' : '?';
    const finalUrl = `https://generativelanguage.googleapis.com/v1beta/${urlPath}${separator}key=${key}`;
    
    try {
      const res = await fetch(finalUrl, options);
      if (res.ok) return res;
      if (res.status !== 429 && res.status < 500) return res;
      console.warn(`[Correction Failover] Key ${i+1} failed (${res.status}).`);
      lastRes = res;
    } catch (e) {
      console.error(`[Correction Failover] Fetch error with Key ${i+1}:`, e);
    }
  }
  return lastRes;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json();
    const { log_id, corrected_answer } = body;

    if (!log_id || !corrected_answer) {
      throw new Error("Thiếu log_id hoặc nội dung câu trả lời đã sửa (corrected_answer)");
    }

    // 1. Lấy thông tin log gốc
    const { data: log, error: logError } = await supabaseClient
      .from("ai_low_quality_logs")
      .select("*")
      .eq("id", log_id)
      .single();

    if (logError || !log) throw new Error("Không tìm thấy Log phản hồi: " + logError?.message);

    // 2. Tạo Vector (Embedding) cho câu hỏi gốc (Phải dùng 1536d)
    const embeddingResponse = await fetchGemini(
      `models/gemini-embedding-2-preview:embedContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/gemini-embedding-2-preview",
          content: { parts: [{ text: log.user_query }] },
          output_dimensionality: 1536,
        }),
      }
    );
    
    if (!embeddingResponse || !embeddingResponse.ok) {
      const errText = await embeddingResponse?.text();
      throw new Error(`Lỗi tạo Embedding: ${embeddingResponse?.status} - ${errText}`);
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.embedding?.values;
    if (!queryEmbedding) throw new Error("Không thể trích xuất vector embedding từ AI");

    // 3. Nạp vào Semantic Cache (Đồng bộ với logic 1536d)
    const { error: cacheError } = await supabaseClient
      .from("ai_query_cache")
      .upsert({
        user_query: log.user_query,
        query_embedding: queryEmbedding,
        llm_answer: corrected_answer,
        tenant_id: log.tenant_id || "GLOBAL",
        tradition_id: 'THERAVADA', // Mặc định cho cache
        citations: [],
        is_approved: true, 
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_query' });

    if (cacheError) {
      console.error("[Correction] Cache Upsert Error:", cacheError);
      // Fallback nếu có lỗi conflict logic
      await supabaseClient.from("ai_query_cache").insert({
        user_query: log.user_query,
        query_embedding: queryEmbedding,
        llm_answer: corrected_answer,
        tenant_id: log.tenant_id || "GLOBAL",
        tradition_id: 'THERAVADA',
        is_approved: true,
      });
    }

    // 4. Cập nhật trạng thái Log để admin biết đã xử lý
    const { error: updateLogError } = await supabaseClient
      .from("ai_low_quality_logs")
      .update({
        status: "REVIEWED",
        corrected_answer: corrected_answer,
        updated_at: new Date().toISOString()
      })
      .eq("id", log_id);

    if (updateLogError) throw updateLogError;

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Huấn luyện AI thành công! Câu trả lời đã được đưa vào bộ nhớ Cache." 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("[Correction] Fatal:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
