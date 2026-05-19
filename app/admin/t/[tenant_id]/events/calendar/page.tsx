import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';

// Lazy-load react-big-calendar — it's 200KB+ and imports its own CSS.
// Lazy-load react-big-calendar — it's 200KB+ and imports its own CSS.
// Dynamic import means the CSS is code-split and only loaded on this page.
import CalendarPageClient from '@/components/admin/calendar-page-client';

export default async function EventCalendarPage({ params }: { params: Promise<{ tenant_id: string }> }) {
    const { tenant_id } = await params;
    const base = `/admin/t/${tenant_id}`;
    const supabase = await createClient();
    const { data: events } = await supabase
        .from('events')
        .select('id, title_vi, start_date, end_date, category, status')
        .eq('tenant_id', tenant_id);

    // Transform events for calendar
    // @ts-ignore
    const calendarEvents = events?.map((event: any) => ({
        id: event.id,
        title: event.title_vi,
        start: event.start_date,
        end: event.end_date || event.start_date,
        resource: {
            category: event.category,
            status: event.status
        }
    })) || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-playfair font-bold text-gray-900">Lịch sự kiện</h1>
                    <p className="text-gray-500 mt-1">Xem và quản lý sự kiện theo lịch.</p>
                </div>
                <div className="flex gap-2">
                    <Link href={`${base}/events`}>
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Danh sách
                        </Button>
                    </Link>
                    <Link href={`${base}/events/new`}>
                        <Button className="bg-gold-primary hover:bg-gold-dark">
                            <Plus className="mr-2 h-4 w-4" />
                            Tạo sự kiện
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <CalendarPageClient events={calendarEvents} />
                </CardContent>
            </Card>
        </div>
    );
}
