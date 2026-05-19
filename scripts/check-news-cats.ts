import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data: catData } = await supabase.from('categories')
        .select('id, name_vi, is_visible')
        .eq('tenant_id', '4bbaf714-37fd-46e6-a5c1-6db7dca959b6')
        .eq('name_vi', 'Quan hệ quốc tế');
    console.log(catData);
}

main();
