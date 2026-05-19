'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReadMoreSectionProps {
    summary: string;
    fullContentHtml: string;
    ctaLabel?: string;
    collapseLabel?: string;
}

/**
 * ReadMoreSection — UX "Xem thêm" accordion cho các phần nội dung dài.
 *
 * Mặc định hiển thị `summary` (2-3 câu plain-text).
 * Khi bấm nút, mở rộng để hiển thị `fullContentHtml` bằng animation mượt mà.
 */
export default function ReadMoreSection({
    summary,
    fullContentHtml,
    ctaLabel = 'Tìm hiểu thêm',
    collapseLabel = 'Thu gọn',
}: ReadMoreSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const expandedRef = useRef<HTMLDivElement>(null);

    // Scroll nhẹ vào phần mở rộng khi expand
    useEffect(() => {
        if (isExpanded && expandedRef.current) {
            setTimeout(() => {
                expandedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 200);
        }
    }, [isExpanded]);

    return (
        <div className="mt-6">
            {/* Summary — luôn hiển thị */}
            <p className="text-gray-600 leading-relaxed text-lg mb-5">{summary}</p>

            {/* Expanded content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        ref={expandedRef}
                        key="expanded"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="overflow-hidden"
                    >
                        <div
                            className="
                                prose prose-lg text-gray-600 mt-4
                                prose-headings:font-playfair prose-headings:text-coffee-dark prose-headings:font-bold
                                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:border-b prose-h3:border-gold-primary/20 prose-h3:pb-2
                                prose-p:leading-relaxed prose-p:mb-4
                                prose-li:marker:text-gold-primary prose-li:mb-1
                                prose-strong:text-coffee-dark prose-strong:font-semibold
                                prose-blockquote:border-l-4 prose-blockquote:border-gold-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-500
                                max-w-none
                            "
                            dangerouslySetInnerHTML={{ __html: fullContentHtml }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle button */}
            <button
                onClick={() => setIsExpanded(prev => !prev)}
                className="
                    mt-4 inline-flex items-center gap-2 group
                    text-gold-primary font-bold uppercase tracking-widest text-sm
                    hover:text-coffee-dark transition-colors duration-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary focus-visible:ring-offset-2 rounded
                "
                aria-expanded={isExpanded}
            >
                <span>{isExpanded ? collapseLabel : ctaLabel}</span>
                <motion.span
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="inline-block"
                >
                    ↓
                </motion.span>
            </button>
        </div>
    );
}
