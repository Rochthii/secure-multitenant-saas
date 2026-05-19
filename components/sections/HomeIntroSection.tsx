'use client';
import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { GoldButton } from '@/components/ui/gold-button';
import type { AboutSectionRow } from '@/lib/cache/queries';
import { HeritageTexture } from '@/components/ui/HeritageTexture';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { LotusIcon, DharmaWheelIcon } from '@/components/ui/khmer-icons';

interface HomeIntroSectionProps {
    introSection?: AboutSectionRow | null;
    isCompany?: boolean;
}

/**
 * HomeIntroSection - Upgraded to "Heritage Editorial" style.
 * featuring asymmetric layout, cinematic textures, and refined typography.
 */
export function HomeIntroSection({ introSection, isCompany }: HomeIntroSectionProps) {
    const t = useTranslations('home.intro');

    const title = introSection?.title_vi || t('title');
    const excerpt = introSection?.summary_vi ||
        (introSection?.content_vi ? introSection.content_vi.replace(/<[^>]*>/g, '').substring(0, 450) + '...' : '');

    const hasContent = Boolean(excerpt);

    return (
        <section className="relative py-20 md:py-32 lg:py-44 overflow-hidden bg-page-surface min-h-[70vh] flex items-center border-y border-stone-200/50">
            {/* --- Cinematic Background & Texture --- */}
            <HeritageTexture variant="light" opacity={0.12} patternOpacity={0.06} />
            
            {/* --- Aesthetic Floating Elements --- */}
            <div className="absolute top-20 right-20 w-64 h-64 bg-gold-primary/5 rounded-full blur-[100px] animate-pulse-slow" />
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-brown/5 rounded-full blur-[120px]" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
                    
                    {/* LEFT COLUMN: Vertical Title / Status (Editorial Accent) */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="hidden lg:flex lg:col-span-1 pt-4 items-center justify-center relative h-full"
                    >
                        <div className="rotate-[-90deg] whitespace-nowrap origin-center flex items-center gap-6">
                            <span className="text-[10px] tracking-[0.6em] font-bold uppercase text-gold-dark/40">
                                {isCompany ? 'Enterprise Standard' : 'Heritage established'}
                            </span>
                            <div className="w-16 h-px bg-gold-primary/30" />
                            <span className="text-serif italic text-stone-300">
                                {isCompany ? 'Corporate Excellence' : 'Theravāda Tradition'}
                            </span>
                        </div>
                    </motion.div>

                    {/* MAIN CONTENT: Editorial Typography */}
                    <div className="lg:col-span-11 xl:col-span-10 max-w-5xl">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="flex items-center gap-4 mb-8"
                        >
                            {isCompany ? (
                                <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            ) : (
                                <LotusIcon className="w-6 h-6 text-gold-primary animate-float" color="currentColor" />
                            )}
                            <span className={cn(
                                "text-xs font-bold tracking-[0.4em] uppercase opacity-80",
                                isCompany ? "text-indigo-600" : "text-gold-dark"
                            )}>
                                {isCompany ? 'Về chúng tôi' : t('subtitle')}
                            </span>
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            className="text-4xl md:text-6xl lg:text-8xl font-serif font-black mb-10 leading-[1.05] tracking-tight text-coffee-dark"
                        >
                            {title.split(' ').map((word, i) => (
                                <span key={i} className="inline-block mr-[0.2em] last:mr-0 last:italic last:text-gold-primary">
                                    {word}
                                </span>
                            ))}
                        </motion.h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.3 }}
                            >
                                <p className="text-lg md:text-xl text-stone-600 leading-relaxed font-light mb-10 first-letter:text-5xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:text-gold-primary">
                                    {hasContent ? excerpt : t('description')}
                                </p>
                                
                                <Link href={`/gioi-thieu/${introSection?.key || 'dong-chay-lich-su'}`}>
                                    <GoldButton
                                        variant="outline"
                                        size="lg"
                                        className="group border-coffee-dark/20 text-coffee-dark hover:bg-gold-primary hover:border-gold-primary hover:text-white min-w-[240px] px-8 h-16 rounded-full transition-all duration-500 overflow-hidden relative"
                                    >
                                        <span className="relative z-10 font-bold tracking-widest text-xs uppercase">{t('readMore')}</span>
                                        <div className="absolute inset-x-0 bottom-0 h-0 bg-gold-primary group-hover:h-full transition-all duration-500 ease-in-out z-0" />
                                    </GoldButton>
                                </Link>
                            </motion.div>

                            {/* Decorative Accent - Signature/Stamp feel */}
                            <motion.div 
                                initial={{ opacity: 0, rotate: -20, scale: 0.8 }}
                                whileInView={{ opacity: 0.1, rotate: 0, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 2, ease: "easeOut" }}
                                className="hidden md:block pointer-events-none select-none text-right"
                            >
                                <div 
                                    className={cn(
                                        "inline-block border-2 p-4 rounded-xl rotate-12",
                                        isCompany ? "border-indigo-600 text-indigo-600" : "border-current"
                                    )} 
                                    style={isCompany ? {} : { color: 'rgb(var(--theme-primary))' }}
                                >
                                    <span className="text-5xl font-black font-serif italic whitespace-nowrap">
                                        {isCompany ? 'Premium' : 'Legacy'}
                                    </span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* --- Corner Ornamental Detail --- */}
            <div className="absolute bottom-0 right-0 w-32 h-32 md:w-48 md:h-48 opacity-10 pointer-events-none">
                {isCompany ? (
                    <div className="w-full h-full p-8">
                        <svg className="w-full h-full text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
                            <rect x="2" y="2" width="20" height="20" rx="4" />
                            <path d="M7 8h10M7 12h10M7 16h6" />
                        </svg>
                    </div>
                ) : (
                    <DharmaWheelIcon className="w-full h-full text-gold-primary" color="currentColor" />
                )}
            </div>
        </section>
    );
}
