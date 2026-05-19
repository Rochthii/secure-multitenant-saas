'use client';

import React from 'react';
import quotesData from '@/messages/dharma-quotes.json';
import { getVietnamTime } from '@/lib/utils/date';

export function DailyDharmaQuoteCard() {
    const now = getVietnamTime();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const quote = quotesData[dayOfYear % quotesData.length];

    if (!quote) return null;

    return (
        <section className="py-16 md:py-24" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.03)' }}>
            <div className="container mx-auto px-4">
                
                {/* Clean, Modern Card Container */}
                <div className="max-w-4xl mx-auto rounded-3xl p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-sm" style={{ backgroundColor: 'rgb(var(--theme-surface))', boxShadow: '0 0 0 1px rgb(var(--theme-text) / 0.05)' }}>
                    
                    {/* Subtle Top Border Highlight */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-black/10 to-transparent" />

                    <div className="relative z-10">
                        {/* Heading */}
                        <div className="flex items-center gap-4 mb-10">
                            <span className="w-10 h-[2px]" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.8)' }} />
                            <h3 className="text-[11px] font-black tracking-[0.2em] uppercase" style={{ color: 'rgb(var(--theme-text) / 0.8)' }}>
                                Lời Phật Dạy Mỗi Ngày
                            </h3>
                        </div>

                        {/* Flex Container for Quotes */}
                        <div className="grid lg:grid-cols-2 gap-10 md:gap-16">
                            
                            {/* Left Col - Khmer/Sanskrit */}
                            <div className="flex flex-col justify-start border-l-2 pl-6 lg:border-none lg:pl-0" style={{ borderColor: 'rgb(var(--theme-text) / 0.05)' }}>
                                {quote.quote_km && (
                                    <p className="text-xl md:text-2xl font-serif leading-[1.8] italic mb-6" style={{ color: 'rgb(var(--theme-text) / 0.4)' }}>
                                        « {quote.quote_km} »
                                    </p>
                                )}
                                <span className="text-xs font-semibold uppercase tracking-widest mt-auto" style={{ color: 'rgb(var(--theme-text) / 0.3)' }}>
                                    Thích Ca Mâu Ni Phật
                                </span>
                            </div>

                            {/* Right Col - Visual Main Text */}
                            <div className="flex flex-col justify-center">
                                <h4 className="text-2xl md:text-3xl lg:text-[32px] font-playfair font-medium leading-[1.6] mb-8" style={{ color: 'rgb(var(--theme-text) / 0.9)' }}>
                                    {quote.quote_vi}
                                </h4>
                                
                                {/* Source Label */}
                                <div className="inline-flex items-center gap-3">
                                    <div className="px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.05)', color: 'rgb(var(--theme-text) / 0.6)' }}>
                                        {quote.source}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
