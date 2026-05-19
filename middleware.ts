import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse, type NextRequest } from 'next/server';

// 1. Pre-allocated Constants (Cố định vùng nhớ ngoài hàm)
const intlMiddleware = createMiddleware(routing);

const ROOT_ROUTES = ['/login', '/admin', '/collaborator', '/auth', '/forgot-password', '/update-password'];

const HOSTNAME_MAP: Record<string, string> = {
    'phuly': 'chuaphuly.vercel.app',
    'khleang': 'khleang.vercel.app',
    'hophong': 'chuahophongcu.com',
    'chantarangsay': 'chua-chantarangsay-new.vercel.app',
};

/**
 * Multi-tenant Middleware - "Ultra Lean" Edition (Target < 4ms)
 * - No async (No Promise overhead)
 * - No Regex match (No array/object allocation)
 * - No internal new URL() where possible (No heavy parsing cost)
 */
export default async function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    // 1. Hostname Resolution (Fast string search)
    let hostname = request.headers.get('host') || 'localhost:3000';

    // Xử lý test qua Query String (Nếu có)
    const searchParams = request.nextUrl.searchParams;
    const tenantParam = searchParams.get('tenant') || searchParams.get('tenant_id');

    if (tenantParam) {
        if (HOSTNAME_MAP[tenantParam]) {
            hostname = HOSTNAME_MAP[tenantParam];
        } else if (tenantParam.length > 20) {
            hostname = tenantParam; // Direct UUID
        }
    }

    // Chuẩn hóa hostname siêu nhanh
    if (hostname.length < 20) { // 'localhost:3000' is 14
        if (hostname.indexOf('localhost') !== -1 || hostname.indexOf('127.0.0.1') !== -1) {
            hostname = 'localhost:3000';
        }
    } else if (hostname.endsWith('khleang.vercel.app')) {
        hostname = 'khleang.vercel.app';
    }

    // 2. Phân tích Locale (Dùng startsWith thay cho Regex match)
    let hasLocalePrefix = false;
    let pathNoLocale = pathname;

    // Giả định các locale chỉ dài 2 ký tự (vi, km, en)
    if (pathname.length >= 3 && pathname[0] === '/') {
        const prefix = pathname.substring(1, 3);
        if (prefix === 'vi' || prefix === 'km' || prefix === 'en') {
            const nextChar = pathname[3];
            if (!nextChar || nextChar === '/') {
                hasLocalePrefix = true;
                pathNoLocale = pathname.substring(3) || '/';
            }
        }
    }

    // 3. Xử lý Root/Admin Routes (Chặn sớm)
    let isRootRoute = false;
    for (let i = 0; i < ROOT_ROUTES.length; i++) {
        if (pathNoLocale.startsWith(ROOT_ROUTES[i])) {
            isRootRoute = true;
            break;
        }
    }

    if (isRootRoute) {
        if (hasLocalePrefix) {
            return NextResponse.redirect(new URL(`${pathNoLocale}${search}`, request.url));
        }
        const response = NextResponse.next();
        response.headers.set('x-pathname', pathname);
        return response;
    }

    // 4. Chạy next-intl Middleware (Await Promise để tránh crash)
    const intlResponse = await intlMiddleware(request);

    if (intlResponse.status !== 200 && intlResponse.headers.has('location')) {
        return intlResponse;
    }

    // 5. Domain Rewrite (Chiến thuật Zero Object Allocation)
    const rewriteHeader = intlResponse.headers.get('x-middleware-rewrite');
    let targetPath = pathname;

    if (rewriteHeader) {
        const protocolIdx = rewriteHeader.indexOf('://');
        if (protocolIdx !== -1) {
            const pathIdx = rewriteHeader.indexOf('/', protocolIdx + 3);
            targetPath = pathIdx !== -1 ? rewriteHeader.substring(pathIdx) : '/';
        } else {
            targetPath = rewriteHeader;
        }
    }

    // Bước cuối: Rewrite đến target path
    const response = NextResponse.rewrite(new URL(`/${hostname}${targetPath}${search}`, request.url));

    // Optimize Header Copying
    const intlLocale = intlResponse.headers.get('x-next-intl-locale');
    if (intlLocale) response.headers.set('x-next-intl-locale', intlLocale);

    const setCookie = intlResponse.headers.get('set-cookie');
    if (setCookie) response.headers.set('set-cookie', setCookie);

    response.headers.set('x-pathname', pathname);

    return response;
}

export const config = {
    matcher: [
        /*
         * Filter nhanh: Bỏ qua api, static, images, favicon và các file có dấu chấm (media)
         */
        '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)',
    ],
};
