import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { requireEditor } from '@/lib/auth/require-admin';
// @ts-ignore - TypeScript cache issue with newly created component
import { NewsForm } from '@/components/admin/news-form';
import { notFound, redirect } from 'next/navigation';

export default async function NewsEditPage({ params }: { params: Promise<{ tenant_id: string, id: string }> }) {
    // Auth guard
    try {
        await requireEditor();
    } catch {
        redirect('/admin/login');
    }

    const { tenant_id, id } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Lấy role từ user_roles (Supabase RPC hoặc query)
    const { data: roleData } = await (supabase as any)
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id as string)
        .maybeSingle();

    const currentUserRole = roleData?.role || ((user?.app_metadata?.role ?? user?.user_metadata?.role) as string) || 'editor';

    // Fetch tenants for broadcasting if user is platform level - removed for local admin per user root request
    const tenants: any[] = [];

    const { data: categoriesRaw } = await (supabase as any)
        .from('categories')
        .select('*')
        .eq('module', 'news')
        .or(`tenant_id.is.null,tenant_id.eq.${tenant_id},tenant_id.eq.55555555-5555-5555-5555-555555555555`)
        .order('name_vi');

    const categories = (categoriesRaw || []).map((cat: any) => ({
        ...cat,
        isGlobal: cat.tenant_id === '55555555-5555-5555-5555-555555555555' || !cat.tenant_id
    }));

    // Tạo mới
    if (id === 'new') {
        return (
            <div>
                <NewsForm
                    categories={categories || []}
                    currentUserRole={currentUserRole}
                    tenants={tenants}
                    contextTenantId={tenant_id}
                />
            </div>
        );
    }

    // Chỉnh sửa — lấy đầy đủ thông tin kể cả author_name, reviewer_name, review_note
    const { data: news, error } = await supabase
        .from('news')
        .select('*, categories(name_vi)')
        .eq('id', id)
        .single();

    if (!news || error) {
        notFound();
    }

    return (
        <div>
            <NewsForm
                news={news}
                categories={categories || []}
                currentUserRole={currentUserRole}
                tenants={tenants}
                contextTenantId={tenant_id}
            />
        </div>
    );
}
