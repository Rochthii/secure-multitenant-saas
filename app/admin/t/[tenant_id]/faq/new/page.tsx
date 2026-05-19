import React from 'react';
import { requireEditor } from '@/lib/auth/require-admin';
import { redirect } from 'next/navigation';
// @ts-ignore
import { FAQForm } from '@/components/admin/faq-form';

export default async function NewFAQPage({ params }: { params: Promise<{ tenant_id: string }> }) {
    try {
        await requireEditor();
    } catch {
        redirect('/admin/login');
    }

    const { tenant_id } = await params;

    return (
        <div>
            <h1 className="text-3xl font-playfair font-bold mb-8">Tạo câu hỏi mới</h1>
            <FAQForm contextTenantId={tenant_id} />
        </div>
    );
}
