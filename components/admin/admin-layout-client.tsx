'use client';

import React, { useState, useEffect } from 'react';
import { GlobalSidebar } from '@/components/admin/global-sidebar';
import { BusinessSidebar } from '@/components/admin/business-sidebar';

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface AdminLayoutClientProps {
    role: string;
    tenantId: string | null;
    tenantName: string | null;
    tenantType?: string;
    themeColor?: string | null;
    email?: string;
    canSwitchTenant?: boolean;
    permissions?: any;
    children: React.ReactNode;
}

export function AdminLayoutClient({
    role,
    tenantId,
    tenantName,
    tenantType = 'tenant',
    themeColor,
    email,
    canSwitchTenant,
    permissions,
    children
}: AdminLayoutClientProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const params = useParams();

    // tenant_id trong URL — nếu có thì đang ở Tenant Context
    const urlTenantId = params?.tenant_id as string | undefined;
    const isTenantContext = !!urlTenantId;

    // Khi super_admin xem chi nhánh khác: urlTenantId !== tenantId
    // → BusinessSidebar cần fetch tên từ DB theo urlTenantId, không dùng prop từ user context
    const isViewingOwnTenant = !urlTenantId || urlTenantId === tenantId;
    const sidebarTenantName = isViewingOwnTenant ? tenantName : null; // null → trigger fetch in sidebar
    const sidebarThemeColor = isViewingOwnTenant ? themeColor : null;

    // Nhớ trạng thái qua sessions
    useEffect(() => {
        const saved = localStorage.getItem('admin-sidebar-collapsed');
        if (saved === 'true') setSidebarCollapsed(true);
    }, []);

    const toggleSidebar = () => {
        setSidebarCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('admin-sidebar-collapsed', String(next));
            return next;
        });
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar — ẩn hoàn toàn khi collapsed */}
            <div
                className={`
                    transition-all duration-300 ease-in-out shrink-0 overflow-hidden
                    ${sidebarCollapsed ? 'w-0 opacity-0' : 'w-64 opacity-100'}
                `}
            >
                {isTenantContext ? (
                    tenantType !== 'tenant' ? (
                        <BusinessSidebar
                            role={role}
                            tenantName={sidebarTenantName}
                            email={email}
                            canSwitchTenant={canSwitchTenant ?? false}
                            permissions={permissions}
                        />
                    ) : (
                        <BusinessSidebar
                            role={role}
                            tenantName={sidebarTenantName}
                            themeColor={sidebarThemeColor}
                            email={email}
                            canSwitchTenant={canSwitchTenant ?? false}
                            permissions={permissions}
                        />
                    )
                ) : (
                    <GlobalSidebar
                        role={role}
                        email={email}
                        permissions={permissions}
                        tenantType={tenantType}
                    />
                )}
            </div>

            {/* Main content */}
            <main className="flex-1 h-screen overflow-y-auto relative">
                {/* Visual Context Indicator */}
                <div className={cn(
                    "h-1.5 w-full fixed top-0 left-0 z-[60] transition-colors duration-500",
                    isTenantContext ? "bg-amber-500" : "bg-purple-600"
                )} />

                {/* Toggle button */}
                <button
                    type="button"
                    onClick={toggleSidebar}
                    title={sidebarCollapsed ? 'Mở thanh điều hướng' : 'Ẩn thanh điều hướng'}
                    className="
                        fixed top-3 left-3 z-50
                        flex items-center justify-center
                        w-8 h-8 rounded-lg bg-white shadow-md border border-gray-200
                        text-gray-500 hover:text-gray-900 hover:shadow-lg
                        transition-all duration-150
                    "
                >
                    {sidebarCollapsed
                        ? <PanelLeftOpen className="h-4 w-4" />
                        : <PanelLeftClose className="h-4 w-4" />
                    }
                </button>

                {/* Content */}
                <div className={`${sidebarCollapsed ? 'pl-12' : 'pl-0'} p-8 transition-all duration-300`}>
                    {children}
                </div>
            </main>
        </div>
    );
}

