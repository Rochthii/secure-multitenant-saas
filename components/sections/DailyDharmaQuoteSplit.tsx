'use client';

import React from 'react';
import quotesData from '@/messages/dharma-quotes.json';
import { getVietnamTime } from '@/lib/utils/date';

export function DailyDharmaQuoteSplit() {
    const now = getVietnamTime();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const quote = quotesData[dayOfYear % quotesData.length];

    if (!quote) return null;

    return (
        <section className="py-20 lg:py-28 border-y overflow-hidden" style={{ backgroundColor: 'rgb(var(--theme-surface))', borderColor: 'rgb(var(--theme-text) / 0.05)' }}>
            <div className="container mx-auto px-4 lg:px-12 max-w-[1400px]">
                
                <div className="flex flex-col lg:flex-row lg:items-center gap-10 md:gap-16 lg:gap-24">
                    
                    {/* Left Typography Block */}
                    <div className="lg:w-1/3 flex-shrink-0">
                        <div className="flex flex-col gap-4">
                            <span className="text-[10px] font-black tracking-[0.4em] uppercase border-l pl-4 py-1" style={{ color: 'rgb(var(--theme-text) / 0.3)', borderColor: 'rgb(var(--theme-text) / 0.3)' }}>
                                Daily Dharma Insight
                            </span>
                            
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black leading-[0.9] tracking-tighter" style={{ color: 'rgb(var(--theme-text) / 0.9)' }}>
                                Lời Phật<br />Dạy Mỗi<br />Ngày.
                            </h2>
                            
                            {quote.quote_km && (
                                <p className="text-sm font-serif italic leading-relaxed mt-6 pr-8" style={{ color: 'rgb(var(--theme-text) / 0.4)' }}>
                                    {quote.quote_km}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right Quote Block - Split by standard border */}
                    <div className="lg:w-2/3 lg:border-l lg:pl-16 xl:pl-24" style={{ borderColor: 'rgb(var(--theme-text) / 0.1)' }}>
                        <div className="relative">
                            
                            {/* Giant artistic quote mark in background */}
                            <span className="absolute -top-12 md:-top-16 -left-6 md:-left-8 text-8xl md:text-[140px] font-serif leading-none select-none" aria-hidden="true" style={{ color: 'rgb(var(--theme-text) / 0.05)' }}>
                                "
                            </span>

                            <p className="relative text-2xl md:text-[34px] lg:text-[40px] leading-[1.4] md:leading-[1.45] font-playfair font-normal mb-10 pt-4" style={{ color: 'rgb(var(--theme-text) / 0.8)' }}>
                                {quote.quote_vi}
                            </p>
                            
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-px" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.8)' }} />
                                <span className="text-[11px] font-bold tracking-[0.25em] uppercase" style={{ color: 'rgb(var(--theme-text) / 0.9)' }}>
                                    {quote.source}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
}
