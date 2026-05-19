import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { setRequestLocale } from 'next-intl/server';
import SectionRenderer from '@/components/about/SectionRenderer';
import AboutSidebar from '@/components/about/AboutSidebar';
import { getCachedAboutSections } from '@/lib/cache/queries';
import { getSiteSettings } from '@/lib/site-settings';
import { getTenantConfig } from '@/lib/tenant';
import { notFound } from 'next/navigation';

// ISR 60 giây — đảm bảo trang luôn fetch dữ liệu mới từ DB
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ domain: string; locale: string }> }): Promise<Metadata> {
    const { domain } = await params;
    const tenant = await getTenantConfig(domain);
    if (!tenant) return { title: 'Giới thiệu' };

    const settings = await getSiteSettings(tenant.id);
    const siteName = settings['site_name_vi'] || 'Chi nhánh Khmer';
    const isCompany = tenant.tenant_type !== 'tenant';

    const description = isCompany
        ? `Tìm hiểu về tầm nhìn, giá trị cốt lõi và hành trình phát triển của ${siteName}.`
        : `Tìm hiểu về lịch sử, kiến trúc và truyền thừa của ${siteName}.`;

    return {
        title: `Giới thiệu | ${siteName}`,
        description,
        openGraph: {
            title: `Giới thiệu | ${siteName}`,
            description,
            images: ['/og-image.jpg'],
        },
    };
}

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function generateStaticParams() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.warn('⚠️ Missing Supabase variables during build, skipping static generation for gioi-thieu');
        return [];
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
    const { data: tenants } = await supabase.from('tenants').select('domain');

    if (!tenants) return [];
    const locales = ['vi', 'km', 'en'];
    // Lọc bỏ localhost và các domain test (chứa ':' hoặc 'localhost')
    const validTenants = tenants.filter(t => t.domain && !t.domain.includes('localhost') && !t.domain.includes(':'));
    return locales.flatMap(locale => validTenants.map(t => ({ domain: t.domain, locale })));
}

export default async function AboutPage({ params }: { params: Promise<{ domain: string; locale: string }> }) {
    const { locale, domain } = await params;
    setRequestLocale(locale);

    const tenant = await getTenantConfig(domain);
    if (!tenant) return null;

    const settings = await getSiteSettings(tenant.id);
    const siteName = settings['site_name_vi'] || 'Chi nhánh Khmer';

    const allSections = (await getCachedAboutSections(tenant.id)) || [];

    // Chỉ hiện mục CHA (key không chứa dấu '/' hoặc parent_id là null trong tương lai) trên trang tổng quan
    // BỔ SUNG: Loại bỏ nội quy tự viện nếu là domain công ty
    const isCompany = tenant.tenant_type !== 'tenant';
    const sections = allSections
        .filter((s: any) => s.key && !s.key.includes('/'))
        .filter((s: any) => {
            if (isCompany) {
                // Loại bỏ các mục liên quan đến nội quy, nghi lễ, bản sắc truyền thống nếu ở trang công ty
                const tenantSpecificKeys = ['noi-quy', 'nghi-le', 'ban-sac'];
                return !tenantSpecificKeys.some(key => s.key.toLowerCase().includes(key));
            }
            return true;
        })
        .sort((a: any, b: any) => (a.display_order ?? 99) - (b.display_order ?? 99));

    if (!sections || sections.length === 0) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative h-[65vh] lg:h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-coffee-dark">
                    <Image
                        src={settings['site_about_hero'] || (isCompany
                            ? "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"
                            : "https://chuaadida.com/upload/tintuc/du-lich-tam-linh-chua-chantarangsay-1-1634547437-564343.jpg")}
                        alt={`${siteName} — ${isCompany ? 'Hệ sinh thái doanh nghiệp' : 'Di tích lịch sử văn hóa'}`}
                        fill
                        className="object-cover opacity-60 mix-blend-overlay scale-105"
                        priority
                        sizes="100vw"
                        quality={90}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/60"></div>
                </div>

                <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto flex flex-col items-center">
                    <div className="inline-flex items-center gap-3 mb-6 px-6 py-2 border border-gold-light/30 rounded-full bg-black/20 backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-primary"></span>
                        <span className="text-gold-light uppercase tracking-[0.2em] text-xs font-semibold">
                            {isCompany ? 'Khám Phá Sứ Mệnh' : 'Khám Phá Di Sản'}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-primary"></span>
                    </div>
                    <h1 className="text-6xl lg:text-[5.5rem] font-playfair font-bold text-white mb-6 drop-shadow-2xl tracking-wide leading-none">
                        {isCompany ? 'Thông Tin' : 'Giới Thiệu'}<br />
                        <span className="italic font-light text-gold-light">
                            {isCompany ? 'Doanh Nghiệp' : 'Ngôi Chi nhánh'}
                        </span>
                    </h1>
                    <div className="w-24 h-[1px] bg-gold-primary/50 mx-auto my-6"></div>
                    <p className="text-lg sm:text-xl lg:text-2xl text-gray-100 font-light max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                        {isCompany
                            ? 'Doanh nghiệp xã hội đồng hành cùng cộng đồng, hướng tới giá trị nhân văn và phát triển bền vững.'
                            : 'Hành trình gìn giữ và phát huy bản sắc văn hóa Phật giáo Nam tông Khmer.'
                        }
                    </p>
                </div>

                {/* Decorative bottom fade to blend with white content */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
            </div>

            {/* Main Content Layout - Full Width, No Sidebar */}
            <div className="bg-white relative z-20">
                <div className="flex flex-col">
                    {sections.map((section: any, index: number) => {
                        const hasChildren = allSections.some((s: any) => s.key && s.key.startsWith(`${section.key}/`));
                        return (
                            <SectionRenderer
                                key={section.id}
                                section={{ ...section, hasChildren }}
                                index={index}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
