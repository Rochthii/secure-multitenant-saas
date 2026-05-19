'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { DharmaWheelIcon, PrayerBeadsIcon, TenantIcon, LotusIcon } from '@/components/ui/khmer-icons';
import { autoMapAboutSections } from '@/lib/utils/autoMapAboutSections';
import { useTranslations } from 'next-intl';
import { HeritageTexture } from '@/components/ui/HeritageTexture';

interface FeatureMosaicSectionAlt7Props {
    aboutSections?: any[];
    settings?: any;
    introSection?: any;
    abbotSection?: any;
    architectureSection?: any;
}

/**
 * FeatureMosaicSectionAlt7 - "Split Editorial Immersive"
 * Modern split-screen storytelling with cinematic focus and legacy textures.
 */
export function FeatureMosaicSectionAlt7({
    aboutSections = [],
    settings = {},
    introSection: propIntro,
    abbotSection: propAbbot,
    architectureSection: propArch,
}: FeatureMosaicSectionAlt7Props) {
    const t = useTranslations('common');
    const [activeIndex, setActiveIndex] = useState(0);

    // Auto-map sections
    const { 
        introSection, 
        abbotSection, 
        architectureSection 
    } = autoMapAboutSections(aboutSections, settings, {
        introSection: propIntro,
        abbotSection: propAbbot,
        architectureSection: propArch
    });

    if (!introSection && !abbotSection && !architectureSection) return null;

    const items = [
        { data: introSection, label: 'Lịch Sử', symbol: <DharmaWheelIcon className="w-6 h-6" />, desc: 'Dòng chảy di sản nghìn năm' },
        { data: abbotSection, label: 'Trụ Trì', symbol: <PrayerBeadsIcon className="w-6 h-6" />, desc: 'Đức hạnh và sự truyền thừa' },
        { data: architectureSection, label: 'Kiến Trúc', symbol: <TenantIcon className="w-6 h-6" />, desc: 'Nghệ thuật điêu khắc Khmer' }
    ].filter(i => i.data);

    const activeItem = items[activeIndex];

    return (
        <section className="relative min-h-[90vh] md:min-h-screen flex flex-col lg:flex-row bg-[#FDFCFB] overflow-hidden border-y border-stone-200/50">
            {/* Left Content: The Narrative Panel */}
            <div className="w-full lg:w-[45%] h-full flex flex-col justify-center p-10 md:p-20 lg:p-28 relative z-20">
                <HeritageTexture variant="light" opacity={0.15} patternOpacity={0.05} />
                
                <div className="max-w-xl space-y-20 relative z-10">
                    {/* Floating Nav Controls */}
                    <div className="flex flex-wrap gap-8 md:gap-14">
                        {items.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveIndex(idx)}
                                className="group flex flex-col items-center gap-3 transition-all duration-700"
                            >
                                <div className={`p-4 rounded-full transition-all duration-700 ${
                                    activeIndex === idx 
                                        ? 'scale-110 shadow-xl border' 
                                        : 'opacity-30 grayscale hover:opacity-60 scale-90'
                                }`}
                                style={{ 
                                    backgroundColor: activeIndex === idx ? 'rgb(var(--theme-primary) / 0.1)' : 'transparent',
                                    borderColor: activeIndex === idx ? 'rgb(var(--theme-primary) / 0.2)' : 'transparent',
                                    color: activeIndex === idx ? 'rgb(var(--theme-primary))' : 'rgb(var(--theme-text))'
                                }}>
                                    {item.symbol}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.5em] transition-all duration-700 ${
                                    activeIndex === idx ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                                }`} style={{ color: 'rgb(var(--theme-primary))' }}>
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Main Title & Story */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            className="space-y-12"
                        >
                            <div className="space-y-6">
                                <p className="font-serif italic text-2xl" style={{ color: 'rgb(var(--theme-primary))' }}>
                                    {activeItem.desc}
                                </p>
                                <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black leading-[0.95] tracking-tighter uppercase text-stone-900">
                                    {activeItem.data!.title_vi.split(' ').map((word: string, i: number) => (
                                        <span key={i} className={`block ${i % 2 === 1 ? 'pl-8 md:pl-16 italic font-light' : ''}`}>
                                            {word}
                                        </span>
                                    ))}
                                </h2>
                            </div>
                            
                            <p className="text-xl md:text-2xl text-stone-500 leading-relaxed font-light pr-12">
                                {activeItem.data!.summary_vi || activeItem.data!.content_vi?.replace(/<[^>]*>/g, '').substring(0, 220) + '...'}
                            </p>

                            <div className="pt-8">
                                <Link 
                                    href={`/gioi-thieu/${activeItem.data!.key}`}
                                    className="group inline-flex items-center gap-8 h-20 pl-12 pr-3 bg-[#1C1917] text-white rounded-full overflow-hidden transition-all hover:pr-4"
                                >
                                    <span className="text-[11px] font-black uppercase tracking-[0.5em]">Tìm hiểu thêm</span>
                                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                                        <LotusIcon className="w-7 h-7" style={{ color: 'rgb(var(--theme-primary))' }} />
                                    </div>
                                </Link>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Legacy Motif Background */}
                <div className="absolute -bottom-20 -left-20 w-80 h-80 opacity-[0.03] pointer-events-none rotate-12">
                    <LotusIcon className="w-full h-full text-stone-900" />
                </div>
            </div>

            {/* Right Visual Panel: The Immersive Image */}
            <div className="w-full lg:w-[55%] h-[500px] md:h-[700px] lg:h-screen relative overflow-hidden bg-stone-100">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeIndex}
                        initial={{ scale: 1.25, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.1, opacity: 0 }}
                        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={activeItem.data!.image_url || '/placeholder-tenant.jpg'}
                            alt={activeItem.data!.title_vi || 'Giới thiệu'}
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        {/* Immersive Cinematic Shades */}
                        <div className="absolute inset-0 bg-stone-900/10 mix-blend-multiply" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#FDFCFB] via-[#FDFCFB]/10 to-transparent lg:opacity-100 opacity-60" />
                        <div className="absolute inset-0 bg-gradient-to-t md:hidden from-[#FDFCFB] via-transparent to-transparent" />
                    </motion.div>
                </AnimatePresence>

                {/* Floating Meta Info */}
                <div className="absolute right-16 bottom-16 select-none pointer-events-none hidden lg:block" style={{ writingMode: 'vertical-rl' }}>
                    <div className="flex items-center gap-6">
                        <div className="h-24 w-[1px] bg-white/30" />
                        <span className="text-white/50 text-[10px] font-black tracking-[1.5em] uppercase">
                            THERA • DHAMMA • ANCIENT • LEGACY
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}

