'use client';
import React from 'react';

interface InkQuoteBannerProps {
    quote?: string;
    attribution?: string;
    subAttribution?: string;
}

/**
 * InkQuoteBanner — Standalone quote block, plug-and-play.
 * Có thể nhúng vào bất kỳ trang nào.
 * Mobile: padding nhỏ hơn, font nhỏ hơn 1 bậc.
 */
export function InkQuoteBanner({
    quote = 'Hòa bình không nằm ngoài chúng ta — nó là bản chất thật của mỗi tâm hồn biết lắng nghe.',
    attribution = 'Kinh Pháp Cú',
    subAttribution = 'Dhammapada',
}: InkQuoteBannerProps) {
    return (
        <section
            className="py-14 md:py-20 px-5 md:px-10 lg:px-16"
            style={{
                background: 'linear-gradient(to bottom, #FFFFFF, #F8F7F4)',
            }}
        >
            <div className="max-w-3xl mx-auto text-center">

                {/* Decorative quotation mark */}
                <div
                    className="text-7xl md:text-9xl font-black leading-none mb-1 select-none"
                    style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        color: '#C41E3A',
                        lineHeight: 0.7,
                    }}
                    aria-hidden="true"
                >
                    "
                </div>

                <blockquote
                    className="text-xl sm:text-2xl md:text-3xl font-black leading-relaxed mt-6 md:mt-8 mb-8 md:mb-10"
                    style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        color: '#0F0F0F',
                    }}
                >
                    {quote}
                </blockquote>

                {/* Attribution */}
                <div className="flex items-center justify-center gap-4">
                    <div className="h-px w-10" style={{ backgroundColor: 'rgba(15,15,15,0.2)' }} />
                    <div>
                        <span className="text-xs font-black tracking-[0.35em] uppercase block" style={{ color: '#0F0F0F' }}>
                            {attribution}
                        </span>
                        {subAttribution && (
                            <span className="text-[10px] tracking-widest block mt-0.5 italic" style={{ color: '#6B6B6B' }}>
                                {subAttribution}
                            </span>
                        )}
                    </div>
                    <div className="h-px w-10" style={{ backgroundColor: 'rgba(15,15,15,0.2)' }} />
                </div>
            </div>
        </section>
    );
}
