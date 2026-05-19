import { BlockConfig } from '@/lib/types/layout-blocks';
import { BRAND_NAME_VI } from '@/lib/constants';


/**
 * Layout Presets — Bộ khối mặc định cho từng phong cách trang chủ
 * Admin chọn preset → tự động thay thế toàn bộ blocks state hiện tại
 */

export interface LayoutPreset {
    id: string;
    name: string;
    nameVi: string;
    emoji: string;
    description: string;
    blocks: BlockConfig[];
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
    // ─── TRADITIONAL ────────────────────────────────────────────────────────────
    {
        id: 'traditional',
        name: 'Traditional',
        nameVi: 'Truyền Thống',
        emoji: '🏛️',
        description: 'Carousel truyền thống, trang trọng và thân thuộc',
        blocks: [
            { id: 'tr-hero', type: 'traditional_hero', visible: true },
            { id: 'tr-intro', type: 'traditional_intro', visible: true },
            { id: 'tr-mosaic', type: 'traditional_mosaic', visible: true },
            { id: 'tr-news', type: 'traditional_news', visible: true },
            { id: 'tr-dharma', type: 'traditional_dharma', visible: true },
            { id: 'tr-events', type: 'traditional_events', visible: true },
            { id: 'tr-quote', type: 'traditional_dharma_quote', visible: true },
            { id: 'tr-cta', type: 'traditional_cta', visible: true },
            { id: 'tr-fb', type: 'facebook_feed', visible: false },
        ],
    },

    // ─── MODERN ─────────────────────────────────────────────────────────────────
    {
        id: 'modern',
        name: 'Modern',
        nameVi: 'Hiện Đại',
        emoji: '✨',
        description: 'Glassmorphism, tối màu sang trọng, ticker kinh chạy ngang',
        blocks: [
            { id: 'mo-hero', type: 'modern_hero', visible: true },
            { id: 'mo-ticker', type: 'modern_ticker', visible: true },
            { id: 'mo-news', type: 'modern_news', visible: true },
            { id: 'mo-dharma', type: 'modern_dharma', visible: true },
            { id: 'mo-cta', type: 'modern_cta', visible: true },
        ],
    },

    // ─── MINIMAL ────────────────────────────────────────────────────────────────
    {
        id: 'minimal',
        name: 'Minimal',
        nameVi: 'Tối Giản',
        emoji: '⬜',
        description: 'Chỉ typography, nhiều khoảng trắng, Swiss editorial style',
        blocks: [
            { id: 'mi-hero', type: 'minimal_hero', visible: true },
            { id: 'mi-news', type: 'minimal_news', visible: true },
            { id: 'mi-dharma', type: 'minimal_dharma', visible: true },
            { id: 'mi-events', type: 'minimal_events', visible: true },
            { id: 'mi-cta', type: 'minimal_cta', visible: true },
        ],
    },

    // ─── ZEN ────────────────────────────────────────────────────────────────────
    {
        id: 'zen',
        name: 'Zen',
        nameVi: 'Thiền Định',
        emoji: '🍃',
        description: 'Thiên nhiên tĩnh lặng, hơi thở, văn bản nhẹ nhàng',
        blocks: [
            { id: 'ze-hero', type: 'zen_hero', visible: true },
            { id: 'ze-breathing', type: 'zen_breathing', visible: true },
            { id: 'ze-study', type: 'zen_study', visible: true },
            { id: 'ze-dharma', type: 'zen_dharma', visible: true },
            { id: 'ze-news', type: 'zen_news', visible: true },
            { id: 'ze-cta', type: 'zen_cta', visible: true },
        ],
    },

    // ─── LOTUS ──────────────────────────────────────────────────────────────────
    {
        id: 'lotus',
        name: 'Lotus',
        nameVi: 'Hoa Sen',
        emoji: '🪷',
        description: 'Hoa văn Khmer đỏ son, collage ảnh nghệ thuật, hoa sứ',
        blocks: [
            { id: 'lo-hero', type: 'lotus_hero', visible: true },
            { id: 'lo-events', type: 'lotus_events', visible: true },
            { id: 'lo-dharma', type: 'lotus_dharma', visible: true },
            { id: 'lo-news', type: 'lotus_news', visible: true },
            { id: 'lo-gallery', type: 'lotus_gallery', visible: true },
        ],
    },

    // ─── ANGKOR ─────────────────────────────────────────────────────────────────
    {
        id: 'angkor',
        name: 'Angkor',
        nameVi: 'Angkor',
        emoji: '🏯',
        description: 'Kiến trúc cổ kính, serif stone, nâu đá trang nghiêm',
        blocks: [
            { id: 'an-hero', type: 'angkor_hero', visible: true },
            { id: 'an-arch', type: 'angkor_arch', visible: true },
            { id: 'an-timeline', type: 'angkor_timeline', visible: true },
            { id: 'an-dharma', type: 'angkor_dharma', visible: true },
            { id: 'an-newspaper', type: 'angkor_newspaper', visible: true },
        ],
    },

    // ─── SUNRISE ────────────────────────────────────────────────────────────────
    {
        id: 'sunrise',
        name: 'Sunrise',
        nameVi: 'Bình Minh',
        emoji: '🌅',
        description: 'Màu cam vàng bình minh, dòng sông Mekong, ấm áp cộng đồng',
        blocks: [
            { id: 'su-hero', type: 'sunrise_hero', visible: true },
            { id: 'su-morning', type: 'sunrise_morning', visible: true },
            { id: 'su-news', type: 'sunrise_news', visible: true },
            { id: 'su-events', type: 'sunrise_events', visible: true },
            { id: 'su-dharma', type: 'sunrise_dharma', visible: true },
        ],
    },

    // ─── FESTIVAL ───────────────────────────────────────────────────────────────
    {
        id: 'festival',
        name: 'Festival',
        nameVi: 'Lễ Hội',
        emoji: '🎊',
        description: 'Đếm ngược Tết Khmer, gradient rực rỡ, glow neon sôi động',
        blocks: [
            { id: 'fe-hero', type: 'festival_hero', visible: true },
            { id: 'fe-events', type: 'festival_events', visible: true },
            { id: 'fe-dharma', type: 'festival_dharma', visible: true },
            { id: 'fe-news', type: 'festival_news', visible: true },
            { id: 'fe-gallery', type: 'festival_gallery', visible: true },
            { id: 'fe-cta', type: 'festival_cta', visible: true },
        ],
    },
    // ─── SECURE MULTI-TENANT SAAS (SYSTEM PRESET) ──────────────────────────────────────────
    {
        id: 'mcaaron',
        name: BRAND_NAME_VI,
        nameVi: 'Doanh Nghiệp Xã Hội',
        emoji: '🤝',
        description: 'Giao diện chuyên biệt cho tác động xã hội, minh bạch và đội ngũ',
        blocks: [
            { id: 'mc-hero', type: 'mcaaron_hero', visible: true },
            { id: 'mc-impact', type: 'impact_dashboard', visible: true },
            { id: 'mc-timeline', type: 'transparency_timeline', visible: true },
            { id: 'mc-founders', type: 'founder_section', visible: true },
            { id: 'mc-network', type: 'network_section', visible: true },
            { id: 'mc-news', type: 'modern_news', visible: true },
            { id: 'mc-cta', type: 'traditional_cta', visible: true },
        ],
    },
    // ─── CORPORATE / ENTERPRISE PREMIUM PRESET ──────────────────────────────────────────
    {
        id: 'corporate',
        name: 'Corporate (Enterprise)',
        nameVi: 'Tập Đoàn / Doanh Nghiệp',
        emoji: '🏢',
        description: 'Giao diện Tập đoàn & Doanh nghiệp toàn cầu, hiện đại, minh bạch & tin cậy cao',
        blocks: [
            { id: 'corp-hero', type: 'mcaaron_hero', visible: true },
            { id: 'corp-stats', type: 'mcaaron_statistics', visible: true },
            { id: 'corp-services', type: 'mcaaron_services', visible: true },
            { id: 'corp-transparency', type: 'mcaaron_transparency', visible: true },
            { id: 'corp-founders', type: 'mcaaron_founder', visible: true },
            { id: 'corp-news', type: 'mcaaron_news', visible: true },
            { id: 'corp-network', type: 'mcaaron_network', visible: true },
        ],
    },
    // ─── INK — Editorial Magazine Á Đông ────────────────────────────────────────
    {
        id: 'ink',
        name: 'Ink',
        nameVi: 'Tạp Chí Editorial',
        emoji: '🖋️',
        description: 'Trắng tinh + đen ink, bố cục tạp chí cao cấp Á Đông, mobile-first',
        blocks: [
            { id: 'ink-hero', type: 'ink_hero', visible: true },
            { id: 'ink-news', type: 'ink_feature_story', visible: true },
            { id: 'ink-dharma', type: 'ink_dharma_band', visible: true },
            { id: 'ink-quote', type: 'ink_quote_banner', visible: true },
            { id: 'ink-events', type: 'ink_event_grid', visible: true },
            { id: 'ink-contact', type: 'ink_contact_strip', visible: true },
        ],
    },
    // ─── THERAVĀDA — Pristine & Pure ───────────────────────────────────────────
    {
        id: 'theravada',
        name: 'Theravāda',
        nameVi: 'Nguyên Thủy (Tĩnh Lặng)',
        emoji: '☸️',
        description: 'Thanh tịnh, ấm áp, typography Merriweather, nền kem vàng chi nhánh.',
        blocks: [
            { id: 'th-hero', type: 'thera_hero', visible: true },
            { id: 'th-news', type: 'thera_feature', visible: true },
            { id: 'th-dharma', type: 'thera_dharma_talks', visible: true },
            { id: 'th-quote', type: 'thera_quote_banner', visible: true },
            { id: 'th-events', type: 'thera_event_grid', visible: true },
            { id: 'th-contact', type: 'thera_contact_strip', visible: true },
        ],
    },
    // ─── STITCH — Digital Zenith ──────────────────────────────────────────────
    {
        id: 'stitch',
        name: 'Stitch (Digital Zenith)',
        nameVi: 'Stitch (Đỉnh Cao Kỹ Thuật Số)',
        emoji: '🤖',
        description: 'Phong cách kỹ thuật số, hiện đại và minh bạch cao.',
        blocks: [
            { id: 'st-hero', type: 'stitch-hero', visible: true },
            { id: 'st-stats', type: 'stitch-stats', visible: true },
            { id: 'st-nodes', type: 'stitch-nodes', visible: true },
            { id: 'st-events', type: 'stitch-events', visible: true },
            { id: 'st-footer-strip', type: 'stitch-footer-strip', visible: true },
        ],
    },
];
