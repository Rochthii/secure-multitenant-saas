'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const EventCalendar = dynamic(
    () => import('./event-calendar').then(m => m.EventCalendar),
    { ssr: false }
);

interface CalendarPageClientProps {
    events: any[];
}

export default function CalendarPageClient({ events }: CalendarPageClientProps) {
    return (
        <div className="h-[700px]">
            <EventCalendar events={events} />
        </div>
    );
}
