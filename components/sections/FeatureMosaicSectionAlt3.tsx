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

interface FeatureMosaicSectionAlt3Props {
    abbotSection?: AboutSectionRow | null;
    introSection?: AboutSectionRow | null;
    architectureSection?: AboutSectionRow | null;
    aboutSections?: AboutSectionRow[];
    settings?: Record<string, any>;
}

/**
 * FeatureMosaicSectionAlt3 - "Dark Editorial Legacy"
 * High-contrast, sophisticated dark mode layout for deep storytelling.
 */
export function FeatureMosaicSectionAlt3(props: FeatureMosaicSectionAlt3Props) {
    const t = useTranslations('home.features');
    const { introSection, abbotSection, architectureSection } = autoMapAboutSections(
        props.aboutSections, props, props.settings
    );

    const abbotName = abbotSection?.title_vi || 'Đại Đức Trụ Trì';
    const abbotThumbnail = abbotSection?.image_url || '/images/abbot.webp';

    return (
        <section className="py-24 md:py-40 bg-[#1A1614] text-white relative overflow-hidden border-y border-white/5">
            {/* --- Cinematic Dark Foundation --- */}
            <HeritageTexture variant="dark" opacity={0.2} patternOpacity={0.08} />
            
            {/* Atmospheric Glows */}
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-brown/10 rounded-full blur-[140px]" />
            <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-gold-primary/5 rounded-full blur-[120px]" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">

                {/* SECTION HEADER - PREMIUM ASYMMETRY */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-24">
                    <div className="space-y-6">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="flex items-center gap-4"
                        >
                            <div className="w-16 h-[1px]" style={{ backgroundColor: 'rgb(var(--theme-primary) / 0.5)' }} />
                            <p className="text-gold-light/60 text-[10px] tracking-[0.5em] uppercase font-bold">Chánh Điện · Di Sản</p>
                        </motion.div>
                        <motion.h2 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="text-5xl md:text-7xl lg:text-8xl font-serif font-black text-white leading-[1.05] tracking-tight"
                        >
                            Tầng Pháp <span className="italic" style={{ color: 'rgb(var(--theme-primary))' }}>Nhiệm Mầu</span>
                        </motion.h2>
                    </div>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="lg:w-1/3"
                    >
                        <p className="text-stone-400 text-lg font-light leading-relaxed border-l-2 pl-8 py-2" style={{ borderColor: 'rgb(var(--theme-primary) / 0.2)' }}>
                            Khám phá nét đẹp tâm linh và kiến trúc của ngôi chi nhánh qua góc nhìn nghệ thuật đương đại, nơi truyền thống giao thoa cùng sự tĩnh lặng.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                    
                    {/* CARD 1: LỊCH SỬ (Large Impact) */}
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2 }}
                        className="lg:col-span-8 relative group"
                    >
                        <div className="relative h-[500px] md:h-[700px] rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 bg-stone-900">
                            <Image
                                src={introSection?.image_url || "/images/hero-tenant-main.jpg"}
                                alt="Dòng chảy lịch sử"
                                fill
                                className="object-cover transition-transform duration-[4000ms] group-hover:scale-110"
                                sizes="(max-width: 1024px) 100vw, 75vw"
                            />
                            {/* Gold-tinted Dark Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0F0D0C] via-[#0F0D0C]/40 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-1000" />
                            
                            {/* Content Overlapping inside Card */}
                            <div className="absolute bottom-10 left-10 right-10 md:bottom-16 md:left-16 md:right-16 z-20 space-y-6">
                                <motion.div 
                                    className="inline-block px-5 py-2 backdrop-blur-xl rounded-full border"
                                    style={{ backgroundColor: 'rgb(var(--theme-primary) / 0.1)', borderColor: 'rgb(var(--theme-primary) / 0.2)' }}
                                >
                                    <span className="text-gold-light text-[10px] uppercase tracking-[0.3em] font-bold">01 · Khởi Nguồn</span>
                                </motion.div>
                                <h3 className="text-4xl md:text-6xl font-serif font-black text-white group-hover:text-gold-light transition-colors duration-700 leading-tight">
                                    {introSection?.title_vi || 'Dòng Chảy Lịch Sử'}
                                </h3>
                                <p className="text-stone-300 text-lg md:text-xl font-light leading-relaxed max-w-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-700">
                                    {introSection?.summary_vi || (introSection?.content_vi ? introSection.content_vi.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : t('history.desc'))}
                                </p>
                                <div className="pt-6">
                                    <Link
                                        href={`/gioi-thieu/${introSection?.key || 'dong-chay-lich-su'}`}
                                        className="inline-flex items-center gap-6 text-white font-bold text-[10px] uppercase tracking-[0.4em] group/btn"
                                    >
                                        <span className="pb-1 border-b border-white/20 group-hover/btn:border-gold-primary transition-colors duration-500">Khám phá chi tiết</span>
                                        <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center group-hover/btn:bg-gold-primary group-hover/btn:border-gold-primary transition-all duration-700">
                                            <DharmaWheelIcon className="w-6 h-6 group-hover/btn:rotate-180 transition-transform duration-1000" color="currentColor" />
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT COLUMN: Stacked (4 columns) */}
                    <div className="lg:col-span-4 flex flex-col gap-10">
                        
                        {/* CARD 2: TRỤ TRÌ */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="flex-1"
                        >
                            <Link 
                                href={`/gioi-thieu/${abbotSection?.key || 'truyen-thua-tiep-noi/tru-tri-duong-nhiem'}`}
                                className="group relative block h-full min-h-[320px] rounded-[2.5rem] overflow-hidden border border-white/5"
                            >
                                <Image
                                    src={abbotThumbnail}
                                    alt={abbotName}
                                    fill
                                    className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                                    sizes="(max-width: 1024px) 100vw, 25vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#2A1F18] via-[#2A1F18]/20 to-transparent opacity-90 group-hover:opacity-80 transition-all duration-1000" />
                                
                                <div className="absolute bottom-10 left-10 right-10">
                                    <p className="text-gold-light/80 text-[10px] tracking-[0.3em] uppercase mb-2 font-bold">02 · Trụ Trì</p>
                                    <h3 className="text-white text-3xl font-serif font-black mb-3">
                                        {t('abbot.title')}
                                    </h3>
                                    <div className="h-[2px] w-12 bg-gold-primary mb-4 group-hover:w-full transition-all duration-1000 origin-left" />
                                    <p className="text-white/80 text-base font-serif italic">{abbotName}</p>
                                </div>
                            </Link>
                        </motion.div>

                        {/* CARD 3: KIẾN TRÚC */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.6 }}
                            className="flex-1"
                        >
                            <Link 
                                href={`/gioi-thieu/${architectureSection?.key || 'di-san-nghe-thuat/kien-truc-dieu-khac'}`}
                                className="group relative block h-full min-h-[320px] rounded-[2.5rem] overflow-hidden border border-white/5 bg-stone-900"
                            >
                                <Image
                                    src={architectureSection?.image_url || "/images/hero-chua.jpg"}
                                    alt="Kiến trúc điêu khắc"
                                    fill
                                    className="object-cover transition-transform duration-[2000ms] group-hover:scale-110 opacity-60 group-hover:opacity-40"
                                    sizes="(max-width: 1024px) 100vw, 25vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                                
                                <div className="absolute top-10 right-10">
                                    <LotusIcon className="w-12 h-12 text-gold-primary/20 group-hover:text-gold-primary/60 transition-colors duration-1000" color="currentColor" />
                                </div>

                                <div className="absolute bottom-10 left-10 right-10">
                                    <p className="text-gold-light/80 text-[10px] tracking-[0.3em] uppercase mb-2 font-bold">03 · Kiến Trúc</p>
                                    <h3 className="text-white text-3xl font-serif font-black leading-tight">
                                        {architectureSection?.title_vi || t('architecture.title')}
                                    </h3>
                                    <p className="text-gold-primary/50 text-[10px] mt-4 tracking-[0.4em] font-black uppercase">Bản Sắc Khmer</p>
                                </div>
                            </Link>
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Deco Line */}
                <div className="mt-24 flex justify-center opacity-20">
                    <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-gold-primary to-transparent" />
                </div>
            </div>
        </section>
    );
}

