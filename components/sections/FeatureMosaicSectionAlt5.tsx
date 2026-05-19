'use client';
import React from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { autoMapAboutSections } from '@/lib/utils/autoMapAboutSections';
import { useTranslations } from 'next-intl';

interface FeatureMosaicSectionAlt5Props {
    aboutSections?: any[];
    settings?: any;
    introSection?: any;
    abbotSection?: any;
    architectureSection?: any;
}

export function FeatureMosaicSectionAlt5({
    aboutSections = [],
    settings = {},
    introSection: propIntro,
    abbotSection: propAbbot,
    architectureSection: propArch,
}: FeatureMosaicSectionAlt5Props) {
    const t = useTranslations('common');
    const containerRef = React.useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

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

    const yVal = useTransform(scrollYProgress, [0, 1], [0, -150]);
    const rotate = useTransform(scrollYProgress, [0, 1], [0, 5]);

    if (!introSection && !abbotSection && !architectureSection) return null;

    const sections = [
        { data: introSection, label: 'Kinh Tự', sub: 'Lịch Sử Truyền Thừa' },
        { data: abbotSection, label: 'Đức Hạnh', sub: 'Tôn Đức Trụ Trì' },
        { data: architectureSection, label: 'Di Sản', sub: 'Kiến Trúc Điêu Khắc' }
    ].filter(s => s.data);

    return (
        <section ref={containerRef} className="relative py-32 md:py-48 overflow-hidden bg-page-surface">
            {/* Saffron & Sandalwood Decorative Elements */}
            <div className="absolute top-0 right-0 w-[60%] h-full opacity-[0.03] pointer-events-none select-none overflow-hidden" aria-hidden="true">
                <div className="text-[12rem] sm:text-[20rem] font-playfair font-black text-brown rotate-90 translate-x-1/2 whitespace-nowrap">
                    DHAMMACAKKA
                </div>
            </div>
            
            {/* Vertical Sutra Lines (Decorative) */}
            <div className="absolute top-0 left-12 h-full w-px bg-gradient-to-b from-transparent via-gold-dark/20 to-transparent hidden lg:block" />
            <div className="absolute top-0 left-20 h-full w-px bg-gradient-to-b from-transparent via-gold-dark/10 to-transparent hidden lg:block" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-5xl mx-auto space-y-48">
                    {sections.map((section, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-16 lg:gap-24`}
                        >
                            {/* Image Part - Parallax & Floating */}
                            <div className="w-full lg:w-1/2 relative">
                                <motion.div 
                                    style={{ y: idx % 2 === 0 ? yVal : 0, rotate: idx % 2 === 0 ? rotate : 0 }}
                                    className="relative z-10 aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] border-[8px] border-white/50"
                                >
                                    <Image
                                        src={section.data!.image_url || '/placeholder-tenant.jpg'}
                                        alt={section.data!.title_vi || 'Giới thiệu'}
                                        fill
                                        className="object-cover transition-transform duration-[2000ms] hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                </motion.div>
                                
                                <div className={`absolute -inset-8 bg-white/40 rounded-full blur-[60px] -z-10 transition-transform duration-1000 ${idx % 2 === 0 ? 'translate-x-4' : '-translate-x-4'}`} />
                                
                                <div className={`absolute top-1/2 ${idx % 2 === 0 ? '-left-12' : '-right-12'} -translate-y-1/2 hidden lg:block`} style={{ writingMode: 'vertical-rl' }}>
                                    <span className="text-[10px] font-bold tracking-[1em] text-gold-dark uppercase opacity-40">
                                        {section.sub}
                                    </span>
                                </div>
                            </div>

                            {/* Text Part - High Typography */}
                            <div className="w-full lg:w-1/2 space-y-8 flex flex-col justify-center">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-px bg-gold-primary" />
                                        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-brown">
                                            {section.label}
                                        </span>
                                    </div>
                                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-playfair font-bold text-coffee-dark leading-[1.1] tracking-tight">
                                        {section.data!.title_vi}
                                    </h2>
                                </div>

                                <div className="relative pl-8 border-l border-gold-primary/20">
                                    <p className="text-lg text-stone-600 leading-relaxed font-light italic">
                                        {section.data!.summary_vi || section.data!.content_vi?.replace(/<[^>]*>/g, '').substring(0, 220) + '...'}
                                    </p>
                                    <div className="absolute top-0 -left-3 w-6 h-6 bg-page-surface flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rotate-45 bg-gold-primary" />
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center gap-6">
                                    <Link 
                                        href={`/gioi-thieu/${section.data!.key}`}
                                        className="group relative h-14 px-10 bg-brown text-white rounded-full flex items-center font-bold tracking-widest text-xs uppercase overflow-hidden transition-transform hover:scale-105"
                                    >
                                        <span className="relative z-10">{t('read_more')}</span>
                                        <div className="absolute inset-0 bg-gold-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                    </Link>
                                    
                                    <div className="hidden sm:block">
                                        <div className="w-24 h-px bg-stone-300 group-hover:w-32 transition-all" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <motion.div 
                animate={{ y: [0, -30, 0] }}
                transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                className="absolute bottom-[10%] right-[10%] w-1.5 h-64 bg-gradient-to-b from-transparent via-gold-primary/30 to-transparent hidden lg:block" 
            />
        </section>
    );
}
