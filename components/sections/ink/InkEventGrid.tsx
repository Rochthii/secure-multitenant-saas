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
    excerpt_vi?: string | null;
}

interface InkEventGridProps {
    upcomingEvents?: EventItem[];
}

/**
 * InkEventGrid — editorial event listing
 * Mobile: full-width list (1 col)
 * Desktop: 3-col grid với border-top accent đỏ khi hover
 */
export function InkEventGrid({ upcomingEvents = [] }: InkEventGridProps) {
    if (!upcomingEvents.length) return null;
    const displayed = upcomingEvents.slice(0, 6);

    const fmtStartDate = (d?: string | null) => {
        if (!d) return { day: '--', month: '', year: '' };
        const dt = new Date(d);
        return {
            day: String(dt.getDate()).padStart(2, '0'),
            month: dt.toLocaleDateString('vi-VN', { month: 'short' }).toUpperCase(),
            year: String(dt.getFullYear()),
        };
    };

    const currentMonth = new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }).toUpperCase();

    return (
        <section className="py-14 md:py-20 px-5 md:px-10 lg:px-16" style={{ backgroundColor: '#F8F7F4' }}>
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-10 gap-2">
                    <div>
                        <span className="text-[9px] font-black tracking-[0.5em] uppercase block mb-1" style={{ color: '#C41E3A' }}>
                            Lịch Phật Sự
                        </span>
                        <h2
                            className="text-2xl sm:text-3xl font-black"
                            style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#0F0F0F' }}
                        >
                            {currentMonth}
                        </h2>
                    </div>
                    <Link
                        href="/lich-le"
                        className="text-[10px] font-black tracking-[0.3em] uppercase flex items-center gap-2 transition-all hover:gap-3 duration-200 self-start sm:self-auto"
                        style={{ color: '#0F0F0F' }}
                    >
                        Lịch đầy đủ
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>

                {/* Grid: 1 col mobile, 2 col sm, 3 col lg */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ backgroundColor: 'rgba(15,15,15,0.08)' }}>
                    {displayed.map((ev) => {
                        const d = fmtStartDate(ev.start_date);
                        return (
                            <Link
                                key={ev.id}
                                href={ev.slug ? `/lich-le/${ev.slug}` : `/lich-le/${ev.id}`}
                                className="group flex gap-5 p-6 transition-all duration-200"
                                style={{ backgroundColor: '#F8F7F4', borderTop: '2px solid transparent' }}
                                onMouseEnter={e => (e.currentTarget.style.borderTopColor = '#C41E3A')}
                                onMouseLeave={e => (e.currentTarget.style.borderTopColor = 'transparent')}
                            >
                                {/* Date block */}
                                <div className="shrink-0 pt-0.5 w-12 text-center">
                                    <span
                                        className="text-3xl font-black leading-none block"
                                        style={{ color: '#0F0F0F' }}
                                    >
                                        {d.day}
                                    </span>
                                    <span className="text-[9px] font-black tracking-wider block mt-0.5" style={{ color: '#C41E3A' }}>
                                        {d.month}
                                    </span>
                                    <span className="text-[9px] block mt-0.5" style={{ color: '#6B6B6B' }}>
                                        {d.year}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    {ev.status === 'upcoming' && (
                                        <span
                                            className="text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 inline-block mb-2"
                                            style={{ backgroundColor: 'rgba(196,30,58,0.1)', color: '#C41E3A' }}
                                        >
                                            Sắp diễn ra
                                        </span>
                                    )}
                                    <h3
                                        className="text-sm font-black leading-snug mb-1.5 group-hover:opacity-60 transition-opacity line-clamp-2"
                                        style={{ fontFamily: 'Georgia, serif', color: '#0F0F0F' }}
                                    >
                                        {ev.title_vi || ev.title_km || 'Sự kiện'}
                                    </h3>
                                    {ev.location && (
                                        <p className="text-[11px] flex items-center gap-1.5" style={{ color: '#6B6B6B' }}>
                                            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="truncate">{ev.location}</span>
                                        </p>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
