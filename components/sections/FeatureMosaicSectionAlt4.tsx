'use client';
import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { LotusIcon, DharmaWheelIcon } from '@/components/ui/khmer-icons';
import type { AboutSectionRow } from '@/lib/cache/queries';
import { autoMapAboutSections } from '@/lib/utils/autoMapAboutSections';
import { SacredMandala } from '@/components/ui/SacredMandala';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface FeatureMosaicSectionAlt4Props {
    abbotSection?: AboutSectionRow | null;
    introSection?: AboutSectionRow | null;
    architectureSection?: AboutSectionRow | null;
    aboutSections?: AboutSectionRow[];
    settings?: Record<string, any>;
}

export function FeatureMosaicSectionAlt4(props: FeatureMosaicSectionAlt4Props) {
    const t = useTranslations('home.features');
    const { introSection, abbotSection, architectureSection } = autoMapAboutSections(
        props.aboutSections, props, props.settings
    );

    const abbotName = abbotSection?.title_vi || 'Đại Đức Trụ Trì';
    const abbotThumbnail = abbotSection?.image_url || '/images/abbot.webp';

    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    const yParallax = useTransform(scrollYProgress, [0, 1], [0, -50]);

    const columns = [
        {
            image: introSection?.image_url || '/images/hero-tenant-main.jpg',
            alt: introSection?.title_vi || t('history.title'),
            num: '01',
            label: 'Di Sản Kiến Tự',
            title: introSection?.title_vi || 'Dòng Chảy Lịch Sử',
            desc: introSection?.summary_vi || (introSection?.content_vi ? introSection.content_vi.replace(/<[^>]*>/g, '').substring(0, 110) + '...' : t('history.desc')),
            href: `/gioi-thieu/${introSection?.key || 'dong-chay-lich-su'}`,
            cta: 'Hồi ức lịch sử',
        },
        {
            image: abbotThumbnail,
            alt: abbotName,
            num: '02',
            label: 'Bậc Thầy Truyền Thừa',
            title: abbotName,
            desc: abbotSection?.summary_vi || (abbotSection?.content_vi ? abbotSection.content_vi.replace(/<[^>]*>/g, '').substring(0, 110) + '...' : 'Đại Đức Trụ Trì — người giữ gìn ngọn đèn Chánh pháp Theravāda, gương mẫu về hạnh nguyện và thiền định tinh tấn.'),
            href: `/gioi-thieu/${abbotSection?.key || 'truyen-thua-tiep-noi/tru-tri-duong-nhiem'}`,
            cta: 'Hạnh nguyện Trụ Trì',
        },
        {
            image: architectureSection?.image_url || '/images/hero-chua.jpg',
            alt: architectureSection?.title_vi || t('architecture.title'),
            num: '03',
            label: 'Tinh Hoa Kiến Trúc',
            title: architectureSection?.title_vi || t('architecture.title'),
            desc: architectureSection?.summary_vi || (architectureSection?.content_vi ? architectureSection.content_vi.replace(/<[^>]*>/g, '').substring(0, 110) + '...' : t('architecture.desc')),
            href: `/gioi-thieu/${architectureSection?.key || 'di-san-nghe-thuat/kien-truc-dieu-khac'}`,
            cta: 'Nghệ thuật kiến trúc',
        },
    ];

    return (
        <section 
            ref={sectionRef}
            className="py-20 md:py-32 bg-page-surface overflow-hidden relative"
        >
            {/* ── Sacred Geometry Background ── */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none flex items-center justify-center overflow-hidden">
                <SacredMandala size={1200} className="scale-75 md:scale-100" />
            </div>

            {/* ── Film Grain Overlay (Cinematic Texture) ── */}
            <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none" 
                 style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")' }} />

            {/* ── Header - Minimal Editorial ── */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="container mx-auto px-6 mb-12 md:mb-16 relative z-10"
            >
                <div className="max-w-4xl">
                    <div className="flex items-center gap-4 mb-6">
                        <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: 48 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="h-[2px]" 
                            style={{ backgroundColor: 'rgb(var(--theme-primary))' }} 
                        />
                        <span className="text-[10px] tracking-[0.4em] uppercase font-bold" style={{ color: 'rgb(var(--theme-primary))' }}>
                            {props.settings?.tenantName || 'Giới Thiệu Tự Viện'}
                        </span>
                    </div>
                    <h2 
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-[1.1] tracking-tighter uppercase"
                        style={{ color: 'rgb(var(--theme-text))' }}
                    >
                        {introSection?.title_vi?.split(' ').slice(0, 2).join(' ') || 'Kiệt Tác'} <span className="italic" style={{ color: 'rgb(var(--theme-primary))' }}>{introSection?.title_vi?.split(' ').slice(2).join(' ') || 'Nam Tông'}</span>
                    </h2>
                </div>
            </motion.div>

            {/* ── 3 columns - Responsive Height ── */}
            <div className="flex flex-col md:flex-row h-auto md:h-[650px] lg:h-[750px] gap-0 border-y relative z-10" style={{ borderColor: 'rgb(var(--theme-text) / 0.1)' }}>
                {columns.map((col, i) => (
                    <Link
                        key={col.num}
                        href={col.href}
                        className="group relative flex-1 overflow-hidden min-h-[500px] md:min-h-full border-r last:border-r-0"
                        style={{ borderColor: 'rgb(var(--theme-text) / 0.1)' }}
                    >
                        {/* Background Image with Parallax & Smooth Scaling */}
                        <motion.div 
                            className="absolute inset-0"
                            style={{ y: yParallax }}
                        >
                            <Image
                                src={col.image}
                                alt={col.alt}
                                fill
                                className="object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, 33vw"
                                loading={i === 0 ? 'eager' : 'lazy'}
                            />
                        </motion.div>

                        {/* Sophisticated Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 group-hover:via-black/20 transition-all duration-1000 ease-in-out" />
                        <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-1000 mix-blend-overlay"
                            style={{ backgroundColor: 'rgb(var(--theme-primary))' }}
                        />

                        {/* ── Floating Glass Card - Sophisticated Info ── */}
                        <div className="absolute inset-0 p-8 sm:p-10 md:p-6 lg:p-12 flex flex-col justify-between">
                            {/* Top info - Number */}
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                                className="relative py-4"
                            >
                                <span className="text-white/20 text-8xl md:text-7xl lg:text-9xl font-serif font-black leading-none group-hover:text-white/40 transition-all duration-700 block -translate-x-4">
                                    {col.num}
                                </span>
                            </motion.div>

                            {/* Bottom info - Glass Card */}
                            <div className="space-y-6 relative z-20">
                                <div className="space-y-2">
                                    <p className="text-gold-light text-[10px] font-bold tracking-[0.4em] uppercase transition-all duration-500 transform translate-y-4 group-hover:translate-y-0"
                                       style={{ color: 'rgb(var(--theme-primary-light))' }}>
                                        {col.label}
                                    </p>
                                    <h3 className="text-white text-3xl md:text-2xl lg:text-4xl font-serif font-bold leading-tight drop-shadow-lg">
                                        {col.title}
                                    </h3>
                                </div>

                                <div className="overflow-hidden space-y-6">
                                    <p className="text-white/80 text-sm md:text-xs lg:text-base font-light leading-relaxed max-w-sm
                                        md:translate-y-8 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                                        {col.desc}
                                    </p>
                                    
                                    <div className="pt-2">
                                        <span className="inline-flex items-center gap-3 text-white font-bold text-[10px] uppercase tracking-[0.2em] group/cta">
                                            <span 
                                                className="pb-1 border-b transition-colors"
                                                style={{ borderColor: 'rgb(var(--theme-primary) / 0.3)' }}
                                            >
                                                {col.cta}
                                            </span>
                                            <div 
                                                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-md group-hover/cta:border-transparent transition-all duration-500"
                                                style={{ backgroundColor: 'rgb(var(--theme-primary) / 0.15)' }}
                                            >
                                                <DharmaWheelIcon className="w-5 h-5 transition-transform duration-700 group-hover/cta:rotate-180" style={{ color: 'rgb(var(--theme-primary))' }} />
                                            </div>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black/5 to-transparent pointer-events-none hidden md:block" />
                    </Link>
                ))}
            </div>
            
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-gold-dark/40 animate-bounce hidden md:block">
                <LotusIcon className="w-6 h-6" color="currentColor" />
            </div>
        </section>
    );
}
