
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

async function listCategories() {
    console.log('--- 🔍 DANH SÁCH CHUYÊN ĐỀ PHẬT HỌC ---');
    const { data, error } = await supabase
        .from('dharma_categories')
        .select('id, name, description')
        .order('name', { ascending: true });

    if (error) {
        console.error('❌ Lỗi:', error.message);
    } else {
        console.log(`Tìm thấy ${data.length} chuyên đề.`);
        data.forEach(c => console.log(`- ${c.name}`));
    }
}

listCategories();
