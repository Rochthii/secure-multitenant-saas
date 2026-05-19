'use client';

import React from 'react';
import quotesData from '@/messages/dharma-quotes.json';
import { getVietnamTime } from '@/lib/utils/date';

export function DailyDharmaQuoteMinimal() {
    const now = getVietnamTime();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const quote = quotesData[dayOfYear % quotesData.length];

    if (!quote) return null;

    return (
        <section className="py-20 lg:py-32 bg-page-surface overflow-hidden">
            <div className="container mx-auto px-4">
                {/* Clean, Modern Card Container */}
                <div className="max-w-4xl mx-auto rounded-3xl p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-sm" style={{ backgroundColor: 'rgb(var(--theme-surface))', boxShadow: '0 0 0 1px rgb(var(--theme-text) / 0.05)' }}>
                    
                    {/* Minimalist Line & Label */}
                    <div className="flex flex-col items-center mb-12">
                        <div className="w-px h-12 mb-6" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.1)' }} />
                        <span className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase" style={{ color: 'rgb(var(--theme-text) / 0.4)' }}>
                            Lời Phật Dạy
                        </span>
                    </div>

                    {/* Khmer Quote - Smaller & Lighter */}
                    {quote.quote_km && (
                        <p className="text-lg md:text-xl font-serif leading-relaxed mb-8 max-w-2xl px-4 italic" style={{ color: 'rgb(var(--theme-text) / 0.5)' }}>
                            {quote.quote_km}
                        </p>
                    )}

                    {/* Main Vietnamese Quote - Large Display */}
                    <h2 className="text-2xl sm:text-3xl lg:text-5xl font-playfair font-medium leading-snug md:leading-tight mb-12" style={{ color: 'rgb(var(--theme-text) / 0.9)' }}>
                        "{quote.quote_vi}"
                    </h2>

                    {/* Source */}
                    <div className="inline-flex items-center gap-4">
                        <div className="w-8 h-px" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.1)' }} />
                        <span className="text-sm font-medium tracking-widest uppercase" style={{ color: 'rgb(var(--theme-text) / 0.6)' }}>
                            {quote.source}
                        </span>
                        <div className="w-8 h-px" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.1)' }} />
                    </div>

                </div>
            </div>
        </section>
    );
}
