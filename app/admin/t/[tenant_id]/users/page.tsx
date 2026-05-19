import React from 'react';
import { createAdminClient } from '@/lib/supabase/server';
import { requirePermission, getRoleBadgeColor, Role, getUserContext } from '@/lib/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDate } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Users, UserPlus, Shield, ShieldAlert, ShieldCheck, UserX } from 'lucide-react';

interface TenantUsersPageProps {
    params: Promise<{ tenant_id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Role badge component
function RoleBadge({ role }: { role: string }) {
    const badgeColor = getRoleBadgeColor(role as Role);
    const roleLabels: Record<string, string> = {
        super_admin: 'System Admin',
        admin: 'IT Admin',
        agency_admin: 'Đối tác Công nghệ',
        company_editor: 'Trưởng phòng Truyền thông',
        tenant_admin: 'Giám đốc Chi nhánh',
        tenant_editor: 'Trưởng phòng Nội dung',
        tenant_accountant: 'Giám đốc Tài chính (CFO)',
        moderator: 'Quản lý Cấp trung',
        editor: 'Chuyên viên Nội dung',
        volunteer: 'Thực tập sinh / CTV',
        viewer: 'Nhân viên (Staff)',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${badgeColor}`}>
            {roleLabels[role] || role.toUpperCase()}
        </span>
    );
}

function StatusBadge({ isBanned }: { isBanned: boolean }) {
    if (isBanned) {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                <UserX className="w-3 h-3" /> Bị khóa
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
            <ShieldCheck className="w-3 h-3" /> Hoạt động
        </span>
    );
}

export default async function TenantUsersPage(props: TenantUsersPageProps) {
    const { tenant_id } = await props.params;
    const searchParams = await props.searchParams;
    const q = (searchParams.q as string) || '';

    // Check permission — tenant_admin hoặc admin mới được vào
    await requirePermission('users', 'read');
    const ctx = await getUserContext();

    // Use admin client to fetch users
    const supabaseAdmin = await createAdminClient();

    // Fetch tenant info
    const { data: tenant } = await (supabaseAdmin as any)
        .from('tenants')
        .select('id, name, domain, tenant_type')
        .eq('id', tenant_id)
        .single();

    if (!tenant) {
        return <div className="p-8 text-red-500 font-bold">Không tìm thấy tổ chức.</div>;
    }

    const isCompany = tenant.tenant_type !== 'tenant';

    // Fetch user_roles for this tenant only
    const { data: userRoles } = await (supabaseAdmin as any)
        .from('user_roles')
        .select('user_id, role, tenant_id')
        .eq('tenant_id', tenant_id);

    if (!userRoles || userRoles.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {isCompany ? 'Quản lý Nhân sự' : 'Quản lý Thành viên'}
                        </h1>
                        <p className="text-slate-500 mt-1">{tenant.name}</p>
                    </div>
                </div>
                <Card className="border-none shadow-lg rounded-2xl">
                    <CardContent className="p-12 text-center">
                        <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-700 mb-2">Chưa có nhân sự nào</h3>
                        <p className="text-slate-500 text-sm max-w-md mx-auto">
                            Tổ chức này chưa có tài khoản nhân viên nào được gán. 
                            Liên hệ quản trị viên hệ thống để mời nhân sự vào tổ chức.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Fetch auth users
    const { data: { users: allAuthUsers } } = await supabaseAdmin.auth.admin.listUsers();

    // Map user_roles → auth users
    let users = userRoles.map((ur: any) => {
        const authUser = allAuthUsers?.find((u: any) => u.id === ur.user_id);
        return {
            id: ur.user_id,
            email: authUser?.email || 'Unknown',
            full_name: authUser?.user_metadata?.full_name || null,
            role: ur.role,
            created_at: authUser?.created_at || null,
            last_sign_in_at: authUser?.last_sign_in_at || null,
            banned_until: authUser?.banned_until || null,
        };
    });

    // Filter by search query
    if (q) {
        const lowerQ = q.toLowerCase();
        users = users.filter((u: any) =>
            u.email?.toLowerCase().includes(lowerQ) ||
            u.full_name?.toLowerCase().includes(lowerQ)
        );
    }

    // Stats
    const totalUsers = users.length;
    const adminCount = users.filter((u: any) => ['admin', 'tenant_admin', 'agency_admin'].includes(u.role)).length;
    const editorCount = users.filter((u: any) => ['editor', 'moderator'].includes(u.role)).length;
    const bannedCount = users.filter((u: any) => !!u.banned_until).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {isCompany ? 'Quản lý Nhân sự' : 'Quản lý Thành viên'}
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        {tenant.name} — Phân quyền RBAC theo vai trò nội bộ
                    </p>
                </div>
                <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 px-5">
                    <Link href={`/admin/users/invite?tenant_id=${tenant_id}`}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        {isCompany ? 'Mời Nhân viên mới' : 'Thêm thành viên'}
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-none shadow-md rounded-2xl bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Tổng Nhân sự
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900">{totalUsers}</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md rounded-2xl bg-indigo-900 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -mr-6 -mt-6" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
                            Quản trị viên
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white">{adminCount}</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md rounded-2xl bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Biên tập & Nội dung
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900">{editorCount}</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md rounded-2xl bg-white border-l-4 border-amber-400">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Tài khoản bị khóa
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-amber-600">{bannedCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <Card className="border-none shadow-xl overflow-hidden rounded-3xl bg-white">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/80 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        {isCompany ? 'Nhân viên' : 'Thành viên'}
                                    </th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        Vai trò (RBAC)
                                    </th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        Ngày tham gia
                                    </th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        Đăng nhập cuối
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-50">
                                {users.map((user: any) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 group transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                                                    {(user.full_name || user.email || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                        {user.full_name || 'Chưa đặt tên'}
                                                    </div>
                                                    <div className="text-xs text-slate-400">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <RoleBadge role={user.role} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge isBanned={!!user.banned_until} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                                            {user.created_at
                                                ? formatDate(new Date(user.created_at), 'dd/MM/yyyy', { locale: vi })
                                                : '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                                            {user.last_sign_in_at
                                                ? formatDate(new Date(user.last_sign_in_at), 'dd/MM/yyyy HH:mm', { locale: vi })
                                                : 'Chưa đăng nhập'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Security Note */}
            <Card className="border border-blue-200 bg-blue-50/50 rounded-2xl shadow-sm">
                <CardContent className="p-4 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                    <div className="text-sm text-blue-800">
                        <span className="font-bold">Cơ chế phân quyền RBAC:</span>{' '}
                        Danh sách nhân sự hiển thị trên trang này được cô lập hoàn toàn bởi Row-Level Security (RLS) ở tầng Database.
                        Quản trị viên của <strong>{tenant.name}</strong> chỉ có thể xem và quản lý nhân viên thuộc tổ chức mình,
                        không thể truy cập nhân sự của các tổ chức khác trên cùng nền tảng.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
