import React from 'react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { getTransactionPurposes, getRecentTransactions } from '@/lib/donations';
import { DonationPageClient } from '@/components/donations/DonationPageClient';
import { KhmerPatternBg } from '@/components/ui/khmer-pattern-bg';
import { getTenantConfig } from '@/lib/tenant';

// force-dynamic: trang dùng searchParams và getTranslations nên phải dynamic.
export const dynamic = 'force-dynamic';

export default async function DonatePage({
    params: routeParams,
    searchParams
}: {
    params: Promise<{ locale: string; domain: string }>;
    searchParams?: Promise<{ purpose?: string }>;
}) {
    const { locale, domain } = await routeParams;
    const sp = await searchParams;
    const initialPurpose = sp?.purpose;

    const tenantConfig = await getTenantConfig(domain).catch(() => null);
    const tenantId = tenantConfig?.id;

    if (!tenantId || tenantConfig?.modules_config?.transactions === false) {
        const { notFound } = await import('next/navigation');
        notFound();
    }

    // Bắt lỗi an toàn từng phần — không để một lỗi DB crash cả trang
    const [purposes, recentTransactions, t] = await Promise.all([
        getTransactionPurposes(tenantId).catch((e) => { console.error('[DonatePage] getTransactionPurposes error:', e); return []; }),
        getRecentTransactions(5, tenantId).catch((e) => { console.error('[DonatePage] getRecentTransactions error:', e); return []; }),
        getTranslations({ locale, namespace: 'transaction.page' }),
    ]);

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <div className="relative h-[400px] lg:h-[500px] w-full bg-gold-primary overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src={tenantConfig?.tenant_type !== 'tenant' ? "/images/hero-impact.jpg" : "/images/hero-carousel/monks-walking.jpg"}
                        alt={t('imageAlt')}
                        fill
                        className="object-cover opacity-30 mix-blend-multiply"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gold-primary/90 via-gold-primary/40 to-transparent" />
                    <KhmerPatternBg className="opacity-10" />
                </div>

                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white pb-20">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold mb-6 drop-shadow-md">
                        {tenantConfig?.tenant_type !== 'tenant' ? t('company_title') : t('title')}
                    </h1>
                    <p className="text-xl md:text-2xl font-light italic max-w-3xl mx-auto mb-4">
                        &quot;{t('quote')}&quot;
                    </p>
                    <p className="text-base md:text-lg max-w-2xl mx-auto font-inter">
                        {tenantConfig?.tenant_type !== 'tenant' ? t('company_description') : t('description')}
                    </p>
                </div>
            </div>

            {/* Main Content - Client Component handles interactions */}
            <DonationPageClient
                purposes={purposes}
                recentTransactions={recentTransactions}
                tenantId={tenantId!}
                initialPurpose={initialPurpose}
                isCompany={tenantConfig?.tenant_type !== 'tenant'}
            />
        </div>
    );
}
