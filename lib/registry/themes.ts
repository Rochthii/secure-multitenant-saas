import dynamic from 'next/dynamic';

// HELPER: Dynamic Loader
const d = (loader: () => Promise<any>, name?: string) => {
    return dynamic(async () => {
        const mod = await loader();
        return name ? mod[name] : (mod.default || mod);
    }, { ssr: true });
};

export const THEME_REGISTRY: Record<string, any> = {
    // LOTUS
    'lotus_hero': { name: 'Hero Hoa Sen Collage', description: 'Ghép khối ảnh nghệ thuật hình hoa sen', category: 'hero', group: 'HERO', icon: '🎬', component: d(() => import('@/components/sections/lotus/LotusCollageHero'), 'LotusCollageHero'), requiredData: ['heroSlides', 'settings'] },
    'lotus_events': { name: 'Sự Kiện Sen Cuộn', description: 'Thẻ sự kiện cuộn ngang nghệ thuật', category: 'events', group: 'EVENTS', icon: '📅', component: d(() => import('@/components/sections/lotus/LotusEventScroll'), 'LotusEventScroll'), requiredData: ['locale', 'upcomingEvents'] },
    'lotus_gallery': { name: 'Gallery Văn Hoá Lotus', description: 'Masonry ảnh nghệ thuật tu viện', category: 'cta', group: 'INTRO', icon: '🖼', component: d(() => import('@/components/sections/lotus/LotusCultureGallery'), 'LotusCultureGallery') },
    'lotus_dharma': { name: 'Poster Pháp Thoại', description: 'Phong cách poster dọc ghép nhạc', category: 'dharma', group: 'DHARMA', icon: '📿', component: d(() => import('@/components/sections/lotus/LotusDharmaPoster'), 'LotusDharmaPoster'), requiredData: ['dharmaTalks'] },
    'lotus_news': { name: 'Tin Tức Lotus', description: 'Khối vuông bo tròn dày hoa sen', category: 'news', group: 'NEWS', icon: '📰', component: d(() => import('@/components/sections/lotus/LotusNewsGrid'), 'LotusNewsGrid'), requiredData: ['locale', 'news'] },

    // ANGKOR
    'angkor_hero': { name: 'Hero Angkor Parallax', description: 'Ảnh toàn cảnh cố định cuốn hút', category: 'hero', group: 'HERO', icon: '🎬', component: d(() => import('@/components/sections/angkor/AngkorParallaxHero'), 'AngkorParallaxHero'), requiredData: ['heroSlides', 'settings'] },
    'angkor_arch': { name: 'Kiến Trúc Angkor', description: 'Nổi bật vòm cửa nghệ thuật', category: 'about', group: 'INTRO', icon: '🏛', component: d(() => import('@/components/sections/angkor/AngkorArchShowcase'), 'AngkorArchShowcase'), requiredData: ['tenantId'] },
    'angkor_timeline': { name: 'Dòng Thời Gian Angkor', description: 'Hiển thị như một trục lịch sử', category: 'events', group: 'EVENTS', icon: '📅', component: d(() => import('@/components/sections/angkor/AngkorHistoryTimeline'), 'AngkorHistoryTimeline'), requiredData: ['tenantId'] },
    'angkor_dharma': { name: 'Cuộn Kinh Angkor', description: 'Font chữ cổ và cuộn ngang', category: 'dharma', group: 'DHARMA', icon: '📿', component: d(() => import('@/components/sections/angkor/AngkorDharmaScroll'), 'AngkorDharmaScroll'), requiredData: ['dharmaTalks'] },
    'angkor_newspaper': { name: 'Báo Chí Angkor', description: 'Phong cách báo giấy cổ điển', category: 'news', group: 'NEWS', icon: '📰', component: d(() => import('@/components/sections/angkor/AngkorNewspaper'), 'AngkorNewspaper'), requiredData: ['locale', 'news'] },

    // ZEN
    'zen_hero': { name: 'Hero Zen Nature', description: 'Cảnh sắc thiên nhiên tĩnh lặng', category: 'hero', group: 'HERO', icon: '🎬', component: d(() => import('@/components/sections/zen/ZenNatureHero'), 'ZenNatureHero'), requiredData: ['heroSlides', 'settings'] },
    'zen_study': { name: 'Khoá Tu Zen', description: 'Thẻ khoá tu tập trọng tâm', category: 'events', group: 'EVENTS', icon: '📅', component: d(() => import('@/components/sections/zen/ZenStudyCards'), 'ZenStudyCards'), requiredData: ['tenantId'] },
    'zen_dharma': { name: 'Player Pháp Zen', description: 'Nền lá bồ đề mờ bình yên', category: 'dharma', group: 'DHARMA', icon: '📿', component: d(() => import('@/components/sections/zen/ZenDharmaPlayer'), 'ZenDharmaPlayer'), requiredData: ['dharmaTalks'] },
    'zen_news': { name: 'Tin Tức Thiền Zen', description: 'Lưới tin nhẹ nhàng, nhiều khoảng trắng', category: 'news', group: 'NEWS', icon: '📰', component: d(() => import('@/components/sections/zen/ZenNewsSection'), 'ZenNewsSection'), requiredData: ['locale', 'news'] },
    'zen_cta': { name: 'CTA An Lạc', description: 'Gốc cây bồ đề tĩnh lặng', category: 'quotes', group: 'QUOTE_BANNER', icon: '🎯', component: d(() => import('@/components/sections/zen/ZenCTA'), 'ZenCTA') },

    // SUNRISE
    'sunrise_hero': { name: 'Hero Sunrise Panorama', description: 'Bình minh sáng chói dọc sông', category: 'hero', group: 'HERO', icon: '🎬', component: d(() => import('@/components/sections/sunrise/SunrisePanoramaHero'), 'SunrisePanoramaHero'), requiredData: ['heroSlides', 'settings'] },
    'sunrise_morning': { name: 'Kinh Sáng Bình Minh', description: 'Card báo thức giờ tụng kinh', category: 'about', group: 'INTRO', icon: '🌅', component: d(() => import('@/components/sections/sunrise/SunriseMorningBanner'), 'SunriseMorningBanner') },
    'sunrise_news': { name: 'Tin Tức Mặt Trời', description: 'Card màu cam ấm áp', category: 'news', group: 'NEWS', icon: '📰', component: d(() => import('@/components/sections/sunrise/SunriseCommunityNews'), 'SunriseCommunityNews'), requiredData: ['locale', 'news'] },
    'sunrise_events': { name: 'Lịch Tháng Sunrise', description: 'Grid lịch tháng màu ươm nắng', category: 'events', group: 'EVENTS', icon: '📅', component: d(() => import('@/components/sections/sunrise/SunriseEventCalendar'), 'SunriseEventCalendar'), requiredData: ['locale', 'upcomingEvents'] },
    'sunrise_dharma': { name: 'Danh sách kinh Sunrise', description: 'Danh sách cam rực rỡ', category: 'dharma', group: 'DHARMA', icon: '📿', component: d(() => import('@/components/sections/sunrise/SunriseDharmaSection'), 'SunriseDharmaSection'), requiredData: ['dharmaTalks'] },

    // FESTIVAL
    'festival_hero': { name: 'Hero Festival Countdown', description: 'Đếm ngược 3D đến lễ hội', category: 'hero', group: 'HERO', icon: '🎬', component: d(() => import('@/components/sections/festival/FestivalCountdownHero'), 'FestivalCountdownHero'), requiredData: ['heroSlides', 'settings', 'tenantId'] },
    'festival_events': { name: 'Sự Kiện Lễ Hội', description: 'Khối nổi bật hoạt động rào rạt', category: 'events', group: 'EVENTS', icon: '📅', component: d(() => import('@/components/sections/festival/FestivalEventCards'), 'FestivalEventCards'), requiredData: ['locale'] },
    'festival_dharma': { name: 'Sân Khấu Festival', description: 'Glow neon sôi động cho video', category: 'dharma', group: 'DHARMA', icon: '📿', component: d(() => import('@/components/sections/festival/FestivalDharmaPlayer'), 'FestivalDharmaPlayer'), requiredData: ['dharmaTalks'] },
    'festival_gallery': { name: 'Gallery Hội Hè', description: 'Hình ảnh náo nhiệt màu sắc', category: 'cta', group: 'INTRO', icon: '🖼', component: d(() => import('@/components/sections/festival/FestivalGallery'), 'FestivalGallery') },
    'festival_news': { name: 'Tin Lễ Hội', description: 'Nền gradient tím sậm rực rỡ', category: 'news', group: 'NEWS', icon: '📰', component: d(() => import('@/components/sections/festival/FestivalNewsSection'), 'FestivalNewsSection'), requiredData: ['locale', 'news'] },
    'festival_cta': { name: 'Quyên Góp Festival', description: 'Banner đèn lồng rực rỡ', category: 'quotes', group: 'QUOTE_BANNER', icon: '🎯', component: d(() => import('@/components/sections/festival/FestivalTransactionCTA'), 'FestivalTransactionCTA') },

    // INK
    'ink_hero': { name: 'Ink Hero', description: 'Split 60/40 ảnh trái | text editorial phải', category: 'hero', group: 'HERO', icon: '🎬', component: d(() => import('@/components/sections/ink/InkHero'), 'InkHero'), requiredData: ['heroSlides', 'settings'] },
    'ink_feature_story': { name: 'Ink Feature Story', description: 'Tin nổi bật — 1 main + 2 phụ editorial', category: 'news', group: 'NEWS', icon: '📰', component: d(() => import('@/components/sections/ink/InkFeatureStory'), 'InkFeatureStory'), requiredData: ['news'] },
    'ink_dharma_band': { name: 'Ink Dharma Band', description: 'Pháp thoại numbered, nền đen full-width', category: 'dharma', group: 'DHARMA', icon: '📿', component: d(() => import('@/components/sections/ink/InkDharmaBand'), 'InkDharmaBand'), requiredData: ['dharmaTalks'] },
    'ink_event_grid': { name: 'Ink Event Grid', description: 'Grid sự kiện 3-cột, border-top hover đỏ', category: 'events', group: 'EVENTS', icon: '📅', component: d(() => import('@/components/sections/ink/InkEventGrid'), 'InkEventGrid'), requiredData: ['upcomingEvents'] },
    'ink_quote_banner': { name: 'Ink Quote Banner', description: 'Câu kinh centered — plug-and-play', category: 'quotes', group: 'QUOTE_BANNER', icon: '💬', component: d(() => import('@/components/sections/ink/InkQuoteBanner'), 'InkQuoteBanner') },
    'ink_contact_strip': { name: 'Ink Contact Strip', description: 'Footer strip đen 3-cột — địa chỉ, giờ lễ, CTA', category: 'quotes', group: 'QUOTE_BANNER', icon: '🎯', component: d(() => import('@/components/sections/ink/InkContactStrip'), 'InkContactStrip'), requiredData: ['settings'] },

    // THERAVĀDA
    'thera_hero': { name: 'Thera Hero', description: 'Split 50/50 ảnh | text, serif typography', category: 'hero', group: 'HERO', icon: '🎬', component: d(() => import('@/components/sections/thera/TheraHero'), 'TheraHero'), requiredData: ['heroSlides', 'settings'] },
    'thera_feature': { name: 'Thera Feature', description: 'Tin tức editorial 1 main + 2 phụ dọc', category: 'news', group: 'NEWS', icon: '📰', component: d(() => import('@/components/sections/thera/TheraFeature'), 'TheraFeature'), requiredData: ['news'] },
    'thera_dharma_talks': { name: 'Thera Dharma Talks', description: 'Nền tối nâu gỗ, số thứ tự vàng lớn', category: 'dharma', group: 'DHARMA', icon: '📿', component: d(() => import('@/components/sections/thera/TheraDharmaTalks'), 'TheraDharmaTalks'), requiredData: ['dharmaTalks'] },
    'thera_event_grid': { name: 'Thera Event Grid', description: 'Grid sự kiện 3-cột nền kem nhạt', category: 'events', group: 'EVENTS', icon: '📅', component: d(() => import('@/components/sections/thera/TheraEventGrid'), 'TheraEventGrid'), requiredData: ['upcomingEvents'] },
    'thera_quote_banner': { name: 'Thera Quote Banner', description: 'Câu kinh centered, nền nâu gỗ', category: 'quotes', group: 'QUOTE_BANNER', icon: '💬', component: d(() => import('@/components/sections/thera/TheraQuoteBanner'), 'TheraQuoteBanner') },
    'thera_contact_strip': { name: 'Thera Contact Strip', description: 'Footer strip nâu tối 3-cột', category: 'quotes', group: 'QUOTE_BANNER', icon: '🎯', component: d(() => import('@/components/sections/thera/TheraContactStrip'), 'TheraContactStrip'), requiredData: ['settings'] },
};
