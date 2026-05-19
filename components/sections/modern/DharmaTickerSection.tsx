'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/routing';

interface DharmaTalk {
    id: string;
    title_vi: string;
    title_en?: string | null;
    title_km?: string | null;
}

interface DharmaTickerSectionProps {
    talks?: DharmaTalk[];
    siteName?: string;
}

/**
 * DharmaTickerSection — Ticker chạy ngang hiển thị pháp danh / tên pháp thoại gần nhất.
 * Dùng CSS animation infinite scroll thay vì JS interval để tối ưu CPU.
 * Chỉ dùng trong Modern Layout.
 */
export function DharmaTickerSection({ talks = [], siteName }: DharmaTickerSectionProps) {
    const trackRef = useRef<HTMLDivElement>(null);

    if (!talks || talks.length === 0) return null;

    // Nhân đôi mảng để tạo hiệu ứng vô tận
    const doubledTalks = [...talks, ...talks, ...talks];

    return (
        <div
            className="relative overflow-hidden border-y"
            style={{
                backgroundColor: 'rgb(var(--theme-hero) / 0.95)',
                borderColor: 'rgb(var(--theme-primary) / 0.15)',
            }}
            aria-label="Pháp thoại mới nhất"
        >
            {/* Label bên trái */}
            <div
                className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-4 sm:px-6 gap-2 shrink-0"
                style={{ backgroundColor: 'rgb(var(--theme-primary))' }}
            >
                <svg className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgb(var(--theme-hero))' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap hidden sm:block"
                    style={{ color: 'rgb(var(--theme-hero))' }}
                >
                    Pháp Thoại
                </span>
            </div>

            {/* Gradient fade trái */}
            <div
                className="absolute left-[60px] sm:left-[110px] top-0 bottom-0 w-8 z-[5] pointer-events-none"
                style={{ background: `linear-gradient(to right, rgb(var(--theme-hero) / 0.95), transparent)` }}
            />

            {/* Ticker track */}
            <div className="pl-[68px] sm:pl-[118px] pr-4 py-2.5 overflow-hidden">
                <div
                    ref={trackRef}
                    className="flex items-center gap-8 whitespace-nowrap animate-ticker"
                    style={{ '--ticker-speed': `${Math.max(30, doubledTalks.length * 4)}s` } as React.CSSProperties}
                >
                    {doubledTalks.map((talk, i) => (
                        <Link
                            key={`${talk.id}-${i}`}
                            href={`/documents`}
                            className="inline-flex items-center gap-2 shrink-0 group"
                        >
                            <span
                                className="w-1 h-1 rounded-full shrink-0"
                                style={{ backgroundColor: 'rgb(var(--theme-primary))' }}
                            />
                            <span
                                className="text-[13px] font-medium transition-colors group-hover:opacity-80"
                                style={{ color: 'rgb(var(--theme-text))' }}
                            >
                                {talk.title_vi}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Gradient fade phải */}
            <div
                className="absolute right-0 top-0 bottom-0 w-12 z-[5] pointer-events-none"
                style={{ background: `linear-gradient(to left, rgb(var(--theme-hero) / 0.95), transparent)` }}
            />

            {/* CSS Animation — injected inline để không phụ thuộc vào global CSS */}
            <style>{`
                @keyframes ticker-scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.333%); }
                }
                .animate-ticker {
                    animation: ticker-scroll var(--ticker-speed, 40s) linear infinite;
                    will-change: transform;
                }
                .animate-ticker:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
}
