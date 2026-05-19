import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data, error } = await supabase.from('tenants').select('*');
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log('--- Tenants in Database ---');
    data.forEach(t => {
        console.log(`ID: ${t.id} | Name: ${t.name} | Domain: ${t.domain} | Subdomain: ${t.subdomain}`);
    });
}

check();
