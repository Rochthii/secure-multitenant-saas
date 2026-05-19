'use client';

import React from 'react';
import { Link } from '@/i18n/routing';

/**
 * ModernMoonCTA — Call-to-action Transaction dạng "Vầng Trăng" cho Modern Layout.
 * Nền hình tròn phát sáng lớn + text overlay + nút donate.
 * Hoàn toàn CSS-based, không cần ảnh ngoài.
 */
export function ModernMoonCTA({ modulesConfig }: { modulesConfig?: Record<string, boolean> }) {
    if (modulesConfig?.transactions === false) return null;
    return (
        <section className="py-20 sm:py-32 px-4 relative overflow-hidden bg-black/5">
            <div className="max-w-4xl mx-auto text-center relative z-10">
                {/* Simplified Icon Circle */}
                <div className="relative inline-flex items-center justify-center mb-10">
                    <div
                        className="w-24 h-24 rounded-full flex items-center justify-center border-2"
                        style={{
                            borderColor: 'rgb(var(--theme-primary) / 0.2)',
                            backgroundColor: 'rgb(var(--theme-bg-start))'
                        }}
                    >
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor: 'rgb(var(--theme-primary) / 0.1)'
                            }}
                        >
                            {/* Lotus icon */}
                            <svg
                                className="w-9 h-9"
                                viewBox="0 0 24 24"
                                fill="none"
                                style={{ color: 'rgb(var(--theme-text))' }}
                            >
                                <path
                                    d="M12 22c-4.418 0-8-1.79-8-4 0-1.77 2.006-3.305 4.92-3.793C9.64 13.513 10.79 13 12 13s2.36.513 3.08 1.207C17.994 14.695 20 16.23 20 18c0 2.21-3.582 4-8 4z"
                                    fill="currentColor" opacity="0.7"
                                />
                                <path
                                    d="M12 14c0-4.418 1.79-8 4-8 1.105 0 2.087.67 2.793 1.748C20.243 8.56 21 10.185 21 12c0 1.105-.336 2.112-.878 2.912C18.505 13.343 15.404 12 12 12V14z"
                                    fill="currentColor" opacity="0.5"
                                />
                                <path
                                    d="M12 14c0-4.418-1.79-8-4-8-1.105 0-2.087.67-2.793 1.748C3.757 8.56 3 10.185 3 12c0 1.105.336 2.112.878 2.912C5.495 13.343 8.596 12 12 12V14z"
                                    fill="currentColor" opacity="0.5"
                                />
                                <path
                                    d="M12 3c0 4.418 0 9-0 9"
                                    stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" opacity="0.6"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Rings */}
                    <div
                        className="absolute inset-0 rounded-full animate-ping opacity-10"
                        style={{ border: '2px solid rgb(var(--theme-primary))' }}
                    />
                </div>

                {/* Text */}
                <p
                    className="text-[11px] font-bold uppercase tracking-[0.3em] mb-4"
                    style={{ color: 'rgb(var(--theme-primary))' }}
                >
                    Thanh toán
                </p>
                <h2
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5"
                    style={{ color: 'rgb(var(--theme-text))' }}
                >
                    Gieo Duyên Lành
                    <br />
                    <span style={{ color: 'rgb(var(--theme-primary))' }}>Cùng Chánh Pháp</span>
                </h2>
                <p
                    className="text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed"
                    style={{ color: 'rgb(var(--theme-text) / 0.65)' }}
                >
                    Mỗi đóng góp của bạn giúp duy trì ngôi già lam, hỗ trợ chư Tăng tu học
                    và lan toả Chánh Pháp đến cộng đồng.
                </p>

                {/* Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <Link
                        href="/transactions"
                        className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-bold text-[15px] transition-all duration-300 hover:-translate-y-0.5"
                        style={{
                            backgroundColor: 'rgb(var(--theme-primary))',
                            color: 'rgb(var(--theme-hero))'
                        }}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                        Đóng góp Ngay
                    </Link>
                    <Link
                        href="/transactions/cong-duc-ghi-danh"
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-[15px] transition-all duration-300 hover:-translate-y-0.5"
                        style={{
                            border: '1.5px solid rgb(var(--theme-primary) / 0.4)',
                            color: 'rgb(var(--theme-text))',
                        }}
                    >
                        Xem Thành tích Ghi Danh
                    </Link>
                </div>
            </div>
        </section>
    );
}
