import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { EventForm } from '@/components/admin/event-form';
import { redirect } from 'next/navigation';
import { getCachedCategoriesTree } from '@/lib/cache/queries';

export const metadata = {
    title: 'Tạo Sự Kiện Mới | Global Admin',
};

export default async function GlobalNewEventPage() {
    try {
        await requireAdmin();
    } catch {
        redirect('/admin/login');
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: roleData } = await (supabase as any)
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id as string)
        .maybeSingle();

    const currentUserRole = roleData?.role
        || ((user?.app_metadata?.role ?? user?.user_metadata?.role) as string)
        || 'admin';

    // Fetch all tenants for cross-publishing
    const { data: tenantsData } = await (supabase as any)
        .from('tenants')
        .select('id, name, domain')
        .eq('tenant_type', 'tenant')
        .order('name');
    const tenants = tenantsData || [];

    // Fetch global event categories (no tenantId = global scope)
    const categoriesData = await getCachedCategoriesTree(undefined, 'company');
    const eventCategories = categoriesData.events || [];

    return (
        <div>
            <EventForm
                currentUserRole={currentUserRole}
                tenants={tenants}
                contextTenantId={undefined}
                categories={eventCategories}
                allCategories={categoriesData}
            />
        </div>
    );
}
