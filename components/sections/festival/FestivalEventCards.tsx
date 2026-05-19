'use client';
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { MapPin } from 'lucide-react';
import { Link } from '@/i18n/routing';

const CACHE_KEY = 'cache_festival_events_v1';

export function FestivalEventCards({ locale = 'vi' }: { locale?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [events, setEvents] = useState<any[] | null>(null);

    useEffect(() => {
        const cache = sessionStorage.getItem(CACHE_KEY);
        if (cache) {
            const p = JSON.parse(cache);
            if (Date.now() - p.fetchedAt < 300000) { setEvents(p.events); return; }
        }

        const obs = new IntersectionObserver(e => {
            if (e[0].isIntersecting) {
                obs.disconnect();
                fetch('/api/sections/news-events').then(r => r.json()).then(d => {
                    const ev = d.events || [];
                    setEvents(ev);
                    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ events: ev, fetchedAt: Date.now() }));
                }).catch(() => setEvents([]));
            }
        });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    return (
        <section ref={ref} className="py-24 px-6 sm:px-10 lg:px-16 overflow-hidden relative" style={{ backgroundColor: 'rgb(var(--theme-bg-start))' }}>
            <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full blur-[100px] opacity-30 bg-gold-primary pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-[120px] opacity-30 bg-saffron pointer-events-none" />

            {/* Khmer Motif Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l5 10 10 5-10 5-5 10-5-10-10-5 10-5z' fill='%23FFD700' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <span className="text-[12px] font-bold uppercase tracking-[0.3em] px-4 py-1.5 rounded-full inline-block mb-6 shadow-md" style={{ backgroundColor: 'rgb(var(--theme-primary))', color: '#fff' }}>Lịch Lễ Hội</span>
                    <h2 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight" style={{ color: 'rgb(var(--theme-text))' }}>Gần Đây & Sắp Tới</h2>
                    <p className="max-w-xl mx-auto text-lg leading-relaxed opacity-80" style={{ color: 'rgb(var(--theme-text))' }}>Lên lịch tham dự các lễ hội truyền thống, đắm mình trong không gian rực rỡ sắc màu.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events === null ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 rounded-3xl bg-black/5 animate-pulse" />) : events.slice(0, 3).map((ev, i) => (
                        <Link
                            key={ev.id}
                            href={`/lich-le/${ev.slug || ev.id}`}
                            className="group block relative p-8 rounded-3xl transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_30px_60px_rgba(0,0,0,0.2)] overflow-hidden border border-white/5"
                            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', backdropFilter: 'blur(20px)' }}
                        >
                            {/* Animated Glowing Border */}
                            <div className={cn(
                                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl",
                                "after:absolute after:inset-[-1px] after:rounded-3xl after:p-[1px] after:bg-gradient-to-br after:content-['']",
                                i === 0 ? "after:from-gold-primary after:via-saffron after:to-gold-dark" :
                                    i === 1 ? "after:from-saffron after:via-gold-primary after:to-brown" :
                                        "after:from-gold-dark after:via-gold-primary after:to-saffron"
                            )} />
                            {/* Colored corner blob depending on index */}
                            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-50 pointer-events-none transition-all duration-500 group-hover:scale-150 ${i === 0 ? 'bg-gold-primary' : i === 1 ? 'bg-saffron' : 'bg-brown'}`} />

                            <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-lg mb-8 bg-white text-black relative z-10">
                                <div className="font-black text-2xl leading-none">{new Date(ev.start_date || Date.now()).getDate()}</div>
                                <div className="text-[10px] font-bold uppercase">T{new Date(ev.start_date || Date.now()).getMonth() + 1}</div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-2xl font-black mb-3 leading-tight group-hover:text-pink-600 transition-colors" style={{ color: 'rgb(var(--theme-text))' }}>{ev.title_vi || ev.title}</h3>
                                <p className="text-[14px] font-medium uppercase tracking-widest mt-6 opacity-60 flex items-center gap-1.5" style={{ color: 'rgb(var(--theme-text))' }}>
                                    <MapPin className="w-3.5 h-3.5" />
                                    {ev.location}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
