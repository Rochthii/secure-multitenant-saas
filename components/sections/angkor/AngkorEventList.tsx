'use client';
import React from 'react';
import { Link } from '@/i18n/routing';

interface EventItem {
    id: string;
    title_vi?: string | null;
    title_km?: string | null;
    start_date?: string | null;
    location?: string | null;
    status?: string | null;
    slug?: string | null;
    image_url?: string | null;
    excerpt_vi?: string | null;
}

interface AngkorEventListProps {
    events?: EventItem[];
}

const formatDate = (d?: string | null): { dd: string; mm: string; yyyy: string } | null => {
    if (!d) return null;
    const dt = new Date(d);
    return {
        dd: String(dt.getDate()).padStart(2, '0'),
        mm: String(dt.getMonth() + 1).padStart(2, '0'),
        yyyy: String(dt.getFullYear()),
    };
};

export function AngkorEventList({ events = [] }: AngkorEventListProps) {
    if (!events.length) return null;
    const displayed = events.slice(0, 6);

    return (
        <section
            className="py-20 px-6 lg:px-16"
            style={{ backgroundColor: '#FDFAF5' }}
        >
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
                    <div>
                        <span
                            className="text-[10px] tracking-[0.5em] font-bold uppercase block mb-2"
                            style={{ color: '#D4A843' }}
                        >
                            Theo Dòng Lịch Sử
                        </span>
                        <h2
                            className="text-3xl sm:text-4xl font-black"
                            style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#1A0E06' }}
                        >
                            Phật Sự & Sự Kiện
                        </h2>
                    </div>
                    <Link
                        href="/lich-le"
                        className="text-xs font-black tracking-[0.3em] uppercase inline-flex items-center gap-2 transition-all hover:gap-3 shrink-0"
                        style={{ color: '#D4A843' }}
                    >
                        Xem lịch lễ
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>

                {/* Event grid — 2 columns on desktop */}
                <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0" style={{ borderColor: 'rgba(212,168,67,0.15)' }}>
                    {displayed.map((ev, i) => {
                        const date = formatDate(ev.start_date);
                        const isEven = i % 2 === 0;
                        return (
                            <div
                                key={ev.id}
                                className={`flex gap-5 py-7 group ${isEven ? 'md:pr-10' : 'md:pl-10'}`}
                                style={{
                                    borderBottom: i < displayed.length - 2 ? '1px solid rgba(212,168,67,0.15)' : undefined,
                                    borderLeft: !isEven ? '1px solid rgba(212,168,67,0.15)' : undefined,
                                }}
                            >
                                {/* Date block */}
                                {date !== null ? (
                                    <div
                                        className="shrink-0 w-16 flex flex-col items-center justify-center py-2"
                                        style={{ borderLeft: '2px solid #D4A843' }}
                                    >
                                        <span className="text-2xl font-black leading-none" style={{ color: '#1A0E06' }}>{date.dd}</span>
                                        <span className="text-[10px] font-bold mt-0.5" style={{ color: '#D4A843' }}>{date.mm}</span>
                                        <span className="text-[10px] opacity-40" style={{ color: '#1A0E06' }}>{date.yyyy}</span>
                                    </div>
                                ) : (
                                    <div className="shrink-0 w-16 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D4A843' }} />
                                    </div>
                                )}

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    {ev.status === 'upcoming' && (
                                        <span
                                            className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 mb-2 inline-block"
                                            style={{
                                                backgroundColor: 'rgba(212,168,67,0.15)',
                                                color: '#D4A843',
                                            }}
                                        >
                                            Sắp diễn ra
                                        </span>
                                    )}
                                    <h3
                                        className="font-bold text-base leading-snug mb-1.5 group-hover:text-amber-800 transition-colors"
                                        style={{ fontFamily: 'Georgia, serif', color: '#1A0E06' }}
                                    >
                                        {ev.title_vi || ev.title_km || 'Sự kiện'}
                                    </h3>
                                    {ev.location && (
                                        <p className="text-[12px] flex items-center gap-1.5" style={{ color: 'rgba(40,20,8,0.5)' }}>
                                            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {ev.location}
                                        </p>
                                    )}
                                    {ev.excerpt_vi && (
                                        <p className="text-[12px] mt-2 line-clamp-2 italic" style={{ color: 'rgba(40,20,8,0.45)' }}>
                                            {ev.excerpt_vi}
                                        </p>
                                    )}
                                    {ev.slug && (
                                        <Link
                                            href={`/lich-le/${ev.slug}`}
                                            className="mt-3 text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all"
                                            style={{ color: '#D4A843' }}
                                        >
                                            Xem chi tiết →
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
