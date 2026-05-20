import React from 'react';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { requirePermission, getRoleBadgeColor, Role, getUserContext } from '@/lib/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDate } from 'date-fns';
import { vi } from 'date-fns/locale';
import { UserPlus } from 'lucide-react';
// @ts-ignore
import { SearchInput, FilterSelect } from '@/components/admin/data-filters';

interface UsersPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Role badge component
function RoleBadge({ role }: { role: string }) {
    const badgeColor = getRoleBadgeColor(role as Role);
    const displayRole = role.replace('_', ' ').toUpperCase();

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeColor}`}>
            {displayRole}
        </span>
    );
}

// Status badge component
function StatusBadge({ isBanned }: { isBanned: boolean }) {
    if (isBanned) {
        return (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                BANNED
            </span>
        );
    }
    return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            ACTIVE
        </span>
    );
}

export default async function UsersPage(props: UsersPageProps) {
    const searchParams = await props.searchParams;
    const q = (searchParams.q as string) || '';
    const role = (searchParams.role as string) || '';
    const status = (searchParams.status as string) || '';

    // Check permission
    await requirePermission('users', 'read');

    // Use admin client
    const supabaseAdmin = await createAdminClient();

    // Fetch users - Supabase Auth API doesn't support rich server-side filtering like Postgres tables
    // So we fetch and filter in memory (acceptable for admin user lists typically < 1000)
    const { data: { users: allUsers }, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
        console.error('Error fetching users:', error);
        return <div>Error loading users</div>;
    }

    // Fetch user_roles
    const { data: userRoles } = await (supabaseAdmin as any)
        .from('user_roles')
        .select('user_id, role, tenant_id');

    // Fetch all tenants to resolve names
    const { data: tenantsData } = await (supabaseAdmin as any)
        .from('tenants')
        .select('id, name');

    // Map and combine
    let users = (allUsers || []).map(u => {
        const ur = userRoles?.find((r: any) => r.user_id === u.id);
        const activeRole = ur?.role ?? (u.app_metadata?.role ?? u.user_metadata?.role ?? 'viewer');
        const tenantName = ur?.tenant_id ? (tenantsData?.find((t: any) => t.id === ur.tenant_id)?.name ?? null) : null;
        return {
            ...u,
            activeRole,
            tenantName,
            tenant_id: ur?.tenant_id || null
        };
    });

    // Filter out super_admin to keep it hidden
    users = users.filter(u => u.activeRole !== 'super_admin');

    // Filter by tenant scope for tenant_admin
    const ctx = await getUserContext();
    if (ctx?.role === 'tenant_admin') {
        users = users.filter(u => u.tenant_id === ctx.tenantId);
    }

    if (q) {
        const lowerQ = q.toLowerCase();
        users = users.filter(u =>
            u.email?.toLowerCase().includes(lowerQ) ||
            u.user_metadata?.full_name?.toLowerCase().includes(lowerQ)
        );
    }

    if (role) {
        users = users.filter(u => u.activeRole === role);
    }

    if (status) {
        if (status === 'banned') {
            users = users.filter(u => !!u.banned_until);
        } else if (status === 'active') {
            users = users.filter(u => !u.banned_until);
        }
    }

    return (
        <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl -mr-64 -mt-64 mix-blend-screen pointer-events-none" />
                <div className="relative z-10 p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30 text-amber-400">
                            <UserPlus className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent tracking-tight">Quản trị Danh tính</h1>
                            <p className="text-slate-400 mt-1.5 text-sm">
                                Quản lý phân quyền RBAC và kiểm soát truy cập hệ thống đa khách hàng. Tổng: <strong className="text-amber-400 font-black">{users?.length || 0}</strong> nhân sự.
                            </p>
                        </div>
                    </div>
                    <Button asChild className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-xl shadow-lg shadow-amber-500/25 px-6 transition-all duration-200">
                        <Link href="/admin/users/invite">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Thêm nhân sự mới
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 shadow-lg overflow-hidden rounded-2xl">
                <CardContent className="p-5 flex flex-col md:flex-row gap-4 items-center flex-wrap">
                    <div className="flex-1 min-w-[250px]">
                        <SearchInput placeholder="Tìm theo định danh (email, họ tên)..." />
                    </div>

                    <div className="flex items-center gap-4">
                        <FilterSelect
                            label="Cấp bậc"
                            paramName="role"
                            options={[
                                { label: 'Quản trị Workspace (Agency)', value: 'agency_admin' },
                                { label: 'Quản trị viên (Admin)', value: 'admin' },
                                { label: 'Người kiểm duyệt (Moderator)', value: 'moderator' },
                                { label: 'Biên tập viên (Editor)', value: 'editor' },
                                { label: 'Cộng tác viên (Partner)', value: 'volunteer' },
                                { label: 'Người xem (Viewer)', value: 'viewer' },
                            ]}
                        />

                        <FilterSelect
                            label="Trạng thái"
                            paramName="status"
                            options={[
                                { label: 'Đang hoạt động', value: 'active' },
                                { label: 'Bị tạm khóa', value: 'banned' },
                            ]}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 shadow-xl overflow-hidden group transition-all duration-300 hover:border-amber-500/30 rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            Tổng số Nhân sự
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">{users?.length || 0}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 dark:bg-slate-950/80 border border-slate-800 shadow-xl relative overflow-hidden rounded-2xl group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                            Quản trị viên (Admin)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                            {users?.filter(u => u.activeRole === 'admin' || u.activeRole === 'tenant_admin' || u.activeRole === 'agency_admin').length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 shadow-xl overflow-hidden group transition-all duration-300 hover:border-amber-500/30 rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            Biên tập & Nội dung
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">
                            {users?.filter(u => u.activeRole === 'editor' || u.activeRole === 'moderator').length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl border border-rose-200 dark:border-rose-950/40 shadow-xl overflow-hidden group transition-all duration-300 hover:border-rose-500/40 rounded-2xl relative">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 blur-xl pointer-events-none"></div>
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-[10px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest">
                            Tài khoản Bị khóa
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-black text-rose-600 dark:text-rose-400">
                            {users?.filter(u => !!u.banned_until).length || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <Card className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden rounded-[2rem]">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/80 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-8 py-5 text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Định danh (Email)
                                    </th>
                                    <th className="px-8 py-5 text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Vai trò (RBAC)
                                    </th>
                                    <th className="px-8 py-5 text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Phạm vi Workspace
                                    </th>
                                    <th className="px-8 py-5 text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-8 py-5 text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Ngày tham gia
                                    </th>
                                    <th className="px-8 py-5 text-right text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {users && users.length > 0 ? (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 group transition-colors">
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <RoleBadge role={user.activeRole} />
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium italic">
                                                    {user.tenantName || <span className="text-slate-400 dark:text-slate-600 font-normal">Global System</span>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <StatusBadge isBanned={!!user.banned_until} />
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-mono">
                                                {formatDate(new Date(user.created_at), 'dd/MM/yyyy', { locale: vi })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/admin/users/${user.id}`}
                                                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 hover:bg-amber-500/10 transition-all duration-200"
                                                >
                                                    Xem chi tiết
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 italic">
                                            Không tìm thấy người dùng nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
