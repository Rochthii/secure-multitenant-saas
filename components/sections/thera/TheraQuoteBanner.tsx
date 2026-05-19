'use client';
import React from 'react';

interface TheraQuoteBannerProps {
    quote?: string;
    attribution?: string;
    subAttribution?: string;
}

/**
 * TheraQuoteBanner — Plug-and-play quote section
 * Nền nâu gỗ #5C432A, chữ vàng + trắng
 * Bố cục centered với 2 line trang trí bên cạnh
 */
export function TheraQuoteBanner({
    quote = "Hận thù diệt hận thù, đời này không có được. Từ bi diệt hận thù, là định luật ngàn thu.",
    attribution = "Kinh Pháp Cú",
    subAttribution = "Dhammapada"
}: TheraQuoteBannerProps) {
    return (
        <section className="py-20 md:py-28 px-6 text-center overflow-hidden" style={{ backgroundColor: '#5C432A' }}>
            <div className="max-w-4xl mx-auto relative">
                
                {/* Decorative Icon / Ornament top */}
                <div className="flex justify-center mb-10">
                    <div className="relative">
                        <div className="w-10 h-10 rotate-45 border" style={{ borderColor: 'rgba(230,162,41,0.3)' }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#E6A229' }} />
                        </div>
                    </div>
                </div>

                {/* Quote Text */}
                <div className="flex items-center justify-center gap-4 md:gap-8 mb-8">
                    {/* Left line */}
                    <div className="hidden sm:block flex-1 h-px opacity-20" style={{ backgroundColor: '#E6A229' }} />
                    
                    <h2 
                        className="text-2xl md:text-3xl lg:text-4xl font-bold leading-relaxed italic md:max-w-2xl shrink-0"
                        style={{ fontFamily: 'Merriweather, Georgia, serif', color: '#FFF9F0' }}
                    >
                        “{quote}”
                    </h2>

                    {/* Right line */}
                    <div className="hidden sm:block flex-1 h-px opacity-20" style={{ backgroundColor: '#E6A229' }} />
                </div>

                {/* Attribution */}
                <div className="inline-flex flex-col items-center">
                    <span 
                        className="text-[10px] font-bold tracking-[0.4em] uppercase mb-1"
                        style={{ color: '#E6A229' }}
                    >
                        {attribution}
                    </span>
                    <span 
                        className="text-[9px] tracking-[0.2em] uppercase opacity-40 shrink-0"
                        style={{ color: '#FFF9F0' }}
                    >
                        — {subAttribution} —
                    </span>
                </div>

                {/* Subtle background decoration */}
                <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-serif opacity-[0.03] select-none pointer-events-none"
                    style={{ color: '#E6A229' }}
                >
                    Dhamma
                </div>
            </div>
        </section>
    );
}
