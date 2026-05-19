import { createClient } from '@supabase/supabase-js';
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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

async function testEdgeFunction() {
    console.log('--- 🧪 DEBUG EDGE FUNCTION ---');
    console.log(`URL: ${supabaseUrl}/functions/v1/rag-chat`);
    
    try {
        const response = await fetch(`${supabaseUrl}/functions/v1/rag-chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({ 
                query: "người cư sĩ tại gia cần thực hành những điều gì",
                session_id: "test-session" 
            })
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            const err = await response.text();
            console.error('Error Body:', err);
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            console.log('Chunk:', chunk);
        }

    } catch (e) {
        console.error('Fetch Error:', e.message);
    }
}

testEdgeFunction();
