import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { tenantConnectionPooler } from '@/lib/security/tenant-pooler';
import { 
    syncAuditLogsToWorm, 
    verifyWormLedgerIntegrity, 
    loadWormLedger,
    simulateWormTampering,
    WormBlock
} from '@/lib/security/worm-vault';
import { createAdminClient } from '@/lib/supabase/server';

// Mock Supabase
const mockedCreateAdminClient = vi.mocked(createAdminClient);
vi.mock('@/lib/supabase/server', () => ({
    createAdminClient: vi.fn()
}));

const VAULT_DIR = path.join(process.cwd(), 'storage', 'worm_vault');
const LEDGER_PATH = path.join(VAULT_DIR, 'immutable_ledger.json');

describe('Cryptographic WORM Vault & Tenant Connection Pooler Integration Tests', () => {
    let mockQuery: any;

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Clean up physical ledger file if exists to guarantee sandbox state
        if (fs.existsSync(LEDGER_PATH)) {
            try {
                fs.chmodSync(LEDGER_PATH, 0o666);
                fs.unlinkSync(LEDGER_PATH);
            } catch {}
        }

        mockQuery = {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            then: vi.fn().mockImplementation((resolve) => resolve({ 
                data: [
                    {
                        id: 'log-1',
                        tenant_id: 'tenant-1',
                        user_email: 'user1@test.com',
                        action: 'insert',
                        table_name: 'news',
                        record_id: 'rec-1',
                        severity: 'info',
                        created_at: '2026-05-23T01:00:00Z'
                    },
                    {
                        id: 'log-2',
                        tenant_id: 'tenant-1',
                        user_email: 'user1@test.com',
                        action: 'update',
                        table_name: 'news',
                        record_id: 'rec-1',
                        severity: 'info',
                        created_at: '2026-05-23T01:05:00Z'
                    }
                ], 
                error: null 
            })),
        };
        mockQuery.from = vi.fn().mockReturnValue(mockQuery);
        mockedCreateAdminClient.mockResolvedValue({ from: mockQuery.from } as any);
    });

    afterEach(() => {
        // Cleanup after tests
        if (fs.existsSync(LEDGER_PATH)) {
            try {
                fs.chmodSync(LEDGER_PATH, 0o666);
                fs.unlinkSync(LEDGER_PATH);
            } catch {}
        }
    });

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 1: WORM CRYPTOGRAPHIC VAULT TESTS
    // ─────────────────────────────────────────────────────────────────────────
    describe('WORM Cryptographic Vault', () => {
        it('synchronizes database logs and computes valid hash chains', async () => {
            const syncResult = await syncAuditLogsToWorm();
            expect(syncResult.syncedCount).toBe(2);
            expect(syncResult.totalBlocks).toBe(2);

            const ledger = loadWormLedger();
            expect(ledger.length).toBe(2);
            expect(ledger[0].index).toBe(1);
            expect(ledger[0].prev_hash).toBe('0000000000000000000000000000000000000000000000000000000000000000');
            expect(ledger[1].index).toBe(2);
            expect(ledger[1].prev_hash).toBe(ledger[0].hash);

            const verification = await verifyWormLedgerIntegrity();
            expect(verification.isValid).toBe(true);
            expect(verification.status).toBe('SECURE');
        });

        it('detects tampering and breaks hash-chain validation', async () => {
            await syncAuditLogsToWorm();
            
            // Deliberately tamper with Block #1
            simulateWormTampering(1, 'ILLEGAL_TAMPERED_ACTION');
            
            const verification = await verifyWormLedgerIntegrity();
            expect(verification.isValid).toBe(false);
            expect(verification.status).toBe('TAMPERED');
            expect(verification.tamperedBlockIndices).toContain(1);
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 2: NOISY NEIGHBOR CONNECTION LIMITER TESTS
    // ─────────────────────────────────────────────────────────────────────────
    describe('Tenant Connection Pooler', () => {
        it('enforces connection pool limit and blocks exceeding concurrent requests', async () => {
            const tenantId = 'noisy-tenant-uuid';
            const plan = 'free'; // Limit free is 3
            
            // Acquire 3 connections (100% capacity)
            const acq1 = tenantConnectionPooler.acquireSlot(tenantId, plan);
            const acq2 = tenantConnectionPooler.acquireSlot(tenantId, plan);
            const acq3 = tenantConnectionPooler.acquireSlot(tenantId, plan);
            
            expect(acq1.allowed).toBe(true);
            expect(acq2.allowed).toBe(true);
            expect(acq3.allowed).toBe(true);
            expect(acq3.active).toBe(3);
            
            // 4th connection should be BLOCKED due to noisy neighbor limitation
            const acq4 = tenantConnectionPooler.acquireSlot(tenantId, plan);
            expect(acq4.allowed).toBe(false);
            expect(acq4.error).toContain('NOISY NEIGHBOR EXCLUSION');
            
            // Release 1 connection and try again
            tenantConnectionPooler.releaseSlot(tenantId);
            const acq5 = tenantConnectionPooler.acquireSlot(tenantId, plan);
            expect(acq5.allowed).toBe(true);
            expect(acq5.active).toBe(3);

            // Clean up connections
            tenantConnectionPooler.releaseSlot(tenantId);
            tenantConnectionPooler.releaseSlot(tenantId);
            tenantConnectionPooler.releaseSlot(tenantId);
        });

        it('simulates batch flood query blocks', async () => {
            const tenantId = 'flood-tenant-uuid';
            const plan = 'free'; // limit is 3
            
            const results = await tenantConnectionPooler.simulateFlood(tenantId, plan, 10);
            expect(results.totalRequests).toBe(10);
            expect(results.successfulAcquires).toBe(3);
            expect(results.blockedRequests).toBe(7); // 7 blocked due to slot limit
        });
    });
});
