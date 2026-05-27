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
    isCompany?: boolean;
}

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" }
    }
};

const getCategoryLabel = (key: string, isCompany: boolean) => {
    const cleanKey = key.toLowerCase();
    if (isCompany) {
        if (cleanKey.includes('history') || cleanKey.includes('lich-su')) return 'Hành Trình';
        if (cleanKey.includes('vision') || cleanKey.includes('tam-nhin')) return 'Tầm Nhìn & Sứ Mệnh';
        if (cleanKey.includes('value') || cleanKey.includes('gia-tri')) return 'Giá Trị Cốt Lõi';
        if (cleanKey.includes('culture') || cleanKey.includes('van-hoa')) return 'Văn Hóa Doanh Nghiệp';
        if (cleanKey.includes('activity') || cleanKey.includes('hoat-dong')) return 'Hoạt Động Cộng Đồng';
        if (cleanKey.includes('founder') || cleanKey.includes('sang-lap')) return 'Sáng Lập Viên';
        if (cleanKey.includes('leadership') || cleanKey.includes('lanh-dao') || cleanKey.includes('abbot') || cleanKey.includes('tru-tri')) return 'Ban Điều Hành';
        return 'Giới Thiệu';
    } else {
        if (cleanKey.includes('history') || cleanKey.includes('lich-su')) return 'Lịch Sử';
        if (cleanKey.includes('heritage') || cleanKey.includes('di-san')) return 'Di Sản';
        if (cleanKey.includes('architecture') || cleanKey.includes('kien-truc')) return 'Kiến Trúc';
        if (cleanKey.includes('culture') || cleanKey.includes('van-hoa')) return 'Văn Hóa';
        if (cleanKey.includes('activity') || cleanKey.includes('hoat-dong')) return 'Hoạt Động';
        if (cleanKey.includes('lineage') || cleanKey.includes('truyen-thua')) return 'Truyền Thừa';
        if (cleanKey.includes('founder') || cleanKey.includes('sang-lap')) return 'Sáng Lập';
        if (cleanKey.includes('abbot') || cleanKey.includes('tru-tri')) return 'Trụ Trì';
        return 'Giới thiệu';
    }
};

export default function SectionRenderer({ section, index, isCompany = false }: SectionRendererProps) {
    const isEven = index % 2 === 0;
    const [isHovered, setIsHovered] = React.useState(false);

    // Use summary if available, otherwise extract first paragraph or truncate content
    const excerpt = section.summary_vi ||
        (section.content_vi ? section.content_vi.replace(/<[^>]+>/g, '').substring(0, 300) + '...' : '');

    return (
        <section id={section.key} className={cn(
            "py-20 lg:py-32 scroll-mt-24 overflow-hidden relative",
            isCompany
                ? (isEven ? "bg-white" : "bg-slate-50/60 border-y border-slate-100")
                : (isEven ? "bg-white" : "bg-[#FAF8F5]") // Ivory/Stone variation
        )}>
            {/* Elegant spinning tech fishbone/chevron background decoration (active for corporate) */}
            {isCompany && (
                <div 
                    className={cn(
                        "absolute w-[450px] h-[450px] opacity-[0.07] pointer-events-none -z-10 animate-[spin_50s_linear_infinite] select-none transition-all duration-700",
                        isEven ? "-right-32 -top-32" : "-left-32 -top-32"
                    )} 
                    style={{ color: 'rgb(var(--theme-primary))' }}
                >
                    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full">
                        {/* Tech Rings */}
                        <circle cx="100" cy="100" r="95" strokeDasharray="4,6" />
                        <circle cx="100" cy="100" r="75" />
                        <circle cx="100" cy="100" r="55" strokeDasharray="8,4" />
                        {/* Symmetrical Chevrons (Tech Fishbone Spine) */}
                        <path d="M100,30 L120,45 L115,50 L100,38 L85,50 L80,45 Z" fill="currentColor" />
                        <path d="M100,55 L120,70 L115,75 L100,63 L85,75 L80,70 Z" fill="currentColor" />
                        <path d="M100,80 L120,95 L115,100 L100,88 L85,100 L80,95 Z" fill="currentColor" />
                        <path d="M100,105 L120,120 L115,125 L100,113 L85,125 L80,120 Z" fill="currentColor" />
                        <path d="M100,130 L120,145 L115,150 L100,138 L85,150 L80,145 Z" fill="currentColor" />
                        {/* Center Spine axis */}
                        <line x1="100" y1="20" x2="100" y2="180" strokeDasharray="3,3" />
                        <line x1="20" y1="100" x2="180" y2="100" strokeDasharray="3,3" />
                        {/* Small Tech Crosshairs & markings */}
                        <circle cx="100" cy="100" r="3" fill="currentColor" />
                        <circle cx="100" cy="30" r="2" fill="currentColor" />
                        <circle cx="100" cy="170" r="2" fill="currentColor" />
                        <circle cx="30" cy="100" r="2" fill="currentColor" />
                        <circle cx="170" cy="100" r="2" fill="currentColor" />
                    </svg>
                </div>
            )}

            {/* Traditional background pattern for spiritual sites */}
            {!isCompany && !isEven && (
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
                            <span 
                                className={cn("h-1 w-12 transition-all duration-300", !isCompany && "bg-gold-primary")}
                                style={isCompany ? { backgroundColor: 'rgb(var(--theme-primary))' } : undefined}
                            />
                            <span 
                                className={cn("font-bold uppercase tracking-widest text-sm transition-all duration-300", !isCompany && "text-gold-primary")}
                                style={isCompany ? { color: 'rgb(var(--theme-primary))' } : undefined}
                            >
                                {getCategoryLabel(section.key, isCompany)}
                            </span>
                        </div>

                        <h2 className={cn(
                            "leading-tight mb-8 transition-all duration-300",
                            isCompany 
                                ? "text-4xl lg:text-5xl font-sans font-extrabold text-slate-900 tracking-tight" 
                                : "text-4xl lg:text-6xl font-playfair font-bold text-coffee-dark tracking-wide"
                        )}>
                            {section.title_vi}
                        </h2>

                        {/* Premium Drop Cap effect for the first letter */}
                        <div className={cn(
                            "prose prose-lg mb-10 leading-[1.8] line-clamp-5 relative z-10 transition-all duration-300",
                            isCompany ? "font-sans text-slate-600" : "text-gray-600"
                        )}>
                            {excerpt && (
                                <>
                                    <span 
                                        className={cn(
                                            "float-left text-6xl lg:text-7xl font-bold leading-[0.8] pr-3 pt-2 transition-all duration-300",
                                            isCompany ? "font-sans font-black" : "font-playfair font-bold text-gold-primary"
                                        )}
                                        style={isCompany ? { color: 'rgb(var(--theme-primary))' } : undefined}
                                    >
                                        {excerpt.charAt(0)}
                                    </span>
                                    <span>{excerpt.substring(1)}</span>
                                </>
                            )}
                        </div>

                        {isCompany ? (
                            <Link
                                href={`/gioi-thieu/${section.key}`}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                className="inline-flex items-center justify-center px-8 py-3.5 border font-sans font-bold tracking-[0.15em] uppercase text-xs transition-all duration-500 rounded-xl group relative overflow-hidden"
                                style={{
                                    borderColor: isHovered ? 'rgb(var(--theme-primary))' : 'rgba(var(--theme-primary), 0.3)',
                                    color: isHovered ? '#fff' : 'rgb(var(--theme-primary))',
                                    backgroundColor: isHovered ? 'rgb(var(--theme-primary))' : 'transparent',
                                    boxShadow: isHovered ? '0 10px 25px -5px rgba(var(--theme-primary), 0.3)' : 'none',
                                }}
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    Khám Phá
                                    <span 
                                        className="w-8 h-[1px] transition-all duration-500"
                                        style={{ backgroundColor: isHovered ? '#fff' : 'rgb(var(--theme-primary))' }}
                                    />
                                </span>
                            </Link>
                        ) : (
                            <Link
                                href={`/gioi-thieu/${section.key}`}
                                className="inline-flex items-center justify-center px-8 py-3.5 border border-gold-primary/30 text-coffee-dark font-medium tracking-[0.15em] uppercase text-sm hover:bg-gold-primary hover:text-white hover:border-gold-primary transition-all duration-500 rounded-sm group relative overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    Khám Phá
                                    <span className="w-8 h-[1px] bg-gold-primary group-hover:bg-white transition-colors duration-500"></span>
                                </span>
                            </Link>
                        )}
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
                            <div 
                                className={cn(
                                    "absolute inset-0 border rounded-2xl transition-transform duration-700 group-hover:-translate-x-4 group-hover:translate-y-4",
                                    !isCompany && "border-gold-primary/30"
                                )}
                                style={isCompany ? { borderColor: 'rgba(var(--theme-primary), 0.3)' } : undefined}
                            ></div>

                            {/* Main Image Container */}
                            <div className={cn(
                                "absolute inset-0 rounded-2xl overflow-hidden shadow-2xl transition-colors duration-300",
                                isCompany ? "bg-slate-900" : "bg-coffee-dark"
                            )}>
                                {section.image_url ? (
                                    <Image
                                        src={section.image_url}
                                        alt={section.title_vi}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                                        sizes="(max-width: 1024px) 100vw, 40vw"
                                    />
                                ) : (
                                    <div className={cn(
                                        "w-full h-full flex flex-col items-center justify-center transition-all duration-300",
                                        isCompany 
                                            ? "text-slate-500 bg-slate-800" 
                                            : "text-gold-primary/40 bg-coffee-light"
                                    )}>
                                        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className={isCompany ? "font-sans text-xs uppercase tracking-widest font-bold text-slate-400" : "font-playfair italic"}>
                                            {isCompany ? 'Hình ảnh đang cập nhật' : 'Hình ảnh đang cập nhật'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Sub-categories indicator overlay */}
                            {section.hasChildren && (
                                isCompany ? (
                                    <div className="absolute -bottom-4 right-2 sm:-bottom-6 sm:-right-6 lg:-right-10 bg-slate-950/90 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col items-start gap-1 border border-white/10 backdrop-blur-md z-20 group-hover:-translate-y-2 transition-transform duration-500 max-w-[90%]">
                                        <div className="flex items-center gap-2 mb-1">
                                            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'rgb(var(--theme-primary))' }}>
                                                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h7v2H4z" />
                                            </svg>
                                            <span className="text-[10px] sm:text-xs font-sans font-bold uppercase tracking-widest" style={{ color: 'rgb(var(--theme-primary-light))' }}>Mục Lục</span>
                                        </div>
                                        <span className="font-sans font-semibold text-base sm:text-lg line-clamp-1">{section.title_vi}</span>
                                    </div>
                                ) : (
                                    <div className="absolute -bottom-4 right-2 sm:-bottom-6 sm:-right-6 lg:-right-10 bg-white text-coffee-dark px-4 py-3 sm:px-6 sm:py-4 rounded-xl shadow-2xl flex flex-col items-start gap-1 border border-gold-primary/10 z-20 group-hover:-translate-y-2 transition-transform duration-500 max-w-[90%]">
                                        <div className="flex items-center gap-2 mb-1">
                                            <svg className="w-4 h-4 text-gold-primary shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h7v2H4z" />
                                            </svg>
                                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gold-primary">Mục lục</span>
                                        </div>
                                        <span className="font-playfair font-semibold text-base sm:text-lg line-clamp-1">{section.title_vi}</span>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Decorative background glow */}
                        <div 
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full blur-3xl -z-10"
                            style={{ 
                                backgroundColor: isCompany ? 'rgba(var(--theme-primary), 0.06)' : 'rgba(197, 160, 89, 0.05)' 
                            }}
                        ></div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
