import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * Warmup endpoint â€” Ä‘Æ°á»£c gá»i bá»Ÿi Vercel Cron má»—i 5 phÃºt.
 * Má»¥c Ä‘Ã­ch: ngÄƒn Supabase free tier "ngá»§" sau thá»i gian khÃ´ng hoáº¡t Ä‘á»™ng,
 * loáº¡i bá» cold start 2-3s cho ngÆ°á»i dÃ¹ng thá»±c táº¿.
 *
 * Cron schedule: Ä‘Ã£ cáº¥u hÃ¬nh trong vercel.json
 */

export async function GET(request: Request) {
    // Báº£o vá»‡ endpoint báº±ng CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Query nháº¹ nháº¥t cÃ³ thá»ƒ â€” chá»‰ Ä‘á»ƒ giá»¯ DB awake
        const start = Date.now();
        const { error } = await supabase.from('categories').select('id').limit(1);
        const latency = Date.now() - start;

        if (error) {
            console.error('[Warmup] DB ping failed:', error.message);
            return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
        }

        console.log(`[Warmup] DB ping OK â€” ${latency}ms`);
        return NextResponse.json({
            ok: true,
            latency_ms: latency,
            timestamp: new Date().toISOString(),
        });
    } catch (err: any) {
        console.error('[Warmup] Unexpected error:', err);
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
    }
}
