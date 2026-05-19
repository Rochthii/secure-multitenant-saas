import { SECTION_REGISTRY } from '@/lib/blocks-registry';

// Types cho Visual Page Builder
export type BlockType = keyof typeof SECTION_REGISTRY;

export interface BlockConfig {
    id: string; // Unique ID (UUID) sinh ngẫu nhiên cho mỗi khối khi được kéo vào Layout
    type: BlockType; // Loại component, map với SECTION_REGISTRY
    visible: boolean;
    settings?: Record<string, any>; // Các cài đặt riêng của khối (hiển thị tiêu đề, số lượng item, màu sắc phụ...)
    order?: number;
}

export const DEFAULT_LAYOUT_BLOCKS: BlockConfig[] = [
    { id: 'default-hero', type: 'traditional_hero', visible: true },
    { id: 'default-intro', type: 'traditional_intro', visible: true },
    { id: 'default-news', type: 'traditional_news', visible: true },
    { id: 'default-events', type: 'traditional_events', visible: true },
];

export const DEFAULT_COMPANY_BLOCKS: BlockConfig[] = [
    { id: 'company-hero', type: 'mcaaron_hero', visible: true },
    { id: 'company-statistics', type: 'mcaaron_statistics', visible: true },
    { id: 'company-intro', type: 'mcaaron_intro', visible: true },
    { id: 'company-services', type: 'mcaaron_services', visible: true },
    { id: 'company-transparency', type: 'mcaaron_transparency', visible: true },
    { id: 'company-cta', type: 'mcaaron_cta', visible: true },
    { id: 'company-news', type: 'mcaaron_news', visible: true },
    { id: 'company-network', type: 'mcaaron_network', visible: true },
];
