import React from 'react';
import { getTenants } from '@/app/actions/admin/tenants';
import { requireSuperAdmin } from '@/lib/permissions';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Building2, Globe, LayoutDashboard, ArrowRight, Wand2, Settings } from 'lucide-react';

export const metadata = {
    title: 'Visual Page Builder — Quản lý Layout Toàn Hệ Thống',
};

export default async function GlobalPageBuilderPage() {
    // Chỉ Super Admin mới truy cập được
    await requireSuperAdmin();

    const { tenants, error } = await getTenants();

    return (
        <div className="max-w-5xl mx-auto py-10 px-6 space-y-8">
            {/* Header */}
            <div className="flex items-start gap-5">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                    <Wand2 className="w-7 h-7" />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-gray-900">
                        Visual Page Builder
                    </h1>
                    <p className="text-gray-500 mt-1 max-w-xl">
                        Chọn một chi nhánh để cấu hình bố cục trang chủ — sắp xếp, ẩn/hiện và tuỳ chỉnh từng khối nội dung.
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full">
                        <Settings className="w-3 h-3" />
                        Chỉ dành riêng cho ⚡ Super Admin
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    ⚠️ Lỗi tải dữ liệu: {error}
                </div>
            )}

            {/* Danh sách Chi nhánh */}
            {tenants.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center text-gray-400">
                        <Building2 className="w-12 h-12 mx-auto mb-4 opacity-40" />
                        <p>Hệ thống hiện tại chưa có chi nhánh nào.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {tenants.map(tenant => (
                        <Link
                            key={tenant.id}
                            href={`/admin/t/${tenant.id}/homepage`}
                            className="block group"
                        >
                            <Card className="h-full hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-amber-300 hover:-translate-y-0.5">
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-3">
                                        {/* Avatar màu theme chi nhánh */}
                                        <div
                                            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 transition-transform group-hover:scale-105"
                                            style={{ backgroundColor: tenant.theme_colors?.primary || '#F59E0B' }}
                                        >
                                            {tenant.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 group-hover:text-amber-700 transition-colors truncate">
                                                {tenant.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 truncate">
                                                <Globe className="w-3 h-3 shrink-0" />
                                                <span className="truncate">{tenant.domain || 'Chưa có domain'}</span>
                                            </div>
                                        </div>
                                        <div className="shrink-0 pt-1 text-gray-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                                        <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full font-medium">
                                            <LayoutDashboard className="w-3 h-3" />
                                            Mở Layout Designer
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {/* Chú thích */}
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 text-sm text-blue-800">
                <strong>💡 Lưu ý:</strong> Mỗi chi nhánh có cấu hình layout riêng biệt và độc lập.
                Thay đổi layout của chi nhánh này không ảnh hưởng đến chi nhánh khác.
            </div>
        </div>
    );
}
