'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { autoMapAboutSections } from '@/lib/utils/autoMapAboutSections';
import { useTranslations } from 'next-intl';

interface FeatureMosaicSectionAlt6Props {
    aboutSections?: any[];
    settings?: any;
    introSection?: any;
    abbotSection?: any;
    architectureSection?: any;
}

export function FeatureMosaicSectionAlt6({
    aboutSections = [],
    settings = {},
    introSection: propIntro,
    abbotSection: propAbbot,
    architectureSection: propArch,
}: FeatureMosaicSectionAlt6Props) {
    const t = useTranslations('common');

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

    const cards = [
        { data: introSection, label: 'Lịch Sử', rotate: -2, delay: 0 },
        { data: abbotSection, label: 'Sư Trụ Trì', rotate: 2, delay: 0.2 },
        { data: architectureSection, label: 'Kiến Trúc', rotate: -1, delay: 0.4 }
    ].filter(c => c.data);

    return (
        <section className="relative py-24 overflow-hidden bg-page-surface">
            {/* Background Abstract Circles */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-gold-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-gold-light/10 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-20">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-serif font-black text-coffee-dark tracking-tight"
                    >
                        Khám Phá Tâm Hồn <span className="text-gold-dark italic">Nam Tông</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 items-stretch">
                    {cards.map((card, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 50, rotate: card.rotate * 2 }}
                            whileInView={{ opacity: 1, y: 0, rotate: card.rotate }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: card.delay, ease: "backOut" }}
                            whileHover={{ y: -15, rotate: 0, scale: 1.02 }}
                            className="flex flex-col bg-white rounded-[3rem] p-8 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] border border-gold-primary/20 group transition-shadow hover:shadow-[0_45px_100px_-20px_rgba(180,100,0,0.15)]"
                        >
                            <div className="relative aspect-square w-full rounded-[2.5rem] overflow-hidden mb-8 shadow-inner border border-slate-50">
                                <Image
                                    src={card.data!.image_url || '/placeholder-tenant.jpg'}
                                    alt={card.data!.title_vi || 'Giới thiệu'}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="text-xs font-bold uppercase tracking-[0.2em] text-gold-dark mb-2">
                                    {card.label}
                                </div>
                                <h3 className="text-2xl font-bold text-coffee-dark leading-tight min-h-[3rem] line-clamp-2">
                                    {card.data!.title_vi}
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                                    {card.data!.summary_vi || card.data!.content_vi?.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                                </p>
                            </div>

                            <div className="pt-8 border-t border-slate-50 mt-auto">
                                <Button asChild variant="ghost" className="w-full justify-between rounded-2xl group/btn hover:bg-gold-primary/10 text-brown font-bold tracking-wide">
                                    <Link href={`/gioi-thieu/${card.data!.key}`} className="flex items-center justify-between w-full">
                                        {t('read_more')}
                                        <motion.span
                                            animate={{ x: [0, 5, 0] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            className="text-xl"
                                        >
                                            →
                                        </motion.span>
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Float Floating Shapes */}
            <div className="absolute top-1/4 right-0 w-32 h-32 bg-gold-primary/10 rounded-full blur-2xl animate-bounce" />
            <div className="absolute bottom-1/4 left-0 w-48 h-48 bg-gold-light/10 rounded-full blur-3xl" />
        </section>
    );
}
