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

interface InkDharmaBandProps {
    talks?: DharmaTalk[];
}

/**
 * InkDharmaBand — full-width dark band
 * Mobile: stacked numbered list
 * Desktop: left editorial label | right numbered list
 */
export function InkDharmaBand({ talks = [] }: InkDharmaBandProps) {
    if (!talks.length) return null;
    const displayed = talks.slice(0, 5);

    const fmtDuration = (sec?: number | null) => {
        if (!sec) return '';
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    return (
        <section className="py-14 md:py-20" style={{ backgroundColor: '#0F0F0F' }}>
            <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-16">

                {/* Header — row on desktop, stacked on mobile */}
                <div className="flex flex-col md:flex-row md:items-start md:gap-16">

                    {/* Left label */}
                    <div className="mb-8 md:mb-0 md:w-64 shrink-0">
                        <span
                            className="text-[9px] font-black tracking-[0.5em] uppercase block mb-3"
                            style={{ color: '#C41E3A' }}
                        >
                            Pháp Âm
                        </span>
                        <h2
                            className="text-3xl md:text-4xl font-black leading-tight mb-4"
                            style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#FFFFFF' }}
                        >
                            Kho Tàng<br />Pháp Thoại
                        </h2>
                        <p className="text-sm leading-relaxed mb-6 md:mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
                            Những bài giảng chọn lọc từ quý Thầy — hướng dẫn thiền định, giáo lý căn bản và ứng dụng vào đời sống.
                        </p>
                        <Link
                            href="/documents"
                            className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.35em] uppercase transition-all hover:gap-3 duration-200"
                            style={{ color: 'rgba(255,255,255,0.6)' }}
                        >
                            Nghe thêm
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>

                    {/* Right — talk list */}
                    <div className="flex-1">
                        {displayed.map((talk, i) => (
                            <Link
                                key={talk.id}
                                href={`/documents/${talk.slug ?? talk.id}`}
                                className="flex items-center gap-4 py-4 group transition-all"
                                style={{ borderTop: i === 0 ? '1px solid rgba(255,255,255,0.08)' : undefined, borderBottom: '1px solid rgba(255,255,255,0.08)' }}
                            >
                                {/* Number */}
                                <span
                                    className="shrink-0 w-8 text-right text-sm font-black opacity-25 group-hover:opacity-100 transition-opacity"
                                    style={{ fontFamily: 'Georgia, serif', color: '#FFFFFF' }}
                                >
                                    {String(i + 1).padStart(2, '0')}
                                </span>

                                {/* Play button */}
                                <div
                                    className="shrink-0 w-9 h-9 rounded-full border flex items-center justify-center transition-all group-hover:border-white group-hover:bg-white/10 duration-200"
                                    style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)' }}
                                >
                                    <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <span
                                        className="text-[9px] font-black tracking-[0.3em] uppercase block mb-0.5"
                                        style={{ color: 'rgba(255,255,255,0.35)' }}
                                    >
                                        {talk.speaker_name || 'Pháp Thoại'}
                                    </span>
                                    <h3
                                        className="text-sm md:text-base font-semibold truncate group-hover:text-white transition-colors"
                                        style={{ fontFamily: 'Georgia, serif', color: 'rgba(255,255,255,0.75)' }}
                                    >
                                        {talk.title_vi}
                                    </h3>
                                </div>

                                {/* Duration + arrow */}
                                <div className="shrink-0 flex items-center gap-3">
                                    {talk.duration && (
                                        <span className="text-[10px] hidden sm:block" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                            {fmtDuration(talk.duration)}
                                        </span>
                                    )}
                                    <svg
                                        className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                        style={{ color: 'rgba(255,255,255,0.6)' }}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
