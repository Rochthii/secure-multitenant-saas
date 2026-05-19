import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import EtiquetteContent from '@/components/about/EtiquetteContent';
import { getTenantConfig } from '@/lib/tenant';
import { getSiteSettings } from '@/lib/site-settings';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ domain: string; locale: string }> }): Promise<Metadata> {
    const { domain } = await params;
    const tenant = await getTenantConfig(domain);
    if (!tenant) return { title: 'Nội Quy Tự Viện' };

    const settings = await getSiteSettings(tenant.id);
    const siteName = settings['site_name_vi'] || 'Chi nhánh Khmer';

    return {
        title: `Nội Quy Tự Viện | ${siteName}`,
        description: `Những hướng dẫn trang phục và ứng xử khi bước vào không gian thiêng liêng cửa thiền tại ${siteName}.`,
    };
}

export default async function TenantRulesPage({ params }: { params: Promise<{ domain: string; locale: string }> }) {
    const { domain, locale } = await params;
    setRequestLocale(locale);

    const tenant = await getTenantConfig(domain);
    if (!tenant) return notFound();

    return <EtiquetteContent />;
}
