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

interface TheraFeatureProps {
    news?: NewsItem[];
}

const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' }) : '';

/**
 * TheraFeature — Tin nổi bật: 1 main + 2 phụ
 * Mobile: stack dọc | Desktop: 2-col split
 */
export function TheraFeature({ news = [] }: TheraFeatureProps) {
    if (!news.length) return null;
    const [main, ...rest] = news;
    const secondaries = rest.slice(0, 2);
    const count = String(news.length).padStart(2, '0');

    return (
        <section className="py-14 md:py-20 px-5 md:px-10 lg:px-16" style={{ backgroundColor: '#FFF9F0' }}>
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div
                    className="flex items-baseline justify-between mb-10 pb-4"
                    style={{ borderBottom: '1px solid rgba(92,67,42,0.12)' }}
                >
                    <div className="flex items-baseline gap-4">
                        {/* Gold accent line */}
                        <div className="w-5 h-0.5 self-center" style={{ backgroundColor: '#E6A229' }} />
                        <span className="text-[10px] font-bold tracking-[0.45em] uppercase" style={{ color: '#5C432A' }}>
                            Tin Tức Nổi Bật
                        </span>
                        <span className="text-[11px]" style={{ color: '#7D6B52' }}>— {count} bài</span>
                    </div>
                    <Link
                        href="/tin-tuc"
                        className="text-[10px] font-bold tracking-[0.3em] uppercase flex items-center gap-2 transition-all hover:gap-3 duration-200"
                        style={{ color: '#E6A229' }}
                    >
                        Tất cả →
                    </Link>
                </div>

                {/* 2-col layout */}
                <div className="flex flex-col md:flex-row gap-10 md:gap-0">

                    {/* Main */}
                    <Link href={`/tin-tuc/${main.slug}`} className="group md:w-[58%] md:pr-10 md:border-r block"
                        style={{ borderColor: 'rgba(92,67,42,0.1)' }}>
                        {main.thumbnail_url && (
                            <div className="w-full aspect-[16/10] relative overflow-hidden mb-5">
                                <Image
                                    src={main.thumbnail_url}
                                    alt={main.title_vi}
                                    fill
                                    className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                                    sizes="(max-width: 768px) 100vw, 56vw"
                                    unoptimized
                                />
                                {/* Gold corner accent */}
                                <div className="absolute top-0 left-0 w-8 h-8"
                                    style={{ borderLeft: '3px solid #E6A229', borderTop: '3px solid #E6A229' }} />
                            </div>
                        )}
                        {main.categories?.name_vi && (
                            <span className="text-[9px] font-bold tracking-[0.4em] uppercase block mb-2" style={{ color: '#E6A229' }}>
                                {main.categories.name_vi}
                            </span>
                        )}
                        <h2
                            className="text-2xl sm:text-3xl font-black leading-snug mb-3 group-hover:opacity-75 transition-opacity"
                            style={{ fontFamily: 'Merriweather, Georgia, serif', color: '#3C2F1F' }}
                        >
                            {main.title_vi}
                        </h2>
                        {main.short_description_vi && (
                            <p className="text-sm leading-relaxed line-clamp-3 mb-4" style={{ color: '#7D6B52' }}>
                                {main.short_description_vi}
                            </p>
                        )}
                        <span className="text-[10px] font-semibold" style={{ color: '#7D6B52' }}>{fmtDate(main.published_at)}</span>
                    </Link>

                    {/* Secondaries */}
                    <div className="md:flex-1 md:pl-10 flex flex-col gap-7">
                        {secondaries.map((item, i) => (
                            <React.Fragment key={item.id}>
                                <Link href={`/tin-tuc/${item.slug}`} className="group flex gap-4">
                                    {item.thumbnail_url && (
                                        <div className="shrink-0 w-24 h-20 sm:w-28 sm:h-24 relative overflow-hidden">
                                            <Image
                                                src={item.thumbnail_url}
                                                alt={item.title_vi}
                                                fill
                                                className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                                                sizes="112px"
                                                unoptimized
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        {item.categories?.name_vi && (
                                            <span className="text-[9px] font-bold tracking-[0.35em] uppercase block mb-1" style={{ color: '#E6A229' }}>
                                                {item.categories.name_vi}
                                            </span>
                                        )}
                                        <h3
                                            className="text-base font-bold leading-snug group-hover:opacity-70 transition-opacity line-clamp-2"
                                            style={{ fontFamily: 'Merriweather, Georgia, serif', color: '#3C2F1F' }}
                                        >
                                            {item.title_vi}
                                        </h3>
                                        <span className="text-[10px] mt-1 block" style={{ color: '#7D6B52' }}>{fmtDate(item.published_at)}</span>
                                    </div>
                                </Link>
                                {i < secondaries.length - 1 && (
                                    <div className="h-px" style={{ backgroundColor: 'rgba(92,67,42,0.1)' }} />
                                )}
                            </React.Fragment>
                        ))}

                        {/* Mobile extra list */}
                        {rest.slice(2, 5).length > 0 && (
                            <div className="md:hidden pt-4" style={{ borderTop: '1px solid rgba(92,67,42,0.1)' }}>
                                {rest.slice(2, 5).map((item) => (
                                    <Link key={item.id} href={`/tin-tuc/${item.slug}`}
                                        className="flex items-start gap-3 py-3 group"
                                        style={{ borderBottom: '1px solid rgba(92,67,42,0.07)' }}
                                    >
                                        <div className="shrink-0 w-1.5 h-1.5 rounded-full mt-1.5" style={{ backgroundColor: '#E6A229' }} />
                                        <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:opacity-60 transition-opacity"
                                            style={{ color: '#3C2F1F' }}>
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
