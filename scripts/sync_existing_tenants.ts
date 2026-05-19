import { createClient } from '@supabase/supabase-js';
import { provisionDefaultCategoriesForNewTenant } from '../lib/tenant-provisioning';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function provision(supabase: any, tenantId: string) {
    const MASTER_TENANT_ID = '55555555-5555-5555-5555-555555555555';
    const { data: sourceCategories, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('tenant_id', MASTER_TENANT_ID)
        .order('created_at', { ascending: true });

    if (fetchError || !sourceCategories) throw fetchError;

    const idMapping = new Map<string, string>();
    const newCategories = sourceCategories.map((cat: any) => {
        const newId = crypto.randomUUID();
        idMapping.set(cat.id, newId);
        return {
            ...cat,
            id: newId,
            tenant_id: tenantId,
            slug: `${cat.slug}-${tenantId.split('-')[0]}`,
            type: cat.type,
            parent_id: cat.parent_id ? idMapping.get(cat.parent_id) || cat.parent_id : null,
            created_at: new Date().toISOString(),
        };
    });

    const chunkSize = 50;
    for (let i = 0; i < newCategories.length; i += chunkSize) {
        const chunk = newCategories.slice(i, i + chunkSize);
        const { error: insertError } = await supabase.from('categories').insert(chunk);
        if (insertError) throw insertError;
    }
}

async function main() {
    console.log('--- SYNCING CATEGORIES TO EXISTING TENANTS ---');
    const { data: tenants, error: tError } = await supabase.from('tenants').select('id, name');
    if (tError) return;

    const MASTER_TENANT_ID = '55555555-5555-5555-5555-555555555555';
    let syncedCount = 0;

    for (const tenant of tenants) {
        if (tenant.id === MASTER_TENANT_ID) continue;
        const { count, error: cError } = await supabase
            .from('categories')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id);

        if (cError) continue;

        if (count === 0) {
            console.log(`[SYNC] Tenant "${tenant.name}" (${tenant.id}) has NO categories. Provisioning now...`);
            try {
                await provision(supabase, tenant.id);
                console.log(`  -> Successfully synced for ${tenant.name}`);
                syncedCount++;
            } catch (err) {
                console.error(`  -> Failed to sync for ${tenant.name}:`, err);
            }
        }
    }
    console.log(`\n--- DONE. Synced ${syncedCount} existing tenants. ---`);
}

main().catch(console.error);
