'use server';

import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/tenant';
import { transactionSchema, type TransactionFormData } from '@/lib/validations/transaction';
import { createAuditLog } from '@/lib/audit';
import { RateLimit } from '@/lib/security/rate-limit';

export async function createTransaction(
    formData: TransactionFormData
): Promise<{ success: boolean; transaction?: any; error?: string }> {
    try {
        // 0. Rate Limit Check (10 transactions per hour)
        const tenant_id = (formData as any).tenant_id;
        const { allowed, message } = await RateLimit.check('transaction', 10, 3600, tenant_id);
        if (!allowed) {
            return { success: false, error: message };
        }

        // 1. Validate data
        const validated = transactionSchema.parse(formData);
        if (!tenant_id) {
            return { success: false, error: 'Thiếu thông tin nhận diện Chi nhánh (Tenant ID).' };
        }

        // Verify tenant_id against the actual request domain to prevent spoofing
        const headersList = await headers();
        const host = headersList.get('x-forwarded-host') || headersList.get('host') || '';
        const tenantConfig = await getTenantConfig(host);

        if (tenantConfig?.id !== tenant_id) {
            return { success: false, error: 'Yêu cầu không hợp lệ. Vui lòng thử lại trên đúng trang của nhà chi nhánh.' };
        }

        // Use Admin Client to bypass RLS for SELECT after INSERT
        const supabase = await createAdminClient();
        
        // Lookup company ID dynamically
        const { data: companyRecord } = await (supabase as any).from('tenants').select('id').eq('tenant_type', 'company').limit(1).maybeSingle();
        const companyId = companyRecord?.id;
        
        let isValidPurpose = validated.purpose === 'general';

        // Nếu không phải 'general', kiểm tra xem Mục đích gửi lên có tồn tại không
        if (!isValidPurpose) {
            let query = (supabase as any)
                .from('transaction_projects')
                .select('id, type, bank_account_id, is_active, status, tenant_id')
                .eq('id', validated.purpose);

            // Chấp nhận: project của chi nhánh hiện tại, của Global Admin (Company), hoặc không gán chi nhánh (null = legacy)
            if (companyId) {
                query = query.or(`tenant_id.eq.${tenant_id},tenant_id.eq.${companyId},tenant_id.is.null`);
            } else {
                query = query.or(`tenant_id.eq.${tenant_id},tenant_id.is.null`);
            }

            const { data: projectData } = await query.single();

            const cData = projectData as any;
            if (cData && cData.is_active && ['ongoing'].includes(cData.status)) {
                isValidPurpose = true;
                (validated as any).recipient_type = cData.type === 'general_fund' ? 'tenant_fund' : 'charity_fund';
                (validated as any).bank_account_id = cData.bank_account_id;
            }
        }

        if (!isValidPurpose) {
            return { success: false, error: 'Danh mục quỹ hoặc dự án không hợp lệ hoặc đã kết thúc.' };
        }

        // Insert transaction record
        const { data: transaction, error } = await supabase
            .from('transactions')
            .insert({
                project_id: validated.purpose === 'general' ? null : validated.purpose,
                amount: validated.amount,
                currency: 'VND',
                donor_name: validated.donor_name,
                donor_phone: validated.donor_phone || null,
                donor_email: validated.donor_email || null,
                note: validated.note || null,
                image_url: validated.image_url || null,
                is_anonymous: validated.is_anonymous,
                payment_method: validated.payment_method,
                status: 'pending',
                tenant_id: tenant_id,
                recipient_type: (validated as any).recipient_type || 'tenant_fund',
                bank_account_id: (validated as any).bank_account_id || null
            } as any)
            .select()
            .single();

        if (error) {
            console.error('Transaction insert error:', error);
            return { success: false, error: 'Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.' };
        }

        // Audit Log for Guest Transaction
        const ipAddress = headersList.get('x-forwarded-for') || '127.0.0.1';
        const userAgent = headersList.get('user-agent') || 'Unknown';

        await createAuditLog({
            user: null, // Guest
            action: 'create',
            tableName: 'transactions',
            recordId: (transaction as any).id,
            tenantId: tenant_id,
            newData: {
                donor_name: validated.donor_name,
                amount: validated.amount,
                project_id: (transaction as any).project_id,
            },
            ipAddress,
            userAgent,
        });

        return { success: true, transaction };
    } catch (error) {
        console.error('Create transaction error:', error);
        if (error instanceof z.ZodError) {
            return { success: false, error: 'Dữ liệu không hợp lệ' };
        }
        return { success: false, error: 'Có lỗi xảy ra. Vui lòng thử lại.' };
    }
}
