'use client';
import React from 'react';
import { Link } from '@/i18n/routing';

interface DharmaTalk {
    id: string;
    title_vi: string;
    speaker_name?: string | null;
    slug?: string | null;
    duration?: number | null;
}

interface TheraDharmaTalksProps {
    talks?: DharmaTalk[];
}

const fmtDur = (sec?: number | null) => {
    if (!sec) return '';
    const m = Math.floor(sec / 60), s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
};

/**
 * TheraDharmaTalks — Danh sách Giáo Lý
 * Nền tối #5C432A, số thứ tự vàng lớn, text trắng/kem
 * Mobile: stack gọn; Desktop: label trái + list phải
 */
export function TheraDharmaTalks({ talks = [] }: TheraDharmaTalksProps) {
    if (!talks.length) return null;
    const displayed = talks.slice(0, 5);

    return (
        <section className="py-14 md:py-20" style={{ backgroundColor: '#5C432A' }}>
            <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-16">
                <div className="flex flex-col md:flex-row md:items-start md:gap-16">

                    {/* Left label */}
                    <div className="mb-10 md:mb-0 md:w-64 shrink-0">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-6 h-0.5" style={{ backgroundColor: '#E6A229' }} />
                            <span className="text-[9px] font-bold tracking-[0.5em] uppercase" style={{ color: '#E6A229' }}>
                                Pháp Âm
                            </span>
                        </div>
                        <h2
                            className="text-3xl md:text-4xl font-black leading-tight mb-4"
                            style={{ fontFamily: 'Merriweather, Georgia, serif', color: '#FFF9F0' }}
                        >
                            Kho Tàng<br />Giáo Lý
                        </h2>
                        <p className="text-sm leading-relaxed mb-7" style={{ color: 'rgba(255,249,240,0.4)' }}>
                            Những bài pháp thoại chọn lọc — giáo lý Theravāda ứng dụng vào đời sống hiện đại.
                        </p>
                        <Link
                            href="/documents"
                            className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.35em] uppercase transition-all hover:gap-3 duration-200"
                            style={{ color: 'rgba(230,162,41,0.8)' }}
                        >
                            Nghe thêm
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>

                    {/* Talk list */}
                    <div className="flex-1">
                        {displayed.map((talk, i) => (
                            <Link
                                key={talk.id}
                                href={`/documents/${talk.slug ?? talk.id}`}
                                className="flex items-center gap-5 py-5 group transition-all"
                                style={{ borderTop: i === 0 ? '1px solid rgba(230,162,41,0.15)' : undefined, borderBottom: '1px solid rgba(230,162,41,0.15)' }}
                            >
                                {/* Number — large gold */}
                                <span
                                    className="shrink-0 text-4xl font-black leading-none opacity-25 group-hover:opacity-100 transition-opacity w-12 text-right"
                                    style={{ fontFamily: 'Merriweather, Georgia, serif', color: '#E6A229' }}
                                >
                                    {String(i + 1).padStart(2, '0')}
                                </span>

                                {/* Play icon */}
                                <div
                                    className="shrink-0 w-10 h-10 rounded-full border flex items-center justify-center transition-all group-hover:border-amber-400 group-hover:bg-amber-400/10 duration-200"
                                    style={{ borderColor: 'rgba(230,162,41,0.3)', color: 'rgba(230,162,41,0.7)' }}
                                >
                                    <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <span className="text-[9px] font-bold tracking-[0.3em] uppercase block mb-0.5" style={{ color: 'rgba(230,162,41,0.5)' }}>
                                        {talk.speaker_name || 'Pháp Thoại'}
                                    </span>
                                    <h3
                                        className="text-sm md:text-base font-bold truncate group-hover:text-amber-200 transition-colors"
                                        style={{ fontFamily: 'Merriweather, Georgia, serif', color: '#FFF9F0' }}
                                    >
                                        {talk.title_vi}
                                    </h3>
                                </div>

                                {/* Duration */}
                                {talk.duration && (
                                    <span className="shrink-0 text-[10px] hidden sm:block" style={{ color: 'rgba(255,249,240,0.3)' }}>
                                        {fmtDur(talk.duration)}
                                    </span>
                                )}

                                <svg className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-60 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#E6A229' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
