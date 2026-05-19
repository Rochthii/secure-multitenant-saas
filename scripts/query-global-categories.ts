import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: categories, error } = await supabase
        .from('categories')
        .select('id, name_vi, type, tenant_id')
        .or('tenant_id.is.null,tenant_id.eq.55555555-5555-5555-5555-555555555555');

    if (error) {
        console.error(error);
        return;
    }

    console.log(JSON.stringify(categories, null, 2));
}

main();
