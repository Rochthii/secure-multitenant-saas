import React from 'react';
import { requirePermission } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { OrganizationForm } from '@/components/admin/organization-form';
import { getOrganization } from '@/app/actions/admin/organizations';
import { notFound } from 'next/navigation';

export default async function TenantEditOrganizationPage({
    params
}: {
    params: Promise<{ tenant_id: string; id: string }>
}) {
    const { tenant_id, id } = await params;
    await requirePermission('tenants', 'update');

    const { organization, error } = await getOrganization(id);
    if (!organization || error) notFound();

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href={`/admin/t/${tenant_id}/organizations`}>
                    <Button variant="outline" size="icon" className="rounded-xl shadow-sm hover:bg-slate-50 border-slate-200">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-playfair font-bold text-slate-900 font-serif">Quản trị Đối tác</h1>
                    <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest leading-loose">ID: {organization.id.split('-')[0].toUpperCase()}</p>
                </div>
            </div>

            <OrganizationForm mode="edit" organization={organization} tenantId={tenant_id} />
        </div>
    );
}
