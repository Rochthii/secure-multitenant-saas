import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse, type NextRequest } from 'next/server';
import { redisClient } from './lib/security/redis-client';

// 1. Pre-allocated Constants (Cố định vùng nhớ ngoài hàm)
const intlMiddleware = createMiddleware(routing);

const ROOT_ROUTES = ['/login', '/admin', '/collaborator', '/auth', '/forgot-password', '/update-password', '/council'];

const HOSTNAME_MAP: Record<string, string> = {
    'nexus': 'nexus-corp-ptit.vercel.app',  // Tenant doanh nghiệp công nghệ — B2B SaaS demo
};

// Danh sách tenant cho phép chuyển đổi qua ?tenant= trên production (demo hội đồng)
const DEMO_TENANT_WHITELIST = new Set(['nexus']);



// Hàm tạo template HTML trang lỗi đa ngôn ngữ an toàn, gọn nhẹ chạy tại Edge
const getLockdownHtml = (status: 'SUSPENDED' | 'IP_BLOCKED' | 'INTRANET_LOCKDOWN', ip: string, locale: string, reason?: string) => {
    const messages = {
        vi: {
            title: status === 'SUSPENDED' ? '🚨 HỆ THỐNG PHONG TỎA KHẦN CẤP' : '🔒 TRUY CẬP BỊ GIỚI HẠN',
            desc: status === 'SUSPENDED' 
                ? 'Tổ chức này tạm thời bị đình chỉ hoạt động do hệ thống SOAR tự động phát hiện hành vi tấn công mạng dồn dập hoặc theo lệnh khẩn cấp từ Super Admin để bảo toàn dữ liệu.' 
                : 'Chi nhánh này đã thiết lập chính sách giới hạn dải IP mạng nội bộ. Địa chỉ IP hiện tại của bạn không nằm trong danh sách được phép truy cập.',
        },
        en: {
            title: status === 'SUSPENDED' ? '🚨 EMERGENCY SOAR LOCKDOWN' : '🔒 RESTRICTED ACCESS',
            desc: status === 'SUSPENDED' 
                ? 'This organization has been temporarily suspended by the SOAR system due to detected cyberattacks or an emergency order from the Super Admin to preserve data integrity.' 
                : 'This branch has enforced an intranet IP whitelist policy. Your current IP address is not authorized to access this network.',
        },
        km: {
            title: status === 'SUSPENDED' ? '🚨 ប្រព័ន្ធត្រូវបានបិទជាបន្ទាន់ (SOAR LOCKDOWN)' : '🔒 ការចូលប្រើប្រាស់ត្រូវបានកំណត់ (INTRANET LOCKDOWN)',
            desc: status === 'SUSPENDED' 
                ? 'ស្ថាប័ននេះត្រូវបានផ្អាកដំណើរការជាបណ្តោះអាសន្នដោយសារតែប្រព័ន្ធ SOAR រកឃើញការវាយប្រហារបណ្តាញ ឬតាមបញ្ជាបន្ទាន់ពី Super Admin ដើម្បីការពារទិន្នន័យ។' 
                : 'សាខានេះបានកំណត់គោលការណ៍អនុញ្ញាតតែអាសយដ្ឋាន IP ក្នុងបណ្តាញផ្ទៃក្នុងប៉ុណ្ណោះ។ អាសយដ្ឋាន IP បច្ចុប្បន្នរបស់អ្នកមិនស្ថិតក្នុងបញ្ជីដែលអាចចូលប្រើបានទេ។',
        }
    };

    const lang = messages[locale as 'vi' | 'km' | 'en'] || messages.vi;

    return `<html>
        <body style="background-color:#0b0f19; color:#f3f4f6; font-family:system-ui,sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; margin:0; text-align:center; padding: 20px;">
            <div style="border: 1px solid ${status === 'SUSPENDED' ? '#ef4444' : '#3b82f6'}; background-color: ${status === 'SUSPENDED' ? 'rgba(239,68,68,0.08)' : 'rgba(59,130,246,0.08)'}; padding: 40px; border-radius: 20px; max-width: 500px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <h1 style="color:${status === 'SUSPENDED' ? '#ef4444' : '#3b82f6'}; font-size: 20px; margin-top: 0; font-weight: 800; letter-spacing: -0.5px; font-family: system-ui, sans-serif;">${lang.title}</h1>
                <p style="color:#9ca3af; font-size: 14px; line-height: 1.6; margin: 20px 0 30px 0;">${lang.desc}</p>
                <div style="font-size: 11px; color: #6b7280; border-top: 1px solid #1f2937; padding-top: 15px; font-family: monospace;">
                    STATUS: ${status === 'SUSPENDED' ? 'TENANT_SUSPENDED' : 'IP_NOT_WHITELISTED'} | YOUR IP: ${ip}
                </div>
            </div>
        </body>
    </html>`;
};

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

    // 4. Thực thi SOAR & IP Whitelist bằng Redis Edge Cache kết hợp Fallback và Negative Caching
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (hostname !== 'localhost:3000') {
        try {
            // --- BƯỚC A: KIỂM TRA IP BLOCKLIST (GLOBAL SOAR) ---
            const redisBlockKey = `blocklist:${clientIp}`;
            const cachedBlock = await redisClient.get<any>(redisBlockKey);

            if (cachedBlock !== null) {
                // Nếu cache hit
                if (cachedBlock !== false && typeof cachedBlock === 'object') {
                    isIpBlocked = true;
                    blockReason = cachedBlock.reason || 'Banned by SOAR Active Defense';
                }
                // Nếu cachedBlock === false, nghĩa là IP an toàn (Negative Cache Hit), bỏ qua check DB.
            } else if (supabaseUrl && supabaseAnonKey) {
                // Cache miss -> Thực hiện Fallback query Postgres và ghi đè ngược cache Redis
                const nowIso = new Date().toISOString();
                const blockFetchUrl = `${supabaseUrl}/rest/v1/blocked_ips?ip=eq.${clientIp}&blocked_until=gt.${nowIso}&select=reason,blocked_until`;
                const blockRes = await fetch(blockFetchUrl, {
                    headers: {
                        'apikey': supabaseAnonKey,
                        'Authorization': `Bearer ${supabaseAnonKey}`
                    }
                });

                if (blockRes.ok) {
                    const blockData = await blockRes.json();
                    if (blockData && blockData.length > 0) {
                        isIpBlocked = true;
                        blockReason = blockData[0].reason || '';
                        
                        // Tính TTL còn lại để đồng bộ chính xác lên Redis
                        const blockedUntil = blockData[0].blocked_until ? new Date(blockData[0].blocked_until) : null;
                        let ttl: number | undefined;
                        if (blockedUntil) {
                            const diffMs = blockedUntil.getTime() - Date.now();
                            ttl = diffMs > 0 ? Math.ceil(diffMs / 1000) : undefined;
                        }
                        
                        await redisClient.set(redisBlockKey, { reason: blockReason, blocked_until: blockData[0].blocked_until }, { ex: ttl });
                    } else {
                        // Negative Caching: IP an toàn, cache lại 'false' trong 15s để chặn DDoS spam DB
                        await redisClient.set(redisBlockKey, false, { ex: 15 });
                    }
                }
            }

            // --- BƯỚC B: KIỂM TRA CẤU HÌNH TENANT (INTRANET LOCKDOWN) ---
            if (!isIpBlocked) {
                const redisTenantKey = `tenant:${hostname}`;
                const cachedTenant = await redisClient.get<any>(redisTenantKey);

                if (cachedTenant !== null) {
                    // Cache hit
                    if (cachedTenant !== false && typeof cachedTenant === 'object') {
                        if (cachedTenant.lifecycle_status === 'suspended') {
                            isSuspended = true;
                        }
                        if (cachedTenant.ip_whitelist) {
                            allowedIps = cachedTenant.ip_whitelist.split(',').map((ip: string) => ip.trim()).filter(Boolean);
                        }
                    }
                    // Nếu cachedTenant === false, nghĩa là Tenant không tồn tại, không check DB tiếp.
                } else if (supabaseUrl && supabaseAnonKey) {
                    // Cache miss -> Thực hiện gọi RPC bảo mật và ghi đè cache Redis
                    const fetchUrl = `${supabaseUrl}/rest/v1/rpc/get_tenant_routing_config`;
                    const dbRes = await fetch(fetchUrl, {
                        method: 'POST',
                        headers: {
                            'apikey': supabaseAnonKey,
                            'Authorization': `Bearer ${supabaseAnonKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ p_hostname: hostname })
                    });

                    if (dbRes.ok) {
                        const tenant = await dbRes.json();
                        if (tenant) {
                            const ipWhitelistStr = tenant.ip_whitelist || null;
                            
                            const tenantConfig = {
                                id: tenant.id,
                                domain: tenant.domain,
                                lifecycle_status: tenant.lifecycle_status,
                                ip_whitelist: ipWhitelistStr
                            };

                            if (tenant.lifecycle_status === 'suspended') {
                                isSuspended = true;
                            }
                            if (ipWhitelistStr) {
                                allowedIps = ipWhitelistStr.split(',').map((ip: string) => ip.trim()).filter(Boolean);
                            }

                            // Ghi cache cho cả domain và ID trong 10 phút (600 giây)
                            await redisClient.set(redisTenantKey, tenantConfig, { ex: 600 });
                            await redisClient.set(`tenant:${tenant.id}`, tenantConfig, { ex: 600 });
                        } else {
                            // Negative Caching: Tenant không tồn tại, cache lại 'false' trong 30s để tránh brute force subdomains
                            await redisClient.set(redisTenantKey, false, { ex: 30 });
                        }
                    }
                }
            }
        } catch (err) {
            console.error('[Middleware] Lỗi xử lý an ninh bằng Redis Edge Cache:', err);
        }
    }

    // Chặn khẩn cấp nếu Tenant bị tạm khóa
    if (isSuspended) {
        return new NextResponse(
            getLockdownHtml('SUSPENDED', clientIp, detectedLocale),
            { 
                status: 403,
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            }
        );
    }

    // Chặn nếu IP bị SOAR block động
    if (isIpBlocked) {
        return new NextResponse(
            getLockdownHtml('IP_BLOCKED', clientIp, detectedLocale, blockReason),
            { 
                status: 403,
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            }
        );
    }

    // Chặn nếu IP không nằm trong Whitelist nội bộ của Tenant
    if (allowedIps && allowedIps.length > 0 && !allowedIps.includes(clientIp)) {
        return new NextResponse(
            getLockdownHtml('INTRANET_LOCKDOWN', clientIp, detectedLocale),
            { 
                status: 403,
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            }
        );
    }

    // 5. Xử lý Root/Admin Routes (Chặn sớm và bỏ qua rewrite multi-tenant)
    // 6. Xử lý Root/Admin Routes (Chặn sớm và bỏ qua rewrite multi-tenant)
    let isRootRoute = false;
    for (const route of ROOT_ROUTES) {
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
