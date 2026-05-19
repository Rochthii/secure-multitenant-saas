'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';


interface NewsItem {
    id: string;
    slug: string;
    title_vi: string;
    excerpt_vi?: string | null;
    thumbnail_url?: string | null;
    published_at?: string | null;
    category?: { name_vi: string; slug: string } | null;
}

interface ModernNewsGridProps {
    news: NewsItem[];
    locale?: string;
    isCompany?: boolean;
}

/**
 * ModernNewsGrid — Grid báo dạng magazine cho Modern Layout.
 * Layout: 1 bài lớn trái (2 dòng cao) + 4 bài nhỏ dạng horizontal list bên phải.
 * Cards dùng dark glass effect với overlay gradient.
 */
export function ModernNewsGrid({ news = [], locale = 'vi', isCompany }: ModernNewsGridProps) {
    if (!news || news.length === 0) return null;

    const [main, ...rest] = news;
    const sideItems = rest.slice(0, 4);

    return (
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-1 h-7 rounded-full shrink-0"
                            style={{ backgroundColor: 'rgb(var(--theme-primary))' }}
                        />
                        <h2
                            className="text-xl sm:text-2xl font-bold break-words"
                            style={{ color: 'rgb(var(--theme-text))' }}
                        >
                            {isCompany
                                ? 'Bản Tin & Sự Kiện'
                                : 'Tin Tức Mới Nhất'}
                        </h2>
                    </div>
                    <Link
                        href="/tin-tuc"
                        className="text-[13px] font-medium flex items-center gap-1.5 transition-opacity hover:opacity-70 w-fit"
                        style={{ color: 'rgb(var(--theme-primary))' }}
                    >
                        Xem tất cả
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Bài lớn bên trái */}
                    <Link
                        href={`/tin-tuc/${main.slug}`}
                        className="group relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-auto lg:row-span-2 block w-full"
                        style={{
                            backgroundColor: 'rgb(var(--theme-surface) / 0.1)',
                            minHeight: 'clamp(280px, 50vh, 420px)',
                        }}
                    >
                        {main.thumbnail_url ? (
                            <Image
                                src={main.thumbnail_url}
                                alt={main.title_vi}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        ) : (
                            <div
                                className="absolute inset-0"
                                style={{ background: 'linear-gradient(135deg, rgb(var(--theme-primary) / 0.3), rgb(var(--theme-secondary) / 0.3))' }}
                            />
                        )}
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                            {main.category && (
                                <span
                                    className="inline-block text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
                                    style={{
                                        backgroundColor: 'rgb(var(--theme-primary))',
                                        color: 'rgb(var(--theme-hero))',
                                    }}
                                >
                                    {main.category.name_vi}
                                </span>
                            )}
                            <h3 className="text-lg sm:text-2xl font-bold text-white leading-snug mb-2 line-clamp-3 group-hover:text-opacity-90 transition-all break-words">
                                {main.title_vi}
                            </h3>
                            {main.excerpt_vi && (
                                <p className="text-sm text-white/70 line-clamp-2 hidden sm:block">{main.excerpt_vi}</p>
                            )}
                            {main.published_at && (
                                <p className="text-[11px] text-white/50 mt-3">
                                    {new Date(main.published_at).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </p>
                            )}
                        </div>
                    </Link>

                    {/* 4 bài nhỏ bên phải */}
                    <div className="flex flex-col gap-3">
                        {sideItems.map((item) => (
                            <Link
                                key={item.id}
                                href={`/tin-tuc/${item.slug}`}
                                className="group flex gap-3 sm:gap-4 p-2 sm:p-3 rounded-xl transition-all w-full overflow-hidden"
                                style={{
                                    backgroundColor: 'rgb(var(--theme-surface) / 0.05)',
                                    border: '1px solid rgb(var(--theme-text) / 0.05)',
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(var(--theme-primary) / 0.07)';
                                    (e.currentTarget as HTMLElement).style.borderColor = 'rgb(var(--theme-primary) / 0.2)';
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(var(--theme-surface) / 0.05)';
                                    (e.currentTarget as HTMLElement).style.borderColor = 'rgb(var(--theme-text) / 0.05)';
                                }}
                            >
                                {/* Thumbnail nhỏ */}
                                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0">
                                    {item.thumbnail_url ? (
                                        <Image
                                            src={item.thumbnail_url}
                                            alt={item.title_vi}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            sizes="100px"
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full"
                                            style={{ background: 'linear-gradient(135deg, rgb(var(--theme-primary) / 0.2), rgb(var(--theme-secondary) / 0.3))' }}
                                        />
                                    )}
                                </div>

                                {/* Text */}
                                <div className="flex flex-col justify-center min-w-0 flex-1">
                                    {item.category && (
                                        <span
                                            className="text-[10px] font-bold uppercase tracking-wider mb-1"
                                            style={{ color: 'rgb(var(--theme-primary))' }}
                                        >
                                            {item.category.name_vi}
                                        </span>
                                    )}
                                    <h4
                                        className="text-[14px] font-semibold line-clamp-2 leading-snug mb-1 transition-opacity group-hover:opacity-80 break-words"
                                        style={{ color: 'rgb(var(--theme-text))' }}
                                    >
                                        {item.title_vi}
                                    </h4>
                                    {item.published_at && (
                                        <p
                                            className="text-[11px]"
                                            style={{ color: 'rgb(var(--theme-text) / 0.45)' }}
                                        >
                                            {new Date(item.published_at).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
