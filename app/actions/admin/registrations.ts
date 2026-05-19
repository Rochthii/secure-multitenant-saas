'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin, requireEditor } from '@/lib/auth/require-admin';
import { requirePermission, enforceTenantScopeForRecord } from '@/lib/permissions';
import { createAuditLog } from '@/lib/audit';
import { z } from 'zod';

// ─── Schema validation ─────────────────────────────────────────────────────────

const RegistrationStatusSchema = z.enum(['pending', 'confirmed', 'cancelled']);

// ─── GET REGISTRATIONS (by event) ─────────────────────────────────────────────

export async function getEventRegistrations(eventId: string) {
    try {
        await requireEditor();
        const supabase = await createClient();

        const { data, error } = await (supabase as any)
            .from('event_registrations')
            .select('*')
            .eq('event_id', eventId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data: data ?? [] };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, data: [], unauthorized: true };
        console.error('Get registrations error:', err);
        return { success: false, error: 'Có lỗi khi tải danh sách đăng ký', data: [] };
    }
}
// ─── UPDATE REGISTRATION STATUS (admin/editor) ────────────────────────────────

export async function updateRegistrationStatus(
    registrationId: string,
    status: 'pending' | 'confirmed' | 'cancelled',
) {
    try {
        const user = await requireEditor();
        await requirePermission('events', 'update');
        const supabase = await createClient();

        // Runtime validate status
        const parsed = RegistrationStatusSchema.safeParse(status);
        if (!parsed.success) {
            return { success: false, error: `Trạng thái không hợp lệ: "${status}"` };
        }

        const { data: oldData, error: fetchError } = await (supabase as any)
            .from('event_registrations')
            .select('*')
            .eq('id', registrationId)
            .single();

        if (fetchError || !oldData) {
            return { success: false, error: 'Không tìm thấy đăng ký' };
        }

        await enforceTenantScopeForRecord('events', oldData.event_id);

        const updateData: any = {
            status: parsed.data,
            updated_at: new Date().toISOString(),
        };

        if (parsed.data === 'confirmed') {
            updateData.confirmed_at = new Date().toISOString();
            updateData.confirmed_by = user.id;
        }

        const { error } = await (supabase as any)
            .from('event_registrations')
            .update(updateData)
            .eq('id', registrationId);

        if (error) {
            return { success: false, error: 'Có lỗi khi cập nhật trạng thái: ' + error.message };
        }

        await createAuditLog({
            user,
            action: 'update',
            tableName: 'event_registrations',
            recordId: registrationId,
            oldData: oldData,
            newData: updateData,
        });

        revalidatePath(`/admin/events/${oldData.event_id}`);
        revalidatePath(`/admin/events/${oldData.event_id}/registrations`);
        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Update registration status error:', err);
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}

// ─── DELETE REGISTRATION (admin only) ─────────────────────────────────────────

export async function deleteRegistration(registrationId: string) {
    try {
        const user = await requireAdmin();
        await requirePermission('events', 'delete');
        const supabase = await createClient();

        const { data: oldData } = await (supabase as any)
            .from('event_registrations')
            .select('*')
            .eq('id', registrationId)
            .single();

        if (oldData) {
            await enforceTenantScopeForRecord('events', oldData.event_id);
        }

        const { error } = await (supabase as any)
            .from('event_registrations')
            .delete()
            .eq('id', registrationId);

        if (error) {
            return { success: false, error: 'Có lỗi khi xóa đăng ký: ' + error.message };
        }

        await createAuditLog({
            user,
            action: 'delete',
            tableName: 'event_registrations',
            recordId: registrationId,
            oldData: oldData ?? null,
        });

        if (oldData?.event_id) {
            revalidatePath(`/admin/events/${oldData.event_id}`);
        }
        return { success: true };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, unauthorized: true };
        console.error('Delete registration error:', err);
        return { success: false, error: 'Có lỗi xảy ra' };
    }
}

// ─── EXPORT REGISTRATIONS (admin only) ────────────────────────────────────────

export async function getRegistrationStats(eventId: string) {
    try {
        await requireEditor();
        const supabase = await createClient();

        const { data: event } = await (supabase as any)
            .from('events')
            .select('max_participants')
            .eq('id', eventId)
            .single();

        const { data: counts } = await (supabase as any)
            .from('event_registrations')
            .select('status')
            .eq('event_id', eventId);

        const stats = { total: 0, pending: 0, confirmed: 0, cancelled: 0 };
        for (const r of counts ?? []) {
            stats.total++;
            if (r.status === 'pending') stats.pending++;
            if (r.status === 'confirmed') stats.confirmed++;
            if (r.status === 'cancelled') stats.cancelled++;
        }

        const maxParticipants = event?.max_participants ?? null;
        const available = maxParticipants !== null
            ? Math.max(0, maxParticipants - stats.pending - stats.confirmed)
            : null;

        return { success: true, stats, maxParticipants, available };
    } catch (err: any) {
        if (err.name === 'UnauthorizedError') return { success: false, error: err.message, stats: null };
        return { success: false, error: 'Có lỗi khi tải thống kê', stats: null };
    }
}
