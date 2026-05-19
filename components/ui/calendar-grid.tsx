'use client';

import React, { useState, useMemo } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    isPast,
    isFuture
} from 'date-fns';
import { vi } from 'date-fns/locale';
// Không dùng lucide — dùng SVG inline
import { getKhmerLunarDate, formatKhmerDate, getMoonPhaseShort, isHolyDay as isKhmerHolyDay } from '@/lib/utils/khmer-lunar-calendar';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { getVietnamTime } from '@/lib/utils/date';

interface Event {
    id: string;
    title_vi: string;
    title_km?: string | null;
    start_date: string;
    start_time?: string | null;
    end_time?: string | null;
    location?: string | null;
    location_km?: string | null;
    status: string;
    slug?: string | null;
    is_major_festival?: boolean | null;
    event_type?: string | null;
}

export interface CalendarGridProps {
    events: Event[];
    upcomingEvents?: Event[];
    currentMonth?: Date;
    onMonthChange?: (date: Date) => void;
    initialSelectedDate?: Date;
}

export function CalendarGrid({ events, upcomingEvents = [], currentMonth: controlledMonth, onMonthChange, initialSelectedDate }: CalendarGridProps) {
    const [internalMonth, setInternalMonth] = useState(() => getVietnamTime());
    const [selectedDate, setSelectedDate] = useState<Date>(() => initialSelectedDate || getVietnamTime());

    const currentMonth = controlledMonth || internalMonth;
    const setCurrentMonth = (date: Date) => {
        if (onMonthChange) {
            onMonthChange(date);
        } else {
            setInternalMonth(date);
        }
    };

    const days = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }); // Monday start
        const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const goToToday = () => {
        const today = getVietnamTime();
        setCurrentMonth(today);
        setSelectedDate(today);
    };

    // Filter events for the selected date
    const selectedDateEvents = events.filter(event =>
        isSameDay(new Date(event.start_date), selectedDate)
    );

    return (
        <div className="flex flex-col lg:flex-row gap-8 bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-8">

            {/* LEFT: CALENDAR GRID */}
            <div className="flex-1">
                {/* Header - Only show if not controlled externally */}
                {!controlledMonth && (
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold font-playfair text-[#8B2635] uppercase">
                            Tháng {format(currentMonth, 'M / yyyy', { locale: vi })}
                        </h3>
                        <div className="flex items-center gap-2">
                            <button onClick={prevMonth} className="p-2 hover:bg-gold-primary/10 rounded-full transition-colors text-gold-dark" aria-label="Previous month">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M15 18l-6-6 6-6" /></svg>
                            </button>
                            <button onClick={goToToday} className="text-sm font-medium px-3 py-1 border border-gold-primary/30 rounded-full hover:bg-gold-primary hover:text-white transition-colors text-gold-dark" aria-label="Go to today">
                                Hôm nay
                            </button>
                            <button onClick={nextMonth} className="p-2 hover:bg-gold-primary/10 rounded-full transition-colors text-gold-dark" aria-label="Next month">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9 18l6-6-6-6" /></svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Days Header */}
                <div className="grid grid-cols-7 mb-4">
                    {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, i) => (
                        <div key={day} className={cn(
                            "text-center text-sm font-bold uppercase",
                            i === 6 ? "text-red-500" : "text-gray-500"
                        )}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Enhanced Legend */}
                <div className="flex flex-wrap items-center gap-4 mb-6 text-xs bg-gradient-to-r from-[#FEF9F3] to-transparent p-3 rounded-lg border-l-4 border-gold-primary">
                    <div className="flex items-center gap-1.5 font-medium">
                        <span className="w-5 h-5 flex items-center justify-center bg-gradient-to-br from-gold-primary to-[#D4A860] text-white rounded text-[10px] font-bold">K</span>
                        <span className="text-gray-700">Kert (Trăng lên ↑)</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                        <span className="w-5 h-5 flex items-center justify-center bg-gradient-to-br from-[#8B2635] to-[#6B1B28] text-white rounded text-[10px] font-bold">R</span>
                        <span className="text-gray-700">Roch (Trăng xuống ↓)</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                        <svg className="w-4 h-4 text-[#ce1620]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L15 9L22 9.5L16.5 14.5L18 22L12 18L6 22L7.5 14.5L2 9.5L9 9L12 2Z" />
                            <circle cx="12" cy="12" r="2" fill="#FFD700" />
                        </svg>
                        <span className="text-gray-700">Lễ lớn</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                        <div className="w-3 h-3 rounded-full bg-gold-primary shadow-sm"></div>
                        <span className="text-gray-700">Sự kiện</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gold-primary" aria-hidden="true">
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
                        <span className="text-gray-700">Ngày trai (8, 15 âm)</span>
                    </div>
                </div>

                {/* Enhanced Days Grid */}
                <div className="grid grid-cols-7 gap-1 bg-transparent rounded-xl overflow-hidden">
                    {days.map((day, idx) => {
                        // Calculate Khmer Date using accurate astronomical calculation
                        const khmerDate = getKhmerLunarDate(day);
                        const lunarDay = khmerDate.day;
                        const moonPhaseShort = getMoonPhaseShort(khmerDate);
                        const isHolyDay = isKhmerHolyDay(khmerDate);

                        // Check for events
                        const dayEvents = events.filter(e => isSameDay(new Date(e.start_date), day));
                        const hasEvent = dayEvents.length > 0;
                        const hasMajorFestival = dayEvents.some(e => e.is_major_festival);
                        const eventCount = dayEvents.length;

                        const isSelected = isSameDay(day, selectedDate);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isDayToday = isToday(day);
                        const isWeekend = day.getDay() === 0;

                        return (
                            <button
                                key={day.toISOString()}
                                onClick={() => setSelectedDate(day)}
                                aria-label={`${format(day, 'd MMMM yyyy', { locale: vi })}${hasEvent ? `, ${eventCount} sự kiện` : ''}`}
                                className={cn(
                                    "relative h-20 sm:h-24 md:h-28 lg:h-24 xl:h-28 p-2 md:p-2.5 flex flex-col justify-between transition-all duration-300 text-left group rounded-lg overflow-hidden",
                                    // Base styles with gradient
                                    !isCurrentMonth && "bg-gradient-to-br from-gray-50 to-gray-100/50 text-gray-400 opacity-60",
                                    isCurrentMonth && "bg-gradient-to-br from-white to-gray-50/30 hover:shadow-lg hover:scale-105 hover:z-20",

                                    // Highlight Major Festival (Red/Gold gradient)
                                    isCurrentMonth && hasMajorFestival && "bg-gradient-to-br from-[#fff5f5] via-white to-[#fffef0] ring-2 ring-[#ce1620]/40 shadow-md",

                                    // Highlight Regular Event (Gold gradient)
                                    isCurrentMonth && hasEvent && !hasMajorFestival && "bg-gradient-to-br from-[#fffdf5] to-white ring-1 ring-gold-primary/30",

                                    // Selection Override with animation
                                    isSelected && "ring-4 ring-gold-primary shadow-2xl scale-110 z-30 bg-gradient-to-br from-gold-primary/20 to-white",

                                    // Today with pulse
                                    isDayToday && !isSelected && "bg-gradient-to-br from-gold-primary/15 to-gold-primary/5 font-bold ring-2 ring-gold-primary/50 animate-pulse"
                                )}
                            >
                                {/* Top Row: Date & Icons */}
                                <div className="flex justify-between items-start w-full mb-0.5">
                                    {/* Gregorian Day with better styling */}
                                    <span className={cn(
                                        "text-xl sm:text-2xl md:text-2xl lg:text-xl xl:text-2xl font-bold leading-none transition-all group-hover:scale-105",
                                        isWeekend ? "text-red-500 drop-shadow-sm" : "text-gray-800",
                                        hasMajorFestival && "text-[#ce1620] drop-shadow-lg",
                                        isDayToday && "text-gold-primary drop-shadow-md",
                                        !isCurrentMonth && "opacity-30"
                                    )}>
                                        {format(day, 'd')}
                                    </span>

                                    {/* Enhanced Event Indicators */}
                                    <div className="flex flex-col items-end gap-1">
                                        {hasMajorFestival && (
                                            <div title="Lễ lớn" className="relative">
                                                <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#ce1620] drop-shadow-sm animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 2L15 9L22 9.5L16.5 14.5L18 22L12 18L6 22L7.5 14.5L2 9.5L9 9L12 2Z" />
                                                    <circle cx="12" cy="12" r="2" fill="#FFD700" />
                                                </svg>
                                            </div>
                                        )}
                                        {/* Event count badge */}
                                        {eventCount > 0 && !hasMajorFestival && (
                                            <div className={cn(
                                                "w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full text-[9px] md:text-[10px] font-bold shadow-sm",
                                                isPast(day) ? "bg-gray-400 text-white" : "bg-gradient-to-br from-gold-primary to-[#D4A860] text-white animate-bounce"
                                            )} title={`${eventCount} sự kiện`}>
                                                {eventCount}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Holy Day Indicator (Middle) */}
                                {isHolyDay && isCurrentMonth && (
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20">
                                        <svg className="w-6 h-6 text-gold-primary" viewBox="0 0 24 24" fill="currentColor">
                                            <circle cx="12" cy="12" r="10" opacity="0.3" />
                                            <circle cx="12" cy="12" r="3" />
                                            {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
                                                <line key={angle} x1="12" y1="12" x2={12 + 7 * Math.cos(angle * Math.PI / 180)} y2={12 + 7 * Math.sin(angle * Math.PI / 180)} stroke="currentColor" strokeWidth="1.5" />
                                            ))}
                                        </svg>
                                    </div>
                                )}

                                {/* Enhanced Khmer Lunar Date */}
                                <div className={cn(
                                    "self-end text-right w-full",
                                    !isCurrentMonth && "opacity-30"
                                )}>
                                    <div className="flex items-center justify-end gap-1">
                                        {/* Moon phase badge */}
                                        <span className={cn(
                                            "w-4 h-4 flex items-center justify-center rounded text-[8px] md:text-[9px] font-bold shadow-sm",
                                            moonPhaseShort === 'k'
                                                ? "bg-gradient-to-br from-gold-primary to-[#D4A860] text-white"
                                                : "bg-gradient-to-br from-[#8B2635] to-[#6B1B28] text-white"
                                        )}>
                                            {moonPhaseShort === 'k' ? 'K' : 'R'}
                                        </span>
                                        {/* Lunar day */}
                                        <div className={cn(
                                            "text-[10px] md:text-xs font-bold font-font-khmer",
                                            hasMajorFestival ? "text-[#ce1620]" : isHolyDay ? "text-gold-primary" : "text-gray-600"
                                        )}>
                                            {lunarDay}
                                        </div>
                                    </div>
                                    {/* Month name - show more frequently */}
                                    {(lunarDay === 1 || lunarDay === 15 || idx === 0 || idx === 7) && (
                                        <div className="text-[8px] md:text-[9px] text-gold-dark font-semibold uppercase whitespace-nowrap truncate mt-0.5 tracking-wide">
                                            {khmerDate.month}
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* RIGHT: ENHANCED SELECTED DATE DETAILS */}
            <div className="lg:w-72 xl:w-80 border-l-2 border-gold-primary/30 lg:pl-6 flex flex-col min-h-[400px]">
                <div className="mb-4 bg-gradient-to-br from-[#FEF9F3] to-white p-4 rounded-xl border-2 border-gold-primary/20 shadow-lg">
                    {/* Day of week */}
                    <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-gold-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="3" y1="9" x2="21" y2="9" />
                            <line x1="9" y1="4" x2="9" y2="9" />
                            <line x1="15" y1="4" x2="15" y2="9" />
                            <circle cx="8" cy="14" r="1" fill="currentColor" />
                            <circle cx="12" cy="14" r="1" fill="currentColor" />
                            <circle cx="16" cy="14" r="1" fill="currentColor" />
                        </svg>
                        <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">
                            {format(selectedDate, 'EEEE', { locale: vi })}
                        </p>
                    </div>

                    {/* Gregorian date - compact */}
                    <h2 className="text-3xl md:text-4xl font-black text-transparent bg-gradient-to-r from-[#8B2635] via-[#A52A3A] to-[#8B2635] bg-clip-text mb-3 leading-tight">
                        {format(selectedDate, 'dd/MM/yyyy')}
                    </h2>

                    {/* Enhanced Khmer Lunar Date */}
                    <div className="flex items-start gap-2 py-3 px-3 border-y-2 border-dashed border-gold-primary/40 bg-white/60 rounded-lg">
                        <svg className="w-8 h-8 mt-0.5 text-gold-primary" viewBox="0 0 24 24" fill="currentColor">
                            {/* Crescent moon with lotus */}
                            <path d="M12 2C10.5 2 9 2.5 8 3.5C11 4 13 7 13 10C13 13 11 16 8 16.5C9 17.5 10.5 18 12 18C16.5 18 20 14.5 20 10C20 5.5 16.5 2 12 2Z" opacity="0.6" />
                            <path d="M12 20L11 22L10 20L8 21L9 19L7 18L9 17L8 15L10 16L11 14L12 16L14 15L13 17L15 18L13 19L14 21L12 20Z" />
                        </svg>
                        <div className="flex-1">
                            <p className="font-bold text-base text-gray-900 mb-1 font-font-khmer">
                                {(() => {
                                    const kDate = getKhmerLunarDate(selectedDate);
                                    return formatKhmerDate(kDate);
                                })()}
                            </p>
                            <p className="text-xs text-gray-600 font-medium">
                                Tháng {(() => {
                                    const kDate = getKhmerLunarDate(selectedDate);
                                    return kDate.month;
                                })()}
                            </p>
                            <p className="text-xs text-gold-dark font-semibold mt-1">
                                Phật Lịch {(() => {
                                    const kDate = getKhmerLunarDate(selectedDate);
                                    return kDate.buddhistYear;
                                })()}
                            </p>
                        </div>
                    </div>

                    {/* Today/Past/Future indicator */}
                    <div className="mt-3 text-center">
                        {isToday(selectedDate) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-gold-primary to-[#D4A860] text-white text-[10px] font-bold uppercase rounded-full shadow-sm">
                                ● Hôm nay
                            </span>
                        )}
                        {isPast(selectedDate) && !isToday(selectedDate) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-bold uppercase rounded-full">
                                Đã qua
                            </span>
                        )}
                        {isFuture(selectedDate) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-[#8B2635] to-[#6B1B28] text-white text-[10px] font-bold uppercase rounded-full shadow-sm">
                                ● Sắp tới
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-base flex items-center gap-2 text-[#8B2635]">
                            <span className="w-1 h-6 bg-gradient-to-b from-gold-primary to-[#D4A860] rounded-full shadow-sm" />
                            Sự kiện trong ngày
                        </h4>
                        {selectedDateEvents.length > 0 && (
                            <span className="px-2 py-0.5 bg-gold-primary text-white text-[10px] font-bold rounded-full">
                                {selectedDateEvents.length}
                            </span>
                        )}
                    </div>

                    {selectedDateEvents.length > 0 ? (
                        <div className="space-y-4">
                            {selectedDateEvents.map(event => {
                                const eventDate = new Date(event.start_date);
                                const isEventPast = isPast(eventDate);
                                const isEventToday = isToday(eventDate);

                                return (
                                    <Link
                                        key={event.id}
                                        href={event.slug ? `/lich-le/${event.slug}` : `/lich-le/${event.id}`}
                                        className="block group"
                                    >
                                        <div className={cn(
                                            "p-3 rounded-xl border-2 transition-all duration-300 relative overflow-hidden",
                                            isEventPast
                                                ? "bg-gray-50 border-gray-200 opacity-70"
                                                : "bg-gradient-to-br from-white to-[#FEF9F3]/30 border-gold-primary/30 shadow-lg hover:shadow-2xl hover:scale-[1.02] hover:border-gold-primary",
                                            event.is_major_festival && !isEventPast && "ring-2 ring-[#ce1620]/30 bg-gradient-to-br from-[#fff5f5] to-white"
                                        )}>
                                            {/* Major festival indicator */}
                                            {event.is_major_festival && (
                                                <div className="absolute top-2 right-2" title="Lễ lớn">
                                                    <svg className="w-4 h-4 text-[#ce1620] animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 2L15 9L22 9.5L16.5 14.5L18 22L12 18L6 22L7.5 14.5L2 9.5L9 9L12 2Z" />
                                                        <circle cx="12" cy="12" r="2" fill="#FFD700" />
                                                    </svg>
                                                </div>
                                            )}

                                            <h5 className={cn(
                                                "font-bold text-sm mb-2 pr-6 leading-snug transition-colors line-clamp-2",
                                                isEventPast ? "text-gray-600" : "text-gray-900 group-hover:text-[#8B2635]"
                                            )}>
                                                {event.title_vi}
                                            </h5>

                                            <div className="space-y-1.5">
                                                {/* Time */}
                                                {event.start_time && (
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                        <svg className="w-3.5 h-3.5 text-gold-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="9" />
                                                            <path d="M12 6v6l4 2" strokeLinecap="round" />
                                                        </svg>
                                                        <span className="font-semibold">
                                                            {event.start_time.slice(0, 5)}
                                                            {event.end_time && ` - ${event.end_time.slice(0, 5)}`}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Location */}
                                                {event.location && (
                                                    <div className="flex items-start gap-1.5 text-xs text-gray-600">
                                                        <svg className="w-3.5 h-3.5 text-gold-primary flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M12 2C8.5 2 5.5 5 5.5 8.5C5.5 12.5 12 22 12 22C12 22 18.5 12.5 18.5 8.5C18.5 5 15.5 2 12 2Z" />
                                                            <circle cx="12" cy="9" r="2.5" fill="white" />
                                                        </svg>
                                                        <span className="line-clamp-2">{event.location}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Status badges */}
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {isEventPast && (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-bold uppercase rounded-full">
                                                        Đã qua
                                                    </span>
                                                )}
                                                {isEventToday && !isEventPast && (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-gold-primary to-[#D4A860] text-white text-[10px] font-bold uppercase rounded-full shadow-sm animate-pulse">
                                                        ● Hôm nay
                                                    </span>
                                                )}
                                                {event.event_type && (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 bg-[#8B2635]/10 text-[#8B2635] text-[10px] font-semibold rounded-full border border-[#8B2635]/20">
                                                        {event.event_type}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : upcomingEvents.length > 0 ? (
                        <div className="space-y-4">
                            <div className="bg-gold-primary/5 p-3 rounded-lg border border-gold-primary/20 mb-2">
                                <p className="text-[10px] font-bold text-gold-dark uppercase tracking-widest text-center">
                                    Gợi ý sự kiện sắp diễn ra
                                </p>
                            </div>
                            {upcomingEvents.map(event => {
                                const eventDate = new Date(event.start_date);
                                const isEventToday = isToday(eventDate);

                                return (
                                    <Link
                                        key={event.id}
                                        href={event.slug ? `/lich-le/${event.slug}` : `/lich-le/${event.id}`}
                                        className="block group"
                                    >
                                        <div className={cn(
                                            "p-3 rounded-xl border-2 transition-all duration-300 relative overflow-hidden bg-white border-gold-primary/10 shadow-sm hover:shadow-md hover:border-gold-primary/40",
                                            event.is_major_festival && "bg-gradient-to-br from-[#fff5f5] to-white ring-1 ring-[#ce1620]/20"
                                        )}>
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-[10px] font-bold text-gray-500">
                                                    {format(eventDate, 'dd/MM/yyyy')}
                                                </p>
                                                {event.is_major_festival && (
                                                    <svg className="w-3 h-3 text-[#ce1620]" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 2L15 9L22 9.5L16.5 14.5L18 22L12 18L6 22L7.5 14.5L2 9.5L9 9L12 2Z" />
                                                    </svg>
                                                )}
                                            </div>

                                            <h5 className="font-bold text-xs mb-1.5 text-gray-900 group-hover:text-[#8B2635] line-clamp-1">
                                                {event.title_vi}
                                            </h5>

                                            <div className="flex items-center gap-2 mt-1">
                                                {isEventToday && (
                                                    <span className="px-1.5 py-0.5 bg-gold-primary text-white text-[8px] font-bold uppercase rounded-full">
                                                        Hôm nay
                                                    </span>
                                                )}
                                                {event.event_type && (
                                                    <span className="text-[8px] font-semibold text-[#8B2635]">
                                                        #{event.event_type}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-400 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-200">
                            <svg className="w-12 h-12 mx-auto mb-2 text-gold-primary/30" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C10 4 9 6 9 8C9 10 10 12 12 14C14 12 15 10 15 8C15 6 14 4 12 2Z" />
                                <path d="M12 14C10 16 9 18 9 20C9 22 10.5 23 12 23C13.5 23 15 22 15 20C15 18 14 16 12 14Z" />
                                <ellipse cx="12" cy="14" rx="8" ry="3" opacity="0.3" />
                            </svg>
                            <p className="font-medium text-gray-500 text-sm">Không có sự kiện nào</p>
                            <p className="text-xs text-gray-400 mt-0.5">Chọn ngày khác để xem</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
