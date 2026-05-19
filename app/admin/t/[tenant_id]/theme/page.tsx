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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                        <Palette className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-playfair font-bold">Tùy chỉnh Giao diện</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Cấu hình màu sắc thương hiệu cho {tenant?.name}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-semibold">
                    <ShieldAlert className="h-4 w-4" />
                    Chế độ Super Admin
                </div>
            </div>

            <ThemeSettingsClient initialSettings={settings} tenantId={tenant_id} tenantName={tenant?.name || ''} />
        </div>
    );
}
