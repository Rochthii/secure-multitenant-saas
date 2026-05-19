
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

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function runChatTest(query, label) {
    console.log(`\n--- 🧪 TEST: ${label} ---`);
    console.log(`Câu hỏi: "${query}"`);

    const response = await fetch(`${SUPABASE_URL}/functions/v1/rag-chat`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ query, session_id: 'cache-test-session' })
    });

    if (!response.ok) {
        console.error('❌ Lỗi:', await response.text());
        return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let firstChunk = true;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                try {
                    const data = JSON.parse(line.substring(6));
                    if (data.text) {
                        if (firstChunk) {
                            process.stdout.write(`AI Phản hồi: ${data.text}`);
                            firstChunk = false;
                        } else {
                            process.stdout.write(data.text);
                        }
                    }
                } catch (e) {}
            }
        }
    }
    console.log('\n--- Xong ---');
}

async function startDoubleTest() {
    const testQuery = "Sư cho con hỏi, Vô thường trong đạo Phật nghĩa là gì?";
    
    // Lần 1: Chắc chắn là MISS (nếu chưa hỏi bao giờ)
    await runChatTest(testQuery, "LẦN 1 - KIỂM TRA CACHE MISS (GỌI GEMINI)");
    
    console.log('\n--- Chờ 2 giây để DB ổn định... ---');
    await new Promise(r => setTimeout(r, 2000));

    // Lần 2: Phải là HIT
    await runChatTest(testQuery, "LẦN 2 - KIỂM TRA CACHE HIT (TRÍCH XUẤT ĐỆM)");
}

startDoubleTest();
