'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

const SESSION_KEY = 'cache_lotus_news_v1';
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * LotusNewsGrid — Grid tin tức 3 cột cho Lotus Layout.
 * Card đỏ son accent, viền trái màu primary, hover lift.
 */
export function LotusNewsGrid({ locale = 'vi' }: { locale?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [news, setNews] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);
    const fetchedRef = useRef(false);

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem(SESSION_KEY);
            if (raw) {
                const p = JSON.parse(raw);
                if (Date.now() - p.fetchedAt < CACHE_TTL_MS) { setNews(p.news); return; }
                sessionStorage.removeItem(SESSION_KEY);
            }
        } catch { }

        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !fetchedRef.current) {
                fetchedRef.current = true;
                observer.disconnect();
                setLoading(true);
                fetch('/api/sections/news-events')
                    .then(r => r.json())
                    .then(j => {
                        const items = j.news ?? [];
                        setNews(items);
                        try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ news: items, fetchedAt: Date.now() })); } catch { }
                    })
                    .catch(() => setNews([]))
                    .finally(() => setLoading(false));
            }
        }, { rootMargin: '200px' });

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={ref}
            className="py-14 px-6 sm:px-10 lg:px-16"
            style={{ backgroundColor: 'rgb(var(--theme-bg-start))' }}
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-7 rounded-full" style={{ backgroundColor: 'rgb(var(--theme-primary))' }} />
                        <h2 className="text-xl font-black uppercase tracking-wide" style={{ color: 'rgb(var(--theme-text))' }}>
                            Tin Tức Phật Sự
                        </h2>
                    </div>
                    <Link href="/tin-tuc" className="text-[13px] font-bold" style={{ color: 'rgb(var(--theme-primary))' }}>
                        Tất cả bài viết →
                    </Link>
                </div>

                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="rounded-xl h-64" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.06)' }} />
                        ))}
                    </div>
                )}

                {news && news.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {news.slice(0, 6).map((item: any) => (
                                <Link
                                    key={item.id}
                                    href={`/tin-tuc/${item.slug}`}
                                    className="group rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                    style={{
                                        backgroundColor: 'rgb(var(--theme-surface))',
                                        border: '1px solid rgb(var(--theme-primary) / 0.1)',
                                    }}
                                >
                                {/* Ảnh */}
                                <div className="relative h-44 overflow-hidden">
                                    {item.thumbnail_url ? (
                                        <Image
                                            src={item.thumbnail_url}
                                            alt={item.title_vi}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            unoptimized
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full"
                                            style={{ background: 'linear-gradient(135deg, rgb(var(--theme-primary) / 0.2), rgb(var(--theme-secondary) / 0.3))' }}
                                        />
                                    )}
                                    {/* Viền màu trên ảnh */}
                                    <div
                                        className="absolute top-0 left-0 right-0 h-0.5"
                                        style={{ backgroundColor: 'rgb(var(--theme-primary))' }}
                                    />
                                </div>

                                {/* Content */}
                                <div className="p-4 flex flex-col flex-1">
                                    {item.category && (
                                        <span
                                            className="text-[10px] font-bold uppercase tracking-widest mb-2 block"
                                            style={{ color: 'rgb(var(--theme-primary))' }}
                                        >
                                            {item.category.name_vi}
                                        </span>
                                    )}
                                    <h3
                                        className="text-[14px] font-bold line-clamp-2 leading-snug flex-1 group-hover:opacity-70 transition-opacity"
                                        style={{ color: 'rgb(var(--theme-text))' }}
                                    >
                                        {item.title_vi}
                                    </h3>
                                    {item.published_at && (
                                        <p
                                            className="text-[11px] mt-3"
                                            style={{ color: 'rgb(var(--theme-text) / 0.4)' }}
                                        >
                                            {new Date(item.published_at).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
