import React from 'react';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { requirePermission, getUserRole, Role } from '@/lib/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomizePermissionsDialog } from '@/components/admin/customize-permissions-dialog';
import { getBasePermissionsByRole } from '@/lib/permissions';
// @ts-ignore - Module import cache
import { RoleSelector } from '@/components/admin/role-selector';
// @ts-ignore - Module import cache
import { UserForm } from '@/components/admin/user-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getUserContext } from '@/lib/permissions';

export default async function UserEditPage({ params }: { params: Promise<{ id: string }> }) {
    // Check permission
    await requirePermission('users', 'update');

    const { id } = await params;

    let supabaseAdmin: any;
    try {
        supabaseAdmin = await createAdminClient();
    } catch {
        // SERVICE_ROLE_KEY not set — getUserById will fail gracefully below
        supabaseAdmin = await createClient();
    }
    const currentUserRole = await getUserRole();

    // Fetch user details from auth.users (requires service role)
    let user: any = null;
    let fetchError: any = null;
    try {
        const result = await supabaseAdmin.auth.admin.getUserById(id);
        user = result.data?.user;
        fetchError = result.error;
    } catch {
        fetchError = new Error('Service role key required to fetch user details');
    }

    if (fetchError || !user) {
        notFound();
    }

    // Fetch active role from user_roles
    const { data: userRoleData } = await (supabaseAdmin as any)
        .from('user_roles')
        .select('role, tenant_id, custom_permissions')
        .eq('user_id', id)
        .single();

    const activeRole = (userRoleData?.role ?? user.app_metadata?.role ?? user.user_metadata?.role ?? 'viewer') as Role;
    const activeTenantId = userRoleData?.tenant_id ?? null;
    const customPermissions = userRoleData?.custom_permissions || null;

    // Security Guard: tenant_admin can ONLY edit users within their own tenant
    const ctx = await getUserContext();
    if (ctx?.role === 'tenant_admin') {
        if (!activeTenantId || activeTenantId !== ctx.tenantId) {
            notFound(); // Hide the existence of other users from local admins
        }
    }

    const basePermissions = await getBasePermissionsByRole(activeRole);

    // Fetch tenants for dropdown
    const { data: tenants } = await supabaseAdmin
        .from('tenants')
        .select('id, name')
        .order('name');

    // Only Admin roles can see the Customize Permissions button
    const canCustomizePermissions = ['super_admin', 'admin', 'company_editor', 'tenant_admin'].includes(currentUserRole || '');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/users">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-playfair font-bold">Edit User</h1>
                    <p className="text-gray-600 mt-1">{user.email}</p>
                </div>
            </div>

            {/* User Details Card */}
            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>User Information</CardTitle>
                    {canCustomizePermissions && (
                        <CustomizePermissionsDialog
                            userId={user.id}
                            userName={user.user_metadata?.full_name || user.email}
                            basePermissions={basePermissions as any}
                            initialOverrides={customPermissions}
                        />
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Email</Label>
                            <Input value={user.email || ''} disabled className="mt-1" />
                        </div>
                        <div>
                            <Label>User ID</Label>
                            <Input value={user.id} disabled className="mt-1" />
                        </div>
                        <div>
                            <Label>Created At</Label>
                            <Input
                                value={new Date(user.created_at).toLocaleString()}
                                disabled
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Last Sign In</Label>
                            <Input
                                value={user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}
                                disabled
                                className="mt-1"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* User Form (role selection, deactivate) */}
            <UserForm
                userId={user.id}
                currentRole={activeRole}
                currentTenantId={activeTenantId}
                tenants={tenants || []}
                isBanned={!!user.banned_until}
                canEdit={['super_admin', 'admin', 'company_editor', 'tenant_admin'].includes(currentUserRole || '')}
                metadata={user.user_metadata}
                currentUserRole={currentUserRole}
            />
        </div>
    );
}
