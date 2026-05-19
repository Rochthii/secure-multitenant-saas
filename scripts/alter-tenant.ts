import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function alterTable() {
    console.log("Altering tenants table...");
    const { error } = await supabase.rpc('execute_sql', { query: `
        ALTER TABLE tenants ADD COLUMN IF NOT EXISTS tenant_type VARCHAR(50) DEFAULT 'branch';
        ALTER TABLE tenants ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);
        ALTER TABLE tenants ADD COLUMN IF NOT EXISTS address_vi VARCHAR(255);
        ALTER TABLE tenants ADD COLUMN IF NOT EXISTS name_vi VARCHAR(255);
    `});
    if (error) console.error("RPC Error:", error);
    else console.log("OK");
}

alterTable();
