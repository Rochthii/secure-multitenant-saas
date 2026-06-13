import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse, type NextRequest } from 'next/server';
import { getLockdownHtml } from './lib/security/lockdown-templates';
import { checkEdgeDefense } from './lib/security/edge-defense';

// 1. Pre-allocated Constants (Cố định vùng nhớ ngoài hàm)
const intlMiddleware = createMiddleware(routing);

const ROOT_ROUTES = ['/login', '/admin', '/collaborator', '/auth', '/forgot-password', '/update-password', '/council'];

const HOSTNAME_MAP: Record<string, string> = {
    'nexus': 'nexus-corp-ptit.vercel.app',  // Tenant doanh nghiệp công nghệ — B2B SaaS demo
};

// Danh sách tenant cho phép chuyển đổi qua ?tenant= trên production (demo hội đồng)
const DEMO_TENANT_WHITELIST = new Set(['nexus']);

/**
 * Multi-tenant Middleware - "Ultra Lean" Edition (Target < 4ms)
 * - Optimized string parsing for Edge Runtime
 * - Zero Object Allocation for internal routing
 * - Secure IP & Tenant resolution
 */
export default async function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    // 1. Hostname Resolution
    let hostname = request.headers.get('host') || 'localhost:3000';

    // Xử lý chuyển đổi tenant qua Query String
    // - Trong dev/local: cho phép mọi tenant param (UUID, domain, key)
    // - Trên production: CHỈ cho phép key nằm trong DEMO_TENANT_WHITELIST (an toàn, không bypass tùy ý)
    const searchParams = request.nextUrl.searchParams;
    const tenantParam = searchParams.get('tenant') || searchParams.get('tenant_id');
    const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.includes('[::1]');
    const isDebug = process.env.NODE_ENV === 'development' || isLocal;

    // FIX: Lưu trạng thái đã override để tránh bị reset nhầm về localhost bên dưới
    let tenantOverridden = false;
    if (tenantParam) {
        const isWhitelisted = DEMO_TENANT_WHITELIST.has(tenantParam);
        if (isDebug || isWhitelisted) {
            // Production: chỉ chấp nhận key trong whitelist (mapped sang domain thật)
            if (HOSTNAME_MAP[tenantParam]) {
                hostname = HOSTNAME_MAP[tenantParam];
                tenantOverridden = true;
            } else if (isDebug) {
                // Dev only: cho phép UUID hoặc domain trực tiếp
                if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantParam)) {
                    hostname = tenantParam;
                    tenantOverridden = true;
                } else if (tenantParam.includes('.')) {
                    hostname = tenantParam;
                    tenantOverridden = true;
                }
            }
        }
    }

    // Chuẩn hóa hostname bảo mật: chỉ reset về localhost nếu KHÔNG có tenant override
    if (isLocal && !tenantOverridden) {
        hostname = 'localhost:3000';
    }

    // 2. Nhận dạng IP khách truy cập an toàn (Chống IP Spoofing trên Cloudflare/Vercel)
    const clientIp = request.headers.get('cf-connecting-ip') || // Ưu tiên hàng đầu từ Cloudflare
                     request.headers.get('x-vercel-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     (request as any).ip || 
                     '127.0.0.1';

    let allowedIps: string[] | null = null;
    let isSuspended = false;
    let isIpBlocked = false;
    let blockReason = '';

    // 3. Phân tích Locale một lần duy nhất — dùng cho cả trang lỗi lẫn routing bên dưới
    let detectedLocale = 'vi';
    let hasLocalePrefix = false;
    let pathNoLocale = pathname;

    if (pathname.length >= 3 && pathname[0] === '/') {
        const prefix = pathname.substring(1, 3);
        if (routing.locales.includes(prefix as any)) {
            const nextChar = pathname[3];
            if (!nextChar || nextChar === '/') {
                detectedLocale = prefix;
                hasLocalePrefix = true;
                pathNoLocale = pathname.substring(3) || '/';
            }
        }
    }

    // 4. Thực thi SOAR & IP Whitelist bằng Edge Defense Engine
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (hostname !== 'localhost:3000') {
        const defenseResult = await checkEdgeDefense(clientIp, hostname, supabaseUrl, supabaseAnonKey);
        isSuspended = defenseResult.isSuspended;
        isIpBlocked = defenseResult.isIpBlocked;
        allowedIps = defenseResult.allowedIps;
        blockReason = defenseResult.blockReason;
    }

    // 5. Kiểm tra và áp dụng các bộ lọc chặn an ninh biên
    const lockdownStatus = isSuspended ? 'SUSPENDED' 
        : isIpBlocked ? 'IP_BLOCKED' 
        : (allowedIps && allowedIps.length > 0 && !allowedIps.includes(clientIp)) ? 'INTRANET_LOCKDOWN' 
        : null;

    if (lockdownStatus) {
        return new NextResponse(
            getLockdownHtml(lockdownStatus, clientIp, detectedLocale, blockReason),
            { 
                status: 403,
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            }
        );
    }

    // 6. Xử lý Root/Admin Routes (Chặn sớm và bỏ qua rewrite multi-tenant)
    const isRootRoute = ROOT_ROUTES.some(route => pathNoLocale === route || pathNoLocale.startsWith(route + '/'));

    if (isRootRoute) {
        if (hasLocalePrefix) {
            return NextResponse.redirect(new URL(`${pathNoLocale}${search}`, request.url));
        }
        const response = NextResponse.next();
        response.headers.set('x-pathname', pathname);
        return response;
    }

    // 7. Chạy next-intl Middleware
    const intlResponse = await intlMiddleware(request);

    if (intlResponse.status !== 200 && intlResponse.headers.has('location')) {
        return intlResponse;
    }

    // 8. Domain Rewrite tối ưu hiệu năng
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

    // Rewrite request ngầm vào directory của tenant cụ thể
    const response = NextResponse.rewrite(new URL(`/${hostname}${targetPath}${search}`, request.url));

    // Đồng bộ các Header từ next-intl
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
         * Filter nhanh: Bỏ qua api, static, images, favicon và các file có phần mở rộng (media assets)
         */
        '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)',
    ],
};
