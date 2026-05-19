import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KhmerHeading } from '@/components/ui/khmer-heading';
import { ArrowLeft, Smartphone } from 'lucide-react';
import { getTenantConfig } from '@/lib/tenant';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MoMoPaymentPage({ params }: { params: Promise<{ domain: string, locale: string }> }) {
    const { domain, locale } = await params;

    const tenantConfig = await getTenantConfig(domain);
    if (!tenantConfig) notFound();
    if (tenantConfig?.modules_config?.transactions === false) {
        notFound();
    }
    const tenantId = tenantConfig?.id;
    const isCompany = tenantConfig?.tenant_type !== 'tenant';
    const transactionSlug = isCompany ? 'du-an' : 'transactions';

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto">
                <KhmerHeading level={1} withDivider>
                    Thanh toán qua MoMo
                </KhmerHeading>

                <Card className="mt-8">
                    <CardContent className="p-12 text-center">
                        <div className="text-6xl mb-6">
                            <Smartphone className="h-20 w-20 mx-auto text-pink-500" />
                        </div>
                        <h2 className="text-2xl font-playfair font-bold text-gray-800 mb-4">
                            Tính năng đang được phát triển
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Thanh toán qua MoMo sẽ được tích hợp sau. <br />
                            Hiện tại vui lòng sử dụng phương thức <strong>Chuyển khoản QR</strong>.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link href={`/${transactionSlug}`}>
                                <Button variant="outline">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    {isCompany ? 'Quay lại trang Dự án' : 'Quay lại trang Thanh toán'}
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
