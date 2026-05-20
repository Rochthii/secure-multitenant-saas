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
import { CategorySectionHeader } from '@/components/ui/category-section-header';
import { Link } from '@/i18n/routing';
import { getTenantConfig } from '@/lib/tenant';
import { FileText, Layers, Search, Sparkles } from 'lucide-react';

// force-dynamic: trang dùng searchParams nên phải dynamic.
// Dữ liệu vẫn được cache qua unstable_cache (permanent) trong queries.ts.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ domain: string; locale: string }> }) {
    const { domain, locale } = await params;
    const tenant = await getTenantConfig(domain);
    const siteName = tenant?.name || "McAaron B2B SaaS";

    return {
        title: `Kho Tài Liệu & SOP Nội Bộ | ${siteName}`,
        description: `Hệ thống lưu trữ tài liệu quy chuẩn, quy trình vận hành tiêu chuẩn (SOP) và tài liệu đào tạo nội bộ của doanh nghiệp.`,
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

// ─── Async Sub-Component ──────────────────────────────────────────────────
async function DocumentCategoryBlock({
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

        // Custom Category Header cho chuẩn Doanh nghiệp
        const catName = locale === 'vi' ? cat.name_vi : cat.name_km || cat.name_vi;

        return (
            <section className="animate-in fade-in slide-in-from-bottom-5 duration-700 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-100">
                                {catName}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">Chuyên mục tài liệu & quy chuẩn vận hành</p>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <TalksGrid talks={talksWithTags as any} />
                </div>

                {showSeeMore && (
                    <div className="mt-8 flex justify-end">
                        <Link
                            href={`/documents?category=${cat.slug}`}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 uppercase tracking-wider transition-colors inline-block pb-1"
                        >
                            Xem thêm {catName} →
                        </Link>
                    </div>
                )}
            </section>
        );
    } catch (e) {
        console.error('[DocumentCategoryBlock] Error loading block:', cat?.id, e);
        return null;
    }
}

async function UncategorizedDocumentsSection({ supabase, tenantId }: { supabase: any; tenantId?: string }) {
    try {
        const talksData = await getCachedUncategorizedDharmaTalks(6, tenantId);
        if (!talksData || talksData.length === 0) return null;

        const talksWithTags = await fetchTagsForTalks(supabase, talksData);

        return (
            <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="mb-6 border-b border-slate-100 dark:border-zinc-800 pb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-slate-500" />
                        Tài liệu khác (Chưa phân loại)
                    </h2>
                </div>
                <div className="mt-4">
                    <TalksGrid talks={talksWithTags as any} />
                </div>
            </div>
        );
    } catch (e) {
        console.error('[UncategorizedDocumentsSection] Error:', e);
        return null;
    }
}

// ─── Page Component ──────────────────────────────────────────────────────────
export default async function DocumentsPage({
    params,
    searchParams
}: {
    params: Promise<{ domain: string; locale: string }>;
    searchParams: Promise<{ category?: string }>;
}) {
    const { domain, locale } = await params;
    const search = await searchParams;
    const selectedCategory = search.category || 'all';

    const tenant = await getTenantConfig(domain).catch(() => null);
    const tenantId = tenant?.id;

    // Lấy cấu trúc danh mục từ cache
    const categoriesTree = await getCachedCategoriesTree(tenantId, tenant?.tenant_type).catch(() => ({ news: [], dharma: [], documents: [], media: [] }));
    
    // Ưu tiên lấy từ documents, nếu rỗng thì fallback sang dharma
    const rootCategories = (categoriesTree.documents && categoriesTree.documents.length > 0) 
        ? categoriesTree.documents 
        : (categoriesTree.dharma ?? []);

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    return (
        <main className="min-h-screen bg-slate-50/50 dark:bg-zinc-950">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-slate-900 dark:bg-zinc-950 text-white">
                {/* Modern Tech Gradients */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))]" />
                <div className="absolute inset-0 bg-grid-white/[0.02]" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

                <div className="container relative z-10 mx-auto px-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-4 animate-in fade-in slide-in-from-bottom-3 duration-700">
                        <Sparkles className="w-3.5 h-3.5" />
                        Enterprise Knowledge Hub
                    </span>
                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        Tài Liệu & Quy Trình SOP
                    </h1>
                    <p className="max-w-2xl mx-auto text-slate-300 text-lg font-light leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
                        Kho tri thức tích hợp của tổ chức. Hệ thống hóa toàn bộ tài liệu quy chuẩn, quy trình vận hành tiêu chuẩn (SOP), các văn bản hướng dẫn và tài liệu đào tạo nội bộ.
                    </p>
                    {selectedCategory !== 'all' && (
                        <div className="mt-8">
                            <Link href="/documents" className="inline-flex items-center gap-2 px-5 py-2.5 border border-violet-500/30 text-slate-200 rounded-xl hover:bg-violet-600 hover:text-white transition-all shadow-md shadow-violet-900/10">
                                ← Xem tất cả chuyên mục
                             </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 md:py-20">
                <div className="container mx-auto px-4 max-w-7xl">
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
                                    {blocksToRender.map((block) => (
                                        <DocumentCategoryBlock
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
                            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl py-20 text-center shadow-sm">
                                <FileText className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-4" />
                                <p className="text-slate-500 dark:text-zinc-400 text-lg">
                                    Hệ thống chưa thiết lập danh mục tài liệu & SOP.
                                </p>
                            </div>
                        )}

                        {selectedCategory === 'all' && (
                            <UncategorizedDocumentsSection supabase={supabase} tenantId={tenantId} />
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
