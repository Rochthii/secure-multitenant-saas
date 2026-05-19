'use client';
import { getVietnamTime } from '@/lib/utils/date';

import React from 'react';
import dynamic from 'next/dynamic';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { LotusIcon } from '@/components/ui/khmer-icons';

// Dynamic import — defer analytics polling from critical path
const VisitorCounter = dynamic(
    () => import('@/components/analytics/VisitorCounter').then(m => ({ default: m.VisitorCounter })),
    { ssr: false }
);

import { DEFAULT_SITE_NAME } from '@/lib/constants';
import { TenantLogo } from '@/components/layout/tenant-logo';

export function LotusFooter({ settings = {}, domain, isCompany }: { settings?: Record<string, string>, domain?: string,
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
        <footer className="relative bg-gradient-to-br from-red-900 via-red-950 to-black text-white/80 border-t-4 border-yellow-500/80 overflow-hidden" style={{ background: 'var(--theme-footer-bg, linear-gradient(to bottom right, #7f1d1d, #450a0a, #000000))' }}>
            {/* ── Background Pattern ── */}
            <div
                className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z' fill='%23FFD700' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* ── Newsletter strip ── */}
            <div className="border-b border-white/10 bg-black/20 relative z-10 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left flex-shrink-0">
                            <h3 className="text-sm font-bold text-white tracking-widest uppercase">
                                Đăng ký nhận tin tức
                            </h3>
                            <p className="text-sm text-white/60 mt-1">
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
                                className="px-4 py-2.5 min-h-[44px] w-full sm:w-80 bg-white/5 border border-white/20 rounded text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition-all disabled:opacity-50 text-sm"
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 min-h-[44px] bg-yellow-600 hover:bg-yellow-500 text-black text-sm font-bold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap uppercase tracking-widest"
                            >
                                {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
                            </button>
                        </form>
                    </div>
                    {message && (
                        <p className={`mt-3 text-sm text-center md:text-right font-medium ${message.includes('thành công') ? 'text-yellow-400' : 'text-red-400'}`}>
                            {message}
                        </p>
                    )}
                </div>
            </div>

            {/* ── Main content ── */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

                    {/* 1. About & Logo */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <TenantLogo 
                                src={settings['site_logo']} 
                                alt={settings['site_name_vi']} 
                                size="lg" 
                                variant="circle" 
                                fallbackIcon={<LotusIcon size={24} />}
                                className="bg-white border-2 border-yellow-500/50 shadow-inner"
                            />
                            <div>
                                <h3 className="text-xl font-black text-white leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                                    {settings['site_name_vi'] || DEFAULT_SITE_NAME}
                                </h3>
                                <span className="text-[10px] text-yellow-500 font-bold tracking-[0.2em] uppercase">{settings['site_name_en'] || 'Buddhist Tenant'}</span>
                            </div>
                        </div>

                        <div className="text-sm leading-relaxed mb-6 max-w-sm text-white/70" suppressHydrationWarning>
                            Từng nhịp bước thong dong, từng hơi thở nhẹ nhàng. Nơi nuôi dưỡng tâm bồ đề và lan tỏa tinh hoa giáo pháp.
                        </div>

                        <div className="mt-4 mb-6 opacity-60 hover:opacity-100 transition-all duration-300" suppressHydrationWarning>
                            <VisitorCounter />
                        </div>

                        {/* Social links */}
                        <div className="flex gap-4">
                            <a
                                href={settings['facebook_url'] || "https://facebook.com/chuachantarangsay"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-yellow-600 hover:text-white transition-all transform hover:scale-110"
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
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-yellow-600 hover:text-white transition-all transform hover:scale-110"
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
                        <h4 className="text-xs font-bold text-yellow-500 uppercase tracking-[0.15em] mb-5 pb-2 border-b border-white/10 inline-block">
                            Giờ mở cửa
                        </h4>
                        <div className="flex flex-col gap-2 mb-6 text-sm">
                            <span className="font-bold text-white">Hằng ngày</span>
                            <span className="text-white/70 font-mono tracking-wide">5:00 – 20:00</span>
                        </div>
                        <a
                            href={settings['map_direction_url'] || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings['address'] || "Chi nhánh Chantarangsay")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-bold text-yellow-500 hover:text-yellow-400 transition-colors group"
                        >
                            Xem bản đồ
                            <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </a>
                    </div>

                    {/* 3. Liên hệ */}
                    <div>
                        <h4 className="text-xs font-bold text-yellow-500 uppercase tracking-[0.15em] mb-5 pb-2 border-b border-white/10 inline-block">
                            Liên hệ
                        </h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex flex-col gap-1">
                                <span className="font-bold text-white">Địa chỉ</span>
                                <span className="text-white/70">{settings['address'] || 'Quận 3, TP. Hồ Chí Minh'}</span>
                            </li>
                            <li className="flex flex-col gap-1">
                                <span className="font-bold text-white">Điện thoại</span>
                                <a href={`tel:${(settings['contact_phone'] || '02812345678').replace(/\s+/g, '')}`} className="text-white/70 hover:text-yellow-500 transition-colors font-mono tracking-wide">
                                    {settings['contact_phone'] || '(028) 1234 5678'}
                                </a>
                            </li>
                            <li className="flex flex-col gap-1">
                                <span className="font-bold text-white">Email</span>
                                <a href={`mailto:${settings['contact_email'] || 'contact@chantarangsay.org'}`} className="text-white/70 hover:text-yellow-500 transition-colors">
                                    {settings['contact_email'] || 'contact@chantarangsay.org'}
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* ── Bottom bar ── */}
                <div className="mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left border-t border-white/10">
                    <p className="text-sm text-white/50 font-medium">
                        © {currentYear} <span className="text-white/70">{settings['site_name_vi'] || DEFAULT_SITE_NAME}</span>. All rights reserved.
                    </p>
                    <p className="text-xs text-white/30 uppercase tracking-[0.2em]">
                        {t('developed_by')}
                    </p>
                </div>
            </div>
        </footer>
    );
}
