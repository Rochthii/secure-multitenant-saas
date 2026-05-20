import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { NewsCard } from '@/components/news/news-card';
import { getLocalizedContent } from '@/lib/utils/localized-content';
import { Link } from '@/i18n/routing';
import { Hash, Library, MessageCircle, FileText, ArrowRight, Sparkles, FolderOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
    const siteName = tenantConfig?.name || "McAaron B2B SaaS";

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
        title: `Chủ đề: ${tagName} | ${siteName}`,
        description: `Tổng hợp các bài viết truyền thông, tài liệu hướng dẫn và quy trình SOP liên quan đến chủ đề "${tagName}"`,
        alternates: {
            canonical: canonicalUrl,
            languages: {
                'vi-VN': `${tenantBaseUrl}/vi${path}`,
                'km-KH': `${tenantBaseUrl}/km${path}`,
                'en-US': `${tenantBaseUrl}/en${path}`,
            },
        },
        openGraph: {
            title: `Chủ đề chuyên sâu: ${tagName} | ${siteName}`,
            description: `Khám phá các tài liệu nội bộ, thông tin truyền thông và SOP hướng dẫn về "${tagName}" tại ${siteName}`,
            url: canonicalUrl,
            siteName: siteName,
            locale: locale === 'km' ? 'km_KH' : locale === 'en' ? 'en_US' : 'vi_VN',
            type: 'website',
            images: [
                {
                    url: `${tenantBaseUrl}/images/og-default.jpg`,
                    width: 1200,
                    height: 630,
                    alt: `Chủ đề ${tagName}`,
                }
            ],
        }
    };
}

// ─── Document Card ────────────────────────────────────────────────────────
function DocumentItem({ doc, locale }: { doc: any; locale: string }) {
    const displayImage = doc.thumbnail_url || (doc.type === 'image' ? doc.url : null);

    return (
        <div className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-zinc-800/80 hover:shadow-md transition-all flex flex-col">
            <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-zinc-850">
                {displayImage ? (
                    <Image src={displayImage} alt={doc.title_vi} fill sizes="(max-width: 768px) 50vw, 16vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-zinc-700">
                        <FileText className="w-10 h-10" />
                    </div>
                )}
                <div className="absolute top-3 left-3">
                    <Badge className="bg-violet-600/90 text-white text-[10px] uppercase font-bold tracking-wider">{doc.type}</Badge>
                </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-800 dark:text-zinc-200 text-sm mb-3 line-clamp-2 leading-snug">
                    {getLocalizedContent(doc, locale, 'title')}
                </h3>
                <div className="mt-auto">
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-500 flex items-center gap-1">
                        Xem chi tiết <ArrowRight className="w-3.5 h-3.5" />
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

    // Dharma Talks (Dùng cho Học liệu Video & SOP Video)
    const { data: talkItems } = await (supabase as any)
        .from('dharma_talk_tags')
        .select('dharma_talks(*)')
        .eq('tag_id', (tag as any).id);

    const talks = talkItems?.map((t: any) => t.dharma_talks).filter((t: any) => t?.is_active) || [];

    const hasContent = news.length > 0 || media.length > 0 || talks.length > 0;

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 pb-20">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-slate-900 dark:bg-zinc-950 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))]" />
                <div className="container relative z-10 mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 dark:bg-zinc-900/50 rounded-full text-violet-400 text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-sm border border-white/10 dark:border-zinc-800">
                        <Hash className="w-3.5 h-3.5" /> Chủ đề chuyên môn
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
                        {(tag as any).name}
                    </h1>
                    <div className="w-12 h-1 bg-violet-500 mx-auto mb-6 rounded-full" />
                    <p className="max-w-xl mx-auto text-slate-300 text-sm font-medium leading-relaxed italic opacity-85">
                        Tổng hợp kiến thức, bài viết truyền thông, tài liệu quy trình SOP và video hướng dẫn nội bộ liên quan đến chuyên đề này.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 -mt-8 relative z-20 max-w-7xl">
                {!hasContent ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl p-20 text-center border border-slate-200/80 dark:border-zinc-800/80">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-zinc-950 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-100 dark:border-zinc-800">
                            <Hash className="w-10 h-10 text-slate-300 dark:text-zinc-750" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 mb-2">Chưa có nội dung liên kết</h2>
                        <p className="text-slate-400 max-w-sm mx-auto text-sm">Chủ đề này hiện chưa có bài viết hay tài liệu học liệu nào được đồng bộ. Vui lòng kiểm tra lại sau.</p>
                        <Link href="/" className="mt-8 inline-block bg-violet-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-violet-500 transition-all shadow-md shadow-violet-900/10">Quay lại trang chủ</Link>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {/* News Section */}
                        {news.length > 0 && (
                            <section className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-8 border-b border-slate-100 dark:border-zinc-800 pb-4">
                                    <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                                        <MessageCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100">Tin tức & Sự kiện</h2>
                                        <p className="text-xs text-slate-450 mt-0.5">Thông tin truyền thông và tin tức hoạt động liên quan</p>
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

                        {/* Video & SOP Video Section */}
                        {talks.length > 0 && (
                            <section className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-8 border-b border-slate-100 dark:border-zinc-800 pb-4">
                                    <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                                        <Library className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100">Video Quy Trình & SOP</h2>
                                        <p className="text-xs text-slate-450 mt-0.5">Học liệu, hướng dẫn và tài liệu quy chuẩn dạng video</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {talks.map((talk: any) => (
                                        <div key={talk.id} className="group bg-slate-50 dark:bg-zinc-950 rounded-2xl overflow-hidden border border-slate-100 dark:border-zinc-850 hover:shadow-lg transition-all duration-500">
                                            <div className="relative aspect-video">
                                                <Image src={talk.thumbnail_url} alt={talk.title_vi} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                                <div className="absolute bottom-3 right-3 px-2 py-1 bg-slate-900/80 text-white text-[10px] rounded font-mono font-bold">
                                                    {talk.duration || 'Video'}
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <h3 className="font-bold text-slate-800 dark:text-zinc-200 text-lg mb-4 line-clamp-2 leading-snug group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                                    {getLocalizedContent(talk, locale, 'title')}
                                                </h3>
                                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-zinc-900">
                                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Học liệu Video</span>
                                                    <a href={talk.youtube_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-500 flex items-center gap-1">
                                                        Xem hướng dẫn <ArrowRight className="w-3.5 h-3.5" />
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
                            <section className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-8 border-b border-slate-100 dark:border-zinc-800 pb-4">
                                    <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                                        <FolderOpen className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100">Hồ sơ & Tài liệu Văn bản</h2>
                                        <p className="text-xs text-slate-450 mt-0.5">Quy chuẩn văn bản, biểu mẫu và quy trình hệ thống</p>
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
