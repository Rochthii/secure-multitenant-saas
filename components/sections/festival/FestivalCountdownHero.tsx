'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { getVietnamTime } from '@/lib/utils/date';

interface Slide { id: string; image_url?: string | null; title_vi?: string | null; subtitle_vi?: string | null; }

interface NextEvent {
    name: string;
    targetTime: number;
}

function getNextRam(monthsAhead = 1): number {
    const d = getVietnamTime();
    d.setDate(15);
    d.setMonth(d.getMonth() + monthsAhead);
    d.setHours(6, 0, 0, 0);
    if (d.getTime() < Date.now()) {
        d.setMonth(d.getMonth() + 1);
    }
    return d.getTime();
}

const Particle = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
    <div
        className={cn("absolute rounded-full bg-white/40 animate-pulse pointer-events-none", className)}
        style={{
            width: Math.random() * 4 + 2 + 'px',
            height: Math.random() * 4 + 2 + 'px',
            ...style
        }}
    />
);

export function FestivalCountdownHero({
    slides = [],
    settings = {},
    tenantId,
}: {
    slides?: Slide[];
    settings?: Record<string, string>;
    tenantId?: string;
}) {
    const slide = slides[0];
    const [nextEvent, setNextEvent] = useState<NextEvent>({ name: '...', targetTime: getNextRam() });
    const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
    const [particles, setParticles] = useState<any[]>([]);

    useEffect(() => {
        const p = Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 5}s`,
            duration: `${Math.random() * 10 + 10}s`,
            scale: Math.random() * 0.5 + 0.5
        }));
        setParticles(p);
    }, []);

    // ─── Lấy sự kiện sắp tới gần nhất từ DB ─────────────────────────────────
    useEffect(() => {
        const url = tenantId
            ? `/api/sections/news-events?tenantId=${tenantId}`
            : '/api/sections/news-events';

        fetch(url)
            .then(r => r.json())
            .then(data => {
                const now = Date.now();
                const upcoming = (data.events || [])
                    .filter((e: any) => e.start_date && new Date(e.start_date).getTime() > now)
                    .sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

                if (upcoming.length > 0) {
                    const ev = upcoming[0];
                    setNextEvent({
                        name: ev.title_vi || ev.title || 'Lễ Sắp Tới',
                        targetTime: new Date(ev.start_date).getTime(),
                    });
                } else {
                    // Fallback: Rằm tháng tới nếu không có sự kiện
                    setNextEvent({ name: 'Rằm Tháng Tới', targetTime: getNextRam() });
                }
            })
            .catch(() => {
                setNextEvent({ name: 'Rằm Tháng Tới', targetTime: getNextRam() });
            });
    }, [tenantId]);

    // ─── Tick đồng hồ đếm ngược ──────────────────────────────────────────────
    useEffect(() => {
        const iv = setInterval(() => {
            const dist = nextEvent.targetTime - Date.now();
            if (dist <= 0) {
                setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
                clearInterval(iv);
                return;
            }
            setTimeLeft({
                d: Math.floor(dist / (1000 * 60 * 60 * 24)),
                h: Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                m: Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((dist % (1000 * 60)) / 1000),
            });
        }, 1000);
        return () => clearInterval(iv);
    }, [nextEvent.targetTime]);

    return (
        <section className="relative h-[85vh] min-h-[600px] flex flex-col items-center justify-center p-6 lg:p-16 overflow-hidden bg-pink-950">
            {/* Background */}
            {slide?.image_url ? (
                <div className="absolute inset-0 z-0 text-white">
                    <Image 
                        src={slide.image_url} 
                        alt="" 
                        fill 
                        className="object-cover opacity-40" 
                        priority 
                        sizes="100vw"
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-950/90 to-transparent" />
                </div>
            ) : (
                <div className="absolute inset-0 z-0 bg-pink-900" />
            )}

            {/* Content Container */}
            <div className="relative z-20 text-center flex flex-col items-center max-w-4xl mx-auto text-white">
                <span className="text-[10px] uppercase tracking-[0.4em] font-black text-pink-300 mb-8 flex items-center gap-3">
                    <span className="w-8 h-px bg-pink-300/30" />
                    Upcoming · {nextEvent.name}
                    <span className="w-8 h-px bg-pink-300/30" />
                </span>

                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black mb-8 leading-[1.1] uppercase tracking-tight">
                    {slide?.title_vi || settings['site_name_vi'] || 'Lễ Hội Khmer'}
                </h1>

                {/* Simplified Countdown Boxes */}
                <div className="flex gap-4 sm:gap-8 mb-12">
                    {[
                        { label: 'Ngày', v: timeLeft.d },
                        { label: 'Giờ', v: timeLeft.h },
                        { label: 'Phút', v: timeLeft.m },
                        { label: 'Giây', v: timeLeft.s },
                    ].map((t, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="w-16 sm:w-24 h-16 sm:h-24 flex items-center justify-center bg-white/10 border border-white/20 rounded-xl relative">
                                <span className="text-3xl sm:text-5xl font-black tabular-nums">
                                    {t.v.toString().padStart(2, '0')}
                                </span>
                            </div>
                            <span className="text-[9px] uppercase tracking-widest font-bold mt-3 opacity-50">
                                {t.label}
                            </span>
                        </div>
                    ))}
                </div>

                <p className="max-w-xl text-lg opacity-80 font-light leading-relaxed mb-12 italic">
                    {slide?.subtitle_vi || settings['site_description_vi'] || 'Hòa vào không khí rộn rã cờ hoa, tiếng chiêng trống và những điệu múa truyền thống Khmer.'}
                </p>

                <div className="flex gap-4 flex-wrap justify-center">
                    <Link
                        href="/lich-le"
                        className="px-10 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs transition-colors hover:bg-pink-100"
                    >
                        Lịch Lễ
                    </Link>
                    <Link
                        href="/tin-tuc"
                        className="px-10 py-4 border border-white/30 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-colors"
                    >
                        Tin Tức
                    </Link>
                </div>
            </div>
        </section>
    );
}
