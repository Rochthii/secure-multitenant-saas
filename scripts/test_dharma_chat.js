import * as dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env
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
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testChat() {
    console.log('--- 🧪 ĐANG KIỂM TRA PHẢN HỒI CỦA SƯ SỐ ---');
    const query = "tam bảo";

    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/rag-chat`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ query, session_id: 'test-session-001' })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('❌ Lỗi Edge Function:', err);
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        process.stdout.write('Sư Số trả lời: ');

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.substring(6));
                        if (data.text) process.stdout.write(data.text);
                        if (data.citations) console.log('\n\n📚 Nguồn dẫn chứng:', data.citations);
                    } catch (e) {}
                }
            }
        }
        console.log('\n\n--- ✅ ĐÃ XONG ---');
    } catch (e) {
        console.error('❌ Lỗi kết nối:', e.message);
    }
}

testChat();
