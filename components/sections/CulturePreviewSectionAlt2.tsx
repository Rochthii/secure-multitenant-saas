'use client';

import React from 'react';
import { Link } from '@/i18n/routing';

// ─── Aesthetic Direction: "MASONRY SKYLINE" ───────────────────────────────────
// 4 vertical columns of unequal height — like tenant spires rising.
// Each column is full-width on mobile, narrow on desktop.
// Clean white card below a "header bar" with color coding.
// Hover: column "rises" with a Y-translate, revealing the full description.
// ─────────────────────────────────────────────────────────────────────────────

const sections = [
    {
        id: 'noi-quy-tu-vien',
        href: '/gioi-thieu/noi-quy-tu-vien',
        index: 1,
        khmer: 'វត្ត',
        label: '01',
        category: 'QUY TẮC',
        title: 'Nội Quy Tự Viện',
        tagline: 'Hướng dẫn cư xử trang nghiêm khi đến chi nhánh',
        desc: 'Trang phục kín đáo, giữ yên lặng, chắp tay khi gặp chư Tăng. Những điều nhỏ thể hiện tấm lòng lớn.',
        heightCls: 'min-h-[280px] lg:min-h-[420px]',
        accent: '#B8860B',
        cardBg: '#FFFDF7',
        borderColor: '#E8D5A0',
    },
    {
        id: 'nghi-le-co-ban',
        href: '/van-hoa/nghi-le-co-ban',
        index: 2,
        khmer: 'ពិធី',
        label: '02',
        category: 'NGHI LỄ',
        title: 'Nghi Lễ Cơ Bản',
        tagline: 'Cho người lần đầu bước vào chi nhánh',
        desc: 'Thắp 3 cây nhang, lạy 3 lạy, dâng hoa và tịnh thủy. Mỗi cử chỉ là lời nguyện tâm thành.',
        heightCls: 'min-h-[280px] lg:min-h-[520px]',
        accent: '#9E6B2F',
        cardBg: '#FDF9F3',
        borderColor: '#DEC89A',
    },
    {
        id: 'ban-sac-khmer',
        href: '/van-hoa/ban-sac-khmer',
        index: 3,
        khmer: 'ខ្មែរ',
        label: '03',
        category: 'BẢN SẮC',
        title: 'Bản Sắc Khmer',
        tagline: 'Di sản ngàn năm còn mãi',
        desc: 'Theravada, Naga, tiếng Pali, lễ Chôl Chnăm — nền tảng văn hoá của người Khmer Nam Bộ.',
        heightCls: 'min-h-[280px] lg:min-h-[460px]',
        accent: '#A0732A',
        cardBg: '#FEFBF5',
        borderColor: '#E5CC8A',
    },
    {
        id: 'nen-va-khong-nen',
        href: '/van-hoa/nen-va-khong-nen',
        index: 4,
        khmer: 'ល្អ',
        label: '04',
        category: 'THỰC HÀNH',
        title: 'Nên & Không Nên',
        tagline: 'Hướng dẫn nhanh, dễ nhớ',
        desc: 'Tổng hợp gọn gàng để bạn tự tin khi đến chi nhánh, không lo phạm phải điều gì không hay.',
        heightCls: 'min-h-[280px] lg:min-h-[380px]',
        accent: '#7A5C35',
        cardBg: '#FAF7F0',
        borderColor: '#D4B880',
    },
];

export function CulturePreviewSectionAlt2({ isCompany }: { isCompany?: boolean }) {
    if (isCompany) return null;

    return (
        <section className="py-24 lg:py-32 bg-[#faf8f4] relative overflow-hidden">

            {/* Thin horizontal rule top */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-700/20 to-transparent" />

            <div className="container mx-auto px-4 max-w-7xl">

                {/* ── Section Header ── */}
                <div className="grid lg:grid-cols-12 gap-8 mb-16 items-end">
                    <div className="lg:col-span-8">
                        <div className="flex items-baseline gap-5 mb-6 flex-wrap">
                            <span className="font-serif text-[11px] tracking-[0.55em] text-amber-700/50 uppercase">
                                Văn Hoá
                            </span>
                            <div className="h-px w-10 bg-amber-700/30" />
                            <span className="font-serif text-[11px] tracking-[0.4em] text-stone-400 uppercase">
                                4 chủ đề
                            </span>
                        </div>
                        <h2 className="font-serif text-5xl lg:text-[4.5rem] font-black text-stone-900 leading-[0.88] tracking-tight">
                            Bốn<br />
                            Trụ Cột<br />
                            <span className="text-amber-700">Văn Hoá</span>
                        </h2>
                    </div>
                    <div className="lg:col-span-4">
                        <p className="text-stone-500 text-sm leading-relaxed lg:text-base">
                            Phật giáo Nam Tông Khmer là một hệ thống văn hoá phong phú, từ nghi lễ hàng ngày đến lễ hội mang tầm quốc gia, đều ẩn chứa triết lý sâu xa.
                        </p>
                        <Link
                            href="/van-hoa"
                            className="group inline-flex items-center gap-2 mt-5 text-amber-700 text-sm font-bold hover:gap-4 transition-all duration-300"
                        >
                            Xem tổng quan
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* ── Masonry Columns ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 items-end">
                    {sections.map((s) => (
                        <Link
                            key={s.id}
                            href={s.href}
                            className={`group relative flex flex-col overflow-hidden rounded-2xl ${s.heightCls} cursor-pointer hover:-translate-y-2 transition-all duration-400 ease-out hover:shadow-lg`}
                            style={{ backgroundColor: s.cardBg, border: `1.5px solid ${s.borderColor}` }}
                        >
                            {/* Index watermark */}
                            <div
                                className="absolute bottom-3 right-5 font-serif text-[72px] font-black leading-none select-none opacity-[0.06] group-hover:opacity-[0.1] transition-opacity duration-500"
                                style={{ color: s.accent }}
                            >
                                {s.index}
                            </div>

                            {/* Content block */}
                            <div className="relative z-10 flex flex-col h-full p-6 justify-between">
                                {/* Top meta */}
                                <div className="flex items-center justify-between">
                                    <span
                                        className="text-[9px] font-bold tracking-[0.35em] uppercase px-2.5 py-1 rounded-full"
                                        style={{ color: s.accent, background: `${s.accent}18`, border: `1px solid ${s.accent}30` }}
                                    >
                                        {s.category}
                                    </span>
                                    <span
                                        className="font-serif text-sm font-black opacity-20 group-hover:opacity-40 transition-opacity"
                                        style={{ color: s.accent }}
                                    >
                                        {s.khmer}
                                    </span>
                                </div>

                                {/* Bottom content */}
                                <div>
                                    {/* Desc reveals on hover */}
                                    <p
                                        className="text-stone-500 text-[12px] leading-relaxed mb-4 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 line-clamp-3"
                                    >
                                        {s.desc}
                                    </p>

                                    <h3
                                        className="font-serif text-lg lg:text-xl font-black leading-snug mb-2 transition-colors duration-300"
                                        style={{ color: '#1C1917' }}
                                    >
                                        {s.title}
                                    </h3>
                                    <p className="text-stone-400 text-[11px] leading-snug mb-5">
                                        {s.tagline}
                                    </p>

                                    {/* Arrow */}
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="inline-block h-px w-6 group-hover:w-10 transition-all duration-400"
                                            style={{ background: s.accent }}
                                        />
                                        <svg
                                            className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300"
                                            style={{ color: s.accent }}
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom accent line */}
                            <div
                                className="absolute bottom-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left rounded-b-2xl"
                                style={{ background: s.accent }}
                            />
                        </Link>
                    ))}
                </div>

                {/* ── Bottom rule ── */}
                <div className="mt-10 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
            </div>

            {/* Bottom fade rule */}
            <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-700/10 to-transparent" />
        </section>
    );
}
