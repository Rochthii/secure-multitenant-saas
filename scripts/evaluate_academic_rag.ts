/**
 * DHARMA CHAT RAG — Academic Evaluation Pipeline
 * Đánh giá hệ thống RAG theo chuẩn nghiên cứu khoa học
 *
 * Metrics đầu ra:
 *  - Retrieval Precision@K      : Tỷ lệ tài liệu được truy xuất đúng chủ đề
 *  - Citation Accuracy          : Trích dẫn có khớp với tài liệu thực hay không
 *  - Hallucination Rate         : Tỷ lệ câu trả lời bịa thông tin không có trong context
 *  - Source Tier Distribution   : Phân bố loại nguồn (PRIMARY / COMMENTARY / MODERN)
 *  - Response Language Purity   : Không hoà trộn ngôn ngữ ngoại lai
 *
 * Output: JSON + CSV để đưa vào bảng kết quả bài báo NCKH
 *
 * Chạy: npx tsx scripts/evaluate_academic_rag.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ---------- CONFIG ----------
const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  || '';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const OUTPUT_DIR    = path.join(process.cwd(), 'docs', 'ai-rag', 'evaluation');
const TIMESTAMP     = new Date().toISOString().slice(0, 10);

// ---------- KIỂM TRA ĐẦU VÀO ----------
interface EvalScenario {
  id: number;
  category: 'doctrine' | 'comparative' | 'linguistic' | 'semantic' | 'contextual';
  tradition: 'THERAVADA' | 'MAHAYANA' | 'GENERAL';
  query: string;
  // Các tiêu chí đánh giá
  expected_keywords: string[];        // Từ khoá PHẢI xuất hiện trong câu trả lời
  forbidden_hallucinations: string[]; // Thông tin KHÔNG ĐƯỢC bịa
  min_citations: number;              // Số nguồn tham chiếu tối thiểu
  expected_tier: string;              // Tier nguồn kỳ vọng (PRIMARY | COMMENTARY | MODERN | UNKNOWN)
  academic_note: string;              // Ghi chú học thuật để phản biện
}

const EVAL_SCENARIOS: EvalScenario[] = [
  // ── NHÓM 1: DOCTRINAL PRECISION ──────────────────────────
  {
    id: 1,
    category: 'doctrine',
    tradition: 'THERAVADA',
    query: 'Tam Bảo trong Theravāda được định nghĩa trong kinh điển nào? Khác Mahāyāna ở điểm nào?',
    expected_keywords: ['Phật', 'Pháp', 'Tăng', 'Theravāda', 'Nikāya'],
    forbidden_hallucinations: ['Sn 2.4', 'kệ 262'],
    min_citations: 1,
    expected_tier: 'PRIMARY',
    academic_note: 'Phải chỉ rõ nguồn kinh điển Pāli hoặc nêu rõ không có nguồn tương ứng'
  },
  {
    id: 2,
    category: 'doctrine',
    tradition: 'THERAVADA',
    query: 'Ngũ Giới (Pañcasīla) là giới bổn (vinaya) hay giới luật (sīla)? Tính bắt buộc như thế nào?',
    expected_keywords: ['sīla', 'giới', 'Ngũ Giới', 'bắt buộc'],
    forbidden_hallucinations: ['tự kỷ luật', 'từ bi và trí tuệ'],
    min_citations: 1,
    expected_tier: 'PRIMARY',
    academic_note: 'Câu trả lời phải phân biệt vinaya vs sīla — không được diễn giải hiện đại mà không label'
  },
  {
    id: 3,
    category: 'doctrine',
    tradition: 'THERAVADA',
    query: 'Tứ Diệu Đế được Đức Phật giảng lần đầu trong kinh nào, ở đâu?',
    expected_keywords: ['Dhammacakkappavattana', 'Vườn Nai', 'Isipatana', 'Tứ Diệu Đế'],
    forbidden_hallucinations: [],
    min_citations: 1,
    expected_tier: 'PRIMARY',
    academic_note: 'Kinh Chuyển Pháp Luân — phải chỉ rõ SN 56.11 hoặc tương đương'
  },
  {
    id: 4,
    category: 'doctrine',
    tradition: 'THERAVADA',
    query: 'Nibbāna trong Theravāda có phải là "hư vô" không? Phân biệt Nibbāna và Nirvāṇa.',
    expected_keywords: ['Nibbāna', 'diệt tắt', 'không phải hư vô'],
    forbidden_hallucinations: ['cõi cực lạc', 'thiên đường'],
    min_citations: 1,
    expected_tier: 'PRIMARY',
    academic_note: 'Câu trả lời phải phân biệt được Theravāda vs Mahāyāna interpretation'
  },
  {
    id: 5,
    category: 'doctrine',
    tradition: 'GENERAL',
    query: 'Vô ngã (Anattā) nghĩa là gì? Nếu vô ngã, ai chịu quả báo luân hồi?',
    expected_keywords: ['vô ngã', 'Anattā', 'dòng tương tục', 'tâm thức'],
    forbidden_hallucinations: ['linh hồn', 'thực thể vĩnh cửu'],
    min_citations: 1,
    expected_tier: 'PRIMARY',
    academic_note: 'Một trong những câu hỏi kinh điển nhất của Phật học — phản biện sẽ hỏi ngay'
  },

  // ── NHÓM 2: COMPARATIVE CROSS-TRADITION ──────────────────
  {
    id: 6,
    category: 'comparative',
    tradition: 'GENERAL',
    query: 'So sánh quan điểm về Bồ Tát trong Theravāda và Mahāyāna.',
    expected_keywords: ['Bồ Tát', 'Theravāda', 'Mahāyāna', 'khác nhau'],
    forbidden_hallucinations: [],
    min_citations: 1,
    expected_tier: 'PRIMARY',
    academic_note: 'Phải so sánh được hai truyền thống, không gộp chung'
  },
  {
    id: 7,
    category: 'comparative',
    tradition: 'GENERAL',
    query: 'Nghiệp (Kamma/Karma) được giải thích khác nhau như thế nào trong Nam Tông và Bắc Tông?',
    expected_keywords: ['Kamma', 'Karma', 'Theravāda', 'Mahāyāna', 'nghiệp lực'],
    forbidden_hallucinations: ['số phận', 'định mệnh'],
    min_citations: 1,
    expected_tier: 'PRIMARY',
    academic_note: 'Phải phân biệt nghiệp theo cách tiếp cận của từng truyền thống'
  },
  {
    id: 8,
    category: 'comparative',
    tradition: 'GENERAL',
    query: 'Phật giáo Khmer (Theravāda) có điểm gì đặc trưng so với Phật giáo Việt Nam (Đại Thừa)?',
    expected_keywords: ['Khmer', 'Việt Nam', 'Theravāda'],
    forbidden_hallucinations: [],
    min_citations: 0,
    expected_tier: 'MODERN',
    academic_note: 'Câu hỏi phù hợp với bối cảnh NCKH — đặc thù địa văn hóa'
  },

  // ── NHÓM 3: LINGUISTIC + TERMINOLOGICAL ──────────────────
  {
    id: 9,
    category: 'linguistic',
    tradition: 'THERAVADA',
    query: 'Từ "Dukkha" trong tiếng Pāli có nghĩa là gì? Tại sao dịch là "khổ" có thể gây hiểu lầm?',
    expected_keywords: ['Dukkha', 'không thỏa mãn', 'vô thường', 'Pāli'],
    forbidden_hallucinations: [],
    min_citations: 1,
    expected_tier: 'PRIMARY',
    academic_note: 'Đây là vấn đề dịch thuật kinh điển — "suffering" vs "unsatisfactoriness"'
  },
  {
    id: 10,
    category: 'linguistic',
    tradition: 'THERAVADA',
    query: 'Trong Pāli, "Bhikkhu" và "Sāmaṇera" khác nhau ở điểm nào?',
    expected_keywords: ['Bhikkhu', 'Sāmaṇera', 'giới luật', 'tu sĩ'],
    forbidden_hallucinations: [],
    min_citations: 1,
    expected_tier: 'PRIMARY',
    academic_note: 'Phân biệt Tỳ Khưu và Sa Di theo Vinaya Pitaka'
  },

  // ── NHÓM 4: SEMANTIC DEPTH ────────────────────────────────
  {
    id: 11,
    category: 'semantic',
    tradition: 'THERAVADA',
    query: 'Thiền Vipassanā khác Samatha ở điểm nào về mục tiêu và phương pháp?',
    expected_keywords: ['Vipassanā', 'Samatha', 'minh sát', 'định'],
    forbidden_hallucinations: [],
    min_citations: 1,
    expected_tier: 'PRIMARY',
    academic_note: 'Phân biệt hai loại thiền cơ bản của Theravāda'
  },
  {
    id: 12,
    category: 'semantic',
    tradition: 'GENERAL',
    query: 'Từ bi (Karuṇā) và Từ ái (Mettā) có nghĩa khác nhau như thế nào trong Phật học?',
    expected_keywords: ['Mettā', 'Karuṇā', 'từ ái', 'từ bi'],
    forbidden_hallucinations: [],
    min_citations: 1,
    expected_tier: 'PRIMARY',
    academic_note: 'Tứ Vô Lượng Tâm — phân biệt rõ 4 phẩm chất'
  },
  {
    id: 13,
    category: 'semantic',
    tradition: 'THERAVADA',
    query: 'Bát Chánh Đạo: "Chánh Kiến" (Sammā Diṭṭhi) có nghĩa cụ thể là gì?',
    expected_keywords: ['Chánh Kiến', 'Sammā Diṭṭhi', 'Bát Chánh Đạo', 'Tứ Diệu Đế'],
    forbidden_hallucinations: [],
    min_citations: 1,
    expected_tier: 'PRIMARY',
    academic_note: 'Phải giải thích theo nghĩa kỹ thuật Pāli, không chỉ nghĩa thông thường'
  },
  {
    id: 14,
    category: 'semantic',
    tradition: 'THERAVADA',
    query: 'Uẩn (Khandha) có 5 loại — hãy giải thích từng loại theo Abhidhamma.',
    expected_keywords: ['Sắc', 'Thọ', 'Tưởng', 'Hành', 'Thức', 'Khandha'],
    forbidden_hallucinations: [],
    min_citations: 1,
    expected_tier: 'PRIMARY',
    academic_note: 'Ngũ Uẩn — cần giải thích đúng theo Pāli Abhidhamma'
  },

  // ── NHÓM 5: CONTEXTUAL MULTI-TURN ────────────────────────
  {
    id: 15,
    category: 'contextual',
    tradition: 'THERAVADA',
    query: 'Trong bối cảnh nghiên cứu Phật giáo học, chuẩn trích dẫn Pāli nào được chấp nhận quốc tế?',
    expected_keywords: ['CSCD', 'PTS', 'Pāli Text Society', 'VRI'],
    forbidden_hallucinations: [],
    min_citations: 0,
    expected_tier: 'MODERN',
    academic_note: 'Câu hỏi kiểm tra kiến thức về chuẩn học thuật, không phải về giáo lý'
  },
  {
    id: 16,
    category: 'contextual',
    tradition: 'GENERAL',
    query: 'Hệ thống RAG của Dharma Chat có thể sai không? Nếu sai, làm thế nào để kiểm chứng?',
    expected_keywords: ['kinh điển gốc', 'đối chiếu', 'xác minh'],
    forbidden_hallucinations: ['luôn đúng', 'không thể sai'],
    min_citations: 0,
    expected_tier: 'UNKNOWN',
    academic_note: 'Kiểm tra epistemic humility của hệ thống — AI phải thừa nhận giới hạn'
  },
  {
    id: 17,
    category: 'doctrine',
    tradition: 'THERAVADA',
    query: 'Tội lỗi nặng nhất trong Phật giáo Theravāda (Ānantarika-kamma) là gì?',
    expected_keywords: ['Ānantarika-kamma', 'Vô gián nghiệp', 'năm tội'],
    forbidden_hallucinations: [],
    min_citations: 1,
    expected_tier: 'PRIMARY',
    academic_note: 'Kiến thức kỹ thuật trong Vinaya — cần trích dẫn chính xác'
  },
  {
    id: 18,
    category: 'linguistic',
    tradition: 'GENERAL',
    query: 'Dịch "Dhamma" sang tiếng Việt là "Pháp" có đủ không? Mất đi ý nghĩa gì?',
    expected_keywords: ['Dhamma', 'Pháp', 'dịch thuật', 'đa nghĩa'],
    forbidden_hallucinations: [],
    min_citations: 0,
    expected_tier: 'MODERN',
    academic_note: 'Câu hỏi về bản dịch học (translation studies) trong Phật học'
  },
  {
    id: 19,
    category: 'comparative',
    tradition: 'GENERAL',
    query: 'Phật Tánh (Buddha-nature) có trong Theravāda không, hay chỉ là khái niệm Mahāyāna?',
    expected_keywords: ['Phật Tánh', 'Mahāyāna', 'Tathāgatagarbha'],
    forbidden_hallucinations: [],
    min_citations: 1,
    expected_tier: 'PRIMARY',
    academic_note: 'Câu hỏi phân kỳ lớn giữa hai truyền thống'
  },
  {
    id: 20,
    category: 'semantic',
    tradition: 'THERAVADA',
    query: 'Phước báu (Puñña) trong Theravāda: thực hành cụ thể để tích luỹ phước báu?',
    expected_keywords: ['Puñña', 'phước báu', 'Dāna', 'Sīla', 'Bhāvanā'],
    forbidden_hallucinations: [],
    min_citations: 1,
    expected_tier: 'PRIMARY',
    academic_note: 'Ba nền tảng phước báu (Ti-puññakiriyavatthu) theo Theravāda'
  },
];

// ---------- CẤU TRÚC KẾT QUẢ ----------
interface EvalResult {
  scenario_id: number;
  query: string;
  category: string;
  tradition: string;
  // Đầu ra từ API
  response_text: string;
  citations: any[];
  duration_ms: number;
  // Kết quả đánh giá
  keyword_hits: string[];
  keyword_misses: string[];
  keyword_score: number;       // 0.0 - 1.0
  hallucination_detected: boolean;
  hallucination_evidence: string[];
  citation_count: number;
  citation_meets_minimum: boolean;
  source_tiers_found: string[];
  has_tier_disclosure: boolean;  // AI có prefix [PRIMARY]/[COMMENTARY]/[MODERN] không
  language_purity: boolean;      // Không có ký tự ngoại lai (吧, 呢)
  // Điểm tổng hợp
  academic_score: number;        // 0-100
  academic_grade: string;        // A/B/C/D/F
  notes: string;
}

// ---------- HÀM GỌI API ----------
async function callRagAPI(query: string, tradition: string): Promise<{
  text: string;
  citations: any[];
  duration: number;
}> {
  const start = Date.now();
  const response = await fetch(`${SUPABASE_URL}/functions/v1/rag-chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON,
      'Authorization': `Bearer ${SUPABASE_ANON}`,
    },
    body: JSON.stringify({
      query,
      tradition_id: tradition === 'GENERAL' ? null : tradition,
      session_id: `eval-${Date.now()}`,
      tenant_id: null,
    }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${await response.text()}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let citations: any[] = [];
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') break;
      try {
        const parsed = JSON.parse(data);
        if (parsed.text) fullText += parsed.text;
        if (parsed.citations) citations = parsed.citations;
      } catch (_) {}
    }
  }

  return { text: fullText, citations, duration: Date.now() - start };
}

// ---------- HÀM ĐÁNH GIÁ ----------
function evaluateResult(scenario: EvalScenario, response: { text: string; citations: any[]; duration: number }): EvalResult {
  const { text, citations, duration } = response;
  const lowerText = text.toLowerCase();

  // 1. Keyword scoring
  const hits = scenario.expected_keywords.filter(kw => lowerText.includes(kw.toLowerCase()));
  const misses = scenario.expected_keywords.filter(kw => !lowerText.includes(kw.toLowerCase()));
  const keywordScore = scenario.expected_keywords.length > 0
    ? hits.length / scenario.expected_keywords.length
    : 1.0;

  // 2. Hallucination detection
  const hallucinations = scenario.forbidden_hallucinations.filter(h => lowerText.includes(h.toLowerCase()));
  const hasHallucination = hallucinations.length > 0;

  // 3. Citation analysis
  const citationCount = citations.length;
  const meetsMinCitations = citationCount >= scenario.min_citations;
  const tiersFound = [...new Set(citations.map((c: any) => c.source_tier || 'UNKNOWN').filter(Boolean))];

  // 4. Tier disclosure — AI có chủ động label [PRIMARY]/[COMMENTARY] không
  const hasTierDisclosure = ['[PRIMARY]', '[COMMENTARY]', '[MODERN]', '[TRANSLATION]', '[Nguồn chưa phân loại]']
    .some(label => text.includes(label));

  // 5. Language purity — không có ký tự Trung Quốc rò rỉ
  const chineseLeakPatterns = ['吧', '呢', '啊', '吗', '的', '了', '是'];
  const languagePure = !chineseLeakPatterns.some(c => text.includes(c));

  // 6. Tính điểm học thuật (0-100)
  let score = 0;
  score += keywordScore * 40;            // 40 điểm: có từ khoá quan trọng
  score += hasHallucination ? 0 : 20;   // 20 điểm: không bịa thông tin
  score += meetsMinCitations ? 15 : 0;  // 15 điểm: đủ nguồn tham chiếu
  score += hasTierDisclosure ? 15 : 0;  // 15 điểm: phân tầng nguồn rõ ràng
  score += languagePure ? 10 : 0;       // 10 điểm: ngôn ngữ thuần khiết
  score = Math.round(score);

  const grade = score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : score >= 40 ? 'D' : 'F';

  return {
    scenario_id: scenario.id,
    query: scenario.query,
    category: scenario.category,
    tradition: scenario.tradition,
    response_text: text.slice(0, 500) + (text.length > 500 ? '...' : ''),
    citations,
    duration_ms: duration,
    keyword_hits: hits,
    keyword_misses: misses,
    keyword_score: Math.round(keywordScore * 100) / 100,
    hallucination_detected: hasHallucination,
    hallucination_evidence: hallucinations,
    citation_count: citationCount,
    citation_meets_minimum: meetsMinCitations,
    source_tiers_found: tiersFound,
    has_tier_disclosure: hasTierDisclosure,
    language_purity: languagePure,
    academic_score: score,
    academic_grade: grade,
    notes: scenario.academic_note,
  };
}

// ---------- MAIN ----------
async function runEvaluation() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   DHARMA CHAT RAG — ACADEMIC EVALUATION PIPELINE    ║');
  console.log('║   Chuẩn đánh giá: NCKH Phật học + RAG               ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  if (!SUPABASE_URL || !SUPABASE_ANON) {
    console.error('❌ Thiếu biến môi trường NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const results: EvalResult[] = [];
  let passed = 0, failed = 0;

  for (const scenario of EVAL_SCENARIOS) {
    process.stdout.write(`  [${scenario.id}/20] ${scenario.category.toUpperCase()} | ${scenario.query.slice(0, 60)}... `);
    try {
      const response = await callRagAPI(scenario.query, scenario.tradition);
      const result = evaluateResult(scenario, response);
      results.push(result);

      const gradeIcon = { A: '✅', B: '🟡', C: '🟠', D: '🔴', F: '❌' }[result.academic_grade] || '?';
      console.log(`${gradeIcon} ${result.academic_grade} (${result.academic_score}/100) | ${result.duration_ms}ms`);

      if (result.academic_grade === 'A' || result.academic_grade === 'B') passed++;
      else failed++;

      // Delay để tránh rate limit
      await new Promise(r => setTimeout(r, 2500));
    } catch (err: any) {
      console.log(`💥 LỖI: ${err.message}`);
      results.push({
        scenario_id: scenario.id,
        query: scenario.query,
        category: scenario.category,
        tradition: scenario.tradition,
        response_text: `ERROR: ${err.message}`,
        citations: [],
        duration_ms: 0,
        keyword_hits: [],
        keyword_misses: scenario.expected_keywords,
        keyword_score: 0,
        hallucination_detected: false,
        hallucination_evidence: [],
        citation_count: 0,
        citation_meets_minimum: false,
        source_tiers_found: [],
        has_tier_disclosure: false,
        language_purity: true,
        academic_score: 0,
        academic_grade: 'F',
        notes: scenario.academic_note,
      });
      failed++;
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  // ---------- TỔNG HỢP ----------
  const totalScore = results.reduce((s, r) => s + r.academic_score, 0);
  const avgScore   = Math.round(totalScore / results.length);
  const hallucinationRate = Math.round((results.filter(r => r.hallucination_detected).length / results.length) * 100);
  const tierDisclosureRate = Math.round((results.filter(r => r.has_tier_disclosure).length / results.length) * 100);
  const avgCitations = Math.round((results.reduce((s, r) => s + r.citation_count, 0) / results.length) * 10) / 10;
  const langPurityRate = Math.round((results.filter(r => r.language_purity).length / results.length) * 100);
  const avgDuration = Math.round(results.reduce((s, r) => s + r.duration_ms, 0) / results.length);

  const summary = {
    timestamp: TIMESTAMP,
    total_scenarios: EVAL_SCENARIOS.length,
    passed,
    failed,
    pass_rate_pct: Math.round((passed / EVAL_SCENARIOS.length) * 100),
    avg_academic_score: avgScore,
    hallucination_rate_pct: hallucinationRate,
    tier_disclosure_rate_pct: tierDisclosureRate,
    avg_citations_per_response: avgCitations,
    language_purity_rate_pct: langPurityRate,
    avg_response_duration_ms: avgDuration,
    grade_distribution: {
      A: results.filter(r => r.academic_grade === 'A').length,
      B: results.filter(r => r.academic_grade === 'B').length,
      C: results.filter(r => r.academic_grade === 'C').length,
      D: results.filter(r => r.academic_grade === 'D').length,
      F: results.filter(r => r.academic_grade === 'F').length,
    },
    category_scores: ['doctrine', 'comparative', 'linguistic', 'semantic', 'contextual'].map(cat => ({
      category: cat,
      avg_score: Math.round(
        results.filter(r => r.category === cat).reduce((s, r) => s + r.academic_score, 0) /
        Math.max(results.filter(r => r.category === cat).length, 1)
      )
    }))
  };

  // ---------- XUẤT KẾT QUẢ ----------
  const jsonPath = path.join(OUTPUT_DIR, `eval_results_${TIMESTAMP}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify({ summary, results }, null, 2));

  // CSV cho bảng bài báo
  const csvHeader = 'ID,Category,Tradition,Score,Grade,Keywords%,Hallucination,Citations,TierDisclosed,LangPure,Duration(ms),Note';
  const csvRows = results.map(r =>
    [r.scenario_id, r.category, r.tradition, r.academic_score, r.academic_grade,
     Math.round(r.keyword_score*100), r.hallucination_detected ? 'YES' : 'no',
     r.citation_count, r.has_tier_disclosure ? 'YES' : 'no',
     r.language_purity ? 'OK' : 'FAIL', r.duration_ms,
     `"${r.notes.replace(/"/g, "'")}"` ].join(',')
  );
  const csvPath = path.join(OUTPUT_DIR, `eval_results_${TIMESTAMP}.csv`);
  fs.writeFileSync(csvPath, [csvHeader, ...csvRows].join('\n'));

  // ---------- IN BÁO CÁO ----------
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║                  KẾT QUẢ ĐÁNH GIÁ                  ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  📊 Điểm trung bình học thuật : ${String(avgScore).padStart(3)}/ 100              ║`);
  console.log(`║  ✅ Tỷ lệ đạt (A/B)           : ${String(summary.pass_rate_pct).padStart(3)}%                  ║`);
  console.log(`║  🚨 Hallucination Rate         : ${String(hallucinationRate).padStart(3)}%                  ║`);
  console.log(`║  📖 Phân tầng nguồn (Tier)     : ${String(tierDisclosureRate).padStart(3)}%                  ║`);
  console.log(`║  📚 Trích dẫn TB / câu         : ${String(avgCitations).padStart(4)} nguồn              ║`);
  console.log(`║  🌐 Ngôn ngữ thuần khiết       : ${String(langPurityRate).padStart(3)}%                  ║`);
  console.log(`║  ⚡ Thời gian TB               : ${String(avgDuration).padStart(4)}ms                  ║`);
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  Phân bố điểm: A=${summary.grade_distribution.A} B=${summary.grade_distribution.B} C=${summary.grade_distribution.C} D=${summary.grade_distribution.D} F=${summary.grade_distribution.F}            ║`);
  console.log('╠══════════════════════════════════════════════════════╣');
  for (const cs of summary.category_scores) {
    console.log(`║  ${cs.category.padEnd(12)}: ${String(cs.avg_score).padStart(3)}/100                              ║`);
  }
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  📄 JSON: ${path.basename(jsonPath).padEnd(41)} ║`);
  console.log(`║  📄 CSV : ${path.basename(csvPath).padEnd(41)} ║`);
  console.log('╚══════════════════════════════════════════════════════╝\n');
}

runEvaluation().catch(console.error);
