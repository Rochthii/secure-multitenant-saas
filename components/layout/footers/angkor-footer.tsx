'use client';
import { getVietnamTime } from '@/lib/utils/date';

import React from 'react';
import dynamic from 'next/dynamic';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

// Dynamic import — defer analytics polling from critical path
const VisitorCounter = dynamic(
    () => import('@/components/analytics/VisitorCounter').then(m => ({ default: m.VisitorCounter })),
    { ssr: false }
);

import { DEFAULT_SITE_NAME } from '@/lib/constants';
import { TenantLogo } from '@/components/layout/tenant-logo';

export function AngkorFooter({ settings = {}, domain, isCompany }: { settings?: Record<string, string>, domain?: string,
    isCompany?: boolean }) {
    const t = useTranslations('common');
    const tNav = useTranslations('navigation');
    const currentYear = getVietnamTime().getFullYear();
    const [email, setEmail] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [message, setMessage] = React.useState('');

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        setMessage('');

        try {
            const locale = document.documentElement.lang || 'vi';
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, locale }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Đăng ký thành công! Cảm ơn bạn đã quan tâm.');
                setEmail('');
            } else {
                setMessage(data.error || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
            }
        } catch (error) {
            setMessage('Không thể kết nối máy chủ. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <footer className="relative bg-[#2A2118] text-[#F4F1EA] border-t-[6px] border-[#8B7355] overflow-hidden" style={{ backgroundColor: 'var(--theme-footer-bg, #2A2118)' }}>
            {/* ── Background Pattern (Stone Texture) ── */}
            <div
                className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* ── Newsletter strip ── */}
            <div className="border-b border-[#8B7355]/30 bg-[#4A3C31]/40 relative z-10 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left flex-shrink-0">
                            <h3 className="text-[15px] font-bold text-[#F4F1EA] tracking-[0.2em] uppercase" style={{ fontFamily: 'Georgia, serif' }}>
                                Đăng ký nhận tin tức
                            </h3>
                            <p className="text-sm text-[#D5CDBD] mt-2">
                                Cập nhật các sự kiện & pháp thoại mới nhất.
                            </p>
                        </div>
                        <form onSubmit={handleNewsletterSubmit} className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Địa chỉ email..."
                                required
                                disabled={isSubmitting}
                                className="px-4 py-2.5 min-h-[44px] w-full sm:w-80 bg-black/20 border border-[#8B7355] rounded-none text-[#F4F1EA] placeholder:text-[#8B7355]/70 focus:outline-none focus:ring-1 focus:ring-[#D5CDBD] focus:border-[#D5CDBD] transition-all disabled:opacity-50 text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-8 min-h-[44px] bg-[#8B7355] hover:bg-[#A68A6AE] text-white text-sm font-bold tracking-widest rounded-none transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap uppercase shadow-md border border-[#A68A6A]/50"
                            >
                                {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
                            </button>
                        </form>
                    </div>
                    {message && (
                        <p className={`mt-3 text-sm text-center md:text-right font-medium tracking-wide ${message.includes('thành công') ? 'text-[#D5CDBD]' : 'text-red-400'}`}>
                            {message}
                        </p>
                    )}
                </div>
            </div>

            {/* ── Main content ── */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">

                    {/* 1. About & Logo */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-4 mb-8">
                            <TenantLogo 
                                src={settings['site_logo']} 
                                alt={settings['site_name_vi']} 
                                size="lg" 
                                variant="adaptive" 
                                className="bg-[#F4F1EA] border-2 border-[#8B7355] shadow-md"
                            />
                            <div>
                                <h3 className="text-2xl font-black text-[#F4F1EA] leading-tight tracking-wide drop-shadow-md" style={{ fontFamily: 'Georgia, serif' }}>
                                    {settings['site_name_vi'] || DEFAULT_SITE_NAME}
                                </h3>
                                <span className="text-[11px] text-[#D5CDBD] font-bold tracking-[0.25em] uppercase drop-shadow-sm">{settings['site_name_en'] || 'Buddhist Tenant'}</span>
                            </div>
                        </div>

                        <div className="text-[15px] text-[#D5CDBD] mb-8 max-w-sm leading-relaxed" suppressHydrationWarning>
                            Gìn giữ ngọn đèn chính pháp, thắp sáng đạo đức và trí tuệ. Nơi kết nối tâm hồn và di sản ngàn năm.
                        </div>

                        <div className="mt-4 mb-8 opacity-60 hover:opacity-100 transition-opacity duration-300 pointer-events-auto" suppressHydrationWarning>
                            <VisitorCounter />
                        </div>

                        {/* Social links */}
                        <div className="flex gap-4">
                            <a
                                href={settings['facebook_url'] || "https://facebook.com/chuachantarangsay"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-11 h-11 border border-[#8B7355] rounded-none bg-transparent hover:bg-[#8B7355] flex items-center justify-center text-[#D5CDBD] hover:text-white transition-all transform hover:-translate-y-1 shadow-sm"
                                aria-label="Facebook"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                            {settings['youtube_url'] && (
                                <a
                                    href={settings['youtube_url']}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-11 h-11 border border-[#8B7355] rounded-none bg-transparent hover:bg-[#8B7355] flex items-center justify-center text-[#D5CDBD] hover:text-white transition-all transform hover:-translate-y-1 shadow-sm"
                                    aria-label="YouTube"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* 2. Giờ mở cửa */}
                    <div>
                        <h4 className="text-[13px] font-bold text-[#8B7355] uppercase tracking-[0.2em] mb-6 pb-3 border-b border-[#8B7355]/30 flex items-center gap-2">
                            <span className="w-2 h-2 bg-[#8B7355] rotate-45 inline-block" />
                            Giờ mở cửa
                        </h4>
                        <div className="flex flex-col gap-2 mb-8 text-[15px] text-[#D5CDBD]">
                            <span className="font-bold text-[#F4F1EA]">Hằng ngày</span>
                            <span className="font-mono tracking-widest opacity-80">5:00 – 20:00</span>
                        </div>
                        <a
                            href={settings['map_direction_url'] || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings['address'] || "Chi nhánh Chantarangsay")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-[#8B7355] hover:text-[#D5CDBD] transition-colors group relative"
                        >
                            <span className="relative">
                                Xem bản đồ
                                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#D5CDBD] transition-all group-hover:w-full"></span>
                            </span>
                            <span aria-hidden="true" className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </a>
                    </div>

                    {/* 3. Liên hệ */}
                    <div>
                        <h4 className="text-[13px] font-bold text-[#8B7355] uppercase tracking-[0.2em] mb-6 pb-3 border-b border-[#8B7355]/30 flex items-center gap-2">
                            <span className="w-2 h-2 bg-[#8B7355] rotate-45 inline-block" />
                            Liên hệ
                        </h4>
                        <ul className="space-y-5 text-[15px] text-[#D5CDBD]">
                            <li className="flex flex-col gap-1.5">
                                <span className="font-bold text-[#F4F1EA]">Địa chỉ</span>
                                <span className="leading-relaxed">{settings['address'] || 'Quận 3, TP. Hồ Chí Minh'}</span>
                            </li>
                            <li className="flex flex-col gap-1.5">
                                <span className="font-bold text-[#F4F1EA]">Điện thoại</span>
                                <a href={`tel:${(settings['contact_phone'] || '02812345678').replace(/\s+/g, '')}`} className="font-mono tracking-widest opacity-90 hover:text-[#8B7355] hover:opacity-100 transition-colors">
                                    {settings['contact_phone'] || '(028) 1234 5678'}
                                </a>
                            </li>
                            <li className="flex flex-col gap-1.5">
                                <span className="font-bold text-[#F4F1EA]">Email</span>
                                <a href={`mailto:${settings['contact_email'] || 'contact@chantarangsay.org'}`} className="hover:text-[#8B7355] transition-colors relative inline-block group w-max">
                                    {settings['contact_email'] || 'contact@chantarangsay.org'}
                                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#8B7355] transition-all group-hover:w-full"></span>
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* ── Bottom bar ── */}
                <div className="mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left border-t border-[#8B7355]/30">
                    <p className="text-[13px] text-[#D5CDBD]/70 tracking-wide">
                        © {currentYear} <span className="text-[#F4F1EA] font-semibold">{settings['site_name_vi'] || DEFAULT_SITE_NAME}</span>. All rights reserved.
                    </p>
                    <p className="text-[11px] text-[#8B7355] uppercase tracking-[0.3em] font-bold">
                        {t('developed_by')}
                    </p>
                </div>
            </div>
        </footer>
    );
}
