import React from 'react';
import { getTenants } from '@/app/actions/admin/tenants';
import { requirePermission, isGlobalAdmin } from '@/lib/permissions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Building2, Globe, ArrowRight } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function SelectTenantPage() {
    // Only global admins should be accessing this page manually.
    // Tenant-specific admins are redirected straight to their tenant in /admin.
    const globalAccess = await isGlobalAdmin();
    if (!globalAccess) {
        redirect('/admin');
    }

    const { tenants, error } = await getTenants();

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            {/* Header */}
            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-gold-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-gold-dark">
                    <Building2 className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-playfair font-bold text-coffee-dark mb-2">Chọn Tổ chức Quản trị</h1>
                <p className="text-gray-500 max-w-lg mx-auto">
                    Bạn có quyền truy cập toàn cục. Vui lòng chọn một tổ chức bên dưới để tiến hành quản lý nội dung, cài đặt và dữ liệu của đơn vị đó.
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    Lỗi tải dữ liệu: {error}
                </div>
            )}

            {/* Tenant List */}
            {tenants.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center text-gray-400">
                        <Building2 className="w-12 h-12 mx-auto mb-4 opacity-40" />
                        <p>Hệ thống hiện tại chưa có tổ chức nào.</p>
                        <Link href="/admin/tenants/new" className="mt-4 inline-block text-gold-dark hover:underline">
                            Thêm tổ chức đầu tiên
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                    {tenants.map(tenant => (
                        <Link key={tenant.id} href={`/admin/t/${tenant.id}/dashboard`} className="block group">
                            <Card className="hover:shadow-lg transition-all border-transparent hover:border-gold-primary/30 h-full">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        {/* Avatar màu sắc theo theme */}
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 transition-transform group-hover:scale-105"
                                            style={{ backgroundColor: tenant.theme_colors?.primary || '#F59E0B' }}
                                        >
                                            {tenant.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-gold-dark transition-colors truncate">
                                                {tenant.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500 truncate">
                                                <Globe className="w-3.5 h-3.5 shrink-0" />
                                                <span className="truncate">{tenant.domain}</span>
                                            </div>
                                        </div>
                                        <div className="shrink-0 pt-2 text-gray-300 group-hover:text-gold-primary group-hover:translate-x-1 transition-all">
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
