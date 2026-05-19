'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion, type Variants } from 'framer-motion';
import { Link } from '@/i18n/routing';

interface AboutSection {
    id: string;
    key: string;
    title_vi: string;
    content_vi: string;
    summary_vi?: string;
    image_url?: string;
    images?: string[];
    display_order: number;
    hasChildren?: boolean;
}

interface SectionRendererProps {
    section: AboutSection;
    index: number;
}

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" }
    }
};

export default function SectionRenderer({ section, index }: SectionRendererProps) {
    const isEven = index % 2 === 0;

    // Use summary if available, otherwise extract first paragraph or truncate content
    const excerpt = section.summary_vi ||
        (section.content_vi ? section.content_vi.replace(/<[^>]+>/g, '').substring(0, 300) + '...' : '');

    return (
        <section id={section.key} className={cn(
            "py-20 lg:py-32 scroll-mt-24 overflow-hidden relative",
            isEven ? "bg-white" : "bg-[#FAF8F5]" // Ivory/Stone variation
        )}>
            {/* Extremely subtle background pattern for depth */}
            {!isEven && (
                <div className="absolute inset-0 opacity-[0.015] bg-[url('/images/pattern-border.png')] pointer-events-none mix-blend-multiply bg-repeat" style={{ backgroundSize: '200px' }}></div>
            )}

            <div className="container mx-auto px-4 relative z-10">
                <div
                    className={cn(
                        "grid lg:grid-cols-12 gap-12 lg:gap-20 items-center max-w-7xl mx-auto",
                        !isEven && "lg:grid-flow-dense"
                    )}
                >
                    {/* Content Column (60%) */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        className={cn(
                            "lg:col-span-7",
                            !isEven && "lg:col-start-6"
                        )}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <span className="h-1 w-12 bg-gold-primary"></span>
                            <span className="text-gold-primary font-bold uppercase tracking-widest text-sm">
                                {(() => {
                                    const key = section.key.toLowerCase();
                                    if (key.includes('history') || key.includes('lich-su')) return 'Lịch Sử';
                                    if (key.includes('heritage') || key.includes('di-san')) return 'Di Sản';
                                    if (key.includes('architecture') || key.includes('kien-truc')) return 'Kiến Trúc';
                                    if (key.includes('culture') || key.includes('van-hoa')) return 'Văn Hóa';
                                    if (key.includes('activity') || key.includes('hoat-dong')) return 'Hoạt Động';
                                    if (key.includes('lineage') || key.includes('truyen-thua')) return 'Truyền Thừa';
                                    if (key.includes('founder') || key.includes('sang-lap')) return 'Sáng Lập';
                                    if (key.includes('abbot') || key.includes('tru-tri')) return 'Trụ Trì';

                                    return 'Giới thiệu';
                                })()}
                            </span>
                        </div>

                        <h2 className="text-4xl lg:text-6xl font-playfair font-bold text-coffee-dark leading-tight mb-8 tracking-wide">
                            {section.title_vi}
                        </h2>

                        {/* Premium Drop Cap effect for the first letter */}
                        <div className="prose prose-lg text-gray-600 mb-10 leading-[1.8] line-clamp-4 relative z-10">
                            {excerpt && (
                                <>
                                    <span className="float-left text-6xl lg:text-7xl font-playfair font-bold text-gold-primary leading-[0.8] pr-3 pt-2">
                                        {excerpt.charAt(0)}
                                    </span>
                                    <span>{excerpt.substring(1)}</span>
                                </>
                            )}
                        </div>

                        <Link
                            href={`/gioi-thieu/${section.key}`}
                            className="inline-flex items-center justify-center px-8 py-3.5 border border-gold-primary/30 text-coffee-dark font-medium tracking-[0.15em] uppercase text-sm hover:bg-gold-primary hover:text-white hover:border-gold-primary transition-all duration-500 rounded-sm group relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                Khám Phá
                                <span className="w-8 h-[1px] bg-gold-primary group-hover:bg-white transition-colors duration-500"></span>
                            </span>
                        </Link>
                    </motion.div>

                    {/* Image Column (40%) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn(
                            "relative grid place-items-center lg:col-span-5",
                            !isEven && "lg:col-start-1 lg:row-start-1"
                        )}
                    >
                        {/* Premium Double Frame */}
                        <div className="relative w-full aspect-[3/4] max-w-md mx-auto group z-10">
                            {/* Inner border frame that offsets on hover */}
                            <div className="absolute inset-0 border border-gold-primary/30 rounded-2xl transition-transform duration-700 group-hover:-translate-x-4 group-hover:translate-y-4"></div>

                            {/* Main Image Container */}
                            <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl bg-coffee-dark">
                                {section.image_url ? (
                                    <Image
                                        src={section.image_url}
                                        alt={section.title_vi}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                                        sizes="(max-width: 1024px) 100vw, 40vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gold-primary/40 bg-coffee-light">
                                        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="font-playfair italic">Hình ảnh đang cập nhật</span>
                                    </div>
                                )}
                            </div>

                            {/* Sub-categories indicator overlay */}
                            {section.hasChildren && (
                                <div className="absolute -bottom-4 right-2 sm:-bottom-6 sm:-right-6 lg:-right-10 bg-white text-coffee-dark px-4 py-3 sm:px-6 sm:py-4 rounded-xl shadow-2xl flex flex-col items-start gap-1 border border-gold-primary/10 z-20 group-hover:-translate-y-2 transition-transform duration-500 max-w-[90%]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <svg className="w-4 h-4 text-gold-primary shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h7v2H4z" />
                                        </svg>
                                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gold-primary">Mục lục</span>
                                    </div>
                                    <span className="font-playfair font-semibold text-base sm:text-lg line-clamp-1">{section.title_vi}</span>
                                </div>
                            )}
                        </div>

                        {/* Decorative background glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gold-primary/5 rounded-full blur-3xl -z-10"></div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
