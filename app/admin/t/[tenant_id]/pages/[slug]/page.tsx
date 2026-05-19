import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { requireEditor } from '@/lib/auth/require-admin';
// @ts-ignore
import { PageEditor } from '@/components/admin/page-editor';
import { notFound, redirect } from 'next/navigation';

export default async function EditPagePage({ params }: { params: Promise<{ tenant_id: string; slug: string }> }) {
    // Auth guard
    try {
        await requireEditor();
    } catch {
        redirect('/admin/login');
    }

    const { tenant_id, slug } = await params;

    const supabase = await createClient();

    // Get current user role
    const { data: { user } } = await supabase.auth.getUser();
    const { data: roleData } = await (supabase as any)
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id as string)
        .maybeSingle();
    const currentUserRole = roleData?.role || ((user?.app_metadata?.role ?? user?.user_metadata?.role) as string) || 'editor';

    const { data: page, error } = await supabase
        .from('pages')
        .select('*')
        .eq('tenant_id', tenant_id)
        .eq('slug', slug)
        .single();

    if (!page || error) {
        notFound();
    }

    return (
        <div>
            <h1 className="text-3xl font-playfair font-bold mb-8">
                Chỉnh sửa: {(page as any).title_vi}
            </h1>
            <PageEditor page={page} contextTenantId={tenant_id} currentUserRole={currentUserRole} />
        </div>
    );
}
