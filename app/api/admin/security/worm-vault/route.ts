import { NextRequest, NextResponse } from 'next/server';
import { isGlobalAdmin } from '@/lib/permissions';
import { 
    syncAuditLogsToWorm, 
    verifyWormLedgerIntegrity, 
    loadWormLedger,
    simulateWormTampering 
} from '@/lib/security/worm-vault';

export async function GET(req: NextRequest) {
    try {
        const globalAccess = await isGlobalAdmin();
        if (!globalAccess) {
            return NextResponse.json({ error: 'Unauthorized: Global Admin access required' }, { status: 403 });
        }
        
        const { searchParams } = new URL(req.url);
        const action = searchParams.get('action') || 'status';
        
        if (action === 'status') {
            const verification = await verifyWormLedgerIntegrity();
            const ledger = loadWormLedger();
            
            // Return latest 10 ledger blocks for preview
            const recentBlocks = ledger.slice(-15).reverse();
            
            return NextResponse.json({
                verification,
                recentBlocks,
                totalBlocks: ledger.length
            });
        }
        
        return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const globalAccess = await isGlobalAdmin();
        if (!globalAccess) {
            return NextResponse.json({ error: 'Unauthorized: Global Admin access required' }, { status: 403 });
        }
        
        const body = await req.json();
        const action = body.action;
        
        if (action === 'sync') {
            const result = await syncAuditLogsToWorm();
            const verification = await verifyWormLedgerIntegrity();
            return NextResponse.json({
                message: 'WORM Vault synchronization complete.',
                syncedCount: result.syncedCount,
                totalBlocks: result.totalBlocks,
                verification
            });
        }
        
        if (action === 'tamper') {
            const { index, newVal } = body;
            if (typeof index !== 'number' || !newVal) {
                return NextResponse.json({ error: 'Missing block index or new action value' }, { status: 400 });
            }
            
            const result = simulateWormTampering(index, newVal);
            if (result.success) {
                return NextResponse.json({ message: result.message });
            } else {
                return NextResponse.json({ error: result.message }, { status: 400 });
            }
        }
        
        return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
