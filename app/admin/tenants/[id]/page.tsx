import React from 'react';
import { requirePermission } from '@/lib/permissions';
import { getTenant } from '@/app/actions/admin/tenants';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Palette } from 'lucide-react';
import { notFound } from 'next/navigation';
// @ts-ignore
import { TenantForm } from '@/components/admin/tenant-form';

export default async function EditTenantPage({ params }: { params: Promise<{ id: string }> }) {
    await requirePermission('users', 'update');

    const { id } = await params;
    const { tenant, error } = await getTenant(id);
    const { getUserRole } = await import('@/lib/permissions');
    const role = await getUserRole();

    if (!tenant || error) notFound();

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-4">
                <Link href="/admin/tenants">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-playfair font-bold">Chỉnh sửa Chi nhánh</h1>
                    <p className="text-gray-500 mt-1">{tenant.name}</p>
                </div>
            </div>

            {/* Theme shortcut */}
            <Link href={`/admin/tenants/${id}/theme`}>
                <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors flex-shrink-0">
                        <Palette className="h-5 w-5 text-amber-700" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-amber-900">Cài đặt Giao diện (Theme)</p>
                        <p className="text-xs text-amber-700">Tùy chỉnh màu sắc, nền, chữ cho giao diện trang web của chi nhánh</p>
                    </div>
                    <span className="text-amber-500 group-hover:translate-x-1 transition-transform">→</span>
                </div>
            </Link>

            <TenantForm mode="edit" tenant={tenant} role={role || undefined} />
        </div>
    );
}
