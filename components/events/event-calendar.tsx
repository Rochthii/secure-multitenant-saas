'use client';

import React from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { vi };

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

interface EventCalendarProps {
    events: CalendarEvent[];
}

const messages = {
    allDay: 'Cả ngày',
    previous: 'Trước',
    next: 'Sau',
    today: 'Hôm nay',
    month: 'Tháng',
    week: 'Tuần',
    day: 'Ngày',
    agenda: 'Lịch trình',
    date: 'Ngày',
    time: 'Thời gian',
    event: 'Sự kiện',
    noEventsInRange: 'Không có sự kiện nào trong khoảng thời gian này',
    showMore: (total: number) => `+ Xem thêm ${total}`,
};

export function EventCalendar({ events }: EventCalendarProps) {
    const router = useRouter();
    const [view, setView] = React.useState<View>('month');

    const eventStyleGetter = (event: CalendarEvent) => {
        const colors = {
            upcoming: { backgroundColor: '#F59E0B', color: '#fff' },
            ongoing: { backgroundColor: '#10B981', color: '#fff' },
            completed: { backgroundColor: '#6B7280', color: '#fff' },
            cancelled: { backgroundColor: '#EF4444', color: '#fff' },
        };

        return {
            style: {
                ...colors[event.status],
                borderRadius: '4px',
                border: 'none',
                display: 'block',
                fontSize: '13px',
                padding: '2px 5px',
            },
        };
    };

    const handleSelectEvent = (event: CalendarEvent) => {
        router.push(`/lich-le/${event.id}`);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 calendar-container">
            <style jsx global>{`
        .rbc-calendar {
          font-family: inherit;
          min-height: 500px;
        }
        .rbc-toolbar {
          margin-bottom: 20px;
        }
        .rbc-toolbar button {
          color: #374151;
          border: 1px solid #D1D5DB;
          padding: 8px 16px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .rbc-toolbar button:hover {
          background: #F59E0B;
          color: white;
          border-color: #F59E0B;
        }
        .rbc-toolbar button.rbc-active {
          background: #F59E0B;
          color: white;
          border-color: #F59E0B;
        }
        .rbc-header {
          padding: 12px 0;
          font-weight: 600;
          color: #1F2937;
          border-bottom: 2px solid #F59E0B;
        }
        .rbc-today {
          background-color: #FEF3C7;
        }
        .rbc-event {
          cursor: pointer;
        }
        .rbc-event:hover {
          opacity: 0.9;
        }
        @media (max-width: 768px) {
          .rbc-calendar {
            min-height: 400px;
          }
          .rbc-toolbar {
            flex-direction: column;
            gap: 10px;
          }
          .rbc-toolbar-label {
            order: -1;
            margin-bottom: 10px;
          }
        }
      `}</style>

            <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                culture="vi"
                messages={messages}
                view={view}
                onView={setView}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                style={{ height: '700px' }}
                views={['month', 'week', 'day']}
            />
        </div>
    );
}
