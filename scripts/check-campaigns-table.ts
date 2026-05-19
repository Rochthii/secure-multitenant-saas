import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: projectError } = await supabase
        .from('transaction_projects' as any)
        .select('*', { count: 'exact', head: true })
        .limit(1);

    console.log('Transaction Projects table status:', projectError ? 'Error: ' + projectError.message : 'OK');
}

main();
