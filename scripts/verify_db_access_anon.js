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

// SỬ DỤNG ANON KEY THAY VÌ SERVICE_ROLE_KEY
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function verifyTableAccessibilityAnon() {
    console.log('\n--- 🔑 VERIFYING TABLE ACCESSIBILITY (ANON KEY) ---');
    
    // Test fetch từ Edge Function
    const tables = ['dharma_embeddings', 'dharma_documents', 'dharma_categories', 'ai_query_cache', 'chat_messages'];
    
    for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) {
            console.error(`❌ Table ${table}: ${error.message} (Code: ${error.code})`);
        } else {
            console.log(`✅ Table ${table}: ${count} rows found.`);
        }
    }
}

verifyTableAccessibilityAnon();
