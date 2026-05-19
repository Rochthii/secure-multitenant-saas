/**
 * Script tìm kiếm Tech RAG (Chuyên dụng cho AI Agent)
 * 
 * Cách dùng:
 * node scripts/search_tech_rag.js "Làm sao để setup Riverpod Provider?"
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
    const envPath = join(__dirname, '..', '.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...vals] = line.split('=');
        if (key && vals.length) {
            process.env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
        }
    });
} catch (e) {}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !GEMINI_API_KEY) {
    console.error('❌ Missing configuration! Check .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function search() {
    const query = process.argv.slice(2).join(' ');
    if (!query) {
        console.log('Vui lòng nhập truy vấn. Ví dụ: node search_tech_rag.js "React state"');
        return;
    }

    try {
        // 1. Lấy embedding của câu hỏi
        const queryEmbedding = await getEmbedding(query);

        if (!queryEmbedding) throw new Error('Không tạo được vector câu hỏi.');

        // 2. Tìm kiếm Vector
        const { data: documents, error } = await supabase.rpc(
            "match_tech_embeddings",
            {
                query_embedding: queryEmbedding,
                match_threshold: 0.5,
                match_count: 5,
            }
        );

        if (error) throw error;

        console.log(`\n🔎 KẾT QUẢ TÌM KIẾM VECTOR CHO: "${query}"\n`);
        
        if (!documents || documents.length === 0) {
            console.log("⚠️ Không tìm thấy tài liệu kỹ thuật nào khớp.");
            return;
        }

        documents.forEach((doc, idx) => {
            console.log(`--- [Tài liệu ${idx + 1}: ${doc.document_title} | Độ khớp: ${(doc.similarity * 100).toFixed(1)}%] ---`);
            console.log(doc.content);
            console.log('\n');
        });

    } catch (e) {
        console.error('❌ Lỗi:', e.message);
    }
}

search();
