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

export function ZenFooter({ settings = {}, domain, isCompany }: { settings?: Record<string, string>, domain?: string,
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
        <footer className="relative bg-[#F9FAF9] border-t border-[#E1E7E3]" style={{ backgroundColor: 'var(--theme-footer-bg, #F9FAF9)' }}>
            {/* ── Newsletter strip ── */}
            <div className="border-b border-[#E1E7E3] bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left flex-shrink-0">
                            <h3 className="text-[15px] font-medium text-[#2C3E35] tracking-wide">
                                Gieo duyên chánh pháp
                            </h3>
                            <p className="text-[14px] text-[#6B7C73] mt-2 font-light">
                                Đăng ký để nhận thông báo về các khóa thiền và tin tức mới.
                            </p>
                        </div>
                        <form onSubmit={handleNewsletterSubmit} className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                            <div className="relative group w-full sm:w-[320px]">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email của bạn..."
                                    required
                                    disabled={isSubmitting}
                                    className="px-5 py-3 w-full bg-[#F2F5F3] border border-transparent rounded-full text-[#2C3E35] placeholder:text-[#86968D] focus:outline-none focus:bg-white focus:border-[#4A6B5D] transition-all disabled:opacity-50 text-[14px] font-light shadow-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-8 py-3 bg-[#4A6B5D] hover:bg-[#3D5A4E] text-white text-[14px] font-medium rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-[0_4px_14px_rgba(74,107,93,0.2)] hover:shadow-[0_6px_20px_rgba(74,107,93,0.3)] hover:-translate-y-0.5"
                            >
                                {isSubmitting ? 'Đăng ký' : 'Đăng ký'}
                            </button>
                        </form>
                    </div>
                    {message && (
                        <p className={`mt-4 text-[14px] text-center md:text-right font-light transition-opacity duration-300 ${message.includes('thành công') ? 'text-[#4A6B5D]' : 'text-red-400'}`}>
                            {message}
                        </p>
                    )}
                </div>
            </div>

            {/* ── Main content ── */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">

                    {/* 1. About & Logo */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-4 mb-8">
                            <TenantLogo 
                                src={settings['site_logo']} 
                                alt={settings['site_name_vi']} 
                                variant="adaptive" 
                                size="lg" 
                                className="bg-white shadow-sm border border-[#E1E7E3]"
                            />
                            <div className="flex flex-col justify-center">
                                <span className="text-xl font-light tracking-[0.05em] text-[#2C3E35] leading-none mb-1">
                                    {settings['site_name_vi'] || DEFAULT_SITE_NAME}
                                </span>
                                <span className="text-[10px] text-[#86968D] font-light tracking-[0.2em] uppercase">
                                    {settings['site_name_en'] || 'Buddhist Tenant'}
                                </span>
                            </div>
                        </div>

                        <div className="text-[14px] text-[#6B7C73] mb-8 max-w-sm leading-relaxed font-light" suppressHydrationWarning>
                            Tĩnh lặng trong từng nhịp thở. Nơi hướng về sự bình an nội tại và nuôi dưỡng lòng từ bi.
                        </div>

                        <div className="mt-4 mb-8 opacity-50 hover:opacity-100 transition-opacity duration-500 pointer-events-auto" suppressHydrationWarning>
                            <VisitorCounter />
                        </div>

                        {/* Social links */}
                        <div className="flex gap-4">
                            <a
                                href={settings['facebook_url'] || "https://facebook.com/chuachantarangsay"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white border border-[#E1E7E3] hover:border-[#4A6B5D] flex items-center justify-center text-[#86968D] hover:text-[#4A6B5D] transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                                aria-label="Facebook"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                            {settings['youtube_url'] && (
                                <a
                                    href={settings['youtube_url']}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-white border border-[#E1E7E3] hover:border-[#4A6B5D] flex items-center justify-center text-[#86968D] hover:text-[#4A6B5D] transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                                    aria-label="YouTube"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* 2. Giờ mở cửa */}
                    <div>
                        <h4 className="text-[12px] font-medium text-[#86968D] uppercase tracking-[0.15em] mb-6 flex items-center gap-3">
                            <span className="w-6 h-[1px] bg-[#E1E7E3] inline-block" />
                            Giờ mở cửa
                        </h4>
                        <div className="flex flex-col gap-2 mb-8 text-[14px]">
                            <span className="font-medium text-[#2C3E35]">Mỗi ngày</span>
                            <span className="font-light text-[#6B7C73] tracking-wide">5:00 – 20:00</span>
                        </div>
                        <a
                            href={settings['map_direction_url'] || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings['address'] || "Chi nhánh Chantarangsay")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[13px] font-medium text-[#4A6B5D] hover:text-[#2C3E35] transition-colors group"
                        >
                            Chỉ đường đi
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </a>
                    </div>

                    {/* 3. Liên hệ */}
                    <div>
                        <h4 className="text-[12px] font-medium text-[#86968D] uppercase tracking-[0.15em] mb-6 flex items-center gap-3">
                            <span className="w-6 h-[1px] bg-[#E1E7E3] inline-block" />
                            Liên hệ
                        </h4>
                        <ul className="space-y-5 text-[14px] text-[#6B7C73] font-light">
                            <li className="flex flex-col gap-1.5">
                                <span className="font-medium text-[#2C3E35]">Địa chỉ</span>
                                <span className="leading-relaxed">{settings['address'] || 'Quận 3, TP. Hồ Chí Minh'}</span>
                            </li>
                            <li className="flex flex-col gap-1.5">
                                <span className="font-medium text-[#2C3E35]">Điện thoại</span>
                                <a href={`tel:${(settings['contact_phone'] || '02812345678').replace(/\s+/g, '')}`} className="hover:text-[#4A6B5D] transition-colors">
                                    {settings['contact_phone'] || '(028) 1234 5678'}
                                </a>
                            </li>
                            <li className="flex flex-col gap-1.5">
                                <span className="font-medium text-[#2C3E35]">Email</span>
                                <a href={`mailto:${settings['contact_email'] || 'contact@chantarangsay.org'}`} className="hover:text-[#4A6B5D] transition-colors relative inline-block w-max group">
                                    {settings['contact_email'] || 'contact@chantarangsay.org'}
                                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#4A6B5D] transition-all duration-300 group-hover:w-full"></span>
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* ── Bottom bar ── */}
                <div className="mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left border-t border-[#E1E7E3]">
                    <p className="text-[13px] text-[#86968D] font-light">
                        © {currentYear} <span className="font-medium text-[#6B7C73]">{settings['site_name_vi'] || DEFAULT_SITE_NAME}</span>.
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-[#86968D] uppercase tracking-[0.15em]">
                        <span className="w-1 h-1 rounded-full bg-[#D1DDD6]" />
                        <p>{t('developed_by')}</p>
                        <span className="w-1 h-1 rounded-full bg-[#D1DDD6]" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
