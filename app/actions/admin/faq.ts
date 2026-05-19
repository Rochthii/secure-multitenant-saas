'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdmin, requireEditor } from '@/lib/auth/require-admin';
import { createAuditLog } from '@/lib/audit';
import { FaqSchema } from '@/lib/validations/admin';
import { saveRevision } from './revisions';

export async function createFAQ(formData: FormData) {
    try {
        const user = await requireEditor();
        const supabase = await createClient();

        const raw = {
            question_vi: formData.get('question_vi') as string,
            question_en: formData.get('question_en') as string || null,
            answer_vi: formData.get('answer_vi') as string,
            answer_en: formData.get('answer_en') as string || null,
            category: formData.get('category') as string || null,
            order_position: parseInt(formData.get('display_order') as string) || 0,
            is_published: formData.get('is_published') !== 'false',
            tenant_id: formData.get('tenant_id') as string || null,
        };

        const parsed = FaqSchema.safeParse(raw);
        if (!parsed.success) {
            const issues = parsed.error.issues;
            return { success: false, error: issues[0]?.message ?? 'Dữ liệu không hợp lệ' };
        }

        const faqData = (() => {
            // Tự động gán tenant_id: Ưu tiên input > User Role
            const finalTenantId = parsed.data.tenant_id;
            if (!finalTenantId) {
                // Chúng ta sẽ lấy roleData bên ngoài trc khi return
                return null; // Placeholder to catch below
            }
            return {
                question_vi: parsed.data.question_vi,
                question_en: parsed.data.question_en,
                answer_vi: parsed.data.answer_vi,
                answer_en: parsed.data.answer_en,
                category: parsed.data.category,
                display_order: parsed.data.order_position,
                is_published: parsed.data.is_published,
                tenant_id: finalTenantId,
            };
        })();

        let finalFaqData = faqData;
        if (!finalFaqData) {
            const { data: roleData } = await (supabase as any)
                .from('user_roles')
                .select('tenant_id')
                .eq('user_id', user.id)
                .maybeSingle();

            finalFaqData = {
                question_vi: parsed.data.question_vi,
                question_en: parsed.data.question_en,
                answer_vi: parsed.data.answer_vi,
                answer_en: parsed.data.answer_en,
                category: parsed.data.category,
                display_order: parsed.data.order_position,
                is_published: parsed.data.is_published,
                tenant_id: roleData?.tenant_id || null,
            };
        }

        // @ts-ignore
        const { data, error } = await (supabase as any).from('faqs').insert(finalFaqData).select('id').single();

        if (error) {
            console.error('Create FAQ error:', error);
            return { success: false, error: 'Có lỗi khi tạo câu hỏi: ' + error.message };
        }

        await createAuditLog({ user, action: 'create', tableName: 'faqs', recordId: data?.id, newData: faqData });

        revalidatePath(`/admin/t/${parsed.data.tenant_id}/faq`);
        // @ts-ignore
        revalidateTag(`faq-${parsed.data.tenant_id}`);
        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Create FAQ error:', err);
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}

export async function updateFAQ(tenantId: string, id: string, formData: FormData) {
    try {
        const user = await requireEditor();
        const supabase = await createClient();

        const raw = {
            question_vi: formData.get('question_vi') as string,
            question_en: formData.get('question_en') as string || null,
            answer_vi: formData.get('answer_vi') as string,
            answer_en: formData.get('answer_en') as string || null,
            category: formData.get('category') as string || null,
            order_position: parseInt(formData.get('display_order') as string) || 0,
            is_published: formData.get('is_published') !== 'false',
            tenant_id: tenantId || formData.get('tenant_id') as string || null,
        };

        const parsed = FaqSchema.safeParse(raw);
        if (!parsed.success) {
            const issues = parsed.error.issues;
            return { success: false, error: issues[0]?.message ?? 'Dữ liệu không hợp lệ' };
        }

        const faqData = {
            question_vi: parsed.data.question_vi,
            question_en: parsed.data.question_en,
            answer_vi: parsed.data.answer_vi,
            answer_en: parsed.data.answer_en,
            category: parsed.data.category,
            display_order: parsed.data.order_position,
            // FIXED: is_published bị thiếu trước đây
            is_published: parsed.data.is_published,
            tenant_id: parsed.data.tenant_id,
        };

        // @ts-ignore
        const { data: oldData } = await (supabase as any).from('faqs').select('*').eq('id', id).eq('tenant_id', tenantId).single();
        // @ts-ignore
        const { error } = await (supabase as any).from('faqs').update(faqData).eq('id', id).eq('tenant_id', tenantId);

        if (error) {
            console.error('Update FAQ error:', error);
            return { success: false, error: 'Có lỗi khi cập nhật câu hỏi: ' + error.message };
        }

        await createAuditLog({ user, action: 'update', tableName: 'faqs', recordId: id, oldData: oldData ?? null, newData: faqData });

        await saveRevision({
            tableName: 'faqs',
            recordId: id,
            changedBy: user.id,
            oldData,
            newData: faqData,
            changeSummary: 'Cập nhật nội dung FAQ'
        });

        revalidatePath(`/admin/t/${tenantId}/faq`);
        // @ts-ignore
        revalidateTag(`faq-${tenantId}`);

        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Update FAQ error:', err);
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}

export async function deleteFAQ(tenantId: string, id: string) {
    try {
        const user = await requireAdmin();
        const supabase = await createClient();

        // @ts-ignore
        const { data: oldData } = await (supabase as any).from('faqs').select('*').eq('id', id).eq('tenant_id', tenantId).single();
        const { error } = await supabase.from('faqs').delete().eq('id', id).eq('tenant_id', tenantId);

        if (error) {
            console.error('Delete FAQ error:', error);
            return { success: false, error: 'Có lỗi khi xóa câu hỏi: ' + error.message };
        }

        await createAuditLog({ user, action: 'delete', tableName: 'faqs', recordId: id, oldData: oldData ?? null });

        revalidatePath(`/admin/t/${tenantId}/faq`);
        // @ts-ignore
        revalidateTag(`faq-${tenantId}`);

        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Delete FAQ error:', err);
        if (err.code === '23503') return { success: false, error: 'Câu hỏi này đang được sử dụng ở nơi khác, không thể xóa' };
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}
