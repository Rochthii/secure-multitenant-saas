'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/routing';

export function ZenNewsSection({
    locale = 'vi',
    news: prefetchedNews,
}: {
    locale: string;
    news?: any[];
    upcomingEvents?: any[];
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [news, setNews] = useState<any[] | null>(prefetchedNews ?? null);

    useEffect(() => {
        // Skip API call when server-side data is pre-fetched
        if (prefetchedNews !== undefined) return;

        const obj = new IntersectionObserver((e) => {
            if (e[0].isIntersecting) {
                obj.disconnect();
                fetch('/api/sections/news-events').then(r => r.json()).then(d => {
                    setNews(d.news || []);
                }).catch(() => setNews([]));
            }
        });
        if (ref.current) obj.observe(ref.current);
        return () => obj.disconnect();
    }, [prefetchedNews]);

    return (
        <section ref={ref} className="py-20 px-6 sm:px-10 lg:px-16" style={{ backgroundColor: 'rgb(var(--theme-bg-start))' }}>
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16">
                <div className="lg:w-1/3">
                    <span className="text-[11px] font-bold tracking-[0.3em] uppercase block mb-4" style={{ color: 'rgb(var(--theme-primary))' }}>Tin Tức</span>
                    <h2 className="text-3xl font-light mb-6" style={{ color: 'rgb(var(--theme-text))' }}>Tin Mới Bổn Tự</h2>
                    <p className="text-[14px] leading-relaxed mb-8 opacity-70" style={{ color: 'rgb(var(--theme-text))' }}>
                        Cập nhật các hoạt động tâm linh, khóa tu định kỳ và những thông báo Phật sự quan trọng từ Ban Trị Sự.
                    </p>
                    <Link href="/tin-tuc" className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-wider uppercase group" style={{ color: 'rgb(var(--theme-primary))' }}>
                        <span className="w-8 h-px bg-current transition-all group-hover:w-12" style={{ backgroundColor: 'rgb(var(--theme-primary))' }} />
                        Xem Toàn Bộ
                    </Link>
                </div>

                <div className="lg:w-2/3 flex flex-col gap-0 border-t" style={{ borderColor: 'rgb(var(--theme-text) / 0.1)' }}>
                    {news === null ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="py-8 border-b animate-pulse" style={{ borderColor: 'rgb(var(--theme-text) / 0.1)', backgroundColor: 'rgb(var(--theme-text) / 0.05)' }} />) : news.slice(0, 4).map(item => (
                        <Link key={item.id} href={`/tin-tuc/${item.slug}`} className="group py-8 border-b flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between transition-colors px-4 -mx-4 rounded-xl hover:bg-black/5" style={{ borderColor: 'rgb(var(--theme-text) / 0.1)' }}>
                            <div>
                                <div className="text-[11px] font-mono mb-2" style={{ color: 'rgb(var(--theme-text) / 0.5)' }}>
                                    {new Date(item.published_at || Date.now()).toLocaleDateString('vi-VN')}
                                </div>
                                <h3 className="text-xl font-medium line-clamp-2" style={{ color: 'rgb(var(--theme-text))' }}>{item.title_vi}</h3>
                            </div>
                            <div className="w-10 h-10 rounded-full flex shrink-0 items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" style={{ backgroundColor: 'rgb(var(--theme-primary) / 0.1)', color: 'rgb(var(--theme-primary))' }}>
                                →
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}


