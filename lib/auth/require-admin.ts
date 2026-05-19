/**
 * lib/auth/require-admin.ts
 * Helper dùng trong Server Actions để verify session + role.
 *
 * PHÂN CẤP QUYỀN (cao → thấp):
 *   super_admin  →  Toàn quyền hệ thống
 *   admin        →  Duyệt bài, quản lý nội dung + user + settings
 *   moderator    →  Quản lý quyên góp (chuyên biệt)
 *   editor       →  Tạo/sửa tin tức, sự kiện, upload ảnh
 *   viewer       →  Chỉ đọc
 *
 * Nguyên tắc: Role cao hơn LUÔN có đủ quyền của role thấp hơn.
 * Phân quyền chi tiết theo resource → xem bảng role_permissions trên Supabase.
 *
 * @important Ưu tiên sử dụng `lib/permissions.ts` cho các logic mới để hỗ trợ Multi-tenant tốt hơn.
 */

import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

export class UnauthorizedError extends Error {
    constructor(message = 'Unauthorized: Bạn không có quyền thực hiện thao tác này') {
        super(message);
        this.name = 'UnauthorizedError';
    }
}

// Thứ tự phân cấp — index càng cao, quyền càng lớn
// Khớp với bảng role_permissions trong Supabase
const ROLE_HIERARCHY: Record<string, number> = {
    viewer: 1,
    volunteer: 2,  // Tính năng nới: Chỉ soạn thảo tin tức chờ duyệt
    editor: 3,
    tenant_editor: 3, // Role mới: Editor cấp chi nhánh
    moderator: 4,  // Chuyên biệt: quản lý quyên góp
    tenant_accountant: 4, // Role mới: Kế toán cấp chi nhánh
    admin: 5,
    tenant_admin: 5, // Role mới: Admin cấp chi nhánh
    company_editor: 5.5, // Role mới: Editor cấp tổng công ty (cao hơn admin chi nhánh)
    super_admin: 6,
};


async function getCurrentRole(): Promise<{ user: User; role: string }> {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new UnauthorizedError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }

    // ── Priority 1: user_roles table (Single Source of Truth for multi-tenant) ─
    // MUST check this FIRST — app_metadata may be stale or set incorrectly.
    // A tenant_admin with old app_metadata 'admin' would bypass isolation if we read metadata first.
    const { data: roleData } = await (supabase as any)
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

    if (roleData?.role && ROLE_HIERARCHY[roleData.role]) {
        return { user, role: roleData.role };
    }

    // ── Priority 2: app_metadata (legacy — only for users not yet in user_roles) ─
    const metadataRole = (user.app_metadata?.role as string);
    if (metadataRole && ROLE_HIERARCHY[metadataRole]) {
        return { user, role: metadataRole };
    }

    // ── Default: treat as volunteer (can access collaborator zone only) ─────────
    return { user, role: 'volunteer' };
}

/**
 * Require người dùng có TỐI THIỂU role yêu cầu (kế thừa quyền đầy đủ).
 * Ví dụ: requireMinRole('admin') → cho phép cả 'admin' và 'super_admin'.
 *
 * @param minRole Role tối thiểu cần có
 */
export async function requireMinRole(minRole: string): Promise<User> {
    const { user, role } = await getCurrentRole();

    const userLevel = ROLE_HIERARCHY[role] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] ?? 99;

    if (userLevel < requiredLevel) {
        throw new UnauthorizedError(
            `Tài khoản không đủ quyền (yêu cầu tối thiểu: ${minRole}, hiện tại: ${role})`
        );
    }

    return user;
}

/**
 * Require chính xác một trong các role được liệt kê (không kế thừa).
 * Dùng khi cần kiểm soát role cụ thể, không dùng thường xuyên.
 */
export async function requireRole(allowedRoles: string[]): Promise<User> {
    const { user, role } = await getCurrentRole();

    if (!allowedRoles.includes(role)) {
        throw new UnauthorizedError(
            `Tài khoản không đủ quyền (yêu cầu: ${allowedRoles.join(' hoặc ')}, hiện tại: ${role})`
        );
    }

    return user;
}

// ─── Shortcut cho từng cấp quyền (khuyên dùng) ───────────────────────────────

/** 
 * Chỉ super_admin 
 * @deprecated Dùng requireSuperAdmin từ '@/lib/permissions' để đồng nhất logic RBAC và Tenant Isolation.
 */
export async function requireSuperAdmin(): Promise<User> {
    return requireMinRole('super_admin');
}

/** 
 * Từ admin trở lên (admin, super_admin) 
 * @deprecated Dùng requirePermission('resource', 'action') từ '@/lib/permissions' để quản lý quyền chi tiết.
 */
export async function requireAdmin(): Promise<User> {
    return requireMinRole('admin');
}

/** Từ editor trở lên (editor, admin, super_admin) */
export async function requireEditor(): Promise<User> {
    return requireMinRole('editor');
}

/** Từ viewer trở lên — tức là chỉ cần đăng nhập */
export async function requireViewer(): Promise<User> {
    return requireMinRole('viewer');
}

/** Chỉ volunteer trở lên (dùng cho các trang Cổng CTV) */
export async function requireVolunteer(): Promise<User> {
    return requireMinRole('volunteer');
}

// ─── Wrapper tiện lợi ─────────────────────────────────────────────────────────

/**
 * Wrapper an toàn cho Server Actions — không throw, trả về object lỗi.
 */
export async function withAuth<T>(
    fn: (user: User) => Promise<T>,
    minRole: string = 'admin'
): Promise<T | { success: false; error: string; unauthorized: true }> {
    try {
        const user = await requireMinRole(minRole);
        return await fn(user);
    } catch (err) {
        if (err instanceof UnauthorizedError) {
            return { success: false, error: err.message, unauthorized: true };
        }
        throw err;
    }
}

/** @deprecated Dùng withAuth(fn, 'admin') thay thế */
export async function withAdminAuth<T>(
    fn: (user: User) => Promise<T>
): Promise<T | { success: false; error: string; unauthorized: true }> {
    return withAuth(fn, 'admin');
}

/** Lấy tên hiển thị chuẩn từ user metadata */
export function getAuthorName(user: any): string {
    return user?.user_metadata?.full_name
        || user?.user_metadata?.name
        || user?.email?.split('@')[0]
        || 'Không rõ';
}

