'use client';
import React from 'react';
import { Link } from '@/i18n/routing';

interface TheraContactStripProps {
    settings?: Record<string, any>;
    siteName?: string;
}

/**
 * TheraContactStrip — Footer info section
 * Nền nâu tối #5C432A, 3 cột: Địa chỉ | Giờ lễ | CTA
 */
export function TheraContactStrip({ settings = {}, siteName }: TheraContactStripProps) {
    const address = settings['address'] || '';
    const phone = settings['contact_phone'] || '0938 787 165';
    const email = settings['contact_email'] || 'contact@chantarangsay.org';
    const transactionZalu = settings['transaction_zalo_qr'] || null;

    return (
        <section className="py-16 md:py-20 px-6 md:px-10 lg:px-16 text-white" style={{ backgroundColor: '#3C2F1F' }}>
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 items-start">
                    
                    {/* Col 1: Address & Site Info */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-6 h-0.5" style={{ backgroundColor: '#E6A229' }} />
                            <span className="text-[10px] font-bold tracking-[0.4em] uppercase" style={{ color: '#E6A229' }}>
                                Liên Hệ
                            </span>
                        </div>
                        <h3 
                            className="text-xl font-bold mb-4"
                            style={{ fontFamily: 'Merriweather, Georgia, serif', color: '#FFF9F0' }}
                        >
                            {siteName || 'Văn Phòng Chi nhánh'}
                        </h3>
                        <p className="text-sm leading-relaxed mb-6 opacity-60 max-w-xs">
                            {address}
                        </p>
                        <div className="flex flex-col gap-2 text-xs opacity-80">
                            <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#E6A229' }} />
                                {phone}
                            </a>
                            <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#E6A229' }} />
                                {email}
                            </a>
                        </div>
                    </div>

                    {/* Col 2: Service Hours (Giờ lễ) */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-6 h-0.5" style={{ backgroundColor: '#E6A229' }} />
                            <span className="text-[10px] font-bold tracking-[0.4em] uppercase" style={{ color: '#E6A229' }}>
                                Thời Khóa
                            </span>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex justify-between items-baseline border-b border-white/5 pb-2">
                                <span className="text-sm font-semibold" style={{ color: '#FFF9F0' }}>Tụng Kinh Sáng</span>
                                <span className="text-xs opacity-60">04:30 - 05:30</span>
                            </li>
                            <li className="flex justify-between items-baseline border-b border-white/5 pb-2">
                                <span className="text-sm font-semibold" style={{ color: '#FFF9F0' }}>Thụ Phạn (Đặt Bát)</span>
                                <span className="text-xs opacity-60">10:30 - 11:30</span>
                            </li>
                            <li className="flex justify-between items-baseline border-b border-white/5 pb-2">
                                <span className="text-sm font-semibold" style={{ color: '#FFF9F0' }}>Hành Thiền</span>
                                <span className="text-xs opacity-60">18:00 - 19:30</span>
                            </li>
                            <li className="flex justify-between items-baseline border-b border-white/5 pb-2">
                                <span className="text-sm font-semibold" style={{ color: '#FFF9F0' }}>Tụng Kinh Tối</span>
                                <span className="text-xs opacity-60">19:30 - 20:30</span>
                            </li>
                        </ul>
                    </div>

                    {/* Col 3: Call to Action (Vàng chi nhánh) */}
                    <div className="flex flex-col items-center md:items-end">
                        <div className="bg-white/5 p-8 text-center md:text-right w-full border border-white/10 relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 
                                    className="text-lg font-bold mb-3"
                                    style={{ fontFamily: 'Merriweather, Georgia, serif', color: '#FFF9F0' }}
                                >
                                    Đóng Góp Thanh toán
                                </h3>
                                <p className="text-[11px] leading-relaxed mb-6 opacity-60">
                                    Mọi sự đóng góp của quý vị đều góp phần duy trì và phát triển đạo tràng, hoằng dương Phật pháp.
                                </p>
                                <Link 
                                    href="/transactions"
                                    className="inline-flex items-center gap-3 px-8 py-3 text-[10px] font-bold tracking-[0.3em] uppercase transition-all hover:scale-105 duration-200"
                                    style={{ backgroundColor: '#E6A229', color: '#3C2F1F' }}
                                >
                                    Phát Tâm Đóng góp
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </Link>
                            </div>
                            
                            {/* Decorative elements */}
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 border border-white/5 rotate-45 pointer-events-none" />
                        </div>
                    </div>

                </div>
                
                {/* Copyright info */}
                <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-medium tracking-widest uppercase opacity-30">
                    <span>© {new Date().getFullYear()} {siteName}. All Rights Reserved.</span>
                    <div className="flex gap-6">
                        <Link href="/privacy">Quy định bảo mật</Link>
                        <Link href="/terms">Điều khoản sử dụng</Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
