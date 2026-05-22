import React from 'react';
import { requireSuperAdmin } from '@/lib/permissions';
import { getSiteSettings } from '@/lib/site-settings';
import { getTenant } from '@/app/actions/admin/tenants';
import { ThemeSettingsClient } from '@/app/admin/tenants/[id]/theme/theme-settings-client';
import { Palette, ShieldAlert } from 'lucide-react';

export default async function TenantThemeSettingsPage({ params }: { params: Promise<{ tenant_id: string }> }) {
    const { tenant_id } = await params;
    
    // SECURITY: Cấu hình màu sắc nhạy cảm — CHỈ Super Admin mới được can thiệp
    await requireSuperAdmin();

    const settings = await getSiteSettings(tenant_id);
    const { tenant } = await getTenant(tenant_id);

    return (
        <div className="space-y-6 text-slate-300">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Palette className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Tùy chỉnh Giao diện</h1>
                        <p className="text-slate-400 text-sm mt-0.5">Cấu hình màu sắc thương hiệu cho {tenant?.name}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-semibold">
                    <ShieldAlert className="h-4 w-4 text-red-400" />
                    Chế độ Super Admin
                </div>
            </div>

            <ThemeSettingsClient initialSettings={settings} tenantId={tenant_id} tenantName={tenant?.name || ''} tenantType={tenant?.tenant_type} />
        </div>
    );
}
