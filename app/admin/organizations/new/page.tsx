import React from 'react';
import { requirePermission } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { OrganizationForm } from '@/components/admin/organization-form';

export default async function NewOrganizationPage() {
    await requirePermission('tenants', 'update');

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/organizations">
                    <Button variant="outline" size="icon" className="rounded-xl shadow-sm hover:bg-slate-50 border-slate-200">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-playfair font-bold text-slate-900 font-serif">Thêm Tổ chức Mới</h1>
                    <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest leading-loose">Hệ Sinh Thái Doanh Nghiệp Xã Hội</p>
                </div>
            </div>

            <OrganizationForm mode="create" />
        </div>
    );
}
