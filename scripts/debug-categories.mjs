// Script để debug duplicate categories
// Chạy: node scripts/debug-categories.mjs
// Cần file .env.local với SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Đọc .env.local
let envVars = {};
try {
    const envFile = readFileSync(join(__dirname, '../.env.local'), 'utf-8');
    envFile.split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key && val.length) envVars[key.trim()] = val.join('=').trim();
    });
} catch (e) {
    console.error('Could not read .env.local:', e.message);
    process.exit(1);
}

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const serviceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const MCAARON_ID = '55555555-5555-5555-5555-555555555555';

function getBaseSlug(slug) {
    if (!slug) return '';
    if (slug.includes('--')) return slug.split('--')[0];
    const hexSuffixRegex = /-[0-9a-f]{8}$/;
    if (hexSuffixRegex.test(slug)) {
        return slug.replace(hexSuffixRegex, '');
    }
    return slug;
}

// Lấy tất cả temples
const { data: tenants } = await supabase
    .from('tenants')
    .select('id, name, tenant_type, domain')
    .eq('tenant_type', 'temple');

console.log(`\n=== Found ${tenants?.length || 0} temple tenants ===\n`);

for (const tenant of (tenants || [])) {
    const tenantId = tenant.id;
    
    // Query giống getCachedCategoriesTree (sau fix)
    const { data: cats } = await supabase
        .from('categories')
        .select('id, name_vi, slug, module, parent_id, tenant_id, is_visible, order_position')
        .or(`tenant_id.eq.${MCAARON_ID},tenant_id.eq.${tenantId}`)
        .in('module', ['news', 'dharma', 'documents'])
        .eq('is_visible', true)
        .order('module')
        .order('order_position');

    if (!cats?.length) continue;

    // Tìm duplicate slugs
    const slugMap = {};
    cats.forEach(c => {
        const baseSlug = getBaseSlug(c.slug);
        if (!slugMap[baseSlug]) slugMap[baseSlug] = [];
        slugMap[baseSlug].push(c);
    });
    const duplicates = Object.entries(slugMap).filter(([, items]) => items.length > 1);

    // Tìm orphan nodes (parent_id trỏ đến ID không tồn tại)
    const catIds = new Set(cats.map(c => c.id));
    const orphans = cats.filter(c => c.parent_id && !catIds.has(c.parent_id));

    console.log(`\n[${tenant.name}] (${tenant.domain})`);
    console.log(`  Total categories: ${cats.length}`);
    
    if (duplicates.length > 0) {
        console.log(`  ⚠️  DUPLICATE SLUGS (${duplicates.length}):`);
        duplicates.forEach(([slug, items]) => {
            console.log(`       slug="${slug}" x${items.length}`);
            items.forEach(i => console.log(`         - id=${i.id.slice(0,8)}... name="${i.name_vi}" tenant_id=${i.tenant_id === MCAARON_ID ? 'MCAARON' : i.tenant_id === tenantId ? 'TENANT' : 'NULL'}`));
        });
    } else {
        console.log(`  ✅ No duplicate slugs`);
    }

    if (orphans.length > 0) {
        console.log(`  ⚠️  ORPHAN NODES (${orphans.length}):`);
        orphans.forEach(o => {
            console.log(`       id=${o.id.slice(0,8)}... name="${o.name_vi}" module=${o.module} parent_id=${o.parent_id?.slice(0,8)}...`);
        });
    } else {
        console.log(`  ✅ No orphan nodes`);
    }

    // Hiển thị phân bổ categories
    const byModule = cats.reduce((acc, c) => {
        if (!acc[c.module]) acc[c.module] = { mcaaron: 0, tenant: 0 };
        if (c.tenant_id === MCAARON_ID) acc[c.module].mcaaron++;
        else acc[c.module].tenant++;
        return acc;
    }, {});
    console.log(`  Categories by module:`, byModule);
}
