import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

interface Slide { id: string; image_url?: string | null; title_vi?: string | null; subtitle_vi?: string | null; }

export function SunrisePanoramaHero({ slides = [], settings = {} }: { slides?: Slide[], settings?: Record<string, string> }) {
    const slide = slides[0];

    return (
        <section className="relative min-h-[85vh] flex flex-col justify-center px-6 lg:px-16 overflow-hidden bg-coffee-dark">
            {slide?.image_url ? (
                <div className="absolute inset-0 z-0">
                    <Image 
                        src={slide.image_url} 
                        alt="Mekong Sunrise" 
                        fill 
                        priority 
                        className="object-cover opacity-60" 
                        sizes="100vw"
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-black/20" />
                </div>
            ) : (
                <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(to top, rgb(var(--theme-hero)) 0%, rgb(var(--theme-secondary) / 0.3) 100%)' }} />
            )}

            <div className="relative z-10 max-w-4xl text-left">
                <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black mb-8 leading-[1.1] text-white tracking-tight uppercase">
                    {slide?.title_vi || settings['site_name_vi'] || 'Ngày Mới An Lành'}
                </h1>

                <p className="text-lg sm:text-xl text-stone-200 opacity-90 max-w-2xl font-light leading-relaxed mb-12 italic">
                    {slide?.subtitle_vi || settings['site_description_vi'] || 'Mặt trời lên rọi sáng dòng Cửu Long, mang theo nguyện lành và phước báo đến cho mọi nhà.'}
                </p>

                <div className="flex gap-6 flex-wrap">
                    <Link
                        href="/transactions"
                        className="px-10 py-4 bg-white text-black font-bold uppercase tracking-widest text-[11px] shadow-lg transition-all hover:bg-stone-100"
                    >
                        Đóng góp
                    </Link>
                    <Link
                        href="/gioi-thieu"
                        className="px-10 py-4 border border-white/30 text-white font-bold uppercase tracking-widest text-[11px] hover:bg-white/10 transition-all"
                    >
                        Giới Thiệu
                    </Link>
                </div>
            </div>
        </section>
    );
}
