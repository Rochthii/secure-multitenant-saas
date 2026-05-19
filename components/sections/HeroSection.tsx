'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { GoldButton } from '@/components/ui/gold-button';
import { KhmerCorner } from '@/components/ui/khmer-corner';
import { Calendar, Image as ImageIcon } from 'lucide-react';

export function HeroSection() {
    const t = useTranslations('home');

    return (
        <section className="relative h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
                <Image
                    src="/images/hero-chua.jpg"
                    alt="Ngôi chi nhánh Phật giáo"
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-10" />
            </div>

            {/* Decorative Khmer Corners */}
            <KhmerCorner position="top-left" size="md" />
            <KhmerCorner position="top-right" size="md" />
            <KhmerCorner position="bottom-left" size="md" className="hidden md:block" />
            <KhmerCorner position="bottom-right" size="md" className="hidden md:block" />

            {/* Content */}
            <div className="relative z-20 text-center text-white px-4 animate-in fade-in zoom-in duration-1000">
                <div className="mb-8">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair font-bold text-white mb-4 drop-shadow-2xl leading-tight">
                        {t('title')}
                    </h1>
                </div>

                <p className="text-xl md:text-3xl mb-8 text-gold-primary font-khmer drop-shadow-md">
                    {t('subtitle')}
                </p>

                <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-gray-200 leading-relaxed font-light">
                    {t('description')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <GoldButton size="lg" className="text-lg min-w-[180px] shadow-gold-glow">
                        <Calendar className="mr-2 h-5 w-5" />
                        {t('viewCalendar')}
                    </GoldButton>
                    <GoldButton size="lg" variant="outline" className="text-lg min-w-[180px] border-white text-white hover:bg-white/10 hover:text-gold-light">
                        <ImageIcon className="mr-2 h-5 w-5" />
                        {t('virtualTour')}
                    </GoldButton>
                </div>
            </div>



            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-20 md:hidden">
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
                    <div className="w-1 h-3 bg-white/50 rounded-full" />
                </div>
            </div>
        </section>
    );
}
