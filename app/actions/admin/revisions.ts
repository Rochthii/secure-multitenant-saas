'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin, requireEditor } from '@/lib/auth/require-admin';
import { getTenantScope, getUserContext } from '@/lib/permissions';
import { createAuditLog } from '@/lib/audit';
import { revalidatePath } from 'next/cache';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ContentRevision {
    id: string;
    table_name: string;
    record_id: string;
    changed_by: string;
    changed_by_name?: string;
    old_data: Record<string, any> | null;
    new_data: Record<string, any>;
    change_summary?: string;
    tenant_id: string;
    created_at: string;
}

// ─── Lấy danh sách lịch sử phiên bản ─────────────────────────────────────────

export async function getRevisions(
    tableName: string,
    recordId: string
): Promise<{ revisions: ContentRevision[]; error?: string }> {
    try {
        await requireEditor();
        const scope = await getTenantScope();
        const supabase = await createClient();

        let query = supabase
            .from('content_revisions')
            .select('*')
            .eq('table_name', tableName)
            .eq('record_id', recordId);

        // Áp dụng cô lập dữ liệu theo Chi nhánh (Tenant Isolation)
        if (scope) {
            query = query.eq('tenant_id', scope);
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        // Trả về dữ liệu đúc kết trực tiếp từ DB Row tương ứng ContentRevision
        return { revisions: (data as any[]) || [] };
    } catch (err: any) {
        console.error('getRevisions error:', err);
        return { revisions: [], error: err.message };
    }
}

// ─── Ghi snapshot revision (dùng nội bộ trong update actions) ───────────────

export async function saveRevision({
    tableName,
    recordId,
    changedBy,
    oldData,
    newData,
    changeSummary,
    tenantId,
}: {
    tableName: string;
    recordId: string;
    changedBy: string;
    oldData: Record<string, any> | null;
    newData: Record<string, any>;
    changeSummary?: string;
    tenantId?: string;
}): Promise<void> {
    try {
        const supabase = await createClient();
        
        // Tự động tìm tenant_id nếu không được truyền vào trực tiếp
        let finalTenantId = tenantId || (newData as any)?.tenant_id || (oldData as any)?.tenant_id;
        
        if (!finalTenantId) {
            const ctx = await getUserContext();
            finalTenantId = ctx?.tenantId || '55555555-5555-5555-5555-555555555555';
        }

        await supabase
            .from('content_revisions')
            .insert({
                table_name: tableName,
                record_id: recordId,
                changed_by: changedBy,
                old_data: oldData as any,
                new_data: newData as any,
                change_summary: changeSummary || null,
                tenant_id: finalTenantId,
                created_at: new Date().toISOString(),
            });
    } catch (err) {
        // Không block flow chính nếu lưu revision thất bại
        console.error('saveRevision error (non-blocking):', err);
    }
}

// ─── Rollback về phiên bản cũ ─────────────────────────────────────────────────

export async function rollbackToRevision(
    revisionId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const user = await requireAdmin();
        const scope = await getTenantScope();
        const supabase = await createClient();

        // Lấy revision cần rollback kèm kiểm tra quyền sở hữu tenant
        let query = supabase
            .from('content_revisions')
            .select('*')
            .eq('id', revisionId);
            
        if (scope) {
            query = query.eq('tenant_id', scope);
        }

        const { data: revision, error: revErr } = await query.single();

        if (revErr || !revision) {
            return { success: false, error: 'Không tìm thấy phiên bản hoặc bạn không có quyền' };
        }

        if (!revision.old_data) {
            return { success: false, error: 'Phiên bản này không có dữ liệu để khôi phục' };
        }

        const { table_name, record_id, old_data, tenant_id } = revision as any;

        // Lấy dữ liệu hiện tại để ghi vào revision mới (trước khi overwrite)
        const { data: currentData } = await (supabase as any)
            .from(table_name)
            .select('*')
            .eq('id', record_id)
            .single();

        // Thực hiện Rollback (Ghi đè bản ghi gốc bằng old_data từ revision)
        const { error: updateErr } = await (supabase as any)
            .from(table_name)
            .update({ ...old_data, updated_at: new Date().toISOString() })
            .eq('id', record_id);

        if (updateErr) throw updateErr;

        // Ghi audit log cho hành động rollback
        await createAuditLog({
            user,
            action: 'update',
            tableName: table_name,
            recordId: record_id,
            tenantId: tenant_id,
            oldData: currentData,
            newData: old_data,
        });

        // Ghi revision mới cho lần rollback này (phiên bản snapshot mới)
        await saveRevision({
            tableName: table_name,
            recordId: record_id,
            changedBy: user.id,
            oldData: currentData,
            newData: old_data,
            tenantId: tenant_id,
            changeSummary: `Khôi phục phiên bản từ ${new Date(revision.created_at).toLocaleString('vi-VN')}`,
        });

        // Revalidate các path liên quan để UI cập nhật ngay lập tức
        revalidatePath('/admin', 'layout');
        if (table_name === 'hero_slides') {
             revalidatePath('/admin/hero-slides', 'page');
        }

        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message };
        console.error('rollbackToRevision error:', err);
        return { success: false, error: 'Có lỗi khi khôi phục phiên bản' };
    }
}
