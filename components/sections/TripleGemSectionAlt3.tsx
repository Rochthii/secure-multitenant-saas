'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { DharmaWheelIcon, LotusIcon, PrayerBeadsIcon } from '@/components/ui/khmer-icons';
import { HeritageTexture } from '@/components/ui/HeritageTexture';

/**
 * TripleGemSectionAlt3 - "Sacred Scrolls" (Kinh Lá Bối)
 * An editorial layout mimicking the traditional palm-leaf manuscripts of the Khmer People.
 */
export function TripleGemSectionAlt3() {
    const t = useTranslations('common');

    const scrolls = [
        {
            title: 'PHẬT BẢO',
            pali: 'BUDDHAM SARANAM GACCHAMI',
            description: 'Nương tựa đấng Chánh Biến Tri, bậc Thầy vô song thắp sáng lộ trình giải thoát khỏi luân hồi.',
            details: 'Hiện thân của sự tịch tịnh và tuệ giác viên mãn.',
            icon: <LotusIcon className="w-10 h-10" color="currentColor" />,
            count: '001'
        },
        {
            title: 'PHÁP BẢO',
            pali: 'DHAMMAM SARANAM GACCHAMI',
            description: 'Nương tựa bậc Thầy vô hình, Chánh pháp nhiệm mầu tưới tẩm mầm sống tuệ giác trong tâm thức.',
            details: 'Giáo lý thiết thực hiện tiền, lìa xa mọi gốc rễ khổ đau.',
            icon: <DharmaWheelIcon className="w-10 h-10" color="currentColor" />,
            count: '002'
        },
        {
            title: 'TĂNG BẢO',
            pali: 'SANGHAM SARANAM GACCHAMI',
            description: 'Nương tựa bậc mô phạm thanh tịnh, những người con Phật đang tinh tấn trên lộ trình ly tham.',
            details: 'Ruộng thanh toán tối thắng của nhân loại.',
            icon: <PrayerBeadsIcon className="w-10 h-10" color="currentColor" />,
            count: '003'
        }
    ];

    return (
        <section className="py-24 md:py-48 bg-[#F8F5F2] relative overflow-hidden">
            {/* Cinematic Background */}
            <HeritageTexture variant="light" opacity={0.2} patternOpacity={0.08} />
            
            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                
                {/* Editorial Header */}
                <div className="text-center mb-24 md:mb-40">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="space-y-6"
                    >
                        <span className="inline-block text-[10px] font-black tracking-[0.6em] uppercase opacity-40">Traditional Manuscripts</span>
                        <h2 className="text-5xl md:text-8xl font-serif font-black text-stone-900 tracking-tighter leading-none">
                            KINH VĂN <br />
                            <span className="italic font-light" style={{ color: 'rgb(var(--theme-primary))' }}>LÁ BỐI</span>
                        </h2>
                        <div className="flex justify-center pt-8">
                            <div className="w-24 h-[1px]" style={{ backgroundColor: 'rgb(var(--theme-primary) / 0.3)' }} />
                            <div className="mx-4 w-2 h-2 rounded-full" style={{ backgroundColor: 'rgb(var(--theme-primary))' }} />
                            <div className="w-24 h-[1px]" style={{ backgroundColor: 'rgb(var(--theme-primary) / 0.3)' }} />
                        </div>
                    </motion.div>
                </div>

                {/* Stacking Scrolls Layout */}
                <div className="space-y-12 md:space-y-16 max-w-5xl mx-auto">
                    {scrolls.map((scroll, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: idx * 0.3 }}
                            className="relative group"
                        >
                            {/* The "Ola Leaf" Card */}
                            <div className="bg-[#FCFBF9] backdrop-blur-md border border-stone-200/50 shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all duration-1000 overflow-hidden relative">
                                
                                {/* Binding Holes (Traditional Aesthetic) */}
                                <div className="absolute left-[8%] top-1/2 -translate-y-1/2 flex flex-col gap-12 opacity-20 hidden md:flex">
                                    <div className="w-4 h-4 rounded-full border-2 border-stone-400" />
                                    <div className="w-4 h-4 rounded-full border-2 border-stone-400" />
                                </div>
                                <div className="absolute right-[8%] top-1/2 -translate-y-1/2 flex flex-col gap-12 opacity-20 hidden md:flex">
                                    <div className="w-4 h-4 rounded-full border-2 border-stone-400" />
                                    <div className="w-4 h-4 rounded-full border-2 border-stone-400" />
                                </div>

                                {/* Content Grid */}
                                <div className="py-12 md:py-20 px-8 md:px-24 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                                    
                                    {/* Column 1: Identity */}
                                    <div className="md:col-span-3 space-y-4">
                                        <div style={{ color: 'rgb(var(--theme-primary))' }} className="opacity-60 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700">
                                            {scroll.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-serif font-black text-stone-900 leading-tight">
                                                {scroll.title}
                                            </h3>
                                            <p className="text-[10px] font-black tracking-widest opacity-30 uppercase mt-1">Scroll No.{scroll.count}</p>
                                        </div>
                                    </div>

                                    {/* Column 2: Main Gospel */}
                                    <div className="md:col-span-6 space-y-6 md:border-x border-stone-100 px-0 md:px-12">
                                        <p className="text-sm font-serif font-black italic tracking-widest leading-relaxed" style={{ color: 'rgb(var(--theme-primary))' }}>
                                            {scroll.pali}
                                        </p>
                                        <p className="text-stone-500 text-lg font-serif italic leading-relaxed">
                                            "{scroll.description}"
                                        </p>
                                    </div>

                                    {/* Column 3: Action */}
                                    <div className="md:col-span-3 text-left md:text-right">
                                        <p className="text-xs text-stone-400 leading-relaxed italic mb-8 hidden md:block">
                                            {scroll.details}
                                        </p>
                                        <Link 
                                            href="/tam-bao"
                                            className="group/link inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] transition-all hover:translate-x-2"
                                            style={{ color: 'rgb(var(--theme-primary))' }}
                                        >
                                            {t('read_more')}
                                            <div className="w-8 h-[1px] bg-current opacity-40 group-hover/link:w-12 transition-all" />
                                        </Link>
                                    </div>
                                </div>

                                {/* Floating Ornament */}
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                                    <DharmaWheelIcon className="w-32 h-32 rotate-12" />
                                </div>
                            </div>

                            {/* Shadow under scroll */}
                            <div className="absolute -z-10 inset-0 translate-y-6 scale-[0.98] blur-2xl bg-stone-900/5 rounded-3xl" />
                        </motion.div>
                    ))}
                </div>

                {/* Vertical Context */}
                <div className="mt-32 text-center max-w-2xl mx-auto">
                    <p className="text-stone-400 text-sm font-serif italic leading-relaxed px-12 opacity-60">
                        Hệ thống kinh văn lá bối (Ola Leaves) là mạch nguồn nuôi dưỡng tâm linh tại các ngôi già lam Khmer, gìn giữ giáo pháp nguyên thủy của đức Phật qua hàng ngàn năm.
                    </p>
                </div>
            </div>
        </section>
    );
}


