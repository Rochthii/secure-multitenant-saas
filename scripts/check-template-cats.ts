import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const TEMPLATE_TENANT_ID = '55555555-5555-5555-5555-555555555555';

async function main() {
    const { data: categories, error } = await supabase
        .from('categories')
        .select('id, name_vi, slug, parent_id, module')
        .eq('tenant_id', TEMPLATE_TENANT_ID)
        .order('order_position', { ascending: true });

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`=== Template Categories (${TEMPLATE_TENANT_ID}) ===`);
    
    const buildTree = (items: any[], parentId: string | null = null, indent: string = '') => {
        items
            .filter(item => item.parent_id === parentId)
            .forEach(item => {
                console.log(`${indent}- ${item.name_vi} (${item.slug}) [${item.module}]`);
                buildTree(items, item.id, indent + '  ');
            });
    };

    buildTree(categories);
}

main();
