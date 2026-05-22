import React, { Suspense } from 'react';
import { generatePlaceSchema, generateOrganizationSchema } from '@/lib/seo/json-ld';
import { getCachedHeroSlides, getCachedDharmaTalks, getCachedAboutSection, getCachedAboutSections, getCachedMonthEvents, getCachedNews, getCachedUpcomingEvents, getCachedNextMajorFestival } from '@/lib/cache/queries';
import { getSiteSettings } from '@/lib/site-settings';
import { getTenantConfig } from '@/lib/tenant';
import { BlockConfig, DEFAULT_LAYOUT_BLOCKS, DEFAULT_COMPANY_BLOCKS, DEFAULT_TECH_BLOCKS } from '@/lib/types/layout-blocks';
import { SECTION_REGISTRY, SectionDataKey } from '@/lib/blocks-registry';
import { hexToRgbString, darkenRgbString, lightenRgbString } from '@/lib/utils/colors';
import { getVietnamTime } from '@/lib/utils/date';

interface DynamicPageBuilderProps {
    blocks?: BlockConfig[];
    locale: string;
    tenantId: string;
    domain: string;
    overrideColors?: Record<string, string>; // Thêm prop này để preview real-time
}

/**
 * SMART DATA FETCHING + ZERO-JS ARCHITECTURE
 * 
 * Tối ưu kép:
 * 1. Lazy Dynamic Import (blocks-registry): Chỉ tải JS của component đang dùng.
 * 2. Conditional Data Fetch: Chỉ gọi API của data nào mà ít nhất 1 block đang active cần.
 *    → Ví dụ layout không có Pháp Thoại thì getCachedDharmaTalks() HOÀN TOÀN không được gọi.
 *    → Tiết kiệm N ms latency DB + CPU query cost ở Supabase.
 */
export default async function DynamicPageBuilder({
    blocks = DEFAULT_LAYOUT_BLOCKS,
    locale,
    tenantId,
    domain,
    overrideColors,
}: DynamicPageBuilderProps) {
    const { getTenantBaseUrl } = await import('@/lib/utils/seo');
    const baseUrl = getTenantBaseUrl(domain);
    const today = getVietnamTime();

    // ─── 1. Xác định tập hợp data thực sự cần cho layout này ──────────────────
    const visibleBlocks = blocks.filter(b => b.visible);

    const neededKeys = new Set<SectionDataKey>();
    // settings luôn cần cho SEO Schema
    neededKeys.add('settings');

    for (const block of visibleBlocks) {
        const type = block.type || `traditional_${block.id}`;
        const entry = SECTION_REGISTRY[type];
        if (entry?.requiredData) {
            entry.requiredData.forEach(k => neededKeys.add(k));
        }
    }

    const needs = (key: SectionDataKey) => neededKeys.has(key);

    // ─── 2. Fetch song song CHỈ NHỮNG GÌ CẦN ──────────────────────────────────
    // Phase 1: settings luôn fetch trước (cần để biết about keys của tenant)
    const settings = await getSiteSettings(tenantId);

    // Lấy about section keys từ settings (cho phép mỗi chi nhánh tùy chỉnh trong Admin)
    const abbotKey = settings?.['about_abbot_key'] || 'truyen-thua-tiep-noi/tru-tri-duong-nhiem';
    const introKey = settings?.['about_intro_key'] || 'dong-chay-lich-su';
    const architectureKey = settings?.['about_architecture_key'] || 'di-san-nghe-thuat/kien-truc-dieu-khac';

    const tenantConfig = await getTenantConfig(tenantId);
    const isCompany = tenantConfig?.tenant_type !== 'tenant';

    // Phase 2: fetch song song phần còn lại
    const [
        heroSlides,
        dharmaTalks,
        allAboutSections,
        calendarEvents,
        news,
        upcomingEvents,
        nextMajorFestival,
    ] = await Promise.all([
        needs('heroSlides') ? getCachedHeroSlides(tenantId) : Promise.resolve(null),
        needs('dharmaTalks') ? getCachedDharmaTalks(8, tenantId) : Promise.resolve(null),
        (needs('introSection') || needs('abbotSection') || needs('architectureSection') || needs('aboutSections'))
            ? getCachedAboutSections(tenantId)
            : Promise.resolve([]),
        needs('calendarEvents') ? getCachedMonthEvents(today.getFullYear(), today.getMonth() + 1, tenantId) : Promise.resolve(null),
        needs('news') ? getCachedNews(9, tenantId) : Promise.resolve(null),
        needs('upcomingEvents') ? getCachedUpcomingEvents(4, tenantId) : Promise.resolve(null),
        needs('nextMajorFestival') ? getCachedNextMajorFestival(tenantId) : Promise.resolve(null),
    ]);

    // Phase 3: Smart Mapping for About Sections
    const aboutSections = allAboutSections || [];

    const getSmartSection = (configKey: string, fallbackPrefix: string) => {
        // 1. Exact match from config
        let section = aboutSections.find(s => s.key === configKey);
        if (section) return section;

        // 2. Try home/ prefix
        section = aboutSections.find(s => s.key === `home/${fallbackPrefix}`);
        if (section) return section;

        // 3. Try partial key match
        section = aboutSections.find(s => s.key.includes(fallbackPrefix));
        if (section) return section;

        // 4. Default: First root-level section with image (or any)
        return aboutSections.find(s => !s.key.includes('/') && s.image_url) || aboutSections[0] || null;
    };

    const abbotSection = needs('abbotSection') ? getSmartSection(abbotKey, 'abbot') : null;
    const introSection = needs('introSection') ? getSmartSection(introKey, 'intro') : null;
    const architectureSection = needs('architectureSection') ? getSmartSection(architectureKey, 'architecture') : null;


    // ─── 3. SEO JSON-LD (luôn inject) ─────────────────────────────────────────
    const organizationSchema = generateOrganizationSchema({
        name: settings?.['site_name_vi'] || 'Cổng thông tin Doanh nghiệp',
        alternateName: settings?.['site_name_en'] || 'Enterprise Workspace Portal',
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        description: settings?.['site_description_vi'] || 'Hệ thống quản lý tri thức, quy trình SOP và vận hành doanh nghiệp',
        address: {
            '@type': 'PostalAddress',
            streetAddress: settings?.['address'] || '',
            addressLocality: 'Quận 1',
            addressRegion: 'TP. Hồ Chí Minh',
            addressCountry: 'VN',
        },
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: settings?.['contact_phone'] || '0900 000 000',
            contactType: 'Customer Service',
            email: settings?.['contact_email'] || 'contact@enterprise.com',
        },
    });
    const placeSchema = generatePlaceSchema();

    // ─── 4. Tổng hợp DataContext ──────────────────────────────────────────────
    // Ưu tiên overrideColors nếu có (dùng cho Preview Builder)
    const effectiveSettings: Record<string, any> = { ...(settings ?? {}) };
    if (overrideColors) {
        effectiveSettings['theme_colors'] = overrideColors;
    }

    const dataContext = {
        locale,
        tenantId,
        heroSlides: heroSlides ?? [],
        slides: heroSlides ?? [], // Alias for components expecting 'slides'
        dharmaTalks: dharmaTalks ?? [],
        talks: dharmaTalks ?? [], // Alias for components expecting 'talks'
        introSection,
        abbotSection,
        architectureSection,
        calendarEvents: calendarEvents ?? [],
        initialEvents: calendarEvents ?? [], // Alias for components expecting 'initialEvents'
        news: news ?? [],
        upcomingEvents: upcomingEvents ?? [],
        nextMajorFestival,
        aboutSections, // Cung cấp toàn bộ cho các block cần tự lọc (như AngkorArchShowcase)
        settings: effectiveSettings,
        modulesConfig: tenantConfig?.modules_config,
        isCompany
    };

    // ─── 4.0. Filter blocks based on module visibility ────────────────────────
    // Many CTA blocks are for 'Thanh toán' (transactions). If module is disabled, hide them.
    const isTransactionsEnabled = tenantConfig?.modules_config?.transactions !== false;
    
    const filteredBlocks = visibleBlocks.filter(block => {
        const type = block.type || `traditional_${block.id}`;
        const registryEntry = SECTION_REGISTRY[type as keyof typeof SECTION_REGISTRY];
        
        if (isCompany) {
            // Doanh nghiệp: Loại bỏ hoàn toàn các block chùa chiền/tâm linh Phật giáo
            const isBuddhistBlock = 
                type.startsWith('traditional_') ||
                type.startsWith('sunrise_') ||
                type.startsWith('lotus_') ||
                type.startsWith('zen_') ||
                type.startsWith('angkor_') ||
                type.startsWith('festival_') ||
                type.includes('dharma') ||
                type.includes('abbot') ||
                type.includes('monks') ||
                type.includes('temples') ||
                registryEntry?.category === 'spiritual' ||
                registryEntry?.category === 'dharma';
            
            if (isBuddhistBlock) return false;
        } else {
            // Chùa chiền: Loại bỏ hoàn toàn các block doanh nghiệp/B2B/SaaS
            const isCompanyBlock = 
                type.startsWith('enterprise_') ||
                type.startsWith('mcaaron_') ||
                type === 'impact_dashboard' ||
                type === 'transparency_timeline' ||
                type === 'founder_section' ||
                type === 'network_section';
            
            if (isCompanyBlock) return false;
        }

        // Hide transaction-related CTAs and transparency blocks if transactions are disabled
        if (!isTransactionsEnabled) {
            // Danh sách các block cụ thể liên quan đến đóng góp quỹ (ngoài category cta chung)
            if (registryEntry?.category === 'transparency') return false;
            
            // Đối với category cta, kiểm tra xem có phải là transaction-related không
            // (Hiện tại hầu hết cta đều là transaction, trừ các gallery văn hoá)
            if (registryEntry?.category === 'cta' && !type.includes('gallery')) {
                return false;
            }
        }
        
        return true;
    });

    // ─── 4.1. Pre-calculate Theme Variables for Preview Injection ─────────────
    // For Admin Preview, we MUST inject these variables because LocaleLayout isn't present
    const tColors: any = overrideColors || (settings?.['theme_colors'] ? (typeof settings['theme_colors'] === 'string' ? JSON.parse(settings['theme_colors']) : settings['theme_colors']) : {});
    const primaryStr = hexToRgbString(tColors.primary || settings?.['theme_color_primary'], '245 158 11');
    const secondaryStr = hexToRgbString(tColors.secondary || settings?.['theme_color_secondary'], '92 64 51');
    const textStr = hexToRgbString(tColors.text || settings?.['theme_color_text'], '44 24 16');
    const accentStr = hexToRgbString(tColors.accent || settings?.['theme_color_accent'], '255 140 0');
    const bgStartStr = hexToRgbString(tColors.background || tColors.bgStart || settings?.['theme_background_start'], '254 249 243');
    const bgEndStr = hexToRgbString(tColors.bgEnd || settings?.['theme_background_end'], '253 245 235');

    const themeVars = {
        primary: primaryStr,
        secondary: secondaryStr,
        text: textStr,
        accent: accentStr,
        bgStart: bgStartStr,
        bgEnd: bgEndStr,
        primaryDark: tColors.primaryDark ? hexToRgbString(tColors.primaryDark, '218 165 32') : darkenRgbString(primaryStr, 0.85),
        primaryLight: tColors.primaryLight ? hexToRgbString(tColors.primaryLight, '253 183 26') : lightenRgbString(primaryStr, 0.25),
        hero: tColors.hero ? hexToRgbString(tColors.hero, '26 15 9') : (settings?.['theme_hero'] ? hexToRgbString(settings['theme_hero'], '26 15 9') : darkenRgbString(textStr, 0.55)),
        surface: tColors.surface ? hexToRgbString(tColors.surface, '250 250 247') : (settings?.['theme_surface'] ? hexToRgbString(settings['theme_surface'], '250 250 247') : lightenRgbString(bgStartStr, 0.4)),
        patternOpacity: tColors.opacity || settings?.['theme_pattern_opacity'] || '0.05'
    };

    // ─── 5. Render ────────────────────────────────────────────────────────────
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationSchema }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: placeSchema }} />

            {/* Injected Theme Variables for Preview Consistency */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                    :root {
                        --theme-primary: ${themeVars.primary};
                        --theme-secondary: ${themeVars.secondary};
                        --theme-text: ${themeVars.text};
                        --theme-accent: ${themeVars.accent};
                        --theme-bg-start: ${themeVars.bgStart};
                        --theme-bg-end: ${themeVars.bgEnd};
                        --theme-primary-dark: ${themeVars.primaryDark};
                        --theme-primary-light: ${themeVars.primaryLight};
                        --theme-hero: ${themeVars.hero};
                        --theme-surface: ${themeVars.surface};
                        --theme-pattern-opacity: ${themeVars.patternOpacity};
                    }
                `
                }}
            />

            {/* Preload ảnh Hero để cải thiện LCP điện thoại */}
            {heroSlides?.[0]?.image_url && (
                <link rel="preload" as="image" href={heroSlides[0].image_url} fetchPriority="high" />
            )}

            {/* Render thông minh: Mỗi Component được lazy-import (dynamic), chỉ load JS khi cần */}
            {filteredBlocks.map(block => {
                const type = block.type || `traditional_${block.id}`;
                const registryEntry = SECTION_REGISTRY[type as keyof typeof SECTION_REGISTRY];

                if (!registryEntry) {
                    // Môi trường DEV: Thông báo block không tìm thấy
                    if (process.env.NODE_ENV === 'development') {
                        return (
                            <div key={block.id} className="p-8 text-center text-red-500 bg-red-50 border-2 border-dashed border-red-300 text-sm">
                                ⚠️ Không tìm thấy Component trong Registry: <code>{type}</code>
                            </div>
                        );
                    }
                    return null; // Production: bỏ qua âm thầm
                }

                const Component = registryEntry.component;
                return (
                    // Suspense bao bên ngoài từng component để fallback skeleton độc lập
                    <Suspense key={block.id} fallback={<div className="animate-pulse bg-gray-100 w-full h-48" />}>
                        <Component
                            {...dataContext}          // Truyền tất cả context, Component tự pick props cần
                            {...(block.settings || {})} // Settings tuỳ chỉnh của block (customTitle, limit...)
                            data={block}               // TRUYỀN DATA PROP (CRITICAL: Fix sync issue)
                        />
                    </Suspense>
                );
            })}
        </>
    );
}
