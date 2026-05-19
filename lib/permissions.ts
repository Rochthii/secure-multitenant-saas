import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';

export type Role =
    | 'super_admin'
    | 'company_editor'
    | 'tenant_admin'
    | 'tenant_editor'
    | 'tenant_accountant'
    | 'agency_admin' // Reseller / Company Admin with restricted access
    // Legacy roles (kept for backward compat with existing app_metadata)
    | 'admin'
    | 'moderator'
    | 'editor'
    | 'volunteer'
    | 'viewer';

/** Roles that have global access across all tenants (no tenant isolation) */
export const GLOBAL_ADMIN_ROLES: Role[] = ['super_admin', 'company_editor', 'admin', 'agency_admin', 'tenant_accountant'];

/** Roles that belong to a specific tenant only */
export const TENANT_ROLES: Role[] = ['tenant_admin', 'tenant_editor', 'moderator', 'editor'];

export type Resource = 'users' | 'news' | 'events' | 'media' | 'transactions' | 'registrations' | 'settings' | 'analytics' | 'tenants' | 'categories' | 'dharma-talks' | 'mobile_app' | 'finance';
export type Action = 'create' | 'read' | 'update' | 'delete';

export interface Permission {
    can_create: boolean;
    can_read: boolean;
    can_update: boolean;
    can_delete: boolean;
}

export interface UserContext {
    userId: string;
    email: string | undefined;
    role: Role;
    tenantId: string | null;   // null = global (super_admin, company_editor)
    tenantName: string | null;
    customPermissions?: Record<string, Partial<Permission>>;
}

// ─── Request-scoped cache via React.cache() ───────────────────────────────────
// Deduplicates all calls within the SAME server render request.
const getCachedUserContext = cache(async (): Promise<UserContext | null> => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // 1. Try to get role from the new user_roles table (multi-tenant aware)
    // Cast as any because database.types.ts doesn't include user_roles yet
    const { data: userRole } = await (supabase as any)
        .from('user_roles')
        .select('role, tenant_id, custom_permissions, tenants(name)')
        .eq('user_id', user.id)
        .maybeSingle();

    if (userRole) {
        return {
            userId: user.id,
            email: user.email,
            role: userRole.role as Role,
            tenantId: userRole.tenant_id ?? null,
            tenantName: (userRole.tenants as any)?.name ?? null,
            customPermissions: userRole.custom_permissions as Record<string, Partial<Permission>> | undefined,
        };
    }

    // 2. Fallback: read from app_metadata (trusted backend metadata)
    const legacyRole = (user.app_metadata?.role) as Role | undefined;
    if (legacyRole) {
        return {
            userId: user.id,
            email: user.email,
            role: legacyRole,
            tenantId: null,
            tenantName: null,
        };
    }

    // Default: restricted access
    return {
        userId: user.id,
        email: user.email,
        role: 'viewer',
        tenantId: null,
        tenantName: null,
    };
});

/**
 * Get the full user context (role + tenant) — deduplicated per request.
 */
export async function getUserContext(): Promise<UserContext | null> {
    return getCachedUserContext();
}

/**
 * Get the current user's role — deduplicated per request via React.cache()
 */
export async function getUserRole(): Promise<Role | null> {
    const ctx = await getCachedUserContext();
    return ctx?.role ?? null;
}

/**
 * Get current user tenant ID. Returns null for super_admin / company_editor (global scope).
 */
export async function getUserTenantId(): Promise<string | null> {
    const ctx = await getCachedUserContext();
    return ctx?.tenantId ?? null;
}

/**
 * Helper to get the tenant scope for queries. 
 * If the user is a global admin, returns undefined (no scope limit).
 * If the user is a tenant admin/editor, returns their tenant_id. 
 */
export async function getTenantScope(): Promise<string | undefined> {
    const ctx = await getUserContext();
    if (!ctx) throw new Error("Unauthorized");
    if (GLOBAL_ADMIN_ROLES.includes(ctx.role as Role)) {
        return undefined; // Global scope
    }
    if (!ctx.tenantId) {
        throw new Error("UnauthorizedError: Không xác định được chi nhánh của bạn");
    }
    return ctx.tenantId;
}

/**
 * Enforces that a specific record belongs to the user's tenant before allowing update/delete.
 * Validates the UUID against the table. Throws Error if unauthorized or not found.
 */
export async function enforceTenantScopeForRecord(tableName: string, recordId: string) {
    const scope = await getTenantScope();
    if (!scope) return; // Global admins can edit anything

    const supabase = await createClient();
    const { data, error } = await (supabase as any).from(tableName).select('tenant_id').eq('id', recordId).maybeSingle();
    if (error || !data) {
        throw new Error("Không tìm thấy bản ghi");
    }
    if (data.tenant_id && data.tenant_id !== scope) {
        throw new Error("UnauthorizedError: Bạn không có quyền thao tác trên dữ liệu của chi nhánh khác");
    }
}

/**
 * Returns true if the user has global scope (sees all tenants).
 */
export async function isGlobalAdmin(): Promise<boolean> {
    const role = await getUserRole();
    return GLOBAL_ADMIN_ROLES.includes(role as Role);
}

/**
 * ─── TENANT ISOLATION GUARD ───────────────────────────────────────────────────
 * Verify that the current user is allowed to access a specific tenant.
 *
 * Usage in any /admin/t/[tenant_id]/* page:
 *   await requireTenantAccess(params.tenant_id);
 *
 * Rules:
 *   - GLOBAL_ADMIN_ROLES (super_admin, admin, company_editor) → always allowed
 *   - TENANT_ROLES (tenant_admin, editor, accountant...) → only if their tenantId matches
 *   - Others (volunteer, viewer) → notFound()
 *
 * Raises notFound() instead of redirect to avoid exposing whether a tenant exists.
 */
export async function requireTenantAccess(tenantIdFromUrl: string): Promise<void> {
    const ctx = await getUserContext();

    if (!ctx) {
        redirect('/login');
    }

    const { role, tenantId } = ctx;

    // Global admins can access any tenant
    if (GLOBAL_ADMIN_ROLES.includes(role as Role)) {
        return;
    }

    // Tenant-scoped users must match the tenant in the URL
    if (TENANT_ROLES.includes(role as Role)) {
        if (tenantId === tenantIdFromUrl) {
            return;
        }
        // Mismatch — return 404 to avoid leaking existence of other tenants
        notFound();
    }

    // All other roles (volunteer, viewer, null) → denied
    notFound();
}

/**
 * ─── SUPER ADMIN ONLY GUARD ────────────────────────────────────────────────────
 * Chỉ cho phép role 'super_admin'. Mọi role khác (kể cả company_editor, tenant_admin)
 * đều bị chặn bằng notFound() để không lộ thông tin.
 *
 * Dùng cho các tính năng cấp cao nhất của hệ thống:
 *   - Visual Page Builder (thay đổi cấu trúc toàn trang chủ)
 *   - Layout & Theme Management
 */
export async function requireSuperAdmin(): Promise<void> {
    const ctx = await getUserContext();

    if (!ctx) {
        redirect('/login');
    }

    if (ctx.role !== 'super_admin') {
        notFound();
    }
}


// Module-level cache for base role_permissions (resets on server restart)
const basePermissionsCache = new Map<string, Record<Resource, Permission>>();

/**
 * Check if current user has permission for an action on a resource.
 */
export async function checkPermission(resource: Resource, action: Action): Promise<boolean> {
    // Rely on the fully merged permissions matrix which includes custom overrides.
    // The matrix generation itself relies on getCachedUserContext which deduplicates DB calls.
    const matrix = await getUserPermissions();
    if (!matrix || !matrix[resource]) return false;

    return matrix[resource][`can_${action}` as keyof Permission] ?? false;
}

/**
 * Require permission — throws if not authorized. Use in Server Components to protect pages.
 */
export async function requirePermission(resource: Resource, action: Action): Promise<void> {
    const allowed = await checkPermission(resource, action);
    if (!allowed) {
        const role = await getUserRole();
        throw new Error(`Permission denied: ${role || 'no_role'} cannot ${action} ${resource}`);
    }
}

export async function getBasePermissionsByRole(role: Role): Promise<Record<Resource, Permission>> {
    const allTrue: Permission = { can_create: true, can_read: true, can_update: true, can_delete: true };
    const readOnly: Permission = { can_create: false, can_read: true, can_update: false, can_delete: false };
    const emptyPerm: Permission = { can_create: false, can_read: false, can_update: false, can_delete: false };

    let basePermissions: Record<Resource, Permission> = {} as any;

    if (role === 'super_admin' || role === 'company_editor' || role === 'tenant_admin' || role === 'admin' || role === 'agency_admin' || role === 'tenant_accountant') {
        basePermissions = {
            users: role === 'tenant_accountant' ? readOnly : allTrue,
            news: role === 'tenant_accountant' ? readOnly : allTrue,
            events: role === 'tenant_accountant' ? readOnly : allTrue,
            media: role === 'tenant_accountant' ? readOnly : allTrue,
            transactions: allTrue,
            registrations: allTrue,
            settings: role === 'tenant_accountant' ? readOnly : allTrue,
            analytics: allTrue,
            tenants: role === 'tenant_accountant' ? readOnly : allTrue,
            categories: allTrue,
            'dharma-talks': allTrue,
            'mobile_app': (role === 'agency_admin' || role === 'tenant_accountant') ? emptyPerm : allTrue,
            finance: allTrue,
        };
    } else {
        if (basePermissionsCache.has(role)) {
            basePermissions = basePermissionsCache.get(role)!;
        } else {
            const supabase = await createClient();
            const { data } = await supabase.from('role_permissions').select('*').eq('role', role);
            basePermissions = Object.fromEntries((data || []).map((p: any) => [p.resource, p])) as Record<Resource, Permission>;
            if (Object.keys(basePermissions).length > 0) {
                basePermissionsCache.set(role, basePermissions);
            }
        }
    }

    let permissions = { ...basePermissions };

    // Fallback logic if DB is empty to prevent locking out valid users
    if (Object.keys(permissions).length === 0) {
        if (role === 'tenant_accountant') {
            permissions = {
                transactions: readOnly,
                registrations: allTrue,
            } as Record<Resource, Permission>;
        } else if (role === 'tenant_editor' || role === 'editor') {
            permissions = {
                news: allTrue,
                events: allTrue,
                media: allTrue,
                categories: allTrue,
                analytics: readOnly,
            } as Record<Resource, Permission>;
        } else if (role === 'moderator' || role === 'tenant_admin') {
            permissions = {
                transactions: readOnly,
                registrations: allTrue,
                news: role === 'tenant_admin' ? allTrue : readOnly,
                events: role === 'tenant_admin' ? allTrue : readOnly,
            } as Record<Resource, Permission>;
        }
    }

    // Ensure all resources exist in the object to avoid undefined errors
    const defaultResources: Resource[] = ['users', 'news', 'events', 'media', 'transactions', 'registrations', 'settings', 'analytics', 'tenants', 'categories', 'dharma-talks', 'mobile_app'];
    for (const res of defaultResources) {
        if (!permissions[res]) permissions[res] = { ...emptyPerm };
    }

    return permissions;
}

export async function getUserPermissions(): Promise<Record<Resource, Permission>> {
    const ctx = await getUserContext();
    if (!ctx || !ctx.role) return {} as any;

    let permissions = await getBasePermissionsByRole(ctx.role);

    // Apply custom overrides
    if (ctx.customPermissions) {
        for (const [res, overrides] of Object.entries(ctx.customPermissions)) {
            const resource = res as Resource;
            if (permissions[resource]) {
                permissions[resource] = { ...permissions[resource], ...overrides };
            }
        }
    }

    return permissions;
}

/**
 * Get user's role display name
 */
export function getRoleDisplayName(role: Role): string {
    const names: Partial<Record<Role, string>> = {
        super_admin: '⚡ System Admin (Ban Giám đốc)',
        company_editor: '📢 Trưởng phòng Truyền thông',
        tenant_admin: '🏛️ Giám đốc Chi nhánh',
        tenant_editor: '✍️ Trưởng phòng Nội dung',
        tenant_accountant: '💰 Giám đốc Tài chính (CFO)',
        admin: '🔧 IT Admin',
        moderator: '👁️ Quản lý Cấp trung',
        editor: '✏️ Chuyên viên Nội dung',
        volunteer: '🤝 Thực tập sinh / CTV',
        viewer: '👤 Nhân viên (Staff)',
        agency_admin: '🏢 Đối tác Công nghệ',
    };
    return names[role] ?? role;
}

/**
 * Get role badge color for UI
 */
export function getRoleBadgeColor(role: Role): string {
    const colors: Partial<Record<Role, string>> = {
        super_admin: 'bg-purple-100 text-purple-800',
        company_editor: 'bg-indigo-100 text-indigo-800',
        tenant_admin: 'bg-blue-100 text-blue-800',
        tenant_editor: 'bg-green-100 text-green-800',
        tenant_accountant: 'bg-teal-100 text-teal-800',
        admin: 'bg-blue-100 text-blue-800',
        moderator: 'bg-orange-100 text-orange-800',
        editor: 'bg-green-100 text-green-800',
        volunteer: 'bg-teal-100 text-teal-800',
        viewer: 'bg-gray-100 text-gray-800',
    };
    return colors[role] ?? 'bg-gray-100 text-gray-800';
}
