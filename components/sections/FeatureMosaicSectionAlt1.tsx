'use client';
import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { LotusIcon, DharmaWheelIcon } from '@/components/ui/khmer-icons';
import type { AboutSectionRow } from '@/lib/cache/queries';
import { autoMapAboutSections } from '@/lib/utils/autoMapAboutSections';
import { HeritageTexture } from '@/components/ui/HeritageTexture';
import { motion } from 'framer-motion';

interface FeatureMosaicSectionAlt1Props {
    abbotSection?: AboutSectionRow | null;
    introSection?: AboutSectionRow | null;
    architectureSection?: AboutSectionRow | null;
    aboutSections?: AboutSectionRow[];
    settings?: Record<string, any>;
}

/**
 * FeatureMosaicSectionAlt1 - "Asymmetric Heritage"
 * Focuses on organic shapes and editorial storytelling.
 */
export function FeatureMosaicSectionAlt1(props: FeatureMosaicSectionAlt1Props) {
    const t = useTranslations('home.features');
    const { introSection, abbotSection, architectureSection } = autoMapAboutSections(
        props.aboutSections, props, props.settings
    );

    const abbotName = abbotSection?.title_vi || 'Đại Đức Trụ Trì';
    const abbotThumbnail = abbotSection?.image_url || '/images/abbot.webp';

    return (
        <section className="py-24 md:py-40 lg:py-52 bg-page-surface overflow-hidden relative border-y border-stone-200/40">
            {/* --- Cinematic Foundation --- */}
            <HeritageTexture variant="light" opacity={0.1} patternOpacity={0.04} />
            
            {/* Background Accents */}
            <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-gold-primary/5 rounded-full blur-[120px] -translate-x-1/2" />
            <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-brown/5 rounded-full blur-[150px] translate-x-1/4" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
                    
                    {/* LEFT COLUMN: SPIRITUAL NARRATIVE */}
                    <div className="lg:w-[45%] flex flex-col justify-center space-y-10">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 0.8, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="inline-flex items-center gap-4 text-gold-dark font-bold tracking-[0.4em] uppercase text-[10px]"
                        >
                            <LotusIcon className="w-5 h-5 text-gold-primary" color="currentColor" />
                            <span>Di Sản Truyền Thừa</span>
                        </motion.div>
                        
                        <div className="space-y-6">
                            <motion.h2 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="text-4xl lg:text-7xl font-serif font-black text-coffee-dark leading-[1.05] tracking-tight"
                            >
                                {introSection?.title_vi || 'Dòng Chảy Lịch Sử'}
                            </motion.h2>
                            <motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ width: '80px' }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                                className="flex items-center gap-4"
                            >
                                <div className="h-0.5 bg-gold-primary" />
                                <span className="text-stone-400 font-serif italic text-sm whitespace-nowrap">Theravāda Tradition</span>
                            </motion.div>
                        </div>

                        <motion.p 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: 0.8 }}
                            className="text-stone-500 leading-relaxed text-xl font-light italic max-w-lg"
                        >
                            {introSection?.summary_vi || (introSection?.content_vi ? introSection.content_vi.replace(/<[^>]*>/g, '').substring(0, 180) + '...' : 'Ngôi chi nhánh mang trong mình dòng chảy Phật pháp ngàn năm của người Khmer Nam Bộ, là chốn quy y của ba ngôi Tam Bảo.')}
                        </motion.p>
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 1 }}
                            className="pt-6"
                        >
                            <Link
                                href={`/gioi-thieu/${introSection?.key || 'dong-chay-lich-su'}`}
                                className="inline-flex items-center gap-6 text-coffee-dark font-bold tracking-[0.3em] text-[10px] uppercase group"
                            >
                                <span className="relative pb-2">
                                    Chiêm bái lịch sử
                                    <span className="absolute bottom-0 left-0 w-full h-px bg-gold-primary origin-right scale-x-0 group-hover:scale-x-100 group-hover:origin-left transition-transform duration-700" />
                                </span>
                                <div className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center group-hover:bg-gold-primary group-hover:border-gold-primary transition-all duration-700">
                                    <DharmaWheelIcon className="w-5 h-5 text-gold-dark group-hover:text-white transition-all duration-700 group-hover:rotate-180" color="currentColor" />
                                </div>
                            </Link>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN: ASYMMETRIC SACRED GEOMETRY */}
                    <div className="lg:w-[55%] relative w-full h-[500px] md:h-[700px] lg:h-[850px]">
                        
                        {/* Image 1: Main Architecture */}
                        <motion.div
                            initial={{ opacity: 0, x: 50, rotate: 2 }}
                            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute top-0 right-0 w-[85%] h-[75%] z-10"
                        >
                            <Link 
                                href={`/gioi-thieu/${architectureSection?.key || 'di-san-nghe-thuat/kien-truc-dieu-khac'}`}
                                className="block w-full h-full group"
                            >
                                <div className="relative w-full h-full rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-2xl bg-stone-100">
                                    <Image
                                        src={architectureSection?.image_url || "/images/hero-chua.jpg"}
                                        alt={architectureSection?.title_vi || "Kiến trúc"}
                                        fill
                                        className="object-cover transition-transform duration-[3000ms] group-hover:scale-110"
                                        sizes="(max-width: 1024px) 90vw, 50vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-coffee-dark/40 to-transparent mix-blend-multiply opacity-40 group-hover:opacity-20 transition-opacity duration-1000" />
                                    <div className="absolute top-12 right-12 text-white/30 font-serif italic text-8xl select-none group-hover:text-gold-light/60 transition-all duration-1000">01</div>
                                </div>
                            </Link>
                        </motion.div>

                        {/* Image 2: History Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, delay: 0.5 }}
                            className="absolute bottom-0 left-0 w-[60%] h-[45%] z-20"
                        >
                            <Link 
                                href={`/gioi-thieu/${introSection?.key || 'dong-chay-lich-su'}`}
                                className="block w-full h-full group pb-12"
                            >
                                <div className="relative w-full h-full rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-2xl border-[8px] md:border-[16px] border-white">
                                    <Image
                                        src={introSection?.image_url || "/images/hero-tenant-main.jpg"}
                                        alt="Dòng chảy lịch sử"
                                        fill
                                        className="object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                                        sizes="(max-width: 1024px) 60vw, 30vw"
                                    />
                                    <div className="absolute inset-0 bg-gold-dark/10 mix-blend-overlay" />
                                </div>
                            </Link>
                        </motion.div>

                        {/* Image 3: Abbot - Organic Heart */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 1 }}
                            className="absolute top-[60%] left-[65%] -translate-x-1/2 -translate-y-1/2 w-40 h-40 md:w-72 md:h-72 z-30"
                        >
                            <Link 
                                href={`/gioi-thieu/${abbotSection?.key || 'truyen-thua-tiep-noi/tru-tri-duong-nhiem'}`}
                                className="block w-full h-full group"
                            >
                                <div className="relative w-full h-full p-2 bg-gradient-to-br from-gold-light via-white to-gold-dark rounded-[30%_70%_70%_30%/30%_30%_70%_70%] shadow-2xl animate-float overflow-hidden group-hover:rounded-full transition-all duration-1000">
                                    <div className="relative w-full h-full rounded-[inherit] overflow-hidden bg-stone-100 border-4 border-white/80">
                                        <Image
                                            src={abbotThumbnail}
                                            alt={abbotName}
                                            fill
                                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                            sizes="300px"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-coffee-dark/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col items-center justify-end pb-8 md:pb-12 px-4 text-center">
                                            <span className="text-gold-light text-[10px] font-bold uppercase tracking-widest mb-1">Tôn Đức Trụ Trì</span>
                                            <span className="text-white text-sm md:text-lg font-serif font-bold leading-tight">{abbotName}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>

                        {/* Decorative Large Text */}
                        <div className="absolute bottom-10 right-0 text-stone-200/20 font-black text-8xl md:text-[12rem] tracking-tighter select-none z-0 pointer-events-none uppercase italic">
                            Legacy
                        </div>

                    </div>
                </div>
            </div>
            
            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-10 text-gold-primary/20 hidden lg:block animate-bounce">
                <LotusIcon className="w-8 h-8" color="currentColor" />
            </div>
        </section>
    );
}
