'use client';
import React from 'react';
import { Link } from '@/i18n/routing';

export function ZenCTA({ modulesConfig }: { modulesConfig?: Record<string, boolean> }) {
    if (modulesConfig?.transactions === false) return null;
    return (
        <section className="py-24 px-6 text-center" style={{ backgroundColor: 'rgb(var(--theme-primary) / 0.05)' }}>
            <h2 className="text-2xl sm:text-3xl font-light mb-6" style={{ color: 'rgb(var(--theme-text))' }}>Gieo Mầm Chánh Pháp</h2>
            <p className="max-w-2xl mx-auto text-[15px] leading-relaxed mb-10 opacity-80" style={{ color: 'rgb(var(--theme-text))' }}>
                Sự thanh toán gieo hạt thanh toán thanh tịnh, trợ duyên cho Chánh Pháp trường tồn. Nguyện người gieo hạt được an vui trong hiện tại và nhiều đời.
            </p>
            <Link href="/transactions" className="inline-flex items-center justify-center px-10 py-4 text-[14px] font-semibold uppercase tracking-widest rounded-full transition-all hover:scale-105" style={{ backgroundColor: 'rgb(var(--theme-primary))', color: '#fff' }}>
                Đóng góp Trực Tuyến
            </Link>
        </section>
    );
}
