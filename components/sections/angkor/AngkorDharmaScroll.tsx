'use client';
import React from 'react';
import { Link } from '@/i18n/routing';
import { LotusIcon } from '@/components/ui/khmer-icons';

const ROMAN_IDX = ['I', 'II', 'III', 'IV', 'V'];

interface DharmaTalk {
    id: string;
    title_vi: string;
    speaker_name?: string | null;
    slug?: string | null;
    thumbnail_url?: string | null;
    duration?: number | null;
}

export function AngkorDharmaScroll({ talks = [] }: { talks: DharmaTalk[] }) {
    if (!talks.length) return null;

    const displayed = talks.slice(0, 5);

    return (
        <section
            style={{ background: 'linear-gradient(to bottom, #2C1A0A, #1A0E06)' }}
            className="py-20"
        >
            {/* Header */}
            <div className="max-w-4xl mx-auto px-6 text-center mb-14">
                <div
                    className="w-14 h-14 mx-auto mb-5 flex items-center justify-center rounded-full text-2xl"
                    style={{ border: '1.5px solid rgba(212,168,67,0.4)', backgroundColor: 'rgba(212,168,67,0.08)' }}
                >
                    <LotusIcon className="w-8 h-8 text-[#D4A843] opacity-80" />
                </div>
                <span
                    className="text-[10px] tracking-[0.5em] font-bold uppercase block mb-3"
                    style={{ color: 'rgba(212,168,67,0.7)' }}
                >
                    Pháp Bảo
                </span>
                <h2
                    className="text-3xl font-black"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#F0E8D0' }}
                >
                    Kho Tàng Pháp Thoại
                </h2>
                <div className="mt-5 flex items-center justify-center gap-3">
                    <div className="h-px w-10" style={{ backgroundColor: 'rgba(212,168,67,0.4)' }} />
                    <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'rgba(212,168,67,0.4)' }} />
                    <div className="h-px w-10" style={{ backgroundColor: 'rgba(212,168,67,0.4)' }} />
                </div>
            </div>

            {/* Talk list */}
            <div className="max-w-3xl mx-auto px-6">
                {displayed.map((talk, i) => (
                    <Link
                        key={talk.id}
                        href={`/documents/${talk.slug ?? talk.id}`}
                        className="flex items-center gap-5 py-5 group transition-all"
                        style={{ borderBottom: i < displayed.length - 1 ? '1px solid rgba(212,168,67,0.12)' : 'none' }}
                    >
                        {/* Roman index */}
                        <span
                            className="shrink-0 w-8 text-center text-[11px] font-black opacity-40 group-hover:opacity-100 transition-opacity"
                            style={{ fontFamily: 'Georgia, serif', color: '#D4A843' }}
                        >
                            {ROMAN_IDX[i]}
                        </span>

                        {/* Play button */}
                        <div
                            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                            style={{
                                backgroundColor: 'rgba(212,168,67,0.12)',
                                border: '1px solid rgba(212,168,67,0.3)',
                                color: '#D4A843',
                            }}
                        >
                            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                            <span
                                className="text-[10px] uppercase font-bold tracking-widest block mb-1"
                                style={{ color: 'rgba(212,168,67,0.6)' }}
                            >
                                {talk.speaker_name || 'Bản tự'}
                            </span>
                            <h3
                                className="text-base font-semibold leading-snug truncate group-hover:text-amber-200 transition-colors"
                                style={{ fontFamily: 'Georgia, serif', color: '#F0E8D0' }}
                            >
                                {talk.title_vi}
                            </h3>
                        </div>

                        {/* Arrow */}
                        <svg
                            className="shrink-0 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 duration-300"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                            style={{ color: '#D4A843' }}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                ))}
            </div>

            {/* Footer CTA */}
            <div className="text-center mt-12">
                <Link
                    href="/documents"
                    className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.3em] uppercase transition-all hover:gap-3"
                    style={{ color: 'rgba(212,168,67,0.7)' }}
                >
                    Xem tất cả pháp thoại
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </Link>
            </div>
        </section>
    );
}
