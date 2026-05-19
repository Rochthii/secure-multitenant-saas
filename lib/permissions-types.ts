// Client-safe type definitions only
// NO server imports allowed in this file
// Synced with lib/permissions.ts Role union

export type Role =
    | 'super_admin'
    | 'company_editor'
    | 'tenant_admin'
    | 'tenant_editor'
    | 'tenant_accountant'
    | 'agency_admin'
    // Legacy roles (kept for backward compat)
    | 'admin'
    | 'moderator'
    | 'editor'
    | 'volunteer'
    | 'viewer';

export type Resource = 'users' | 'news' | 'events' | 'media' | 'transactions' | 'registrations' | 'settings' | 'analytics' | 'tenants' | 'categories' | 'dharma-talks' | 'mobile_app';
export type Action = 'create' | 'read' | 'update' | 'delete';

/**
 * Display names for roles
 */
export function getRoleDisplayName(role: Role): string {
    const names: Partial<Record<Role, string>> = {
        super_admin: '⚡ Super Admin',
        company_editor: '📢 Biên Tập Mạng Lưới',
        tenant_admin: '🏛️ Admin Chi nhánh',
        tenant_editor: '✍️ Biên Tập Chi nhánh',
        tenant_accountant: '💰 Kế Toán Chi nhánh',
        agency_admin: '🏢 Đại lý Quản trị (Web)',
        admin: 'Admin',
        moderator: 'Moderator',
        editor: 'Editor',
        volunteer: 'Cộng Tác Viên',
        viewer: 'Viewer',
    };
    return names[role] ?? role;
}

/**
 * Badge color classes for roles
 */
export function getRoleBadgeColor(role: Role): string {
    const colors: Partial<Record<Role, string>> = {
        super_admin: 'bg-purple-100 text-purple-800',
        company_editor: 'bg-indigo-100 text-indigo-800',
        tenant_admin: 'bg-blue-100 text-blue-800',
        tenant_editor: 'bg-green-100 text-green-800',
        tenant_accountant: 'bg-teal-100 text-teal-800',
        agency_admin: 'bg-blue-100 text-blue-800 border-blue-200 border',
        admin: 'bg-red-100 text-red-800',
        moderator: 'bg-orange-100 text-orange-800',
        editor: 'bg-blue-100 text-blue-800',
        volunteer: 'bg-teal-100 text-teal-800',
        viewer: 'bg-gray-100 text-gray-800',
    };
    return colors[role] ?? 'bg-gray-100 text-gray-800';
}
