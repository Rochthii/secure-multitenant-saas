'use client';
import React from 'react';
import { Link } from '@/i18n/routing';

interface InkContactStripProps {
    settings?: Record<string, string>;
    siteName?: string;
}

/**
 * InkContactStrip — Full-width dark footer strip
 * Mobile: stacked 3 rows
 * Desktop: 3-col horizontal
 */
export function InkContactStrip({ settings = {}, siteName }: InkContactStripProps) {
    const name = siteName || settings['site_name_vi'] || 'Chi nhánh Phật Giáo';
    const address = settings['address'] || '';
    const phone = settings['contact_phone'] || '';
    const email = settings['contact_email'] || '';

    // Giờ lễ từ settings hoặc mặc định
    const schedule = settings['daily_schedule'] || '05:00 — Thời Kinh Sáng\n08:00 — Thời Tụng Kinh\n18:00 — Thời Kinh Chiều';
    const scheduleLines = schedule.split('\n').filter(Boolean);

    return (
        <section style={{ backgroundColor: '#0F0F0F' }}>
            <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-16">

                {/* Main strip — 3 cols */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>

                    {/* Col 1 — Identity */}
                    <div className="py-10 md:py-12 md:pr-10">
                        <span
                            className="text-[9px] font-black tracking-[0.5em] uppercase block mb-4"
                            style={{ color: '#C41E3A' }}
                        >
                            Địa Chỉ
                        </span>
                        <h3
                            className="text-lg font-black mb-3"
                            style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#FFFFFF' }}
                        >
                            {name}
                        </h3>
                        {address && (
                            <p className="text-sm leading-relaxed mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>{address}</p>
                        )}
                        {phone && (
                            <a href={`tel:${phone}`} className="text-sm block hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                ☎ {phone}
                            </a>
                        )}
                        {email && (
                            <a href={`mailto:${email}`} className="text-sm block hover:text-white transition-colors mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                ✉ {email}
                            </a>
                        )}
                    </div>

                    {/* Col 2 — Schedule */}
                    <div className="py-10 md:py-12 md:px-10" style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                        <span
                            className="text-[9px] font-black tracking-[0.5em] uppercase block mb-4"
                            style={{ color: '#C41E3A' }}
                        >
                            Thời Khóa Hằng Ngày
                        </span>
                        <div className="space-y-2">
                            {scheduleLines.length > 0 ? (
                                scheduleLines.map((line, i) => (
                                    <div key={i} className="flex items-baseline gap-2">
                                        <span
                                            className="text-sm font-bold shrink-0"
                                            style={{ fontFamily: 'Georgia, serif', color: '#FFFFFF' }}
                                        >
                                            {line}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <>
                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>05:00 — Thời Kinh Sáng</p>
                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>08:00 — Tụng Kinh & Thiền</p>
                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>18:00 — Thời Kinh Chiều</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Col 3 — CTAs */}
                    <div className="py-10 md:py-12 md:pl-10 flex flex-col justify-center gap-4">
                        <span
                            className="text-[9px] font-black tracking-[0.5em] uppercase block mb-2"
                            style={{ color: '#C41E3A' }}
                        >
                            Tham Gia
                        </span>
                        <Link
                            href="/transactions"
                            className="w-full text-center py-3 text-xs font-black tracking-[0.2em] uppercase text-white transition-colors hover:bg-white hover:text-black duration-200"
                            style={{ border: '1px solid rgba(255,255,255,0.3)' }}
                        >
                            Đóng Góp Thanh toán
                        </Link>
                        <Link
                            href="/lien-he"
                            className="w-full text-center py-3 text-xs font-black tracking-[0.2em] uppercase transition-all hover:opacity-80 duration-200"
                            style={{ backgroundColor: '#C41E3A', color: '#FFFFFF' }}
                        >
                            Liên Hệ Chi nhánh
                        </Link>
                        <Link
                            href="/gioi-thieu"
                            className="text-center text-[10px] font-semibold tracking-wider transition-all hover:text-white duration-200"
                            style={{ color: 'rgba(255,255,255,0.35)' }}
                        >
                            Tìm hiểu về chúng tôi →
                        </Link>
                    </div>
                </div>

                {/* Bottom copyright strip */}
                <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        © {new Date().getFullYear()} {name} — Mọi quyền được bảo lưu
                    </span>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#C41E3A' }} />
                        <span className="text-[9px] tracking-[0.3em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>
                            Ink Style
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
