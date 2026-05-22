'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    LayoutDashboard,
    Newspaper,
    Calendar,
    Image as ImageIcon,
    DollarSign,
    UserCheck,
    Users,
    BarChart3,
    FileText,
    Layout,
    Mail,
    GraduationCap,
    BookOpen,
    FolderTree,
    Building2,
    Settings,
    HelpCircle,
    Info,
    LogOut,
    ChevronDown,
    ExternalLink,
    ArrowLeft,
    Shield,
    ShieldAlert,
    Globe,
    Sparkles,
    Heart,
    Handshake,
    Palette,
    TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
// Removed duplicate Handshake import

// ROLE_LEVEL removed for Capability-Based Access Control

// ─── Định nghĩa menu theo nhóm ─────────────────────────────────────────────────

type ChildItem = {
    href: string;
    label: string;
    icon: React.ElementType;
    resource?: string; // Resource required to view. If missing, assumes public/dashboard
};

type MenuGroup = {
    id: string;
    label: string;
    icon: React.ElementType;
    resource?: string; // If set, user must have access to THIS resource to see the group
    children: ChildItem[];
};

type StandaloneItem = {
    id: string;
    href: string;
    label: string;
    icon: React.ElementType;
    resource?: string;
    standalone: true;
};

type MenuItem = MenuGroup | StandaloneItem;

// Legacy menu items removed

// ─── Props ─────────────────────────────────────────────────────────────────────

interface BusinessSidebarProps {
    role?: string;
    tenantName?: string | null;
    themeColor?: string | null;
    email?: string;
    canSwitchTenant?: boolean; // true for super_admin / company_editor
    permissions?: Record<string, any>;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function BusinessSidebar({
    role = 'editor',
    tenantName: propTenantName,
    themeColor: propThemeColor,
    email,
    canSwitchTenant = false,
    permissions = {},
}: BusinessSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const params = useParams();
    const tenantId = (params?.tenant_id as string) ?? '';

    // Check capability explicitly checking `can_read` property
    const hasAccess = (resource?: string) => {
        if (!resource) return true; // Undefined resource means always visible (like Dashboard)
        
        // Super admins have all access
        if (role === 'super_admin' || role === 'admin') return true;
        
        // agency_admin - restricted global role
        if (role === 'agency_admin') {
             // Block specific resources for agency_admin even if they are technically 'global'
             if (resource === 'mobile_app') return false;
             return !!permissions[resource]?.can_read;
        }

        // tenant_admin/editor - scoped access
        if (role === 'tenant_admin') return true;
        
        return !!permissions[resource]?.can_read;
    };

    // ─── Fetch tenant data từ DB dựa theo URL tenant_id ─────────────────────────
    const [resolvedName, setResolvedName] = React.useState<string | null>(propTenantName ?? null);
    const [resolvedColor, setResolvedColor] = React.useState<string | null>(propThemeColor ?? null);
    const [resolvedDomain, setResolvedDomain] = React.useState<string | null>(null);
    const [resolvedTenantType, setResolvedTenantType] = React.useState<string>('tenant');
    const [modulesConfig, setModulesConfig] = React.useState<Record<string, boolean>>({});

    React.useEffect(() => {
        if (!tenantId) return;

        setResolvedName(propTenantName ?? null);
        setResolvedColor(propThemeColor ?? null);

        const fetchTenantData = async () => {
            const supabase = createClient();
            const { data } = await (supabase as any)
                .from('tenants')
                .select('name, theme_colors, domain, modules_config, tenant_type')
                .eq('id', tenantId)
                .single();
            if (data) {
                setResolvedName(data.name ?? null);
                setResolvedColor(data.theme_colors?.primary ?? null);
                setResolvedDomain(data.domain ?? null);
                setModulesConfig(data.modules_config ?? {});
                if (data.tenant_type) setResolvedTenantType(data.tenant_type);

                // Lưu tenant vừa xem vào localStorage để GlobalSidebar có thể đọc lại
                try {
                    localStorage.setItem('lastViewedTenantId', tenantId);
                    localStorage.setItem('lastViewedTenantName', data.name ?? '');
                    localStorage.setItem('lastViewedTenantDomain', data.domain ?? '');
                } catch { /* ignore */ }
            }
        };

        fetchTenantData();
    }, [tenantId, propTenantName, propThemeColor]);

    const accentColor = resolvedColor ?? '#8B5CF6';
    const displayName = resolvedName ?? 'Quản lý Tổ chức';
    const isCompany = true; // Ép toàn bộ hệ thống sử dụng menu Doanh nghiệp B2B SaaS

    // Helper: kiểm tra module có bật không
    // Nếu modules_config chưa load (empty obj) thì mặc định là true (tránh flash ẩn)
    // Nếu module không được khai báo trong config → mặc định bật
    // Chỉ ẩn khi explicitly set false
    const hasModule = (moduleKey: string): boolean => {
        if (Object.keys(modulesConfig).length === 0) return true; // Chưa load xong
        return modulesConfig[moduleKey] !== false;
    };

    const buildMenuItemsAdapted = (tenantId: string): MenuItem[] => {
        const base = `/admin/t/${tenantId}`;
        const items: MenuItem[] = [
            // ── Tổng quan ────────────────────────────────────────────────────────
            {
                id: 'dashboard',
                href: `${base}/dashboard`,
                label: 'Tổng quan',
                icon: LayoutDashboard,
                standalone: true,
            },
            // ── Quản lý Nội dung ─────────────────────────────────────────────────
            {
                id: 'content',
                label: 'Trung tâm Nội dung',
                icon: Newspaper,
                resource: 'news',
                children: [
                    { href: `${base}/categories`, label: 'Danh mục Phân loại', icon: FolderTree, resource: 'news' },
                    { href: `${base}/news`, label: 'Tin tức & Truyền thông', icon: Newspaper, resource: 'news' },
                    { href: `${base}/events`, label: 'Sự kiện & Lịch biểu', icon: Calendar, resource: 'events' },
                    // E-Learning: Sử dụng icon chuyên dụng cho doanh nghiệp
                    ...(hasModule('documents') ? [{ 
                        href: `${base}/documents`, 
                        label: 'Tài liệu & SOP nội bộ', 
                        icon: GraduationCap, 
                        resource: 'media' 
                    }] : []),
                    { href: `${base}/media`, label: 'Kho lưu trữ (Media)', icon: ImageIcon, resource: 'media' },
                ],
            },
            // ── Trang tĩnh & Giới thiệu chi nhánh ────────────
            {
                id: 'appearance',
                label: 'Trang tĩnh & Giới thiệu chi nhánh',
                icon: Building2,
                resource: 'news',
                children: [
                    { href: `${base}/pages`, label: 'Trang tự do (Pages)', icon: FileText, resource: 'news' },
                    { href: `${base}/about`, label: 'Nội dung trang Giới Thiệu (About)', icon: Info, resource: 'news' },
                    { href: `${base}/faq`, label: 'Hỏi đáp (FAQ)', icon: HelpCircle, resource: 'news' },
                    { href: `${base}/settings/domain`, label: 'Tên miền (Domain)', icon: Globe, resource: 'settings' },
                    { href: `${base}/settings`, label: 'Cài đặt chi nhánh (Settings)', icon: Settings, resource: 'settings' },
                ],
            },
            // ── Thiết kế Giao diện ────────────
            {
                id: 'page-builder',
                label: 'Thiết kế Giao diện',
                icon: Layout,
                resource: 'settings',
                children: [
                    { href: `${base}/homepage`, label: 'Tùy biến Trang chủ', icon: Sparkles, resource: 'settings' },
                    { href: `${base}/homepage/slides`, label: 'Banner quảng bá', icon: ImageIcon, resource: 'settings' },
                    ...(role === 'super_admin' ? [{ href: `${base}/theme`, label: 'Bộ nhận diện (Theme)', icon: Palette, resource: 'settings' }] : []),
                ],
            },
            // ── SAAS SYSTEM: Dữ liệu Tác động ────────────────────────
            {
                id: 'mcaaron-impact',
                label: 'Báo cáo & Tác động',
                icon: TrendingUp,
                resource: 'analytics',
                children: [
                    { href: `${base}/homepage?open=founder_section`, label: 'Cấu trúc Nhân sự', icon: Users, resource: 'analytics' },
                    { href: `${base}/homepage?open=transparency_timeline`, label: 'Lộ trình phát triển', icon: Calendar, resource: 'analytics' },
                    { href: `${base}/homepage?open=impact_dashboard`, label: 'Chỉ số KPI & Tác động', icon: BarChart3, resource: 'analytics' },
                ],
            },
            // ── Tương tác (Đối tác & Tương tác) ──
            {
                id: 'interaction',
                label: 'Đối tác & Tương tác',
                icon: Handshake,
                children: [
                    { href: `${base}/projects`, label: 'Dự án & Phân bổ', icon: FolderTree, resource: 'settings' },
                    { href: `${base}/organizations`, label: 'Danh sách Đối tác', icon: Building2, resource: 'tenants' },
                    ...(hasModule('registrations') ? [{ href: `${base}/events/calendar`, label: 'Lịch hẹn / Đăng ký', icon: UserCheck, resource: 'registrations' }] : []),
                    { href: `${base}/messages`, label: 'Trung tâm Phản hồi', icon: Mail, resource: 'registrations' },
                ],
            },
            // ── Quản lý Nhân sự & Phân quyền (Delegated Administration) ──
            {
                id: 'hr-management',
                label: 'Nhân sự & Phân quyền',
                icon: Shield,
                resource: 'users',
                children: [
                    { href: `${base}/users`, label: 'Danh sách Nhân viên', icon: Users, resource: 'users' },
                    { href: `${base}/audit-logs`, label: 'Nhật ký hoạt động', icon: FileText, resource: 'analytics' },
                    { href: `${base}/security`, label: 'Trung tâm Bảo mật', icon: ShieldAlert, resource: 'users' },
                ],
            },
        ];
        return items;
    };

    const menuItems = buildMenuItemsAdapted(tenantId);

    const defaultOpenGroups = () => {
        const map: Record<string, boolean> = {};
        for (const item of menuItems) {
            if (!('standalone' in item)) {
                const group = item as MenuGroup;
                const hasActive = group.children.some(child =>
                    pathname === child.href || pathname.startsWith(child.href + '/')
                );
                if (hasActive) map[group.id] = true;
            }
        }
        return map;
    };

    const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(defaultOpenGroups);

    const toggleGroup = (id: string) => {
        setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <aside className="w-64 bg-[#0B0F19] text-white min-h-screen flex flex-col shadow-xl z-50 border-r border-white/5">
            <div
                className="p-5 border-b"
                style={{ borderColor: `${accentColor}30`, background: `${accentColor}10` }}
            >
                <div className="flex items-center gap-3 mb-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0"
                        style={{ backgroundColor: accentColor }}
                    >
                        {(displayName).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-sm font-bold text-white truncate">
                            {displayName}
                        </h1>
                        {resolvedDomain ? (
                            <a
                                href={`https://${resolvedDomain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs truncate flex items-center gap-1 hover:underline"
                                style={{ color: `${accentColor}bb` }}
                                title={`Mở trang web: ${resolvedDomain}`}
                            >
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                <span className="truncate">{resolvedDomain}</span>
                            </a>
                        ) : (
                            <p className="text-xs truncate" style={{ color: `${accentColor}aa` }}>
                                ID: {tenantId.slice(0, 8)}...
                            </p>
                        )}
                    </div>
                </div>

                {canSwitchTenant && (
                    <div className="flex flex-col gap-2">
                        <Link
                            href="/admin/dashboard"
                            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition-all"
                            style={{
                                backgroundColor: `rgba(255,255,255,0.1)`,
                                color: `#fff`,
                                border: `1px solid rgba(255,255,255,0.2)`,
                            }}
                        >
                            <Shield className="w-3 h-3 text-purple-400" />
                            <span>Quản trị Hệ thống</span>
                        </Link>
                        <Link
                            href="/admin/select-tenant"
                            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition-all"
                            style={{
                                backgroundColor: `${accentColor}20`,
                                color: `${accentColor}`,
                                border: `1px solid ${accentColor}40`,
                            }}
                        >
                            <ArrowLeft className="w-3 h-3" />
                            <span>{isCompany ? 'Đổi Tổ chức' : 'Đổi Chi nhánh Quản Trị'}</span>
                        </Link>
                    </div>
                )}
            </div>

            <nav className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-1">
                {menuItems.map((item) => {
                    if ('standalone' in item) {
                        const Icon = item.icon;
                        if (!hasAccess(item.resource)) return null;
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium',
                                    isActive
                                        ? 'text-[#1C1008] shadow-md font-bold'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                )}
                                style={isActive ? { backgroundColor: accentColor } : {}}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    }

                    const group = item as MenuGroup;
                    const GroupIcon = group.icon;
                    // Check if group resource is granted
                    if (group.resource && !hasAccess(group.resource)) return null;

                    const isOpen = openGroups[group.id] ?? false;
                    const visibleChildren = group.children.filter(child => hasAccess(child.resource));

                    if (visibleChildren.length === 0) return null;

                    const isGroupActive = visibleChildren.some(child =>
                        pathname === child.href || pathname.startsWith(child.href + '/')
                    );

                    return (
                        <div key={group.id}>
                            <button
                                onClick={() => toggleGroup(group.id)}
                                className={cn(
                                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-sm',
                                    isGroupActive && !isOpen
                                        ? 'text-white font-semibold'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                )}
                                style={isGroupActive && !isOpen ? { backgroundColor: `${accentColor}25`, borderLeft: `2px solid ${accentColor}` } : {}}
                            >
                                <div className="flex items-center gap-2">
                                    <GroupIcon className="w-4 h-4 shrink-0" />
                                    <span>{group.label}</span>
                                </div>
                                <ChevronDown
                                    className={cn('w-4 h-4 text-gray-500 transition-transform duration-200', isOpen && 'rotate-180')}
                                />
                            </button>

                            {isOpen && (
                                <ul className="mt-0.5 ml-4 pl-3 border-l border-white/10 space-y-0.5 py-1">
                                    {visibleChildren.map(child => {
                                        const ChildIcon = child.icon;
                                        const isChildActive = pathname === child.href || pathname.startsWith(child.href + '/');
                                        return (
                                            <li key={child.href}>
                                                <Link
                                                    href={child.href}
                                                    className={cn(
                                                        'flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-sm',
                                                        isChildActive
                                                            ? 'text-white font-semibold'
                                                            : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                                                    )}
                                                    style={isChildActive ? { backgroundColor: `${accentColor}30`, color: accentColor } : {}}
                                                >
                                                    <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="truncate">{child.label}</span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    );
                })}

                <div className="pt-4 mt-2 border-t border-white/10">
                    <a
                        href={resolvedDomain ? `https://${resolvedDomain}` : `/?tenant_id=${tenantId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all text-sm"
                    >
                        <ExternalLink className="h-4 w-4" />
                        <span>{isCompany ? 'Xem trang công ty' : 'Xem trang chi nhánh'}</span>
                    </a>
                </div>
            </nav>

            <div className="p-3 border-t border-white/10 bg-black/20">
                {email && (
                    <p className="text-xs text-gray-600 truncate mb-2 px-2">{email}</p>
                )}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-900/20 hover:text-red-400 transition-all w-full text-sm"
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
}
