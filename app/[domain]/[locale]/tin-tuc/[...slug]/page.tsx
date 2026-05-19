import React from 'react';
import { BRAND_NAME_VI } from '@/lib/constants';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { ShareButtons } from '@/components/news/share-buttons';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Clock, ChevronRight, ArrowRight, Hash } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getLocalizedContent } from '@/lib/utils/localized-content';
import { Link } from '@/i18n/routing';
import dynamic from 'next/dynamic';
const NewsCard = dynamic(() => import('@/components/news/news-card').then(mod => mod.NewsCard), {
    ssr: true,
    loading: () => <div className="h-[120px] sm:h-[400px] bg-gray-100 animate-pulse rounded-xl" />
});
import { KhmerHeading } from '@/components/ui/khmer-heading';
import { getCachedNewsPage, getCachedCategoriesTree, getCachedNewsByCategoryGroup, getCachedNewsDetail } from '@/lib/cache/queries';
import { CallToDonateProjects } from '@/components/news/call-to-donate-projects';
import { CategorySectionHeader } from '@/components/ui/category-section-header';
import { KhmerPatternBg } from '@/components/ui/khmer-pattern-bg';
import { KhmerCorner } from '@/components/ui/khmer-corner';
import { cn } from "@/lib/utils";
import { extractKeywords, generateTags, getTenantBaseUrl } from '@/lib/utils/seo';
import { getTenantConfig } from '@/lib/tenant';
import { getVietnamTime } from '@/lib/utils/date';

type News = Database['public']['Tables']['news']['Row'] & {
    categories?: Database['public']['Tables']['categories']['Row'] | null;
};
type Category = Database['public']['Tables']['categories']['Row'];

type Props = {
    params: Promise<{ domain: string; slug: string[]; locale: string }>;
    searchParams: Promise<{ page?: string }>;
};

// ISR revalidate thay vì SSG hoàn toàn để nội dung News luôn tươi mới (mỗi 1 giờ)
export const revalidate = 3600;

// Deduplicate request-level queries
import { cache } from 'react';

const getNewsItem = cache(async (lastSlug: string, tenantId?: string) => {
    // 1. Thử tìm bài viết qua Cache
    const bundle = await getCachedNewsDetail(lastSlug, tenantId);
    if (bundle) return { type: 'article', data: bundle };

    // 2. Nếu không có bài, thử tìm category trực tiếp
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    let categoryQuery = supabase
        .from('categories')
        .select('*')
        .eq('slug', lastSlug)
        .eq('module', 'news');

    if (tenantId) categoryQuery = categoryQuery.eq('tenant_id', tenantId);

    const { data: categoryData } = await categoryQuery.maybeSingle();
    if (categoryData) return { type: 'category', data: categoryData };

    return null;
});

export async function generateMetadata(
    { params }: Props
): Promise<Metadata> {
    const { domain, slug, locale } = await params;
    const lastSlug = slug[slug.length - 1];
    const tenant = await getTenantConfig(domain);
    const tenantId = tenant?.id;

    const item = await getNewsItem(lastSlug, tenantId);

    if (item?.type === 'article') {
        const article = item.data.article as News;
        const title = getLocalizedContent(article, locale, 'title');
        const excerpt = getLocalizedContent(article, locale, 'excerpt');
        const content = getLocalizedContent(article, locale, 'content');

        // Tự động trích xuất keywords cho SEO
        const keywords = extractKeywords(title || '', (excerpt || '') + (content || ''), 15, tenant?.name, tenant?.tenant_type);

        const tenantBaseUrl = getTenantBaseUrl(domain);
        const path = `/tin-tuc/${slug.join('/')}`;
        const canonicalUrl = `${tenantBaseUrl}/${locale}${path}`;

        const siteName = tenant?.name || "Multi-tenant Ecosystem";

        return {
            title: `${title} | ${siteName}`,
            description: excerpt || `Đọc bài viết trên ${siteName}`,
            keywords: keywords,
            alternates: {
                canonical: canonicalUrl,
                languages: {
                    'vi-VN': `${tenantBaseUrl}/vi${path}`,
                    'km-KH': `${tenantBaseUrl}/km${path}`,
                    'en-US': `${tenantBaseUrl}/en${path}`,
                },
            },
            openGraph: {
                title: title,
                description: excerpt || '',
                images: article.thumbnail_url ? [article.thumbnail_url] : [],
                type: 'article',
                publishedTime: article.published_at || undefined,
                url: canonicalUrl,
            },
            twitter: {
                card: 'summary_large_image',
                title: title || '',
                description: excerpt || '',
                images: article.thumbnail_url ? [article.thumbnail_url] : [],
            }
        };
    }

    if (item?.type === 'category') {
        const categoryData = item.data as Category;
        return {
            title: `Danh mục: ${categoryData.name_vi} | Tin tức`,
            description: `Tổng hợp các bài viết thuộc danh mục ${categoryData.name_vi}`,
        };
    }

    return {
        title: 'Trang không tìm thấy',
    };
}

// ==========================================
// RENDER COMPONENT: Bài viết chi tiết
// ==========================================
function ArticleDetail({ article, relatedNews, locale, slugPath, tags = [], tenantId, tenantName, domain }: { article: News, relatedNews: News[], locale: string, slugPath: string[], tags: any[], tenantId?: string, tenantName?: string, domain: string }) {
    const readingTime = article.content_vi ? Math.ceil((article.content_vi.split(' ').length || 0) / 200) : 1;
    const currentUrl = `${getTenantBaseUrl(domain)}/${locale}/tin-tuc/${slugPath.join('/')}`;
    const vnPublishedDate = article.published_at ? getVietnamTime(new Date(article.published_at)) : null;

    // Determine author name
    const articleAuthor = article.tenant_id === '55555555-5555-5555-5555-555555555555' 
        ? 'Hệ thống'
        : (tenantName || 'Ban trị sự');

    return (
        <div className="bg-gray-50">
            {/* JSON-LD Article Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'NewsArticle',
                        headline: getLocalizedContent(article, locale, 'title'),
                        image: article.thumbnail_url ? [article.thumbnail_url] : [],
                        datePublished: article.published_at,
                        dateModified: article.updated_at || article.published_at,
                        author: {
                            '@type': 'Organization',
                            name: article.categories?.name_vi || articleAuthor,
                            url: getTenantBaseUrl(domain)
                        },
                        publisher: {
                            '@type': 'Organization',
                            name: article.categories?.name_vi || articleAuthor,
                            logo: {
                                '@type': 'ImageObject',
                                url: `${getTenantBaseUrl(domain)}/logo.png`
                            }
                        },
                        description: getLocalizedContent(article, locale, 'excerpt'),
                        mainEntityOfPage: {
                            '@type': 'WebPage',
                            '@id': currentUrl
                        }
                    }),
                }}
            />

            {/* Hero Section */}
            <div className="relative h-[400px] md:h-[500px] bg-coffee-dark overflow-hidden">
                {article.thumbnail_url && (
                    <>
                        {/* Blurred Background Layer */}
                        <Image
                            src={article.thumbnail_url}
                            alt="Background"
                            fill
                            className="object-cover opacity-30 blur-2xl scale-125 pointer-events-none"
                            aria-hidden="true"
                            sizes="100vw"
                        />
                        {/* Main Image Layer */}
                        <Image
                            src={article.thumbnail_url}
                            alt={getLocalizedContent(article, locale, 'title') || ''}
                            fill
                            className="object-contain drop-shadow-2xl z-10"
                            priority
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                        />
                    </>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />

                {/* Breadcrumbs */}
                <div className="absolute top-6 left-0 right-0 container mx-auto px-4 z-20">
                    <nav className="flex items-center gap-2 text-sm text-white/90 drop-shadow-md">
                        <Link href="/" className="hover:text-gold-light transition-colors">
                            Trang chủ
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link href="/tin-tuc" className="hover:text-gold-light transition-colors">
                            Tin tức
                        </Link>
                        {article.categories && (
                            <>
                                <ChevronRight className="h-4 w-4" />
                                <Link href={`/tin-tuc/${article.categories.slug}`} className="hover:text-gold-light transition-colors">
                                    {article.categories.name_vi}
                                </Link>
                            </>
                        )}
                    </nav>
                </div>

                {/* Title & Meta */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 z-20">
                    <div className="container mx-auto">
                        {article.categories && (
                            <Badge className="bg-gold-primary text-white mb-4">
                                {article.categories.name_vi}
                            </Badge>
                        )}
                        <h1 className="text-3xl md:text-5xl font-playfair font-bold text-white mb-4 max-w-4xl">
                            {getLocalizedContent(article, locale, 'title')}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                            {vnPublishedDate && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{format(vnPublishedDate, 'dd MMMM yyyy', { locale: vi })}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span className="capitalize">{readingTime} phút đọc</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-12 max-w-5xl">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-12 mb-16">
                    {getLocalizedContent(article, locale, 'excerpt') && (
                        <p className="text-xl text-gray-600 italic mb-8 pb-8 border-b">
                            {getLocalizedContent(article, locale, 'excerpt')}
                        </p>
                    )}
                    <div
                        id="article-content"
                        className="prose prose-base sm:prose-lg lg:prose-xl max-w-none prose-headings:font-playfair prose-headings:text-gold-primary prose-a:text-gold-primary hover:prose-a:text-gold-dark"
                        dangerouslySetInnerHTML={{ __html: getLocalizedContent(article, locale, 'content') || '' }}
                    />

                    {/* Nhúng khối Dự án kêu gọi đóng góp quỹ ngay dưới bài viết */}
                    <div className="mt-8">
                        <CallToDonateProjects locale={locale} tenantId={tenantId} />
                    </div>

                    {/* Tags */}
                    {tags.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-stone-100">
                            <h4 className="text-sm font-semibold text-stone-500 mb-4 uppercase tracking-wider">Chủ đề liên quan:</h4>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag: any) => (
                                    <Link
                                        key={tag.id}
                                        href={`/chu-de/${tag.slug}`}
                                        className="px-3 py-1.5 bg-stone-50 text-stone-600 text-xs font-medium rounded-full border border-stone-200 hover:bg-gold-primary hover:text-white hover:border-gold-primary transition-all flex items-center gap-1.5"
                                    >
                                        <Hash className="w-3 h-3 opacity-40" />
                                        {tag.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-8 pt-6 flex items-center justify-between">
                        <ShareButtons title={getLocalizedContent(article, locale, 'title') || ''} url={currentUrl} />
                    </div>
                </div>
            </div>

            {/* Related News - Bottom Grid */}
            {relatedNews.length > 0 && (
                <div className="bg-white border-t border-stone-200 pt-20 pb-24">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="text-center mb-14">
                            <p className="text-gold-primary text-xs font-semibold tracking-[0.25em] uppercase mb-3">
                                Khám Phá Thêm
                            </p>
                            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-coffee-dark mb-4">
                                Bài Viết Liên Quan
                            </h2>
                            <div className="w-12 h-0.5 bg-gold-primary mx-auto" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedNews.slice(0, 3).map((news) => (
                                <NewsCard
                                    key={news.id}
                                    slug={`${news.categories?.slug || article.categories?.slug || 'tin-tuc'}/${news.slug}`}
                                    title={getLocalizedContent(news, locale, 'title') || ''}
                                    excerpt={getLocalizedContent(news, locale, 'excerpt') || null}
                                    image_url={news.thumbnail_url}
                                    published_at={news.published_at || ''}
                                    author={news.tenant_id === '55555555-5555-5555-5555-555555555555' ? 'Hệ thống' : (tenantName || 'Ban trị sự')}
                                    category={news.categories || article.categories}
                                    locale={locale}
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                            ))}
                        </div>

                        <div className="mt-14 text-center">
                            <Link
                                href="/tin-tuc"
                                className="inline-flex items-center gap-2 text-gold-primary font-bold uppercase tracking-widest text-sm hover:text-gold-dark transition-colors group"
                            >
                                Xem tất cả bài viết
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ==========================================
// RENDER COMPONENT: Danh mục
// ==========================================
async function CategoryListing({ category, locale, page, slugPath, tenantId, tenantType, tenantName }: { category: Category, locale: string, page: number, slugPath: string[], tenantId?: string, tenantType?: string, tenantName?: string }) {
    const tree = await getCachedCategoriesTree(tenantId, tenantType);

    // Tìm node trong tree
    let node: any = tree.news.find((n: any) => n.id === category.id);
    if (!node) {
        // Tìm trong children nếu không phải root
        for (const root of tree.news) {
            const child = root.children.find((c: any) => c.id === category.id);
            if (child) {
                node = child;
                break;
            }
        }
    }

    const isParentCategory = node && node.children && node.children.length > 0;
    // NÂNG CẤP: Kiểm tra thông minh hơn, chấp nhận slug có gắn ID tenant (ví dụ: phat-su-hoang-phap-55555555)
    const isSpecialOverview = isParentCategory && (
        category.slug === 'phat-su-hoang-phap' ||
        category.slug.startsWith('phat-su-hoang-phap-')
    );

    if (isSpecialOverview) {
        // OVERVIEW PAGE — Chỉ áp dụng cho Phật Sự & Hoằng Pháp
        const childrenWithNews = await Promise.all(
            node.children.map(async (childNode: any) => {
                const news = await getCachedNewsByCategoryGroup([childNode.id], 3, tenantId);
                return { childNode, news: news || [] };
            })
        );

        return (
            <div className="min-h-screen bg-page-surface relative">
                {/* Background Pattern Texture */}
                <KhmerPatternBg className="opacity-15 pointer-events-none" />

                {/* Hero Layout - Sync with Giới Thiệu Style */}
                <div className="relative pt-32 pb-24 bg-coffee-dark overflow-hidden transition-all duration-700">
                    {/* Hero Background Image with Overlay */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src={category.image_url || "/images/hero/news-hero.webp"}
                            alt={category.name_vi}
                            fill
                            className="object-cover opacity-30 scale-105"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-coffee-dark/80 via-coffee-dark/50 to-coffee-dark" />
                        {/* Elegant Pattern Overlay */}
                        <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                            {/* Breadcrumbs - Refined */}
                            <nav className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] font-bold text-white/40 mb-10 transition-all hover:text-white/60">
                                <Link href="/" className="hover:text-gold-primary transition-colors">Trang chủ</Link>
                                <ChevronRight className="h-3 w-3 text-gold-primary/30" />
                                <Link href="/tin-tuc" className="hover:text-gold-primary transition-colors">Tin tức</Link>
                                <ChevronRight className="h-3 w-3 text-gold-primary/30" />
                                <span className="text-gold-primary">{category.name_vi}</span>
                            </nav>

                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-3 px-5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gold-primary animate-pulse" />
                                    <span className="text-gold-primary uppercase tracking-[0.25em] text-[10px] font-bold">
                                        {tenantId ? 'Thông báo mới nhất' : 'Bản tin hội chúng'}
                                    </span>
                                </div>
                                <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair font-black text-white leading-tight uppercase tracking-tight">
                                    <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
                                        {category.name_vi}
                                    </span>
                                </h1>
                                {category.description_vi && (
                                    <p className="text-lg md:text-xl text-gray-300 font-inter leading-relaxed max-w-2xl mx-auto opacity-80">
                                        {category.description_vi}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ornaments for the main container */}
                <KhmerCorner position="top-left" size="lg" className="text-gold-primary/20 top-24" />
                <KhmerCorner position="top-right" size="lg" className="text-gold-primary/20 top-24" />

                {/* Subcategory Sections - Split Layout */}
                <div className="py-16 md:py-32 flex flex-col gap-32 md:gap-56 overflow-hidden">
                    {childrenWithNews.map(({ childNode, news }, idx) => {
                        const isEven = idx % 2 === 0;
                        const childName = locale === 'km' && childNode.name_km ? childNode.name_km
                            : locale === 'en' && childNode.name_en ? childNode.name_en
                                : childNode.name_vi;
                        const sectionImage = childNode.image_url || news[0]?.thumbnail_url || '/images/hero/news-hero.webp';
                        const sectionDescription = childNode[`description_${locale}` as 'description_vi']
                            || childNode.description_vi
                            || `Cùng tìm hiểu về các hoạt động ${childName.toLowerCase()} tại ${tenantName || 'chi nhánh'}.`;

                        const latestDate = news[0]?.published_at;

                        return (
                            <section key={childNode.id} className="container mx-auto px-4">
                                <div className={cn(
                                    "flex flex-col gap-16 lg:items-center",
                                    isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                                )}>
                                    {/* Text Side */}
                                    <div className="flex-1 space-y-10 relative z-10">
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-[2px] bg-gold-primary/30" />
                                                <span className="text-gold-primary uppercase tracking-[0.3em] text-[11px] font-black">
                                                    Hạng mục {idx + 1}
                                                </span>
                                            </div>

                                            <div className="space-y-4">
                                                <h2 className="text-4xl lg:text-7xl font-playfair font-bold text-coffee-dark leading-[1.1] transition-colors hover:text-gold-primary">
                                                    <Link href={`/tin-tuc/${childNode.slug}`}>
                                                        {childName}
                                                    </Link>
                                                </h2>

                                                {/* Meta Row - NEW */}
                                                <div className="flex items-center gap-6 text-[13px] text-gray-400 font-medium">
                                                    {latestDate && (
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-gold-primary/60" />
                                                            <span>Cập nhật {format(getVietnamTime(new Date(latestDate)), 'dd/MM/yyyy')}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-gold-primary/60" />
                                                        <span>{news[0]?.tenant_id === '55555555-5555-5555-5555-555555555555' ? 'Hệ thống' : (tenantName || 'Ban trị sự')}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-lg lg:text-2xl text-gray-500 font-inter leading-relaxed max-w-xl opacity-90">
                                                {sectionDescription}
                                            </p>
                                        </div>

                                        <Link
                                            href={`/tin-tuc/${childNode.slug}`}
                                            className="group relative inline-flex items-center gap-4 text-gold-primary hover:text-coffee-dark transition-all duration-300"
                                        >
                                            <span className="font-bold uppercase tracking-[0.25em] text-[12px] border-b-2 border-gold-primary/20 pb-1 group-hover:border-coffee-dark">
                                                Khám phá ngay
                                            </span>
                                            <div className="w-10 h-10 rounded-full border border-gold-primary/30 flex items-center justify-center group-hover:bg-gold-primary group-hover:border-gold-primary transition-all">
                                                <ArrowRight className="w-4 h-4 group-hover:text-white transition-colors" />
                                            </div>
                                        </Link>
                                    </div>

                                    {/* Image Side - Refined Frame Style */}
                                    <div className="flex-1 relative group">
                                        <Link
                                            href={`/tin-tuc/${childNode.slug}`}
                                            className="block relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-[10px] border-white ring-1 ring-gold-primary/5 transition-all duration-700 hover:shadow-2xl hover:-translate-y-2"
                                        >
                                            <Image
                                                src={sectionImage}
                                                alt={childName}
                                                fill
                                                className="object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110"
                                                sizes="(max-width: 1024px) 100vw, 50vw"
                                            />
                                            {/* Decorative Internal Frame */}
                                            <div className="absolute inset-6 border border-white/40 rounded-[1.5rem] pointer-events-none z-10"></div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-coffee-dark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                        </Link>

                                        {/* Background Decoration Boxes - Enhanced */}
                                        <div className="absolute -z-10 top-10 -right-10 w-full h-full bg-gold-primary/5 rounded-[2rem] transition-transform duration-700 group-hover:translate-x-4 group-hover:-translate-y-4 hidden lg:block pointer-events-none"></div>
                                        <div className="absolute -z-20 -bottom-10 -left-10 w-full h-full border border-gold-primary/10 rounded-[2rem] transition-transform duration-700 group-hover:-translate-x-4 group-hover:translate-y-4 hidden lg:block pointer-events-none"></div>

                                        {/* Floating Badge - NEW */}
                                        <div className="absolute -bottom-6 right-10 bg-white shadow-xl rounded-2xl px-6 py-4 z-20 hidden md:block border border-gold-primary/5 transform group-hover:-translate-y-2 transition-transform duration-500">
                                            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Tin mới nhất</div>
                                            <div className="text-coffee-dark font-black text-xs line-clamp-1 max-w-[150px]">
                                                {news[0]?.title_vi || "Chưa có bài viết"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        );
                    })}
                </div>

                {/* Recent News Grid Section at the bottom of Overview */}
                <div className="container mx-auto px-4 py-24 border-t border-gray-100">
                    <div className="flex flex-col items-center gap-4 mb-16 text-center">
                        <span className="text-gold-primary uppercase tracking-[0.3em] text-[10px] font-black">Cập nhật mới</span>
                        <h2 className="text-3xl md:text-5xl font-playfair font-black text-coffee-dark uppercase tracking-tight">
                            Bài viết gần đây
                        </h2>
                        <div className="w-12 h-1 bg-gold-primary rounded-full mt-2" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {childrenWithNews.flatMap(({ news }) => news).slice(0, 6).map((article: any, index: number) => (
                            <NewsCard
                                key={article.id}
                                slug={article.slug}
                                title={article[`title_${locale}`] ?? article.title_vi ?? ''}
                                excerpt={article[`excerpt_${locale}`] ?? article.excerpt_vi ?? null}
                                image_url={article.thumbnail_url}
                                published_at={article.published_at || ''}
                                author={article.tenant_id === '55555555-5555-5555-5555-555555555555' ? 'Hệ thống' : (tenantName || 'Ban trị sự')}
                                category={article.categories}
                                locale={locale}
                                priority={index < 3}
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                        ))}
                    </div>
                </div>

                {/* Bottom CTA Section - Enriched */}
                <div className="relative py-32 bg-coffee-dark overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-gold-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-saffron/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

                    <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
                        <KhmerHeading className="text-gold-primary mb-8 opacity-80" level={2}>អនុមោទនា</KhmerHeading>
                        <h2 className="text-4xl lg:text-6xl font-playfair font-black text-white mb-8 uppercase tracking-wide leading-tight">
                            {tenantId ? 'Vươn tầm giá trị' : 'Lan tỏa chánh pháp'} <br /><span className="text-gold-primary">&</span> {tenantId ? 'Kiến tạo tương lai' : 'Phật sự viên thành'}
                        </h2>
                        <p className="text-gray-400 text-lg md:text-xl mb-12 leading-relaxed font-inter max-w-2xl mx-auto opacity-70">
                            {tenantId
                                ? 'Cùng chúng tôi cập nhật những hoạt động ý nghĩa và lan tỏa giá trị tích cực đến cộng đồng.'
                                : 'Cập nhật những hoạt động ý nghĩa và lan tỏa năng lượng bình an đến cộng đồng.'}
                        </p>
                        <Link href="/tin-tuc" className="group inline-flex items-center gap-4 px-12 py-5 bg-gold-primary text-white font-black rounded-full hover:bg-white hover:text-gold-primary transition-all duration-300 shadow-2xl shadow-gold-primary/20 uppercase tracking-widest text-[13px]">
                            Xem tất cả tin tức
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (isParentCategory) {
        // STANDARD LISTING — Cho các danh mục cha khác: liệt kê bài viết theo nhóm
        return (
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="text-center mb-10 md:mb-16">
                    <KhmerHeading level={1} withDivider>
                        {category.name_vi}
                    </KhmerHeading>
                </div>

                <div className="space-y-10 md:space-y-16">
                    {node.children.map(async (childNode: any, bIdx: number) => {
                        const news = await getCachedNewsByCategoryGroup([childNode.id], 6, tenantId);
                        if (!news || news.length === 0) return null;

                        const showSeeMore = news.length >= 6;

                        return (
                            <section key={childNode.id} className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                                <CategorySectionHeader category={childNode} baseHref="/tin-tuc" />
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-6">
                                    {news.map((article: any, index: number) => (
                                        <NewsCard
                                            key={article.id}
                                            slug={`${article.slug}`}
                                            title={article[`title_${locale}`] ?? article.title_vi ?? ''}
                                            excerpt={article[`excerpt_${locale}`] ?? article.excerpt_vi ?? null}
                                            image_url={article.thumbnail_url}
                                            published_at={article.published_at || ''}
                                            author={article.tenant_id === '55555555-5555-5555-5555-555555555555' ? 'Hệ thống' : (tenantName || 'Ban trị sự')}
                                            category={article.categories}
                                            locale={locale}
                                            priority={bIdx === 0 && index < 3}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                    ))}
                                </div>
                                {showSeeMore && (
                                    <div className="mt-8 flex justify-end">
                                        <Link
                                            href={`/tin-tuc/${childNode.slug}`}
                                            className="text-sm font-semibold text-gold-dark hover:text-coffee-dark uppercase tracking-wider transition-colors inline-block pb-1 border-b border-transparent hover:border-coffee-dark"
                                        >
                                            Xem thêm {locale === 'vi' ? childNode.name_vi : childNode.name_km || childNode.name_vi} →
                                        </Link>
                                    </div>
                                )}
                            </section>
                        );
                    })}
                </div>
            </div>
        );
    }

    // IF IT'S A LEAF CATEGORY (NO CHILDREN), RENDER PAGINATED LIST
    const ITEMS_PER_PAGE = 12;
    const { news, total } = await getCachedNewsPage(page, category.id, ITEMS_PER_PAGE, tenantId);
    const totalPages = total ? Math.ceil(total / ITEMS_PER_PAGE) : 0;
    const currentPath = `/tin-tuc/${slugPath.join('/')}`;

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="text-center mb-10 md:mb-12">
                <KhmerHeading level={1} withDivider>
                    {category.name_vi}
                </KhmerHeading>
            </div>

            {news.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
                        {news.map((article: any, index: number) => (
                            <NewsCard
                                key={article.id}
                                slug={`${article.slug}`}
                                title={article[`title_${locale}`] ?? article.title_vi ?? ''}
                                excerpt={article[`excerpt_${locale}`] ?? article.excerpt_vi ?? null}
                                image_url={article.thumbnail_url}
                                published_at={article.published_at || ''}
                                author={article.tenant_id === '55555555-5555-5555-5555-555555555555' ? 'Hệ thống' : (tenantName || 'Ban trị sự')}
                                category={article.categories}
                                locale={locale}
                                priority={index < 3}
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <nav className="flex justify-center items-center gap-2 mt-8">
                            {page > 1 && (
                                <Link href={`${currentPath}?page=${page - 1}`} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                    ← Trước
                                </Link>
                            )}
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <Link
                                    key={pageNum}
                                    href={`${currentPath}?page=${pageNum}`}
                                    className={`px-4 py-2 border rounded-md ${page === pageNum ? 'bg-gold-primary text-white border-gold-primary' : 'border-gray-300 hover:bg-gray-50'}`}
                                >
                                    {pageNum}
                                </Link>
                            ))}
                            {page < totalPages && (
                                <Link href={`${currentPath}?page=${page + 1}`} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                    Sau →
                                </Link>
                            )}
                        </nav>
                    )}
                </>
            ) : (
                <div className="text-center py-20 text-gray-500 text-lg">
                    Chưa có bài viết trong danh mục này
                </div>
            )}
        </div>
    );
}

// ==========================================
// MAIN PAGE
// ==========================================
export default async function CatchAllNewsPage({ params, searchParams }: Props) {
    const { domain, slug, locale } = await params;
    const search = await searchParams;
    const lastSlug = slug[slug.length - 1];

    const tenant = await getTenantConfig(domain);
    const tenantId = tenant?.id;

    // Lấy dữ liệu qua hàm Cache Request-level
    const item = await getNewsItem(lastSlug, tenantId);

    if (item?.type === 'article') {
        const { article, relatedNews, tags } = item.data;

        return (
            <ArticleDetail
                article={article as News}
                relatedNews={relatedNews as News[]}
                locale={locale}
                slugPath={slug}
                tags={tags}
                tenantId={tenantId}
                tenantName={tenant?.name}
                domain={domain}
            />
        );
    }

    if (item?.type === 'category') {
        const page = Math.max(1, Number(search?.page) || 1);
        return <CategoryListing category={item.data as Category} locale={locale} page={page} slugPath={slug} tenantId={tenantId} tenantType={tenant?.tenant_type} tenantName={tenant?.name} />;
    }

    // 404
    notFound();
}
