import React from 'react';
import { getFAQs } from '@/app/actions/get-faqs';
import { FAQPageClient } from '@/components/faq/faq-page-client';
import type { Metadata } from 'next';
import { getTenantConfig } from '@/lib/tenant';
import { getTenantBaseUrl } from '@/lib/utils/seo';

// ISR 1 giờ — FAQ hiếm khi thay đổi
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ domain: string; locale: string }> }): Promise<Metadata> {
    const { domain, locale } = await params;
    const tenant = await getTenantConfig(domain);
    const tenantBaseUrl = getTenantBaseUrl(domain);
    const siteName = tenant?.name || 'Hệ thống';

    return {
        title: `Hỏi đáp & Hướng dẫn (FAQ) | ${siteName}`,
        description: `Tổng hợp các câu hỏi thường gặp và hướng dẫn chi tiết về các hoạt động, quy định tại ${siteName}.`,
        alternates: {
            canonical: `${tenantBaseUrl}/${locale}/hoi-dap`,
            languages: {
                'vi-VN': `${tenantBaseUrl}/vi/hoi-dap`,
                'km-KH': `${tenantBaseUrl}/km/hoi-dap`,
                'en-US': `${tenantBaseUrl}/en/hoi-dap`,
            },
        },
        openGraph: {
            title: `Hỏi đáp & Hướng dẫn | ${siteName}`,
            description: `Câu hỏi thường gặp và giải đáp thắc mắc.`,
            url: `${tenantBaseUrl}/${locale}/hoi-dap`,
        },
    };
}

export default async function FAQPage({ params }: { params: Promise<{ domain: string; locale: string }> }) {
    const { locale } = await params;
    const faqs = await getFAQs();

    // Map FAQs to Schema.org JSON-LD FAQPage format
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => {
            const q = locale === 'en' && faq.question_en ? faq.question_en : (locale === 'km' && faq.question_km ? faq.question_km : faq.question_vi);
            const a = locale === 'en' && faq.answer_en ? faq.answer_en : (locale === 'km' && faq.answer_km ? faq.answer_km : faq.answer_vi);
            return {
                "@type": "Question",
                "name": q,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": a
                }
            };
        })
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <FAQPageClient faqs={faqs} />
        </>
    );
}
