import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * API route for automated database backups.
 * Designed to be called by Vercel Cron.
 * This script exports critical table data to JSON and stores it in Supabase Storage.
 */
export async function GET(req: Request) {
    try {
        // Authenticate the cron job (using a secret key in headers)
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createClient();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const tablesToBackup = ['transactions', 'news', 'events', 'transaction_projects', 'settings'];

        const backupData: Record<string, any> = {};

        for (const table of tablesToBackup) {
            const { data, error } = await supabase.from(table as any).select('*');
            if (error) {
                console.error(`Backup failed for table ${table}:`, error);
                continue;
            }
            backupData[table] = data;
        }

        const backupContent = JSON.stringify(backupData, null, 2);
        const fileName = `backups/db_backup_${timestamp}.json`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('system' as any) // Assuming a 'system' bucket exists
            .upload(fileName, backupContent, {
                contentType: 'application/json',
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Failed to upload backup to storage:', uploadError);
            return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `Backup ${fileName} completed successfully.`,
            tables: tablesToBackup
        });

    } catch (error) {
        console.error('Backup error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
