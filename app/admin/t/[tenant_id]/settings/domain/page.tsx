import React from 'react';
import { getTenant } from '@/app/actions/admin/tenants';
import { DomainForm } from './domain-form';
import { requireTenantAccess } from '@/lib/permissions';

export default async function DomainManagementPage({ params }: { params: Promise<{ tenant_id: string }> }) {
    const { tenant_id } = await params;

    // Bảo vệ trang: user phải có quyền với tenant này
    await requireTenantAccess(tenant_id);

    // Lấy thông tin tenant (bao gồm domain hiện tại)
    const { tenant, error } = await getTenant(tenant_id);

    if (error || !tenant) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>Không thể tải thông tin chi nhánh: {error || 'Không tìm thấy chi nhánh'}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-playfair font-bold text-gray-900">Quản lý Tên miền</h1>
                <p className="text-gray-500 mt-1">Cấu hình địa chỉ truy cập (domain) riêng cho ngôi chi nhánh này</p>
            </div>

            <div className="mt-8">
                <DomainForm
                    tenantId={tenant_id}
                    currentDomain={tenant.domain || ''}
                />
            </div>
        </div>
    );
}
