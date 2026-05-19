import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { TextDecoder } from 'util';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RAG_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/rag-chat`;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { response_mime_type: "application/json" }
    })
  });
  const data = await res.json();
  try {
    const text = data.candidates[0].content.parts[0].text;
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse Gemini response:", data);
    return null;
  }
}

async function consumeStream(response) {
  const reader = response.body;
  const decoder = new TextDecoder();
  let fullText = "";
  let citations = [];
  
  for await (const chunk of reader) {
    const chunkStr = decoder.decode(chunk, { stream: true });
    const lines = chunkStr.split("\n");
    for (const line of lines) {
      if (line.trim().startsWith("data: ")) {
        const dataStr = line.trim().substring(6);
        if (dataStr === "[DONE]") continue;
        try {
          const data = JSON.parse(dataStr);
          if (data.text) fullText += data.text;
          if (data.citations) citations = data.citations;
        } catch (e) {
          // Skip partials
        }
      }
    }
  }
  return { fullText, citations };
}

async function runEvaluation() {
  console.log("🚀 Starting RAG Evaluation Pipeline...");

  const { data: dataset, error: dsError } = await supabase
    .from('rag_golden_dataset')
    .select('*')
    .eq('is_active', true)
    .limit(3); // Test with 3 first for speed

  if (dsError) {
    console.error("Error fetching dataset:", dsError);
    return;
  }

  const { data: run, error: runError } = await supabase
    .from('rag_evaluation_runs')
    .insert([{
      name: `Automated Eval - ${new Date().toISOString()}`,
      model_version: 'gemini-2.5-flash',
      status: 'running'
    }])
    .select()
    .single();

  if (runError) {
    console.error("Error creating eval run:", runError);
    return;
  }

  let totalGroundedness = 0;
  let totalCitationAccuracy = 0;

  for (const testCase of dataset) {
    console.log(`\n📝 Testing: "${testCase.question}"`);

    const startTime = Date.now();
    const ragRes = await fetch(RAG_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        query: testCase.question,
        session_id: '66cf7dad-6bc9-467a-87ba-2cbc26ebd919' // Use a known valid session
      })
    });

    if (!ragRes.ok) {
        console.error(`RAG API failed: ${ragRes.status}`);
        continue;
    }

    const { fullText, citations } = await consumeStream(ragRes);
    const latency = Date.now() - startTime;

    // LLM Grading
    const evalPrompt = `
      Evaluate the RAG response.
      QUESTION: "${testCase.question}"
      GOLDEN ANSWER: "${testCase.expected_answer}"
      ACTUAL ANSWER: "${fullText}"
      ACTUAL CITATIONS: "${JSON.stringify(citations.map(c => c.text))}"

      Return JSON: { "groundedness": 0-1, "citation_accuracy": 0-1, "reason": "..." }
    `;

    const scores = await callGemini(evalPrompt) || { groundedness: 0, citation_accuracy: 0, reason: "Eval failed" };

    console.log(`   - Groundedness: ${scores.groundedness}`);
    console.log(`   - Citation Accuracy: ${scores.citation_accuracy}`);

    await supabase.from('rag_evaluation_results').insert([{
      run_id: run.id,
      test_case_id: testCase.id,
      actual_answer: fullText,
      groundedness_score: scores.groundedness,
      citation_accuracy_score: scores.citation_accuracy,
      latency_ms: latency,
      eval_notes: scores.reason
    }]);

    totalGroundedness += scores.groundedness;
    totalCitationAccuracy += scores.citation_accuracy;
  }

  const count = dataset.length;
  await supabase.from('rag_evaluation_runs').update({
    status: 'completed',
    avg_groundedness: totalGroundedness / count,
    avg_citation_accuracy: totalCitationAccuracy / count
  }).eq('id', run.id);

  console.log(`\n✅ Evaluation Complete! Run ID: ${run.id}`);
}

runEvaluation().catch(console.error);
