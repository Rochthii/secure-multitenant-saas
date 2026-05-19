import React from 'react';
import { getTranslations } from 'next-intl/server';
import {
    getCachedCategoriesTree,
    getCachedDharmaTalksByCategoryGroup,
    getCachedUncategorizedDharmaTalks,
    getCachedDharmaTalkTags
} from '@/lib/cache/queries';
import { createClient } from '@supabase/supabase-js';
import { TalksGrid } from '@/components/phap-thoai/talks-grid';
import { KhmerPatternBg } from '@/components/ui/khmer-pattern-bg';
import { CategorySectionHeader } from '@/components/ui/category-section-header';
import { Link } from '@/i18n/routing';
import { getTenantConfig } from '@/lib/tenant';

// force-dynamic: trang dùng searchParams nên phải dynamic.
// Dữ liệu vẫn được cache qua unstable_cache (permanent) trong queries.ts.
export const dynamic = 'force-dynamic';


export async function generateMetadata({ params }: { params: Promise<{ domain: string; locale: string }> }) {
    const { domain, locale } = await params;
    const t = await getTranslations({ locale, namespace: 'DharmaTalks' });
    const tenant = await getTenantConfig(domain);
    const siteName = tenant?.name || "Multi-tenant Ecosystem";

    return {
        title: `${t('title')} | ${siteName}`,
        description: t('description'),
    };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function fetchTagsForTalks(supabase: any, talks: any[]) {
    if (!talks || talks.length === 0) return talks;
    try {
        const talkIds = talks.map((t: any) => t.id);
        const tagsMap = await getCachedDharmaTalkTags(talkIds);
        return talks.map((t: any) => ({ ...t, tags: tagsMap[t.id] || [] }));
    } catch {
        return talks.map((t: any) => ({ ...t, tags: [] }));
    }
}

// ─── Async Sub-Component (FIX CHO LỖI 500) ─────────────────────────────────
async function DharmaCategoryBlock({
    cat,
    categoryIds,
    tenantId,
    locale,
    selectedCategory,
    supabase,
}: {
    cat: any;
    categoryIds: string[];
    tenantId?: string;
    locale: string;
    selectedCategory: string;
    supabase: any;
}) {
    try {
        const talksData = await getCachedDharmaTalksByCategoryGroup(categoryIds, 6, tenantId);
        if (!talksData || talksData.length === 0) return null;

        const talksWithTags = await fetchTagsForTalks(supabase, talksData);
        const showSeeMore = talksData.length >= 6 && selectedCategory !== cat.slug;

        return (
            <section className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                <CategorySectionHeader category={cat} baseHref="/documents" />
                <div className="mt-6">
                    <TalksGrid talks={talksWithTags as any} />
                </div>
                {showSeeMore && (
                    <div className="mt-8 flex justify-end">
                        <Link
                            href={`/documents?category=${cat.slug}`}
                            className="text-sm font-semibold text-gold-dark hover:text-coffee-dark uppercase tracking-wider transition-colors inline-block pb-1 border-b border-transparent hover:border-coffee-dark"
                        >
                            Xem thêm {locale === 'vi' ? cat.name_vi : cat.name_km || cat.name_vi} →
                        </Link>
                    </div>
                )}
            </section>
        );
    } catch (e) {
        console.error('[DharmaCategoryBlock] Error loading block:', cat?.id, e);
        return null;
    }
}

async function UncategorizedTalksSection({ supabase, tenantId }: { supabase: any; tenantId?: string }) {
    try {
        const talksData = await getCachedUncategorizedDharmaTalks(6, tenantId);
        if (!talksData || talksData.length === 0) return null;

        const talksWithTags = await fetchTagsForTalks(supabase, talksData);

        return (
            <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div className="mb-8 border-b-2 border-slate-300">
                    <h2 className="text-xl md:text-2xl font-bold font-playfair uppercase text-slate-600 relative inline-block whitespace-normal md:whitespace-nowrap">
                        <span className="absolute -bottom-[2px] left-0 w-full h-[2px] bg-slate-400 z-10"></span>
                        Video Khác (Chưa phân loại)
                    </h2>
                </div>
                <div className="mt-6">
                    <TalksGrid talks={talksWithTags as any} />
                </div>
            </div>
        );
    } catch (e) {
        console.error('[UncategorizedTalksSection] Error:', e);
        return null;
    }
}

// ─── Page Component ──────────────────────────────────────────────────────────
export default async function DharmaTalksPage({
    params,
    searchParams
}: {
    params: Promise<{ domain: string; locale: string }>;
    searchParams: Promise<{ category?: string }>;
}) {
    const { domain, locale } = await params;
    const t = await getTranslations({ locale, namespace: 'DharmaTalks' });
    const search = await searchParams;
    const selectedCategory = search.category || 'all';

    const tenant = await getTenantConfig(domain).catch(() => null);
    const tenantId = tenant?.id;

    // Lấy cấu trúc danh mục từ cache
    const categoriesTree = await getCachedCategoriesTree(tenantId, tenant?.tenant_type).catch(() => ({ news: [], dharma: [], documents: [], media: [] }));
    const rootCategories = categoriesTree.dharma ?? [];
    const isCompany = tenant?.tenant_type !== 'tenant';

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    return (
        <main className="min-h-screen bg-[#FAF7F2]">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-coffee-dark text-white">
                <KhmerPatternBg className="opacity-10" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-primary/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-primary/40 to-transparent" />

                <div className="container relative z-10 mx-auto px-4 text-center">
                    <p className="text-gold-primary/80 text-xs font-semibold tracking-[0.3em] uppercase mb-4 animate-in fade-in slide-in-from-bottom-3 duration-700">
                        {isCompany ? 'Tài Liệu Nội Bộ · Internal Docs' : 'Pháp Thoại · Dharma Talks'}
                    </p>
                    <h1 className="text-4xl lg:text-5xl font-playfair font-bold text-gold-light mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        {t('title')}
                    </h1>
                    <p className="max-w-2xl mx-auto text-gray-300 text-lg font-light leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
                        {t('subtitle')}
                    </p>
                    {selectedCategory !== 'all' && (
                        <div className="mt-8">
                            <Link href="/documents" className="inline-block px-4 py-2 border border-gold-primary text-gold-light rounded-md hover:bg-gold-primary hover:text-white transition-colors">
                                ← Xem tất cả chuyên mục
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Main Content */}
            <section className="py-8 md:py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="space-y-10 md:space-y-16">
                        {rootCategories.map((rootCat: any) => {
                            const isTargetCategory = selectedCategory === 'all'
                                || rootCat.slug === selectedCategory
                                || (rootCat.children || []).some((c: any) => c.slug === selectedCategory);

                            if (!isTargetCategory) return null;

                            const blocksToRender: { cat: any; categoryIds: string[] }[] = [];

                            if (selectedCategory === 'all') {
                                blocksToRender.push({
                                    cat: rootCat,
                                    categoryIds: [rootCat.id, ...(rootCat.children || []).map((c: any) => c.id)]
                                });
                            } else if (selectedCategory === rootCat.slug) {
                                blocksToRender.push({ cat: rootCat, categoryIds: [rootCat.id] });
                                (rootCat.children || []).forEach((child: any) => {
                                    blocksToRender.push({ cat: child, categoryIds: [child.id] });
                                });
                            } else {
                                const activeChild = (rootCat.children || []).find((c: any) => c.slug === selectedCategory);
                                if (activeChild) {
                                    blocksToRender.push({ cat: activeChild, categoryIds: [activeChild.id] });
                                }
                            }

                            return (
                                <div key={rootCat.id} className="space-y-10 md:space-y-16">
                                    {/* Render async component riêng — KHÔNG dùng async map */}
                                    {blocksToRender.map((block) => (
                                        <DharmaCategoryBlock
                                            key={block.cat.id}
                                            cat={block.cat}
                                            categoryIds={block.categoryIds}
                                            tenantId={tenantId}
                                            locale={locale}
                                            selectedCategory={selectedCategory}
                                            supabase={supabase}
                                        />
                                    ))}
                                </div>
                            );
                        })}

                        {rootCategories.length === 0 && (
                            <div className="text-center py-20">
                                <p className="text-gray-500 text-lg">
                                    {isCompany ? 'Hệ thống chưa thiết lập danh mục tài liệu.' : 'Hệ thống chưa thiết lập danh mục pháp thoại.'}
                                </p>
                            </div>
                        )}

                        {selectedCategory === 'all' && (
                            <UncategorizedTalksSection supabase={supabase} tenantId={tenantId} />
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
