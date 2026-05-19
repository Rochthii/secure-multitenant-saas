'use client';
import React from 'react';
import quotesData from '@/messages/dharma-quotes.json';
import { getVietnamTime } from '@/lib/utils/date';

// Lotus SVG — thay thế Quote icon từ lucide
const LotusIcon = () => (
    <svg viewBox="0 0 80 60" fill="none" className="w-16 h-12 mx-auto" aria-hidden="true">
        {/* Center petal */}
        <path d="M40 55 C40 55 28 38 28 25 C28 14 33 8 40 8 C47 8 52 14 52 25 C52 38 40 55 40 55Z"
            fill="currentColor" opacity="0.9" />
        {/* Left petal */}
        <path d="M40 50 C40 50 18 40 14 27 C10 16 16 8 24 10 C30 12 34 20 36 30 C38 40 40 50 40 50Z"
            fill="currentColor" opacity="0.6" />
        {/* Right petal */}
        <path d="M40 50 C40 50 62 40 66 27 C70 16 64 8 56 10 C50 12 46 20 44 30 C42 40 40 50 40 50Z"
            fill="currentColor" opacity="0.6" />
        {/* Far left petal */}
        <path d="M36 46 C36 46 10 42 4 30 C-1 20 6 12 14 16 C20 19 26 28 30 38 C33 44 36 46 36 46Z"
            fill="currentColor" opacity="0.3" />
        {/* Far right petal */}
        <path d="M44 46 C44 46 70 42 76 30 C81 20 74 12 66 16 C60 19 54 28 50 38 C47 44 44 46 44 46Z"
            fill="currentColor" opacity="0.3" />
        {/* Stem */}
        <path d="M40 55 L40 60" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
);

const WaveDivider = () => (
    <svg width="120" height="16" viewBox="0 0 120 16" fill="none" className="mx-auto" aria-hidden="true">
        <path d="M0 8 Q15 0 30 8 Q45 16 60 8 Q75 0 90 8 Q105 16 120 8"
            stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="60" cy="8" r="3" fill="currentColor" />
        <circle cx="30" cy="8" r="1.5" fill="currentColor" opacity="0.5" />
        <circle cx="90" cy="8" r="1.5" fill="currentColor" opacity="0.5" />
    </svg>
);

export function DailyDharmaQuoteSection() {
    // Compute day-of-year on server — deterministic, no hydration mismatch
    const now = getVietnamTime();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const quote = quotesData[dayOfYear % quotesData.length];

    if (!quote) return null;

    return (
        <section className="relative py-20 lg:py-28 bg-page-surface overflow-hidden">

            {/* Subtle radial warm glow */}
            <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgb(var(--theme-primary)), transparent)' }} />

            {/* Top & bottom gold rule */}
            <div className="absolute top-0 left-0 right-0 h-px opacity-60" style={{ background: 'linear-gradient(to right, transparent, rgb(var(--theme-primary)), transparent)' }} />
            <div className="absolute bottom-0 left-0 right-0 h-px opacity-60" style={{ background: 'linear-gradient(to right, transparent, rgb(var(--theme-primary)), transparent)' }} />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center">

                    {/* Label */}
                    <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-8" style={{ color: 'rgb(var(--theme-primary))' }}>
                        ព្រះពុទ្ធបន្ទូល · Lời Phật Dạy Mỗi Ngày
                    </p>

                    {/* Lotus icon */}
                    <div className="mb-8" style={{ color: 'rgb(var(--theme-primary))' }}>
                        <LotusIcon />
                    </div>

                    {/* Khmer quote */}
                    {quote.quote_km && (
                        <p className="text-xl md:text-2xl font-serif leading-loose mb-5 tracking-wide" style={{ color: 'rgb(var(--theme-text) / 0.8)' }}>
                            &ldquo;{quote.quote_km}&rdquo;
                        </p>
                    )}

                    {/* Vietnamese quote */}
                    <p className="text-lg md:text-xl font-playfair italic leading-relaxed mb-10" style={{ color: 'rgb(var(--theme-text) / 0.7)' }}>
                        &ldquo;{quote.quote_vi}&rdquo;
                    </p>

                    {/* Wave divider */}
                    <div className="mb-6" style={{ color: 'rgb(var(--theme-primary) / 0.6)' }}>
                        <WaveDivider />
                    </div>

                    {/* Source */}
                    <p className="text-xs md:text-sm font-semibold tracking-[0.2em] uppercase" style={{ color: 'rgb(var(--theme-primary))' }}>
                        — {quote.source} —
                    </p>

                </div>
            </div>
        </section>
    );
}
