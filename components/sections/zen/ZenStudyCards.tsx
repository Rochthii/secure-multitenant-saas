'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/routing';
import { Book, Calendar, Edit3, HelpCircle, Leaf } from 'lucide-react';
import { LotusIcon, PrayerBeadsIcon } from '@/components/ui/khmer-icons';

/**
 * ZenStudyCards — "Con Đường Tu Học"
 * Style: Trang mục lục sách thiền định. Typography-first, font serif nhẹ, icon inline SVG lá bồ đề.
 * Số thứ tự La Mã, hover: slide màu xanh lá nhạt từ trái qua phải.
 * Data: Fetch categories thật từ DB (news categories + fallback tĩnh nếu empty).
 */

const FALLBACK_CARDS: StudyCard[] = [
    { title: 'Tạng Luật', desc: 'Vinaya Pitaka', href: '/tai-lieu-so', icon: <Leaf className="w-5 h-5" /> },
    { title: 'Tạng Kinh', desc: 'Sutta Pitaka', href: '/tai-lieu-so', icon: <LotusIcon className="w-5 h-5" /> },
    { title: 'Vi Diệu Pháp', desc: 'Abhidhamma Pitaka', href: '/tai-lieu-so', icon: <Book className="w-5 h-5" /> },
    { title: 'Lịch Thiền Thất', desc: 'Đăng ký tham gia tu thiền', href: '/lich-le', icon: <Calendar className="w-5 h-5" /> },
    { title: 'Đăng Ký Khóa Tu', desc: 'Khóa tu cuối tuần, an cư', href: '/dang-ky-su-kien', icon: <Edit3 className="w-5 h-5" /> },
    { title: 'Giải Đáp Phật Pháp', desc: 'Vấn đáp Chánh Pháp', href: '/hoi-dap', icon: <HelpCircle className="w-5 h-5" /> },
];

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

interface StudyCard {
    title: string;
    desc: string;
    href: string;
    icon?: React.ReactNode;
}

export function ZenStudyCards({ tenantId }: { tenantId?: string }) {
    const ref = useRef<HTMLElement>(null);
    const [cards, setCards] = useState<StudyCard[] | null>(null);
    const fetched = useRef(false);

    useEffect(() => {
        // Sử dụng IntersectionObserver — chỉ fetch khi section vào viewport
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !fetched.current) {
                    fetched.current = true;
                    observer.disconnect();

                    const cached = sessionStorage.getItem('cache_zen_study_v1');
                    if (cached) {
                        try {
                            const p = JSON.parse(cached);
                            if (Date.now() - p.fetchedAt < 600_000) {
                                setCards(p.cards);
                                return;
                            }
                        } catch { /* ignore */ }
                    }

                    fetch('/api/sections/categories')
                        .then(r => r.json())
                        .then(data => {
                            const cats = data.categories || [];
                            if (cats.length === 0) {
                                setCards(FALLBACK_CARDS);
                                return;
                            }
                            const mapped: StudyCard[] = cats.slice(0, 6).map((c: any) => ({
                                title: c.name_vi || c.name_en || 'Chuyên mục',
                                desc: c.description_vi || c.slug || '',
                                href: `/tin-tuc?category=${c.slug}`,
                                icon: <PrayerBeadsIcon className="w-5 h-5" />,
                            }));
                            setCards(mapped);
                            sessionStorage.setItem(
                                'cache_zen_study_v1',
                                JSON.stringify({ cards: mapped, fetchedAt: Date.now() })
                            );
                        })
                        .catch(() => setCards(FALLBACK_CARDS));
                }
            },
            { rootMargin: '300px' }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    if (cards === null) {
        // Skeleton trong khi chờ
        return (
            <section
                ref={ref}
                className="py-20 px-6 sm:px-10 lg:px-16"
                style={{ backgroundColor: 'rgb(var(--theme-surface))' }}
            >
                <div className="max-w-6xl mx-auto animate-pulse">
                    <div className="h-6 w-48 rounded mb-2" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.08)' }} />
                    <div className="h-4 w-32 rounded mb-16" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.05)' }} />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.06)' }} />
                                <div className="flex-1">
                                    <div className="h-4 rounded mb-2" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.06)' }} />
                                    <div className="h-3 w-2/3 rounded" style={{ backgroundColor: 'rgb(var(--theme-text) / 0.04)' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section
            ref={ref}
            className="py-20 px-6 sm:px-10 lg:px-16"
            style={{ backgroundColor: 'rgb(var(--theme-surface))' }}
        >
            <div className="max-w-6xl mx-auto">
                {/* Header — kiểu tiêu đề sách thiền định */}
                <div className="mb-16 border-b pb-6" style={{ borderColor: 'rgb(var(--theme-text) / 0.08)' }}>
                    <h2
                        className="text-2xl font-light tracking-wide mb-1"
                        style={{ color: 'rgb(var(--theme-text))', fontFamily: 'Georgia, serif' }}
                    >
                        Con Đường Tu Học
                    </h2>
                    <p
                        className="text-[12px] font-semibold uppercase tracking-[0.3em]"
                        style={{ color: 'rgb(var(--theme-primary))' }}
                    >
                        Pháp Học — Pháp Hành
                    </p>
                </div>

                {/* Cards — dạng mục lục sách */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
                    {cards.map((card, i) => (
                        <Link
                            key={i}
                            href={card.href as any}
                            className="group flex gap-5 items-start py-3 relative overflow-hidden rounded-xl px-2 transition-all duration-300"
                            style={{}}
                        >
                            {/* Hover: slide màu xanh lá bồ đề từ trái */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                                style={{ backgroundColor: 'rgb(var(--theme-primary) / 0.05)' }}
                            />

                            {/* Số thứ tự La Mã */}
                            <div
                                className="text-[11px] font-black tracking-wider pt-1 shrink-0 w-8 text-right"
                                style={{ color: 'rgb(var(--theme-primary) / 0.5)', fontFamily: 'Georgia, serif' }}
                            >
                                {ROMAN[i] || i + 1}
                            </div>

                            {/* Đường kẻ dọc separator */}
                            <div
                                className="w-px self-stretch shrink-0 mt-0.5"
                                style={{ backgroundColor: 'rgb(var(--theme-text) / 0.12)' }}
                            />

                            {/* Nội dung */}
                            <div className="flex-1 relative z-10">
                                <h3
                                    className="text-[16px] font-semibold mb-0.5 transition-colors duration-200 group-hover:underline underline-offset-4 decoration-1 flex items-center gap-2"
                                    style={{
                                        color: 'rgb(var(--theme-text))',
                                        fontFamily: 'Georgia, serif',
                                        textDecorationColor: 'rgb(var(--theme-primary) / 0.4)',
                                    }}
                                >
                                    {card.icon && <span className="text-gold-primary transition-transform group-hover:scale-110">{card.icon}</span>}
                                    {card.title}
                                </h3>
                                <p
                                    className="text-[12px] italic"
                                    style={{ color: 'rgb(var(--theme-text) / 0.5)' }}
                                >
                                    {card.desc}
                                </p>
                            </div>

                            {/* Arrow minimal */}
                            <div
                                className="opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5 text-[14px] pt-1 shrink-0"
                                style={{ color: 'rgb(var(--theme-primary))' }}
                            >
                                →
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Footer link */}
                <div className="mt-14 pt-6 border-t" style={{ borderColor: 'rgb(var(--theme-text) / 0.08)' }}>
                    <Link
                        href="/tin-tuc"
                        className="text-[12px] font-bold uppercase tracking-[0.25em] flex items-center gap-2 transition-opacity hover:opacity-70"
                        style={{ color: 'rgb(var(--theme-primary))' }}
                    >
                        <span>Xem tất cả chuyên mục</span>
                        <span>→</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
