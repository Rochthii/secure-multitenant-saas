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
    categories?: { name_vi?: string } | null;
}

interface AngkorNewspaperProps {
    news?: NewsItem[];
    locale?: string;
}

export function AngkorNewspaper({ news = [], locale = 'vi' }: AngkorNewspaperProps) {
    if (!news.length) return null;

    const displayed = news.slice(0, 3);
    const formatDate = (d?: string | null) =>
        d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

    return (
        <section style={{ backgroundColor: '#F5EDD8' }} className="py-20 px-6 lg:px-16">
            <div className="max-w-7xl mx-auto">

                {/* Header — newspaper masthead */}
                <div className="text-center pb-8 mb-10 relative">
                    <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(to right, transparent, #D4A843, transparent)' }} />
                    <span
                        className="text-[10px] tracking-[0.5em] font-bold uppercase block mb-3 mt-8"
                        style={{ color: '#D4A843' }}
                    >
                        Kỷ Yếu Phật Sự
                    </span>
                    <h2
                        className="text-4xl lg:text-5xl font-black uppercase tracking-widest"
                        style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#1A0E06' }}
                    >
                        Tin Tức & Sự Kiện
                    </h2>
                    <p
                        className="mt-3 text-sm italic"
                        style={{ color: 'rgba(60,30,10,0.55)' }}
                    >
                        Ghi chép những chuyển động Phật pháp hàng ngày
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-3">
                        <div className="h-px flex-1 max-w-24" style={{ backgroundColor: '#D4A843' }} />
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D4A843' }} />
                        <div className="h-px flex-1 max-w-24" style={{ backgroundColor: '#D4A843' }} />
                    </div>
                </div>

                {/* 3-column newspaper grid */}
                <div className="grid lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x" style={{ borderColor: 'rgba(60,30,10,0.12)' }}>
                    {displayed.map((item, i) => (
                        <article key={item.id} className="px-6 py-2 lg:py-0 flex flex-col group">

                            {/* Date + Category */}
                            <div className="flex items-center gap-3 mb-4 pt-2 lg:pt-0">
                                <span
                                    className="text-[10px] font-black tracking-[0.2em] uppercase"
                                    style={{ color: '#D4A843' }}
                                >
                                    {formatDate(item.published_at)}
                                </span>
                                {item.categories?.name_vi && (
                                    <>
                                        <span style={{ color: 'rgba(60,30,10,0.3)' }}>·</span>
                                        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(60,30,10,0.5)' }}>
                                            {item.categories.name_vi}
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Thumbnail */}
                            {item.thumbnail_url && (
                                <div className="w-full aspect-[4/3] relative mb-5 overflow-hidden">
                                    <Image
                                        src={item.thumbnail_url}
                                        alt={item.title_vi}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        unoptimized
                                    />
                                    {/* Gold corner accent */}
                                    <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(212,168,67,0.6) 50%, transparent 50%)'
                                        }} />
                                </div>
                            )}

                            {/* Title — large serif */}
                            <h3
                                className="text-xl font-black mb-3 leading-snug group-hover:text-amber-800 transition-colors"
                                style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#1A0E06' }}
                            >
                                {item.title_vi}
                            </h3>

                            {/* Excerpt */}
                            {item.short_description_vi && (
                                <p
                                    className="text-sm leading-relaxed flex-1 line-clamp-4"
                                    style={{ color: 'rgba(60,30,10,0.65)' }}
                                >
                                    {item.short_description_vi}
                                </p>
                            )}

                            {/* Read more */}
                            <Link
                                href={`/tin-tuc/${item.slug}`}
                                className="mt-5 pb-4 lg:pb-0 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all hover:gap-3"
                                style={{ color: '#D4A843' }}
                            >
                                <span>Đọc tiếp</span>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </article>
                    ))}
                </div>

                {/* Footer link */}
                <div className="mt-10 text-center pt-8" style={{ borderTop: '1px solid rgba(212,168,67,0.3)' }}>
                    <Link
                        href="/tin-tuc"
                        className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.3em] uppercase transition-all hover:tracking-[0.4em]"
                        style={{ color: '#1A0E06' }}
                    >
                        Xem tất cả tin tức
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
