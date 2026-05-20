/**
 * @file lib/navigation/index.ts
 * @description Logic điều hướng dùng chung cho tất cả Header components.
 *
 * Tất cả header variants (traditional, thera, minimal, modern, lotus, zen,
 * sunrise, festival, angkor, ink, mcaaron) đều import từ đây thay vì tự
 * định nghĩa lại. Thay đổi logic menu ở đây = áp dụng cho toàn hệ thống.
 */

import type { CategoryNode } from '@/lib/cache/queries';
import { BlockConfig, BlockType } from '@/lib/types/layout-blocks';
import { SECTION_REGISTRY } from '@/lib/blocks-registry';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type PageNode = {
    id: string;
    slug: string;
    title_vi: string;
    title_en?: string | null;
    title_km?: string | null;
    parent_id?: string | null;
    show_in_menu?: boolean;
    children?: PageNode[];
};

export type NavItem = {
    nameKey?: string;
    node?: CategoryNode;
    href: string;
    variant?: 'default' | 'button' | 'cta';
    children?: NavItem[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Chuyển CategoryNode từ DB thành NavItem đệ quy */
export const mapCategoryToNavItem = (node: CategoryNode, basePath: string): NavItem => ({
    node,
    href: `${basePath}/${node.slug}`,
    children:
        node.children && node.children.length > 0
            ? node.children.map(child => mapCategoryToNavItem(child, basePath))
            : undefined,
});

/** Chuyển PageNode thành NavItem */
export const mapPageToNavItem = (node: PageNode): NavItem => ({
    nameKey: node.title_vi,
    node: node as any,
    href: `/${node.slug}`,
    children:
        node.children && node.children.filter((c: PageNode) => c.show_in_menu).length > 0
            ? node.children
                  .filter((c: PageNode) => c.show_in_menu)
                  .map((child: PageNode) => mapPageToNavItem(child))
            : undefined,
});

/** Lấy label đa ngôn ngữ của NavItem */
export const getNavLabel = (item: NavItem, tNav: any, locale: string): string => {
    // PageNode thì ưu tiên title_xx
    if (item.node && 'title_vi' in item.node) {
        const page = item.node as any;
        if (locale === 'en' && page.title_en) return page.title_en;
        if (locale === 'km' && page.title_km) return page.title_km;
        return page.title_vi;
    }

    if (item.nameKey) {
        try {
            return tNav(item.nameKey);
        } catch {
            return item.nameKey;
        }
    }

    if (item.node) {
        if (locale === 'en' && item.node.name_en) return item.node.name_en;
        if (locale === 'km' && item.node.name_km) return item.node.name_km;
        return item.node.name_vi;
    }

    return '';
};

// ─────────────────────────────────────────────────────────────────────────────
// Core: buildNavigation
// ─────────────────────────────────────────────────────────────────────────────

export interface BuildNavigationOptions {
    categoriesTree?: {
        news: CategoryNode[];
        dharma: CategoryNode[];
        documents: CategoryNode[];
        transactions?: CategoryNode[];
    };
    pagesTree?: PageNode[];
    aboutSectionsTree?: CategoryNode[];
    layoutBlocks?: BlockConfig[];
    modulesConfig?: Record<string, boolean>;
    isCompany?: boolean;
    hasProjects?: boolean;
    /**
     * Cấu hình bật/tắt từng mục Header từ Admin "Cấu hình Menu".
     * Key: 'home' | 'about' | 'news' | 'dharma' | 'documents' | 'transaction' | 'contact'
     * false = ẩn bất kể layoutBlocks; undefined/true = dùng logic layoutBlocks.
     */
    navVisibility?: Record<string, boolean>;
}

export function buildNavigation({
    categoriesTree,
    pagesTree,
    aboutSectionsTree,
    layoutBlocks = [],
    modulesConfig,
    isCompany,
    hasProjects,
    navVisibility = {},
}: BuildNavigationOptions): NavItem[] {
    // Lớp 1: layoutBlocks — mục có block visible không
    const isCategoryVisible = (category: string): boolean =>
        (layoutBlocks || []).some(block => {
            const blockType = block.type || (block.id as BlockType);
            const registryEntry = SECTION_REGISTRY[blockType as keyof typeof SECTION_REGISTRY];
            return registryEntry?.category === category && block.visible !== false;
        });

    // Lớp 2: navVisibility — admin tắt hẳn thì ẩn, bất kể layoutBlocks
    const isMenuItemVisible = (key: string, fallback: boolean): boolean => {
        if (navVisibility[key] === false) return false;
        if (navVisibility[key] === true) return true;
        return fallback;
    };

    const nav: NavItem[] = [{ nameKey: 'home', href: '/' }];

    // ── DOANH NGHIỆP B2B SAAS (Corporate Navigation) ───────────────────────────
    
    // Giới thiệu doanh nghiệp
    if (isMenuItemVisible('about', true)) {
        nav.push({ nameKey: 'about', href: '/gioi-thieu' });
    }

    // Tài liệu & SOP nội bộ
    if (isMenuItemVisible('documents', true)) {
        nav.push({
            nameKey: 'documents',
            href: '/documents',
            children: categoriesTree?.documents?.map(cat => mapCategoryToNavItem(cat, '/documents')) || 
                      categoriesTree?.dharma?.map(cat => mapCategoryToNavItem(cat, '/documents')),
        });
    }

    // Dự án & Giải pháp AI RAG
    if (hasProjects || isMenuItemVisible('projects', true)) {
        nav.push({ nameKey: 'projects', href: '/du-an' });
    }

    // Tin tức & Truyền thông
    if (isMenuItemVisible('news', true)) {
        nav.push({
            nameKey: 'news',
            href: '/tin-tuc',
            children: categoriesTree?.news?.map(cat => mapCategoryToNavItem(cat, '/tin-tuc')),
        });
    }

    // Liên hệ hợp tác
    if (isMenuItemVisible('contact', true)) {
        nav.push({ nameKey: 'contact', href: '/lien-he' });
    }

    return nav;
}
