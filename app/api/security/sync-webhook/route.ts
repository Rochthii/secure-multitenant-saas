import { NextResponse } from 'next/server';
import { redisClient } from '@/lib/security/redis-client';

export async function POST(request: Request) {
    // Thỏa mãn chuẩn an toàn doanh nghiệp: Chỉ chấp nhận webhook từ Supabase
    const WEBHOOK_SECRET = process.env.CRON_SECRET || 'sync_secret_token_2026';
    try {
        // 1. Xác thực nguồn gọi Webhook bảo mật
        const authHeader = request.headers.get('Authorization') || request.headers.get('x-webhook-secret');
        const token = authHeader?.replace('Bearer ', '').trim();

        if (token !== WEBHOOK_SECRET) {
            console.warn('[Sync Webhook] 🚨 Từ chối truy cập không hợp lệ.');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse payload từ Supabase Database Webhook
        const payload = await request.json();
        const { type, table, record, old_record } = payload;

        console.log(`[Sync Webhook] 🔄 Nhận sự kiện ${type} trên bảng ${table}`);

        if (!table || !type) {
            return NextResponse.json({ error: 'Invalid payload structure' }, { status: 400 });
        }

        // 3. Xử lý đồng bộ bảng BỊ CHẶN IP (blocked_ips)
        if (table === 'blocked_ips') {
            const ip = record?.ip || old_record?.ip;
            if (!ip) {
                return NextResponse.json({ error: 'IP field is missing' }, { status: 400 });
            }

            const redisKey = `blocklist:${ip}`;

            if (type === 'INSERT' || type === 'UPDATE') {
                const blockedUntil = record.blocked_until ? new Date(record.blocked_until) : null;
                const reason = record.reason || 'Banned by SOAR Active Defense';
                
                let ttl: number | undefined;
                if (blockedUntil) {
                    const diffMs = blockedUntil.getTime() - Date.now();
                    ttl = diffMs > 0 ? Math.ceil(diffMs / 1000) : undefined;
                }

                // Nếu thời gian block vẫn còn hạn, lưu vào Redis với TTL tự động hủy
                if (!ttl || ttl > 0) {
                    await redisClient.set(redisKey, { reason, blocked_until: record.blocked_until }, { ex: ttl });
                    console.log(`[Sync Webhook] ✅ Đã đồng bộ CHẶN IP ${ip} lên Redis. TTL: ${ttl || 'Vô hạn'} giây.`);
                } else {
                    // Nếu thời gian block đã hết hạn, xóa khỏi Redis
                    await redisClient.del(redisKey);
                    console.log(`[Sync Webhook] 🗑️ IP ${ip} đã hết hạn block, xóa khỏi Redis.`);
                }
            } else if (type === 'DELETE') {
                await redisClient.del(redisKey);
                console.log(`[Sync Webhook] 🗑️ Đã xóa chặn IP ${ip} khỏi Redis (Unblocked).`);
            }
        }

        // 4. Xử lý đồng bộ bảng KHÁCH HÀNG (tenants)
        else if (table === 'tenants') {
            const id = record?.id || old_record?.id;
            const domain = record?.domain || old_record?.domain;

            if (!id) {
                return NextResponse.json({ error: 'Tenant ID is missing' }, { status: 400 });
            }

            const redisKeyId = `tenant:${id}`;
            const redisKeyDomain = domain ? `tenant:${domain}` : null;

            if (type === 'INSERT' || type === 'UPDATE') {
                // Đóng gói cấu hình an toàn rút gọn để lưu vào Redis
                const tenantConfig = {
                    id: record.id,
                    domain: record.domain,
                    lifecycle_status: record.lifecycle_status,
                    ip_whitelist: record.modules_config?.security_settings?.ip_whitelist || null
                };

                // Lưu cấu hình vào Redis (cache trong 10 phút để giảm tải tối đa cho DB)
                await redisClient.set(redisKeyId, tenantConfig, { ex: 600 });
                if (redisKeyDomain) {
                    await redisClient.set(redisKeyDomain, tenantConfig, { ex: 600 });
                }

                console.log(`[Sync Webhook] ✅ Đã đồng bộ cấu hình Tenant ${id} (${domain || 'Không có domain'}) lên Redis.`);
            } else if (type === 'DELETE') {
                await redisClient.del(redisKeyId);
                if (redisKeyDomain) {
                    await redisClient.del(redisKeyDomain);
                }
                console.log(`[Sync Webhook] 🗑️ Đã xóa cấu hình Tenant ${id} khỏi Redis.`);
            }
        }

        return NextResponse.json({ success: true, table, type });
    } catch (err: any) {
        console.error('[Sync Webhook] 🚨 Lỗi xử lý đồng bộ cache:', err);
        return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
    }
}
