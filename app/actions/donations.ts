'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { notifyAdmins } from '@/lib/notifications';

export async function confirmTransfer(transactionId: string) {
    // Use Admin Client (Service Role) to bypass RLS
    // Accessing auth.users in RLS triggers "permission denied" for anonymous users
    const supabase = await createAdminClient();

    // Verify transaction exists
    const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select('id, status, amount, donor_name')
        .eq('id', transactionId)
        .single();

    if (fetchError || !transaction) {
        return { success: false, error: 'Không tìm thấy thông tin thanh toán' };
    }

    // @ts-ignore
    if (transaction.status === 'confirmed') {
        return { success: true, message: 'Đã được xác nhận trước đó' };
    }

    // Update status to pending
    const { error: updateError } = await (supabase.from('transactions') as any)
        .update({ status: 'pending', updated_at: new Date().toISOString() })
        .eq('id', transactionId);

    if (updateError) {
        return { success: false, error: updateError.message };
    }

    // Notify Admins about new transaction
    await notifyAdmins({
        title: 'Có thanh toán mới cần xác nhận',
        body: `${transaction.donor_name || 'Ai đó'} vừa phát tâm thanh toán ${(transaction.amount || 0).toLocaleString()} VND.`,
        url: `/admin/transactions`
    });

    revalidatePath(`/transactions/thanh-toan/bank`);
    return { success: true };
}
