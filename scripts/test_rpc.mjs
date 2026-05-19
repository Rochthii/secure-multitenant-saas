import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRPC() {
  const query = "Phật là gì?";
  console.log("Testing RPC for query:", query);
  
  // Create a dummy vector of 1536 zeros just to satisfy the RPC
  const dummyVector = Array(1536).fill(0);
  const vectorStr = `[${dummyVector.join(',')}]`;
  
  const { data, error } = await supabase.rpc("hybrid_search_dharma", {
    query_text: query,
    query_embedding: null,
    match_threshold: 0.1,
    match_count: 5,
    tenant_filter: "GLOBAL",
    tradition_filter: null
  });

  if (error) {
    console.error("RPC Error:", error);
  } else {
    console.log("RPC Success. Returned rows:", data?.length);
    if (data?.length > 0) {
      console.log("First row title:", data[0].document_title);
      console.log("First row fts_score:", data[0].fts_score);
      console.log("All fts_scores:", data.map(d => d.fts_score));
      console.log("All rrf_scores:", data.map(d => d.rrf_score));
    }
  }
}

testRPC().catch(console.error);
