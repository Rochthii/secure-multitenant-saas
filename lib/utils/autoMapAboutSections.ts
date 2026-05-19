import type { AboutSectionRow } from '@/lib/cache/queries';

/**
 * Smart auto-mapping cho các block Giới thiệu (About/Mosaic).
 * Tự động tìm các bài viết phù hợp từ danh sách `aboutSections` bằng
 * cơ chế ưu tiên (priority cascade):
 *   1. Prop riêng (nếu được truyền trực tiếp từ page builder)
 *   2. Key chính xác từ cài đặt chi nhánh (settings)
 *   3. Partial match với từ khoá ngữ nghĩa
 *   4. Fallback theo vị trí
 */

export interface AutoMappedAboutSections {
    introSection: AboutSectionRow | null;
    abbotSection: AboutSectionRow | null;
    architectureSection: AboutSectionRow | null;
    remainingSections: AboutSectionRow[];
}

function findSection(
    sections: AboutSectionRow[],
    configKey: string,
    keywords: string[]
): AboutSectionRow | null {
    // 1. Exact key match
    let found = sections.find(s => s.key === configKey);
    if (found) return found;

    // 2. Keyword match (any)
    for (const kw of keywords) {
        found = sections.find(s => s.key?.toLowerCase().includes(kw));
        if (found) return found;
    }

    // 3. Title match (Vietnamese)
    for (const kw of keywords) {
        found = sections.find(s => s.title_vi?.toLowerCase().includes(kw));
        if (found) return found;
    }

    return null;
}

export function autoMapAboutSections(
    aboutSections: AboutSectionRow[] | undefined | null,
    overrides?: {
        abbotSection?: AboutSectionRow | null;
        introSection?: AboutSectionRow | null;
        architectureSection?: AboutSectionRow | null;
    },
    settings?: Record<string, any>
): AutoMappedAboutSections {
    const sections = aboutSections || [];

    const abbotKey = settings?.['about_abbot_key'] || 'truyen-thua-tiep-noi/tru-tri-duong-nhiem';
    const introKey = settings?.['about_intro_key'] || 'dong-chay-lich-su';
    const archKey = settings?.['about_architecture_key'] || 'di-san-nghe-thuat/kien-truc-dieu-khac';

    const intro = overrides?.introSection ??
        findSection(sections, introKey, ['lich-su', 'lich su', 'gioi-thieu', 'nguon-goc', 'dong-chay']) ??
        sections.find(s => !s.key?.includes('/') && s.image_url) ??
        sections[0] ?? null;

    const abbot = overrides?.abbotSection ??
        findSection(sections, abbotKey, ['tru-tri', 'truyen-thua', 'hoa-thuong', 'abbot', 'su-tru-tri']) ??
        sections.find(s => s !== intro && s.image_url) ?? null;

    const arch = overrides?.architectureSection ??
        findSection(sections, archKey, ['kien-truc', 'dieu-khac', 'architecture', 'art', 'nghe-thuat']) ??
        sections.find(s => s !== intro && s !== abbot && s.image_url) ?? null;

    const usedIds = new Set([intro?.id, abbot?.id, arch?.id].filter(Boolean));
    const remainingSections = sections.filter(s => !usedIds.has(s.id));

    return { introSection: intro, abbotSection: abbot, architectureSection: arch, remainingSections };
}
