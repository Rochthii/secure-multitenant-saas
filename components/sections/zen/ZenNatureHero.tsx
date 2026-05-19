import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

interface Slide { id: string; image_url?: string | null; title_vi?: string | null; subtitle_vi?: string | null; }

export function ZenNatureHero({ slides = [], settings = {} }: { slides?: Slide[], settings?: Record<string, string> }) {
    const slide = slides[0];

    return (
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-page-surface">
            {/* Ảnh thiên nhiên tĩnh lặng */}
            {slide?.image_url && (
                <div className="absolute inset-0 z-0">
                    <Image 
                        src={slide.image_url} 
                        alt="Zen Nature Hero" 
                        fill 
                        className="object-cover opacity-70" 
                        priority 
                        sizes="100vw"
                        unoptimized
                    />
                </div>
            )}

            {/* Subtle Overlay */}
            <div className="absolute inset-0 z-10 bg-white/10" />

            <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
                {/* Minimal Logo / Icon */}
                <h1 className="text-4xl sm:text-6xl font-serif text-coffee/90 mb-8 tracking-tight italic">
                    {slide?.title_vi || settings['site_name_vi'] || 'Tĩnh Tặng'}
                </h1>
                
                <div className="w-px h-16 bg-coffee/20 mx-auto mb-10" />
                
                <p className="text-lg sm:text-xl text-coffee/60 font-light leading-relaxed mb-12 max-w-2xl">
                    {slide?.subtitle_vi || settings['site_description_vi'] || 'Dừng lại. Thở và Mỉm cười.'}
                </p>

                <Link
                    href="/documents"
                    className="px-12 py-4 border border-coffee/20 text-coffee/80 rounded-full hover:bg-coffee hover:text-white transition-all duration-500 uppercase tracking-widest text-[11px] font-medium"
                >
                    Hơi thở chánh niệm
                </Link>
            </div>
        </section>
    );
}
