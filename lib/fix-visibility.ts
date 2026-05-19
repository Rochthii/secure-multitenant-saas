
import { createAdminClient } from './supabase/server';

export async function checkModulesConfig() {
    const supabase = await createAdminClient();
    const { data: tenants, error } = await (supabase as any)
        .from('tenants')
        .select('id, name, domain, modules_config');

    if (error) {
        console.error('Error fetching tenants:', error);
        return;
    }

    console.log('--- Tenants Modules Config ---');
    tenants.forEach((t: any) => {
        console.log(`Tenant: ${t.name} (${t.domain})`);
        console.log(`ID: ${t.id}`);
        console.log(`Config: ${JSON.stringify(t.modules_config)}`);
        console.log('---');
    });
}

export async function disableTransactions(tenantId: string) {
    const supabase = await createAdminClient();
    const { data: tenant } = await (supabase as any)
        .from('tenants')
        .select('modules_config')
        .eq('id', tenantId)
        .single();

    const newConfig = {
        ...(tenant?.modules_config || {}),
        transactions: false
    };

    const { error } = await (supabase as any)
        .from('tenants')
        .update({ modules_config: newConfig })
        .eq('id', tenantId);

    if (error) {
        console.error('Error updating config:', error);
    } else {
        console.log(`Successfully disabled transactions for ${tenantId}`);
    }
}
