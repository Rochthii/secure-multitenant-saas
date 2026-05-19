import React from 'react';
import { getTenantConfig } from '@/lib/tenant';
import HangMucDuAnClientContent from './client-content';
import { notFound } from 'next/navigation';

export default async function HangMucDuAnIndexPage({ params }: { params: Promise<{ domain: string, locale: string }> }) {
    const { domain, locale } = await params;
    const tenant = await getTenantConfig(domain);
    
    if (!tenant || tenant.modules_config?.transactions === false) {
        return notFound();
    }

    const isCompany = tenant.tenant_type !== 'tenant';

    return <HangMucDuAnClientContent isCompany={isCompany} locale={locale} />;
}
