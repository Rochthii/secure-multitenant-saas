'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { DharmaWheelIcon, LotusIcon, PrayerBeadsIcon } from '@/components/ui/khmer-icons';
import { SacredMandala } from '@/components/ui/SacredMandala';
import { HeritageTexture } from '@/components/ui/HeritageTexture';

/**
 * TripleGemSectionAlt2 - "Sacred Mandala Editorial"
 * A cosmic, immersive visualization of the Triple Gem with orbiting sacred nodes.
 */
export function TripleGemSectionAlt2() {
    const t = useTranslations('common');

    const nodes = [
        {
            id: 'buddha',
            title: 'PHẬT BẢO',
            pali: 'BUDDHA',
            description: 'Bậc Toàn Giác, ngọn hải đăng của Trí Tuệ và Từ Bi, dẫn lối tâm hồn về bờ giác ngộ.',
            icon: <LotusIcon className="w-10 h-10" color="currentColor" />,
            color: 'rgb(var(--theme-primary))',
            position: 'absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
            delay: 0.2
        },
        {
            id: 'dhamma',
            title: 'PHÁP BẢO',
            pali: 'DHAMMA',
            description: 'Pháp âm huyền diệu, liều thuốc nhiệm mầu chuyển hóa khổ đau thành an lạc tự tại.',
            icon: <DharmaWheelIcon className="w-10 h-10" color="currentColor" />,
            color: '#F59E0B',
            position: 'absolute bottom-4 left-0 -translate-x-1/4 translate-y-1/4',
            delay: 0.4
        },
        {
            id: 'sangha',
            title: 'TĂNG BẢO',
            pali: 'SANGHA',
            description: 'Những bước chân tỉnh thức, gìn giữ mạng mạch Phật pháp trường tồn giữa nhân gian.',
            icon: <PrayerBeadsIcon className="w-10 h-10" color="currentColor" />,
            color: '#B45309',
            position: 'absolute bottom-4 right-0 translate-x-1/4 translate-y-1/4',
            delay: 0.6
        }
    ];

    return (
        <section className="py-24 md:py-48 bg-[#0F0D0C] text-white relative overflow-hidden">
            {/* --- Cinematic Background --- */}
            <HeritageTexture variant="dark" opacity={0.3} patternOpacity={0.1} />
            
            {/* Atmospheric Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-primary/5 rounded-full blur-[140px] pointer-events-none" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-20 xl:gap-40">
                    
                    {/* Content Side */}
                    <div className="lg:w-1/2 space-y-10 text-center lg:text-left order-2 lg:order-1">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-4"
                        >
                            <div className="w-12 h-[1px] bg-gold-primary/40" />
                            <span className="text-gold-light/60 text-[10px] font-black uppercase tracking-[0.4em]">The Sacred Triple Gem</span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2 }}
                            className="text-5xl md:text-7xl lg:text-8xl font-serif font-black text-white leading-[0.95] tracking-tighter"
                        >
                            TAM BẢO <br />
                            <span className="italic font-light" style={{ color: 'rgb(var(--theme-primary))' }}>NHIỆM MẦU</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5, duration: 1.5 }}
                            className="text-stone-400 text-xl font-light leading-relaxed max-w-xl mx-auto lg:mx-0 pr-6 border-l-2 pl-8 py-2"
                            style={{ borderColor: 'rgb(var(--theme-primary) / 0.2)' }}
                        >
                            Phật, Pháp, Tăng là ba ngôi nương tựa tối thượng — giúp hành giả hướng tâm về bờ giác, sống an lạc và tỉnh thức giữa đời thường.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.8 }}
                            className="pt-4"
                        >
                            <Link 
                                href="/tam-bao"
                                className="group inline-flex items-center gap-8 h-20 pl-12 pr-4 backdrop-blur-xl border border-white/10 text-white rounded-full transition-all hover:border-gold-primary/40 overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-gold-primary/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700" />
                                <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.5em]">{t('read_more')}</span>
                                <div className="relative z-10 w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold-primary transition-all duration-700">
                                    <DharmaWheelIcon className="w-7 h-7 text-gold-primary group-hover:text-black group-hover:rotate-180 transition-all duration-1000" />
                                </div>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Visual Mandala Side */}
                    <div className="lg:w-1/2 flex justify-center order-1 lg:order-2 w-full relative h-[500px] md:h-[700px] items-center">
                        
                        {/* Central Cosmic Element */}
                        <div className="relative w-72 h-72 md:w-[500px] md:h-[500px] flex items-center justify-center">
                            
                            {/* Deep Background Mandala */}
                            <SacredMandala size={800} className="scale-[0.5] md:scale-100 opacity-30 md:opacity-50" />

                            {/* Center Core */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.5, type: "spring" }}
                                className="z-10 w-24 h-24 md:w-44 md:h-44 rounded-full bg-[#1A1614] border border-gold-primary/20 flex items-center justify-center shadow-2xl relative group overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gold-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                <div className="relative z-10 group-hover:scale-110 transition-transform duration-1000">
                                    <DharmaWheelIcon className="w-12 h-12 md:w-20 md:h-20 text-gold-primary group-hover:rotate-90 transition-transform duration-[3000ms]" />
                                </div>
                                <div className="absolute inset-0 border-[4px] border-gold-primary opacity-10 rounded-full animate-ping-slow" />
                            </motion.div>

                            {/* Triple Gem Nodes */}
                            {nodes.map((node) => (
                                <motion.div
                                    key={node.id}
                                    initial={{ opacity: 0, scale: 0 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: node.delay, duration: 1.2, type: 'spring' }}
                                    className={`${node.position} z-20 group`}
                                >
                                    <div className="flex flex-col items-center">
                                        <motion.div
                                            whileHover={{ scale: 1.15, rotate: 12, y: -20 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                            className="w-20 h-20 md:w-32 md:h-32 rounded-[2rem] bg-[#1C1917] border border-white/5 flex items-center justify-center shadow-2xl relative overflow-hidden cursor-pointer"
                                        >
                                            <div className="absolute inset-0 bg-gold-primary opacity-[0.03] group-hover:opacity-100 transition-opacity duration-1000" />
                                            <div className="transition-all duration-700 z-10" style={{ color: node.color }}>
                                                {node.icon}
                                            </div>
                                            {/* Glow overlay */}
                                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-gold-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                        </motion.div>
                                        
                                        {/* Content Tooltip-like Info */}
                                        <div className="absolute top-full mt-8 w-64 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                                            <h4 className="text-xl font-serif font-black mb-1" style={{ color: node.color }}>{node.title}</h4>
                                            <p className="text-[10px] text-stone-500 font-bold tracking-[0.2em] mb-3">{node.pali}</p>
                                            <p className="text-sm text-stone-400 leading-relaxed font-light italic px-4">{node.description}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Vertical Signature */}
            <div className="absolute right-10 bottom-10 hidden xl:block pointer-events-none" style={{ writingMode: 'vertical-rl' }}>
                <span className="text-white/10 text-[10px] font-black tracking-[2em] uppercase">LEGACY • WISDOM • PEACE</span>
            </div>
        </section>
    );
}

