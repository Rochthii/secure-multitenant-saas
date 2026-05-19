import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { requireEditor } from '@/lib/auth/require-admin';
// @ts-ignore
import { FAQForm } from '@/components/admin/faq-form';
import { notFound, redirect } from 'next/navigation';

export default async function EditFAQPage({ params }: { params: Promise<{ tenant_id: string; id: string }> }) {
    // Auth guard
    try {
        await requireEditor();
    } catch {
        redirect('/admin/login');
    }

    const { tenant_id, id } = await params;

    const supabase = await createClient();

    const { data: faq, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('tenant_id', tenant_id)
        .eq('id', id)
        .single();

    if (!faq || error) {
        notFound();
    }

    return (
        <div>
            <h1 className="text-3xl font-playfair font-bold mb-8">Sửa câu hỏi</h1>
            <FAQForm faq={faq} contextTenantId={tenant_id} />
        </div>
    );
}
