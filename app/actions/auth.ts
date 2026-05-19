'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/lib/audit';

export async function updatePassword(formData: FormData) {
    const supabase = await createClient();
    const newPassword = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    if (!newPassword || !confirmPassword) {
        return { success: false, error: 'Vui lòng nhập đầy đủ thông tin' };
    }

    if (newPassword !== confirmPassword) {
        return { success: false, error: 'Mật khẩu xác nhận không khớp' };
    }

    // Strong password policy
    if (newPassword.length < 8) {
        return { success: false, error: 'Mật khẩu phải có ít nhất 8 ký tự' };
    }
    if (!/[A-Z]/.test(newPassword)) {
        return { success: false, error: 'Mật khẩu phải có ít nhất 1 chữ hoa' };
    }
    if (!/[a-z]/.test(newPassword)) {
        return { success: false, error: 'Mật khẩu phải có ít nhất 1 chữ thường' };
    }
    if (!/[0-9]/.test(newPassword)) {
        return { success: false, error: 'Mật khẩu phải có ít nhất 1 số' };
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Không tìm thấy người dùng' };
        }

        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            return { success: false, error: error.message };
        }

        // Log action
        await createAuditLog({
            user,
            action: 'update',
            tableName: 'auth.users',
            recordId: user.id,
            newData: { action: 'change_password', success: true }
        });

        return { success: true, message: 'Đổi mật khẩu thành công' };
    } catch (error: any) {
        return { success: false, error: error.message || 'Có lỗi xảy ra' };
    }
}
