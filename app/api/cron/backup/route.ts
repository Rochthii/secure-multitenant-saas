/**
 * /api/cron/backup â€” Automatic daily backup via cron
 * 
 * SECURITY:
 * - Protected by CRON_SECRET env var (required)
 * - Stores backup as JSON in Supabase Storage bucket 'backups'
 * - Keeps last 30 backups, auto-rotates older ones
 * - Generates audit log for each backup
 * 
 * SETUP (Vercel):
 *   vercel.json â†’ { "crons": [{ "path": "/api/cron/backup", "schedule": "0 3 * * *" }] }
 *   This runs daily at 3:00 AM UTC
 * 
 * SETUP (External cron):
 *   URL: https://your-domain.com/api/cron/backup
 *   Method: GET
 *   Header: Authorization: Bearer YOUR_CRON_SECRET
 *   Schedule: Daily at 3 AM
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAX_BACKUPS = 30; // Keep last 30 daily backups
export const maxDuration = 60; // Allow backup script up to 60s execution on Vercel

export async function GET(request: NextRequest) {
    try {
        // SECURITY: Verify cron secret
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret) {
            console.error('[Backup Cron] CRON_SECRET env var not set');
            return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
        }

        // Accept both "Bearer TOKEN" and Vercel's automatic cron auth
        const token = authHeader?.replace('Bearer ', '');
        if (token !== cronSecret) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createClient();

        // â”€â”€ 1. Export all data tables â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const [
            { data: news },
            { data: events },
            { data: media },
            { data: transactions },
            { data: registrations },
            { data: settings },
            { data: pages },
            { data: aboutSections },
            { data: heroSlides },
            { data: dharmaTalks },
            { data: faqs },
            { data: contactMessages },
            { data: newsletterSubs },
            { data: auditLogs },
        ] = await Promise.all([
            supabase.from('news').select('*'),
            supabase.from('events').select('*'),
            supabase.from('media').select('*'),
            supabase.from('transactions').select('*'),
            supabase.from('event_registrations').select('*'),
            supabase.from('settings').select('*'),
            supabase.from('pages').select('*'),
            supabase.from('about_sections').select('*'),
            supabase.from('hero_slides').select('*'),
            supabase.from('dharma_talks').select('*'),
            supabase.from('faqs').select('*'),
            supabase.from('contact_messages').select('*'),
            supabase.from('newsletter_subscribers').select('*'),
            supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(1000),
        ]);

        const backup = {
            version: '2.0',
            type: 'auto_daily',
            timestamp: new Date().toISOString(),
            data: {
                news: news || [],
                events: events || [],
                media: media || [],
                transactions: transactions || [],
                registrations: registrations || [],
                settings: settings || [],
                pages: pages || [],
                about_sections: aboutSections || [],
                hero_slides: heroSlides || [],
                dharma_talks: dharmaTalks || [],
                faqs: faqs || [],
                contact_messages: contactMessages || [],
                newsletter_subscribers: newsletterSubs || [],
                audit_logs: auditLogs || [],
            },
        };

        const totalRecords = Object.values(backup.data)
            .reduce((sum, arr) => sum + (arr as any[]).length, 0);

        // â”€â”€ 2. Upload backup to Supabase Storage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // e.g., 2026-02-19
        const fileName = `backup-${dateStr}.json`;

        const backupJson = JSON.stringify(backup, null, 2);
        const backupBuffer = Buffer.from(backupJson, 'utf-8');

        const { error: uploadError } = await supabase.storage
            .from('backups')
            .upload(fileName, backupBuffer, {
                contentType: 'application/json',
                upsert: true, // Overwrite if same day runs twice
            });

        if (uploadError) {
            console.error('[Backup Cron] Upload failed:', uploadError.message);
            // Try creating the bucket if it doesn't exist
            if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket')) {
                await supabase.storage.createBucket('backups', {
                    public: false,
                    fileSizeLimit: 52428800, // 50MB
                });
                // Retry upload
                await supabase.storage
                    .from('backups')
                    .upload(fileName, backupBuffer, {
                        contentType: 'application/json',
                        upsert: true,
                    });
            } else {
                return NextResponse.json({
                    success: false,
                    error: 'Backup upload failed',
                }, { status: 500 });
            }
        }

        // â”€â”€ 3. Rotate old backups (keep last MAX_BACKUPS) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const { data: existingFiles } = await supabase.storage
            .from('backups')
            .list('', { sortBy: { column: 'name', order: 'desc' } });

        if (existingFiles && existingFiles.length > MAX_BACKUPS) {
            const filesToDelete = existingFiles
                .slice(MAX_BACKUPS)
                .map(f => f.name);

            if (filesToDelete.length > 0) {
                await supabase.storage
                    .from('backups')
                    .remove(filesToDelete);
                console.log(`[Backup Cron] Rotated ${filesToDelete.length} old backups`);
            }
        }

        // â”€â”€ 4. Log success â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // @ts-ignore - audit_logs table type
        await supabase.from('audit_logs').insert({
            user_id: null, // System action
            action: 'backup:system',
            resource: 'system', // THÃŠM Cá»˜T NÃ€Y VÃŒ CSDL Báº®T BUá»˜C NOT NULL
            table_name: 'system',
            record_id: null,
            new_data: {
                type: 'auto_daily',
                file: fileName,
                tables_count: Object.keys(backup.data).length,
                total_records: totalRecords,
                size_bytes: backupBuffer.length,
            },
        });

        console.log(`[Backup Cron] ✅ Backup completed: ${fileName} (${totalRecords} records, ${(backupBuffer.length / 1024).toFixed(1)} KB)`);

        // ── 5. Notify via Telegram (if configured) ──────────────────────────────────
        if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
            try {
                const message = `✅ *Auto Backup Completed*\n\n` +
                                `Environment: \`${process.env.NODE_ENV}\`\n` +
                                `File: \`${fileName}\`\n` +
                                `Records: *${totalRecords}*\n` +
                                `Size: *${(backupBuffer.length / 1024).toFixed(1)} KB*\n` +
                                `Date: ${dateStr}`;

                await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: process.env.TELEGRAM_CHAT_ID,
                        text: message,
                        parse_mode: 'Markdown'
                    })
                });
            } catch (notifyErr) {
                console.error('[Backup Cron] Failed to send Telegram notification', notifyErr);
            }
        }

        return NextResponse.json({
            success: true,
            file: fileName,
            tables: Object.keys(backup.data).length,
            total_records: totalRecords,
            size_kb: Math.round(backupBuffer.length / 1024),
            timestamp: backup.timestamp,
        });
    } catch (err: any) {
        console.error('[Backup Cron] Error:', err);
        return NextResponse.json({
            success: false,
            error: 'Backup failed',
        }, { status: 500 });
    }
}
