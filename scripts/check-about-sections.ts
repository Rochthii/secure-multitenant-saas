import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data: catData } = await supabase.from('categories').select('tenant_id, module, slug, name_vi').eq('module', 'news');
    console.log("Global news categories:");
    const globalTenantId = '55555555-5555-5555-5555-555555555555';
    catData?.filter(d => d.tenant_id === globalTenantId || d.tenant_id === null).forEach(d => console.log(d.slug, d.name_vi));
    
    console.log("\nOther tenants news categories:");
    catData?.filter(d => d.tenant_id !== globalTenantId && d.tenant_id !== null).forEach(d => console.log(d.tenant_id, d.slug, d.name_vi));
}

main();
