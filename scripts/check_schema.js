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

async function checkSchema() {
    console.log('--- 📋 CHECKING DATABASE SCHEMA ---');
    
    // Check Columns in chat_messages
    const { data: cols, error: colErr } = await supabase.rpc('get_column_info', { table_name: 'chat_messages' });
    
    if (colErr) {
        // Fallback: try to select one row
        const { data: row, error: rowErr } = await supabase.from('chat_messages').select('*').limit(1);
        if (rowErr) {
            console.error('Error selecting from chat_messages:', rowErr.message);
        } else {
            console.log('Columns in chat_messages:', Object.keys(row[0] || {}).join(', '));
        }
    } else {
        console.log('Columns in chat_messages:', cols.map(c => c.column_name).join(', '));
    }

    // Check ai_query_cache
    const { data: cacheRow, error: cacheErr } = await supabase.from('ai_query_cache').select('*').limit(1);
    console.log('Columns in ai_query_cache:', Object.keys(cacheRow?.[0] || {}).join(', '));
    // Check dharma_documents
    const { data: docRow, error: docErr } = await supabase.from('dharma_documents').select('*').limit(1);
    console.log('Columns in dharma_documents:', Object.keys(docRow?.[0] || {}).join(', '));
    
    // Check dharma_embeddings
    const { data: embRow, error: embErr } = await supabase.from('dharma_embeddings').select('*').limit(1);
    console.log('Columns in dharma_embeddings:', Object.keys(embRow?.[0] || {}).join(', '));
}

checkSchema();
