import { NextRequest, NextResponse } from 'next/server';
import { isGlobalAdmin } from '@/lib/permissions';

export type RouteHandler = (request: NextRequest, ...args: any[]) => Promise<NextResponse> | Promise<Response>;

/**
 * Higher-Order Function (HOC) bọc các API Routes dành cho Admin.
 * - Xác thực quyền Global Admin (`isGlobalAdmin`)
 * - Tự động bẫy lỗi try-catch, ghi log chi tiết và trả về JSON Response lỗi 500.
 */
export function withAdminAuth(handler: RouteHandler) {
    return async function (request: NextRequest, ...args: any[]) {
        try {
            // 1. Xác thực quyền Admin hệ thống
            const hasAccess = await isGlobalAdmin();
            if (!hasAccess) {
                return NextResponse.json(
                    { error: 'Unauthorized. Access denied.' }, 
                    { status: 401 }
                );
            }

            // 2. Chạy handler chính
            return await handler(request, ...args);
        } catch (error: any) {
            console.error(`[API Admin Error - ${request.nextUrl?.pathname || 'Unknown'}]:`, error);
            return NextResponse.json(
                { error: error.message || 'Internal Server Error' }, 
                { status: 500 }
            );
        }
    };
}
