import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    // Check tất cả about_sections với tenant_id IS NULL (global records)
    const { data: globals, error } = await supabase
        .from('about_sections')
        .select('id, key, title_vi, tenant_id')
        .is('tenant_id', null)
        .order('display_order', { ascending: true });

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('=== GLOBAL about_sections (tenant_id IS NULL) ===');
    console.log(`Total: ${globals?.length || 0} records`);
    globals?.forEach(r => {
        console.log(`  key="${r.key}" | title="${r.title_vi}"`);
    });

    // Check global UUID (McAaron)
    const { data: mcaaron } = await supabase
        .from('about_sections')
        .select('id, key, title_vi, tenant_id')
        .eq('tenant_id', '55555555-5555-5555-5555-555555555555')
        .order('display_order', { ascending: true });

    console.log('\n=== McAaron Global about_sections ===');
    console.log(`Total: ${mcaaron?.length || 0} records`);
    mcaaron?.forEach(r => {
        console.log(`  key="${r.key}" | title="${r.title_vi}"`);
    });
}

main();
