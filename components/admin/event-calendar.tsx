'use client';

import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';

const locales = {
    'vi': vi,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface EventCalendarProps {
    events: {
        id: string;
        title: string;
        start: string | Date; // Allow string
        end: string | Date;   // Allow string
        resource?: any;
    }[];
}

export function EventCalendar({ events }: EventCalendarProps) {
    const router = useRouter();
    const [view, setView] = useState<View>(Views.MONTH);

    // Parse dates if they are strings
    const parsedEvents = events.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
    }));

    const handleSelectEvent = (event: any) => {
        router.push(`/admin/events/${event.id}`);
    };

    const eventStyleGetter = (event: any, start: Date, end: Date, isSelected: boolean) => {
        let backgroundColor = '#3174ad';
        const status = event.resource?.status;

        if (status === 'upcoming') backgroundColor = '#2563eb'; // blue
        if (status === 'ongoing') backgroundColor = '#16a34a'; // green
        if (status === 'completed') backgroundColor = '#6b7280'; // gray
        if (status === 'cancelled') backgroundColor = '#dc2626'; // red
        if (event.resource?.category === 'festival') backgroundColor = '#d97706'; // gold/amber

        return {
            style: {
                backgroundColor,
                borderRadius: '4px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    return (
        <div className="h-full p-4 bg-white rounded-md shadow-sm">
            <Calendar
                localizer={localizer}
                events={parsedEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%', minHeight: '600px' }}
                views={['month', 'week', 'day', 'agenda']}
                view={view}
                onView={setView}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                culture='vi'
                messages={{
                    next: "Sau",
                    previous: "Trước",
                    today: "Hôm nay",
                    month: "Tháng",
                    week: "Tuần",
                    day: "Ngày",
                    agenda: "Lịch trình",
                    date: "Ngày",
                    time: "Thời gian",
                    event: "Sự kiện",
                    noEventsInRange: "Không có sự kiện nào trong khoảng thời gian này.",
                }}
            />
        </div>
    );
}
