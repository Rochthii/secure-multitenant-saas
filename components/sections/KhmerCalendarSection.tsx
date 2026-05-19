'use client';

import React, { useEffect, useState } from 'react';
// @ts-ignore
import { fromDate as fromKhmerDate, format as formatKhmer } from '@thyrith/momentkh';
import { format as formatGregorian } from 'date-fns';
import { vi } from 'date-fns/locale';
// Buddhist-themed SVG icons — không dùng lucide
const IconPrev = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" />
    </svg>
);

const IconNext = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
        <path d="M9 18l6-6-6-6" />
    </svg>
);

// Dharma Wheel (Dhammacakka) — biểu tượng Phật giáo
const IconDharmaWheel = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="2.5" />
        {/* 8 spokes — Bát Chánh Đạo */}
        <line x1="12" y1="3" x2="12" y2="9.5" />
        <line x1="12" y1="14.5" x2="12" y2="21" />
        <line x1="3" y1="12" x2="9.5" y2="12" />
        <line x1="14.5" y1="12" x2="21" y2="12" />
        <line x1="5.6" y1="5.6" x2="10.2" y2="10.2" />
        <line x1="13.8" y1="13.8" x2="18.4" y2="18.4" />
        <line x1="18.4" y1="5.6" x2="13.8" y2="10.2" />
        <line x1="10.2" y1="13.8" x2="5.6" y2="18.4" />
    </svg>
);
import { addMonths } from 'date-fns';
import { CalendarGrid } from '@/components/ui/calendar-grid';
import { createClient } from '@/lib/supabase/client';
import { CountdownBlock } from '@/components/ui/countdown-block';

interface Props {
    initialEvents?: any[];
    upcomingEvents?: any[];
    nextMajorFestival?: any;
    tenantId?: string;
    customTitle?: string;
    customSubtitle?: string;
}

import { getVietnamTime } from '@/lib/utils/date';

// ... (lines skip)
export function KhmerCalendarSection({ initialEvents = [], upcomingEvents = [], nextMajorFestival, tenantId, customTitle, customSubtitle }: Props) {
    const [currentDate, setCurrentDate] = useState(getVietnamTime());
    const [events, setEvents] = useState(initialEvents);
    const [dateInfo, setDateInfo] = useState<{
        gregorian: string;
        lunarDate: string;
        lunarMonth: string;
        lunarYear: string;
        beYear: string;
    } | null>(null);

    // Fetch events when month changes
    useEffect(() => {
        const vnNow = getVietnamTime();
        // Skip fetch if we have initialEvents and looking at current month
        const isCurrentMonth = currentDate.getMonth() === vnNow.getMonth() &&
            currentDate.getFullYear() === vnNow.getFullYear();

        if (isCurrentMonth && initialEvents.length > 0 && events === initialEvents) {
            return;
        }

        const fetchEvents = async () => {
            const supabase = createClient();
            // Lấy YYYY-MM-DD strings an toàn theo giờ VN
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            const startStr = formatGregorian(startOfMonth, 'yyyy-MM-dd');
            const endStr = formatGregorian(endOfMonth, 'yyyy-MM-dd');

            let query = supabase
                .from('events')
                .select('*')
                .or('approval_status.eq.approved,status.eq.published') // Fallback compatible
                .gte('start_date', startStr)
                .lte('start_date', endStr);

            if (tenantId) {
                // Fetch events specifically for this tenant OR global root tenant OR broadcasted to this tenant
                query = query.or(`tenant_id.eq.${tenantId},tenant_id.eq.55555555-5555-5555-5555-555555555555,published_to.cs.{${tenantId}}`);
            }

            const { data } = await query;

            if (data) setEvents(data as any);
        };
        fetchEvents();
    }, [currentDate, tenantId]);

    useEffect(() => {
        const khmerDate = fromKhmerDate(currentDate);
        setDateInfo({
            gregorian: formatGregorian(currentDate, 'dd MMMM yyyy', { locale: vi }),
            lunarDate: `${formatKhmer(khmerDate, 'd')} ${formatKhmer(khmerDate, 'N')}`,
            lunarMonth: formatKhmer(khmerDate, 'm'),
            lunarYear: formatKhmer(khmerDate, 'e'),
            beYear: formatKhmer(khmerDate, 'b'),
        });
    }, [currentDate]);

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => addMonths(prev, offset));
    };

    const goToToday = () => {
        setCurrentDate(getVietnamTime());
    };

    if (!dateInfo) return null;

    return (
        <section className="bg-page-surface py-12 sm:py-16 lg:py-20 relative overflow-hidden">

            {/* Top gold rule */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-primary/50 to-transparent" />

            <div className="relative z-10 container mx-auto px-4">

                {/* Section header */}
                <div className="text-center mb-8 lg:mb-12">
                    <p className="text-gold-primary text-xs font-semibold tracking-[0.25em] uppercase mb-3">
                        ប្រតិទិន · Lịch Khmer
                    </p>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-playfair font-bold text-coffee-dark mb-4">
                        {customTitle || 'Sự Kiện & Lịch Lễ'}
                    </h2>
                    {customSubtitle && (
                        <p className="text-stone-500 italic mt-2 text-sm sm:text-base">{customSubtitle}</p>
                    )}
                    <div className="w-12 h-0.5 bg-gold-primary mx-auto" />
                </div>

                {/* Countdown block */}
                <CountdownBlock tenantId={tenantId} initialData={nextMajorFestival} />

                {/* Calendar card */}
                <div className="mt-8 lg:mt-12 bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden">

                    {/* Calendar header */}
                    <div className="bg-coffee-dark px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">

                        {/* Khmer date info */}
                        <div className="text-center sm:text-left">
                            <p className="text-gold-light text-xs tracking-widest uppercase opacity-70 mb-0.5">
                                {dateInfo.lunarDate} · {dateInfo.lunarMonth}
                            </p>
                            <p className="text-white font-playfair font-semibold text-lg">
                                {dateInfo.gregorian}
                            </p>
                            <p className="text-gold-light/60 text-xs mt-0.5">
                                Phật lịch {dateInfo.beYear} · {dateInfo.lunarYear}
                            </p>
                        </div>

                        {/* Month navigation */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => changeMonth(-1)}
                                className="w-11 h-11 flex items-center justify-center rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
                                aria-label="Tháng trước"
                            >
                                <IconPrev />
                            </button>

                            <span className="font-playfair font-bold text-white text-base min-w-[160px] text-center">
                                Tháng {currentDate.getMonth() + 1} / {currentDate.getFullYear()}
                            </span>

                            <button
                                onClick={() => changeMonth(1)}
                                className="w-11 h-11 flex items-center justify-center rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
                                aria-label="Tháng sau"
                            >
                                <IconNext />
                            </button>

                            <button
                                onClick={goToToday}
                                className="ml-2 px-4 py-2 rounded-lg bg-gold-primary text-white text-xs font-semibold hover:bg-gold-dark transition-colors flex items-center gap-1.5"
                                aria-label="Hôm nay"
                            >
                                <IconDharmaWheel />
                                Hôm nay
                            </button>
                        </div>
                    </div>

                    {/* Gold divider line */}
                    <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-primary/40 to-transparent" />

                    {/* Calendar grid */}
                    {/* Calendar grid - Desktop vs Mobile */}
                    <div className="p-4 sm:p-6">
                        {/* Mobile Simplified View */}
                        <div className="lg:hidden">
                            <div className="bg-gold-primary/5 rounded-xl p-4 border border-gold-primary/10 mb-4 text-center">
                                <h4 className="text-coffee-dark font-bold font-playfair mb-2">Hôm nay</h4>
                                <div className="text-4xl font-bold text-gold-primary mb-1">{currentDate.getDate()}</div>
                                <div className="text-stone-600 mb-3">Tháng {currentDate.getMonth() + 1}, {currentDate.getFullYear()}</div>
                                <div className="text-sm text-stone-500 border-t border-gold-primary/10 pt-2 mt-2">
                                    {dateInfo.lunarDate} · {dateInfo.lunarMonth}
                                </div>
                            </div>

                            {/* Calendar Grid - simplified visuals for mobile or just standard grid if it fits */}
                            {/* We keep the grid but maybe simpler? Actually the grid is already responsive-ish. 
                                Let's just trust the grid but ensure it doesn't break. 
                                The user requested a "Mobile specific view (simplified)".
                                Let's hide the grid on very small screens and show a list of events if any?
                            */}
                            <CalendarGrid
                                currentMonth={currentDate}
                                onMonthChange={setCurrentDate}
                                events={events}
                                upcomingEvents={upcomingEvents}
                            />
                        </div>

                        {/* Desktop View */}
                        <div className="hidden lg:block">
                            <CalendarGrid
                                currentMonth={currentDate}
                                onMonthChange={setCurrentDate}
                                events={events}
                                upcomingEvents={upcomingEvents}
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom gold rule */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-primary/50 to-transparent" />
        </section>
    );
}
