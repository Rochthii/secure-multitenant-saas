import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { requireEditor } from '@/lib/auth/require-admin';
import { EventForm } from '@/components/admin/event-form';
import { redirect } from 'next/navigation';
import { getCachedCategoriesTree } from '@/lib/cache/queries';
import { getTenantScope } from '@/lib/permissions';

export default async function NewEventPage({ params }: { params: Promise<{ tenant_id: string }> }) {
    try {
        await requireEditor();
    } catch {
        redirect('/admin/login');
    }

    const { tenant_id } = await params;

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: roleData } = await (supabase as any)
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id as string)
        .maybeSingle();

    const currentUserRole = roleData?.role || ((user?.app_metadata?.role ?? user?.user_metadata?.role) as string) || 'editor';

    let tenants: any[] = [];
    if (['super_admin', 'company_editor'].includes(currentUserRole)) {
        const { data: tenantsData } = await (supabase as any)
            .from('tenants')
            .select('id, name, domain')
            .order('name');
        tenants = tenantsData || [];
    }

    // Fetch categories for events
    const categoriesData = await getCachedCategoriesTree(tenant_id);
    const eventCategories = categoriesData.events;

    return (
        <div>
            <h1 className="text-3xl font-playfair font-bold mb-8">Tạo sự kiện mới</h1>
            <EventForm
                currentUserRole={currentUserRole}
                tenants={tenants}
                contextTenantId={tenant_id}
                categories={eventCategories}
                allCategories={categoriesData}
            />
        </div>
    );
}
