'use client';
import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

interface NewsItem {
    id: string;
    title_vi: string;
    slug: string;
    thumbnail_url?: string | null;
    published_at?: string | null;
    short_description_vi?: string | null;
    categories?: { name_vi?: string | null } | null;
}

interface InkFeatureStoryProps {
    news?: NewsItem[];
}

const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' }) : '';

/**
 * InkFeatureStory — Editorial main + 2 secondary layout
 * Mobile: stacked list | Desktop: 2-col split (1 main bên trái, 2 phụ bên phải)
 */
export function InkFeatureStory({ news = [] }: InkFeatureStoryProps) {
    if (!news.length) return null;

    const [main, ...rest] = news;
    const secondaries = rest.slice(0, 2);
    const count = String(news.length).padStart(2, '0');

    return (
        <section className="py-14 md:py-20 px-5 md:px-10 lg:px-16" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="max-w-7xl mx-auto">

                {/* Section header */}
                <div className="flex items-baseline justify-between mb-8 md:mb-10 pb-4" style={{ borderBottom: '1px solid rgba(15,15,15,0.1)' }}>
                    <div className="flex items-baseline gap-4">
                        <span
                            className="text-[10px] font-black tracking-[0.45em] uppercase"
                            style={{ color: '#C41E3A' }}
                        >
                            Tin Tức Nổi Bật
                        </span>
                        <span className="text-[11px] font-light" style={{ color: '#6B6B6B' }}>— {count} bài</span>
                    </div>
                    <Link
                        href="/tin-tuc"
                        className="text-[10px] font-black tracking-[0.3em] uppercase flex items-center gap-2 transition-all hover:gap-3 duration-200"
                        style={{ color: '#0F0F0F' }}
                    >
                        Tất cả
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>

                {/* Layout: single col mobile, 2-col desktop */}
                <div className="flex flex-col md:flex-row gap-8 md:gap-0">

                    {/* Main feature article */}
                    <Link href={`/tin-tuc/${main.slug}`} className="group md:w-[58%] md:pr-10 md:border-r block" style={{ borderColor: 'rgba(15,15,15,0.1)' }}>
                        {main.thumbnail_url && (
                            <div className="w-full aspect-[4/3] relative overflow-hidden mb-5">
                                <Image
                                    src={main.thumbnail_url}
                                    alt={main.title_vi}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 768px) 100vw, 55vw"
                                    unoptimized
                                />
                                {/* Red corner */}
                                <div
                                    className="absolute top-0 left-0 w-0 h-0"
                                    style={{
                                        borderLeft: '4px solid #C41E3A',
                                        borderTop: '4px solid #C41E3A',
                                        width: '28px',
                                        height: '28px',
                                        borderRight: 'none',
                                        borderBottom: 'none',
                                    }}
                                />
                            </div>
                        )}
                        {main.categories?.name_vi && (
                            <span className="text-[9px] font-black tracking-[0.4em] uppercase block mb-2" style={{ color: '#C41E3A' }}>
                                {main.categories.name_vi}
                            </span>
                        )}
                        <h2
                            className="text-2xl sm:text-3xl font-black leading-snug mb-3 group-hover:opacity-70 transition-opacity"
                            style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#0F0F0F' }}
                        >
                            {main.title_vi}
                        </h2>
                        {main.short_description_vi && (
                            <p className="text-sm leading-relaxed line-clamp-3 mb-4" style={{ color: '#6B6B6B' }}>
                                {main.short_description_vi}
                            </p>
                        )}
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold" style={{ color: '#6B6B6B' }}>{fmtDate(main.published_at)}</span>
                        </div>
                    </Link>

                    {/* Secondary articles (hidden on mobile if main is shown, or stacked) */}
                    <div className="md:flex-1 md:pl-10 flex flex-col gap-6">
                        {secondaries.map((item, i) => (
                            <React.Fragment key={item.id}>
                                <Link href={`/tin-tuc/${item.slug}`} className="group flex gap-4">
                                    {item.thumbnail_url && (
                                        <div className="shrink-0 w-24 h-20 sm:w-28 sm:h-24 relative overflow-hidden">
                                            <Image
                                                src={item.thumbnail_url}
                                                alt={item.title_vi}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="112px"
                                                unoptimized
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        {item.categories?.name_vi && (
                                            <span className="text-[9px] font-black tracking-[0.35em] uppercase block mb-1" style={{ color: '#C41E3A' }}>
                                                {item.categories.name_vi}
                                            </span>
                                        )}
                                        <h3
                                            className="text-base font-black leading-snug group-hover:opacity-70 transition-opacity line-clamp-2"
                                            style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#0F0F0F' }}
                                        >
                                            {item.title_vi}
                                        </h3>
                                        <span className="text-[10px] mt-1 block" style={{ color: '#6B6B6B' }}>{fmtDate(item.published_at)}</span>
                                    </div>
                                </Link>
                                {i < secondaries.length - 1 && (
                                    <div className="h-px" style={{ backgroundColor: 'rgba(15,15,15,0.08)' }} />
                                )}
                            </React.Fragment>
                        ))}

                        {/* Extra news list — visible on mobile only as simple list */}
                        {rest.slice(2, 5).length > 0 && (
                            <div className="md:hidden pt-4" style={{ borderTop: '1px solid rgba(15,15,15,0.08)' }}>
                                {rest.slice(2, 5).map((item) => (
                                    <Link key={item.id} href={`/tin-tuc/${item.slug}`} className="flex items-start gap-3 py-3 group" style={{ borderBottom: '1px solid rgba(15,15,15,0.06)' }}>
                                        <div className="shrink-0 w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: '#C41E3A' }} />
                                        <h3
                                            className="text-sm font-bold leading-snug line-clamp-2 group-hover:opacity-60 transition-opacity"
                                            style={{ color: '#0F0F0F' }}
                                        >
                                            {item.title_vi}
                                        </h3>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
