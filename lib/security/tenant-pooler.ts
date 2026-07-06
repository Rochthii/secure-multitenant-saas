// ============================================================================
// TENANT CONNECTION POOL LIMITER (NOISY NEIGHBOR MITIGATION) - DISTRIBUTED EDITION
// ============================================================================
// Triển khai cô lập tài nguyên và điều tiết kết nối đồng thời ở tầng ứng dụng.
// Sử dụng Redis Edge Cache để hoạt động chính xác trong môi trường Serverless (Vercel Edge)
// ============================================================================

import { redisClient } from './redis-client';

export interface TenantPoolStats {
    tenantId: string;
    tenantName: string;
    plan: 'free' | 'pro' | 'enterprise';
    activeConnections: number;
    maxConcurrentLimit: number;
    usagePercentage: number;
    state: 'NORMAL' | 'HIGH_LOAD' | 'EXHAUSTED';
}

class TenantConnectionPooler {
    private static instance: TenantConnectionPooler;

    // Fallback local memory for local development without Upstash Redis
    private localActive = new Map<string, number>();
    private localViolations = new Map<string, number>();

    public TIER_LIMITS = {
        free: { maxConcurrent: 3, maxRequestsPerMin: 15 },
        pro: { maxConcurrent: 10, maxRequestsPerMin: 60 },
        enterprise: { maxConcurrent: 40, maxRequestsPerMin: 300 }
    };

    private constructor() {}

    public static getInstance(): TenantConnectionPooler {
        if (!TenantConnectionPooler.instance) {
            TenantConnectionPooler.instance = new TenantConnectionPooler();
        }
        return TenantConnectionPooler.instance;
    }

    /**
     * Cố gắng chiếm dụng 1 kết nối (connection slot) vào Database cho Tenant.
     */
    public async acquireSlot(tenantId: string, plan: 'free' | 'pro' | 'enterprise'): Promise<{
        allowed: boolean;
        active: number;
        limit: number;
        error?: string;
    }> {
        const limit = this.TIER_LIMITS[plan]?.maxConcurrent || 3;
        const redisKey = `active_pool:${tenantId}`;
        const violationKey = `violations:${tenantId}`;

        let currentActive = 0;

        try {
            // Lấy số kết nối hiện tại từ Redis
            const cachedVal = await redisClient.get<number>(redisKey);
            currentActive = cachedVal !== null ? Number(cachedVal) : 0;
        } catch {
            // Fallback sang local RAM nếu Redis gặp sự cố
            currentActive = this.localActive.get(tenantId) || 0;
        }

        if (currentActive >= limit) {
            // Ghi nhận vi phạm
            let violations = 0;
            try {
                const cachedViolations = await redisClient.get<number>(violationKey);
                violations = cachedViolations !== null ? Number(cachedViolations) : 0;
                await redisClient.set(violationKey, violations + 1, { ex: 60 });
            } catch {
                violations = this.localViolations.get(tenantId) || 0;
                this.localViolations.set(tenantId, violations + 1);
            }

            return {
                allowed: false,
                active: currentActive,
                limit,
                error: `NOISY NEIGHBOR EXCLUSION: Chi nhánh ${tenantId} đã vượt ngưỡng kết nối đồng thời cho phép (${limit} connections). Kết nối bị ngắt kết nối để bảo toàn Connection Pool chung.`
            };
        }

        // Tăng active connections (đặt TTL 15s để tự giải phóng nếu server bị sập bất ngờ)
        const nextActive = currentActive + 1;
        try {
            await redisClient.set(redisKey, nextActive, { ex: 15 });
        } catch {
            this.localActive.set(tenantId, nextActive);
        }

        return {
            allowed: true,
            active: nextActive,
            limit
        };
    }

    /**
     * Giải phóng 1 kết nối sau khi query hoàn thành.
     */
    public async releaseSlot(tenantId: string): Promise<void> {
        const redisKey = `active_pool:${tenantId}`;
        let currentActive = 0;

        try {
            const cachedVal = await redisClient.get<number>(redisKey);
            currentActive = cachedVal !== null ? Number(cachedVal) : 0;
        } catch {
            currentActive = this.localActive.get(tenantId) || 0;
        }

        if (currentActive > 0) {
            const nextActive = currentActive - 1;
            try {
                if (nextActive === 0) {
                    await redisClient.del(redisKey);
                } else {
                    await redisClient.set(redisKey, nextActive, { ex: 15 });
                }
            } catch {
                this.localActive.set(tenantId, nextActive);
            }
        }
    }

    /**
     * Lấy thống kê pool của một Tenant cụ thể.
     */
    public async getTenantStats(tenantId: string, tenantName: string, plan: 'free' | 'pro' | 'enterprise'): Promise<TenantPoolStats> {
        const limit = this.TIER_LIMITS[plan]?.maxConcurrent || 3;
        const redisKey = `active_pool:${tenantId}`;
        
        let active = 0;
        try {
            const cachedVal = await redisClient.get<number>(redisKey);
            active = cachedVal !== null ? Number(cachedVal) : 0;
        } catch {
            active = this.localActive.get(tenantId) || 0;
        }

        const usage = limit > 0 ? (active / limit) * 100 : 0;
        
        let state: TenantPoolStats['state'] = 'NORMAL';
        if (active >= limit) {
            state = 'EXHAUSTED';
        } else if (usage >= 70) {
            state = 'HIGH_LOAD';
        }

        return {
            tenantId,
            tenantName,
            plan,
            activeConnections: active,
            maxConcurrentLimit: limit,
            usagePercentage: Math.round(usage),
            state
        };
    }

    /**
     * Mô phỏng lũ lụt truy vấn tải cao.
     */
    public async simulateFlood(tenantId: string, plan: 'free' | 'pro' | 'enterprise', count: number): Promise<{
        totalRequests: number;
        successfulAcquires: number;
        blockedRequests: number;
    }> {
        let successfulAcquires = 0;
        let blockedRequests = 0;

        for (let i = 0; i < count; i++) {
            const res = await this.acquireSlot(tenantId, plan);
            if (res.allowed) {
                successfulAcquires++;
            } else {
                blockedRequests++;
            }
        }

        // Tự động giải phóng sau 3 giây bất đồng bộ
        setTimeout(async () => {
            for (let i = 0; i < successfulAcquires; i++) {
                await this.releaseSlot(tenantId);
            }
        }, 3000);

        return {
            totalRequests: count,
            successfulAcquires,
            blockedRequests
        };
    }

    public async getViolations(tenantId: string): Promise<number> {
        const violationKey = `violations:${tenantId}`;
        try {
            const cachedViolations = await redisClient.get<number>(violationKey);
            return cachedViolations !== null ? Number(cachedViolations) : 0;
        } catch {
            return this.localViolations.get(tenantId) || 0;
        }
    }

    public async clearViolations(tenantId: string): Promise<void> {
        const violationKey = `violations:${tenantId}`;
        try {
            await redisClient.del(violationKey);
        } catch {
            this.localViolations.set(tenantId, 0);
        }
    }
}

export const tenantConnectionPooler = TenantConnectionPooler.getInstance();
