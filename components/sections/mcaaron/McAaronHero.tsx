'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Globe, ArrowRight, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { type BlockConfig } from '@/lib/types/layout-blocks';
import { Link } from '@/i18n/routing';
import { BRAND_NAME_VI } from '@/lib/constants';

interface McAaronHeroProps {
    data?: BlockConfig;
}

export function McAaronHero({ data }: McAaronHeroProps) {
    const t = useTranslations('mcaaron');
    const content = data?.settings || {};

    const badgeText = content.badge || 'Doanh Nghiệp Xã Hội';
    const titleHtml = content.title || 'Kiến Tạo Giá Trị <br /> <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#00D2FF] to-[#FFD700]">Cộng Đồng Bền Vững</span>';
    const descriptionText = content.description || `${BRAND_NAME_VI} là doanh nghiệp xã hội công nghệ tiên phong, cung cấp nền tảng quản trị mạng lưới toàn diện, minh bạch và an toàn.`;
    const primaryButtonText = content.primaryButton || 'Khám Phá Hệ Sinh Thái';
    const secondaryButtonText = content.secondaryButton || `Về ${BRAND_NAME_VI}`;
    const primaryLink = content.primaryLink || '#';
    const secondaryLink = content.secondaryLink || '#';
    const backgroundImage = content.backgroundImage || '';
    const overlayOpacity = parseFloat(content.overlayOpacity || '0.7');

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } }
    };

    return (
        <section className="relative min-h-[60vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0A0F1A]">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                {/* Image Background (if provided) */}
                {backgroundImage ? (
                    <div className="absolute inset-0">
                        <Image
                            src={backgroundImage}
                            alt="Background"
                            fill
                            className="object-cover object-center md:object-center"
                            priority
                            sizes="100vw"
                            quality={85}
                        />
                        <div
                            className="absolute inset-0 bg-[#0A0F1A]"
                            style={{ opacity: overlayOpacity }}
                        />
                    </div>
                ) : (
                    <>
                        {/* Dark Base Gradient fallback */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#001530] via-[#0A0F1A] to-[#050B14]" />

                        {/* Glowing Orbs */}
                        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[#00D2FF]/20 blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#002B5B]/40 blur-[150px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
                    </>
                )}

                {/* Minimal Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            <div className="container relative z-10 px-4 mx-auto max-w-7xl py-12 md:py-0">
                <div className="flex flex-col items-center text-center">

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
                    >
                        <ShieldCheck className="w-4 h-4 text-[#FFD700]" />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/90">{badgeText}</span>
                    </motion.div>

                    {/* Main Headline */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="max-w-4xl mx-auto mb-6 md:mb-8"
                    >
                        <motion.h1
                            variants={itemVariants}
                            className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[1.2] md:leading-[1.1] mb-6 sm:mb-8 break-words select-none"
                            dangerouslySetInnerHTML={{ __html: titleHtml }}
                        />

                        <motion.p
                            variants={itemVariants}
                            className="text-base md:text-xl text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto"
                        >
                            {descriptionText}
                        </motion.p>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
                    >
                        <Link href={primaryLink}>
                            <button className="group relative px-8 py-4 bg-white text-[#0A0F1A] font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 w-full sm:w-auto">
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                {primaryButtonText}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>
                        </Link>

                        <Link href={secondaryLink}>
                            <button className="group px-8 py-4 bg-transparent text-white font-bold rounded-full border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all w-full sm:w-auto flex items-center justify-center gap-2">
                                <Globe className="w-4 h-4 text-[#FFD700]" />
                                {secondaryButtonText}
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#F8F9FA] to-transparent z-10" />
        </section>
    );
}

export default McAaronHero;
