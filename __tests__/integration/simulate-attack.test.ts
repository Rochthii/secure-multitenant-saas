import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as simulateAttackPOST } from '@/app/api/admin/security/simulate-attack/route';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { isGlobalAdmin, getUserContext } from '@/lib/permissions';

// Mocks
const mockedCreateClient = vi.mocked(createClient);
const mockedCreateAdminClient = vi.mocked(createAdminClient);
const mockedIsGlobalAdmin = vi.mocked(isGlobalAdmin);
const mockedGetUserContext = vi.mocked(getUserContext);

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(),
    createAdminClient: vi.fn()
}));

vi.mock('@/lib/permissions', () => ({
    isGlobalAdmin: vi.fn(),
    getUserContext: vi.fn()
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}));

let mockQuery: any;

describe('Threat Simulator API Integration Test', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockQuery = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            then: vi.fn().mockImplementation((resolve) => resolve({ data: [], error: null })),
        };
        mockQuery.from = vi.fn().mockReturnValue(mockQuery);

        mockedCreateClient.mockResolvedValue({ from: mockQuery.from } as any);
        mockedCreateAdminClient.mockResolvedValue({ from: mockQuery.from } as any);
    });

    it('returns 403 Forbidden if user is not global admin', async () => {
        mockedIsGlobalAdmin.mockResolvedValue(false);

        const request = new Request('http://localhost/api/admin/security/simulate-attack', {
            method: 'POST',
            body: JSON.stringify({ scenario: 'cross_tenant_read' })
        });

        const response = await simulateAttackPOST(request as any);
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body.error).toBe('Unauthorized');
    });

    it('returns valid results and metadata for cross_tenant_read', async () => {
        mockedIsGlobalAdmin.mockResolvedValue(true);
        mockedGetUserContext.mockResolvedValue({
            role: 'super_admin',
            userId: 'sa-1',
            email: 'sa@test.com',
            tenantId: 'tenant-a-id',
            tenantName: 'Tenant A'
        });

        // Mock tenant list query and news query returns
        mockQuery.then.mockImplementation((resolve: any) => {
            // First mock query is tenants, second is news (0 rows returned -> blocked)
            if (mockQuery.from.mock.calls.length === 1) {
                return resolve({
                    data: [
                        { id: 'tenant-a-id', name: 'Tenant A' },
                        { id: 'tenant-b-id', name: 'Tenant B' }
                    ],
                    error: null
                });
            }
            return resolve({ data: [], error: null }); // RLS Blocked
        });

        const request = new Request('http://localhost/api/admin/security/simulate-attack', {
            method: 'POST',
            body: JSON.stringify({ scenario: 'cross_tenant_read' })
        });

        const response = await simulateAttackPOST(request as any);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.scenario).toBe('cross_tenant_read');
        expect(body.blocked).toBe(true);
        expect(body.why_blocked).toBeDefined();
        expect(body.explain_analyze).toContain('EXPLAIN ANALYZE');
        expect(body.security_impact.risk_level).toBe('CRITICAL');
        expect(body.security_impact.cvss_score).toBe(8.5);
    });

    it('returns isolated outcomes for cache_pollution scenario', async () => {
        mockedIsGlobalAdmin.mockResolvedValue(true);
        mockedGetUserContext.mockResolvedValue({
            role: 'super_admin',
            userId: 'sa-1',
            email: 'sa@test.com',
            tenantId: 'tenant-a-id',
            tenantName: 'Tenant A'
        });

        mockQuery.then.mockImplementation((resolve: any) => {
            // Mock empty arrays to simulate secure isolated behavior
            return resolve({ data: [], error: null });
        });

        const request = new Request('http://localhost/api/admin/security/simulate-attack', {
            method: 'POST',
            body: JSON.stringify({ scenario: 'cache_pollution' })
        });

        const response = await simulateAttackPOST(request as any);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.scenario).toBe('cache_pollution');
        expect(body.blocked).toBe(true);
        expect(body.why_blocked).toContain('Request isolated');
        expect(body.explain_analyze).toContain('Cache Store Lookup');
        expect(body.security_impact.risk_level).toBe('HIGH');
    });

    it('returns parameterized query outcomes for sql_injection scenario', async () => {
        mockedIsGlobalAdmin.mockResolvedValue(true);
        mockedGetUserContext.mockResolvedValue({
            role: 'super_admin',
            userId: 'sa-1',
            email: 'sa@test.com',
            tenantId: 'tenant-a-id',
            tenantName: 'Tenant A'
        });

        mockQuery.then.mockImplementation((resolve: any) => {
            return resolve({ data: [], error: null });
        });

        const request = new Request('http://localhost/api/admin/security/simulate-attack', {
            method: 'POST',
            body: JSON.stringify({ scenario: 'sql_injection' })
        });

        const response = await simulateAttackPOST(request as any);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.scenario).toBe('sql_injection');
        expect(body.blocked).toBe(true);
        expect(body.why_blocked).toContain('Request sanitized');
        expect(body.explain_analyze).toContain('EXPLAIN ANALYZE');
        expect(body.security_impact.risk_level).toBe('CRITICAL');
        expect(body.security_impact.cvss_score).toBe(9.8);
    });
});
