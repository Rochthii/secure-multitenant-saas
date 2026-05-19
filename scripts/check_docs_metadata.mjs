import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yhwbbndnwvxlhbhnhnvj.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkMetadata() {
    console.log('--- Kiểm tra Metadata của 7 tài liệu đã nạp ---');
    const { data, error } = await supabase
        .from('dharma_documents')
        .select('id, title, source_metadata')
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    data.forEach(doc => {
        console.log(`\n📖 Tiêu đề: ${doc.title}`);
        console.log(`   Tier (Bậc): ${doc.source_metadata?.source_tier || '🔴 TRỐNG'}`);
        console.log(`   Author (Tác giả): ${doc.source_metadata?.author || 'Không rõ'}`);
    });
}

checkMetadata();
