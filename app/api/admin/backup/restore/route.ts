/**
 * /api/admin/backup/restore — RESTORE ROUTE
 * 
 * SECURITY:
 * - Requires admin/super_admin role
 * - Reads JSON file, validates schema
 * - Upserts data into tables
 * - Supports Isolated Restore (Disaster Recovery) by tenant_id to prevent cross-rollback
 */
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserContext, getTenantScope } from '@/lib/permissions';
import { createAuditLog } from '@/lib/audit';

export const maxDuration = 60; // 60s execution limit on Vercel
export async function POST(request: Request) {
    try {
        const ctx = await getUserContext();
        if (!ctx || !['super_admin', 'company_editor', 'admin', 'tenant_admin'].includes(ctx.role)) {
             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const scope = await getTenantScope();
        const supabase = await createClient();

        // 1. Lấy tenant_id cần khôi phục cô lập từ URL query parameter
        const { searchParams } = new URL(request.url);
        const targetTenantId = searchParams.get('tenant_id') || null;

        // Xác định effectiveTenantId:
        // - Nếu là tenant_admin: ép buộc dùng scope của họ
        // - Nếu là super_admin: dùng targetTenantId đã chọn (nếu có)
        const effectiveTenantId = scope || (targetTenantId !== 'all' ? targetTenantId : null);

        // 2. Get file from FormData
        const formData = await request.formData();
        const file = formData.get('backup_file') as File;
        
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // 3. Parse JSON
        const textWrapper = await file.text();
        const backupData = JSON.parse(textWrapper);

        if (!backupData || !backupData.version || !backupData.data) {
            return NextResponse.json({ error: 'Invalid backup file sequence' }, { status: 400 });
        }

        const dataTree = backupData.data;

        // Kiểm tra phân quyền phục hồi chéo
        if (scope && backupData.scope && backupData.scope !== `tenant:${scope}`) {
            return NextResponse.json({ error: `You only have permission to restore files scoped to tenant_id: ${scope}` }, { status: 403 });
        }

        // 4. Upsert data safely via chunks to avoid DB overload/timeout
        const CHUNK_SIZE = 500;
        let totalUpserted = 0;
        let totalSkipped = 0;

        for (const [table, records] of Object.entries(dataTree)) {
            const arr = records as any[];
            if (!arr || arr.length === 0) continue;

            // Lọc dữ liệu cô lập nghiêm ngặt:
            // Nếu có effectiveTenantId (khôi phục cô lập cho 1 tenant):
            // - Chỉ giữ lại những dòng có tenant_id khớp với effectiveTenantId.
            // - Bỏ qua toàn bộ các dòng khác để tránh Rollback chéo sang Tenant khác.
            const safeRecords = arr.filter(record => {
                if (effectiveTenantId) {
                    const match = record.tenant_id === effectiveTenantId;
                    if (!match) totalSkipped++;
                    return match;
                }
                return true; // global admins restore all if not isolated filter
            });

            if (safeRecords.length === 0) continue;

            for (let i = 0; i < safeRecords.length; i += CHUNK_SIZE) {
                const chunk = safeRecords.slice(i, i + CHUNK_SIZE);
                
                const { error } = await supabase.from(table as any)
                    .upsert(chunk, { ignoreDuplicates: false });
                
                if (error) {
                    console.error(`Error restoring table ${table}:`, error);
                    throw new Error(`Restoration failed at table ${table}: ${error.message}`);
                }
                
                totalUpserted += chunk.length;
            }
        }

        // 5. Ghi Audit Log chi tiết để đảm bảo tính minh bạch học thuật
        const isIsolated = !!effectiveTenantId;
        const detailsMessage = isIsolated 
            ? `Khôi phục thảm họa cô lập (Isolated Disaster Recovery) hoàn tất cho Tenant ID: [${effectiveTenantId}]. Đã khôi phục (UPSERT) thành công ${totalUpserted} bản ghi. Đã lọc bỏ và bảo toàn ${totalSkipped} bản ghi của các chi nhánh khác chống Rollback chéo.`
            : `Khôi phục toàn cục hệ thống (Global Restore) hoàn tất. Đã khôi phục (UPSERT) thành công ${totalUpserted} bản ghi.`;

        await createAuditLog({
            user: { id: ctx.userId, email: ctx.email },
            action: 'restore',
            tableName: 'system',
            newData: {
                total_records_upserted: totalUpserted,
                total_records_skipped: totalSkipped,
                is_isolated_recovery: isIsolated,
                target_tenant_id: effectiveTenantId || 'global',
                original_version: backupData.version,
                source_exported_by: backupData.exported_by,
                scope_restored: effectiveTenantId ? `tenant:${effectiveTenantId}` : 'global',
                message: detailsMessage
            },
        });

        return NextResponse.json({ 
            success: true, 
            total: totalUpserted,
            skipped: totalSkipped,
            isolated: isIsolated,
            target_tenant_id: effectiveTenantId,
            message: detailsMessage
        });

    } catch (err: any) {
        console.error('RESTORE ERROR:', err);
        return NextResponse.json({ error: err.message || 'Failed to parse restore data' }, { status: 500 });
    }
}
