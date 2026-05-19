/**
 * EVALUATION: GraphRAG V2 vs RAG baseline
 * So sánh chất lượng graph context cho các câu hỏi relational
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================
// BỘ TEST: 30 câu hỏi relational "giết chết RAG thường"
// ============================================================
const RELATIONAL_TEST_CASES = [
  // --- NHÓM 1: HIERARCHICAL (contains) ---
  { q: "Tứ Diệu Đế gồm những gì?", entities: ["Tứ Diệu Đế"], expect_relations: ["contains"], type: "hierarchical" },
  { q: "Bát Chánh Đạo có những chi phần nào?", entities: ["Bát Chánh Đạo"], expect_relations: ["contains"], type: "hierarchical" },
  { q: "Ngũ Uẩn bao gồm gì?", entities: ["Ngũ Uẩn"], expect_relations: ["contains"], type: "hierarchical" },
  { q: "Ngũ Triền Cái là gì?", entities: ["Ngũ Triền Cái"], expect_relations: ["contains"], type: "hierarchical" },
  { q: "Tứ Vô Lượng Tâm gồm những tâm nào?", entities: ["Tứ Vô Lượng Tâm"], expect_relations: ["contains"], type: "hierarchical" },
  { q: "Tam Pháp Ấn là gì?", entities: ["Tam Pháp Ấn"], expect_relations: ["contains"], type: "hierarchical" },

  // --- NHÓM 2: CAUSAL (causes, root_cause_of) ---
  { q: "Vô minh dẫn đến hậu quả gì?", entities: ["Vô Minh"], expect_relations: ["causes", "root_cause_of"], type: "causal" },
  { q: "Nguyên nhân sâu xa của luân hồi là gì?", entities: ["Luân Hồi"], expect_relations: ["root_cause_of", "drives"], type: "causal" },
  { q: "Tham sân si gây ra điều gì?", entities: ["Tham", "Sân", "Si"], expect_relations: ["causes"], type: "causal" },
  { q: "Ái dẫn đến khổ như thế nào?", entities: ["Ái", "Khổ"], expect_relations: ["causes"], type: "causal" },
  { q: "Tại sao có khổ theo Tập Đế?", entities: ["Tập Đế"], expect_relations: ["identifies_cause"], type: "causal" },

  // --- NHÓM 3: RELATIONAL (liên hệ giữa các khái niệm) ---
  { q: "Tứ Diệu Đế liên quan gì đến Bát Chánh Đạo?", entities: ["Tứ Diệu Đế", "Bát Chánh Đạo"], expect_relations: ["is_detailed_as", "contains"], type: "relational" },
  { q: "Vô Ngã được chứng minh qua Ngũ Uẩn như thế nào?", entities: ["Vô Ngã", "Ngũ Uẩn"], expect_relations: ["proves"], type: "relational" },
  { q: "Duyên Khởi và Tánh Không có quan hệ gì?", entities: ["Duyên Khởi", "Tánh Không"], expect_relations: ["equivalent_to"], type: "relational" },
  { q: "Mối quan hệ giữa Chánh Kiến và Tứ Diệu Đế?", entities: ["Chánh Kiến", "Tứ Diệu Đế"], expect_relations: ["requires_understanding"], type: "relational" },
  { q: "Bát Chánh Đạo thuộc nhóm Giới Định Tuệ thế nào?", entities: ["Bát Chánh Đạo", "Tam Học"], expect_relations: ["belongs_to_group"], type: "relational" },
  { q: "So sánh A La Hán và Bồ Tát", entities: ["A La Hán", "Bồ Tát"], expect_relations: ["compared_with", "achieves"], type: "relational" },

  // --- NHÓM 4: ANTIDOTE/REMEDY ---
  { q: "Cách đối trị sân hận?", entities: ["Sân Hận"], expect_relations: ["antidote_for"], type: "antidote" },
  { q: "Làm sao hết lười biếng khi thiền?", entities: ["Hôn Trầm Thụy Miên"], expect_relations: ["antidote_for"], type: "antidote" },
  { q: "Hoài nghi trong tu tập thì làm sao?", entities: ["Hoài Nghi"], expect_relations: ["antidote_for"], type: "antidote" },

  // --- NHÓM 5: TEXTUAL (taught_in) ---
  { q: "Tứ Diệu Đế được giảng trong kinh nào?", entities: ["Tứ Diệu Đế"], expect_relations: ["taught_in"], type: "textual" },
  { q: "Kinh nào dạy về Tứ Niệm Xứ?", entities: ["Tứ Niệm Xứ"], expect_relations: ["taught_in"], type: "textual" },
  { q: "Tánh Không xuất hiện trong kinh nào?", entities: ["Tánh Không"], expect_relations: ["taught_in"], type: "textual" },

  // --- NHÓM 6: SEQUENTIAL (leads_to, causes chain) ---
  { q: "Chuỗi Thập Nhị Nhân Duyên diễn ra thế nào?", entities: ["Thập Nhị Nhân Duyên"], expect_relations: ["causes", "contains"], type: "sequential" },
  { q: "Từ Sơ Thiền tiến lên các tầng thiền cao hơn thế nào?", entities: ["Sơ Thiền"], expect_relations: ["leads_to"], type: "sequential" },

  // --- NHÓM 7: CROSS-FRAMEWORK ---
  { q: "Chánh Niệm thực hành qua phương pháp nào?", entities: ["Chánh Niệm"], expect_relations: ["practiced_through"], type: "cross" },
  { q: "Phật Thích Ca đã dạy những giáo lý cốt lõi nào?", entities: ["Phật Thích Ca"], expect_relations: ["taught"], type: "cross" },
  { q: "Tà Kiến và Chánh Kiến đối lập thế nào?", entities: ["Tà Kiến", "Chánh Kiến"], expect_relations: ["opposite_of"], type: "cross" },
  { q: "Long Thọ Bồ Tát đóng góp gì cho Phật giáo?", entities: ["Long Thọ"], expect_relations: ["developed"], type: "cross" },
  { q: "Bồ Tát tu tập theo pháp môn nào?", entities: ["Bồ Tát"], expect_relations: ["practices"], type: "cross" },
];

async function evaluate() {
  console.log("═══════════════════════════════════════════");
  console.log(" GraphRAG V2 EVALUATION — Relational Queries");
  console.log("═══════════════════════════════════════════\n");

  let pass = 0;
  let fail = 0;
  let empty = 0;
  const results: Array<{q: string; type: string; status: string; context_len: number; relations_found: string[]}> = [];

  for (const tc of RELATIONAL_TEST_CASES) {
    const { data: ctx, error } = await supabase
      .rpc('graphrag_search', { search_terms: tc.entities });

    const context = ctx || '';
    const contextLen = context.length;
    
    // Kiểm tra xem relations mong đợi có xuất hiện trong context không
    const relationsFound = tc.expect_relations.filter(r => context.includes(r));
    const hasExpectedRelation = relationsFound.length > 0;

    let status: string;
    if (error) {
      status = '❌ ERROR';
      fail++;
    } else if (contextLen === 0) {
      status = '⚠️ EMPTY';
      empty++;
    } else if (hasExpectedRelation) {
      status = '✅ PASS';
      pass++;
    } else {
      status = '⚠️ PARTIAL';
      empty++;
    }

    results.push({ q: tc.q, type: tc.type, status, context_len: contextLen, relations_found: relationsFound });
    console.log(`${status} [${tc.type}] ${tc.q}`);
    if (status !== '✅ PASS') {
      console.log(`   Expected: ${tc.expect_relations.join(', ')} | Found: ${relationsFound.join(', ') || 'none'} | Context: ${contextLen} chars`);
    }
  }

  // Summary
  console.log("\n═══════════════════════════════════════════");
  console.log(" SUMMARY");
  console.log("═══════════════════════════════════════════");
  console.log(`Total: ${RELATIONAL_TEST_CASES.length}`);
  console.log(`✅ PASS: ${pass} (${(pass/RELATIONAL_TEST_CASES.length*100).toFixed(0)}%)`);
  console.log(`⚠️ PARTIAL/EMPTY: ${empty}`);
  console.log(`❌ FAIL: ${fail}`);
  console.log(`\nGraphRAG Accuracy: ${(pass/RELATIONAL_TEST_CASES.length*100).toFixed(1)}%`);
  
  // By type breakdown
  const types = [...new Set(RELATIONAL_TEST_CASES.map(t => t.type))];
  console.log("\nBy Category:");
  for (const type of types) {
    const typeTests = results.filter(r => r.type === type);
    const typePass = typeTests.filter(r => r.status === '✅ PASS').length;
    console.log(`  ${type}: ${typePass}/${typeTests.length} (${(typePass/typeTests.length*100).toFixed(0)}%)`);
  }
}

evaluate().catch(console.error);
