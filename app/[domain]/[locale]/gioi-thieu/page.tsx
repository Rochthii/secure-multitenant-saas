import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { setRequestLocale } from 'next-intl/server';
import SectionRenderer from '@/components/about/SectionRenderer';
import CorporateAboutPage from '@/components/about/CorporateAboutPage';
import { getCachedAboutSections } from '@/lib/cache/queries';
import { getSiteSettings } from '@/lib/site-settings';
import { getTenantConfig } from '@/lib/tenant';
import { notFound } from 'next/navigation';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// ISR 60 giây — trang luôn nhận dữ liệu mới từ DB
export const revalidate = 60;

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({
    params,
}: {
    params: Promise<{ domain: string; locale: string }>;
}): Promise<Metadata> {
    const { domain } = await params;
    const tenant = await getTenantConfig(domain);
    if (!tenant) return { title: 'Giới thiệu' };

    const settings = await getSiteSettings(tenant.id);
    const siteName = settings['site_name_vi'] || tenant.name || 'Workspace';
    const isCompany = tenant.tenant_type !== 'tenant';

    const description = isCompany
        ? `Tầm nhìn chiến lược, đội ngũ tài năng và hành trình kiến tạo giá trị bền vững của ${siteName}.`
        : `Tìm hiểu về tầm nhìn, đội ngũ và hành trình phát triển của ${siteName}.`;

    return {
        title: `Giới thiệu | ${siteName}`,
        description,
        openGraph: {
            title: `Giới thiệu | ${siteName}`,
            description,
            images: [settings['site_about_hero'] || '/og-image.jpg'],
        },
    };
}

// ─── Static Params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.warn('⚠️ Missing Supabase env vars, skipping static generation for gioi-thieu');
        return [];
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
    const { data: tenants } = await supabase.from('tenants').select('domain');
    if (!tenants) return [];

    const locales = ['vi', 'km', 'en'];
    const validTenants = tenants.filter(
        (t) => t.domain && !t.domain.includes('localhost') && !t.domain.includes(':')
    );
    return locales.flatMap((locale) => validTenants.map((t) => ({ domain: t.domain, locale })));
}

// ─── Default hero image — professional corporate photo ────────────────────────
const DEFAULT_HERO_IMAGE =
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600';

// ─── Page Component ───────────────────────────────────────────────────────────

export default async function AboutPage({
    params,
}: {
    params: Promise<{ domain: string; locale: string }>;
}) {
    const { locale, domain } = await params;
    setRequestLocale(locale);

    const tenant = await getTenantConfig(domain);
    if (!tenant) return null;

    const settings = await getSiteSettings(tenant.id);
    const siteName = settings['site_name_vi'] || tenant.name || 'Workspace';
    const heroImage = settings['site_about_hero'] || DEFAULT_HERO_IMAGE;

    const allSections = (await getCachedAboutSections(tenant.id)) || [];

    // Chỉ hiển thị mục cha (không chứa '/') trên trang tổng quan
    const sections = allSections
        .filter((s: any) => s.key && !s.key.includes('/'))
        .sort((a: any, b: any) => (a.display_order ?? 99) - (b.display_order ?? 99))
        .map((s: any) => ({
            ...s,
            hasChildren: allSections.some((c: any) => c.key && c.key.startsWith(`${s.key}/`)),
        }));

    if (!sections || sections.length === 0) {
        notFound();
    }

    const isCompany = tenant.tenant_type !== 'tenant';

    // ─── Corporate: render trang doanh nghiệp cao cấp ────────────────────────
    if (isCompany) {
        return (
            <CorporateAboutPage
                sections={sections}
                siteName={siteName}
                siteDescription={settings['site_description_vi'] || undefined}
                heroImage={heroImage}
                logoUrl={settings['site_logo'] || null}
                address={settings['contact_address'] || settings['site_address'] || undefined}
                phone={settings['contact_phone'] || settings['site_phone'] || undefined}
                email={settings['contact_email'] || settings['site_email'] || undefined}
                foundedYear={settings['founded_year'] || undefined}
            />
        );
    }

    // ─── Temple / Tâm linh: giữ nguyên layout cũ ─────────────────────────────
    return (
        <div className="min-h-screen bg-white">
            {/* ── Hero Section ─────────────────────────────────────────────── */}
            <div className="relative h-[65vh] lg:h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-coffee-dark">
                    <Image
                        src={heroImage}
                        alt={`${siteName} — Giới thiệu`}
                        fill
                        className="object-cover opacity-50 mix-blend-overlay scale-105"
                        priority
                        sizes="100vw"
                        quality={90}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-coffee-dark via-coffee-dark/40 to-transparent" />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto flex flex-col items-center">
                    <div className="inline-flex items-center gap-3 mb-6 px-6 py-2 border border-amber-400/20 rounded-full bg-black/20 backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-amber-400" />
                        <span className="text-amber-200 uppercase tracking-[0.25em] text-xs font-bold">Cội Nguồn Tâm Linh</span>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-amber-400" />
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 drop-shadow-2xl tracking-tight leading-none">
                        Giới Thiệu<br />
                        <span className="italic font-light text-yellow-300">{siteName}</span>
                    </h1>

                    <div className="w-16 h-[2px] bg-amber-400/60 mx-auto my-6" />

                    <p className="text-lg sm:text-xl text-slate-200 font-light max-w-2xl mx-auto leading-relaxed">
                        Tầm nhìn, đội ngũ và hành trình phát triển của chúng tôi trên con đường tạo ra giá trị bền vững cho cộng đồng và đối tác.
                    </p>
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent" />
            </div>

            {/* ── Section Content ───────────────────────────────────────────── */}
            <div className="bg-white relative z-20">
                <div className="flex flex-col">
                    {sections.map((section: any, index: number) => (
                        <SectionRenderer
                            key={section.id}
                            section={section}
                            index={index}
                            isCompany={false}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
