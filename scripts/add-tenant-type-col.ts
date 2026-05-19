import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function runSQL() {
    const sql = `ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS tenant_type TEXT DEFAULT 'tenant' CHECK (tenant_type IN ('tenant', 'company', 'ngo'));`;
    
    console.log('🚀 Running SQL: ' + sql);
    
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql_string: sql });

    if (error) {
        console.error('❌ Lỗi:', error);
    } else {
        console.log('✅ Thành công:', data);
    }
}

runSQL();
