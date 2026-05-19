'use client';

import React from 'react';
import { Link } from '@/i18n/routing';

// ─── Aesthetic: "SACRED PAGES" — simple 2×2 grid, light warm paper ────────────

const sections = [
    {
        id: 'noi-quy-tu-vien',
        href: '/gioi-thieu/noi-quy-tu-vien',
        khmer: 'វិន័យ\nវត្ត',
        number: 'I',
        title: 'Nội Quy Tự Viện',
        desc: 'Trang phục, cách đi đứng, thái độ khi gặp chư Tăng trong không gian thiêng liêng.',
        accent: '#B8860B',
        cardBg: '#FFFDF7',
        border: '#E8D5A0',
    },
    {
        id: 'nghi-le-co-ban',
        href: '/van-hoa/nghi-le-co-ban',
        khmer: 'ពិធីការ',
        number: 'II',
        title: 'Nghi Lễ Cơ Bản',
        desc: 'Cách thắp nhang, lễ Phật, dâng vật phẩm — từng bước cho người lần đầu.',
        accent: '#9E6B2F',
        cardBg: '#FDF9F3',
        border: '#DEC89A',
    },
    {
        id: 'ban-sac-khmer',
        href: '/van-hoa/ban-sac-khmer',
        khmer: 'អត្ត\nសញ្ញាណ',
        number: 'III',
        title: 'Bản Sắc Khmer',
        desc: 'Truyền thống, kiến trúc Naga, tiếng Pali và những lễ hội lớn của cộng đồng.',
        accent: '#A0732A',
        cardBg: '#FEFBF5',
        border: '#E5CC8A',
    },
    {
        id: 'nen-va-khong-nen',
        href: '/van-hoa/nen-va-khong-nen',
        khmer: 'គួរ\nមិនគួរ',
        number: 'IV',
        title: 'Nên & Không Nên',
        desc: 'Tổng hợp những điều nên làm và tránh khi đến chi nhánh, kèm lý do văn hoá rõ ràng.',
        accent: '#7A5C35',
        cardBg: '#FAF7F0',
        border: '#D4B880',
    },
];

export function CulturePreviewSectionAlt1({ isCompany }: { isCompany?: boolean }) {
    if (isCompany) return null;

    return (
        <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />

            <div className="container mx-auto px-4 max-w-6xl">

                {/* ── Header ── */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="flex-1 max-w-[80px] h-px bg-gradient-to-r from-transparent to-amber-300" />
                        <span className="text-[10px] font-bold tracking-[0.5em] uppercase text-amber-700/70">
                            Văn Hoá · Phật Giáo Nam Tông Khmer
                        </span>
                        <div className="flex-1 max-w-[80px] h-px bg-gradient-to-l from-transparent to-amber-300" />
                    </div>
                    <h2 className="font-serif text-4xl lg:text-5xl font-black text-stone-900 leading-tight mb-4">
                        Bốn Nẻo <span style={{ color: '#B8860B' }}>Văn Hoá</span>
                    </h2>
                    <p className="text-stone-500 max-w-md mx-auto text-base leading-relaxed">
                        Mỗi trang là một cánh cửa dẫn bạn sâu hơn vào di sản thiêng liêng của ngôi chi nhánh Khmer.
                    </p>
                </div>

                {/* ── 2×2 Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sections.map((s) => (
                        <Link
                            key={s.id}
                            href={s.href}
                            className="group relative rounded-2xl overflow-hidden transition-all duration-400 hover:-translate-y-1 hover:shadow-lg"
                            style={{ backgroundColor: s.cardBg, border: `1.5px solid ${s.border}` }}
                        >
                            {/* Number watermark */}
                            <div
                                className="absolute top-5 right-6 font-serif text-[52px] font-black leading-none select-none opacity-[0.07] group-hover:opacity-[0.12] transition-opacity"
                                style={{ color: s.accent }}
                            >
                                {s.number}
                            </div>

                            <div className="relative z-10 p-8">
                                {/* Khmer + Roman number row */}
                                <div className="flex items-start justify-between mb-5">
                                    <div
                                        className="font-serif text-base leading-tight whitespace-pre-line opacity-40 group-hover:opacity-60 transition-opacity"
                                        style={{ color: s.accent }}
                                    >
                                        {s.khmer}
                                    </div>
                                    {/* Small icon circle */}
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-serif font-black opacity-30 group-hover:opacity-60 transition-opacity"
                                        style={{ border: `1.5px solid ${s.accent}`, color: s.accent }}
                                    >
                                        {s.number}
                                    </div>
                                </div>

                                {/* Title */}
                                <h3
                                    className="font-serif text-xl lg:text-2xl font-black mb-2 leading-tight transition-colors duration-300"
                                    style={{ color: '#1C1917' }}
                                >
                                    {s.title}
                                </h3>

                                {/* Divider */}
                                <div className="h-px my-3 group-hover:opacity-60 transition-opacity" style={{ background: `${s.accent}30` }} />

                                {/* Description */}
                                <p className="text-stone-500 text-sm leading-relaxed mb-5">{s.desc}</p>

                                {/* CTA */}
                                <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase" style={{ color: s.accent }}>
                                    Tìm hiểu thêm
                                    <span className="inline-block w-5 h-px group-hover:w-10 transition-all duration-400 bg-current" />
                                    <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Bottom accent */}
                            <div
                                className="absolute bottom-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left"
                                style={{ background: s.accent }}
                            />
                        </Link>
                    ))}
                </div>

                {/* ── Bottom CTA ── */}
                <div className="flex items-center justify-center gap-5 mt-10">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-200 to-amber-200/50 max-w-[160px]" />
                    <Link
                        href="/van-hoa"
                        className="group flex items-center gap-2.5 px-5 py-2.5 rounded-full text-amber-700 text-xs font-bold tracking-widest uppercase hover:bg-amber-50 transition-colors border border-amber-200"
                    >
                        Khám phá toàn bộ văn hoá
                        <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent via-amber-200 to-amber-200/50 max-w-[160px]" />
                </div>
            </div>
        </section>
    );
}
