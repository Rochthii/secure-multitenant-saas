import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Kantumruy_Pro, Lora, Manrope } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';


import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ClientOnlyComponents } from '@/components/layout/ClientOnlyComponents';
import { Analytics } from "@vercel/analytics/next";
import { getSiteSettings } from '@/lib/site-settings';
import { getCachedCategoriesTree, getCachedPagesTree, getCachedAboutSections, getCachedLayoutData } from '@/lib/cache/queries';
import { getTenantConfig } from '@/lib/tenant';
import { SITE_URL, DEFAULT_SITE_NAME, DEFAULT_SITE_DESCRIPTION, BRAND_NAME_VI } from '@/lib/constants';
import { getTenantBaseUrl, generateWebSiteSchema } from '@/lib/utils/seo';
import "../../globals.css";

// ── Fonts: loaded via next/font (self-hosted, no render-blocking @import) ────
const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: 'swap',
    // Next.js automatically calculates size-adjust for the fallback font
    // to match Inter's metrics → zero layout shift during font swap
    adjustFontFallback: true,
    preload: true,
});

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
    display: 'swap',
    // Critical: Playfair is used in H1 (hero). Preload ensures it's available
    // before first paint of the largest content element.
    adjustFontFallback: true,
    preload: true,
});

const kantumruy = Kantumruy_Pro({
    subsets: ["khmer", "latin"],
    weight: ["400", "700"],           // Removed 500/600 — reduce font bytes by ~40%
    variable: "--font-kantumruy",
    display: 'swap',
    // Khmer font is large — use fallback metrics to avoid FOUT-induced CLS
    adjustFontFallback: false,        // Khmer has no latin fallback metrics; keep false to avoid incorrect sizing
    preload: false,                   // Non-latin scripts: preload only if Khmer is the default locale
});

const lora = Lora({
    subsets: ["latin", "vietnamese"],
    variable: "--font-lora",
    display: 'swap',
    adjustFontFallback: true,
    preload: false,                   // Lazy — only used in Quiz Portal
});

const manrope = Manrope({
    subsets: ["latin", "vietnamese"],
    variable: "--font-manrope",
    display: 'swap',
    adjustFontFallback: true,
    preload: false,
});

// ── SEO Metadata ─────────────────────────────────────────────────────────────// ── SEO Metadata ─────────────────────────────────────────────────────────────
export const viewport: Viewport = {
    themeColor: '#1a1a2e',
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',       // iPhone notch / Dynamic Island safe area
    minimumScale: 1,
    maximumScale: 5,            // Allow pinch-to-zoom for accessibility
};


export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }): Promise<Metadata> {
    const { domain } = await params;
    const tenantConfig = await getTenantConfig(domain);
    if (!tenantConfig) return { title: DEFAULT_SITE_NAME };

    const { settings } = await getCachedLayoutData(domain, tenantConfig.id);
    const isCompany = tenantConfig.tenant_type !== 'tenant';

    const siteName = settings['site_name_vi'] || DEFAULT_SITE_NAME;
    const defaultDesc = isCompany 
        ? "Hệ thống quản trị nội bộ công nghệ phụng sự cộng đồng"
        : `Trang thông tin chính thức và các hoạt động Phật sự của ${siteName}`;

    const siteDesc = settings['site_description_vi'] || defaultDesc;
    const tenantBaseUrl = getTenantBaseUrl(domain);

    // Use custom OG image from settings, or tenant logo, or default
    const ogImage = settings['site_og_image'] || tenantConfig.logo_url || `${tenantBaseUrl}/default-og-image.jpg`;

    const keywords = isCompany
        ? [siteName, 'Doanh nghiệp xã hội', 'Social Enterprise', 'Công nghệ cộng đồng', 'Minh bạch giao dịch']
        : [
            siteName, 'Chi nhánh Khmer', 'Phật giáo Nam tông',
            'Buddhism', 'Theravada Buddhism',
            'Buddhist Tenant', 'Khmer Tenant',
        ];

    return {
        metadataBase: new URL(tenantBaseUrl),
        title: {
            template: `%s | ${siteName}`,
            default: `${siteName} - ${siteDesc}`,
        },
        description: siteDesc,
        keywords,
        authors: [{ name: siteName }],
        creator: siteName,
        publisher: siteName,
        formatDetection: { email: false, address: false, telephone: false },
        openGraph: {
            type: 'website',
            locale: 'vi_VN',
            alternateLocale: ['km_KH', 'en_US'],
            url: '/',
            siteName: siteName,
            title: `${siteName} - ${siteDesc}`,
            description: siteDesc,
            images: [{ url: ogImage, width: 1200, height: 630, alt: siteName }],
        },
        twitter: {
            card: 'summary_large_image',
            title: siteName,
            description: siteDesc,
            images: [ogImage],
        },
        icons: {
            icon: '/favicon.ico',
            apple: '/apple-touch-icon.png',
        },
        robots: {
            index: true,
            follow: true,
            googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
        },
        alternates: {
            canonical: tenantBaseUrl,
            languages: {
                'vi-VN': `${tenantBaseUrl}/vi`,
                'km-KH': `${tenantBaseUrl}/km`,
                'en-US': `${tenantBaseUrl}/en`,
            },
        },
        verification: {
            google: settings['google_site_verification'] || undefined, // Dynamic GSC Verification
        },
    };
}

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ domain: string; locale: string }>;
}) {
    const { domain, locale } = await params;

    setRequestLocale(locale);

    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    const messages = await getMessages();
    const tenantConfig = await getTenantConfig(domain);
    if (!tenantConfig) notFound();

    const tenantBaseUrl = getTenantBaseUrl(domain);

    // UNIFIED FETCH: Reduces CPU overhead by 80% via bundling cache lookups
    const {
        settings,
        categoriesTree,
        pagesTree,
        aboutSectionsTree,
        themeVars,
        tenant,
        hasProjects
    } = await getCachedLayoutData(domain, tenantConfig.id);

    // Dynamic OG Image for JSON-LD
    const ogImage = settings['site_og_image'] || tenantConfig.logo_url || `${tenantBaseUrl}/default-og-image.jpg`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseDomain = supabaseUrl ? new URL(supabaseUrl).hostname : null;

    const v = themeVars;
    const isAiPortal = tenant.layout_style === 'ai_portal';

    return (
        <html lang={locale} suppressHydrationWarning>
            <head>
                {/* Preconnect to Supabase Storage for faster image loads */}
                {supabaseDomain && (
                    <>
                        <link rel="preconnect" href={`https://${supabaseDomain}`} crossOrigin="anonymous" />
                        <link rel="dns-prefetch" href={`https://${supabaseDomain}`} />
                    </>
                )}
                <link rel="preconnect" href="https://www.youtube.com" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://img.youtube.com" crossOrigin="anonymous" />
                <link rel="dns-prefetch" href="https://www.youtube.com" />
                <link rel="dns-prefetch" href="https://img.youtube.com" />

                {/* Schema.org JSON-LD for BuddhistTenant (SEO Entity) */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": tenantConfig.tenant_type !== 'tenant' ? "Organization" : "BuddhistTenant",
                            "name": settings['site_name_vi'] || DEFAULT_SITE_NAME,
                            "alternateName": [
                                settings['site_name_en'] || (tenantConfig.tenant_type !== 'tenant' ? "Social Enterprise" : "Khmer Buddhist Tenant"),
                                settings['site_name_km'] || "វដ្តខ្មែរ"
                            ],
                            "description": settings['site_description_vi'] || DEFAULT_SITE_DESCRIPTION,
                            "image": ogImage,
                            "url": tenantBaseUrl,
                            "telephone": settings['contact_phone'] || undefined,
                            "address": {
                                "@type": "PostalAddress",
                                "streetAddress": settings['address'] || "",
                                "addressLocality": settings['address_locality'] || "",
                                "addressRegion": settings['address_city'] || "TP. Hồ Chí Minh",
                                "postalCode": settings['postal_code'] || "700000",
                                "addressCountry": "VN"
                            },
                            "openingHoursSpecification": {
                                "@type": "OpeningHoursSpecification",
                                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                                "opens": settings['opening_hours_open'] || "06:00",
                                "closes": settings['opening_hours_close'] || "20:00"
                            }
                        })
                    }}
                />
                {/* BreadcrumbList for better search results structure */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "BreadcrumbList",
                            "itemListElement": [
                                {
                                    "@type": "ListItem",
                                    "position": 1,
                                    "name": locale === 'vi' ? 'Trang chủ' : (locale === 'km' ? 'Trang chủ' : 'Home'),
                                    "item": SITE_URL
                                }
                            ]
                        })
                    }}
                />
                {/* WebSite schema with SearchAction for sitelinks search box */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: generateWebSiteSchema(
                            tenantBaseUrl,
                            settings['site_name_vi'] || DEFAULT_SITE_NAME
                        )
                    }}
                />
                {/* Dynamic Theme CSS Variables Injection for Multi-tenant */}
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                            :root {
                                /* ── Core palette ─────────────────────────── */
                                --theme-primary: ${v.primary};
                                --theme-secondary: ${v.secondary};
                                --theme-text: ${v.text};
                                --theme-accent: ${v.accent};
                                --theme-bg-start: ${v.bgStart};
                                --theme-bg-end: ${v.bgEnd};
                                --theme-pattern-opacity: ${v.patternOpacity};
                                /* ── Derived semantic variables ───────────── */
                                --theme-primary-dark: ${v.primaryDark};
                                --theme-primary-light: ${v.primaryLight};
                                --theme-hero: ${v.hero};
                                --theme-surface: ${v.surface};
                                /* ── Custom Header/Footer backgrounds ─────── */
                                ${v.headerBg ? `--theme-header-bg: ${v.headerBg};` : ''}
                                ${v.footerBg ? `--theme-footer-bg: ${v.footerBg};` : ''}
                            }
                        `
                    }}
                />
            </head>
            <body className={`${inter.variable} ${playfair.variable} ${kantumruy.variable} ${lora.variable} ${manrope.variable} font-inter antialiased ${isAiPortal ? 'flex flex-col h-[100dvh] overflow-hidden' : ''}`} suppressHydrationWarning>
                {/* Skip-to-content: hỗ trợ điều hướng bàn phím và screen reader */}
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-gold-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:font-medium"
                >
                    Bỏ qua đến nội dung chính
                </a>
                <NextIntlClientProvider messages={messages}>
                    <ClientOnlyComponents />
                    {!isAiPortal && (
                        <Header settings={settings} categoriesTree={categoriesTree as any} pagesTree={pagesTree as any} aboutSectionsTree={aboutSectionsTree as any} layoutStyle={tenant.layout_style} layoutBlocks={tenant.layout_blocks} domain={domain} modulesConfig={tenant.modules_config} isCompany={tenantConfig.tenant_type !== 'tenant'} hasProjects={hasProjects} navVisibility={(tenant as any).nav_visibility || {}} />
                    )}
                    <main id="main-content" className={isAiPortal ? "flex-1 min-h-0 w-full overflow-hidden flex flex-col relative" : "min-h-screen pb-16 lg:pb-0"} suppressHydrationWarning>
                        {children}
                    </main>
                    {!isAiPortal && (
                        <Footer settings={settings} layoutStyle={tenant.layout_style} domain={domain} isCompany={tenantConfig.tenant_type !== 'tenant'} hasProjects={hasProjects} modulesConfig={tenant.modules_config} />
                    )}
                </NextIntlClientProvider>
                <Analytics />
            </body>
        </html>
    );
}
