import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Mail, Phone, MapPin, Calendar, User, Share2, Printer } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import SectionRenderer from '@/components/about/SectionRenderer';
import AboutSidebar from '@/components/about/AboutSidebar';
import TableOfContents from '@/components/about/TableOfContents';
import { getCachedAboutSection, getCachedAboutSections } from '@/lib/cache/queries';
import { getTenantConfig } from '@/lib/tenant';
import { getSiteSettings } from '@/lib/site-settings';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Link } from '@/i18n/routing';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getVietnamTime } from '@/lib/utils/date';
import { cn } from '@/lib/utils';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ domain: string; locale: string; slug: string[] }> }): Promise<Metadata> {
    const { domain, slug } = await params;
    const tenant = await getTenantConfig(domain);
    if (!tenant) return { title: 'Giới thiệu' };

    const key = slug.join('/');
    const section = await getCachedAboutSection(key, tenant.id);
    const settings = await getSiteSettings(tenant.id);
    const siteName = settings['site_name_vi'] || 'Chi nhánh Khmer';

    if (!section) return { title: `Giới thiệu | ${siteName}` };

    // SEO Optimization: Clean HTML and extract meaningful description
    const cleanContent = section.content_vi?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '';
    const description = section.summary_vi || cleanContent.substring(0, 160) || '';

    return {
        title: `${section.title_vi} | ${siteName}`,
        description,
        openGraph: {
            title: `${section.title_vi} | ${siteName}`,
            description,
            images: section.image_url ? [section.image_url] : [],
        }
    };
}

export default async function AboutDetailPage({ params }: { params: Promise<{ domain: string; locale: string; slug: string[] }> }) {
    const { domain, locale, slug } = await params;
    setRequestLocale(locale);

    const tenant = await getTenantConfig(domain);
    if (!tenant) return notFound();

    const settings = await getSiteSettings(tenant.id);
    const siteName = settings['site_name_vi'] || 'Chi nhánh Khmer';

    const key = slug.join('/');
    const allSections = await getCachedAboutSections(tenant.id);
    const section = allSections.find(s => s.key === key);

    if (!section) return notFound();

    // Đối với các mục là CHA, chúng ta hiện danh sách các mục CON
    const targetSlashCount = (key.match(/\//g) || []).length + 1;
    const childSections = allSections
        .filter((s: any) => s.key && s.key.startsWith(`${key}/`) && (s.key.match(/\//g) || []).length === targetSlashCount)
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    const isParentCategory = childSections.length > 0;

    if (isParentCategory) {
        return (
            <div className="min-h-screen bg-white">
                <div className="relative h-[60vh] lg:h-[70vh] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-coffee-dark">
                        <Image
                            src={section.image_url || settings['site_about_hero'] || "https://chuaadida.com/upload/tintuc/du-lich-tam-linh-chua-chantarangsay-1-1634547437-564343.jpg"}
                            alt={section.title_vi}
                            fill
                            className="object-cover opacity-60 mix-blend-overlay scale-105"
                            priority
                            sizes="100vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/60"></div>
                    </div>
                    <div className="relative z-10 text-center text-white px-4 max-w-4xl flex flex-col items-center">
                        <div className="inline-flex items-center gap-3 mb-6 px-6 py-2 border border-gold-light/30 rounded-full bg-black/20 backdrop-blur-md">
                            <span className="text-gold-light uppercase tracking-[0.2em] text-xs font-semibold">Khám Phá Di Sản</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-playfair font-bold text-white mb-6 tracking-wider uppercase drop-shadow-2xl px-4 text-center">
                            {section.title_vi}
                        </h1>
                        <div className="w-24 h-1 bg-gold-primary mx-auto mb-6"></div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
                </div>

                <div className="bg-stone-50/50 border-b border-gold-primary/10">
                    <div className="container mx-auto px-4 py-4">
                        <Breadcrumb
                            items={[
                                { label: 'Giới thiệu', href: '/gioi-thieu' },
                                { label: section.title_vi }
                            ]}
                        />
                    </div>
                </div>

                {/* Grid layout với sidebar — Loại bỏ overflow-hidden để tránh cắt chữ */}
                <div className="container mx-auto px-4 py-16 w-full">
                    <div className="grid lg:grid-cols-12 gap-12 w-full">
                        {/* Sidebar */}
                        <aside className="lg:col-span-4 lg:pr-8">
                            <div className="sticky top-32 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl scrollbar-thin scrollbar-thumb-gold-primary/20">
                                <AboutSidebar
                                    tenantId={tenant.id}
                                    activeKey={section.key}
                                    sections={allSections}
                                />
                            </div>
                        </aside>
                        {/* Content — danh sách sub-sections dạng card thay vì SectionRenderer full-width */}
                        <div className="lg:col-span-8 flex flex-col gap-8 min-w-0">
                            {childSections.map((child: any) => {
                                const excerpt = child.summary_vi ||
                                    (child.content_vi ? child.content_vi.replace(/<[^>]+>/g, '').substring(0, 200) + '...' : '');
                                return (
                                    <Link
                                        key={child.id}
                                        href={`/gioi-thieu/${child.key}`}
                                        className="group flex flex-col sm:flex-row gap-6 bg-white border border-gold-primary/10 rounded-2xl p-6 hover:shadow-lg hover:border-gold-primary/30 transition-all duration-300"
                                    >
                                        {child.image_url && (
                                            <div className="relative w-full sm:w-40 h-48 sm:h-auto shrink-0 rounded-xl overflow-hidden">
                                                <Image
                                                    src={child.image_url}
                                                    alt={child.title_vi}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    sizes="160px"
                                                />
                                            </div>
                                        )}
                                        <div className="flex flex-col justify-center gap-3 min-w-0">
                                            <span className="text-gold-primary text-xs font-bold uppercase tracking-widest">
                                                {section.title_vi}
                                            </span>
                                            <h2 className="text-xl font-playfair font-bold text-coffee-dark group-hover:text-gold-primary transition-colors duration-300">
                                                {child.title_vi}
                                            </h2>
                                            {excerpt && (
                                                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                                                    {excerpt}
                                                </p>
                                            )}
                                            <span className="inline-flex items-center gap-2 text-sm font-medium text-gold-primary mt-1">
                                                Khám Phá
                                                <span className="w-6 h-px bg-gold-primary group-hover:w-10 transition-all duration-300"></span>
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const parentKey = slug.length > 1 ? slug.slice(0, -1).join('/') : null;
    const parentSection = parentKey ? allSections.find(s => s.key === parentKey) : null;

    // Smart Navigation: Find siblings
    const siblings = allSections
        .filter(s => {
            if (!s.key) return false;
            const sParentKey = s.key.includes('/') ? s.key.split('/').slice(0, -1).join('/') : null;
            return sParentKey === parentKey && s.key !== section.key;
        })
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    const currentIndex = allSections
        .filter(s => {
            const sParentKey = s.key.includes('/') ? s.key.split('/').slice(0, -1).join('/') : null;
            return sParentKey === parentKey;
        })
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        .findIndex(s => s.key === section.key);

    const allInLevel = allSections
        .filter(s => {
            if (!s.key) return false;
            const sParentKey = s.key.includes('/') ? s.key.split('/').slice(0, -1).join('/') : null;
            return sParentKey === parentKey;
        })
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    const prevSection = currentIndex > 0 ? allInLevel[currentIndex - 1] : null;
    const nextSection = currentIndex < allInLevel.length - 1 ? allInLevel[currentIndex + 1] : null;

    return (
        <div className="min-h-[70vh] bg-[#FAF8F5]">
            <div className="bg-white border-b border-gold-primary/10 pt-10 pb-6 shadow-sm relative z-10">
                <div className="container mx-auto px-4">
                    <Breadcrumb
                        items={[
                            { label: 'Giới thiệu', href: '/gioi-thieu' },
                            ...(parentSection ? [{ label: parentSection.title_vi || '...', href: `/gioi-thieu/${parentSection.key}` }] : []),
                            { label: section.title_vi || '...' }
                        ]}
                    />

                    <div className="mt-10 flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
                        <div className="max-w-4xl relative">
                            {/* Decorative Top Line */}
                            <div className="hidden md:flex items-center gap-4 mb-6">
                                <span className="h-px w-12 bg-gold-primary/40"></span>
                                <span className="text-gold-primary font-medium tracking-[0.2em] uppercase text-xs">Chi Tiết Thông Tin</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-playfair font-bold text-coffee-dark leading-snug sm:leading-[1.15] tracking-tight break-words overflow-visible">
                                {section?.title_vi || ''}
                            </h1>


                        </div>

                        <div className="flex items-center gap-4 border-l border-gold-primary/20 pl-6">
                            <button className="p-3 rounded-full bg-white border border-gold-primary/20 text-gold-primary hover:bg-gold-primary hover:text-white transition-all shadow-sm hover:shadow-md group">
                                <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                            <button className="p-3 rounded-full bg-white border border-gold-primary/20 text-gold-primary hover:bg-gold-primary hover:text-white transition-all shadow-sm hover:shadow-md group">
                                <Printer className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">

                <div className="grid lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 min-w-0">
                        <article className="bg-[#FAF8F5] lg:bg-transparent rounded-3xl lg:rounded-none shadow-xl lg:shadow-none shadow-gold-primary/5 overflow-hidden lg:overflow-visible border border-gold-primary/10 lg:border-none px-4 py-8 md:p-10 lg:p-0">
                            {section?.image_url && (
                                <div className="relative w-full group overflow-hidden rounded-2xl shadow-2xl mb-12 border border-gold-primary/20 bg-coffee-dark flex justify-center items-center min-h-[300px] md:min-h-[450px]">
                                    <Image
                                        src={section.image_url}
                                        alt="Background"
                                        fill
                                        className="object-cover opacity-30 blur-2xl scale-125 pointer-events-none"
                                        aria-hidden="true"
                                        sizes="100vw"
                                    />
                                    <div className="relative w-full overflow-hidden z-10 flex justify-center items-center">
                                        <Image
                                            src={section.image_url}
                                            alt={section.title_vi || 'Hình ảnh'}
                                            width={1200}
                                            height={800}
                                            className="w-full h-auto max-h-[60vh] object-contain transition-transform duration-1000 group-hover:scale-105"
                                            sizes="(max-width: 1024px) 100vw, 66vw"
                                            priority
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="mt-12">
                                {/* Table of Contents for Mobile */}
                                <div className="lg:hidden mb-8">
                                    <TableOfContents contentId="article-content" />
                                </div>

                                <div
                                    id="article-content"
                                    className="
                                        prose prose-base sm:prose-lg lg:prose-xl max-w-none
                                        prose-headings:font-playfair prose-headings:text-coffee-dark prose-headings:font-bold prose-headings:tracking-wide
                                        prose-headings:scroll-mt-28
                                        prose-p:text-gray-700 prose-p:leading-[1.7] md:prose-p:leading-[1.9] prose-p:mb-6 md:prose-p:mb-8 prose-p:font-light
                                        prose-img:rounded-2xl prose-img:shadow-xl prose-img:border prose-img:border-gold-primary/10
                                        prose-strong:text-coffee-dark prose-strong:font-semibold
                                        prose-li:text-gray-700 prose-li:leading-[1.7] md:prose-li:leading-[1.8]
                                        prose-blockquote:border-gold-primary prose-blockquote:bg-white prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:shadow-sm prose-blockquote:font-playfair prose-blockquote:text-xl prose-blockquote:italic
                                        first-letter:font-playfair md:first-letter:float-left first-letter:text-4xl md:first-letter:text-7xl first-letter:font-bold first-letter:text-gold-primary first-letter:pr-3 first-letter:pt-2 first-letter:leading-[0.8]
                                    "
                                    dangerouslySetInnerHTML={{ __html: section?.content_vi || '' }}
                                />

                                {/* Smart Navigation Buttons */}
                                <div className="mt-16 grid sm:grid-cols-2 gap-4 border-t border-gold-primary/10 pt-10">
                                    {prevSection ? (
                                        <Link
                                            href={`/gioi-thieu/${prevSection.key}`}
                                            className="group flex flex-col p-6 rounded-2xl bg-white border border-gold-primary/5 hover:border-gold-primary/30 transition-all shadow-sm hover:shadow-md"
                                        >
                                            <span className="flex items-center gap-2 text-xs font-bold text-gold-primary/60 uppercase tracking-widest mb-1">
                                                <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
                                                Bài trước
                                            </span>
                                            <span className="font-playfair font-bold text-coffee-dark group-hover:text-gold-primary transition-colors line-clamp-1">
                                                {prevSection.title_vi}
                                            </span>
                                        </Link>
                                    ) : <div />}

                                    {nextSection && (
                                        <Link
                                            href={`/gioi-thieu/${nextSection.key}`}
                                            className="group flex flex-col p-6 rounded-2xl bg-white border border-gold-primary/5 hover:border-gold-primary/30 transition-all shadow-sm hover:shadow-md text-right items-end"
                                        >
                                            <span className="flex items-center gap-2 text-xs font-bold text-gold-primary/60 uppercase tracking-widest mb-1">
                                                Bài tiếp theo
                                                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                            </span>
                                            <span className="font-playfair font-bold text-coffee-dark group-hover:text-gold-primary transition-colors line-clamp-1">
                                                {nextSection.title_vi}
                                            </span>
                                        </Link>
                                    )}
                                </div>

                                <div className="mt-12 pt-8 border-t border-gold-primary/20 flex flex-wrap gap-6 items-center justify-between text-sm text-gray-500 font-medium tracking-wide">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gold-primary/5 text-coffee-dark rounded-full">
                                            <User className="w-4 h-4 text-gold-primary" />
                                            <span>Bộ phận Truyền thông</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gold-primary/5 text-coffee-dark rounded-full">
                                            <MapPin className="w-4 h-4 text-gold-primary" />
                                            <span>{siteName}</span>
                                        </div>
                                    </div>
                                    <div className="italic text-gray-400">
                                        Cập nhật: {new Date().toLocaleDateString('vi-VN')}
                                    </div>
                                </div>
                            </div>
                        </article>
                    </div>

                    {/* Sidebar with Table of Contents */}
                    <aside className="lg:col-span-4 lg:pl-8">
                        <div className="sticky top-32 flex flex-col gap-8">
                            {/* Desktop Table of Contents */}
                            <div className="hidden lg:block order-2 lg:order-1">
                                <TableOfContents contentId="article-content" />
                            </div>

                            <div className="order-1 lg:order-2">
                                {tenant?.id && section?.key && (
                                    <AboutSidebar
                                        tenantId={tenant.id}
                                        activeKey={section.key}
                                        sections={allSections}
                                    />
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

export async function generateStaticParams() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return [];

    const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
    // Tối ưu: Chỉ prerender các mục chính (root level) để giảm thời gian build khi dữ liệu phình to.
    // Các trang sâu hơn sẽ được render on-demand và cache lại.
    const { data: sections } = await supabase
        .from('about_sections')
        .select('key, tenant_id, tenants(domain)')
        .not('key', 'like', '%/%'); // Only root keys

    if (!sections) return [];

    const locales = ['vi', 'km', 'en'];
    const validSections = sections.filter((s: any) => s.tenants?.domain);

    return locales.flatMap(locale =>
        validSections.map((s: any) => ({
            domain: s.tenants.domain,
            locale,
            slug: s.key.split('/')
        }))
    );
}
