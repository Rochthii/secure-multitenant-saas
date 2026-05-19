'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import Image from 'next/image';

// ─── Data ─────────────────────────────────────────────────────────────────────

const cultureSections = [
    {
        id: 'nghi-le-co-ban',
        num: '01',
        title: 'Nghi Lễ Cơ Bản',
        subtitle: 'Cho người mới đến',
        description: 'Cách thắp nhang, lễ Phật, dâng hoa và nước. Từng bước để bạn cảm thấy tự tin và thanh tịnh.',
        href: '/van-hoa/nghi-le-co-ban',
        khmer: 'ពិធីបុណ្យ',
        accent: '#C8860A',
    },
    {
        id: 'ban-sac-khmer',
        num: '02',
        title: 'Bản Sắc Khmer',
        subtitle: 'Di sản ngàn năm',
        description: 'Kiến trúc Naga, tiếng Pali, và những lễ hội lớn — linh hồn của cộng đồng Phật giáo Nam Tông.',
        href: '/van-hoa/ban-sac-khmer',
        khmer: 'អត្តសញ្ញាណ',
        accent: '#9E6B2F',
    },
    {
        id: 'nen-va-khong-nen',
        num: '03',
        title: 'Nên & Không Nên',
        subtitle: 'Hướng dẫn nhanh',
        description: 'Những điều nên làm và tránh khi đến chi nhánh, giúp bạn hành xử đúng mực và tôn kính.',
        href: '/van-hoa/nen-va-khong-nen',
        khmer: 'គួរ / មិនគួរ',
        accent: '#7A5C35',
    },
    {
        id: 'noi-quy-tu-vien',
        num: '04',
        title: 'Nội Quy Tự Viện',
        subtitle: 'Cư xử trang nghiêm',
        description: 'Trang phục, cách đi đứng, thái độ khi gặp chư Tăng. Những điều nhỏ thể hiện tấm lòng tôn kính.',
        href: '/gioi-thieu/noi-quy-tu-vien',
        khmer: 'វិន័យវត្ត',
        accent: '#B8860B',
    },
];

const fadeUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
};

export default function CulturePage() {
    return (
        <div className="min-h-screen bg-[#FAF7F2] overflow-x-hidden">

            {/* ── 1. HERO ── */}
            <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-4">
                <div className="max-w-5xl mx-auto">
                    {/* Eyebrow */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center gap-3 mb-8"
                    >
                        <span className="block w-10 h-px bg-amber-600" />
                        <span className="text-amber-700 text-[11px] font-bold tracking-[0.4em] uppercase">
                            វប្បធម៌ · Văn Hoá Khmer
                        </span>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-12 items-end">
                        {/* Heading */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                        >
                            <h1 className="font-serif text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem] font-black text-stone-900 leading-[0.9] tracking-tight mb-6">
                                Di&nbsp;Sản<br />
                                <span style={{ color: '#B8860B' }}>Tâm&nbsp;Linh</span>
                            </h1>
                            <p className="text-stone-500 text-base md:text-lg leading-relaxed max-w-md">
                                Khám phá chiều sâu văn hoá Phật giáo Nam Tông Khmer — từ nghi lễ thường nhật
                                đến những lễ hội ngàn năm còn mãi với thời gian.
                            </p>
                        </motion.div>

                        {/* Pull-quote */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, delay: 0.25 }}
                            className="border-l-2 border-amber-500 pl-6 text-stone-600 italic font-serif text-lg md:text-xl leading-relaxed"
                        >
                            <p>&quot;Tâm an, vạn sự an. Di sản văn hoá là báu vật nằm ở chính lòng tôn kính của chúng ta.&quot;</p>
                            <cite className="block text-xs not-italic text-amber-700 uppercase tracking-widest mt-4 font-sans font-bold">
                                — Triết lý Phật giáo Nam Tông
                            </cite>
                        </motion.div>
                    </div>

                    {/* Hero image strip */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.35 }}
                        className="mt-14 rounded-[1.5rem] overflow-hidden relative h-[40vh] md:h-[52vh] shadow-lg"
                    >
                        <Image
                            src="/images/culture/tenant-exterior.png"
                            alt="Kiến trúc chi nhánh Khmer"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        {/* Subtle warm tint — NOT dark */}
                        <div className="absolute inset-0 bg-amber-950/15" />
                        {/* Bottom text badge */}
                        <div className="absolute bottom-5 left-5 bg-white/80 backdrop-blur-md rounded-xl px-4 py-2.5">
                            <p className="text-[11px] text-stone-500 uppercase tracking-widest font-bold">Văn hoá & Di sản</p>
                            <p className="text-stone-800 text-sm font-serif font-semibold">Phật Giáo Nam Tông Khmer</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── 2. INTRO SPLIT ── */}
            <section className="py-16 md:py-24 px-4 bg-white">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
                    {/* Text */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <span className="text-amber-600 text-[10px] font-bold tracking-[0.5em] uppercase mb-5 block">
                            Lời ngỏ
                        </span>
                        <h2 className="font-serif text-3xl md:text-4xl font-black text-stone-900 mb-6 leading-snug">
                            Ngôi Chi nhánh — Trái Tim Của Cộng Đồng
                        </h2>
                        <div className="space-y-4 text-stone-600 leading-relaxed">
                            <p>
                                Ngôi chi nhánh Khmer (Wat) không chỉ là nơi thờ Phật, mà còn là trái tim của cộng đồng.
                                Là nơi dạy chữ, rèn người, và là bảo tàng sống về nghệ thuật kiến trúc đặc sắc.
                            </p>
                            <p>
                                Mỗi nét vẽ, mỗi pho tượng, hay cách chúng ta chắp tay chào chư Tăng đều ẩn chứa
                                triết lý của lòng từ bi và trí tuệ. Hiểu được văn hoá là bước đầu tiên để chạm vào
                                linh hồn của di sản.
                            </p>
                        </div>
                        {/* Pali quote */}
                        <div className="mt-8 p-5 bg-amber-50 rounded-2xl border border-amber-100">
                            <p className="font-serif italic text-stone-700 text-base">
                                "Namo Tassa Bhagavato Arahato Sammāsambuddhassa"
                            </p>
                            <p className="text-[11px] text-amber-700 uppercase tracking-widest mt-2 font-sans font-bold">
                                Con đem hết lòng thành kính lễ bái Đức Thế Tôn
                            </p>
                        </div>
                    </motion.div>

                    {/* Image */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="relative"
                    >
                        <div className="rounded-[1.75rem] overflow-hidden aspect-[3/4] shadow-xl">
                            <Image
                                src="/images/culture/monk-meditation.png"
                                alt="Thiền định"
                                fill
                                className="object-cover"
                            />
                            {/* Very light warm overlay */}
                            <div className="absolute inset-0 bg-amber-900/8" />
                        </div>
                        {/* Floating accent */}
                        <div
                            className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-15 pointer-events-none"
                            style={{ background: 'radial-gradient(circle, #D4A017 0%, transparent 70%)' }}
                        />
                    </motion.div>
                </div>
            </section>

            {/* ── 3. NAVIGATION CARDS (4 pillars) ── */}
            <section className="py-16 md:py-24 px-4 bg-[#FAF7F2]">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
                    >
                        <div>
                            <h2 className="font-serif text-3xl md:text-4xl font-black text-stone-900">
                                Khám Phá Bản Sắc
                            </h2>
                            <p className="text-stone-500 text-sm mt-2 tracking-wide">
                                Bốn trụ cột của văn hoá Nam Tông Khmer
                            </p>
                        </div>
                        <div className="w-20 h-px bg-amber-400 shrink-0 hidden sm:block" />
                    </motion.div>

                    {/* Cards grid */}
                    <div className="grid sm:grid-cols-2 gap-5">
                        {cultureSections.map((section, i) => (
                            <motion.div
                                key={section.id}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.08 }}
                            >
                                <Link
                                    href={section.href}
                                    className="group block bg-white rounded-[1.5rem] p-7 border border-stone-100 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-100/60 transition-all duration-300 relative overflow-hidden"
                                >
                                    {/* Number */}
                                    <span
                                        className="text-[4rem] font-serif font-black leading-none select-none absolute top-4 right-6 transition-opacity duration-300 opacity-[0.06] group-hover:opacity-[0.12]"
                                        style={{ color: section.accent }}
                                    >
                                        {section.num}
                                    </span>

                                    <div className="relative z-10">
                                        {/* Khmer label */}
                                        <span
                                            className="text-[11px] font-bold tracking-widest uppercase block mb-3"
                                            style={{ color: section.accent }}
                                        >
                                            {section.khmer} · {section.subtitle}
                                        </span>

                                        <h3 className="font-serif text-2xl font-black text-stone-900 mb-3 group-hover:text-amber-800 transition-colors">
                                            {section.title}
                                        </h3>

                                        <p className="text-stone-500 text-sm leading-relaxed mb-6">
                                            {section.description}
                                        </p>

                                        {/* CTA arrow */}
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: section.accent }}>
                                            Tìm hiểu
                                            <span className="inline-block w-6 h-px bg-current group-hover:w-10 transition-all duration-300" />
                                            <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Bottom accent line */}
                                    <div
                                        className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                                        style={{ background: section.accent }}
                                    />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 4. FESTIVAL BANNER — Light version ── */}
            <section className="py-16 md:py-24 px-4 bg-white">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Image — now LIGHT framed */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="rounded-[1.75rem] overflow-hidden relative aspect-[4/3] shadow-lg"
                        >
                            <Image
                                src="/images/culture/festival.png"
                                alt="Lễ hội Khmer"
                                fill
                                className="object-cover"
                            />
                            {/* Very light overlay — keep photo vivid */}
                            <div className="absolute inset-0 bg-amber-900/10" />
                        </motion.div>

                        {/* Text */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                        >
                            <span className="text-amber-600 text-[10px] font-bold tracking-[0.5em] uppercase mb-5 block">
                                Nhịp sống lễ hội
                            </span>
                            <h2 className="font-serif text-3xl md:text-4xl font-black text-stone-900 mb-6 leading-snug">
                                Từ Chôl Chnăm Đến Ok Om Bok
                            </h2>
                            <p className="text-stone-600 leading-relaxed mb-8">
                                Từ Chôl Chnăm Thmay rực rỡ sắc màu múa Chhay-yam, đến lễ Sen Dolta hiếu thảo và 
                                Ok Om Bok thờ mặt Trăng. Mỗi kỳ lễ là một lời tri ân, một khoảnh khắc gắn kết 
                                giữa con người, thiên nhiên và tâm thức Phật giáo.
                            </p>
                            <Link
                                href="/van-hoa/ban-sac-khmer#le-hoi"
                                className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full text-sm font-bold uppercase tracking-widest bg-amber-700 text-white hover:bg-amber-800 transition-colors shadow-md hover:shadow-lg group"
                            >
                                Xem lịch lễ hội
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── 5. CLOSING STRIP ── */}
            <section className="py-12 px-4 border-t border-stone-100 bg-[#FAF7F2]">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
                    <p className="font-serif italic text-stone-400 text-base max-w-md text-center sm:text-left">
                        "Namo Tassa Bhagavato Arahato Sammāsambuddhassa"
                    </p>
                    <Link
                        href="/lich-le"
                        className="text-xs text-amber-700 font-bold uppercase tracking-widest border border-amber-300 rounded-full px-6 py-2.5 hover:bg-amber-50 transition-colors"
                    >
                        Xem Lịch Lễ →
                    </Link>
                </div>
            </section>

        </div>
    );
}
