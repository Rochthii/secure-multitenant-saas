/**
 * Script: Update about_sections data trong Supabase
 * Cập nhật summary_vi cho section 'intro' và sửa thumbnail sai
 * 
 * Chạy: node scripts/seed-about-sections.mjs
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Cần service role để update
);

const INTRO_SUMMARY = `Chùa Chantarangsay (ចន្ទរង្សី - "Ánh Trăng") là ngôi chùa Phật giáo Nam tông Khmer đầu tiên tại Sài Gòn, tọa lạc tại 164/235 Trần Quốc Thảo, Quận 3, TP. Hồ Chí Minh.

Được khởi lập từ năm 1946 bởi Đại đức Lâm Em, trải qua hơn 80 năm hình thành và phát triển, chùa đã được công nhận là Di tích Kiến trúc Nghệ thuật cấp Thành phố. Với diện tích 4.500m², chánh điện hai tầng hướng Đông, mái ba tầng với ba ngọn tháp Tam Bảo và những bức tranh khắc nổi kể về hành trình tu tập của Đức Phật.

Không chỉ là chốn tâm linh thanh tịnh, chùa còn là trung tâm văn hóa với các lớp dạy chữ Khmer miễn phí, là biểu tượng đoàn kết của cộng đồng người Khmer tại TP. Hồ Chí Minh.`;

async function updateAboutSections() {
    console.log('🔄 Bắt đầu cập nhật about_sections...\n');

    // 1. Update summary_vi cho section 'intro'
    const { data: introData, error: introError } = await supabase
        .from('about_sections')
        .update({ summary_vi: INTRO_SUMMARY })
        .eq('key', 'intro')
        .select('id, key, title_vi, summary_vi');

    if (introError) {
        console.error('❌ Lỗi update intro summary_vi:', introError.message);
    } else {
        console.log('✅ Đã update summary_vi cho intro section:');
        console.log('   ID:', introData?.[0]?.id);
        console.log('   Title:', introData?.[0]?.title_vi);
        console.log('   Summary (50 ký tự đầu):', introData?.[0]?.summary_vi?.substring(0, 50) + '...');
    }

    // 2. Kiểm tra thumbnail của các sections
    const { data: allSections, error: fetchError } = await supabase
        .from('about_sections')
        .select('id, key, title_vi, thumbnail_url')
        .eq('is_active', true)
        .order('display_order');

    if (fetchError) {
        console.error('❌ Lỗi fetch sections:', fetchError.message);
        return;
    }

    console.log('\n📋 Danh sách about_sections hiện tại:');
    allSections?.forEach(s => {
        const thumb = s.thumbnail_url || '(không có ảnh)';
        const thumbShort = thumb.length > 60 ? '...' + thumb.slice(-60) : thumb;
        console.log(`   [${s.key}] ${s.title_vi}`);
        console.log(`         thumbnail: ${thumbShort}`);
    });

    console.log('\n✅ Hoàn thành!');
    console.log('💡 Nếu thumbnail sai (Taj Mahal), hãy update trong Supabase dashboard:');
    console.log('   Table: about_sections → Column: thumbnail_url');
    console.log('   Dùng ảnh từ /images/ folder hoặc Supabase Storage');
}

updateAboutSections().catch(console.error);
