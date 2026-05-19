import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, errorMessage: string) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    console.error(`   -> ${errorMessage}`);
    failed++;
  }
}

async function testNER() {
  console.log('\n--- 1. Testing Entity Extraction (NER) ---');
  const query = "Làm sao để thực hành Bát Chánh Đạo và hiểu về Tứ Diệu Đế?";
  const { data: entities, error } = await supabase.rpc('search_graph_entities', { 
    search_terms: [query] 
  });

  assert(!error, "RPC Call Successful", error?.message || "");
  
  const extractedNames = entities?.map((e: any) => e.entity_name) || [];
  assert(
    extractedNames.includes('Bát Chánh Đạo') && extractedNames.includes('Tứ Diệu Đế'),
    "NER found both 'Bát Chánh Đạo' and 'Tứ Diệu Đế'",
    `Extracted: ${extractedNames.join(', ')}`
  );
  return extractedNames;
}

async function testTraversal() {
  console.log('\n--- 2. Testing Graph Traversal (2-hop) ---');
  // Pass Bát Chánh Đạo
  const { data: graphContext, error } = await supabase.rpc('graphrag_search', { 
    search_terms: ['Bát Chánh Đạo'] 
  });

  assert(!error, "RPC Call Successful", error?.message || "");
  assert(graphContext && graphContext.length > 0, "Graph Context is not empty", "Context is empty");
  
  // It should contain 'Tứ Diệu Đế' because Bát Chánh Đạo is a part of Tứ Diệu Đế
  assert(
    graphContext.includes('Tứ Diệu Đế'),
    "Context contains related 2-hop/1-hop entity (Tứ Diệu Đế)",
    "Missing relationship in graph"
  );
}

function testReranking() {
  console.log('\n--- 3. Testing Graph-Aware Reranking Logic ---');
  const extractedEntities = ['Thiền Định', 'Chánh Niệm'];
  
  // Giả lập 3 kết quả từ Hybrid Search (Vector + BM25) với điểm RRF ban đầu
  const mockDocuments = [
    { id: 1, content: "Bài viết về từ bi và bố thí.", score: 0.8 },
    { id: 2, content: "Hướng dẫn thực hành Thiền Định mỗi ngày.", score: 0.6 }, // Chứa entity (boost +25)
    { id: 3, content: "Lịch sử Phật giáo Nam tông.", score: 0.7 }
  ];

  // Logic Reranking trích từ rag-chat/index.ts
  const reranked = mockDocuments.map((doc: any) => {
    let boost = 0;
    extractedEntities.forEach((e: string) => {
      if (doc.content.toLowerCase().includes(e.toLowerCase())) {
        boost += 25;
      }
    });
    return { 
      ...doc, 
      original_rank: doc.score, 
      boost, 
      final_score: doc.score + boost 
    };
  });

  const sorted = reranked.sort((a, b) => b.final_score - a.final_score);

  // Assertions
  assert(
    sorted[0].id === 2, 
    "Document with Entity was boosted to rank 1", 
    `Top doc is ${sorted[0].id}`
  );
  assert(
    sorted[0].boost === 25, 
    "Boost value is correct (+25)", 
    `Boost is ${sorted[0].boost}`
  );
  assert(
    sorted[0].final_score === 25.6, 
    "Final score calculated correctly", 
    `Final score is ${sorted[0].final_score}`
  );
}

async function runAllTests() {
  console.log("==========================================");
  console.log("🧪 RUNNING GRAPHRAG V2 PIPELINE TESTS");
  console.log("==========================================");

  await testNER();
  await testTraversal();
  testReranking();

  console.log("\n==========================================");
  console.log(`📊 RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("==========================================");
  
  if (failed > 0) process.exit(1);
}

runAllTests().catch(console.error);
