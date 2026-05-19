import React from 'react';
import { getLayoutBlocks } from '@/app/actions/admin/layout-blocks';
import { requireSuperAdmin } from '@/lib/permissions';
import { getSiteSettings } from '@/lib/site-settings';
import { getCachedHeroSlides, getCachedDharmaTalks, getCachedAboutSection, getCachedMonthEvents, getCachedNews, getCachedUpcomingEvents, getCachedLayoutData } from '@/lib/cache/queries';
import PreviewSync from '@/components/admin/preview-sync';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getTenantConfig } from '@/lib/tenant';
import { Kantumruy_Pro } from "next/font/google";

const kantumruy = Kantumruy_Pro({
    subsets: ["khmer", "latin"],
    weight: ["400", "700"],
    variable: "--font-kantumruy",
    display: 'swap',
});

export const metadata = {
    title: 'Preview Trang Chủ Real-time',
};

export default async function HomepagePreviewPage({
    params,
    searchParams,
}: {
    params: Promise<{ tenant_id: string }>;
    searchParams: Promise<{
        primary?: string;
        secondary?: string;
        background?: string;
        accent?: string;
        text?: string;
        bgEnd?: string;
        hero?: string;
        surface?: string;
        opacity?: string;
    }>;
}) {
    const { tenant_id } = await params;
    const {
        primary, secondary, background, accent,
        text, bgEnd, hero, surface, opacity
    } = await searchParams;

    // ─── CHỈ SUPER ADMIN ───────────────────────────────────────────────────
    await requireSuperAdmin();

    // Fetch toàn bộ data giống hệt DynamicPageBuilder & LocaleLayout
    // Bước 1: Lấy config của tenant để biết domain thực tế (cho cache)
    const supabase = await createClient();
    const { data: tenantBase } = await (supabase as any)
        .from('tenants')
        .select('domain')
        .eq('id', tenant_id)
        .single();

    const domain = tenantBase?.domain || 'localhost';
    const today = new Date();
    const settings = await getSiteSettings(tenant_id);
    const messages = await getMessages();

    // Lấy dữ liệu Layout (Header/Footer)
    const {
        categoriesTree,
        pagesTree,
        aboutSectionsTree,
        tenant,
        hasProjects
    } = await getCachedLayoutData(domain, tenant_id);

    const abbotKey = settings?.['about_abbot_key'] || 'truyen-thua-tiep-noi/tru-tri-duong-nhie m';
    const introKey = settings?.['about_intro_key'] || 'dong-chay-lich-su';
    const architectureKey = settings?.['about_architecture_key'] || 'di-san-nghe-thuat/kien-truc-dieu-khac';

    const [
        blocks,
        heroSlides,
        dharmaTalks,
        abbotSection,
        introSection,
        architectureSection,
        calendarEvents,
        news,
        upcomingEvents,
    ] = await Promise.all([
        getLayoutBlocks(tenant_id),
        getCachedHeroSlides(tenant_id),
        getCachedDharmaTalks(8, tenant_id),
        getCachedAboutSection(abbotKey, tenant_id),
        getCachedAboutSection(introKey, tenant_id),
        getCachedAboutSection(architectureKey, tenant_id),
        getCachedMonthEvents(today.getFullYear(), today.getMonth() + 1, tenant_id),
        getCachedNews(9, tenant_id),
        getCachedUpcomingEvents(4, tenant_id),
    ]);

    // Xử lý màu ghi đè ban đầu nếu có từ URL
    const initialOverrideColors: any = (primary || secondary || background || accent || text || bgEnd || hero || surface || opacity) ? {
        primary: primary ? `#${primary}` : undefined,
        secondary: secondary ? `#${secondary}` : undefined,
        background: background ? `#${background}` : undefined,
        accent: accent ? `#${accent}` : undefined,
        text: text ? `#${text}` : undefined,
        bgEnd: bgEnd ? `#${bgEnd}` : undefined,
        hero: hero ? `#${hero}` : undefined,
        surface: surface ? `#${surface}` : undefined,
        opacity: opacity ? opacity : undefined,
    } : (settings?.theme_colors || {});

    const dataContext = {
        locale: 'vi',
        tenantId: tenant_id,
        heroSlides: heroSlides ?? [],
        slides: heroSlides ?? [],
        dharmaTalks: dharmaTalks ?? [],
        talks: dharmaTalks ?? [],
        introSection,
        abbotSection,
        architectureSection,
        calendarEvents: calendarEvents ?? [],
        initialEvents: calendarEvents ?? [],
        news: news ?? [],
        upcomingEvents: upcomingEvents ?? [],
        settings: { ...settings, theme_colors: initialOverrideColors },
    };

    return (
        <NextIntlClientProvider locale="vi" messages={messages}>
            <div className={`${kantumruy.variable} font-inter antialiased`}>
                <Header
                    settings={settings}
                    categoriesTree={categoriesTree as any}
                    pagesTree={pagesTree as any}
                    aboutSectionsTree={aboutSectionsTree as any}
                    layoutStyle={tenant.layout_style}
                    modulesConfig={tenant.modules_config}
                    hasProjects={hasProjects}
                />
                <main className="w-full min-h-screen bg-white overflow-x-hidden">
                    <PreviewSync
                        initialBlocks={blocks}
                        initialThemeColors={initialOverrideColors}
                        tenantId={tenant_id}
                        locale="vi"
                        dataContext={dataContext}
                    />
                </main>
                <Footer settings={settings} layoutStyle={tenant.layout_style} modulesConfig={tenant.modules_config} hasProjects={hasProjects} />
            </div>
        </NextIntlClientProvider>
    );
}

// Fix font import typo (slash instead of hyphen)
import { createClient } from '@/lib/supabase/server';
