import React from 'react';
import { requireEditor } from '@/lib/auth/require-admin';
import { redirect } from 'next/navigation';
// @ts-ignore
import { PageEditor } from '@/components/admin/page-editor';
import { createClient } from '@/lib/supabase/server';

export default async function NewPagePage({ params }: { params: Promise<{ tenant_id: string }> }) {
    // Auth guard
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

    return (
        <div>
            <h1 className="text-3xl font-playfair font-bold mb-8">
                Tạo Trang Mới
            </h1>
            <PageEditor page={{}} contextTenantId={tenant_id} currentUserRole={currentUserRole} />
        </div>
    );
}
