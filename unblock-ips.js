const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const { createClient } = require('@supabase/supabase-js');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function unblock() {
  console.log('Fetching blocked IPs...');
  const { data: blocked, error: fetchError } = await supabase
    .from('blocked_ips')
    .select('*');
  
  if (fetchError) {
    console.error('Error fetching blocked IPs:', fetchError);
    return;
  }
  
  console.log('Currently blocked IPs:', blocked);
  
  if (!blocked || blocked.length === 0) {
    console.log('No blocked IPs found.');
    return;
  }
  
  console.log('Deleting all blocked IPs...');
  // Since we are using service_role, we bypass RLS and can delete everything.
  const { error: deleteError } = await supabase
    .from('blocked_ips')
    .delete()
    .neq('ip', '0.0.0.0'); // Matches all IPs
    
  if (deleteError) {
    console.error('Error deleting blocked IPs:', deleteError);
  } else {
    console.log('Successfully unblocked all IPs.');
  }
}

unblock();
