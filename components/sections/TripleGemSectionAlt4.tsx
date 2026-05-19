'use client';

import React from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { HeritageTexture } from '@/components/ui/HeritageTexture';
import { DharmaWheelIcon, LotusIcon, PrayerBeadsIcon } from '@/components/ui/khmer-icons';

const SECTIONS = [
    {
        title: 'PHẬT BẢO',
        subtitle: 'THE ENLIGHTENED ONE',
        pali: 'BUDDHAM',
        bg: 'bg-[#0F0D0C]',
        accent: 'rgb(var(--theme-primary))',
        image: 'https://images.unsplash.com/photo-1542361329-8472496f863b?q=80&w=2000&auto=format&fit=crop',
        description: 'Đức Thế Tôn — bậc Chánh Đẳng Chánh Giác — đã bóc trần vô minh, khai mở con đường Trí tuệ và Từ bi cho chúng sinh thoát khỏi nẻo tối.',
        icon: <LotusIcon className="w-24 h-24" color="currentColor" />
    },
    {
        title: 'PHÁP BẢO',
        subtitle: 'THE ETERNAL TRUTH',
        pali: 'DHAMMAM',
        bg: 'bg-[#1A1614]',
        accent: '#F59E0B',
        image: 'https://images.unsplash.com/photo-1590059530432-843e9803f260?q=80&w=2000&auto=format&fit=crop',
        description: 'Chánh pháp nhiệm mầu — thiết thực hiện tiền, đến để mà thấy — chữa lành ưu phiền, dẫn hành giả về an lạc.',
        icon: <DharmaWheelIcon className="w-24 h-24" color="currentColor" />
    },
    {
        title: 'TĂNG BẢO',
        subtitle: 'THE SACRED ASSEMBLY',
        pali: 'SANGHAM',
        bg: 'bg-[#141210]',
        accent: '#B45309',
        image: 'https://images.unsplash.com/photo-1594149022634-11867168da40?q=80&w=2000&auto=format&fit=crop',
        description: 'Tăng-già thanh tịnh — ruộng phước tối thắng — gìn giữ và truyền thừa Chánh pháp, hộ trì hành giả trên lộ trình tỉnh thức.',
        icon: <PrayerBeadsIcon className="w-24 h-24" color="currentColor" />
    }
];

/**
 * TripleGemSectionAlt4 - "Cinematic Sticky Immersion"
 * A high-impact, vertically scrolling editorial journey.
 */
export function TripleGemSectionAlt4() {
    const t = useTranslations('common');
    const containerRef = React.useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end']
    });
    
    const activeIndex = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [0, 1, 2, 2]);
    const [current, setCurrent] = React.useState(0);
    useMotionValueEvent(activeIndex, 'change', (v) => setCurrent(Math.round(v)));

    return (
        <section ref={containerRef} className="relative bg-black">
            {SECTIONS.map((item, idx) => (
                <div key={idx} className={`min-h-screen sticky top-0 flex items-center justify-center overflow-hidden transition-colors duration-1000 ${item.bg}`}>
                    
                    {/* Heritage Layer */}
                    <HeritageTexture variant="dark" opacity={0.2} patternOpacity={0.05} />
                    
                    <div className="absolute inset-0 z-0 scale-110">
                        <motion.img
                            initial={{ scale: 1.2, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 0.15 }}
                            transition={{ duration: 2 }}
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover grayscale brightness-50 contrast-125"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black" />
                    </div>

                    <div className="container mx-auto px-6 relative z-10">
                        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
                            
                            {/* Animated Icon Anchor */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1.5, type: "spring" }}
                                className="mb-12"
                                style={{ color: item.accent }}
                            >
                                <div className="p-8 rounded-full border border-white/5 bg-white/5 backdrop-blur-3xl">
                                    {item.icon}
                                </div>
                            </motion.div>

                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-[10px] font-black uppercase tracking-[0.6em] text-stone-500 mb-6"
                            >
                                {item.subtitle}
                            </motion.span>

                            <motion.h2
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 1 }}
                                className="text-7xl sm:text-9xl md:text-[12rem] font-serif font-black text-white leading-none tracking-tighter mb-12 drop-shadow-2xl"
                            >
                                {item.title}
                            </motion.h2>

                            <motion.div
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                transition={{ delay: 0.6, duration: 1.5 }}
                                className="h-[1px] w-64 mb-12 opacity-30"
                                style={{ backgroundColor: item.accent }}
                            />

                            <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: 0.8, duration: 1.2 }}
                                className="text-xl sm:text-2xl md:text-3xl text-stone-300 max-w-3xl font-serif italic font-light leading-relaxed mb-16 px-6"
                            >
                                "{item.description}"
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                            >
                                <Link
                                    href="/tam-bao"
                                    className="group relative h-20 px-12 border border-white/20 text-white rounded-full flex items-center transition-all hover:bg-white hover:text-black overflow-hidden"
                                >
                                    <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.5em]">{t('read_more')}</span>
                                    <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500" />
                                </Link>
                            </motion.div>

                            {/* Watermark Pali */}
                            <div className="absolute -right-10 top-1/2 -rotate-90 pointer-events-none opacity-[0.02] mix-blend-overlay hidden lg:block">
                                <span className="text-[25rem] font-black text-white">{item.pali}</span>
                            </div>
                        </div>
                    </div>

                    {/* Left Side Metadata */}
                    <div className="absolute left-12 bottom-12 hidden md:block">
                        <div className="flex items-center gap-6">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Section</span>
                            <span className="text-2xl font-serif font-black text-white/40 italic">0{idx + 1}</span>
                        </div>
                    </div>

                    {/* Right Dot Navigation */}
                    <div className="absolute right-8 md:right-12 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
                        {SECTIONS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    const target = containerRef.current?.children[i] as HTMLElement;
                                    target?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className={`w-1 transition-all duration-700 ${current === i ? 'h-16' : 'h-6 bg-white/10'}`}
                                style={{ backgroundColor: current === i ? item.accent : undefined }}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </section>
    );
}

