import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function auditStorage() {
    const logFile = 'storage_policies_audit.txt';
    fs.writeFileSync(logFile, '=== KIỂM TOÁN CHÍNH SÁCH STORAGE ===\n\n');

    const sql = `
        SELECT 
            policyname, 
            tablename, 
            cmd, 
            qual::text, 
            with_check::text 
        FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects';
    `;

    const { data, error } = await (supabaseAdmin as any).rpc('execute_sql', { sql_string: sql });

    if (error) {
        fs.appendFileSync(logFile, '❌ Lỗi RPC: ' + error.message + '\n');
    } else if (data) {
        fs.appendFileSync(logFile, JSON.stringify(data, null, 2) + '\n');
    } else {
        fs.appendFileSync(logFile, '❓ Không tìm thấy policy nào.\n');
    }
}

auditStorage();
