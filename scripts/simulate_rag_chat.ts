/**
 * SIMULATION: Chạy thử logic GraphRAG trong rag-chat/index.ts
 * Giúp kiểm tra pipeline NER -> Graph -> Rerank ngay tại local
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function simulateRagChat(query: string) {
  console.log(`\n🚀 SIMULATING RAG-CHAT FOR: "${query}"`);
  console.log("--------------------------------------------------");

  // BƯỚC 1: Mô phỏng LLM NER (Entity Extraction)
  // Trong function thật, đây là gọi Gemini. Ở đây ta lấy từ fuzzy search để demo.
  console.log("1. [NER] Extracting entities...");
  const { data: entities } = await supabase.rpc('search_graph_entities', { 
    search_terms: [query] 
  });
  
  const extractedNames = entities?.map((e: any) => e.entity_name) || [];
  console.log(`   Found: ${extractedNames.join(', ') || 'None'}`);

  // BƯỚC 2: Graph Traversal
  console.log("2. [Graph] Traversing relations...");
  const { data: graphContext } = await supabase.rpc('graphrag_search', { 
    search_terms: extractedNames 
  });
  console.log(`   Graph Context: ${graphContext?.length || 0} chars`);

  // BƯỚC 3: Hybrid Search + Graph-Aware Reranking
  console.log("3. [Search] Hybrid search & Reranking...");
  const { data: searchResults } = await supabase.rpc('hybrid_search_dharma', {
    query_text: query,
    match_count: 10,
    tenant_filter: '00000000-0000-0000-0000-000000000000'
  });

  if (!searchResults) {
    console.log("   No documents found.");
    return;
  }

  // LOGIC RERANKING (đúng như trong index.ts)
  const reranked = searchResults.map((doc: any) => {
    let boost = 0;
    extractedNames.forEach((e: string) => {
      if (doc.content.toLowerCase().includes(e.toLowerCase())) {
        boost += 25;
      }
    });
    return { ...doc, original_rank: doc.score || 0, boost, final_score: (doc.score || 0) + boost };
  });

  const sorted = reranked.sort((a: any, b: any) => b.final_score - a.final_score);

  console.log("\n📊 TOP RESULTS (After Graph-Aware Reranking):");
  sorted.slice(0, 3).forEach((doc: any, i: number) => {
    console.log(`${i+1}. [Boost: +${doc.boost}] ${doc.content.substring(0, 100)}...`);
  });
}

async function main() {
  await simulateRagChat("Tứ Diệu Đế và Bát Chánh Đạo");
  await simulateRagChat("Làm sao để bớt stress và lo âu?");
}

main().catch(console.error);
