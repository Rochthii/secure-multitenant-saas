import { BlockConfig } from '@/lib/types/layout-blocks';
import { BRAND_NAME_VI } from '@/lib/constants';

/**
 * Layout Presets — Bộ khối mặc định cho từng phong cách trang chủ doanh nghiệp
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
    // ─── SECURE MULTI-TENANT SAAS (SYSTEM PRESET) ──────────────────────────────────────────
    {
        id: 'mcaaron',
        name: BRAND_NAME_VI,
        nameVi: 'Doanh Nghiệp Xã Hội',
        emoji: '🤝',
        description: 'Giao diện chuyên biệt cho doanh nghiệp tác động xã hội, minh bạch và đội ngũ chuyên nghiệp',
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
        nameVi: 'Tập Đoàn & Doanh Nghiệp',
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
    // ─── MODERN ─────────────────────────────────────────────────────────────────
    {
        id: 'modern',
        name: 'Modern SaaS',
        nameVi: 'Hiện Đại & Đột Phá',
        emoji: '⚡',
        description: 'Glassmorphism cao cấp, chế độ tối màu công nghệ, dải thông tin truyền thông liên tục',
        blocks: [
            { id: 'mo-hero', type: 'modern_hero', visible: true },
            { id: 'mo-ticker', type: 'modern_ticker', visible: true },
            { id: 'mo-news', type: 'modern_news', visible: true },
            { id: 'mo-dharma', type: 'modern_dharma', visible: true }, // Tài liệu & SOP Modern
            { id: 'mo-cta', type: 'modern_cta', visible: true },
        ],
    },

    // ─── MINIMAL ────────────────────────────────────────────────────────────────
    {
        id: 'minimal',
        name: 'Minimal Clean',
        nameVi: 'Tối Giản Sang Trọng',
        emoji: '📄',
        description: 'Bố cục Swiss editorial cao cấp, chú trọng Typography, thoáng đãng và tinh tế',
        blocks: [
            { id: 'mi-hero', type: 'minimal_hero', visible: true },
            { id: 'mi-news', type: 'minimal_news', visible: true },
            { id: 'mi-dharma', type: 'minimal_dharma', visible: true }, // Tài liệu & SOP Minimal
            { id: 'mi-events', type: 'minimal_events', visible: true },
            { id: 'mi-cta', type: 'minimal_cta', visible: true },
        ],
    },

    // ─── STITCH — Digital Zenith ──────────────────────────────────────────────
    {
        id: 'stitch',
        name: 'Stitch (Digital Zenith)',
        nameVi: 'Stitch (Đỉnh Cao Kỹ Thuật Số)',
        emoji: '🤖',
        description: 'Phong cách Fintech & Công nghệ, trực quan hóa mạng lưới liên kết kỹ thuật số',
        blocks: [
            { id: 'st-hero', type: 'stitch-hero', visible: true },
            { id: 'st-stats', type: 'stitch-stats', visible: true },
            { id: 'st-nodes', type: 'stitch-nodes', visible: true },
            { id: 'st-events', type: 'stitch-events', visible: true },
            { id: 'st-footer-strip', type: 'stitch-footer-strip', visible: true },
        ],
    },

    // ─── INK — Editorial Magazine Á Đông ────────────────────────────────────────
    {
        id: 'ink',
        name: 'Ink Editorial',
        nameVi: 'Tạp Chí Ấn Phẩm',
        emoji: '🖋️',
        description: 'Trắng tinh + đen ink tối giản nghệ thuật, cấu trúc tạp chí tri thức & triết lý doanh nghiệp',
        blocks: [
            { id: 'ink-hero', type: 'ink_hero', visible: true },
            { id: 'ink-news', type: 'ink_feature_story', visible: true },
            { id: 'ink-dharma', type: 'ink_dharma_band', visible: true }, // Dải học liệu & SOP
            { id: 'ink-quote', type: 'ink_quote_banner', visible: true },
            { id: 'ink-events', type: 'ink_event_grid', visible: true },
            { id: 'ink-contact', type: 'ink_contact_strip', visible: true },
        ],
    },
];
