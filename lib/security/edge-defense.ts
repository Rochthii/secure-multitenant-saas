import { redisClient } from './redis-client';

export interface DefenseCheckResult {
    isIpBlocked: boolean;
    isSuspended: boolean;
    allowedIps: string[] | null;
    blockReason: string;
    tenantId?: string;
    tenantPlan?: 'free' | 'pro' | 'enterprise';
    tenantName?: string;
}

/**
 * Động cơ kiểm tra an ninh mạng biên (Edge Defense Engine)
 * - Kiểm tra IP Blocklist (Global SOAR)
 * - Kiểm tra cấu hình Tenant (Intranet Lockdown, Lifecycle Status)
 * - Sử dụng Redis làm Edge Cache tốc độ cao, hỗ trợ Negative Caching và Fallback sang Supabase REST API.
 */
export async function checkEdgeDefense(
    clientIp: string,
    hostname: string,
    supabaseUrl?: string,
    supabaseAnonKey?: string
): Promise<DefenseCheckResult> {
    let allowedIps: string[] | null = null;
    let isSuspended = false;
    let isIpBlocked = false;
    let blockReason = '';
    let tenantId = '';
    let tenantPlan: 'free' | 'pro' | 'enterprise' = 'free';
    let tenantName = '';

    const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname === '[::1]';

    try {
        // --- BƯỚC A: KIỂM TRA IP BLOCKLIST (GLOBAL SOAR) ---
        if (!isLocal) {
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
                        
                        // Nếu không phải chế độ cloud (chạy RAM local), giới hạn TTL tối đa 10 giây để tránh desync giữa các instance Vercel
                        if (!redisClient.isCloudMode() && ttl && ttl > 10) {
                            ttl = 10;
                        }
                        
                        await redisClient.set(redisBlockKey, { reason: blockReason, blocked_until: blockData[0].blocked_until }, { ex: ttl });
                    } else {
                        // Negative Caching: IP an toàn, cache lại 'false' trong 15s để chặn DDoS spam DB
                        await redisClient.set(redisBlockKey, false, { ex: 15 });
                    }
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
                    tenantId = cachedTenant.id;
                    tenantPlan = (cachedTenant.tenant_type === 'enterprise' ? 'enterprise' : cachedTenant.tenant_type === 'pro' ? 'pro' : 'free') as 'free' | 'pro' | 'enterprise';
                    tenantName = cachedTenant.name || '';
                    
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
                            name: tenant.name,
                            lifecycle_status: tenant.lifecycle_status,
                            tenant_type: tenant.tenant_type,
                            ip_whitelist: ipWhitelistStr
                        };

                        tenantId = tenant.id;
                        tenantPlan = (tenant.tenant_type === 'enterprise' ? 'enterprise' : tenant.tenant_type === 'pro' ? 'pro' : 'free') as 'free' | 'pro' | 'enterprise';
                        tenantName = tenant.name || '';

                        if (tenant.lifecycle_status === 'suspended') {
                            isSuspended = true;
                        }
                        if (ipWhitelistStr) {
                            allowedIps = ipWhitelistStr.split(',').map((ip: string) => ip.trim()).filter(Boolean);
                        }

                        // Ghi cache cho cả domain và ID trong 10 phút (600 giây)
                        // Nếu không phải chế độ cloud (chạy RAM local), giới hạn TTL tối đa 10 giây để tránh desync
                        const tenantTtl = redisClient.isCloudMode() ? 600 : 10;
                        await redisClient.set(redisTenantKey, tenantConfig, { ex: tenantTtl });
                        await redisClient.set(`tenant:${tenant.id}`, tenantConfig, { ex: tenantTtl });
                    } else {
                        // Negative Caching: Tenant không tồn tại, cache lại 'false' trong 30s để tránh brute force subdomains
                        await redisClient.set(redisTenantKey, false, { ex: 30 });
                    }
                }
            }
        }
    } catch (err) {
        console.error('[Edge Defense] Lỗi xử lý an ninh bằng Redis Edge Cache:', err);
    }

    return {
        isIpBlocked: isLocal ? false : isIpBlocked, // Bỏ qua block IP ở local
        isSuspended,
        allowedIps: isLocal ? null : allowedIps, // Bỏ qua whitelist ở local
        blockReason,
        tenantId,
        tenantPlan,
        tenantName
    };
}
