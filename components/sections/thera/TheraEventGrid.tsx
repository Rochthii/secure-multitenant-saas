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

interface TheraEventGridProps {
    upcomingEvents?: EventItem[];
}

const fmtDate = (d?: string | null) => {
    if (!d) return { day: '--', month: '', year: '' };
    const dt = new Date(d);
    return {
        day: String(dt.getDate()).padStart(2, '0'),
        month: dt.toLocaleDateString('vi-VN', { month: 'short' }).toUpperCase(),
        year: String(dt.getFullYear()),
    };
};

/**
 * TheraEventGrid — Grid 3-cột nền kem nhạt
 * Hover: highlight vàng chi nhánh border-top
 * Mobile: 1-col stack | Tablet: 2-col | Desktop: 3-col
 */
export function TheraEventGrid({ upcomingEvents = [] }: TheraEventGridProps) {
    if (!upcomingEvents.length) return null;
    const displayed = upcomingEvents.slice(0, 6);
    const currentMonth = new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }).toUpperCase();

    return (
        <section className="py-14 md:py-20 px-5 md:px-10 lg:px-16" style={{ backgroundColor: '#F4EFE2' }}>
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-10 gap-2">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-5 h-0.5" style={{ backgroundColor: '#E6A229' }} />
                            <span className="text-[9px] font-bold tracking-[0.5em] uppercase" style={{ color: '#5C432A' }}>
                                Lịch Phật Sự
                            </span>
                        </div>
                        <h2
                            className="text-2xl sm:text-3xl font-black"
                            style={{ fontFamily: 'Merriweather, Georgia, serif', color: '#3C2F1F' }}
                        >
                            {currentMonth}
                        </h2>
                    </div>
                    <Link
                        href="/lich-le"
                        className="text-[10px] font-bold tracking-[0.3em] uppercase flex items-center gap-2 transition-all hover:gap-3 duration-200 self-start sm:self-auto"
                        style={{ color: '#E6A229' }}
                    >
                        Lịch đầy đủ →
                    </Link>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ backgroundColor: 'rgba(92,67,42,0.1)' }}>
                    {displayed.map((ev) => {
                        const d = fmtDate(ev.start_date);
                        return (
                            <Link
                                key={ev.id}
                                href={ev.slug ? `/lich-le/${ev.slug}` : `/lich-le/${ev.id}`}
                                className="group flex gap-5 p-6 transition-all duration-200"
                                style={{ backgroundColor: '#F4EFE2', borderTop: '2px solid transparent' }}
                                onMouseEnter={e => (e.currentTarget.style.borderTopColor = '#E6A229')}
                                onMouseLeave={e => (e.currentTarget.style.borderTopColor = 'transparent')}
                            >
                                {/* Date */}
                                <div className="shrink-0 pt-0.5 w-12 text-center">
                                    <span className="text-3xl font-black leading-none block" style={{ color: '#3C2F1F' }}>
                                        {d.day}
                                    </span>
                                    <span className="text-[9px] font-bold tracking-wider block mt-0.5" style={{ color: '#E6A229' }}>
                                        {d.month}
                                    </span>
                                    <span className="text-[9px] block mt-0.5" style={{ color: '#7D6B52' }}>
                                        {d.year}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    {ev.status === 'upcoming' && (
                                        <span
                                            className="text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 inline-block mb-2"
                                            style={{ backgroundColor: 'rgba(230,162,41,0.15)', color: '#5C432A' }}
                                        >
                                            Sắp diễn ra
                                        </span>
                                    )}
                                    <h3
                                        className="text-sm font-bold leading-snug mb-1.5 group-hover:opacity-70 transition-opacity line-clamp-2"
                                        style={{ fontFamily: 'Merriweather, Georgia, serif', color: '#3C2F1F' }}
                                    >
                                        {ev.title_vi || ev.title_km || 'Sự kiện'}
                                    </h3>
                                    {ev.location && (
                                        <p className="text-[11px] flex items-center gap-1.5" style={{ color: '#7D6B52' }}>
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
