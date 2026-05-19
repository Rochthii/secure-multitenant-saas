'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { HeritageTexture } from '@/components/ui/HeritageTexture';
import { DharmaWheelIcon, LotusIcon, PrayerBeadsIcon } from '@/components/ui/khmer-icons';

/**
 * TripleGemSectionAlt1 - "Sacred Triptych Portfolio"
 * High-end editorial layout for the Triple Gem (Buddha, Dhamma, Sangha).
 */
export function TripleGemSectionAlt1() {
    const t = useTranslations('common');

    const gems = [
        {
            title: 'PHẬT BẢO',
            pali: 'Buddha Ratana',
            icon: <LotusIcon className="w-12 h-12" color="currentColor" />,
            description: 'Bậc Đạo Sư tối thượng, đấng Chánh Biến Tri đã tự mình giác ngộ chân lý tuyệt đối. Ngài là hiện thân của Trí tuệ viên mãn và Lòng từ bi vô lượng, thắp sáng ngọn đuốc soi đường cho nhân thiên thoát khỏi vô minh.'
        },
        {
            title: 'PHÁP BẢO',
            pali: 'Dhamma Ratana',
            icon: <DharmaWheelIcon className="w-12 h-12" color="currentColor" />,
            description: 'Hệ thống giáo lý giải thoát thực thiết hiện tiền, không có thời gian, đến để mà thấy. Pháp là dòng sữa ngọt lành nuôi dưỡng tuệ giác, dẫn dắt hành giả lìa xa khổ đau, chứng đạt an lạc niết bàn.'
        },
        {
            title: 'TĂNG BẢO',
            pali: 'Sangha Ratana',
            icon: <PrayerBeadsIcon className="w-12 h-12" color="currentColor" />,
            description: 'Đoàn thể thánh chúng thanh tịnh, những bậc thừa hành giáo pháp của đức Thế Tôn. Tăng già là ruộng phước tối thắng, là mạng mạch gìn giữ và truyền thừa ánh sáng tỉnh thức giữa thế gian.'
        }
    ];

    return (
        <section className="py-24 md:py-48 bg-[#FDFCFB] relative overflow-hidden">
            {/* Cinematic Background */}
            <HeritageTexture variant="light" opacity={0.15} patternOpacity={0.06} />
            
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                
                {/* Header Section */}
                <div className="text-center max-w-4xl mx-auto mb-24 md:mb-36">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                    >
                        <span className="block font-serif italic text-xl md:text-2xl mb-6 tracking-widest" style={{ color: 'rgb(var(--theme-primary))' }}>
                            Con về nương tựa
                        </span>
                        <h2 className="text-5xl sm:text-6xl md:text-8xl font-serif font-black text-stone-900 tracking-tight leading-none mb-10 pb-4">
                            TAM BẢO <span className="italic font-light">LINH THIÊNG</span>
                        </h2>
                        <div className="flex flex-col items-center">
                            <div className="h-20 w-[1px] mb-10" style={{ backgroundColor: 'rgb(var(--theme-primary) / 0.3)' }} />
                            <p className="text-stone-500 font-serif italic text-xl md:text-2xl leading-relaxed px-8 max-w-3xl opacity-80">
                                "Nương tựa Phật, nương tựa Pháp, nương tựa Tăng — ba ngôi báu là điểm tựa duy nhất đưa lữ khách vượt khỏi bể luân hồi."
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Triple Layout - Refined Triptych */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-y border-stone-200">
                    {gems.map((gem, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: idx * 0.3 }}
                            className="flex flex-col items-center text-center py-16 md:py-24 px-8 md:px-16 relative group border-stone-200 md:border-r last:border-r-0"
                        >
                            {/* Hover Backdrop Glow */}
                            <div className="absolute inset-0 bg-stone-50 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
                            
                            <motion.div 
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 200 }}
                                className="mb-10 transition-colors duration-700"
                            >
                                <div style={{ color: 'rgb(var(--theme-primary) / 0.6)' }} className="group-hover:text-amber-600 transition-colors">
                                    {gem.icon}
                                </div>
                            </motion.div>

                            <h3 className="text-3xl md:text-4xl font-serif font-black text-stone-900 mb-2 tracking-tight group-hover:translate-y-[-4px] transition-transform duration-700">
                                {gem.title}
                            </h3>
                            
                            <p className="text-[11px] font-black uppercase tracking-[0.4em] mb-10 pb-4 inline-block opacity-60" style={{ color: 'rgb(var(--theme-primary))' }}>
                                {gem.pali}
                            </p>
                            
                            <p className="text-stone-500 font-serif leading-[2.1] text-lg mb-12 flex-1 font-light italic">
                                {gem.description}
                            </p>

                            <div className="relative overflow-hidden group/btn">
                                <Link 
                                    href="/tam-bao"
                                    className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 transition-all duration-500"
                                >
                                    {t('read_more')}
                                </Link>
                                <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-gold-dark group-hover/btn:w-full transition-all duration-500" style={{ backgroundColor: 'rgb(var(--theme-primary))' }} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Vertical Decorative Elements */}
                <div className="absolute top-0 right-10 bottom-0 w-[1px] bg-stone-100 hidden lg:block" />
                <div className="absolute top-0 left-10 bottom-0 w-[1px] bg-stone-100 hidden lg:block" />
            </div>
        </section>
    );
}

