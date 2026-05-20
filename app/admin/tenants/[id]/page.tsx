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
        <div className="space-y-6 max-w-2xl text-slate-300">
            <div className="flex items-center gap-4 pb-2">
                <Link href="/admin/tenants">
                    <Button variant="outline" size="icon" className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white bg-slate-900/40">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Cấu hình Workspace</h1>
                    <p className="text-slate-400 mt-1 text-sm">{tenant.name}</p>
                </div>
            </div>

            {/* Theme shortcut */}
            <Link href={`/admin/tenants/${id}/theme`}>
                <div className="flex items-center gap-4 p-5 bg-violet-950/20 border border-violet-500/20 rounded-2xl hover:bg-violet-950/40 transition-all duration-200 cursor-pointer group backdrop-blur-xl">
                    <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center group-hover:bg-violet-500/20 transition-colors flex-shrink-0 border border-violet-500/20">
                        <Palette className="h-5 w-5 text-violet-400" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-violet-200 text-sm">Cài đặt Giao diện (Theme)</p>
                        <p className="text-xs text-slate-400 mt-0.5">Tùy chỉnh hệ màu thương hiệu, hình nền và kiểu hiển thị cho cổng thông tin Web & App của đơn vị</p>
                    </div>
                    <span className="text-violet-400 group-hover:translate-x-1.5 transition-transform font-bold font-mono">→</span>
                </div>
            </Link>

            <TenantForm mode="edit" tenant={tenant} role={role || undefined} />
        </div>
    );
}
