'use client';
import React, { useState } from 'react';
import Image from 'next/image';

interface DharmaTalk { id: string; title_vi: string; thumbnail_url?: string | null; youtube_url?: string | null; video_url?: string | null; speaker_name?: string | null; }

export function ZenDharmaPlayer({ talks = [] }: { talks: DharmaTalk[] }) {
    const [active, setActive] = useState<DharmaTalk | null>(talks[0] || null);

    // Auto lấy ID YT
    const getYtId = (url?: string | null) => {
        if (!url) return null;
        const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^"&?\/\s]{11})/);
        return m ? m[1] : null;
    };

    if (!active) return null;

    const ytId = getYtId(active.youtube_url || active.video_url);

    return (
        <section className="py-20 px-6 sm:px-10 lg:px-16" style={{ background: 'linear-gradient(to bottom, rgb(var(--theme-bg-start)), rgb(var(--theme-bg-end)))' }}>
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
                {/* Main Player */}
                <div className="flex-1 rounded-3xl overflow-hidden shadow-2xl relative" style={{ backgroundColor: '#000' }}>
                    {ytId ? (
                        <iframe src={`https://www.youtube.com/embed/${ytId}?rel=0`} className="w-full aspect-video" allowFullScreen title="YouTube" />
                    ) : (
                        <div className="w-full aspect-video flex items-center justify-center text-white/50 bg-black/50">Không thể phát âm thanh</div>
                    )}
                    <div className="p-6 bg-gradient-to-t from-black to-black/80">
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1 block" style={{ color: 'rgb(var(--theme-primary))' }}>Pháp Âm</span>
                        <h2 className="text-xl sm:text-2xl font-medium text-white line-clamp-2">{active.title_vi}</h2>
                        {active.speaker_name && <p className="text-[13px] text-white/60 mt-2">{active.speaker_name}</p>}
                    </div>
                </div>

                {/* Playlist */}
                <div className="w-full lg:w-96 flex flex-col gap-3 h-[500px] overflow-y-auto pr-2 custom-scroll">
                    {talks.map((talk, idx) => {
                        const isActive = active.id === talk.id;
                        return (
                            <button
                                key={talk.id}
                                onClick={() => setActive(talk)}
                                className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all hover:bg-black/5"
                                style={{
                                    backgroundColor: isActive ? 'rgb(var(--theme-primary) / 0.1)' : 'rgb(var(--theme-surface))',
                                    border: isActive ? '1px solid rgb(var(--theme-primary) / 0.3)' : '1px solid transparent'
                                }}
                            >
                                {/* Thumbnail */}
                                <div className="w-24 aspect-video rounded-lg overflow-hidden relative shrink-0">
                                    {talk.thumbnail_url ? (
                                        <Image src={talk.thumbnail_url} alt="" fill className="object-cover" unoptimized />
                                    ) : (
                                        <div className="absolute inset-0 bg-gray-200" />
                                    )}
                                    {isActive && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <div className="w-1 h-3 mr-1 bg-white animate-[pulse_1s_infinite]" />
                                            <div className="w-1 h-5 mr-1 bg-white animate-[pulse_1s_infinite_0.2s]" />
                                            <div className="w-1 h-2 bg-white animate-[pulse_1s_infinite_0.4s]" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-[14px] font-semibold line-clamp-2 leading-snug" style={{ color: 'rgb(var(--theme-text))' }}>{talk.title_vi}</h3>
                                    {talk.speaker_name && <p className="text-[11px] mt-1 line-clamp-1" style={{ color: 'rgb(var(--theme-text) / 0.5)' }}>{talk.speaker_name}</p>}
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>
            <style>{`.custom-scroll::-webkit-scrollbar { width: 4px; } .custom-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }`}</style>
        </section>
    );
}
