'use client';
import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';
import type { AboutSectionRow } from '@/lib/cache/queries';

interface InkWashAuraIntroProps {
    introSection?: AboutSectionRow | null;
}

export function InkWashAuraIntro({ introSection }: InkWashAuraIntroProps) {
    const t = useTranslations('home.intro');

    const title = introSection?.title_vi || "Hào Quang Thủy Mặc";
    const excerpt = introSection?.summary_vi ||
        (introSection?.content_vi ? introSection.content_vi.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : '');

    return (
        <section className="relative py-32 overflow-hidden bg-white">
            {/* Subtle Gradient Backdrops */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-gray-100/30 to-transparent opacity-60 pointer-events-none blur-3xl" />
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-20">
                    
                    {/* Content Side */}
                    <div className="lg:w-1/2 order-2 lg:order-1">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-black/[0.03] border border-black/[0.06] text-gray-500 text-xs font-medium tracking-[0.2em] uppercase mb-10">
                            <Sparkles className="w-4 h-4 text-gold-primary/60" />
                            {t('spiritTitle') || "Tâm Linh & Nghệ Thuật"}
                        </div>

                        <h2 className="text-5xl md:text-6xl lg:text-7xl font-playfair font-black text-gray-900 mb-10 leading-[1.1] tracking-tight">
                            {title}
                        </h2>

                        <div className="relative pl-12 border-l border-gray-100 py-4 mb-12">
                            <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-gold-primary/30" />
                            <p className="text-xl text-gray-500 leading-relaxed font-light italic">
                                "{excerpt}"
                            </p>
                        </div>

                        <Link href={`/gioi-thieu/${introSection?.key || 'dong-chay-lich-su'}`} className="group relative inline-block">
                            <div className="relative z-10 px-10 py-5 bg-gray-900 text-white text-lg font-bold transition-all duration-300 group-hover:bg-gold-primary active:scale-95">
                                {t('readMore') || "Khám Phá Bản Sắc"}
                            </div>
                        </Link>
                    </div>

                    {/* Image Side */}
                    <div className="lg:w-1/2 order-1 lg:order-2 flex justify-center relative">
                        <div className="relative w-full max-w-[500px] aspect-[1/1] p-6">
                            {/* Static Frame */}
                            <div className="absolute inset-0 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.05)] rounded-[3rem] border border-gray-100" />
                            
                            <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden group">
                                {introSection?.image_url ? (
                                    <img 
                                        src={introSection.image_url} 
                                        alt={title}
                                        className="w-full h-full object-cover transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                                        <div className="w-16 h-16 border-2 border-gray-200 rounded-full" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default InkWashAuraIntro;
