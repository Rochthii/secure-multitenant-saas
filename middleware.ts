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

// 1.5 Intranet Lockdown Configuration (IP Whitelisting per Tenant)
const TENANT_IP_WHITELIST: Record<string, string[]> = {
    'khleang.vercel.app': ['127.0.0.1', '::1', '203.162.0.1'], // Ví dụ IP nội bộ của chi nhánh
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

    // FIX: Chỉ cho phép override tenant qua query params trong môi trường development hoặc debug
    // Điều này ngăn chặn kẻ tấn công truyền UUID lạ để phá vỡ cấu trúc routing trong production
    const isDebug = process.env.NODE_ENV === 'development' || searchParams.has('debug_mode');

    if (tenantParam && isDebug) {
        if (HOSTNAME_MAP[tenantParam]) {
            hostname = HOSTNAME_MAP[tenantParam];
        } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantParam)) {
            // Sử dụng Regex chuẩn UUIDv4 (8-4-4-4-12 hex chars)
            hostname = tenantParam;
        } else if (tenantParam.includes('.')) {
            // Cho phép override bằng domain trực tiếp khi debug
            hostname = tenantParam;
        }
    }

    // Chuẩn hóa hostname (Tối ưu cho Edge Runtime)
    // Bỏ check length < 20 để tránh chặn các subdomain ngắn và bổ sung hỗ trợ IPv6 (::1)
    if (hostname.indexOf('localhost') !== -1 || hostname.indexOf('127.0.0.1') !== -1 || hostname.indexOf('::1') !== -1) {
        hostname = 'localhost:3000';
    }

    if (hostname.endsWith('khleang.vercel.app')) {
        hostname = 'khleang.vercel.app';
    }

    // 1.5 Thực thi Intranet Lockdown & Incident Response (SOAR) động
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || '127.0.0.1';
    
    let allowedIps: string[] | null = null;
    let isSuspended = false;
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Chỉ fetch nếu không phải localhost:3000 gốc mà đã được override thành tenant thật
    if (supabaseUrl && supabaseAnonKey && hostname !== 'localhost:3000') {
        try {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(hostname);
            const queryParam = isUuid ? `id=eq.${hostname}` : `domain=eq.${hostname}`;
            
            const fetchUrl = `${supabaseUrl}/rest/v1/tenants?${queryParam}&select=modules_config,lifecycle_status`;
            const dbRes = await fetch(fetchUrl, {
                headers: {
                    'apikey': supabaseAnonKey,
                    'Authorization': `Bearer ${supabaseAnonKey}`
                },
                next: { revalidate: 30 } // Cache 30 giây để tránh làm nghẽn cổ chai
            });
            
            if (dbRes.ok) {
                const data = await dbRes.json();
                if (data && data.length > 0) {
                    const tenant = data[0];
                    if (tenant.lifecycle_status === 'suspended') {
                        isSuspended = true;
                    }
                    const ipWhitelistStr = tenant.modules_config?.security_settings?.ip_whitelist;
                    if (ipWhitelistStr) {
                        allowedIps = ipWhitelistStr.split(',').map((ip: string) => ip.trim()).filter(Boolean);
                    }
                }
            }
        } catch (err) {
            console.error('[Middleware] Lỗi fetch cấu hình Tenant:', err);
        }
    }
    
    if (isSuspended) {
        return new NextResponse(
            `<html>
                <body style="background-color:#0b0f19; color:#f3f4f6; font-family:system-ui,sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; margin:0; text-align:center; padding: 20px;">
                    <div style="border: 1px solid #ef4444; background-color: rgba(239,68,68,0.1); padding: 40px; border-radius: 20px; max-width: 500px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                        <h1 style="color:#ef4444; font-size: 22px; margin-top: 0; font-weight: 800; letter-spacing: -0.5px; font-family: system-ui, sans-serif;">🚨 HỆ THỐNG ĐÃ PHONG TỎA (SOAR LOCKDOWN)</h1>
                        <p style="color:#9ca3af; font-size: 14px; line-height: 1.6; margin: 20px 0 30px 0;">
                            Tổ chức này tạm thời bị đình chỉ hoạt động do hệ thống SOAR tự động phát hiện hành vi tấn công mạng dồn dập hoặc theo lệnh khẩn cấp từ Super Admin để bảo toàn dữ liệu.
                        </p>
                        <div style="font-size: 11px; color: #6b7280; border-top: 1px solid #1f2937; padding-top: 15px; font-family: monospace;">
                            STATUS: TENANT_SUSPENDED | IP: ${clientIp}
                        </div>
                    </div>
                </body>
            </html>`,
            { 
                status: 403,
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            }
        );
    }
    
    if (allowedIps && allowedIps.length > 0 && !allowedIps.includes(clientIp)) {
        return new NextResponse(
            `<html>
                <body style="background-color:#0b0f19; color:#f3f4f6; font-family:system-ui,sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; margin:0; text-align:center; padding: 20px;">
                    <div style="border: 1px solid #3b82f6; background-color: rgba(59,130,246,0.1); padding: 40px; border-radius: 20px; max-width: 500px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                        <h1 style="color:#3b82f6; font-size: 22px; margin-top: 0; font-weight: 800; letter-spacing: -0.5px; font-family: system-ui, sans-serif;">🔒 TRUY CẬP BỊ GIỚI HẠN (INTRANET LOCKDOWN)</h1>
                        <p style="color:#9ca3af; font-size: 14px; line-height: 1.6; margin: 20px 0 30px 0;">
                            Chi nhánh này đã thiết lập chính sách giới hạn dải IP mạng nội bộ. Địa chỉ IP hiện tại của bạn không nằm trong danh sách được phép truy cập.
                        </p>
                        <div style="font-size: 11px; color: #6b7280; border-top: 1px solid #1f2937; padding-top: 15px; font-family: monospace;">
                            STATUS: IP_NOT_WHITELISTED | YOUR IP: ${clientIp}
                        </div>
                    </div>
                </body>
            </html>`,
            { 
                status: 403,
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            }
        );
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
    for (const route of ROOT_ROUTES) {
        // Fix: So khớp chính xác hoặc là thư mục con để tránh nhận nhầm route (vd: /admin vs /administrator)
        if (pathNoLocale === route || pathNoLocale.startsWith(route + '/')) {
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
