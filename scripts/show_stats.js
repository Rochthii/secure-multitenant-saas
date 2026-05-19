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

async function showStats() {
    console.log('\n--- 📊 THỐNG KÊ TÀNG THƯ TRI THỨC SƯ SỐ ---');
    
    // Sử dụng Join để lấy tên chuyên đề
    const { data, error } = await supabase
        .from('dharma_documents')
        .select(`
            title,
            dharma_categories (
                name
            )
        `);

    if (error) {
        console.error('❌ Lỗi:', error.message);
    } else {
        console.log(`Tìm thấy ${data.length} bộ tài liệu trong tàng thư.\n`);
        data.forEach((d, i) => {
            const catName = d.dharma_categories ? d.dharma_categories.name : 'Chưa phân loại';
            console.log(`${i + 1}. 📖 Tài liệu: ${d.title}`);
            console.log(`   📁 Chuyên đề: ${catName}\n`);
        });
        
        console.log('--- ✅ KIỂM TRA HOÀN TẤT ---');
    }
}

showStats();
