import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { addDays, format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Initialize Resend with API key
// Note: This requires RESEND_API_KEY environment variable to be set
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

/**
 * API Route: Send Event Reminder Emails
 * This endpoint should be called by a cron job daily to send reminder emails
 * for events happening tomorrow.
 * 
 * Setup cron job (example with Vercel Cron):
 * 1. Add to vercel.json:
 *    {
 *      "crons": [{
 *        "path": "/api/cron/send-event-reminders",
 *        "schedule": "0 9 * * *"
 *      }]
 *    }
 * 
 * 2. Or use external cron service (cron-job.org, etc):
 *    - URL: https://your-domain.com/api/cron/send-event-reminders
 *    - Method: POST
 *    - Header: Authorization: Bearer YOUR_CRON_SECRET
 *    - Schedule: Daily at 9 AM
 */

import { getVietnamTime } from '@/lib/utils/date';

export async function POST(request: NextRequest) {
    console.log('Starting event reminder cron job...');
    const startTime = Date.now();
    let logId: string | null = null;

    // Security check: Verify CRON_SECRET if provided
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Only verify if CRON_SECRET is set in environment types
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        // Also allow Vercel Cron signature if needed, but for now simple secret check
        console.error('Unauthorized cron attempt');
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const adminDb = await createAdminClient();
        const { data: logEntry } = await (adminDb as any).from('cron_job_logs').insert({
            job_name: 'send-event-reminders',
            status: 'running',
            message: 'Đang kiểm tra và gửi email nhắc lịch...',
            metadata: { triggered_at: new Date().toISOString() },
        }).select('id').single();
        logId = logEntry?.id ?? null;

        const supabase = await createClient();

        // 1. Identify events happening tomorrow chuẩn giờ VN
        const vnNow = getVietnamTime();
        const tomorrow = addDays(vnNow, 1);
        const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');

        console.log(`Checking for events on: ${tomorrowStr}`);

        // Define generic types for database tables
        type Event = {
            id: string;
            title_vi: string;
            start_time: string | null;
            location: string | null;
            thumbnail_url: string | null;
        };

        type Registration = {
            id: string;
            full_name: string;
            email: string | null;
            event_id: string;
        };

        const { data: events, error: eventsError } = await supabase
            .from('events')
            .select('id, title_vi, start_time, location, thumbnail_url')
            .eq('start_date', tomorrowStr)
            .returns<Event[]>();

        if (eventsError) {
            console.error('Error fetching events:', eventsError);
            throw eventsError;
        }

        if (!events || events.length === 0) {
            console.log('No events found for tomorrow.');
            return NextResponse.json({
                message: 'No events found for tomorrow',
                count: 0
            });
        }

        console.log(`Found ${events.length} events for tomorrow.`);

        // 2. For each event, find confirmed registrations with email
        let totalEmailsSent = 0;
        const results = [];

        for (const event of events) {
            const { data: registrations, error: regsError } = await supabase
                .from('event_registrations')
                .select('id, full_name, email, event_id')
                .eq('event_id', event.id)
                .eq('status', 'confirmed')
                .not('email', 'is', null)
                .returns<Registration[]>();

            if (regsError) {
                console.error(`Error fetching registrations for event ${event.id}:`, regsError);
                continue;
            }

            if (!registrations || registrations.length === 0) {
                console.log(`No registrations with email found for event: ${event.title_vi}`);
                results.push({
                    event: event.title_vi,
                    registrations: 0,
                    emails_sent: 0
                });
                continue;
            }

            console.log(`Found ${registrations.length} registrations for event: ${event.title_vi}`);

            // 3. Send reminder email to each registrant
            let sentCount = 0;

            for (const reg of registrations) {
                if (!reg.email) continue;

                try {
                    // Start time formatting
                    const timeStr = event.start_time
                        ? event.start_time.slice(0, 5)
                        : '08:00'; // Default if missing

                    // Check if API key is present before sending
                    if (!process.env.RESEND_API_KEY) {
                        console.warn('RESEND_API_KEY not set, skipping email sending');
                        break; // Stop trying for this event
                    }

                    // Send email using Resend
                    const { data: emailData, error: emailError } = await resend.emails.send({
                        from: 'Hệ thống <noreply@system.com>', // Update with your verifying domain
                        to: reg.email,
                        subject: `Nháº¯c háº¹n: Sá»± kiá»‡n "${event.title_vi}" diá»…n ra vÃ o ngÃ y mai`,
                        html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #D4AF37;">Nháº¯c háº¹n tham dá»± sá»± kiá»‡n</h2>
                                <p>Xin chÃ o <strong>${reg.full_name}</strong>,</p>
                                <p>ChÃ¹a Chantarangsay xin trÃ¢n trá»ng nháº¯c báº¡n vá» sá»± kiá»‡n sáº½ diá»…n ra vÃ o ngÃ y mai:</p>
                                
                                <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #D4AF37; margin: 20px 0;">
                                    <h3 style="margin-top: 0;">${event.title_vi}</h3>
                                    <p><strong>ðŸ•’ Thá»i gian:</strong> ${timeStr}, ngÃ y ${format(tomorrow, 'dd/MM/yyyy', { locale: vi })}</p>
                                    <p><strong>ðŸ“ Äá»‹a Ä‘iá»ƒm:</strong> ${event.location || 'ChÃ¹a Chantarangsay'}</p>
                                </div>
                                
                                <p>Ráº¥t mong Ä‘Æ°á»£c Ä‘Ã³n tiáº¿p báº¡n táº¡i sá»± kiá»‡n.</p>
                                <p>TrÃ¢n trá»ng,<br/>Ban tá»• chá»©c ChÃ¹a Chantarangsay</p>
                                
                                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
                                <p style="font-size: 12px; color: #888;">Email nÃ y Ä‘Æ°á»£c gá»­i tá»± Ä‘á»™ng. Vui lÃ²ng khÃ´ng tráº£ lá»i email nÃ y.</p>
                            </div>
                        `
                    });

                    if (emailError) {
                        console.error(`Failed to send email to ${reg.email}:`, emailError);
                    } else {
                        console.log(`Email sent to ${reg.email} (ID: ${emailData?.id})`);
                        sentCount++;
                    }

                    // Add delay to respect rate limits if huge batch (optional)
                } catch (err) {
                    console.error(`Exception sending email to ${reg.email}:`, err);
                }
            }

            totalEmailsSent += sentCount;
            results.push({
                event: event.title_vi,
                registrations: registrations.length,
                emails_sent: sentCount
            });
        }

        if (logId) {
            const adminDb2 = await createAdminClient();
            await (adminDb2 as any).from('cron_job_logs').update({
                status: 'success',
                message: `Hoàn tất gửi nhắc hẹn. Tìm thấy ${events.length} sự kiện, đã gửi ${totalEmailsSent} emails.`,
                duration_ms: Date.now() - startTime,
                metadata: {
                    date: tomorrowStr,
                    total_events_found: events.length,
                    total_emails_sent: totalEmailsSent,
                    detail: results
                }
            }).eq('id', logId);
        }

        return NextResponse.json({
            success: true,
            date: tomorrowStr,
            total_events_found: events.length,
            total_emails_sent: totalEmailsSent,
            detail: results
        });

    } catch (error) {
        console.error('Cron job failed:', error);
        
        if (logId) {
            try {
                const adminDb3 = await createAdminClient();
                await (adminDb3 as any).from('cron_job_logs').update({
                    status: 'failed',
                    message: error instanceof Error ? error.message : String(error),
                    duration_ms: Date.now() - startTime,
                }).eq('id', logId);
            } catch (_) { /* ignore log error */ }
        }

        return NextResponse.json(
            { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
