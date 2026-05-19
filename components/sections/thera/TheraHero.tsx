'use client';
import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

// ── THERAVĀDA PALETTE ──
// #FFF9F0 nền chính | #F4EFE2 nền phụ | #5C432A nâu gỗ tối
// #3C2F1F text chính | #7D6B52 text mờ | #E6A229 vàng chi nhánh accent

interface HeroSlide {
    id: string;
    image_url?: string | null;
    title_vi?: string | null;
    subtitle_vi?: string | null;
}

interface TheraHeroProps {
    slides?: HeroSlide[];
    settings?: Record<string, string>;
}

/**
 * TheraHero — Split 50/50
 * Mobile: ảnh 50svh top, text full-width dưới
 * Desktop: ảnh bên trái, text bên phải với nền kem sáng
 */
export function TheraHero({ slides = [], settings = {} }: TheraHeroProps) {
    const slide = slides[0];
    const siteName = settings['site_name_vi'] || 'Chi nhánh Phật Giáo';
    const title = slide?.title_vi || siteName;
    const subtitle = slide?.subtitle_vi || settings['site_description_vi'] || 'Nơi hội tụ giáo lý Phật giáo Nam tông — thanh tịnh, trang nghiêm và ấm áp.';
    const year = new Date().getFullYear();

    return (
        <section className="w-full min-h-[100svh] flex flex-col md:flex-row" style={{ backgroundColor: 'rgb(var(--theme-surface))' }}>

            {/* LEFT — Image */}
            <div className="relative w-full md:w-1/2 h-[50svh] md:h-auto md:min-h-screen shrink-0 overflow-hidden">
                {slide?.image_url ? (
                    <Image
                        src={slide.image_url}
                        alt={title}
                        fill
                        className="object-cover object-center"
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                        unoptimized
                    />
                ) : (
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgb(var(--theme-hero)) 0%, rgb(var(--theme-text)) 100%)' }} />
                )}

                {/* Gradient bottom on mobile */}
                <div
                    className="absolute inset-x-0 bottom-0 h-20 md:hidden"
                    style={{ background: 'linear-gradient(to top, rgb(var(--theme-surface)), transparent)' }}
                />

                {/* Yellow accent bar — bottom-left corner */}
                <div
                    className="absolute bottom-0 left-0 w-12 h-1 md:w-1 md:h-20"
                    style={{ backgroundColor: 'rgb(var(--theme-primary))' }}
                />
            </div>

            {/* RIGHT — Typography panel */}
            <div
                className="flex-1 flex flex-col px-6 py-10 md:px-14 md:py-0 md:justify-center"
                style={{ backgroundColor: 'rgb(var(--theme-surface))' }}
            >
                {/* Meta top */}
                <div className="flex items-center gap-3 mb-8 md:mb-10">
                    <div className="w-6 h-px" style={{ backgroundColor: 'rgb(var(--theme-primary))' }} />
                    <span className="text-[9px] font-bold tracking-[0.5em] uppercase" style={{ color: 'rgb(var(--theme-text) / 0.6)' }}>
                        {siteName} · {year}
                    </span>
                </div>

                {/* Title */}
                <h1
                    className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] mb-5"
                    style={{ fontFamily: 'Merriweather, Georgia, "Times New Roman", serif', color: 'rgb(var(--theme-text))' }}
                >
                    {title}
                </h1>

                <p className="text-base md:text-lg leading-relaxed mb-10 max-w-md" style={{ color: 'rgb(var(--theme-text) / 0.6)' }}>
                    {subtitle}
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/gioi-thieu"
                        className="inline-flex items-center gap-2.5 px-6 py-3 text-xs font-bold tracking-[0.2em] uppercase text-white transition-all hover:opacity-85 duration-200"
                        style={{ backgroundColor: 'rgb(var(--theme-hero))' }}
                    >
                        Giới Thiệu
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                    <Link
                        href="/tin-tuc"
                        className="inline-flex items-center px-6 py-3 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-200"
                        style={{ border: '1.5px solid rgb(var(--theme-primary))', color: 'rgb(var(--theme-hero))' }}
                    >
                        Tin Tức
                    </Link>
                </div>

                {/* Scroll nudge (desktop) */}
                <div className="hidden md:flex items-center gap-3 mt-14">
                    <div className="w-px h-10 bg-amber-200 overflow-hidden relative">
                        <div
                            className="w-full h-1/2 absolute"
                            style={{ backgroundColor: 'rgb(var(--theme-primary))', animation: 'thera-scroll 2s ease-in-out infinite' }}
                        />
                    </div>
                    <span className="text-[9px] tracking-[0.4em] uppercase" style={{ color: 'rgb(var(--theme-text) / 0.6)' }}>Cuộn xuống</span>
                </div>
            </div>

            <style>{`@keyframes thera-scroll { 0%{top:-50%;opacity:1} 100%{top:150%;opacity:0} }`}</style>
        </section>
    );
}
