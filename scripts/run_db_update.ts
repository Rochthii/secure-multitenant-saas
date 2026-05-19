import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function runSQL() {
    console.log('Chạy SQL để thêm image_url vào bảng transactions...');
    try {
        const sql = `ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS image_url text;`;
        const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql_string: sql });

        if (error) {
            console.error('Không thể dùng RPC exec_sql', error);
        } else {
            console.log('Thành công:', data);
        }
    } catch (err) {
        console.error(err);
    }
}

runSQL();
