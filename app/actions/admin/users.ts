'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin, requireSuperAdmin } from '@/lib/auth/require-admin';
import { createAuditLog } from '@/lib/audit';
import type { Permission, Resource } from '@/lib/permissions';

const VALID_ROLES = [
    'super_admin',
    'agency_admin',
    'company_editor',
    'tenant_admin',
    'tenant_editor',
    'tenant_accountant',
    'admin',
    'moderator',
    'editor',
    'volunteer',
    'viewer'
] as const;
type ValidRole = typeof VALID_ROLES[number];

const ROLE_LEVEL: Record<string, number> = {
    viewer: 1,
    volunteer: 1,
    editor: 2,
    tenant_editor: 3,
    tenant_accountant: 3,
    moderator: 4,
    tenant_admin: 5,
    admin: 5,
    agency_admin: 5,
    company_editor: 6,
    super_admin: 7,
};

/**
 * Cập nhật role của user.
 * CHỈ super_admin mới được phép. Admin không thể nâng ai lên mức ≥ mình.
 */
export async function updateUserRole(userId: string, newRole: string, tenantId?: string | null) {
    try {
        const user = await requireAdmin(); // Changed from requireSuperAdmin to requireAdmin to allow tenant_admin
        const supabase = await createAdminClient();

        if (userId === user.id) {
            return { success: false, error: 'Không thể thay đổi role của chính mình' };
        }

        if (!VALID_ROLES.includes(newRole as ValidRole)) {
            return { success: false, error: `Role không hợp lệ: "${newRole}". Các role hợp lệ: ${VALID_ROLES.join(', ')}` };
        }

        const currentRole = (user.app_metadata?.role ?? user.user_metadata?.role) ?? 'admin';
        const currentLevel = ROLE_LEVEL[currentRole] ?? 4;
        const newRoleLevel = ROLE_LEVEL[newRole] ?? 1;

        if (newRoleLevel > currentLevel) {
            return {
                success: false,
                error: `Không thể cấp role "${newRole}" cao hơn quyền của bạn ("${currentRole}")`
            };
        }

        let finalTenantId = tenantId ? tenantId : null;

        // Security Guard: tenant_admin restrictions
        if (currentRole === 'tenant_admin') {
            const { data: currentUserRoleData } = await (supabase as any)
                .from('user_roles')
                .select('tenant_id')
                .eq('user_id', user.id)
                .single();

            const myTenantId = currentUserRoleData?.tenant_id;

            if (!myTenantId) {
                return { success: false, error: 'Tài khoản Admin của bạn chưa được cấp phát cụ thể cho một Chi nhánh nào.' };
            }

            // Force the tenant ID to be their own
            finalTenantId = myTenantId;

            // Validate the target user is actually in their tenant
            const { data: targetUserRoleData } = await (supabase as any)
                .from('user_roles')
                .select('tenant_id')
                .eq('user_id', userId)
                .single();

            if (targetUserRoleData && targetUserRoleData.tenant_id !== myTenantId) {
                return { success: false, error: 'Bạn không có quyền sửa đổi tài khoản của chi nhánh khác.' };
            }

            // Explicitly deny global roles for tenant_admin
            const disallowedRoles = ['super_admin', 'agency_admin', 'company_editor', 'admin', 'tenant_accountant'];
            if (disallowedRoles.includes(newRole)) {
                return { success: false, error: 'Admin chi nhánh không thể cấp các quyền quản trị viên trung tâm.' };
            }
        }

        const { data: targetUser } = await supabase.auth.admin.getUserById(userId);
        const oldRole = (targetUser?.user?.app_metadata?.role ?? targetUser?.user?.user_metadata?.role) ?? 'viewer';

        // 1. Dùng admin API để update user metadata (cho backward compat)
        const { error } = await supabase.auth.admin.updateUserById(userId, {
            user_metadata: { role: newRole }
        });

        if (error) {
            console.error('Update role error:', error);
            return { success: false, error: 'Có lỗi khi cập nhật quyền metadata: ' + error.message };
        }

        // 2. Insert/Update vào bảng `user_roles` (Multi-tenant truth)
        const { error: roleError } = await (supabase as any)
            .from('user_roles')
            .upsert(
                {
                    user_id: userId,
                    role: newRole,
                    tenant_id: finalTenantId
                },
                { onConflict: 'user_id' }
            );

        if (roleError) {
            console.error('Update user_roles error:', roleError);
            return { success: false, error: 'Cập nhật user_roles thất bại: ' + roleError.message };
        }

        await createAuditLog({
            user,
            action: 'update',
            tableName: 'auth.users',
            recordId: userId,
            oldData: { role: oldRole },
            newData: { role: newRole },
        });

        revalidatePath('/admin/users');
        revalidatePath(`/admin/users/${userId}`);
        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Update role error:', err);
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}

/**
 * Ban hoặc unban user (admin trở lên)
 */
export async function toggleUserBan(userId: string, shouldBan: boolean) {
    try {
        const user = await requireAdmin();
        const supabase = await createAdminClient();

        if (userId === user.id) {
            return { success: false, error: 'Không thể khóa tài khoản của chính mình' };
        }

        // Ban 100 năm = khóa vĩnh viễn, 'none' = mở khóa
        const banDuration = shouldBan ? '876000h' : 'none';

        const { error } = await supabase.auth.admin.updateUserById(userId, {
            ban_duration: banDuration
        });

        if (error) {
            console.error('Toggle ban error:', error);
            return { success: false, error: 'Có lỗi khi thay đổi trạng thái: ' + error.message };
        }

        await createAuditLog({
            user,
            action: shouldBan ? 'update' : 'restore',
            tableName: 'auth.users',
            recordId: userId,
            newData: { banned: shouldBan },
        });

        revalidatePath('/admin/users');
        revalidatePath(`/admin/users/${userId}`);
        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Toggle ban error:', err);
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}

/**
 * Tạo user mới (admin trở lên).
 * Admin chỉ được tạo user với role ≤ role của chính mình.
 */
export async function createUser(data: {
    email: string;
    password: string;
    fullName: string;
    role: string;
    tenantId?: string | null;
}) {
    try {
        const currentUser = await requireAdmin();
        const supabaseAdmin = await createAdminClient();

        if (!VALID_ROLES.includes(data.role as ValidRole)) {
            return { success: false, error: `Role không hợp lệ: "${data.role}"` };
        }

        const currentRole = (currentUser.app_metadata?.role ?? currentUser.user_metadata?.role) ?? 'admin';
        const currentLevel = ROLE_LEVEL[currentRole] ?? 4;
        const newRoleLevel = ROLE_LEVEL[data.role] ?? 1;

        if (newRoleLevel > currentLevel) {
            return {
                success: false,
                error: `Không thể tạo user với role "${data.role}" cao hơn quyền của bạn ("${currentRole}")`
            };
        }

        let finalTenantId = data.tenantId ? data.tenantId : null;

        // Security Guard: tenant_admin restrictions
        if (currentRole === 'tenant_admin') {
            const { data: currentUserRoleData } = await (supabaseAdmin as any)
                .from('user_roles')
                .select('tenant_id')
                .eq('user_id', currentUser.id)
                .single();

            const myTenantId = currentUserRoleData?.tenant_id;

            if (!myTenantId) {
                return { success: false, error: 'Tài khoản Admin của bạn chưa được cấp phát cụ thể cho một Chi nhánh nào.' };
            }

            // Force the tenant ID to be their own
            finalTenantId = myTenantId;

            // Explicitly deny global roles for tenant_admin
            const disallowedRoles = ['super_admin', 'agency_admin', 'company_editor', 'admin', 'tenant_accountant'];
            if (disallowedRoles.includes(data.role)) {
                return { success: false, error: 'Admin chi nhánh không thể cấp các quyền quản trị viên trung tâm.' };
            }
        }

        // 1. Create user in Supabase Auth
        const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
            email: data.email,
            password: data.password,
            email_confirm: true, // Auto confirm
            user_metadata: {
                full_name: data.fullName,
                role: data.role
            }
        });

        if (error) {
            console.error('Create user error:', error);
            if (error.message.includes('already registered')) {
                return { success: false, error: 'Email này đã được đăng ký' };
            }
            return { success: false, error: 'Lỗi tạo user: ' + error.message };
        }

        if (!newUser.user) {
            return { success: false, error: 'Không tạo được user (Unknown error)' };
        }

        // 2. Insert into user_roles (Multi-tenant)
        await (supabaseAdmin as any).from('user_roles').insert({
            user_id: newUser.user.id,
            role: data.role,
            tenant_id: finalTenantId
        });

        await createAuditLog({
            user: currentUser,
            action: 'create',
            tableName: 'auth.users',
            recordId: newUser.user.id,
            newData: {
                email: data.email,
                role: data.role,
                full_name: data.fullName
            },
        });

        revalidatePath('/admin/users');
        return { success: true, userId: newUser.user.id };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Create user exception:', err);
        return { success: false, error: 'Có lỗi xảy ra: ' + (err.message || 'Unknown') };
    }
}

/**
 * Cập nhật cấu hình phân quyền ghi đè của một User cụ thể.
 * Lưu trữ dưới dạng JSONB trong cột `custom_permissions` của `user_roles`.
 */
export async function updateUserCustomPermissions(targetUserId: string, customPermissions: Partial<Record<string, Partial<Permission>>> | null) {
    try {
        const currentUser = await requireAdmin(); // Minimum Admin
        const supabase = await createAdminClient();

        if (targetUserId === currentUser.id) {
            return { success: false, error: 'Không thể tự tùy chỉnh quyền của chính mình' };
        }

        // We fetch current user role to assert existence
        const { data: currentRoleData } = await (supabase as any)
            .from('user_roles')
            .select('role, tenant_id')
            .eq('user_id', targetUserId)
            .single();

        if (!currentRoleData) {
            return { success: false, error: 'Người dùng này chưa có định dạng Role trong hệ thống' };
        }

        // Security Guard: tenant_admin restrictions
        const currentUserRole = (currentUser.app_metadata?.role ?? currentUser.user_metadata?.role) ?? 'admin';
        if (currentUserRole === 'tenant_admin') {
            const { data: currentUserRoleData } = await (supabase as any)
                .from('user_roles')
                .select('tenant_id')
                .eq('user_id', currentUser.id)
                .single();

            const myTenantId = currentUserRoleData?.tenant_id;
            if (!myTenantId || currentRoleData.tenant_id !== myTenantId) {
                return { success: false, error: 'Bạn không có quyền sửa đổi quyền hạn của người dùng ngoài chi nhánh.' };
            }
        }

        const { error } = await (supabase as any)
            .from('user_roles')
            .update({ custom_permissions: customPermissions })
            .eq('user_id', targetUserId);

        if (error) {
            console.error('Update custom_permissions error:', error);
            return { success: false, error: 'Cập nhật quyền thất bại: ' + error.message };
        }

        await createAuditLog({
            user: currentUser,
            action: 'update',
            tableName: 'user_roles',
            recordId: targetUserId,
            newData: { custom_permissions: customPermissions },
        });

        revalidatePath('/admin/users');
        revalidatePath(`/admin/users/${targetUserId}`);
        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Update custom_permissions exception:', err);
        return { success: false, error: 'Có lỗi xảy ra: ' + (err.message || 'Unknown') };
    }
}
