import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { KhmerHeading } from '@/components/ui/khmer-heading';
import { KhmerPatternBg } from '@/components/ui/khmer-pattern-bg';
import { NewsCard } from '@/components/news/news-card';
import { getLocalizedContent } from '@/lib/utils/localized-content';
import { Link } from '@/i18n/routing';
import { Hash, Library, MessageCircle, FileText, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Image from 'next/image';

type Props = {
    params: Promise<{ slug: string; locale: string }>;
};

import { getTenantBaseUrl } from '@/lib/utils/seo';
import { getTenantConfig } from '@/lib/tenant';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, locale, domain } = await params as any;
    const supabase = await createClient();
    const tenantConfig = await getTenantConfig(domain);
    const isCompany = tenantConfig?.tenant_type !== 'tenant';

    const { data: tag } = await (supabase as any)
        .from('tags')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

    if (!tag) return { title: 'Không tìm thấy chủ đề' };

    const tagName = (tag as any).name;
    const path = `/chu-de/${slug}`;
    const tenantBaseUrl = getTenantBaseUrl(domain);
    const canonicalUrl = `${tenantBaseUrl}/${locale}${path}`;

    return {
        title: `Chủ đề: ${tagName} | Multi-tenant Ecosystem`,
        description: `Tổng hợp các nội dung bài viết, pháp thoại và tài liệu liên quan đến chủ đề "${tagName}" tại Multi-tenant Ecosystem.`,
        alternates: {
            canonical: canonicalUrl,
            languages: {
                'vi-VN': `${tenantBaseUrl}/vi${path}`,
                'km-KH': `${tenantBaseUrl}/km${path}`,
                'en-US': `${tenantBaseUrl}/en${path}`,
            },
        },
        openGraph: {
            title: `${isCompany ? 'Chủ đề' : 'Chủ đề tâm linh'}: ${tagName} | Multi-tenant Ecosystem`,
            description: `Khám phá các nội dung bài viết, ${isCompany ? 'tài liệu nội bộ' : 'pháp thoại'} và tài liệu ${isCompany ? 'chuyên môn' : 'tu học'} về ${tagName} tại Multi-tenant Ecosystem.`,
            url: canonicalUrl,
            siteName: 'Multi-tenant Ecosystem',
            locale: locale === 'km' ? 'km_KH' : locale === 'en' ? 'en_US' : 'vi_VN',
            type: 'website',
            images: [
                {
                    url: `${tenantBaseUrl}/images/og-default.jpg`,
                    width: 1200,
                    height: 630,
                    alt: `Chủ đề ${tagName} - Multi-tenant Ecosystem`,
                }
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `Chủ đề: ${tagName} | Multi-tenant Ecosystem`,
            description: `Khám phá nội dung về ${tagName} tại Multi-tenant Ecosystem.`,
            images: [`${tenantBaseUrl}/images/og-default.jpg`],
        }
    };
}

// ─── Document Card (Simplified version for Tag page) ────────────────────────
function DocumentItem({ doc, locale }: { doc: any; locale: string }) {
    const displayImage = doc.thumbnail_url || (doc.type === 'image' ? doc.url : null);

    return (
        <div className="group bg-white rounded-xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-md transition-all flex flex-col">
            <div className="relative aspect-video overflow-hidden bg-stone-100">
                {displayImage ? (
                    <Image src={displayImage} alt={doc.title_vi} fill sizes="(max-width: 768px) 50vw, 16vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-200">
                        <FileText className="w-10 h-10" />
                    </div>
                )}
                <div className="absolute top-2 left-2">
                    <Badge className="bg-gold-primary/90 text-white text-[10px] uppercase">{doc.type}</Badge>
                </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-stone-800 text-sm mb-2 line-clamp-2 leading-tight uppercase tracking-tight">
                    {getLocalizedContent(doc, locale, 'title')}
                </h3>
                <div className="mt-auto">
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-gold-dark hover:underline flex items-center gap-1 uppercase tracking-widest">
                        Xem tài liệu <ArrowRight className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </div>
    );
}

export default async function TagPage({ params }: Props) {
    const { slug, locale, domain } = await params as any;
    const supabase = await createClient();
    const tenantConfig = await getTenantConfig(domain);
    const isCompany = tenantConfig?.tenant_type !== 'tenant';

    // 1. Fetch Tag info
    const { data: tag } = await (supabase as any)
        .from('tags')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

    if (!tag) notFound();

    // 2. Fetch all related content
    // News
    const { data: newsItems } = await (supabase as any)
        .from('news_tags')
        .select('news(*, categories(*))')
        .eq('tag_id', (tag as any).id);

    const news = newsItems?.map((n: any) => n.news).filter((n: any) => n?.status === 'published') || [];

    // Media
    const { data: mediaItems } = await (supabase as any)
        .from('media_tags')
        .select('media(*)')
        .eq('tag_id', (tag as any).id);

    const media = mediaItems?.map((m: any) => m.media).filter(Boolean) || [];

    // Dharma Talks
    const { data: talkItems } = await (supabase as any)
        .from('dharma_talk_tags')
        .select('dharma_talks(*)')
        .eq('tag_id', (tag as any).id);

    const talks = talkItems?.map((t: any) => t.dharma_talks).filter((t: any) => t?.is_active) || [];

    const hasContent = news.length > 0 || media.length > 0 || talks.length > 0;

    return (
        <div className="min-h-screen bg-stone-50/50 pb-20">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-coffee-dark text-white overflow-hidden">
                <KhmerPatternBg className="opacity-10" />
                <div className="container relative z-10 mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-gold-light text-xs font-bold uppercase tracking-[0.2em] mb-6 backdrop-blur-sm border border-white/10">
                        <Hash className="w-4 h-4 text-gold-primary" /> {isCompany ? 'Chủ đề' : 'Chủ đề tâm linh'}
                    </div>
                    <KhmerHeading level={1} className="!text-white !text-4xl lg:!text-6xl mb-6 uppercase tracking-tighter" withDivider={false}>
                        {(tag as any).name}
                    </KhmerHeading>
                    <div className="w-12 h-1 bg-gold-primary mx-auto mb-6" />
                    <p className="max-w-xl mx-auto text-stone-300 text-sm font-medium leading-relaxed italic opacity-80">
                        {isCompany ? `Tổng hợp kiến thức và nội dung chuyên môn liên quan đến "${(tag as any).name}"` : `Tổng hợp kiến thức và nội dung tu học liên quan đến "${(tag as any).name}"`}
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 -mt-8 relative z-20">
                {!hasContent ? (
                    <div className="bg-white rounded-3xl shadow-xl p-20 text-center border border-stone-200">
                        <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Hash className="w-10 h-10 text-stone-200" />
                        </div>
                        <h2 className="text-2xl font-playfair font-bold text-stone-800 mb-2">Chưa có nội dung</h2>
                        <p className="text-stone-400 max-w-sm mx-auto">Chủ đề này hiện chưa có bài viết hay tài liệu nào được liên kết. Quý vị vui lòng quay lại sau.</p>
                        <Link href="/" className="mt-8 inline-block bg-gold-primary text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-gold-dark transition-all">Quay lại trang chủ</Link>
                    </div>
                ) : (
                    <div className="space-y-20">
                        {/* News Section */}
                        {news.length > 0 && (
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-2 bg-amber-50 rounded-lg">
                                        <MessageCircle className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-playfair font-bold text-stone-800">Tin tức & Sự kiện</h2>
                                        <div className="w-10 h-0.5 bg-amber-300 mt-1" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {news.map((item: any) => (
                                        <NewsCard
                                            key={item.id}
                                            slug={`${item.categories?.slug || 'tin-tuc'}/${item.slug}`}
                                            title={getLocalizedContent(item, locale, 'title') || ''}
                                            excerpt={getLocalizedContent(item, locale, 'excerpt') || null}
                                            image_url={item.thumbnail_url}
                                            published_at={item.published_at || ''}
                                            author={null}
                                            category={item.categories}
                                            locale={locale}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Dharma Talks Section */}
                        {talks.length > 0 && (
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-2 bg-rose-50 rounded-lg">
                                        <Library className="w-5 h-5 text-rose-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-playfair font-bold text-stone-800">{isCompany ? 'Tài liệu Nội bộ / E-Learning' : 'Pháp thoại tu tập'}</h2>
                                        <div className="w-10 h-0.5 bg-rose-300 mt-1" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {talks.map((talk: any) => (
                                        <div key={talk.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-xl transition-all duration-500">
                                            <div className="relative aspect-video">
                                                <Image src={talk.thumbnail_url} alt={talk.title_vi} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-[10px] rounded font-mono">
                                                    {talk.duration || 'Video'}
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <h3 className="font-bold text-stone-800 text-lg mb-4 line-clamp-2 leading-tight group-hover:text-gold-primary transition-colors">
                                                    {getLocalizedContent(talk, locale, 'title')}
                                                </h3>
                                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-50">
                                                    <span className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">{isCompany ? 'Tài liệu Video' : 'Pháp thoại'}</span>
                                                    <a href={talk.youtube_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-gold-primary hover:text-gold-dark flex items-center gap-1 uppercase tracking-widest">
                                                        Xem trên YouTube <ArrowRight className="w-3 h-3" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Documents Section */}
                        {media.length > 0 && (
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-2 bg-teal-50 rounded-lg">
                                        <FileText className="w-5 h-5 text-teal-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-playfair font-bold text-stone-800">{isCompany ? 'Tài liệu & Hồ sơ' : 'Kinh sách & Tài liệu'}</h2>
                                        <div className="w-10 h-0.5 bg-teal-300 mt-1" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                    {media.map((doc: any) => (
                                        <DocumentItem key={doc.id} doc={doc} locale={locale} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
