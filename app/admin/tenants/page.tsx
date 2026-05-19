import React from 'react';
import { getTenants } from '@/app/actions/admin/tenants';
import { requirePermission } from '@/lib/permissions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Building2, Globe, Pencil, LayoutTemplate } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const LAYOUT_LABELS: Record<string, string> = {
    traditional: '🏛️ Truyền Thống',
    modern: '🌕 Ánh Trăng Rằm',
    minimal: '📄 Vedanā',
    lotus: '🌺 Champa Neak',
    angkor: '🏯 Prasat Khmer',
    zen: '🪷 Anapanasati',
    sunrise: '🌅 Bình Minh Mekong',
    festival: '🔔 Bon Khmer',
    ai_portal: '🤖 Dharma Chat AI',
};


export default async function TenantsPage() {
    await requirePermission('tenants', 'read');

    const { tenants, error } = await getTenants();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-playfair font-bold">Quản lý Chi nhánh</h1>
                    <p className="text-gray-500 mt-1">
                        Danh sách các ngôi chi nhánh sử dụng hệ thống ({tenants.length} chi nhánh)
                    </p>
                </div>
                <div className="flex gap-2 font-sans">
                    <Link href="/admin/tenants/new?mode=app-only">
                        <Button variant="outline" className="gap-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 shadow-sm">
                            <Plus className="w-4 h-4" />
                            Khởi tạo Chi nhánh lên App
                        </Button>
                    </Link>
                    <Link href="/admin/tenants/new">
                        <Button className="gap-2 shadow-sm">
                            <Plus className="w-4 h-4" />
                            Thêm Chi nhánh Mới (Web + App)
                        </Button>
                    </Link>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    Lỗi tải dữ liệu: {error}
                </div>
            )}

            {/* Tenant List */}
            {tenants.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center text-gray-400">
                        <Building2 className="w-12 h-12 mx-auto mb-4 opacity-40" />
                        <p>Chưa có chi nhánh nào trong hệ thống.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {tenants.map(tenant => (
                        <Card key={tenant.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {/* Avatar màu sắc theo theme */}
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm"
                                            style={{ backgroundColor: tenant.theme_colors?.primary || '#F59E0B' }}
                                        >
                                            {tenant.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-lg">{tenant.name}</h3>
                                                <Badge variant="outline" className="text-xs">
                                                    {LAYOUT_LABELS[tenant.layout_style || 'traditional'] || tenant.layout_style}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Globe className="w-3.5 h-3.5" />
                                                    {tenant.domain}
                                                </span>
                                                {tenant.subdomain && (
                                                    <span className="text-xs text-gray-400">
                                                        subdomain: {tenant.subdomain}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Link href={`/admin/tenants/${tenant.id}`}>
                                        <Button variant="outline" size="sm" className="gap-1.5">
                                            <Pencil className="w-3.5 h-3.5" />
                                            Chỉnh sửa
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
