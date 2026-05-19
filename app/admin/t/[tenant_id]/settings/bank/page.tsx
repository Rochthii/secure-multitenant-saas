import React from 'react';
import { getSiteSettings } from '@/lib/site-settings';
import { BankSettingsForm } from '@/components/admin/bank-settings-form';

export const revalidate = 0;

export default async function AdminBankSettingsPage({ params }: { params: Promise<{ tenant_id: string }> }) {
    const { tenant_id } = await params;
    const settings = await getSiteSettings(tenant_id);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-playfair font-bold">Cấu hình Ngân hàng</h1>
            <p className="text-gray-500 max-w-2xl">
                Cập nhật thông tin tài khoản ngân hàng nhận Thanh toán. Thay đổi ở đây sẽ cập nhật ngay lập tức trên trang Thanh toán và mã QR.
            </p>

            <BankSettingsForm settings={settings} contextTenantId={tenant_id} />
        </div>
    );
}
