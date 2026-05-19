'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { getVietnamTime } from '@/lib/utils/date';
import { DEFAULT_SITE_NAME } from '@/lib/constants';
import { MapPin, Phone, Mail } from 'lucide-react';
import { HandsPrayerIcon } from '@/components/ui/khmer-icons';
import { TenantLogo } from '@/components/layout/tenant-logo';

const VisitorCounter = dynamic(
    () => import('@/components/analytics/VisitorCounter').then(m => ({ default: m.VisitorCounter })),
    { ssr: false }
);

// ──────────────────────────────────────────────────────────
// Style: Theravāda Footer — Serene & Warm
// Colors: 
// - Wood Brown Background (#5C432A)
// - Cream Main (#FFF9F0)
// - Tenant Gold Accent (#E6A229)
// ──────────────────────────────────────────────────────────

export function TheraFooter({
    settings = {},
    domain,
    isCompany,
    modulesConfig,
    hasProjects
}: any) {
    const t = useTranslations('common');
    const currentYear = getVietnamTime().getFullYear();
    const [email, setEmail] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [message, setMessage] = React.useState('');

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setIsSubmitting(true);
        try {
            const locale = document.documentElement.lang || 'vi';
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, locale }),
            });
            if (res.ok) {
                setMessage('Sabbe Satta Bhavantu Sukhitatta. Cảm ơn quý vị lãnh thọ!');
                setEmail('');
            } else {
                setMessage('Có lỗi xảy ra. Quý vị vui lòng thử lại sau.');
            }
        } catch (error) {
            setMessage('Lỗi kết nối. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <footer className="bg-[#5C432A] text-[#FFF9F0]" style={{ backgroundColor: 'var(--theme-footer-bg, #5C432A)' }}>
            {/* Top Border with Gold Pattern or Line */}
            <div className="h-1 bg-gradient-to-r from-transparent via-[#E6A229] to-transparent" />

            {/* Newsletter Section */}
            <div className="border-b border-white/10">
                <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h3 className="text-lg font-serif font-bold text-[#E6A229]" style={{ fontFamily: 'Merriweather, serif' }}>
                            Nhận Tin Phật Sự
                        </h3>
                        <p className="text-xs text-[#FFF9F0]/60 mt-1">
                            Lịch lễ, pháp thoại và thông tin tu học hằng tuần
                        </p>
                    </div>
                    <form onSubmit={handleNewsletterSubmit} className="flex gap-2 w-full max-w-md">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email của quý vị..."
                            className="flex-1 px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E6A229] text-sm"
                            required
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 bg-[#E6A229] hover:bg-[#E6A229]/90 text-[#3C2F1F] font-bold py-2.5 rounded-lg transition-all text-sm disabled:opacity-50"
                        >
                            Đăng Ký
                        </button>
                    </form>
                </div>
                {message && <p className="text-center text-[11px] pb-4 text-[#E6A229] italic">{message}</p>}
            </div>

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                
                {/* 1. Identity */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-start gap-4">
                        <TenantLogo 
                            src={settings['site_logo']} 
                            alt={settings['site_name_vi']} 
                            size="md" 
                            variant="circle" 
                            className="bg-[#FFF9F0] border border-[#E6A229]/50 shadow-inner"
                        />
                        <div className="space-y-1">
                            <h4 className="text-xl font-serif font-bold text-[#E6A229]" style={{ fontFamily: 'Merriweather, serif' }}>
                                {settings['site_name_vi'] || DEFAULT_SITE_NAME}
                            </h4>
                            <p className="text-xs leading-relaxed text-[#FFF9F0]/70 italic">
                                {settings['site_description_vi'] || 'Phụng sự cộng đồng theo con đường tỉnh thức và từ bi.'}
                            </p>
                        </div>
                    </div>
                    <div className="pt-2">
                        <VisitorCounter />
                    </div>
                </div>

                {/* 2. Opening & Service */}
                <div className="space-y-5">
                    <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E6A229]/80">
                        Phật Sự & Lễ Bái
                    </h5>
                    <ul className="space-y-3 text-sm text-[#FFF9F0]/80">
                        <li className="flex justify-between">
                            <span>Sáng:</span>
                            <span className="font-bold underline decoration-[#E6A229]/40 underline-offset-4">05:00 – 11:00</span>
                        </li>
                        <li className="flex justify-between">
                            <span>Chiều:</span>
                            <span className="font-bold underline decoration-[#E6A229]/40 underline-offset-4">13:30 – 20:00</span>
                        </li>
                        <li className="pt-2 italic text-[12px] opacity-60">
                            * Vui lòng ăn mặc trang nghiêm khi viếng chi nhánh.
                        </li>
                    </ul>
                </div>

                {/* 3. Contact & Navigation */}
                <div className="space-y-5">
                    <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E6A229]/80">
                        Liên Kết Hữu Duyên
                    </h5>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/gioi-thieu" className="hover:text-[#E6A229] transition-colors">Về Chi nhánh & Tăng Đoàn</Link></li>
                        <li><Link href="/documents" className="hover:text-[#E6A229] transition-colors">Tàng Kinh Các (Pháp thoại)</Link></li>
                        <li><Link href="/tin-tuc" className="hover:text-[#E6A229] transition-colors">Hoạt động Phật Sự</Link></li>
                        <li><Link href="/lien-he" className="hover:text-[#E6A229] transition-colors">Gửi lời khấn nguyện</Link></li>
                    </ul>
                </div>

                {/* 4. Connectivity */}
                <div className="space-y-5">
                    <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E6A229]/80">
                        Thông Tin Liên Lạc
                    </h5>
                    <div className="text-sm space-y-3 opacity-90">
                        <p className="flex gap-3 items-center">
                            <MapPin className="w-4 h-4 text-[#E6A229] shrink-0" />
                            {settings['address'] || 'Chi nhánh Khmer Theravāda'}
                        </p>
                        <p className="flex gap-3 items-center">
                            <Phone className="w-4 h-4 text-[#E6A229] shrink-0" />
                            {settings['contact_phone'] || '028 1234 5678'}
                        </p>
                        <p className="flex gap-3 items-center">
                            <Mail className="w-4 h-4 text-[#E6A229] shrink-0" />
                            {settings['contact_email'] || 'contact@pagoda.org'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-[#3C2F1F] py-8 px-4 border-t border-white/5">
                <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-[#FFF9F0]/40 uppercase tracking-widest font-medium">
                    <p>© {currentYear} {settings['site_name_vi'] || DEFAULT_SITE_NAME}</p>
                    <p>Maitrī - Con Đường Chánh Niệm</p>
                </div>
            </div>
        </footer>
    );
}
