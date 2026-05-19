'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { ChampaFlowerIcon } from '@/components/ui/khmer-icons';

interface Slide {
    id: string;
    image_url?: string | null;
    title_vi?: string | null;
    subtitle_vi?: string | null;
}

interface LotusCollageHeroProps {
    slides?: Slide[];
    settings?: Record<string, string>;
}

/**
 * LotusCollageHero — Hero Lotus: collage 3 ảnh ghép (2 dọc trái + 1 to phải),
 * nền hoa văn Khmer SVG, overlay đỏ son thanh trên header.
 * Màu accent dùng CSS variables --theme-primary (đỏ son) và --theme-secondary (cam vàng).
 */
export function LotusCollageHero({ slides = [], settings = {} }: LotusCollageHeroProps) {
    const [loaded, setLoaded] = useState(false);

    // Lấy 3 ảnh đầu (hoặc fallback)
    const img1 = slides[0]?.image_url;
    const img2 = slides[1]?.image_url;
    const img3 = slides[2]?.image_url;

    const mainSlide = slides[0];

    return (
        <section
            className="relative overflow-hidden min-h-[85vh] flex flex-col justify-center"
            style={{ backgroundColor: 'rgb(var(--theme-bg-start))' }}
        >
            {/* ── Subtler Pattern ── */}
            <div
                className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='rgb(var(--theme-primary))' fill-opacity='1'%3E%3Cpath d='M30 0 L35 10 L45 10 L37 16 L40 26 L30 20 L20 26 L23 16 L15 10 L25 10 Z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '100px 100px',
                }}
            />

            <div className="mx-auto max-w-7xl w-full px-6 sm:px-10 lg:px-16 relative z-10 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left: Content */}
                    <div className="flex flex-col">
                        <span
                            className="text-[10px] font-bold uppercase tracking-[0.4em] mb-6 flex items-center gap-2"
                            style={{ color: 'rgb(var(--theme-primary))' }}
                        >
                            <ChampaFlowerIcon className="w-4 h-4" />
                            Lotus · Champa Neak
                        </span>
                        
                        <h1
                            className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] mb-8"
                            style={{ color: 'rgb(var(--theme-text))' }}
                        >
                            {mainSlide?.title_vi || settings['site_name_vi'] || 'Chi nhánh Phật Giáo'}
                        </h1>
                        
                        <p
                            className="text-lg sm:text-xl leading-relaxed mb-10 max-w-lg"
                            style={{ color: 'rgb(var(--theme-text) / 0.6)' }}
                        >
                            {mainSlide?.subtitle_vi || settings['site_description_vi'] || 'Nơi gieo mầm thiện hạnh, lan tỏa hương thiền trong không gian văn hóa Khmer đặc sắc.'}
                        </p>

                        <div className="flex gap-4 flex-wrap">
                            <Link
                                href="/tin-tuc"
                                className="px-8 py-4 rounded-xl text-[13px] font-bold tracking-widest uppercase transition-all hover:brightness-110 shadow-lg shadow-primary/10"
                                style={{ backgroundColor: 'rgb(var(--theme-primary))', color: '#fff' }}
                            >
                                Khám Phá
                            </Link>
                            <Link
                                href="/gioi-thieu"
                                className="px-8 py-4 rounded-xl text-[13px] font-bold tracking-widest uppercase border transition-all hover:bg-black/5"
                                style={{ borderColor: 'rgb(var(--theme-primary) / 0.3)', color: 'rgb(var(--theme-text))' }}
                            >
                                Giới Thiệu
                            </Link>
                        </div>
                    </div>

                    {/* Right: Hero Image */}
                    <div className="relative aspect-[4/5] lg:aspect-square w-full max-w-xl mx-auto lg:mx-0">
                        <div className="absolute inset-4 -right-4 -bottom-4 border-2 rounded-3xl opacity-20" style={{ borderColor: 'rgb(var(--theme-primary))' }} />
                        <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl">
                            {img1 || img3 ? (
                                <Image
                                    src={(img1 || img3)!}
                                    alt="Hero"
                                    fill
                                    className="object-cover"
                                    priority
                                    unoptimized
                                />
                            ) : (
                                <div
                                    className="absolute inset-0"
                                    style={{ background: 'linear-gradient(135deg, rgb(var(--theme-primary) / 0.1), rgb(var(--theme-primary) / 0.2))' }}
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                        
                        {/* Minimal floating badge */}
                        <div
                            className="absolute -top-4 -right-4 w-24 h-24 rounded-full flex items-center justify-center text-[9px] font-black tracking-tighter text-center leading-tight shadow-xl"
                            style={{ backgroundColor: 'rgb(var(--theme-secondary))', color: 'rgb(var(--theme-hero))' }}
                        >
                            SINCE<br />1946
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
