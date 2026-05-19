'use server';

import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { createAuditLog } from '@/lib/audit';
import { RateLimit } from '@/lib/security/rate-limit';

const contactSchema = z.object({
    name: z.string().min(2, 'Vui lòng nhập tên'),
    email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
    phone: z.string().optional(),
    subject: z.string().min(5, 'Vui lòng nhập tiêu đề'),
    message: z.string().min(10, 'Nội dung quá ngắn'),
});

export async function submitContactForm(
    formData: z.infer<typeof contactSchema>,
    tenantId?: string | null
) {
    try {
        // 0. Rate Limit Check (5 requests per hour)
        const { allowed, message } = await RateLimit.check('contact', 5, 3600, tenantId || undefined);
        if (!allowed) {
            return { success: false, error: message };
        }

        const validated = contactSchema.parse(formData);

        // Sử dụng Service Key (Quyền Root) để chèn dữ liệu. Hoàn toàn bảo mật (Bypass RLS)
        const supabase = await createAdminClient();

        const { error } = await (supabase as any)
            .from('contact_messages')
            .insert({
                name: validated.name,
                email: validated.email || null,
                phone: validated.phone || null,
                subject: validated.subject,
                message: validated.message,
                status: 'unread',
                tenant_id: tenantId || '55555555-5555-5555-5555-555555555555'
            });

        if (error) {
            console.error('Contact insert error:', error);
            return { success: false, error: 'Có lỗi xảy ra khi lưu tin nhắn. Vui lòng thử lại.' };
        }

        // Audit Log for Guest Contact
        const headerList = await headers();
        const ipAddress = headerList.get('x-forwarded-for') || '127.0.0.1';
        const userAgent = headerList.get('user-agent') || 'Unknown';

        await createAuditLog({
            user: null, // Guest
            action: 'create',
            tableName: 'contact_messages',
            tenantId: tenantId || '55555555-5555-5555-5555-555555555555',
            newData: {
                name: validated.name,
                subject: validated.subject,
                email: validated.email,
            },
            ipAddress,
            userAgent,
        });

        return { success: true };
    } catch (error) {
        console.error('Submit contact error:', error);
        if (error instanceof z.ZodError) {
            return { success: false, error: 'Dữ liệu không hợp lệ' };
        }
        return { success: false, error: 'Có lỗi hệ thống xảy ra. Vui lòng thử lại.' };
    }
}
