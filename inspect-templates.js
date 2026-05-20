const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const TEMPLATE_TENANT_ID = '55555555-5555-5555-5555-555555555555';
    console.log(`Checking template categories for tenant ID: ${TEMPLATE_TENANT_ID}...`);
    
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('tenant_id', TEMPLATE_TENANT_ID)
        .order('order_position', { ascending: true });

    if (error) {
        console.error('Error fetching template categories:', error);
        return;
    }

    console.log(`Found ${data.length} template categories:`);
    console.log(JSON.stringify(data.map(c => ({
        id: c.id,
        name_vi: c.name_vi,
        slug: c.slug,
        parent_id: c.parent_id,
        module: c.module,
        order_position: c.order_position
    })), null, 2));
}

run();
