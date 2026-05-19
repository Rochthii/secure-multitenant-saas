'use client';
import React, { useEffect, useRef, useState } from 'react';

// Angkor History Timeline (scroll ngang lịch sử / các dự án)
interface AngkorHistoryTimelineProps { tenantId: string; }

export function AngkorHistoryTimeline({ tenantId }: AngkorHistoryTimelineProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [events, setEvents] = useState<any[] | null>(null);

    useEffect(() => {
        // Tái hiện Intersection + Session cache
        const cacheRaw = sessionStorage.getItem('cache_angkor_timeline');
        if (cacheRaw) {
            const parsed = JSON.parse(cacheRaw);
            if (Date.now() - parsed.fetchedAt < 600000) {
                setEvents(parsed.events);
                return;
            }
        }

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                observer.disconnect();
                // Fetch events
                fetch(`/api/sections/news-events?tenantId=${tenantId}`)
                    .then(res => res.json())
                    .then(data => {
                        const items = data.events || [];
                        setEvents(items);
                        sessionStorage.setItem('cache_angkor_timeline', JSON.stringify({ events: items, fetchedAt: Date.now() }));
                    }).catch(() => setEvents([]));
            }
        });

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [tenantId]);

    return (
        <section ref={ref} className="py-20 overflow-hidden" style={{ backgroundColor: 'rgb(var(--theme-bg-end))' }}>
            <div className="px-6 lg:px-16 mb-8 text-center">
                <span className="text-[11px] font-bold tracking-[0.4em] uppercase" style={{ color: 'rgb(var(--theme-primary))' }}>Theo Dòng Lịch Sử</span>
                <h2 className="text-3xl font-black mt-2" style={{ fontFamily: 'Georgia, serif', color: 'rgb(var(--theme-text))' }}>Phật Sự Đã Qua</h2>
            </div>

            <div className="flex gap-8 overflow-x-auto pb-8 snap-x px-6 lg:px-16 no-scrollbar">
                {events === null ? (
                    // Skeleton Skeleton
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="shrink-0 w-80 h-32 rounded bg-opacity-10 animate-pulse" style={{ backgroundColor: 'rgb(var(--theme-text))' }} />
                    ))
                ) : (
                    events.map((ev) => (
                        <div key={ev.id} className="snap-start shrink-0 w-80 p-6 border-l-4" style={{ backgroundColor: 'rgb(var(--theme-surface))', borderColor: 'rgb(var(--theme-primary))' }}>
                            <div className="text-[12px] font-bold mb-2 uppercase" style={{ color: 'rgb(var(--theme-primary))' }}>
                                {new Date(ev.start_date || Date.now()).toLocaleDateString('vi-VN')}
                            </div>
                            <h3 className="font-bold text-lg leading-tight" style={{ fontFamily: 'Georgia, serif', color: 'rgb(var(--theme-text))' }}>{ev.title_vi || ev.title}</h3>
                            <p className="mt-2 text-[13px] opacity-70 line-clamp-2">{ev.location}</p>
                        </div>
                    ))
                )}
            </div>
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        </section>
    );
}
