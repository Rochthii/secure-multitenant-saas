import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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

async function singleRequest(id) {
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/rag-chat`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ query: "Tam bảo là gì? " + id, session_id: 'stress-test-' + id })
        });

        const text = await response.text();
        if (text.includes("Hệ thống đã đạt giới hạn")) {
            console.log(`[Request ${id}] ⚠️ ĐÃ CHẠM GIỚI HẠN (429)`);
            return true;
        } else {
            console.log(`[Request ${id}] ✅ Thành công`);
            return false;
        }
    } catch (e) {
        console.log(`[Request ${id}] ❌ Lỗi kết nối: ${e.message}`);
        return null;
    }
}

async function runTest() {
    console.log("--- 🚀 ĐANG CHẠY STRESS TEST (10 REQUESTS ĐỒNG THỜI) ---");
    const tasks = [];
    for (let i = 1; i <= 10; i++) {
        tasks.push(singleRequest(i));
    }
    const results = await Promise.all(tasks);
    const failures = results.filter(r => r === true).length;
    console.log(`\n--- KẾT QUẢ: ${failures}/10 request chạm giới hạn ---`);
    if (failures === 0) {
        console.log("Hệ thống hiện tại đang rất ổn định, chưa đạt giới hạn tải.");
    }
}

runTest();
