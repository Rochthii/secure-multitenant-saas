'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface DharmaTalk { id: string; title_vi: string; thumbnail_url?: string | null; youtube_url?: string | null; video_url?: string | null; speaker_name?: string | null; }

export function FestivalDharmaPlayer({ talks = [] }: { talks: DharmaTalk[] }) {
    const [modal, setModal] = useState('');

    if (!talks.length) return null;

    const parseYt = (u?: string | null) => {
        if (!u) return null;
        const m = u.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^"&?\/\s]{11})/);
        return m ? m[1] : null;
    };

    return (
        <section className="py-24 px-6 lg:px-16" style={{ background: 'linear-gradient(135deg, rgb(var(--theme-primary)) 0%, rgb(var(--theme-secondary)) 100%)' }}>
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
                <div className="w-full lg:w-1/2">
                    <span className="text-white/80 font-bold tracking-[0.3em] uppercase block mb-4 text-[12px]">Âm Thanh Mùa Hội</span>
                    <h2 className="text-4xl lg:text-6xl font-black text-white mb-6 leading-[1.1] drop-shadow-md">Giai Điệu<br />Phật Pháp</h2>
                    <p className="text-lg text-white/90 mb-10 max-w-md leading-relaxed font-medium">Nghe lại những bài pháp thoại hòa lẫn trong không khí rộn rã của Phum Sóc.</p>

                    <div className="flex flex-col gap-4">
                        {talks.slice(0, 3).map(t => (
                            <button key={t.id} onClick={() => setModal(`https://www.youtube.com/embed/${parseYt(t.youtube_url)}?autoplay=1`)} className="group flex items-center gap-4 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md border border-white/20 text-left">
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 ml-1 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-white text-[15px] line-clamp-1">{t.title_vi}</h3>
                                    <span className="text-[11px] text-white/70 block mt-0.5">{t.speaker_name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Big Video Card */}
                <div className="w-full lg:w-1/2 relative aspect-[4/5] lg:aspect-square rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] bg-black rotate-2 hover:rotate-0 transition-transform duration-500 cursor-pointer group" onClick={() => setModal(`https://www.youtube.com/embed/${parseYt(talks[0]?.youtube_url)}?autoplay=1`)}>
                    {/* Visualizer Aura */}
                    <div className="absolute inset-0 opacity-40 group-hover:opacity-70 transition-opacity">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF4D6D] via-[#39D5A0] to-[#FFD700] animate-spin-slow blur-3xl" />
                    </div>

                    {talks[0]?.thumbnail_url ? (
                        <Image src={talks[0].thumbnail_url} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-700 relative z-10" unoptimized />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900 to-orange-500 relative z-10" />
                    )}

                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                            <svg className="w-10 h-10 ml-2 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-black/80 to-transparent z-20">
                        <h3 className="text-2xl font-black text-white line-clamp-2">{talks[0]?.title_vi}</h3>
                        <p className="text-white/70 font-bold mt-2 uppercase tracking-widest text-sm">{talks[0]?.speaker_name}</p>
                    </div>
                </div>
            </div>

            {modal && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setModal('')}>
                    <div className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <iframe src={modal} className="w-full h-full" allowFullScreen allow="autoplay; encrypted-media" title="Video" />
                        <button onClick={() => setModal('')} className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40 backdrop-blur-md">✕</button>
                    </div>
                </div>
            )}
        </section>
    );
}
