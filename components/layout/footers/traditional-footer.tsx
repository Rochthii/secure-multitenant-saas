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

export function TraditionalFooter({
    settings = {},
    domain,
    isCompany,
    modulesConfig,
    hasProjects
}: {
    settings?: Record<string, string>,
    domain?: string,
    isCompany?: boolean,
    modulesConfig?: Record<string, boolean>,
    hasProjects?: boolean
}) {
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
        <footer className="relative">
            {/* ── Gold accent line (mirrors header top line) ── */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-gold-primary to-transparent" />

            {/* ── Newsletter strip ── */}
            <div className="backdrop-blur-md border-b border-gold-dark/15" style={{ backgroundColor: 'var(--theme-footer-bg, rgba(38, 20, 12, 0.95))' }}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 sm:py-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                        <div className="text-center sm:text-left flex-shrink-0">
                            <h3 className="text-base font-playfair font-bold text-gold-light flex items-center justify-center sm:justify-start gap-2">
                                {isCompany ? 'Đăng ký nhận bản tin doanh nghiệp' : 'Đăng ký nhận tin từ Chi nhánh'}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">
                                {isCompany 
                                    ? 'Nhận thông tin cập nhật, thông báo nội bộ và tài liệu đào tạo mới nhất'
                                    : 'Nhận thông tin lịch lễ và pháp thoại mới nhất'}
                            </p>
                        </div>
                        <form onSubmit={handleNewsletterSubmit} className="w-full sm:w-auto flex flex-col sm:flex-row gap-2.5">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email của bạn..."
                                required
                                disabled={isSubmitting}
                                className="px-4 py-3 min-h-[44px] w-full sm:w-72 bg-white/5 border border-gold-dark/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-primary/50 transition-all disabled:opacity-50 text-sm"
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-5 min-h-[44px] bg-gold-primary/90 hover:bg-gold-primary text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
                            </button>
                        </form>
                    </div>
                    {message && (
                        <p className={`mt-2 text-xs text-center sm:text-right ${message.includes('thành công') ? 'text-green-400' : 'text-red-400'}`}>
                            {message}
                        </p>
                    )}
                </div>
            </div>

            {/* ── Main content ── */}
            <div className="backdrop-blur-md" style={{ backgroundColor: 'var(--theme-footer-bg, rgba(38, 20, 12, 0.95))' }}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 lg:justify-between">

                        {/* 1. About & Logo */}
                        <div className="sm:col-span-2 lg:col-span-1">
                            <div className="flex items-center gap-2.5 mb-4 group">
                                <TenantLogo 
                                    src={settings['site_logo']} 
                                    alt={settings['site_name_vi']} 
                                    size="lg" 
                                    variant="adaptive" 
                                    className="bg-white/5 border border-gold-primary/30 group-hover:border-gold-primary"
                                />
                                <div>
                                    <h3 className="text-base font-playfair font-bold text-gold-light leading-tight">
                                        {settings['site_name_vi'] || DEFAULT_SITE_NAME}
                                    </h3>
                                    <span className="text-[9px] text-gray-500 tracking-[0.2em] uppercase">
                                        {isCompany ? 'Enterprise Portal' : (settings['site_name_km'] || 'វត្តឃ្លាំង')} · {isCompany ? 'Hệ thống Quản trị' : (t('pagoda') || 'Chi nhánh Khmer')}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-5 mb-6" suppressHydrationWarning>
                                <VisitorCounter />
                            </div>

                            {/* Social links */}
                            <div className="flex gap-2">
                                <a
                                    href={settings['facebook_url'] || "https://facebook.com/chuakhleangsoctrang"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-11 h-11 bg-white/5 active:bg-white/15 rounded-xl text-gray-400 hover:text-gold-primary transition-colors"
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
                                        className="flex items-center justify-center w-11 h-11 bg-white/5 active:bg-white/15 rounded-xl text-gray-400 hover:text-gold-primary transition-colors"
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
                            <h4 className="text-[10px] font-semibold text-gold-primary/80 uppercase tracking-[0.2em] mb-4">
                                {isCompany ? 'Giờ làm việc' : 'Giờ mở cửa'}
                            </h4>
                            <div className="flex items-start gap-3 mb-5">
                                <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-gold-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="text-sm text-gray-400">
                                    <p className="text-gray-300 font-medium">Hằng ngày</p>
                                    <p>5:00 – 20:00</p>
                                </div>
                            </div>
                            <a
                                href={settings['map_direction_url'] || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings['address'] || "Chua Kh'leang")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 min-h-[44px] text-sm font-medium text-gold-light bg-white/5 hover:bg-white/10 active:bg-white/15 rounded-xl transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                                Xem bản đồ
                            </a>
                        </div>

                        {/* 3. Liên hệ */}
                        <div>
                            <h4 className="text-[10px] font-semibold text-gold-primary/80 uppercase tracking-[0.2em] mb-4">
                                Liên hệ
                            </h4>
                            <ul className="space-y-0">
                                <li className="flex items-center gap-3 min-h-[44px]">
                                    <svg className="w-4 h-4 flex-shrink-0 text-gold-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-sm text-gray-400 line-clamp-2">{settings['address'] || '71 Mậu Thân, Khóm 5, Phường 6, TP. Sóc Trăng'}</span>
                                </li>
                                <li>
                                    <a href={`tel:${(settings['contact_phone'] || '02812345678').replace(/\s+/g, '')}`} className="flex items-center gap-3 min-h-[44px] text-sm text-gray-400 hover:text-white active:text-white transition-colors">
                                        <svg className="w-4 h-4 flex-shrink-0 text-gold-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {settings['contact_phone'] || '(028) 1234 5678'}
                                    </a>
                                </li>
                                <li>
                                    <a href={`mailto:${settings['contact_email'] || 'contact@chantarangsay.org'}`} className="flex items-center gap-3 min-h-[44px] text-sm text-gray-400 hover:text-white active:text-white transition-colors break-all">
                                        <svg className="w-4 h-4 flex-shrink-0 text-gold-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {settings['contact_email'] || 'contact@chuakhleang.org'}
                                    </a>
                                </li>
                            </ul>
                        </div>

                    </div>

                    {/* ── Bottom bar ── */}
                    <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 pb-24 lg:pb-6 border-t border-gold-dark/15">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
                            <p className="text-xs text-gray-500">
                                © {currentYear} {settings['site_name_vi'] || DEFAULT_SITE_NAME}. All rights reserved.
                            </p>
                            <p className="text-xs text-gray-400">
                                {t('developed_by')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
