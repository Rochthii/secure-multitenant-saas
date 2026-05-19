'use client';
import React from 'react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const Lantern = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
    <div className={cn("absolute animate-bounce-slow opacity-40", className)} style={style}>
        <div className="relative w-10 h-14 bg-[#FF4D6D] rounded-t-xl rounded-b-lg shadow-[0_0_20px_rgba(255,77,109,0.4)] border border-[#FFD700]/30">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-[#FFD700]/50 rounded-full"></div>
            <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-6 h-[15px] bg-[#FF4D6D] rounded-sm opacity-90"></div>
            <div className="absolute bottom-[-12px] left-1/2 -translate-x-1/2 w-[3px] h-4 bg-[#FF4D6D] opacity-70"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
        </div>
    </div>
);

export function FestivalTransactionCTA({ modulesConfig }: { modulesConfig?: Record<string, boolean> }) {
    if (modulesConfig?.transactions === false) return null;
    return (
        <section className="py-24 px-6 lg:px-16 overflow-hidden relative">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#12023A] via-[#1a0b3f] to-[#2d0a4e]" />

            {/* Hanging Lanterns */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-20px] left-[10%] w-[1px] h-32 bg-[#FFD700]/20" />
                <Lantern className="top-[100px] left-[10%] -translate-x-1/2" style={{ animationDelay: '0s' }} />

                <div className="absolute top-[-20px] left-[25%] w-[1px] h-48 bg-[#FFD700]/20" />
                <Lantern className="top-[160px] left-[25%] -translate-x-1/2" style={{ animationDelay: '1.2s', transform: 'scale(0.8) translateX(-50%)' }} />

                <div className="absolute top-[-20px] right-[15%] w-[1px] h-40 bg-[#FFD700]/20" />
                <Lantern className="top-[120px] right-[15%] translate-x-1/2" style={{ animationDelay: '0.6s', transform: 'scale(1.1) translateX(50%)' }} />

                <div className="absolute top-[-20px] right-[35%] w-[1px] h-36 bg-[#FFD700]/20" />
                <Lantern className="top-[110px] right-[35%] translate-x-1/2" style={{ animationDelay: '1.8s', transform: 'scale(0.7) translateX(50%)' }} />
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto relative z-10 text-center">
                <span className="inline-block px-5 py-2 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-[11px] font-black uppercase tracking-[0.3em] mb-8 shadow-[0_0_20px_rgba(255,215,0,0.1)]">
                    Gieo Duyên Thanh toán
                </span>

                <h2 className="text-4xl lg:text-7xl font-black text-white mb-8 leading-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                    Chung Tay Gìn Giữ<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FF4D6D] to-[#39D5A0]">Sắc Màu Phum Sóc</span>
                </h2>

                <p className="text-lg lg:text-xl text-white/70 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                    Mỗi đóng góp của quý Nhân sự là một viên gạch, một nén nhang góp phần duy trì và phát triển các hoạt động văn hóa, lễ hội truyền thống tại bản tự.
                </p>

                <div className="flex flex-wrap gap-6 justify-center">
                    <Link
                        href="/transactions"
                        className="px-10 py-5 rounded-2xl bg-[#FF4D6D] text-white font-black uppercase tracking-widest text-[14px] hover:scale-110 transition-all shadow-[0_20px_50px_rgba(255,77,109,0.3)] hover:shadow-[0_20px_60px_rgba(255,77,109,0.5)] animate-glow"
                    >
                        Đóng góp Ngay
                    </Link>
                    <Link
                        href="/transactions/du-an"
                        className="px-10 py-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-widest text-[14px] border border-white/20 backdrop-blur-md transition-all"
                    >
                        Xem Các Dự Án
                    </Link>
                </div>
            </div>

            {/* Bottom Glow */}
            <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#39D5A0]/10 blur-[120px] rounded-full pointer-events-none" />
        </section>
    );
}
