import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

// 1. Hàm tạo Embedding
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-2',
        content: { parts: [{ text }] },
      }),
    }
  );
  const data = await response.json();
  if (!data.embedding || !data.embedding.values) {
    console.error("Embedding API Error:", data);
    return Array(1536).fill(0);
  }
  return data.embedding.values;
}

// 2. Hàm gọi AI trả lời
async function generateAnswer(systemPrompt: string, userQuery: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userQuery }] }
        ],
        generationConfig: { temperature: 0.2 }
      })
    }
  );
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "NO_RESPONSE";
}

// 3. LLM-as-a-Judge: Đánh giá câu trả lời
async function evaluateAnswer(query: string, answer: string, context: string) {
  const evaluationPrompt = `
  Bạn là một giám khảo chuyên gia (LLM-as-a-Judge) chuyên chấm điểm hệ thống GraphRAG về Phật giáo.
  Hãy đánh giá CÂU TRẢ LỜI dựa trên 5 tiêu chí sau (từ 1 đến 10 điểm):
  1. Cách trả lời (Văn phong, sự trang nghiêm)
  2. Liên kết (Sự liên kết các khái niệm triết học, tư duy đa chiều)
  3. Chuẩn nguồn (Faithfulness - dựa sát vào Context, không bịa đặt)
  4. Trả lời sâu sắc (Depth - Có đi sâu vào bản chất thay vì hời hợt)
  5. Trích dẫn chuẩn (Có cite nguồn rõ ràng từ context không)

  CÂU HỎI: ${query}
  BỐI CẢNH (CONTEXT):
  ${context}
  
  CÂU TRẢ LỜI AI ĐÃ TẠO:
  ${answer}

  Hãy trả về đúng một block JSON duy nhất theo định dạng (KHÔNG có markdown hay text nào khác):
  {
    "style": 9,
    "relational": 9,
    "faithfulness": 10,
    "depth": 8,
    "citations": 10,
    "feedback": "Nhận xét chi tiết tại sao..."
  }
  `;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: evaluationPrompt }] }],
        generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
      })
    }
  );
  
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  try {
    return JSON.parse(text);
  } catch(e) {
    console.error("Failed to parse evaluation:", text);
    return null;
  }
}

// ==========================================
// KỊCH BẢN TEST CÁC SÁCH ĐÃ CÓ
// ==========================================
const testCases = [
  {
    name: "Sách: Đức Phật và Phật Pháp",
    query: "Theo Đức Phật và Phật Pháp của Narada Mahathera, hãy giải thích sâu sắc về Tứ Diệu Đế và sự liên kết với Khổ."
  },
  {
    name: "Sách: Kinh Pháp Cú (Phẩm Song Đối)",
    query: "Kinh Pháp Cú Phẩm Song Đối phân tích như thế nào về sự liên kết giữa tâm trí, suy nghĩ và hành động? Tâm là gì?"
  },
  {
    name: "Sách: Tạng Luật",
    query: "Dựa vào Tạng Luật - Bộ Pārājika, những giới luật cốt lõi nào Tỳ khưu cần giữ và liên quan thế nào đến Bát Chánh Đạo?"
  }
];

async function runPipeline(query: string) {
  console.log(`\n======================================================`);
  console.log(`❓ QUERY: "${query}"`);

  // 1. NER
  const { data: entities } = await supabase.rpc('search_graph_entities', { search_terms: [query] });
  const extractedNames = entities?.map((e: any) => e.entity_name) || [];
  console.log(`🧠 1. NER Extracted: [${extractedNames.join(', ')}]`);

  // 2. Graph Context
  const { data: graphContext } = await supabase.rpc('graphrag_search', { search_terms: extractedNames });
  console.log(`🕸️ 2. Graph Context Retrieved: ${graphContext?.length || 0} chars`);

  // 3. Vector & Hybrid Search
  console.log(`🔍 3. Generating Embedding & Searching Documents...`);
  const vector = await generateEmbedding(query);
  const { data: searchResults } = await supabase.rpc('hybrid_search_dharma', {
    query_text: query,
    query_embedding: `[${vector.join(',')}]`,
    match_threshold: 0.1,
    match_count: 5
  });

  if (!searchResults || searchResults.length === 0) {
     console.log("   ⚠️ No text documents found in DB. Fallback to Graph Context only.");
  }

  // 4. Graph-Aware Reranking
  let finalDocs = searchResults || [];
  if (finalDocs.length > 0 && extractedNames.length > 0) {
    finalDocs = finalDocs.map((doc: any) => {
      let boost = 0;
      extractedNames.forEach((e: string) => {
        if (doc.content.toLowerCase().includes(e.toLowerCase())) boost += 25;
      });
      return { ...doc, final_score: (doc.rrf_score || 0) + boost };
    }).sort((a: any, b: any) => b.final_score - a.final_score);
  }

  // Build Context String
  let contextString = "=== GRAPH KNOWLEDGE ===\n" + (graphContext || "None") + "\n\n=== DOCUMENT SOURCES ===\n";
  finalDocs.slice(0, 3).forEach((d: any, i: number) => {
    contextString += `[Source ${i+1}: ${d.document_title || 'Unknown'}]\n${d.content}\n\n`;
  });

  // 5. Generate Answer
  console.log(`🤖 4. Generating AI Response...`);
  const systemPrompt = `Bạn là Trợ lý Phật Pháp (Dharma Chat). Hãy trả lời câu hỏi dựa trên ngữ cảnh sau. Yêu cầu: sâu sắc, chuẩn học thuật, trích dẫn [Source X] đầy đủ.\n\nCONTEXT:\n${contextString}`;
  const answer = await generateAnswer(systemPrompt, query);
  
  // 6. Evaluate
  console.log(`⚖️ 5. Evaluating Output...`);
  const scores = await evaluateAnswer(query, answer, contextString);
  
  console.log(`\n💬 ANSWER PREVIEW:\n${answer.substring(0, 300)}...\n`);
  if (scores) {
    console.log(`🏆 SCORES:`);
    console.log(`   - Văn phong (Style):       ${scores.style}/10`);
    console.log(`   - Liên kết (Relational):   ${scores.relational}/10`);
    console.log(`   - Chuẩn nguồn (Faithful):  ${scores.faithfulness}/10`);
    console.log(`   - Sâu sắc (Depth):         ${scores.depth}/10`);
    console.log(`   - Trích dẫn (Citations):   ${scores.citations}/10`);
    console.log(`   - Nhận xét: "${scores.feedback}"`);
  }
  return { query, answer, scores };
}

async function main() {
  const results = [];
  for (const tc of testCases) {
    console.log(`\n\n▶️ RUNNING TEST CASE: ${tc.name}`);
    const res = await runPipeline(tc.query);
    results.push(res);
  }
  console.log("\n\n✅ ALL TESTS COMPLETED!");
}

main().catch(console.error);
