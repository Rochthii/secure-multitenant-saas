'use client';
import React, { useState } from 'react';
import Image from 'next/image';

interface DharmaTalk { id: string; title_vi: string; thumbnail_url?: string | null; youtube_url?: string | null; video_url?: string | null; speaker_name?: string | null; }
interface LotusDharmaPosterProps { talks?: DharmaTalk[]; }

export function LotusDharmaPoster({ talks = [] }: LotusDharmaPosterProps) {
    const [modalUrl, setModalUrl] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    const getYtId = (url?: string | null) => {
        if (!url) return null;
        const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^"&?\/\s]{11})/);
        return m ? m[1] : null;
    };

    const handlePlay = (talk: DharmaTalk) => {
        const id = getYtId(talk.youtube_url || talk.video_url);
        if (id) { setModalUrl(`https://www.youtube.com/embed/${id}?autoplay=1`); setModalOpen(true); }
    };

    if (!talks || talks.length === 0) return null;

    return (
        <>
            <section className="py-14 px-6 sm:px-10 lg:px-16" style={{ backgroundColor: 'rgb(var(--theme-bg-end))' }}>
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-7 rounded-full" style={{ backgroundColor: 'rgb(var(--theme-primary))' }} />
                        <h2 className="text-xl font-black uppercase tracking-wide" style={{ color: 'rgb(var(--theme-text))' }}>Pháp Thoại Nổi Bật</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {talks.slice(0, 3).map(talk => (
                            <button key={talk.id} onClick={() => handlePlay(talk)} className="group relative rounded-2xl overflow-hidden aspect-video text-left cursor-pointer" style={{ border: '2px solid rgb(var(--theme-primary) / 0.2)' }}>
                                {talk.thumbnail_url ? (
                                    <Image src={talk.thumbnail_url} alt={talk.title_vi} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                                ) : (
                                    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgb(var(--theme-primary) / 0.3), rgb(var(--theme-secondary) / 0.4))' }} />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: 'rgb(var(--theme-primary))', boxShadow: '0 0 30px rgb(var(--theme-primary) / 0.5)' }}>
                                        <svg className="w-6 h-6 ml-1 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                    </div>
                                </div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    {talk.speaker_name && <span className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: 'rgb(var(--theme-secondary))' }}>{talk.speaker_name}</span>}
                                    <h3 className="text-white font-bold text-[14px] line-clamp-2">{talk.title_vi}</h3>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </section>
            {modalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setModalOpen(false)}>
                    <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <iframe src={modalUrl} className="w-full h-full" allowFullScreen allow="autoplay; encrypted-media" title="Pháp Thoại" />
                        <button onClick={() => setModalOpen(false)} className="absolute top-3 right-3 w-9 h-9 bg-black/60 text-white rounded-full flex items-center justify-center">✕</button>
                    </div>
                </div>
            )}
        </>
    );
}
