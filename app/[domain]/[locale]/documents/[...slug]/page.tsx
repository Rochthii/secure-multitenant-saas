import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';
import { TalksGrid } from '@/components/phap-thoai/talks-grid';
import { Link } from '@/i18n/routing';
import { CategorySectionHeader } from '@/components/ui/category-section-header';
import { getCachedDharmaTalksByCategoryGroup, getCachedDharmaTalksPage } from '@/lib/cache/queries';
import { FileText, FolderOpen } from 'lucide-react';

type Category = Database['public']['Tables']['categories']['Row'];
type DharmaTalk = Database['public']['Tables']['dharma_talks']['Row'];

type Props = {
    params: Promise<{ slug: string[]; locale: string; domain: string }>;
    searchParams: Promise<{ page?: string }>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, domain } = await params;
    const { getTenantConfig } = await import('@/lib/tenant');
    const tenantConfig = await getTenantConfig(domain).catch(() => null);
    const tenantId = tenantConfig?.id;

    const lastSlug = slug[slug.length - 1];
    const supabase = await createClient();

    let query = supabase
        .from('categories')
        .select('*')
        .eq('slug', lastSlug)
        .eq('module', 'dharma');

    if (tenantId) {
        query = query.eq('tenant_id', tenantId);
    }

    const { data: categoryData } = await query.maybeSingle();

    if (categoryData) {
        return {
            title: `Tài Liệu: ${categoryData.name_vi} | ${tenantConfig?.name || 'McAaron B2B SaaS'}`,
            description: `Tổng hợp các quy chuẩn, hướng dẫn và SOP thuộc danh mục ${categoryData.name_vi}`,
        };
    }

    return {
        title: 'Trang không tìm thấy',
    };
}

export default async function CatchAllDharmaTalksPage({ params, searchParams }: Props) {
    const { slug, locale, domain } = await params;
    const { getTenantConfig } = await import('@/lib/tenant');
    const tenantConfig = await getTenantConfig(domain).catch(() => null);
    const tenantId = tenantConfig?.id;

    const search = await searchParams;
    const lastSlug = slug[slug.length - 1];
    const supabase = await createClient();

    let catQuery = supabase
        .from('categories')
        .select('*')
        .eq('slug', lastSlug)
        .eq('module', 'dharma');

    if (tenantId) {
        catQuery = catQuery.eq('tenant_id', tenantId);
    }

    const { data: categoryData } = await catQuery.maybeSingle();

    if (!categoryData) {
        notFound();
    }

    // Lấy danh sách con để biết là parent hay không
    const { data: children } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', categoryData.id)
        .order('order_position', { ascending: true });

    const isParentCategory = children && children.length > 0;
    const basePath = `/documents`; 
    const currentPath = `/documents/${slug.join('/')}`;

    let contentToRender;

    if (isParentCategory) {
        // RENDER DANH SÁCH CON (Parent View)
        contentToRender = (
            <div className="space-y-10 md:space-y-16">
                {await Promise.all(children.map(async (childNode) => {
                    const childTalks = await getCachedDharmaTalksByCategoryGroup([childNode.id], 6, tenantId);

                    if (!childTalks || childTalks.length === 0) return null;

                    const showSeeMore = childTalks.length >= 6;
                    const childName = locale === 'vi' ? childNode.name_vi : childNode.name_km || childNode.name_vi;

                    return (
                        <section key={childNode.id} className="animate-in fade-in slide-in-from-bottom-5 duration-700 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-100">
                                            {childName}
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-0.5">Tài liệu quy chuẩn cấp dưới</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <TalksGrid
                                    talks={(childTalks as DharmaTalk[]) || []}
                                    tenantName={tenantConfig?.name}
                                    logoUrl={tenantConfig?.logo_url || undefined}
                                />
                            </div>
                            {showSeeMore && (
                                <div className="mt-8 flex justify-end">
                                    <Link
                                        href={`/documents/${childNode.slug}`}
                                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 uppercase tracking-wider transition-colors inline-block pb-1"
                                    >
                                        Xem thêm {childName} →
                                    </Link>
                                </div>
                            )}
                        </section>
                    );
                }))}
            </div>
        );
    } else {
        // RENDER DANH SÁCH CHÍT (Leaf View)
        const page = Math.max(1, Number(search?.page) || 1);
        const ITEMS_PER_PAGE = 12;

        const { talks, total: count } = await getCachedDharmaTalksPage(page, categoryData.id, ITEMS_PER_PAGE, tenantId);

        const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

        contentToRender = (
            <>
                {talks && talks.length > 0 ? (
                    <TalksGrid
                        talks={(talks as DharmaTalk[]) || []}
                        tenantName={tenantConfig?.name}
                        logoUrl={tenantConfig?.logo_url || undefined}
                    />
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm text-slate-500 dark:text-zinc-400 text-lg">
                        Chưa có tài liệu hoặc SOP nào được cập nhật trong chuyên mục này.
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <nav className="flex justify-center items-center gap-2 mt-12">
                        {page > 1 && (
                            <Link href={`${currentPath}?page=${page - 1}`} className="px-4 py-2 border border-slate-300 dark:border-zinc-800 rounded-xl hover:bg-white dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 transition-colors">
                                ← Trước
                            </Link>
                        )}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <Link
                                key={pageNum}
                                href={`${currentPath}?page=${pageNum}`}
                                className={`px-4 py-2 border rounded-xl transition-colors ${page === pageNum ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-300 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300'}`}
                            >
                                {pageNum}
                            </Link>
                        ))}
                        {page < totalPages && (
                            <Link href={`${currentPath}?page=${page + 1}`} className="px-4 py-2 border border-slate-300 dark:border-zinc-800 rounded-xl hover:bg-white dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 transition-colors">
                                Sau →
                            </Link>
                        )}
                    </nav>
                )}
            </>
        );
    }

    return (
        <main className="bg-slate-50/50 dark:bg-zinc-950 min-h-screen pt-28 md:pt-32 pb-16">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Modern Corporate Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-6 mb-8 md:mb-12">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-900/10">
                            <FolderOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <Link href="/documents" className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline">
                                    Tài Liệu & SOP
                                </Link>
                                <span className="text-xs text-slate-400">/</span>
                                <span className="text-xs text-slate-400">Chuyên mục</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-zinc-100 mt-1">
                                {categoryData.name_vi}
                            </h1>
                        </div>
                    </div>
                </div>

                {contentToRender}
            </div>
        </main>
    );
}
