'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { ChampaFlowerIcon } from '@/components/ui/khmer-icons';

const SESSION_KEY = 'cache_lotus_events_v1';
const CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * LotusEventScroll — Sự kiện cuộn ngang dạng card màu đỏ son + cam cho Lotus Layout.
 * Card có logo hoa sứ và ngày lớn nổi bật.
 */
export function LotusEventScroll({ locale = 'vi' }: { locale?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [events, setEvents] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);
    const fetchedRef = useRef(false);

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem(SESSION_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Date.now() - parsed.fetchedAt < CACHE_TTL_MS) { setEvents(parsed.events); return; }
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
                        const items = j.events ?? [];
                        setEvents(items);
                        try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ events: items, fetchedAt: Date.now() })); } catch { }
                    })
                    .catch(() => setEvents([]))
                    .finally(() => setLoading(false));
            }
        }, { rootMargin: '200px' });

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={ref}
            className="py-12 overflow-hidden"
            style={{ backgroundColor: 'rgb(var(--theme-primary) / 0.04)' }}
        >
            <div className="px-6 sm:px-10 lg:px-16 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ChampaFlowerIcon className="w-6 h-6 text-gold-primary" />
                    <h2 className="text-lg font-black uppercase tracking-wider" style={{ color: 'rgb(var(--theme-text))' }}>
                        Sự Kiện & Lễ Hội
                    </h2>
                </div>
                <Link href="/lich-le" className="text-[13px] font-bold" style={{ color: 'rgb(var(--theme-primary))' }}>
                    Xem tất cả →
                </Link>
            </div>

            {/* Horizontal scroll container */}
            <div
                className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
                style={{
                    paddingLeft: 'clamp(1.5rem, 5vw, 4rem)',
                    paddingRight: '1.5rem',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
            >
                {loading && Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="shrink-0 w-64 h-48 rounded-2xl animate-pulse"
                        style={{ backgroundColor: 'rgb(var(--theme-text) / 0.06)', minWidth: '16rem' }}
                    />
                ))}

                {events && events.map((event: any) => {
                    const date = event.start_date ? new Date(event.start_date) : null;
                    return (
                        <Link
                            key={event.id}
                            href={`/lich-le/${event.slug || event.id}`}
                            className="shrink-0 snap-start rounded-2xl overflow-hidden relative group block"
                            style={{
                                width: '15rem',
                                minWidth: '15rem',
                                background: `linear-gradient(135deg, rgb(var(--theme-primary)), rgb(var(--theme-secondary) / 0.8))`,
                            }}
                        >
                            {/* Pattern overlay */}
                            <div className="absolute inset-0 opacity-5"
                                style={{
                                    backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                                    backgroundSize: '30px 30px',
                                }}
                            />

                            <div className="relative p-5 flex flex-col h-48 justify-between transition-transform duration-300 group-hover:scale-[1.02]">
                                {/* Date */}
                                {date && (
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="text-4xl font-black text-white leading-none">{date.getDate()}</div>
                                            <div className="text-[11px] font-bold text-white/70 uppercase tracking-wider mt-0.5">
                                                {date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                        <ChampaFlowerIcon className="w-8 h-8 text-white/40" />
                                    </div>
                                )}

                                {/* Title */}
                                <div>
                                    <h3 className="text-white font-bold text-[14px] leading-snug line-clamp-2 mb-1 group-hover:underline decoration-white/30 decoration-1 underline-offset-4">
                                        {event.title_vi || event.title}
                                    </h3>
                                    {event.location && (
                                        <p className="text-white/60 text-[11px] line-clamp-1 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {event.location}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}

                {/* Nếu events rỗng */}
                {events && events.length === 0 && (
                    <div className="flex items-center justify-center w-full py-8" style={{ color: 'rgb(var(--theme-text) / 0.4)' }}>
                        Chưa có sự kiện sắp tới
                    </div>
                )}
            </div>

            <style>{`
                div::-webkit-scrollbar { display: none; }
            `}</style>
        </section>
    );
}
