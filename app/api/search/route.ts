import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { performGlobalSearch } from '@/lib/search';

// --- GET /api/search?q=... ---
export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const q = (searchParams.get('q') || '').trim();
    const limit = Math.min(Number(searchParams.get('limit') || 5), 20);

    if (!q || q.length < 2) {
        return NextResponse.json({ results: [], total: 0 });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Resolve Tenant ID by Host
    const host = req.headers.get('host') || 'localhost:3000';
    
    // In dev, handle ?tenant query param fallback if host is localhost
    let searchHost = host;
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
        const tenantParam = searchParams.get('tenant');
        if (tenantParam === 'phuly') searchHost = 'chuaphuly.vercel.app';
        else if (tenantParam === 'khleang') searchHost = 'khleang.vercel.app';
        else if (tenantParam === 'hophong') searchHost = 'chuahophongcu.com';
        else if (tenantParam === 'chantarangsay') searchHost = 'chua-chantarangsay-new.vercel.app';
        else searchHost = 'localhost:3000';
    }

    const { data: tenant } = await (supabase
        .from('tenants' as any)
        .select('id')
        .eq('domain', searchHost)
        .single() as any);
    
    const tenantId = tenant?.id;

    if (!tenantId) {
        console.error('[Search API] Could not resolve tenant for host:', searchHost);
        return NextResponse.json({ results: [], total: 0, error: 'Tenant not found' });
    }

    try {
        const results = await performGlobalSearch(supabase, q, tenantId, limit);

        return NextResponse.json(
            { results, total: results.length, query: q, tenantId },
            {
                headers: {
                    'Cache-Control': 's-maxage=30, stale-while-revalidate=60',
                }
            }
        );
    } catch (error) {
        console.error('[Search API Error]', error);
        return NextResponse.json({ error: 'Search failed', results: [], total: 0 }, { status: 500 });
    }
}
