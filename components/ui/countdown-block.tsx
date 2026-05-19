'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
// @ts-ignore
import { fromGregorian, format as formatKhmer } from '@thyrith/momentkh';
import { Link } from '@/i18n/routing';
import { getVietnamTime, getVietnamDateString } from '@/lib/utils/date';

interface Event {
    id: string;
    title_vi: string;
    start_date: string;
    thumbnail_url: string | null;
    is_major_festival: boolean;
}

export function CountdownBlock({ tenantId, initialData }: { tenantId?: string; initialData?: Event }) {
    const [nextFestival, setNextFestival] = useState<Event | null>(initialData || null);
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

    // Fetch the next major festival if not provided as prop
    useEffect(() => {
        if (initialData) return;
        const fetchNextFestival = async () => {
            const supabase = createClient();
            const today = getVietnamDateString();

            let query = supabase
                .from('events')
                .select('*')
                .eq('approval_status', 'approved')
                .eq('is_major_festival', true)
                .gte('start_date', today);

            if (tenantId) {
                query = query.eq('tenant_id', tenantId);
            }

            const { data } = await query
                .order('start_date', { ascending: true })
                .limit(1)
                .maybeSingle();

            if (data) {
                setNextFestival(data as any);
            }
        };

        fetchNextFestival();
    }, [tenantId]);

    // Countdown Timer Logic
    useEffect(() => {
        if (!nextFestival) return;

        const updateTimer = () => {
            const now = getVietnamTime();
            // nextFestival.start_date is YYYY-MM-DD
            // Constructing date this way interprets it as local (Vietnam) time
            const dateParts = nextFestival.start_date.split('-');
            const target = new Date(
                parseInt(dateParts[0]),
                parseInt(dateParts[1]) - 1,
                parseInt(dateParts[2]),
                0, 0, 0
            );

            if (now >= target) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return false; // Stop timer
            }

            // Using pure math for cleaner countdown values
            const diff = target.getTime() - now.getTime();

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });
            return true; // Continue timer
        };

        // Initial calculation
        const shouldContinue = updateTimer();
        if (!shouldContinue) return;

        const timer = setInterval(() => {
            const stillRunning = updateTimer();
            if (!stillRunning) clearInterval(timer);
        }, 1000);

        return () => clearInterval(timer);
    }, [nextFestival]);

    if (!nextFestival || !timeLeft) return null;

    const khmerDate = fromGregorian(
        new Date(nextFestival.start_date).getFullYear(),
        new Date(nextFestival.start_date).getMonth() + 1,
        new Date(nextFestival.start_date).getDate()
    );

    return (
        <Link href={`/lich-le/${nextFestival.id}`} className="block relative rounded-2xl overflow-hidden mb-8 shadow-2xl border border-gold-primary/20 group min-h-[220px]">
            {/* Background */}
            <div className="absolute inset-0">
                {nextFestival.thumbnail_url ? (
                    <img
                        src={nextFestival.thumbnail_url}
                        alt={nextFestival.title_vi}
                        className="w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-[#1a0a0e]">
                        {/* Radial warm glow */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,_#6B1B28_0%,_transparent_65%)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,_#2c0d14_0%,_transparent_60%)]" />
                        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                )}
                {/* Overlay: dark left → semi-dark right, không transparent hoàn toàn */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
            </div>

            <div className="relative z-10 p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Left: Event Info */}
                <div className="flex-1 text-center md:text-left">
                    <div className="inline-block px-3 py-1 bg-gold-primary/20 backdrop-blur-md rounded-full border border-gold-primary/50 text-gold-light text-xs md:text-sm font-bold uppercase tracking-wider mb-4 animate-pulse">
                        Sự kiện trọng đại sắp tới
                    </div>
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold text-white mb-2 leading-tight">
                        {nextFestival.title_vi}
                    </h3>
                    <p className="text-gold-light text-lg mb-6 font-font-khmer opacity-90">
                        {formatKhmer(khmerDate, 'd N, m, e, b')}
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        <div className="flex items-center gap-2 text-sm text-gray-300 bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gold-light flex-shrink-0" aria-hidden="true">
                                {/* Dharma Wheel nhỏ — biểu tượng Phật giáo */}
                                <circle cx="12" cy="12" r="9" />
                                <circle cx="12" cy="12" r="2.5" />
                                <line x1="12" y1="3" x2="12" y2="9.5" />
                                <line x1="12" y1="14.5" x2="12" y2="21" />
                                <line x1="3" y1="12" x2="9.5" y2="12" />
                                <line x1="14.5" y1="12" x2="21" y2="12" />
                                <line x1="5.6" y1="5.6" x2="10.2" y2="10.2" />
                                <line x1="13.8" y1="13.8" x2="18.4" y2="18.4" />
                                <line x1="18.4" y1="5.6" x2="13.8" y2="10.2" />
                                <line x1="10.2" y1="13.8" x2="5.6" y2="18.4" />
                            </svg>
                            <span>{format(new Date(nextFestival.start_date), 'EEEE, dd/MM/yyyy', { locale: vi })}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Countdown Digits */}
                <div className="flex gap-4 md:gap-6">
                    <TimeUnit value={timeLeft.days} label="Ngày" />
                    <TimeUnit value={timeLeft.hours} label="Giờ" />
                    <TimeUnit value={timeLeft.minutes} label="Phút" />
                    <TimeUnit value={timeLeft.seconds} label="Giây" />
                </div>
            </div>
        </Link>
    );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 hover:bg-white/20 hover:border-gold-primary/50">
                <span className="text-2xl md:text-4xl font-bold font-mono text-gold-light tabular-nums">
                    {value.toString().padStart(2, '0')}
                </span>
            </div>
            <span className="text-xs md:text-sm text-gray-400 mt-2 uppercase tracking-widest font-medium">
                {label}
            </span>
        </div>
    );
}
