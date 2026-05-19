// seed-dharma-talks.mjs
// Chạy: node scripts/seed-dharma-talks.mjs

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
try {
    const envPath = join(__dirname, '..', '.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...vals] = line.split('=');
        if (key && vals.length) {
            process.env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
        }
    });
} catch (e) {
    console.log('No .env.local found, using process.env');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const dharmaTalks = [
    {
        title_vi: 'Pháp Thoại - Chùa Chantarangsay (1)',
        title_km: 'ធម្មទេសនា - វត្តចន្ទរង្សី',
        title_en: 'Dharma Talk - Chantarangsay Temple (1)',
        description_vi: 'Bài pháp thoại về giáo lý Phật giáo Nam tông Khmer tại chùa Chantarangsay.',
        media_type: 'video',
        media_url: 'https://youtu.be/FjLBM4m8cqA?si=ZSuPCd0yFPZszsel',
        thumbnail_url: 'https://img.youtube.com/vi/FjLBM4m8cqA/maxresdefault.jpg',
        speaker_name_vi: 'Chùa Chantarangsay',
        speaker_name_km: 'វត្តចន្ទរង្សី',
        topic_vi: 'Pháp thoại',
        is_active: true,
        is_featured: true,
        order_position: 1,
        view_count: 0,
    },
    {
        title_vi: 'Pháp Thoại - Chùa Chantarangsay (2)',
        title_km: 'ធម្មទេសនា - វត្តចន្ទរង្សី',
        title_en: 'Dharma Talk - Chantarangsay Temple (2)',
        description_vi: 'Bài pháp thoại về tu tập và đời sống tâm linh theo truyền thống Khmer.',
        media_type: 'video',
        media_url: 'https://youtu.be/_g8SdYGthJg?si=KFMDg-mSzDZWh5fZ',
        thumbnail_url: 'https://img.youtube.com/vi/_g8SdYGthJg/maxresdefault.jpg',
        speaker_name_vi: 'Chùa Chantarangsay',
        speaker_name_km: 'វត្តចន្ទរង្សី',
        topic_vi: 'Pháp thoại',
        is_active: true,
        is_featured: true,
        order_position: 2,
        view_count: 0,
    },
    {
        title_vi: 'Pháp Thoại - Chùa Chantarangsay (3)',
        title_km: 'ធម្មទេសនា - វត្តចន្ទរង្សី',
        title_en: 'Dharma Talk - Chantarangsay Temple (3)',
        description_vi: 'Bài pháp thoại về thiền định và giác ngộ trong Phật giáo Theravāda.',
        media_type: 'video',
        media_url: 'https://youtu.be/fMiUOT7NNLA?si=RoTo8M01glhQ_Z-A',
        thumbnail_url: 'https://img.youtube.com/vi/fMiUOT7NNLA/maxresdefault.jpg',
        speaker_name_vi: 'Chùa Chantarangsay',
        speaker_name_km: 'វត្តចន្ទរង្សី',
        topic_vi: 'Thiền định',
        is_active: true,
        is_featured: true,
        order_position: 3,
        view_count: 0,
    },
    {
        title_vi: 'Pháp Thoại - Chùa Chantarangsay (4)',
        title_km: 'ធម្មទេសនា - វត្តចន្ទរង្សី',
        title_en: 'Dharma Talk - Chantarangsay Temple (4)',
        description_vi: 'Bài pháp thoại về văn hóa và phong tục Phật giáo Khmer.',
        media_type: 'video',
        media_url: 'https://youtu.be/hx_GwQXPZFA?si=_ycTfPSxGkOv6yWN',
        thumbnail_url: 'https://img.youtube.com/vi/hx_GwQXPZFA/maxresdefault.jpg',
        speaker_name_vi: 'Chùa Chantarangsay',
        speaker_name_km: 'វត្តចន្ទរង្សី',
        topic_vi: 'Văn hóa Khmer',
        is_active: true,
        is_featured: true,
        order_position: 4,
        view_count: 0,
    },
];

async function seed() {
    console.log('🌱 Seeding dharma talks...\n');

    // Xóa dữ liệu mẫu cũ nếu có (is_featured = true)
    const { error: deleteError } = await supabase
        .from('dharma_talks')
        .delete()
        .eq('is_featured', true);

    if (deleteError) {
        console.warn('⚠️  Could not delete old data (table may not exist yet):', deleteError.message);
    } else {
        console.log('🗑️  Cleared old featured dharma talks');
    }

    // Insert mới
    const { data, error } = await supabase
        .from('dharma_talks')
        .insert(dharmaTalks)
        .select('id, title_vi');

    if (error) {
        console.error('❌ Insert error:', error.message);
        console.error('Details:', error.details);
        process.exit(1);
    }

    console.log(`✅ Inserted ${data.length} dharma talks:`);
    data.forEach(t => console.log(`   - ${t.title_vi} (id: ${t.id})`));
    console.log('\n🎉 Done! Refresh the homepage to see the changes.');
}

seed();
