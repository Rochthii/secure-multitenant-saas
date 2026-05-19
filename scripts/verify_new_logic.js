import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
const envPath = join(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const GEMINI_API_KEY = env.GEMINI_API_KEY;

async function verifyLogic() {
    console.log('--- 🧪 KIỂM TRA LOGIC TRÍCH DẪN MỚI ---');
    const query = "Ý nghĩa của Kinh Phước Đức (Mangala Sutta) là gì?";

    try {
        // 1. Tạo Vector cho câu hỏi
        const embedRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2-preview:embedContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "models/gemini-embedding-2-preview",
                    content: { parts: [{ text: query }] },
                    output_dimensionality: 1536
                }),
            }
        );
        const embedData = await embedRes.json();
        const embedding = embedData.embedding.values;

        // 2. Tìm kiếm trong Database (Sử dụng RPC đã nâng cấp)
        const { data: documents, error } = await supabase.rpc("match_dharma_embeddings", {
            query_embedding: embedding,
            match_threshold: 0.5,
            match_count: 3,
        });

        if (error) throw error;

        // 3. Áp dụng Logic Citation học thuật (giống Edge Function thật)
        console.log('\n🔍 Đã tìm thấy', documents.length, 'đoạn dẫn chứng.\n');
        
        const citations = [...new Set(documents.map((d) => {
            const suttaCode  = d.chunk_metadata?.sutta_code;
            const verseNum   = d.chunk_metadata?.verse_number;
            const translator = d.doc_metadata?.translator;
            
            let ref = "";
            if (suttaCode && verseNum) ref = ` (${suttaCode}, kệ ${verseNum})`;
            else if (suttaCode) ref = ` (${suttaCode})`;
            
            const transRef = translator ? ` — ${translator}` : "";
            const catLabel = d.category_name ? `[${d.category_name}] ` : "";
            
            return `${catLabel}${d.document_title}${ref}${transRef}`;
        }))];

        console.log('✅ KẾT QUẢ CITATION CHUẨN HỌC THUẬT:');
        citations.forEach(c => console.log('  👉', c));
        
        // Kiểm tra metadata thực tế
        console.log('\n📦 Chi tiết metadata từng chunk:');
        documents.forEach((d, i) => {
            console.log(`\n  Chunk ${i+1}: "${d.document_title}"`);
            console.log(`    category: ${d.category_name}`);
            console.log(`    chunk_metadata:`, JSON.stringify(d.chunk_metadata));
            console.log(`    doc_metadata:`, JSON.stringify(d.doc_metadata));
            console.log(`    similarity: ${(d.similarity * 100).toFixed(1)}%`);
        });

    } catch (e) {
        console.error('❌ Lỗi:', e.message);
    }
}

verifyLogic();
