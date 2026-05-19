import { NextResponse } from 'next/server';
import { getUserContext } from '@/lib/permissions';

/**
 * Guard bảo vệ tất cả /api/admin/* routes.
 * Tái sử dụng getUserContext() từ lib/permissions để:
 *  1. Xác thực JWT (Supabase Auth)
 *  2. Kiểm tra RBAC role từ bảng user_roles (hoặc app_metadata fallback)
 *
 * @example
 * const guard = await requireAdmin();
 * if (guard.error) return guard.error;
 */
const ALLOWED_ADMIN_ROLES = [
    'super_admin',
    'company_editor',
    'tenant_admin',
    'tenant_editor',
    'tenant_accountant',
    'agency_admin',
    'admin',
    'moderator',
    'editor',
] as const;

export async function requireAdmin(): Promise<
    { userCtx: Awaited<ReturnType<typeof getUserContext>>; error: null } |
    { userCtx: null; error: NextResponse }
> {
    try {
        const userCtx = await getUserContext();

        if (!userCtx) {
            return {
                userCtx: null,
                error: NextResponse.json(
                    { error: 'Chưa đăng nhập. Vui lòng đăng nhập vào hệ thống quản trị.' },
                    { status: 401 }
                ),
            };
        }

        if (!ALLOWED_ADMIN_ROLES.includes(userCtx.role as any)) {
            return {
                userCtx: null,
                error: NextResponse.json(
                    { error: 'Bạn không có quyền thực hiện thao tác này.' },
                    { status: 403 }
                ),
            };
        }

        return { userCtx, error: null };
    } catch (err) {
        console.error('[requireAdmin] Unexpected error:', err);
        return {
            userCtx: null,
            error: NextResponse.json(
                { error: 'Lỗi hệ thống xác thực.' },
                { status: 500 }
            ),
        };
    }
}
