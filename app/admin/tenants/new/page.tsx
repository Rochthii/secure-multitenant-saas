import React from 'react';
import { requirePermission } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
// @ts-ignore
import { TenantForm } from '@/components/admin/tenant-form';

export default async function NewTenantPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
    await requirePermission('users', 'create');
    const { mode } = await searchParams;
    const { getUserRole } = await import('@/lib/permissions');
    const role = await getUserRole();

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-4">
                <Link href="/admin/tenants">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-playfair font-bold">Thêm Chi nhánh Mới</h1>
                    <p className="text-gray-500 mt-1">Đăng ký một ngôi chi nhánh mới vào hệ thống</p>
                </div>
            </div>

            <TenantForm mode="create" role={role || undefined} formMode={mode as any} />
        </div>
    );
}
