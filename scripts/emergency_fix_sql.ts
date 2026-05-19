import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function runSQL() {
    console.log('🚀 Đang chạy SQL khẩn cấp để sửa lỗi Rate Limit Ambiguity...');
    
    // Đọc file migration
    const sqlPath = './supabase/migrations/20260417162000_fix_rate_limit_ambiguity.sql';
    let sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Loại bỏ BEGIN/COMMIT vì RPC exec_sql thường tự đóng gói hoặc không hỗ trợ transaction block lồng nhau
    sql = sql.replace('BEGIN;', '').replace('COMMIT;', '');

    try {
        const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql_string: sql });

        if (error) {
            console.error('❌ Lỗi khi thực thi SQL:', error);
            // Thử chạy từng câu lệnh nếu exec_sql không hỗ trợ nhiều câu lệnh
            if (error.message?.includes('exec_sql')) {
                console.log('💡 Gợi ý: Có thể RPC exec_sql chưa được cài đặt hoặc không có quyền.');
            }
        } else {
            console.log('✅ Thành công! Đã cập nhật xong Database:', data);
        }
    } catch (err) {
        console.error('💥 Lỗi hệ thống:', err);
    }
}

runSQL();
