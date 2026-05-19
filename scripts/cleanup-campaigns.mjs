import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Đọc env từ .env.local
const envContent = readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) env[key.trim()] = rest.join('=').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    // Trước tiên xem toàn bộ
    const { data: all } = await supabase.from('donation_campaigns').select('id, title_vi, type, tenant_id, is_active, status');
    console.log('=== TOÀN BỘ CAMPAIGNS HIỆN TẠI ===');
    console.table(all);

    // Xóa:
    // 1. Tất cả tenant_id = null (chưa gắn với chùa nào - là data rác test)
    // 2. Các id slug cứng sai cấu trúc
    const slugIdsToDelete = ['qu-t-thi-n', 'cung-duong', 'du-an-dang-trien-khai', 'du-an-da-hoan-thanh'];
    const uuidIdsToDelete = [
        'f777ac2d-4159-44f6-9427-90da204481c3',
        '0c605023-ff99-4ce7-bc3a-abb6c3ded250',
        '19714ae0-3381-405b-84c8-bd392aa85e43',
        '8430abb2-84c4-498d-a5aa-5ed94822e7bd',
        '0b632e59-d187-45e5-ba68-df1885784a25',
        '15b8fe06-1459-4782-a602-e01caca0f5bc',
        '7b746821-8032-4b8c-892b-4c0722614a7b',
        '1e59419d-6037-489a-930f-71e76a77b015',
        'b033a5b8-b56a-4bc6-aa7e-ec7ce910007f',
        '321936f6-c5a5-4aaa-a299-605b09cfec05',
    ];
    const allIdsToDelete = [...slugIdsToDelete, ...uuidIdsToDelete];

    const { error } = await supabase.from('donation_campaigns').delete().in('id', allIdsToDelete);
    if (error) {
        console.error('LỖI XÓA:', error);
    } else {
        console.log(`\n✅ Đã xóa ${allIdsToDelete.length} bản rác.`);
    }

    const { data: remaining } = await supabase.from('donation_campaigns').select('id, title_vi, type, tenant_id, is_active, status');
    console.log('\n=== CÒN LẠI SAU KHI DỌN ===');
    console.table(remaining);
}

run().catch(console.error);
