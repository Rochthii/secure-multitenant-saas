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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;

async function testWebCallNoAuth() {
    console.log('--- 🧪 DEBUG EDGE FUNCTION NO AUTH HEADERS ---');
    try {
        const payload = {
            query: "Sư có một thắc mắc..."
        };

        const response = await fetch(`${supabaseUrl}/functions/v1/rag-chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            console.error('Error Body:', await response.text());
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

testWebCallNoAuth();
