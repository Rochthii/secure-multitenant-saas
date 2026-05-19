

/**
 * /api/admin/backup â€” Secured backup route
 * 
 * SECURITY:
 * - Requires admin role authentication
 * - Generates audit log for every backup
 * - Does NOT expose error stack traces
 * - Returns sanitized JSON backup of all data tables
 */
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getVietnamTime } from '@/lib/utils/date';
import { getUserContext, getTenantScope } from '@/lib/permissions';
import { createAuditLog } from '@/lib/audit';

export const maxDuration = 60; // 60s execution limit on Vercel
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const specificTable = searchParams.get('table');
        const now = getVietnamTime();
        
        // 1. Authenticate and retrieve scope
        const ctx = await getUserContext();
        if (!ctx || !['super_admin', 'company_editor', 'admin', 'tenant_admin'].includes(ctx.role)) {
             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const scope = await getTenantScope();
        const supabase = await createClient();

        // 2. Wrap queries to safely inject tenant isolation
        const fetchTable = (table: string) => {
            let query = supabase.from(table as any).select('*');
            if (scope) {
                query = query.eq('tenant_id', scope);
            }
            return query;
        };

        let backupData: any = {};

        if (specificTable) {
             // Partial export
             const { data, error } = await fetchTable(specificTable);
             if (error) {
                 return NextResponse.json({ error: `Failed to fetch table: ${specificTable}` }, { status: 400 });
             }
             backupData[specificTable] = data || [];
        } else {
            // Full export
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
            ] = await Promise.all([
                fetchTable('news'),
                fetchTable('events'),
                fetchTable('media'),
                fetchTable('transactions'),
                fetchTable('event_registrations'),
                fetchTable('settings'),
                fetchTable('pages'),
                fetchTable('about_sections'),
                fetchTable('hero_slides'),
                fetchTable('dharma_talks'),
                fetchTable('faqs'),
                fetchTable('contact_messages'),
            ]);

            backupData = {
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
            };
        }

        const backup = {
            version: '2.0',
            timestamp: new Date().toISOString(),
            exported_by: ctx.email,
            scope: scope ? `tenant:${scope}` : 'global',
            is_partial: !!specificTable,
            data: backupData,
        };

        // Audit log (mock User object structure if needed for createAuditLog)
        await createAuditLog({
            user: { id: ctx.userId, email: ctx.email },
            action: 'backup',
            tableName: specificTable || 'system',
            newData: {
                action: specificTable ? 'partial_backup_export' : 'full_backup_export',
                scope: scope || 'global',
                tables_count: Object.keys(backup.data).length,
                total_records: Object.values(backup.data).reduce((sum: number, arr) => sum + (arr as any[]).length, 0),
            },
        });

        return NextResponse.json(backup);
    } catch (err: any) {
        if (err.name === 'UnauthorizedError' || err.message?.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Backup error:', err);
        // DO NOT leak error details to client
        return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
    }
}
