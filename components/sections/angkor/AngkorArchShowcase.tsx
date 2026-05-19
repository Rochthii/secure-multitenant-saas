'use client';
import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Bell } from 'lucide-react';
import { TenantIcon, LotusIcon, PrayerBeadsIcon } from '@/components/ui/khmer-icons';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];

const FALLBACK_ITEMS = [
    { icon: <TenantIcon className="w-6 h-6" />, title: 'Gopura Cổng Đền', desc: 'Kiến trúc cổng đền Khmer với tháp 5 tầng truyền thống', image: null, slug: null },
    { icon: <LotusIcon className="w-6 h-6" />, title: 'Ao Sen Thiêng', desc: 'Ao hoa sen biểu tượng thanh tịnh và giác ngộ', image: null, slug: null },
    { icon: <Bell className="w-6 h-6" />, title: 'Tháp Chuông', desc: 'Tháp chuông truyền thống rung lên lúc bình minh', image: null, slug: null },
    { icon: <PrayerBeadsIcon className="w-6 h-6" />, title: 'Tượng Phật Cổ', desc: 'Tượng Phật theo phong cách điêu khắc Khmer cổ điển', image: null, slug: null },
];

interface ShowcaseItem {
    title: string;
    desc: string;
    image: string | null;
    slug?: string | null;
}

interface AngkorArchShowcaseProps {
    aboutSections?: any[];
}

export function AngkorArchShowcase({ aboutSections = [] }: AngkorArchShowcaseProps) {
    // Smart Filtering Logic
    const smartSections = React.useMemo(() => {
        if (!aboutSections || aboutSections.length === 0) return [];

        // 1. Priority: Key starts with 'home/'
        const homeSections = aboutSections.filter(s => s.key.startsWith('home/'));
        if (homeSections.length > 0) return homeSections;

        // 2. Secondary: Root level (no /), has image_url, sorted by display_order
        return aboutSections
            .filter(s => !s.key.includes('/') && s.image_url)
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    }, [aboutSections]);

    const rawItems: ShowcaseItem[] = smartSections.length > 0
        ? smartSections.slice(0, 4).map((s: any) => ({
            title: s.title_vi || s.title || 'Giới Thiệu',
            desc: s.summary_vi || s.excerpt_vi || s.description_vi || '',
            image: s.image_url || s.thumbnail_url || null,
            slug: s.key,
        }))
        : FALLBACK_ITEMS;

    return (
        <section className="py-20 px-6 sm:px-10 lg:px-16" style={{ backgroundColor: '#FDFAF5' }}>
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="text-center mb-14">
                    <span
                        className="text-[10px] font-bold tracking-[0.5em] uppercase block mb-3"
                        style={{ color: '#D4A843' }}
                    >
                        Kiến Trúc & Di Sản
                    </span>
                    <h2
                        className="text-3xl sm:text-4xl font-black mb-4"
                        style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#1A0E06' }}
                    >
                        Linh Thiêng Ngàn Đời
                    </h2>
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-px w-10" style={{ backgroundColor: '#D4A843' }} />
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D4A843' }} />
                        <div className="h-px w-10" style={{ backgroundColor: '#D4A843' }} />
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {rawItems.map((item, i) => (
                        <div
                            key={i}
                            className="group text-center transition-all duration-300"
                        >
                            {/* Image */}
                            <div
                                className="relative aspect-[3/4] mb-4 overflow-hidden"
                                style={{
                                    border: '1px solid rgba(212,168,67,0.25)',
                                    boxShadow: '0 4px 20px rgba(26,14,6,0.08)',
                                }}
                            >
                                {item.image ? (
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div
                                        className="absolute inset-0 flex items-center justify-center text-5xl"
                                        style={{ backgroundColor: 'rgba(212,168,67,0.06)' }}
                                    >
                                        <TenantIcon className="w-16 h-16 text-[#D4A843] opacity-30" />
                                    </div>
                                )}

                                {/* Roman numeral overlay */}
                                <div
                                    className="absolute top-3 left-3 text-[12px] font-black"
                                    style={{
                                        color: 'rgb(212,168,67)',
                                        fontFamily: 'Georgia, serif',
                                        textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                                    }}
                                >
                                    {ROMAN[i] || i + 1}
                                </div>

                                {/* Gold corner bottom-right */}
                                <div
                                    className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none"
                                    style={{
                                        background: 'linear-gradient(225deg, rgba(212,168,67,0.5) 40%, transparent 40%)'
                                    }}
                                />

                                {/* Subtle tint - Static */}
                                <div className="absolute inset-0 bg-amber-900/[0.03]" />
                            </div>

                            {/* Caption */}
                            <h3
                                className="font-black text-[15px] mb-1.5 leading-snug"
                                style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#1A0E06' }}
                            >
                                {item.title}
                            </h3>
                            {item.desc && (
                                <p
                                    className="text-[12px] italic leading-relaxed line-clamp-2"
                                    style={{ color: 'rgba(40,20,8,0.5)' }}
                                >
                                    {item.desc}
                                </p>
                            )}
                            {item.slug && (
                                <Link
                                    href={`/gioi-thieu/${item.slug}`}
                                    className="mt-2 inline-block text-[10px] font-bold tracking-widest uppercase transition-all"
                                    style={{ color: '#D4A843' }}
                                >
                                    Chi tiết →
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
