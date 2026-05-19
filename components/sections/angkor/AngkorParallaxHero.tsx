'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

interface Slide { id: string; image_url?: string | null; title_vi?: string | null; subtitle_vi?: string | null; }
interface AngkorParallaxHeroProps { slides?: Slide[]; settings?: Record<string, string>; }

export function AngkorParallaxHero({ slides = [], settings = {} }: AngkorParallaxHeroProps) {
    const slide = slides[0];
    const hasImage = !!slide?.image_url;

    return (
        <section className="relative min-h-[80vh] flex flex-col overflow-hidden bg-black">
            {/* Background */}
            {hasImage ? (
                <Image
                    src={slide.image_url!}
                    alt="Angkor Hero"
                    fill
                    className="object-cover object-center opacity-60"
                    priority
                    unoptimized
                />
            ) : (
                <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgb(var(--theme-hero)) 0%, rgb(var(--theme-secondary) / 0.5) 50%, rgb(var(--theme-secondary)) 100%)' }} />
            )}

            {/* Overlay — gradient nhẹ hơn nhiều: thấy ảnh rõ hơn */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'linear-gradient(to top, rgb(var(--theme-hero) / 0.7) 0%, rgba(15,8,2,0) 100%)'
                }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-end flex-1 px-8 sm:px-16 lg:px-24 pb-24 pt-32">

                {/* Khmer badge */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="h-px w-10" style={{ backgroundColor: 'rgb(var(--theme-primary))' }} />
                    <span
                        className="text-[10px] tracking-[0.45em] uppercase font-bold"
                        style={{ color: 'rgb(var(--theme-primary))' }}
                    >
                        ប្រាសាទខ្មែរ · Prasat Khmer
                    </span>
                    <div className="h-px w-10" style={{ backgroundColor: 'rgb(var(--theme-primary))' }} />
                </div>

                {/* Title */}
                <h1
                    className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight text-white mb-6 max-w-4xl"
                    style={{ fontFamily: 'Georgia, serif' }}
                >
                    {slide?.title_vi || settings['site_name_vi'] || 'Chi nhánh Cổ Kính'}
                </h1>

                {/* Subtitle */}
                <p
                    className="text-base sm:text-lg max-w-xl mb-10 leading-relaxed"
                    style={{ color: 'rgb(var(--theme-surface) / 0.8)', fontFamily: 'Georgia, serif' }}
                >
                    {slide?.subtitle_vi || settings['site_description_vi'] || 'Kiến trúc đền tháp Khmer ngàn năm, nơi hội tụ tinh hoa văn minh Phật giáo Nguyên Thủy.'}
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap gap-4 items-center">
                    <Link
                        href="/gioi-thieu"
                        className="inline-flex items-center gap-2.5 px-8 py-3.5 text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:bg-white hover:text-stone-900"
                        style={{
                            border: '1.5px solid rgb(var(--theme-primary))',
                            color: 'rgb(var(--theme-primary))',
                        }}
                    >
                        <span>Khám Phá</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                    <Link
                        href="/tin-tuc"
                        className="inline-flex items-center px-8 py-3.5 text-sm font-bold tracking-widest uppercase text-stone-900 transition-all duration-300 hover:brightness-90"
                        style={{ backgroundColor: 'rgb(var(--theme-primary))' }}
                    >
                        Tin Tức
                    </Link>
                </div>
            </div>

        </section>
    );
}
