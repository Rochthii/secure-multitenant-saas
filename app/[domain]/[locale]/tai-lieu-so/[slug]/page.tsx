import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { KhmerHeading } from '@/components/ui/khmer-heading';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { FileText, Headphones, PlayCircle, Library, ExternalLink, ArrowLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Link } from '@/i18n/routing';
import { CategorySectionHeader } from '@/components/ui/category-section-header';
import Image from 'next/image';

export const revalidate = 900; // 15 minutes

interface Props {
    params: Promise<{ domain: string; locale: string; slug: string }>;
    searchParams: Promise<{ page?: string }>;
}

async function getCategoryBySlug(slug: string, domain?: string): Promise<any> {
    const supabase = await createClient();
    let query = supabase
        .from('categories')
        .select('*')
        .eq('module', 'documents')
        .eq('slug', slug);

    if (domain) {
        const { getTenantConfig } = await import('@/lib/tenant');
        const tenantConfig = await getTenantConfig(domain).catch(() => null);
        if (tenantConfig?.id) {
            query = query.eq('tenant_id', tenantConfig.id);
        }
    }

    const { data } = await query.maybeSingle();
    return data;
}

async function getDocuments(categoryId: string, page: number, limit: number) {
    const supabase = await createClient();
    const offset = (page - 1) * limit;

    const { data, count } = await supabase
        .from('media')
        .select('*', { count: 'exact' })
        .eq('category_id', categoryId)
        .in('type', ['document', 'book', 'sutra', 'audio', 'video', 'external_link', 'image'] as any[])
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    return { documents: data || [], total: count || 0 };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale, slug, domain } = await params;
    const category = await getCategoryBySlug(slug, domain);

    if (!category) return {};

    const _title = locale === 'vi' ? category.name_vi : locale === 'en' ? category.name_en : category.name_km;
    const _desc = locale === 'vi' ? category.description_vi : locale === 'en' ? category.description_en : category.description_km;

    return {
        title: `${_title} | Tài Liệu Số`,
        description: _desc || `Kho tài liệu số thuộc nhóm: ${_title}`,
    };
}

const ITEMS_PER_PAGE = 24;

export default async function CategoryDocumentsPage({ params, searchParams }: Props) {
    const { locale, slug, domain } = await params;
    const search = await searchParams;
    const currentPage = Math.max(1, Number(search.page) || 1);

    const category = await getCategoryBySlug(slug, domain);

    if (!category) {
        notFound();
    }

    const supabase = await createClient();
    const { data: children } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', category.id)
        .order('created_at', { ascending: true });

    const isParentCategory = children && children.length > 0;
    const basePath = `/tai-lieu-so`;
    const currentPath = `/tai-lieu-so/${slug}`;

    const catName = locale === 'vi' ? category.name_vi : locale === 'en' ? category.name_en : category.name_km;
    const catDesc = locale === 'vi' ? category.description_vi : locale === 'en' ? category.description_en : category.description_km;

    let contentToRender;

    if (isParentCategory) {
        contentToRender = (
            <div className="space-y-10 md:space-y-16 mt-8">
                {await Promise.all(children.map(async (childNode) => {
                    const { documents: childDocs } = await getDocuments(childNode.id, 1, 6);
                    if (!childDocs || childDocs.length === 0) return null;

                    const showSeeMore = childDocs.length >= 6;

                    return (
                        <section key={childNode.id} className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                            <CategorySectionHeader category={{ ...childNode, children: [] } as any} baseHref={basePath} />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-6">
                                {childDocs.map((doc: any) => {
                                    const isAudio = doc.type === 'audio';
                                    const isVideo = doc.type === 'video';
                                    const isBook = doc.type === 'book' || doc.type === 'sutra';
                                    const isExternal = doc.type === 'external_link';
                                    const isImage = doc.type === 'image';

                                    const IconCmp = isAudio ? Headphones : isVideo ? PlayCircle : isBook ? Library : FileText;
                                    const actionText = isAudio ? 'Nghe' : isVideo ? 'Xem Video' : isBook ? 'Đọc Sách' : isExternal ? 'Truy cập' : isImage ? 'Xem Ảnh' : 'Xem & Tải';
                                    const docTitle = locale === 'vi' ? doc.title_vi : locale === 'en' ? doc.title_en : doc.title_km;
                                    const docDesc = locale === 'vi' ? doc.description_vi : locale === 'en' ? doc.description_en : doc.description_km;

                                    const displayImage = doc.thumbnail_url || (isImage ? doc.url : null);

                                    return (
                                        <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:border-gold-primary/30 transition-all duration-300 flex flex-col overflow-hidden group">
                                            {displayImage && (
                                                <div className={`w-full relative overflow-hidden bg-gray-50 ${isImage ? 'h-64' : 'h-48'}`}>
                                                    <Image
                                                        src={displayImage}
                                                        alt={docTitle}
                                                        fill
                                                        className={`object-cover transition-transform duration-500 ${isImage ? 'group-hover:scale-100' : 'group-hover:scale-105'}`}
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    />
                                                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-coffee-dark px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1.5 shadow-sm">
                                                        <IconCmp className="w-3.5 h-3.5" />
                                                        <span>{isBook ? 'Kinh Sách' : isAudio ? 'Audio' : isVideo ? 'Video' : isImage ? 'Hình Ảnh' : 'Tài Liệu'}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="p-6 flex-1 flex flex-col justify-between relative">
                                                {!displayImage && (
                                                    <div className="w-12 h-12 bg-gradient-to-br from-cream-light to-amber-50 text-gold-dark rounded-xl flex items-center justify-center mb-5 group-hover:bg-gold-primary group-hover:text-white transition-colors duration-300 shadow-sm border border-gold-primary/10">
                                                        <IconCmp className="w-6 h-6" />
                                                    </div>
                                                )}

                                                <div>
                                                    <h3 className={`font-bold text-coffee-dark leading-snug mb-2 group-hover:text-gold-dark transition-colors ${displayImage ? 'text-lg mt-1' : 'text-xl'}`} title={docTitle}>
                                                        {docTitle}
                                                    </h3>
                                                    {docDesc && (
                                                        <p className="text-sm text-gray-600 line-clamp-3 mb-6 leading-relaxed">
                                                            {docDesc}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm mt-auto">
                                                    <span className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md">
                                                        {doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(1)} MB` : (isExternal ? 'Liên Kết Web' : 'Đám mây')}
                                                    </span>
                                                    {doc.url && (
                                                        <a
                                                            href={doc.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 bg-cream-light text-gold-dark px-4 py-2 rounded-lg font-bold hover:bg-gold-primary hover:text-white transition-all text-xs uppercase tracking-wide group-hover:shadow-md"
                                                        >
                                                            {actionText}
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {showSeeMore && (
                                <div className="mt-8 flex justify-end">
                                    <Link
                                        href={`/tai-lieu-so/${childNode.slug}`}
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
        const { documents, total } = await getDocuments(category.id, currentPage, ITEMS_PER_PAGE);
        const totalPages = total ? Math.ceil(total / ITEMS_PER_PAGE) : 0;

        contentToRender = (
            <>
                {documents.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-10 md:mb-16">
                            {documents.map((doc: any) => {
                                const isAudio = doc.type === 'audio';
                                const isVideo = doc.type === 'video';
                                const isBook = doc.type === 'book' || doc.type === 'sutra';
                                const isExternal = doc.type === 'external_link';
                                const isImage = doc.type === 'image';

                                const IconCmp = isAudio ? Headphones : isVideo ? PlayCircle : isBook ? Library : FileText;
                                const actionText = isAudio ? 'Nghe' : isVideo ? 'Xem Video' : isBook ? 'Đọc Sách' : isExternal ? 'Truy cập' : isImage ? 'Xem Ảnh' : 'Xem & Tải';
                                const docTitle = locale === 'vi' ? doc.title_vi : locale === 'en' ? doc.title_en : doc.title_km;
                                const docDesc = locale === 'vi' ? doc.description_vi : locale === 'en' ? doc.description_en : doc.description_km;

                                const displayImage = doc.thumbnail_url || (isImage ? doc.url : null);

                                return (
                                    <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:border-gold-primary/30 transition-all duration-300 flex flex-col overflow-hidden group">
                                        {/* Cover Image */}
                                        {displayImage && (
                                            <div className={`w-full relative overflow-hidden bg-gray-50 ${isImage ? 'h-64' : 'h-48'}`}>
                                                <Image
                                                    src={displayImage}
                                                    alt={docTitle}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    className={`object-cover transition-transform duration-500 ${isImage ? 'group-hover:scale-100' : 'group-hover:scale-105'}`}
                                                />
                                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-coffee-dark px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1.5 shadow-sm">
                                                    <IconCmp className="w-3.5 h-3.5" />
                                                    <span>{isBook ? 'Kinh Sách' : isAudio ? 'Audio' : isVideo ? 'Video' : isImage ? 'Hình Ảnh' : 'Tài Liệu'}</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="p-6 flex-1 flex flex-col justify-between relative">
                                            {!displayImage && (
                                                <div className="w-12 h-12 bg-gradient-to-br from-cream-light to-amber-50 text-gold-dark rounded-xl flex items-center justify-center mb-5 group-hover:bg-gold-primary group-hover:text-white transition-colors duration-300 shadow-sm border border-gold-primary/10">
                                                    <IconCmp className="w-6 h-6" />
                                                </div>
                                            )}

                                            <div>
                                                <h3 className={`font-bold text-coffee-dark leading-snug mb-2 group-hover:text-gold-dark transition-colors ${displayImage ? 'text-lg mt-1' : 'text-xl'}`} title={docTitle}>
                                                    {docTitle}
                                                </h3>

                                                {docDesc && (
                                                    <p className="text-sm text-gray-600 line-clamp-3 mb-6 leading-relaxed">
                                                        {docDesc}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm mt-auto">
                                                <span className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md">
                                                    {doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(1)} MB` : (isExternal ? 'Liên Kết Web' : 'Đám mây')}
                                                </span>

                                                {doc.url && (
                                                    <a
                                                        href={doc.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 bg-cream-light text-gold-dark px-4 py-2 rounded-lg font-bold hover:bg-gold-primary hover:text-white transition-all text-xs uppercase tracking-wide group-hover:shadow-md"
                                                    >
                                                        {actionText}
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2">
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <Link
                                        key={i}
                                        href={`/tai-lieu-so/${slug}?page=${i + 1}`}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${currentPage === i + 1
                                            ? 'bg-gold-primary text-white shadow-md'
                                            : 'bg-white border text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {i + 1}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Library className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-coffee-dark mb-2">Chưa có tài liệu</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Hiện tại chưa có tài liệu nào trong danh mục này. Xin vui lòng quay lại sau hoặc chọn một danh mục khác.
                        </p>
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Minimal Hero Header for Category */}
            <div className="relative overflow-hidden bg-coffee-dark">
                {category.thumbnail_url ? (
                    <Image
                        src={category.thumbnail_url}
                        alt={catName}
                        fill
                        sizes="100vw"
                        className="object-cover opacity-30 blur-sm"
                    />
                ) : (
                    <div className="absolute inset-0 bg-[#8B2635] opacity-20" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-coffee-dark via-coffee-dark/80 to-transparent" />

                <div className="relative z-10 container mx-auto px-4 pt-12 pb-20">
                    <Link href="/tai-lieu-so" className="inline-flex items-center gap-2 text-gold-primary hover:text-white transition-colors mb-8 font-medium">
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại Thư viện
                    </Link>

                    <KhmerHeading level={1} className="text-white mb-4" withDivider={false}>
                        {catName}
                    </KhmerHeading>

                    {catDesc && (
                        <p className="text-white/80 max-w-2xl text-lg leading-relaxed mt-4">
                            {catDesc}
                        </p>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-8 relative z-20">
                {contentToRender}
            </div>
        </div>
    );
}
