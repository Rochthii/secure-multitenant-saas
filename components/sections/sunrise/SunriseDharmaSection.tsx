'use client';
import React, { useState } from 'react';
import Image from 'next/image';

interface DharmaTalk { id: string; title_vi: string; thumbnail_url?: string | null; youtube_url?: string | null; video_url?: string | null; speaker_name?: string | null; }

export function SunriseDharmaSection({ talks = [] }: { talks: DharmaTalk[] }) {
    const [modal, setModal] = useState('');

    if (!talks.length) return null;

    const parseYt = (u?: string | null) => {
        if (!u) return null;
        const m = u.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^"&?\/\s]{11})/);
        return m ? m[1] : null;
    };

    return (
        <section className="py-24 px-6 lg:px-16" style={{ backgroundColor: 'rgb(var(--theme-surface))' }}>
            <div className="max-w-7xl mx-auto flex flex-col items-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,160,50,0.3)] animate-pulse" style={{ backgroundColor: 'rgb(var(--theme-secondary))', color: 'rgb(var(--theme-primary))' }}>
                    🌞
                </div>
                <h2 className="text-3xl lg:text-4xl font-black mb-16 text-center" style={{ color: 'rgb(var(--theme-text))' }}>Ánh Sáng Phật Pháp</h2>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 w-full">
                    {/* Left - Large main video */}
                    <div className="relative aspect-video rounded-3xl overflow-hidden cursor-pointer group shadow-2xl" onClick={() => setModal(`https://www.youtube.com/embed/${parseYt(talks[0].youtube_url)}?autoplay=1`)}>
                        {talks[0].thumbnail_url ? (
                            <Image src={talks[0].thumbnail_url} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
                        ) : (
                            <div className="absolute inset-0 bg-orange-950" />
                        )}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-md transition-transform group-hover:scale-110" style={{ backgroundColor: 'rgb(var(--theme-secondary) / 0.8)', color: 'rgb(var(--theme-primary))' }}>
                                <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Right - small list */}
                    <div className="flex flex-col gap-6 w-full">
                        {talks.slice(1, 4).map((t, i) => (
                            <div key={i} className="flex gap-4 group cursor-pointer" onClick={() => setModal(`https://www.youtube.com/embed/${parseYt(t.youtube_url)}?autoplay=1`)}>
                                <div className="relative w-32 aspect-video rounded-xl overflow-hidden shrink-0 shadow-lg">
                                    <Image src={t.thumbnail_url || ''} alt="" fill className="object-cover group-hover:scale-110 transition-transform" />
                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    </div>
                                </div>
                                <div className="flex-1 py-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: 'rgb(var(--theme-primary))' }}>{t.speaker_name || 'Pháp thoại'}</span>
                                    <h3 className="font-bold text-[15px] leading-snug line-clamp-2 transition-colors group-hover:text-orange-500" style={{ color: 'rgb(var(--theme-text))' }}>{t.title_vi}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {modal && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setModal('')}>
                    <div className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(255,160,50,0.1)] relative" onClick={e => e.stopPropagation()}>
                        <iframe src={modal} className="w-full h-full" allowFullScreen allow="autoplay; encrypted-media" title="Video" />
                        <button onClick={() => setModal('')} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black">✕</button>
                    </div>
                </div>
            )}
        </section>
    );
}
