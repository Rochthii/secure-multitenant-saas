'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { HeritageTexture } from '@/components/ui/HeritageTexture';
import { DharmaWheelIcon, LotusIcon, PrayerBeadsIcon } from '@/components/ui/khmer-icons';

/**
 * BentoCard Component with premium styling
 */
const BentoCard = ({ children, className, delay = 0 }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
        className={`rounded-[3rem] overflow-hidden p-10 md:p-14 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-stone-200/50 transition-all duration-700 hover:shadow-[0_40px_100px_rgba(0,0,0,0.08)] hover:-translate-y-2 group relative bg-white/40 backdrop-blur-xl ${className}`}
    >
        {children}
    </motion.div>
);

/**
 * TripleGemSectionAlt5 - "Bento Editorial Layout"
 * A modern, structured grid-based layout for the Triple Gem pillars.
 */
export function TripleGemSectionAlt5() {
    const t = useTranslations('common');

    return (
        <section className="py-24 md:py-48 bg-[#FBF9F7] relative overflow-hidden">
            {/* Cinematic Background */}
            <HeritageTexture variant="light" opacity={0.15} patternOpacity={0.06} />
            
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                
                {/* Section Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 md:mb-36 gap-12">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-4 mb-8"
                        >
                            <div className="w-12 h-[2px]" style={{ backgroundColor: 'rgb(var(--theme-primary))' }} />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">Dhammavaca Trilogy</span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2 }}
                            className="text-5xl md:text-8xl font-serif font-black text-stone-900 leading-[0.9] tracking-tighter"
                        >
                            TRIẾT LÝ <br />
                            <span className="italic font-light" style={{ color: 'rgb(var(--theme-primary))' }}>TAM BẢO</span>
                        </motion.h2>
                    </div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5, duration: 1.5 }}
                        className="max-w-md lg:pb-4"
                    >
                        <p className="text-stone-500 text-xl font-serif italic leading-relaxed border-l-2 pl-10 py-2" style={{ borderColor: 'rgb(var(--theme-primary) / 0.2)' }}>
                            "Nơi hội tụ của ánh sáng giác ngộ, Chánh pháp và sự thanh tịnh của Thánh chúng — ba viên ngọc quý soi sáng nhân gian."
                        </p>
                    </motion.div>
                </div>

                {/* Bento Grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 lg:gap-10 auto-rows-auto">
                    
                    {/* Buddha - Main Block */}
                    <BentoCard className="md:col-span-4 md:row-span-2 bg-gradient-to-br from-stone-50 to-white" delay={0.1}>
                        <div className="flex flex-col h-full relative z-10">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-[2rem] bg-white border border-stone-100 flex items-center justify-center shadow-sm mb-12 group-hover:scale-110 group-hover:rotate-6 transition-all duration-1000" style={{ color: 'rgb(var(--theme-primary))' }}>
                                <LotusIcon className="w-10 h-10 md:w-12 md:h-12" color="currentColor" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-4xl md:text-5xl font-serif font-black text-stone-900 mb-2">PHẬT BẢO</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-10 opacity-30">Buddha Ratana</p>
                                <p className="text-stone-500 text-xl font-serif font-light leading-relaxed mb-16 max-w-2xl">
                                    Đức Thế Tôn — bậc Chánh Đẳng Chánh Giác — người đã bóc trần vô minh, khai mở con đường Trí tuệ và Từ bi viên mãn để chúng sinh tự mình nỗ lực thoát khỏi nẻo tối.
                                </p>
                            </div>
                            <div className="mt-auto pt-10">
                                <Link 
                                    href="/tam-bao" 
                                    className="group/link inline-flex items-center gap-6 h-16 pl-8 pr-3 bg-stone-900 text-white rounded-full transition-all hover:bg-stone-800"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('read_more')}</span>
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover/link:bg-gold-primary transition-colors">
                                        <DharmaWheelIcon className="w-5 h-5 group-hover/link:rotate-90 transition-transform duration-1000" />
                                    </div>
                                </Link>
                            </div>
                        </div>
                        {/* Ornamental Graphic */}
                        <div className="absolute -right-20 -bottom-20 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-1000 pointer-events-none">
                            <DharmaWheelIcon className="w-[400px] h-[400px] rotate-[-15deg] group-hover:rotate-0 transition-transform duration-[4000ms]" />
                        </div>
                    </BentoCard>

                    {/* Dhamma - Secondary Block */}
                    <BentoCard className="md:col-span-2 md:row-span-1 bg-white/60" delay={0.2}>
                        <div className="space-y-8 relative z-10">
                            <div style={{ color: 'rgb(var(--theme-primary))' }} className="opacity-60 group-hover:opacity-100 transition-opacity">
                                <DharmaWheelIcon className="w-12 h-12" color="currentColor" />
                            </div>
                            <div>
                                <h3 className="text-2xl md:text-3xl font-serif font-black text-stone-900 mb-1">PHÁP BẢO</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Dhamma Ratana</p>
                            </div>
                            <p className="text-stone-500 font-serif italic text-lg leading-relaxed">
                                Giáo lý giải thoát thực thiết hiện tiền, không có thời gian, đến để mà thấy, lìa xa ưu phiền.
                            </p>
                        </div>
                    </BentoCard>

                    {/* Sangha - Secondary Block */}
                    <BentoCard className="md:col-span-2 md:row-span-1 bg-gradient-to-bl from-stone-50 to-white" delay={0.3}>
                        <div className="space-y-8 relative z-10">
                            <div className="text-[#B45309] opacity-60 group-hover:opacity-100 transition-opacity">
                                <PrayerBeadsIcon className="w-12 h-12" color="currentColor" />
                            </div>
                            <div>
                                <h3 className="text-2xl md:text-3xl font-serif font-black text-stone-900 mb-1">TĂNG BẢO</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Sangha Ratana</p>
                            </div>
                            <p className="text-stone-500 font-serif italic text-lg leading-relaxed">
                                Đoàn thể Thánh chúng thanh tịnh, ruộng thanh toán tối thắng, mạng mạch của niềm tin Chánh pháp.
                            </p>
                        </div>
                    </BentoCard>

                    {/* Quote - Decorative Block */}
                    <BentoCard className="md:col-span-3 bg-stone-900 text-white" delay={0.4}>
                        <div className="h-full flex flex-col justify-center">
                            <p className="text-2xl md:text-3xl font-serif italic font-light leading-relaxed mb-8 opacity-90 pr-10">
                                "Tự mình là ngọn đuốc cho chính mình, tự mình nương tựa nơi chính mình, không nương tựa nơi một người nào khác."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-[1px] bg-gold-primary" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gold-primary">Buddha's teaching</span>
                            </div>
                        </div>
                    </BentoCard>

                    {/* Minimal Branding - Small Block */}
                    <BentoCard className="md:col-span-3 bg-gold-primary/5 flex items-center justify-center text-center p-6" delay={0.5}>
                        <div>
                            <div className="font-serif text-5xl md:text-6xl font-black opacity-[0.05] mb-2 tracking-tighter">NAM TÔNG</div>
                            <div className="text-[10px] font-black text-stone-400 tracking-[1em] uppercase ml-[1em]">THERAVADA</div>
                        </div>
                    </BentoCard>

                </div>
            </div>
        </section>
    );
}

