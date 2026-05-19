'use client';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const CACHE_KEY = 'cache_fest_news_v1';

export function FestivalNewsSection({ locale = 'vi' }: { locale: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [news, setNews] = useState<any[] | null>(null);

    useEffect(() => {
        const cx = sessionStorage.getItem(CACHE_KEY);
        if (cx) {
            const px = JSON.parse(cx);
            if (Date.now() - px.fetchedAt < 300000) { setNews(px.news); return; }
        }
        const ob = new IntersectionObserver(e => {
            if (e[0].isIntersecting) {
                ob.disconnect();
                fetch('/api/sections/news-events').then(r => r.json()).then(d => {
                    const n = d.news || [];
                    setNews(n);
                    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ news: n, fetchedAt: Date.now() }));
                }).catch(() => setNews([]));
            }
        });
        if (ref.current) ob.observe(ref.current);
        return () => ob.disconnect();
    }, []);

    return (
        <section ref={ref} className="py-24 px-6 sm:px-10 lg:px-16" style={{ backgroundColor: 'rgb(var(--theme-bg-end))' }}>
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-16">
                    <div>
                        <span className="text-[12px] font-bold uppercase tracking-[0.3em] px-4 py-1.5 rounded-full inline-block mb-4" style={{ backgroundColor: 'rgb(var(--theme-primary) / 0.1)', color: 'rgb(var(--theme-text))' }}>Tin Tức & Hoạt Động</span>
                        <h2 className="text-4xl lg:text-5xl font-black" style={{ color: 'rgb(var(--theme-text))' }}>Nhịp Sống <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, rgb(var(--theme-primary)), rgb(var(--theme-secondary, var(--theme-primary))))' }}>Lễ Hội</span></h2>
                    </div>
                    <a href="/tin-tuc" className="hidden sm:inline-flex px-6 py-3 rounded-xl font-bold text-[13px] uppercase" style={{ background: 'rgb(var(--theme-surface))', color: 'rgb(var(--theme-text))', border: '2px solid rgb(var(--theme-primary) / 0.1)' }}>Xem Thêm</a>
                </div>

                <div className="grid lg:grid-cols-12 gap-10">
                    {news === null ? (
                        <div className="lg:col-span-12 h-[600px] rounded-3xl bg-black/5 animate-pulse" />
                    ) : (
                        <>
                            {/* Feature News */}
                            {news[0] && (
                                <div className="lg:col-span-7">
                                    <Link href={`/tin-tuc/${news[0].slug}`} className="group block relative rounded-[2.5rem] overflow-hidden aspect-[16/10] shadow-2xl">
                                        {news[0].thumbnail_url && (
                                            <Image src={news[0].thumbnail_url} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                        <div className="absolute bottom-0 left-0 p-8 lg:p-12">
                                            <span className="px-4 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest mb-4 inline-block shadow-lg" style={{ backgroundColor: 'rgb(var(--theme-primary))' }}>Tiêu Điểm</span>
                                            <h3 className="text-3xl lg:text-4xl font-black text-white leading-tight line-clamp-2 transition-colors group-hover:opacity-80">{news[0].title_vi}</h3>
                                            <p className="text-white/60 mt-4 font-medium uppercase tracking-widest text-xs">
                                                {new Date(news[0].published_at || Date.now()).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    </Link>
                                </div>
                            )}

                            {/* Small News Grid */}
                            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {news.slice(1, 5).map((item) => (
                                    <Link key={item.id} href={`/tin-tuc/${item.slug}`} className="group flex flex-col gap-4">
                                        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-white/5 bg-black/20">
                                            {item.thumbnail_url && (
                                                <Image src={item.thumbnail_url} alt="" fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-[15px] font-bold leading-snug line-clamp-2 transition-colors group-hover:opacity-70" style={{ color: 'rgb(var(--theme-text))' }}>{item.title_vi}</h4>
                                            <span className="text-[10px] font-medium opacity-50 uppercase tracking-wider block mt-2" style={{ color: 'rgb(var(--theme-text))' }}>
                                                {new Date(item.published_at || Date.now()).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
