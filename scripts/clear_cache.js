import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const [k, ...v] = line.split('=');
    if (k && v.length) acc[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
    return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function clearCache() {
    console.log("Clearing cache...");
    const { data, error } = await supabase.from('ai_query_cache').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
        console.error('Error clearing cache:', error);
    } else {
        console.log('Cache cleared successfully!');
    }
}
clearCache();
