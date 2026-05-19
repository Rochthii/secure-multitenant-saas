
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

async function checkInfrastructure() {
    console.log('--- 🔍 KIỂM TRA HẠ TẦNG SEMANTIC CACHE ---');
    
    // Kiểm tra bảng ai_query_cache
    const { data: tableCheck, error: tableError } = await supabase
        .from('ai_query_cache')
        .select('id')
        .limit(1);

    if (tableError) {
        console.log('❌ Bảng ai_query_cache chưa tồn tại hoặc Sư chưa RUN SQL.');
        console.log('Lỗi:', tableError.message);
        return false;
    } else {
        console.log('✅ Bảng ai_query_cache đã sẵn sàng.');
    }

    // Kiểm tra RPC
    const { error: rpcError } = await supabase.rpc('match_ai_query_cache', {
        query_embedding: new Array(768).fill(0),
        match_threshold: 0.95,
        match_count: 1
    });

    if (rpcError && rpcError.message.includes('function does not exist')) {
        console.log('❌ Hàm match_ai_query_cache chưa được tạo.');
        return false;
    } else {
        console.log('✅ Hàm RPC match_ai_query_cache đã sẵn sàng.');
    }

    return true;
}

checkInfrastructure();
