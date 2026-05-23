// ============================================================================
// TENANT CONNECTION POOL LIMITER (NOISY NEIGHBOR MITIGATION)
// ============================================================================
// Triển khai cô lập tài nguyên và điều tiết kết nối đồng thời ở tầng ứng dụng
// mô phỏng cấu hình giới hạn connection pool của Supavisor cho từng Tenant.
// ============================================================================

export interface TenantPoolStats {
    tenantId: string;
    tenantName: string;
    plan: 'free' | 'pro' | 'enterprise';
    activeConnections: number;
    maxConcurrentLimit: number;
    usagePercentage: number;
    state: 'NORMAL' | 'HIGH_LOAD' | 'EXHAUSTED';
}

// Global database connection slot manager
class TenantConnectionPooler {
    private static instance: TenantConnectionPooler;
    // Map tracking active request slots per tenant
    private activeConnections: Map<string, number> = new Map();
    // Track rate limit violations (noisy neighbor flags)
    private rateLimitViolations: Map<string, number> = new Map();

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
     * Trả về kết quả cho phép hay bị chặn nhằm bảo vệ Noisy Neighbor.
     */
    public acquireSlot(tenantId: string, plan: 'free' | 'pro' | 'enterprise'): {
        allowed: boolean;
        active: number;
        limit: number;
        error?: string;
    } {
        const limit = this.TIER_LIMITS[plan]?.maxConcurrent || 3;
        const currentActive = this.activeConnections.get(tenantId) || 0;

        if (currentActive >= limit) {
            // Đánh dấu vi phạm (Noisy Neighbor Indicator)
            const violations = this.rateLimitViolations.get(tenantId) || 0;
            this.rateLimitViolations.set(tenantId, violations + 1);

            return {
                allowed: false,
                active: currentActive,
                limit,
                error: `NOISY NEIGHBOR EXCLUSION: Chi nhánh ${tenantId} đã vượt ngưỡng kết nối đồng thời cho phép (${limit} connections). Kết nối bị ngắt kết nối để bảo toàn Connection Pool chung.`
            };
        }

        this.activeConnections.set(tenantId, currentActive + 1);
        return {
            allowed: true,
            active: currentActive + 1,
            limit
        };
    }

    /**
     * Giải phóng 1 kết nối sau khi query hoàn thành.
     */
    public releaseSlot(tenantId: string): void {
        const currentActive = this.activeConnections.get(tenantId) || 0;
        if (currentActive > 0) {
            this.activeConnections.set(tenantId, currentActive - 1);
        }
    }

    /**
     * Lấy thống kê pool của một Tenant cụ thể.
     */
    public getTenantStats(tenantId: string, tenantName: string, plan: 'free' | 'pro' | 'enterprise'): TenantPoolStats {
        const active = this.activeConnections.get(tenantId) || 0;
        const limit = this.TIER_LIMITS[plan]?.maxConcurrent || 3;
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
     * Simulate a high-load query flood to test active block mechanism.
     */
    public async simulateFlood(tenantId: string, plan: 'free' | 'pro' | 'enterprise', count: number): Promise<{
        totalRequests: number;
        successfulAcquires: number;
        blockedRequests: number;
    }> {
        let successfulAcquires = 0;
        let blockedRequests = 0;

        // Try to acquire slots in parallel
        for (let i = 0; i < count; i++) {
            const res = this.acquireSlot(tenantId, plan);
            if (res.allowed) {
                successfulAcquires++;
            } else {
                blockedRequests++;
            }
        }

        // Release the successfully acquired slots after 3 seconds asynchronously
        setTimeout(() => {
            for (let i = 0; i < successfulAcquires; i++) {
                this.releaseSlot(tenantId);
            }
        }, 3000);

        return {
            totalRequests: count,
            successfulAcquires,
            blockedRequests
        };
    }

    public getViolations(tenantId: string): number {
        return this.rateLimitViolations.get(tenantId) || 0;
    }

    public clearViolations(tenantId: string): void {
        this.rateLimitViolations.set(tenantId, 0);
    }
}

export const tenantConnectionPooler = TenantConnectionPooler.getInstance();
