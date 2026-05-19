'use client';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

const CACHE_KEY = 'cache_sunrise_news_v1';

export function SunriseCommunityNews({ locale = 'vi' }: { locale?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [news, setNews] = useState<any[] | null>(null);

    useEffect(() => {
        const st = sessionStorage.getItem(CACHE_KEY);
        if (st) {
            const p = JSON.parse(st);
            if (Date.now() - p.fetchedAt < 300000) { setNews(p.news); return; }
        }

        const run = new IntersectionObserver(entry => {
            if (entry[0].isIntersecting) {
                run.disconnect();
                fetch('/api/sections/news-events').then(r => r.json()).then(d => {
                    const lst = d.news || [];
                    setNews(lst);
                    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ news: lst, fetchedAt: Date.now() }));
                }).catch(() => setNews([]));
            }
        });
        if (ref.current) run.observe(ref.current);
        return () => run.disconnect();
    }, []);

    return (
        <section ref={ref} className="py-20 px-6 sm:px-10 lg:px-16" style={{ backgroundColor: 'rgb(var(--theme-bg-start))' }}>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col mb-12 border-l-4 pl-6" style={{ borderColor: 'rgb(var(--theme-primary))' }}>
                    <span className="text-[12px] font-bold tracking-[0.2em] uppercase" style={{ color: 'rgb(var(--theme-primary))' }}>Thông Tin Mới</span>
                    <h2 className="text-3xl lg:text-4xl font-black mt-2" style={{ color: 'rgb(var(--theme-text))' }}>Cộng Đồng Tín Đồ</h2>
                </div>

                {news === null ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-64 rounded-2xl" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.05)' }} />)}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {news.slice(0, 4).map(item => (
                            <Link key={item.id} href={`/tin-tuc/${item.slug}`} className="group relative rounded-2xl overflow-hidden aspect-[3/4] flex flex-col justify-end p-6 hover:-translate-y-2 transition-transform shadow-xl">
                                {item.thumbnail_url ? (
                                    <Image src={item.thumbnail_url} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-110" unoptimized />
                                ) : (
                                    <div className="absolute inset-0 opacity-40" style={{ backgroundColor: 'rgb(var(--theme-primary))' }} />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                <div className="relative z-10">
                                    <span className="inline-block px-2 py-1 backdrop-blur-sm rounded text-[10px] uppercase font-bold text-white mb-3" style={{ backgroundColor: 'rgb(var(--theme-primary) / 0.3)' }}>
                                        {new Date(item.published_at || Date.now()).toLocaleDateString('vi-VN')}
                                    </span>
                                    <h3 className="text-white font-bold leading-snug line-clamp-3">{item.title_vi}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
