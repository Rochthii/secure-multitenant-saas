'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { Link } from '@/i18n/routing';

export function SunriseEventCalendar() {
    const ref = useRef<HTMLDivElement>(null);
    const [events, setEvents] = useState<any[] | null>(null);

    useEffect(() => {
        const c = sessionStorage.getItem('cache_sunrise_events');
        if (c) {
            const p = JSON.parse(c);
            if (Date.now() - p.fetchedAt < 300000) { setEvents(p.events); return; }
        }
        const obs = new IntersectionObserver(e => {
            if (e[0].isIntersecting) {
                obs.disconnect();
                fetch('/api/sections/news-events').then(r => r.json()).then(d => {
                    const ev = d.events || [];
                    setEvents(ev);
                    sessionStorage.setItem('cache_sunrise_events', JSON.stringify({ events: ev, fetchedAt: Date.now() }));
                }).catch(() => setEvents([]));
            }
        });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    return (
        <section ref={ref} className="py-24 px-6 lg:px-16" style={{ background: 'linear-gradient(135deg, rgb(var(--theme-bg-end)) 0%, rgb(var(--theme-bg-start)) 100%)' }}>
            <div className="max-w-4xl mx-auto bg-white/50 backdrop-blur-xl rounded-3xl p-8 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border" style={{ borderColor: 'rgb(var(--theme-primary) / 0.1)', backgroundColor: 'rgb(var(--theme-surface))' }}>
                <div className="text-center mb-12 border-b pb-8" style={{ borderColor: 'rgb(var(--theme-primary) / 0.1)' }}>
                    <div className="flex justify-center mb-4">
                        <Calendar className="w-12 h-12 text-gold-primary" />
                    </div>
                    <h2 className="text-3xl font-black mb-2" style={{ color: 'rgb(var(--theme-text))' }}>Lịch Trình Đạo Tràng</h2>
                    <p className="text-[14px] font-medium" style={{ color: 'rgb(var(--theme-text) / 0.6)' }}>Các sự kiện, lễ hội và khóa tu sắp diễn ra</p>
                </div>

                <div className="flex flex-col gap-6">
                    {events === null ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-black/5 rounded-2xl animate-pulse" />) : events.slice(0, 5).map(ev => (
                        <Link
                            key={ev.id}
                            href={ev.slug ? `/lich-le/${ev.slug}` : `/lich-le/${ev.id}`}
                            className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer group block"
                            style={{ backgroundColor: 'rgb(var(--theme-primary) / 0.03)', border: '1px solid rgb(var(--theme-primary) / 0.05)' }}
                        >
                            <div className="w-20 h-24 rounded-xl flex flex-col items-center justify-center shrink-0" style={{ backgroundColor: 'rgb(var(--theme-secondary))', color: 'rgb(var(--theme-primary))' }}>
                                <div className="text-3xl font-black leading-none">{new Date(ev.start_date || Date.now()).getDate()}</div>
                                <div className="text-[10px] uppercase font-bold tracking-widest mt-1">
                                    Tháng {new Date(ev.start_date || Date.now()).getMonth() + 1}
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <h3 className="text-xl font-bold mb-2 leading-tight group-hover:text-gold-primary transition-colors" style={{ color: 'rgb(var(--theme-text))' }}>{ev.title_vi || ev.title}</h3>
                                <div className="flex items-center gap-1.5" style={{ color: 'rgb(var(--theme-text) / 0.6)' }}>
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span className="text-[12px] uppercase tracking-wide font-medium">{ev.location || 'Tại bổn tự'}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
