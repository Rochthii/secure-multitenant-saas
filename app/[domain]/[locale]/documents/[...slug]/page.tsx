import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';
import { KhmerHeading } from '@/components/ui/khmer-heading';
import { TalksGrid } from '@/components/phap-thoai/talks-grid';
import { Link } from '@/i18n/routing';
import { CategorySectionHeader } from '@/components/ui/category-section-header';
import { getCachedDharmaTalksByCategoryGroup, getCachedDharmaTalksPage } from '@/lib/cache/queries';

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
            title: `Pháp Thoại: ${categoryData.name_vi} | ${tenantConfig?.name || 'Multi-tenant Ecosystem'}`,
            description: `Tổng hợp các bài giảng pháp, video thuộc danh mục ${categoryData.name_vi}`,
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

    // Đối với Pháp Thoại, trang chi tiết bài giảng dùng chung Modal Video ở màn hình Category
    // Mọi URL [...slug] đều sẽ được coi là URL của Danh mụccategory
    // Lấy thông tin chính nó
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
    const basePath = `/documents`; // always use base path for view more links
    const currentPath = `/documents/${slug.join('/')}`;

    let contentToRender;

    if (isParentCategory) {
        // RENDER DANH SÁCH CON (Parent View)
        contentToRender = (
            <div className="space-y-10 md:space-y-16">
                {await Promise.all(children.map(async (childNode, bIdx) => {
                    const childTalks = await getCachedDharmaTalksByCategoryGroup([childNode.id], 6, tenantId);

                    if (!childTalks || childTalks.length === 0) return null;

                    const showSeeMore = childTalks.length >= 6;

                    return (
                        <section key={childNode.id} className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                            <CategorySectionHeader category={{ ...childNode, children: [] } as any} baseHref={basePath} />
                            <div className="mt-6">
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
                                        className="text-sm font-semibold text-gold-dark hover:text-coffee-dark uppercase tracking-wider transition-colors inline-block pb-1 border-b border-transparent hover:border-coffee-dark"
                                    >
                                        Xem thêm {locale === 'vi' ? childNode.name_vi : childNode.name_km || childNode.name_vi} →
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
                    <div className="text-center py-20 text-gray-500 text-lg">
                        Không có pháp thoại nào trong danh mục này.
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <nav className="flex justify-center items-center gap-2 mt-12">
                        {page > 1 && (
                            <Link href={`${currentPath}?page=${page - 1}`} className="px-4 py-2 border border-stone-300 rounded-md hover:bg-white text-coffee-dark transition-colors">
                                ← Trước
                            </Link>
                        )}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <Link
                                key={pageNum}
                                href={`${currentPath}?page=${pageNum}`}
                                className={`px-4 py-2 border rounded-md transition-colors ${page === pageNum ? 'bg-gold-primary text-white border-gold-primary' : 'border-stone-300 hover:bg-white text-coffee-dark'}`}
                            >
                                {pageNum}
                            </Link>
                        ))}
                        {page < totalPages && (
                            <Link href={`${currentPath}?page=${page + 1}`} className="px-4 py-2 border border-stone-300 rounded-md hover:bg-white text-coffee-dark transition-colors">
                                Sau →
                            </Link>
                        )}
                    </nav>
                )}
            </>
        );
    }

    return (
        <div className="bg-[#FAF7F2] min-h-screen">
            <div className="container mx-auto px-4 py-8 md:py-12 pt-28 md:pt-32">
                <div className="text-center mb-8 md:mb-12">
                    <KhmerHeading level={1} withDivider>
                        {categoryData.name_vi}
                    </KhmerHeading>
                </div>
                {contentToRender}
            </div>
        </div>
    );
}
