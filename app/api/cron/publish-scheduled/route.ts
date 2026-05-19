import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getVietnamTime } from '@/lib/utils/date';

// Cron job: Auto-publish scheduled news
// Chạy mỗi 15 phút (vercel.json schedule: "*/15 * * * *")
// Security: Authorization: Bearer CRON_SECRET

export async function POST(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        console.error('[publish-scheduled] Unauthorized cron attempt');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabase = await createAdminClient();
        // Sử dụng giờ Việt Nam để đồng bộ với các bài đăng được lên lịch tại Việt Nam
        const now = getVietnamTime().toISOString();

        // 1. Tìm tất cả bài có status = 'scheduled' và scheduled_at <= now
        const { data: scheduledNews, error: fetchError } = await (supabase as any)
            .from('news')
            .select('id, title_vi, scheduled_at')
            .eq('status', 'scheduled')
            .lte('scheduled_at', now);

        if (fetchError) {
            console.error('[publish-scheduled] Fetch error:', fetchError);
            return NextResponse.json(
                { error: 'Lỗi truy vấn database', details: fetchError.message },
                { status: 500 }
            );
        }

        if (!scheduledNews || scheduledNews.length === 0) {
            console.log('[publish-scheduled] Không có bài cần publish.');
            return NextResponse.json({ success: true, published: 0, message: 'Không có bài cần publish' });
        }

        console.log(`[publish-scheduled] Tìm thấy ${scheduledNews.length} bài cần publish.`);

        // 2. Publish từng bài
        const publishedIds: string[] = [];
        const failedIds: string[] = [];

        for (const article of scheduledNews) {
            const { error: updateError } = await (supabase as any)
                .from('news')
                .update({
                    status: 'published',
                    published_at: now,
                    updated_at: now,
                })
                .eq('id', article.id)
                .eq('status', 'scheduled'); // Double-check

            if (updateError) {
                console.error(`[publish-scheduled] Failed to publish ${article.id}:`, updateError);
                failedIds.push(article.id);
            } else {
                console.log(`[publish-scheduled] Published: "${article.title_vi}" (${article.id})`);
                publishedIds.push(article.id);
            }
        }

        // 3. Ghi audit log batch
        if (publishedIds.length > 0) {
            await (supabase as any).from('audit_logs').insert({
                user_id: null,
                user_email: 'system@cron',
                action: 'auto_publish',
                resource: 'news',
                table_name: 'news',
                record_id: null,
                new_data: {
                    published_ids: publishedIds,
                    triggered_at: now,
                    total: publishedIds.length,
                },
                created_at: now,
            });
        }

        return NextResponse.json({
            success: true,
            published: publishedIds.length,
            failed: failedIds.length,
            publishedIds,
            failedIds: failedIds.length > 0 ? failedIds : undefined,
        });

    } catch (error) {
        console.error('[publish-scheduled] Cron job crashed:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// Vercel Cron có thể gọi qua GET
export async function GET(request: NextRequest) {
    return POST(request);
}
