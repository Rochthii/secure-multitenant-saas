import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';
import type { Database } from './database.types';

export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    } catch (error) {
                        // Server Component - cookies can only be modified in Server Actions
                    }
                },
            },
            global: {
                fetch: async (url, options) => {
                    let reqHeaders;
                    try {
                        reqHeaders = await headers();
                    } catch (e) {
                        // Outside request context (static builds/etc)
                        return fetch(url, options);
                    }

                    const tenantId = reqHeaders.get('x-tenant-id');
                    const tenantPlan = reqHeaders.get('x-tenant-plan') as 'free' | 'pro' | 'enterprise' | null;
                    const clientIp = reqHeaders.get('x-client-ip') || '127.0.0.1';

                    if (tenantId && tenantPlan) {
                        const pooler = (await import('@/lib/security/tenant-pooler')).tenantConnectionPooler;
                        const acquireRes = pooler.acquireSlot(tenantId, tenantPlan);

                        if (!acquireRes.allowed) {
                            // Ghi audit log bằng admin client để tránh đệ quy
                            const adminClient = (await createAdminClient()) as any;
                            await adminClient.from('audit_logs').insert({
                                tenant_id: tenantId,
                                user_email: 'security-system@no-reply',
                                action: 'connection_exhaustion_attempt',
                                table_name: 'connection_pool',
                                record_id: tenantId,
                                severity: 'warning',
                                ip_address: clientIp,
                                user_agent: 'Supavisor Connection Limiter',
                                risk_score: 80,
                                details: {
                                    error: acquireRes.error,
                                    active_connections: acquireRes.active,
                                    max_limit: acquireRes.limit,
                                    client_ip: clientIp,
                                    url: url.toString()
                                }
                            });

                            return new Response(
                                JSON.stringify({
                                    error: 'Too Many Requests',
                                    message: acquireRes.error,
                                    code: '429',
                                    details: {
                                        active: acquireRes.active,
                                        limit: acquireRes.limit
                                    }
                                }),
                                {
                                    status: 429,
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Retry-After': '10'
                                    }
                                }
                            );
                        }

                        try {
                            const userAgent = reqHeaders.get('user-agent') || '';
                            if (userAgent.includes('Simulator') || clientIp.startsWith('127.0.1.')) {
                                // Kéo giữ connection slot trong 1.2s để tạo tải đồng thời thực tế cho demo
                                await new Promise(resolve => setTimeout(resolve, 1200));
                            }
                            return await fetch(url, options);
                        } finally {
                            pooler.releaseSlot(tenantId);
                        }
                    }

                    return fetch(url, options);
                }
            }
        }
    );
}

/**
 * Admin client dùng SERVICE_ROLE_KEY.
 * QUAN TRỌNG: phải dùng createClient từ @supabase/supabase-js (KHÔNG phải @supabase/ssr).
 * Lý do: @supabase/ssr sẽ đính kèm cookie auth → Supabase vẫn chạy dưới authenticated role
 * thay vì service_role → gây "permission denied for table users".
 * Client thuần không có cookie nên Supabase nhận đúng service_role và bypass toàn bộ RLS.
 */
export async function createAdminClient() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined. Please add it to your .env.local file.');
    }

    return createSupabaseClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}

