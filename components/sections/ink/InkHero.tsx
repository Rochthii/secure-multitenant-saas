'use client';
import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

interface HeroSlide {
    id: string;
    image_url?: string | null;
    title_vi?: string | null;
    subtitle_vi?: string | null;
}

interface InkHeroProps {
    slides?: HeroSlide[];
    settings?: Record<string, string>;
}

/**
 * InkHero — Magazine split layout
 * Desktop: 60% ảnh trái | 40% text serif phải
 * Mobile: ảnh 55vh top, text dưới (mobile-first)
 */
export function InkHero({ slides = [], settings = {} }: InkHeroProps) {
    const slide = slides[0];
    const siteName = settings['site_name_vi'] || 'Chi nhánh Phật Giáo';
    const title = slide?.title_vi || settings['site_name_vi'] || 'Nơi Bình Yên Trở Về';
    const excerpt = slide?.subtitle_vi || settings['site_description_vi'] || 'Nơi hội tụ tinh hoa Phật pháp Nam tông — không gian tĩnh lặng, trí tuệ và từ bi.';

    const year = new Date().getFullYear();

    return (
        <section className="w-full min-h-[100svh] flex flex-col md:flex-row" style={{ backgroundColor: 'rgb(var(--theme-surface))' }}>

            {/* LEFT — Image (mobile: 55svh, desktop: 60%) */}
            <div className="relative w-full md:w-[60%] h-[55svh] md:h-auto md:min-h-screen shrink-0 overflow-hidden">
                {slide?.image_url ? (
                    <Image
                        src={slide.image_url}
                        alt={title}
                        fill
                        className="object-cover object-center"
                        priority
                        sizes="(max-width: 768px) 100vw, 60vw"
                        unoptimized
                    />
                ) : (
                    <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(135deg, rgb(var(--theme-hero)) 0%, rgb(var(--theme-secondary)) 100%)' }}
                    />
                )}

                {/* Ink wash gradient chỉ phía dưới ảnh trên mobile */}
                <div
                    className="absolute inset-x-0 bottom-0 h-24 md:hidden"
                    style={{ background: 'linear-gradient(to top, rgb(var(--theme-surface)), transparent)' }}
                />

                {/* Nhãn category — top-left */}
                <div className="absolute top-5 left-5">
                    <span
                        className="inline-block text-[9px] font-black tracking-[0.4em] uppercase text-white px-2 py-1"
                        style={{ backgroundColor: 'rgb(var(--theme-primary))' }}
                    >
                        Phật Giáo Nam Tông
                    </span>
                </div>
            </div>

            {/* RIGHT — Editorial text panel */}
            <div
                className="flex-1 flex flex-col justify-between px-6 py-8 md:px-12 md:py-12 lg:px-16 lg:py-16"
                style={{ backgroundColor: 'rgb(var(--theme-surface))' }}
            >
                {/* Top meta */}
                <div className="flex items-center justify-between mb-8 md:mb-0">
                    <span
                        className="text-[9px] font-black tracking-[0.5em] uppercase"
                        style={{ color: 'rgb(var(--theme-text) / 0.6)' }}
                    >
                        {siteName}
                    </span>
                    <span
                        className="text-[9px] tracking-[0.3em] uppercase"
                        style={{ color: 'rgb(var(--theme-text) / 0.6)' }}
                    >
                        Năm {year}
                    </span>
                </div>

                {/* Main content — vertically centered on desktop */}
                <div className="flex-1 flex flex-col justify-center py-6 md:py-0">
                    {/* Thin red line accent */}
                    <div className="w-10 h-0.5 mb-6" style={{ backgroundColor: 'rgb(var(--theme-primary))' }} />

                    <h1
                        className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] mb-6 tracking-tight"
                        style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: 'rgb(var(--theme-text))' }}
                    >
                        {title}
                    </h1>

                    <p
                        className="text-base md:text-lg leading-relaxed mb-10 max-w-md"
                        style={{ color: 'rgb(var(--theme-text) / 0.7)' }}
                    >
                        {excerpt}
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/gioi-thieu"
                            className="inline-flex items-center gap-2.5 px-6 py-3 text-xs font-black tracking-[0.25em] uppercase transition-all hover:bg-black hover:text-white duration-200"
                            style={{ border: '2px solid rgb(var(--theme-text))', color: 'rgb(var(--theme-text))' }}
                        >
                            Tìm hiểu
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                        <Link
                            href="/tin-tuc"
                            className="inline-flex items-center px-6 py-3 text-xs font-black tracking-[0.25em] uppercase text-white transition-all hover:opacity-80 duration-200"
                            style={{ backgroundColor: 'rgb(var(--theme-text))' }}
                        >
                            Tin Tức
                        </Link>
                    </div>
                </div>

                {/* Bottom — scroll nudge (desktop only) */}
                <div className="hidden md:flex items-center gap-3 mt-8">
                    <div className="w-px h-12 relative overflow-hidden" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.15)' }}>
                        <div
                            className="w-full absolute"
                            style={{
                                height: '40%',
                                backgroundColor: 'rgb(var(--theme-text))',
                                animation: 'ink-scroll 2s ease-in-out infinite',
                            }}
                        />
                    </div>
                    <span className="text-[9px] tracking-[0.4em] uppercase" style={{ color: 'rgb(var(--theme-text) / 0.6)' }}>Cuộn xuống</span>
                </div>
            </div>

            <style>{`
                @keyframes ink-scroll {
                    0%   { top: -40%; opacity: 1; }
                    100% { top: 140%; opacity: 0; }
                }
            `}</style>
        </section>
    );
}
