import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectRLS() {
    console.log('--- 🛡️ INSPECTING RLS POLICIES ---');
    
    // Check if RLS is enabled and what policies exist
    const { data: policies, error } = await supabase.rpc('get_policies_info');
    
    if (error) {
        console.log('Không thể lấy policy info qua RPC. Thử query trực tiếp pg_policies...');
        const { data: pgPolicies, error: pgErr } = await supabase.from('pg_policies').select('*').limit(20);
        // Note: pg_policies is a system view, might not be accessible via Supabase client directly
        if (pgErr) {
             console.log('Gần như chắc chắn RLS đang chặn hoặc thiếu Policy cho bảng Dharma.');
        }
    }
}

async function verifyTableAccessibility() {
    console.log('\n--- 🔑 VERIFYING TABLE ACCESSIBILITY ---');
    
    const tables = ['dharma_embeddings', 'dharma_documents', 'dharma_categories', 'ai_query_cache', 'chat_messages'];
    
    for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) {
            console.error(`❌ Table ${table}: ${error.message}`);
        } else {
            console.log(`✅ Table ${table}: ${count} rows found.`);
        }
    }
}

verifyTableAccessibility();
