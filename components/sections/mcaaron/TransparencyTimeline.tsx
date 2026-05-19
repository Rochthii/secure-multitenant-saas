'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import { CheckCircle2, Circle, Clock, ExternalLink, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type BlockConfig } from '@/lib/types/layout-blocks';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { BRAND_NAME_VI } from '@/lib/constants';

interface TimelineItem {
    date: string;
    title: string;
    description: string;
    status: 'done' | 'in-progress' | 'planned';
    link?: string;
}

interface TransparencyTimelineProps {
    data?: BlockConfig;
}

export function TransparencyTimeline({ data }: TransparencyTimelineProps) {
    const content = data?.settings || {};

    const [mounted, setMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const entry = useIntersectionObserver(containerRef, {
        freezeOnceVisible: true,
        rootMargin: '200px',
    });
    const isVisible = !!entry?.isIntersecting;

    useEffect(() => {
        if (isVisible && !mounted) {
            setMounted(true);
        }
    }, [isVisible, mounted]);

    const sectionBadge = content.sectionBadge || 'Lộ Trình Minh Bạch';
    const sectionTitle = content.sectionTitle || 'Hành Trình Kiến Tạo Giá Trị.';
    const sectionDesc = content.sectionDesc || `Theo dõi các cột mốc quan trọng và cam kết của ${BRAND_NAME_VI} trong việc xây dựng hệ sinh thái số minh bạch cho cộng đồng.`;

    const items: TimelineItem[] = content.items || [
        {
            date: 'Tháng 1, 2024',
            title: `Khởi động Dự án ${BRAND_NAME_VI}`,
            description: 'Thiết lập đội ngũ nòng cốt và định hình tầm nhìn doanh nghiệp xã hội.',
            status: 'done',
        },
        {
            date: 'Quý 2, 2024',
            title: 'Ra mắt Cổng Minh Bạch v1.0',
            description: 'Triển khai hệ thống tra cứu giao dịch thời gian thực cho 10 đơn vị tiên phong.',
            status: 'in-progress',
        },
        {
            date: 'Năm 2025',
            title: 'Mở rộng Hệ sinh thái Toàn quốc',
            description: 'Kết nối hơn 100 tự viện và tổ chức xã hội trên nền tảng cross-aggregation.',
            status: 'planned',
        }
    ];

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
    };

    if (!mounted) {
        return <div ref={containerRef} className="py-24 min-h-[400px] flex items-center justify-center text-gray-400 animate-pulse">Đang tải lộ trình...</div>;
    }

    return (
        <section ref={containerRef} className="py-24 bg-white overflow-hidden">
            <div className="container px-4 mx-auto max-w-5xl">
                {/* Header */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4"
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        {sectionBadge}
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-black text-[#002B5B] mb-4"
                    >
                        {sectionTitle}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-gray-500 max-w-2xl mx-auto"
                    >
                        {sectionDesc}
                    </motion.p>
                </div>

                {/* Timeline Layout */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="relative"
                >
                    {/* Vertical Line */}
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-100 md:-ml-px" />

                    <div className="space-y-12">
                        {items.map((item, idx) => {
                            const isEven = idx % 2 === 0;
                            const statusColor =
                                item.status === 'done' ? 'text-green-500 bg-green-50' :
                                    item.status === 'in-progress' ? 'text-amber-500 bg-amber-50' :
                                        'text-gray-400 bg-gray-50';

                            const StatusIcon =
                                item.status === 'done' ? CheckCircle2 :
                                    item.status === 'in-progress' ? Clock :
                                        Circle;

                            return (
                                <motion.div key={idx} variants={itemVariants} className="relative flex items-center">
                                    {/* Content Wrapper */}
                                    <div className={cn(
                                        "flex flex-col md:flex-row w-full items-center",
                                        isEven ? "md:flex-row-reverse" : ""
                                    )}>
                                        {/* Spacer for MD screens to push content to one side */}
                                        <div className="hidden md:block w-1/2" />

                                        {/* Timeline Dot */}
                                        <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full border-4 border-white shadow-sm z-10 flex items-center justify-center md:-ml-4 bg-white">
                                            <StatusIcon className={cn("w-4 h-4", statusColor.split(' ')[0])} />
                                        </div>

                                        {/* Card */}
                                        <div className={cn(
                                            "w-full md:w-1/2 pl-12 md:pl-0",
                                            isEven ? "md:pr-12" : "md:pl-12"
                                        )}>
                                            <div className={cn(
                                                "p-6 rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:shadow-xl hover:border-blue-100 group",
                                                isEven ? "md:text-right md:items-end" : "md:text-left md:items-start",
                                                "flex flex-col"
                                            )}>
                                                <span className={cn("text-sm font-bold mb-1", statusColor.split(' ')[0])}>
                                                    {item.date}
                                                </span>
                                                <h3 className="text-xl font-bold text-[#002B5B] mb-2 group-hover:text-blue-600 transition-colors">
                                                    {item.title}
                                                </h3>
                                                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                                    {item.description}
                                                </p>

                                                {item.link && (
                                                    <a
                                                        href={item.link}
                                                        target={item.link.startsWith('http') ? '_blank' : undefined}
                                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:text-blue-600 tracking-wide uppercase transition-colors"
                                                    >
                                                        Xem chi tiết <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}

                                                <div className={cn(
                                                    "mt-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight",
                                                    statusColor
                                                )}>
                                                    {item.status === 'done' ? 'Đã hoàn thành' : item.status === 'in-progress' ? 'Đang thực hiện' : 'Kế hoạch'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default TransparencyTimeline;
