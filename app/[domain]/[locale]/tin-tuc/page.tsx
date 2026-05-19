import React from 'react';
import type { Metadata } from 'next';
import { KhmerHeading } from '@/components/ui/khmer-heading';
import { NewsCard } from '@/components/news/news-card';
import { Link } from '@/i18n/routing';
import {
    getCachedCategoriesTree,
    getCachedNewsByCategoryGroup,
    getCachedUncategorizedNews
} from '@/lib/cache/queries';
import { getTenantConfig } from '@/lib/tenant';
import { CategorySectionHeader } from '@/components/ui/category-section-header';
import { cn } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';

// force-dynamic: trang dùng searchParams nên phải dynamic.
// Dữ liệu vẫn được cache qua unstable_cache (permanent) trong queries.ts.
export const dynamic = 'force-dynamic';


export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }): Promise<Metadata> {
    const { domain } = await params;
    const tenant = await getTenantConfig(domain);
    const siteName = tenant?.name || "Multi-tenant Ecosystem";
    const isCompany = tenant?.tenant_type !== 'tenant';
    const title = isCompany ? `Tin tức & Sự kiện | ${siteName}` : `Tin tức & Bài viết | ${siteName}`;
    const description = isCompany
        ? `Cập nhật các hoạt động, sự kiện và thông tin mới nhất từ ${siteName}.`
        : `Cập nhật các hoạt động, sự kiện và bài viết Phật pháp mới nhất từ ${siteName}.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: ['/og-image.jpg'],
        },
    };
}

// ─── Async Sub-Component (FIX CHO LỖI 500: tránh async map) ─────────────────
// Mỗi block danh mục được render bằng 1 async component riêng biệt.
// React có thể render song song và catch lỗi từng component độc lập.
async function NewsCategoryBlock({
    cat,
    categoryIds,
    tenantId,
    locale,
    selectedCategory,
    parentIdx,
    blockIdx,
    isCompany,
}: {
    cat: any;
    categoryIds: string[];
    tenantId?: string;
    locale: string;
    selectedCategory: string;
    parentIdx: number;
    blockIdx: number;
    isCompany?: boolean;
}) {
    // try-catch: nếu 1 block lỗi, chỉ block đó bị ẩn, trang vẫn sống
    try {
        const news = await getCachedNewsByCategoryGroup(categoryIds, 6, tenantId);
        if (!news || news.length === 0) return null;

        const showSeeMore = news.length >= 6 && selectedCategory !== cat.slug;

        return (
            <section key={cat.id} className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                <CategorySectionHeader category={cat} baseHref="/tin-tuc" isCompany={isCompany} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-6">
                    {news.map((article: any, index: number) => (
                        <NewsCard
                            key={article.id}
                            slug={article.slug}
                            title={article[`title_${locale}`] ?? article.title_vi ?? ''}
                            excerpt={article[`excerpt_${locale}`] ?? article.excerpt_vi ?? null}
                            image_url={article.thumbnail_url}
                            published_at={article.published_at || ''}
                            author={null}
                            category={article.categories}
                            locale={locale}
                            priority={parentIdx === 0 && blockIdx === 0 && index < 3}
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            isCompany={isCompany}
                        />
                    ))}
                </div>
                {showSeeMore && (
                    <div className="mt-8 flex justify-end">
                        <Link
                            href={`/tin-tuc?category=${cat.slug}`}
                            className="text-sm font-semibold text-gold-dark hover:text-coffee-dark uppercase tracking-wider transition-colors inline-block pb-1 border-b border-transparent hover:border-coffee-dark"
                        >
                            Xem thêm {locale === 'vi' ? cat.name_vi : cat.name_km || cat.name_vi} →
                        </Link>
                    </div>
                )}
            </section>
        );
    } catch (e) {
        console.error('[NewsCategoryBlock] Error loading block:', cat?.id, e);
        return null; // Tắt lặng lẽ block bị lỗi, không crash toàn trang
    }
}

// ─── Uncategorized Section ───────────────────────────────────────────────────
async function UncategorizedNewsSection({ locale, tenantId, isCompany }: { locale: string; tenantId?: string; isCompany?: boolean }) {
    try {
        const uncategorizedNews = await getCachedUncategorizedNews(6, tenantId);
        if (!uncategorizedNews || uncategorizedNews.length === 0) return null;

        return (
            <section className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div className="mb-8 border-b-2 border-slate-300">
                    <h2 className="text-xl md:text-2xl font-bold font-playfair uppercase text-slate-600 relative inline-block whitespace-normal md:whitespace-nowrap">
                        <span className="absolute -bottom-[2px] left-0 w-full h-[2px] bg-slate-400 z-10"></span>
                        {isCompany ? 'Thông tin khác' : 'Bài Viết Khác (Chưa phân loại)'}
                    </h2>
                </div>
                <div className={cn(
                    "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8",
                    isCompany ? "mt-8" : ""
                )}>
                    {uncategorizedNews.map((article: any) => (
                        <NewsCard
                            key={article.id}
                            slug={article.slug}
                            title={article[`title_${locale}`] ?? article.title_vi ?? ''}
                            excerpt={article[`excerpt_${locale}`] ?? article.excerpt_vi ?? null}
                            image_url={article.thumbnail_url}
                            published_at={article.published_at || ''}
                            author={null}
                            category={article.categories}
                            locale={locale}
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            isCompany={isCompany}
                        />
                    ))}
                </div>
            </section>
        );
    } catch (e) {
        console.error('[UncategorizedNewsSection] Error:', e);
        return null;
    }
}

// ─── Page Component ──────────────────────────────────────────────────────────
export default async function NewsPage({
    params,
    searchParams,
}: {
    params: Promise<{ domain: string; locale: string }>;
    searchParams: Promise<{ page?: string; category?: string }>;
}) {
    const { domain, locale } = await params;
    const search = await searchParams;
    const t = await getTranslations('navigation');

    // try-catch toàn bộ data fetching tổng — không để crash trang
    const tenant = await getTenantConfig(domain).catch(() => null);
    const tenantId = tenant?.id;
    const selectedCategory = search.category || 'all';
    const isCompany = tenant?.tenant_type !== 'tenant';

    const categoriesTree = await getCachedCategoriesTree(tenantId, tenant?.tenant_type).catch(() => ({ news: [], dharma: [], documents: [], media: [] }));
    const rootCategories = categoriesTree.news ?? [];

    return (
        <main className={cn("min-h-screen", isCompany ? "bg-white" : "bg-[#FAF7F2]")}>
            <div className="container mx-auto px-4 py-8 md:py-12">
            {/* Header */}
            <div className={cn("text-center mb-12", isCompany ? "max-w-4xl mx-auto" : "")}>
                {isCompany ? (
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
                            {t('knowledge')}
                        </h1>
                        <div className="w-20 h-1.5 bg-sky-500 mx-auto rounded-full" />
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Cập nhật các hoạt động, sự kiện và chia sẻ kiến thức mới nhất
                        </p>
                    </div>
                ) : (
                    <>
                        <KhmerHeading level={1} withDivider>
                            {isCompany ? 'Tin tức & Sự kiện' : 'Tin tức & Bài viết'}
                        </KhmerHeading>
                        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                            {isCompany
                                ? 'Cập nhật các hoạt động, sự kiện và thông báo mới nhất'
                                : 'Cập nhật các hoạt động, sự kiện và bài viết Phật pháp mới nhất'}
                        </p>
                    </>
                )}
                
                {selectedCategory !== 'all' && (
                    <div className="mt-8 flex justify-center">
                        <Link 
                            href="/tin-tuc" 
                            className={cn(
                                "inline-flex items-center gap-2 px-6 py-2.5 rounded-full transition-all font-medium",
                                isCompany 
                                    ? "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200"
                                    : "border border-gold-primary text-gold-dark hover:bg-gold-primary hover:text-white"
                            )}
                        >
                            {isCompany ? "← Cổng kiến thức" : "← Xem tất cả chuyên mục"}
                        </Link>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="space-y-10 md:space-y-16">
                {rootCategories.map((rootCat: any, idx: number) => {
                    const isTargetCategory = selectedCategory === 'all'
                        || rootCat.slug === selectedCategory
                        || (rootCat.children || []).some((c: any) => c.slug === selectedCategory);

                    if (!isTargetCategory) return null;

                    // Tính danh sách các block cần render (logic không đổi)
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
                            {/* Render async component riêng cho từng block — không dùng async map */}
                            {blocksToRender.map((block, bIdx) => (
                                <NewsCategoryBlock
                                    key={block.cat.id}
                                    cat={block.cat}
                                    categoryIds={block.categoryIds}
                                    tenantId={tenantId}
                                    locale={locale}
                                    selectedCategory={selectedCategory}
                                    parentIdx={idx}
                                    blockIdx={bIdx}
                                    isCompany={isCompany}
                                />
                            ))}
                        </div>
                    );
                })}

                {rootCategories.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">
                            Hệ thống chưa thiết lập danh mục bài viết.
                        </p>
                    </div>
                )}

                {selectedCategory === 'all' && (
                    <UncategorizedNewsSection locale={locale} tenantId={tenantId} isCompany={isCompany} />
                )}
            </div>
        </div>
    </main>
    );
}
