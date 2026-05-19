import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

supabase.from('tenants').select('id, name, tenant_type, parent_id').then(res => {
    console.log(JSON.stringify(res.data, null, 2));
});
