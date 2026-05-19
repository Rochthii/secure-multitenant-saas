import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function purge() {
  console.log("=== Purging stale 'no document' cache entries ===\n");

  // 1. Tìm tất cả cache entries chứa "chưa có tài liệu" hoặc "không có thông tin"
  const { data: staleEntries, error } = await supabase
    .from("ai_query_cache")
    .select("id, user_query, llm_answer")
    .or("llm_answer.ilike.%chưa có tài liệu%,llm_answer.ilike.%không có thông tin%,llm_answer.ilike.%chưa có thông tin%,llm_answer.ilike.%không tìm thấy%");

  if (error) {
    console.error("Error querying cache:", error.message);
    return;
  }

  console.log(`Found ${staleEntries?.length || 0} stale entries.`);

  if (staleEntries && staleEntries.length > 0) {
    for (const entry of staleEntries) {
      console.log(`  - [${entry.id}] Query: "${entry.user_query}" | Answer preview: "${entry.llm_answer?.substring(0, 80)}..."`);
    }

    // 2. Xóa tất cả entries stale
    const ids = staleEntries.map(e => e.id);
    const { error: deleteError, count } = await supabase
      .from("ai_query_cache")
      .delete()
      .in("id", ids);

    if (deleteError) {
      console.error("Delete error:", deleteError.message);
    } else {
      console.log(`\n✅ Purged ${ids.length} stale cache entries.`);
    }
  }

  // 3. Đếm tổng cache còn lại
  const { count: remaining } = await supabase
    .from("ai_query_cache")
    .select("id", { count: "exact", head: true });
  console.log(`\nRemaining cache entries: ${remaining}`);
}

purge().catch(console.error);
