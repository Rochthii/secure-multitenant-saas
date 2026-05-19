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

export function SunriseFooter({ settings = {}, domain, isCompany }: { settings?: Record<string, string>, domain?: string,
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
        <footer className="relative bg-gradient-to-b from-[#FFF5E4] to-white border-t border-[#FFE3E1]" style={{ background: 'var(--theme-footer-bg, linear-gradient(to bottom, #FFF5E4, #ffffff))' }}>
            {/* ── Newsletter strip ── */}
            <div className="border-b border-[#FFE3E1] bg-[#FFF5E4]/50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left flex-shrink-0">
                            <h3 className="text-sm font-semibold text-[#8B322C] tracking-wide uppercase">
                                Đăng ký nhận tin tức
                            </h3>
                            <p className="text-sm text-[#A6615C] mt-1">
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
                                className="px-4 py-2.5 min-h-[44px] w-full sm:w-80 bg-white border border-[#FFE3E1] rounded text-[#8B322C] placeholder:text-[#A6615C] focus:outline-none focus:ring-1 focus:ring-[#D97706] focus:border-[#D97706] transition-all disabled:opacity-50 text-sm shadow-sm"
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 min-h-[44px] bg-[#8B322C] hover:bg-[#D97706] text-white text-sm font-semibold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-sm hover:shadow"
                            >
                                {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
                            </button>
                        </form>
                    </div>
                    {message && (
                        <p className={`mt-3 text-sm text-center md:text-right font-medium ${message.includes('thành công') ? 'text-[#D97706]' : 'text-red-500'}`}>
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
                                variant="circle" 
                                className="bg-white border-[#FFE3E1] shadow-sm transform hover:scale-105 transition-transform duration-300"
                            />
                            <div>
                                <h3 className="text-lg font-bold text-[#8B322C] leading-tight">
                                    {settings['site_name_vi'] || DEFAULT_SITE_NAME}
                                </h3>
                                <span className="text-[10px] text-[#A6615C] tracking-widest uppercase">{settings['site_name_en'] || 'Buddhist Tenant'}</span>
                            </div>
                        </div>

                        <div className="text-sm text-[#A6615C] mb-6 max-w-sm leading-relaxed" suppressHydrationWarning>
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
                                className="text-[#A6615C] hover:text-[#D97706] transition-colors"
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
                                    className="text-[#A6615C] hover:text-[#D97706] transition-colors"
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
                        <h4 className="text-xs font-bold text-[#8B322C] uppercase tracking-wider mb-5">
                            Giờ mở cửa
                        </h4>
                        <div className="flex flex-col gap-2 mb-6 text-sm text-[#A6615C]">
                            <span className="font-semibold text-[#8B322C]">Hằng ngày</span>
                            <span>5:00 – 20:00</span>
                        </div>
                        <a
                            href={settings['map_direction_url'] || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings['address'] || "Chi nhánh Chantarangsay")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-[#D97706] hover:text-[#8B322C] transition-colors"
                        >
                            Xem bản đồ
                            <span aria-hidden="true">&rarr;</span>
                        </a>
                    </div>

                    {/* 3. Liên hệ */}
                    <div>
                        <h4 className="text-xs font-bold text-[#8B322C] uppercase tracking-wider mb-5">
                            Liên hệ
                        </h4>
                        <ul className="space-y-4 text-sm text-[#A6615C]">
                            <li className="flex flex-col gap-1">
                                <span className="font-semibold text-[#8B322C]">Địa chỉ</span>
                                <span>{settings['address'] || 'Quận 3, TP. Hồ Chí Minh'}</span>
                            </li>
                            <li className="flex flex-col gap-1">
                                <span className="font-semibold text-[#8B322C]">Điện thoại</span>
                                <a href={`tel:${(settings['contact_phone'] || '02812345678').replace(/\s+/g, '')}`} className="hover:text-[#D97706] transition-colors">
                                    {settings['contact_phone'] || '(028) 1234 5678'}
                                </a>
                            </li>
                            <li className="flex flex-col gap-1">
                                <span className="font-semibold text-[#8B322C]">Email</span>
                                <a href={`mailto:${settings['contact_email'] || 'contact@chantarangsay.org'}`} className="hover:text-[#D97706] transition-colors">
                                    {settings['contact_email'] || 'contact@chantarangsay.org'}
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* ── Bottom bar ── */}
                <div className="mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left border-t border-[#FFE3E1]">
                    <p className="text-sm text-[#A6615C]">
                        © {currentYear} {settings['site_name_vi'] || DEFAULT_SITE_NAME}. All rights reserved.
                    </p>
                    <p className="text-xs text-[#A6615C]/60">
                        {t('developed_by')}
                    </p>
                </div>
            </div>
        </footer>
    );
}
