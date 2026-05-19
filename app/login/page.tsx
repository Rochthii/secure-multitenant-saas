import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BuddhistSpinner } from '@/components/ui/buddhist-spinner';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/tenant';
import { LoginForm } from './login-form';

export default async function LoginPage() {
    const headerList = await headers();
    const host = headerList.get('host') || '';
    const tenant = await getTenantConfig(host);
    const tenantName = tenant?.name || 'Hệ Thống';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 w-full">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-gold-primary">
                <CardHeader>
                    <CardTitle className="text-2xl font-playfair text-center text-gold-dark">
                        Đăng nhập Admin
                    </CardTitle>
                    <p className="text-center text-gray-500 mt-2 text-sm">
                        Cổng thông tin quản trị {tenantName}
                    </p>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={
                        <div className="flex justify-center py-8">
                            <BuddhistSpinner size="md" color="gold" />
                        </div>
                    }>
                        <LoginForm tenantName={tenantName} tenantId={tenant?.id} />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
