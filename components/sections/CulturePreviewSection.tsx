'use client';

import React from 'react';
import { Link } from '@/i18n/routing';

// ─── Aesthetic: "BENTO EDITORIAL" — light warm parchment ─────────────────────

const cultureSections = [
    {
        id: 'noi-quy-tu-vien',
        href: '/gioi-thieu/noi-quy-tu-vien',
        khmer: 'វិន័យវត្ត',
        label: 'Nội Quy',
        title: 'Nội Quy Tự Viện',
        tagline: 'Quy tắc ứng xử nơi thiêng liêng',
        desc: 'Trang phục kín đáo, bước chân khẽ nhẹ — đó là cách bạn chào đón sự thiêng liêng.',
        number: '01',
        accent: '#B8860B',
        cardBg: '#FFFDF7',
        border: '#E8D5A0',
    },
    {
        id: 'nghi-le-co-ban',
        href: '/van-hoa/nghi-le-co-ban',
        khmer: 'ពិធីបុណ្យ',
        label: 'Nghi Lễ',
        title: 'Nghi Lễ Cơ Bản',
        tagline: 'Dành cho người lần đầu đến chi nhánh',
        desc: 'Ba cây nhang, ba lạy — tâm thành là đủ để trời Phật chứng giám.',
        number: '02',
        accent: '#9E6B2F',
        cardBg: '#FDF9F3',
        border: '#DEC89A',
    },
    {
        id: 'ban-sac-khmer',
        href: '/van-hoa/ban-sac-khmer',
        khmer: 'អត្តសញ្ញាណ',
        label: 'Bản Sắc',
        title: 'Bản Sắc Khmer',
        tagline: 'Di sản Phật giáo Nam Tông',
        desc: 'Chi nhánh Khmer không chỉ là nơi thờ Phật — đó là linh hồn của cả một cộng đồng.',
        number: '03',
        accent: '#A0732A',
        cardBg: '#FEFBF5',
        border: '#E5CC8A',
    },
    {
        id: 'nen-va-khong-nen',
        href: '/van-hoa/nen-va-khong-nen',
        khmer: 'គប្បី / មិនគប្បី',
        label: 'Nên & Không',
        title: 'Nên & Không Nên',
        tagline: 'Hướng dẫn nhanh, dễ nhớ',
        desc: 'Hiểu để tôn trọng. Biết để trân quý. Đến chi nhánh là hành trình của tâm.',
        number: '04',
        accent: '#7A5C35',
        cardBg: '#FAF7F0',
        border: '#D4B880',
    },
];

export function CulturePreviewSection({ isCompany }: { isCompany?: boolean }) {
    if (isCompany) return null;

    const [feat, ...rest] = cultureSections;

    return (
        <section className="py-20 lg:py-28 bg-[#FAF7F2] relative overflow-hidden">
            {/* Subtle top rule */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />

            <div className="container mx-auto px-4 max-w-6xl">

                {/* ── Header ── */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <span className="block w-8 h-px bg-amber-600" />
                            <span className="text-amber-700 text-[10px] font-bold tracking-[0.45em] uppercase">
                                វប្បធម៌ · Văn Hoá Khmer
                            </span>
                        </div>
                        <h2 className="font-serif text-4xl lg:text-5xl font-black text-stone-900 leading-[0.92]">
                            Đến Chi nhánh<br />
                            <span style={{ color: '#B8860B' }}>Đúng Cách</span>
                        </h2>
                    </div>
                    <p className="text-stone-500 max-w-xs text-sm leading-relaxed">
                        Bốn trụ cột giúp bạn khám phá và cảm nhận trọn vẹn vẻ đẹp văn hoá Phật giáo Nam Tông Khmer.
                    </p>
                </div>

                {/* ── BENTO GRID: 1 featured tall + 3 horizontal ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">

                    {/* Featured card — spans 5 cols, 2 rows */}
                    <Link
                        href={feat.href}
                        className="group lg:col-span-5 lg:row-span-3 relative rounded-2xl overflow-hidden min-h-[380px] lg:min-h-0 cursor-pointer flex flex-col justify-end hover:shadow-xl hover:shadow-amber-200/60 transition-all duration-400 hover:-translate-y-1"
                        style={{ backgroundColor: feat.cardBg, border: `1.5px solid ${feat.border}` }}
                    >
                        {/* Number watermark */}
                        <div
                            className="absolute top-5 right-6 font-serif text-[80px] font-black leading-none select-none opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500"
                            style={{ color: feat.accent }}
                        >
                            {feat.number}
                        </div>

                        {/* Content */}
                        <div className="relative z-10 p-8 lg:p-10">
                            <span
                                className="font-serif text-sm tracking-[0.25em] mb-3 block opacity-50 group-hover:opacity-70 transition-opacity"
                                style={{ color: feat.accent }}
                            >
                                {feat.khmer}
                            </span>
                            <span
                                className="text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-5 inline-block"
                                style={{ color: feat.accent, background: `${feat.accent}15`, border: `1px solid ${feat.accent}30` }}
                            >
                                {feat.label}
                            </span>
                            <h3
                                className="font-serif text-2xl lg:text-3xl font-black mb-3 leading-tight transition-colors duration-300"
                                style={{ color: '#1C1917' }}
                            >
                                {feat.title}
                            </h3>
                            <p className="text-stone-500 text-sm mb-5 leading-relaxed">{feat.tagline}</p>
                            {/* Quote on hover */}
                            <p className="text-stone-400 text-xs italic leading-relaxed mb-5 max-h-0 group-hover:max-h-20 overflow-hidden transition-all duration-500">
                                {feat.desc}
                            </p>
                            <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase" style={{ color: feat.accent }}>
                                Khám phá
                                <span className="inline-block w-6 h-px group-hover:w-12 transition-all duration-400 bg-current" />
                                <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Bottom accent */}
                        <div
                            className="absolute bottom-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left"
                            style={{ background: feat.accent }}
                        />
                    </Link>

                    {/* 3 horizontal cards */}
                    {rest.map((s) => (
                        <Link
                            key={s.id}
                            href={s.href}
                            className="group lg:col-span-7 relative rounded-2xl overflow-hidden min-h-[110px] cursor-pointer flex items-center hover:shadow-md hover:shadow-amber-100/80 transition-all duration-300 hover:-translate-y-0.5"
                            style={{ backgroundColor: s.cardBg, border: `1.5px solid ${s.border}` }}
                        >
                            {/* Number */}
                            <div
                                className="absolute right-5 top-1/2 -translate-y-1/2 font-serif text-[52px] font-black leading-none select-none opacity-[0.06] group-hover:opacity-[0.1] transition-opacity"
                                style={{ color: s.accent }}
                            >
                                {s.number}
                            </div>

                            <div className="relative z-10 px-7 py-6 w-full flex items-center justify-between gap-6">
                                <div className="flex-1 min-w-0">
                                    <span
                                        className="text-[10px] font-bold tracking-widest uppercase mb-1.5 block opacity-60"
                                        style={{ color: s.accent }}
                                    >
                                        {s.khmer}
                                    </span>
                                    <h3
                                        className="font-serif text-lg lg:text-xl font-black leading-snug mb-1 truncate"
                                        style={{ color: '#1C1917' }}
                                    >
                                        {s.title}
                                    </h3>
                                    <p className="text-stone-400 text-xs leading-relaxed line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        {s.tagline}
                                    </p>
                                </div>
                                <div className="shrink-0 flex items-center gap-1.5" style={{ color: s.accent }}>
                                    <span className="inline-block w-5 h-px group-hover:w-8 transition-all duration-300 bg-current" />
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>

                            <div
                                className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                                style={{ background: s.accent }}
                            />
                        </Link>
                    ))}
                </div>

                {/* ── Footer CTA ── */}
                <div className="mt-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-stone-400 text-[10px] tracking-[0.4em] font-mono uppercase">4 chương</span>
                        <div className="h-px w-12 bg-stone-200" />
                        <span className="text-stone-400 text-[10px] tracking-[0.4em] font-mono uppercase hidden sm:block">Hành trình tâm linh</span>
                    </div>
                    <Link
                        href="/van-hoa"
                        className="group flex items-center gap-2 text-amber-700 hover:text-amber-800 transition-colors text-sm font-serif italic"
                    >
                        Xem tất cả văn hoá
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
