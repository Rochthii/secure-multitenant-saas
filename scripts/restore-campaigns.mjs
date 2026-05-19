import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(l => { const [k, ...v] = l.split('='); if (k && v.length) env[k.trim()] = v.join('=').trim(); });

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    // Kiểm tra hiện tại
    const { data: current } = await supabase
        .from('donation_campaigns')
        .select('id, title_vi, type, tenant_id, is_active')
        .order('created_at', { ascending: true });

    console.log('=== CAMPAIGNS HIỆN TẠI ===');
    console.table(current);

    // Tái tạo 2 campaign bị xóa nhầm:
    // 1. "Quỹ chung" của Admin Tổng (tenant 55555...) - ID gốc b033a5b8
    // 2. "Quỹ chung" của Chùa Chantarangsay (tenant 22222...) - ID gốc 321936f6
    const toRestore = [
        {
            id: 'b033a5b8-b56a-4bc6-aa7e-ec7ce910007f',
            title_vi: 'Quỹ chung',
            type: 'specific_project',
            tenant_id: '55555555-5555-5555-5555-555555555555',
            is_active: true,
            status: 'ongoing',
            description_vi: 'Quỹ đóng góp chung của hệ thống',
        },
        {
            id: '321936f6-c5a5-4aaa-a299-605b09cfec05',
            title_vi: 'Quỹ chung',
            type: 'specific_project',
            tenant_id: '22222222-2222-2222-2222-222222222222',
            is_active: true,
            status: 'ongoing',
            description_vi: 'Quỹ đóng góp chung của chùa',
        }
    ];

    const { error } = await supabase.from('donation_campaigns').upsert(toRestore, { onConflict: 'id' });
    if (error) {
        console.error('LỖI KHÔI PHỤC:', error);
        return;
    }
    console.log('\n✅ Đã khôi phục 2 campaigns bị xóa nhầm.');

    const { data: after } = await supabase
        .from('donation_campaigns')
        .select('id, title_vi, type, tenant_id, is_active, status')
        .order('created_at', { ascending: true });
    console.log('\n=== SAU KHI KHÔI PHỤC ===');
    console.table(after);
}

run().catch(console.error);
