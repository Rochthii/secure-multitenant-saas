'use client';
import { getVietnamTime } from '@/lib/utils/date';

import React from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { TenantLogo } from '@/components/layout/tenant-logo';

const Lantern = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
    <div className={cn("absolute animate-bounce-slow opacity-60", className)} style={style}>
        <div className="relative w-8 h-10 bg-[#FF4D6D] rounded-t-lg rounded-b-md shadow-[0_0_15px_rgba(255,77,109,0.5)] border border-[#FFD700]/20">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#FFD700]/40 rounded-full"></div>
            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-4 h-[10px] bg-[#FF4D6D] rounded-sm opacity-80"></div>
            <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-[2px] h-3 bg-[#FF4D6D] opacity-60"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10"></div>
        </div>
    </div>
);

// Dynamic import — defer analytics polling from critical path
const VisitorCounter = dynamic(
    () => import('@/components/analytics/VisitorCounter').then(m => ({ default: m.VisitorCounter })),
    { ssr: false }
);

import { DEFAULT_SITE_NAME } from '@/lib/constants';

export function FestivalFooter({ settings = {}, domain, isCompany }: { settings?: Record<string, string>, domain?: string,
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
        <footer className="relative bg-[#12023A] border-t-2 border-[#FFD700] text-[#FFF8E7] overflow-hidden pt-16 pb-8" style={{ backgroundColor: 'var(--theme-footer-bg, #12023A)' }}>
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,215,0,0.05),transparent_50%)]"></div>

                {/* Lanterns */}
                <Lantern className="top-10 left-[5%]" style={{ animationDelay: '0s' }} />
                <Lantern className="top-24 left-[15%]" style={{ animationDelay: '1.2s', scale: '0.8' }} />
                <Lantern className="top-16 right-[10%]" style={{ animationDelay: '0.5s', scale: '1.1' }} />
                <Lantern className="top-32 right-[25%]" style={{ animationDelay: '1.8s', scale: '0.7' }} />

                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FFD700]/20 to-transparent"></div>
            </div>

            {/* ── Newsletter strip ── */}
            <div className="border-b border-[#FFD700]/20 bg-black/20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left flex-shrink-0">
                            <h3 className="text-sm font-semibold text-[#FFD700] tracking-wide uppercase drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]">
                                Đăng ký nhận tin tức
                            </h3>
                            <p className="text-sm text-[#FFF8E7]/70 mt-1">
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
                                className="px-4 py-2.5 min-h-[44px] w-full sm:w-80 bg-white/5 border border-white/10 rounded text-[#FFF8E7] placeholder:text-[#FFF8E7]/50 focus:outline-none focus:ring-1 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all disabled:opacity-50 text-sm shadow-inner"
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 min-h-[44px] bg-[#FF4D6D] hover:bg-[#FF4D6D]/90 text-white text-sm font-bold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-[0_0_15px_rgba(255,77,109,0.4)] hover:shadow-[0_0_20px_rgba(255,77,109,0.6)]"
                            >
                                {isSubmitting ? 'Đăng ký' : 'Đăng ký'}
                            </button>
                        </form>
                    </div>
                    {message && (
                        <p className={`mt-3 text-sm text-center md:text-right font-medium ${message.includes('thành công') ? 'text-[#39D5A0] drop-shadow-[0_0_3px_rgba(57,213,160,0.5)]' : 'text-[#FF4D6D]'}`}>
                            {message}
                        </p>
                    )}
                </div>
            </div>

            {/* ── Main content ── */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

                    {/* 1. About & Logo */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <TenantLogo 
                                src={settings['site_logo']} 
                                alt={settings['site_name_vi']} 
                                size="md" 
                                variant="adaptive" 
                                className="bg-white/5 border border-[#FFD700]/30 shadow-[0_0_15px_rgba(255,215,0,0.2)]"
                            />
                            <div>
                                <h3 className="text-lg font-bold text-[#FFD700] leading-tight drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">
                                    {settings['site_name_vi'] || DEFAULT_SITE_NAME}
                                </h3>
                                <span className="text-[10px] text-[#39D5A0] tracking-widest uppercase drop-shadow-[0_0_3px_rgba(57,213,160,0.8)]">{settings['site_name_en'] || 'Buddhist Tenant'}</span>
                            </div>
                        </div>

                        <div className="text-sm text-[#FFF8E7]/70 mb-6 max-w-sm leading-relaxed" suppressHydrationWarning>
                            Nơi gìn giữ và phát huy các giá trị di sản văn hóa, tâm linh, mang đến không gian thiền định bình an cho mọi người.
                        </div>

                        <div className="mt-4 mb-6 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" suppressHydrationWarning>
                            <VisitorCounter />
                        </div>

                        {/* Social links */}
                        <div className="flex gap-3">
                            <a
                                href={settings['facebook_url'] || "https://facebook.com/chuachantarangsay"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#FFF8E7]/60 hover:text-[#FFD700] hover:drop-shadow-[0_0_8px_rgba(255,215,0,0.8)] transition-all"
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
                                    className="text-[#FFF8E7]/60 hover:text-[#FFD700] hover:drop-shadow-[0_0_8px_rgba(255,215,0,0.8)] transition-all"
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
                        <h4 className="text-xs font-bold text-[#FFD700] uppercase tracking-wider mb-5 drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]">
                            Giờ mở cửa
                        </h4>
                        <div className="flex flex-col gap-2 mb-6 text-sm text-[#FFF8E7]/70">
                            <span className="font-semibold text-[#FFF8E7]">Hằng ngày</span>
                            <span>5:00 – 20:00</span>
                        </div>
                        <a
                            href={settings['map_direction_url'] || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings['address'] || "Chi nhánh Chantarangsay")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-[#FF4D6D] hover:text-[#FFD700] transition-colors hover:drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]"
                        >
                            Xem bản đồ
                            <span aria-hidden="true">&rarr;</span>
                        </a>
                    </div>

                    {/* 3. Liên hệ */}
                    <div>
                        <h4 className="text-xs font-bold text-[#FFD700] uppercase tracking-wider mb-5 drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]">
                            Liên hệ
                        </h4>
                        <ul className="space-y-4 text-sm text-[#FFF8E7]/70">
                            <li className="flex flex-col gap-1">
                                <span className="font-semibold text-[#FFF8E7]">Địa chỉ</span>
                                <span>{settings['address'] || 'Quận 3, TP. Hồ Chí Minh'}</span>
                            </li>
                            <li className="flex flex-col gap-1">
                                <span className="font-semibold text-[#FFF8E7]">Điện thoại</span>
                                <a href={`tel:${(settings['contact_phone'] || '02812345678').replace(/\s+/g, '')}`} className="hover:text-[#FFD700] transition-colors hover:drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]">
                                    {settings['contact_phone'] || '(028) 1234 5678'}
                                </a>
                            </li>
                            <li className="flex flex-col gap-1">
                                <span className="font-semibold text-[#FFF8E7]">Email</span>
                                <a href={`mailto:${settings['contact_email'] || 'contact@chantarangsay.org'}`} className="hover:text-[#FFD700] transition-colors hover:drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]">
                                    {settings['contact_email'] || 'contact@chantarangsay.org'}
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* ── Bottom bar ── */}
                <div className="mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left border-t border-[#FFD700]/20">
                    <p className="text-sm text-[#FFF8E7]/70">
                        © {currentYear} {settings['site_name_vi'] || DEFAULT_SITE_NAME}. All rights reserved.
                    </p>
                    <p className="text-xs text-[#FFF8E7]/40">
                        {t('developed_by')}
                    </p>
                </div>
            </div>
        </footer>
    );
}
