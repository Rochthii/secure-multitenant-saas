'use client';
import React from 'react';

export function ZenBreathingBanner() {
    return (
        <section className="py-24 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: 'rgb(var(--theme-bg-start))' }}>
            <div className="absolute inset-0 z-0 flex items-center justify-center">
                <div className="absolute rounded-full w-64 h-64 border" style={{ borderColor: 'rgb(var(--theme-primary) / 0.1)' }} />
            </div>

            <div className="text-center relative z-10 max-w-2xl px-6">
                <span className="text-[12px] font-semibold tracking-[0.3em] uppercase block mb-6" style={{ color: 'rgb(var(--theme-primary))' }}>Pháp Thực Tập</span>
                <p className="text-2xl sm:text-3xl font-light leading-relaxed" style={{ color: 'rgb(var(--theme-text))' }}>
                    "Thở vào tôi biết tôi đang thở vào,<br />
                    Thở ra tôi biết tôi đang thở ra."
                </p>
                <div className="w-12 h-px mx-auto mt-8 opacity-30" style={{ backgroundColor: 'rgb(var(--theme-text))' }} />
            </div>
        </section>
    );
}
