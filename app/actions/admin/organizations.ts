'use server';

import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/permissions';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAuditLog } from '@/lib/audit';

export interface Organization {
    id: string;
    name: string;
    logo_url: string | null;
    org_type: 'enterprise' | 'ngo' | 'partner';
    description: string | null;
    website_url: string | null;
    is_active: boolean;
    created_at: string;
    tenant_id: string | null;
    total_donated: number;
}

// ------- READ -------

export async function getOrganizations(tenantId?: string): Promise<{ organizations: Organization[]; error?: string }> {
    await requirePermission('tenants', 'read');
    const supabase = await createClient() as any;

    let query = supabase
        .from('organizations')
        .select('*')
        .order('name');

    if (tenantId) {
        query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query;

    if (error) return { organizations: [], error: error.message };
    return { organizations: (data as Organization[]) || [] };
}

export async function getOrganization(id: string): Promise<{ organization: Organization | null; error?: string }> {
    const supabase = await createClient() as any;

    const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return { organization: null, error: error.message };
    return { organization: data as Organization };
}

// ------- CREATE -------

export async function createOrganization(formData: FormData): Promise<{ success: boolean; error?: string }> {
    try {
        const user = await requireAdmin();
        await requirePermission('tenants', 'update');

        const insertData = {
            name: formData.get('name') as string,
            logo_url: (formData.get('logo_url') as string) || null,
            org_type: (formData.get('org_type') as string) || 'partner',
            description: (formData.get('description') as string) || null,
            website_url: (formData.get('website_url') as string) || null,
            is_active: formData.get('is_active') === 'true',
            tenant_id: (formData.get('tenant_id') as string) || null,
            total_donated: Number(formData.get('total_donated')) || 0,
        };

        const supabase = await createClient() as any;
        const { data, error } = await supabase.from('organizations').insert(insertData).select().single();

        if (error) return { success: false, error: error.message };

        await createAuditLog({
            user,
            action: 'create',
            tableName: 'organizations',
            recordId: data.id,
            newData: data,
        });

        revalidatePath('/admin/organizations');
        revalidatePath('/minh-bach');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Lỗi server khi tạo tổ chức' };
    }
}

// ------- UPDATE -------

export async function updateOrganization(id: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
    try {
        const user = await requireAdmin();
        await requirePermission('tenants', 'update');

        const updateData = {
            name: formData.get('name') as string,
            logo_url: (formData.get('logo_url') as string) || null,
            org_type: (formData.get('org_type') as string) || 'partner',
            description: (formData.get('description') as string) || null,
            website_url: (formData.get('website_url') as string) || null,
            is_active: formData.get('is_active') === 'true',
            tenant_id: (formData.get('tenant_id') as string) || null,
            total_donated: Number(formData.get('total_donated')) || 0,
        };

        const supabase = await createClient() as any;
        const { data: oldData } = await supabase.from('organizations').select('*').eq('id', id).single();
        const { error } = await supabase.from('organizations').update(updateData).eq('id', id);

        if (error) return { success: false, error: error.message };

        await createAuditLog({
            user,
            action: 'update',
            tableName: 'organizations',
            recordId: id,
            oldData,
            newData: updateData,
        });

        revalidatePath('/admin/organizations');
        revalidatePath(`/admin/organizations/${id}`);
        revalidatePath('/minh-bach');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Lỗi server khi cập nhật tổ chức' };
    }
}

// ------- DELETE -------

export async function deleteOrganization(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const user = await requireAdmin();
        await requirePermission('tenants', 'delete');

        const supabase = await createClient() as any;
        const { data: oldData } = await supabase.from('organizations').select('*').eq('id', id).single();
        const { error } = await supabase.from('organizations').delete().eq('id', id);

        if (error) return { success: false, error: error.message };

        await createAuditLog({
            user,
            action: 'delete',
            tableName: 'organizations',
            recordId: id,
            oldData,
        });

        revalidatePath('/admin/organizations');
        revalidatePath('/minh-bach');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Lỗi server khi xóa tổ chức' };
    }
}
