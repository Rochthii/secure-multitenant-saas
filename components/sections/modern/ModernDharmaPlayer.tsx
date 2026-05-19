'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

interface DharmaTalk {
    id: string;
    slug?: string | null;
    title_vi: string;
    title_en?: string | null;
    thumbnail_url?: string | null;
    youtube_url?: string | null;
    video_url?: string | null;
    duration?: string | null;
    speaker_name?: string | null;
}

interface ModernDharmaPlayerProps {
    talks?: DharmaTalk[];
    isCompany?: boolean;
}

/**
 * ModernDharmaPlayer — Player Pháp Âm dark glass cho Modern Layout.
 * Hiển thị dạng card lớn với overlay play button & visualizer bars animated.
 * Click → mở YouTube trong modal.
 */
export function ModernDharmaPlayer({ talks = [], isCompany }: ModernDharmaPlayerProps) {
    const [activeIdx, setActiveIdx] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalUrl, setModalUrl] = useState('');

    if (!talks || talks.length === 0) return null;

    const activeTalk = talks[activeIdx];

    const getYouTubeId = (url?: string | null) => {
        if (!url) return null;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^"&?\/\s]{11})/);
        return match ? match[1] : null;
    };

    const handlePlay = (talk: DharmaTalk) => {
        const ytId = getYouTubeId(talk.youtube_url || talk.video_url);
        if (ytId) {
            setModalUrl(`https://www.youtube.com/embed/${ytId}?autoplay=1`);
            setModalOpen(true);
        }
    };

    return (
        <>
            <section
                className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8"
                style={{ backgroundColor: 'rgb(var(--theme-hero) / 0.5)' }}
            >
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-1 h-7 rounded-full"
                                style={{ backgroundColor: 'rgb(var(--theme-primary))' }}
                            />
                            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'rgb(var(--theme-text))' }}>
                                {isCompany ? 'E-Learning & Đào tạo' : 'Pháp Thoại'}
                            </h2>
                        </div>
                        <Link
                            href="/documents"
                            className="text-[13px] font-medium flex items-center gap-1.5 transition-opacity hover:opacity-70"
                            style={{ color: 'rgb(var(--theme-primary))' }}
                        >
                            Xem tất cả
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                        {/* Player lớn bên trái */}
                        <div
                            className="lg:col-span-3 relative rounded-2xl overflow-hidden cursor-pointer group aspect-video"
                            onClick={() => handlePlay(activeTalk)}
                            style={{
                                backgroundColor: 'rgb(var(--theme-surface) / 0.05)',
                                border: '1px solid rgb(var(--theme-primary) / 0.1)',
                            }}
                        >
                            {activeTalk.thumbnail_url ? (
                                <Image
                                    src={activeTalk.thumbnail_url}
                                    alt={activeTalk.title_vi}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    unoptimized
                                />
                            ) : (
                                <div
                                    className="absolute inset-0"
                                    style={{ background: 'linear-gradient(135deg, rgb(var(--theme-primary) / 0.15), rgb(var(--theme-secondary) / 0.15))' }}
                                />
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            {/* Play button */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div
                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110"
                                    style={{
                                        backgroundColor: 'rgb(var(--theme-primary))',
                                        boxShadow: '0 0 40px rgb(var(--theme-primary) / 0.4)',
                                    }}
                                >
                                    <svg className="w-7 h-7 sm:w-8 sm:h-8 ml-1" viewBox="0 0 24 24" fill="white">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Visualizer bars (decorative) */}
                            <div className="absolute bottom-16 right-6 flex items-end gap-0.5 opacity-60">
                                {[3, 5, 8, 4, 7, 5, 9, 6, 4, 7].map((h, i) => (
                                    <div
                                        key={i}
                                        className="w-1 rounded-full animate-pulse"
                                        style={{
                                            height: `${h * 3}px`,
                                            backgroundColor: 'rgb(var(--theme-primary))',
                                            animationDelay: `${i * 0.1}s`,
                                            animationDuration: `${0.8 + i * 0.1}s`,
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Info bottom */}
                            <div className="absolute bottom-0 left-0 right-0 p-5">
                                {activeTalk.speaker_name && (
                                    <span
                                        className="text-[11px] font-bold uppercase tracking-widest mb-2 block"
                                        style={{ color: 'rgb(var(--theme-primary))' }}
                                    >
                                        {activeTalk.speaker_name}
                                    </span>
                                )}
                                <h3 className="text-white font-bold text-base sm:text-lg line-clamp-2">
                                    {activeTalk.title_vi}
                                </h3>
                                {activeTalk.duration && (
                                    <span className="text-white/50 text-[12px] mt-1 block">{activeTalk.duration}</span>
                                )}
                            </div>
                        </div>

                        {/* List pháp thoại bên phải */}
                        <div className="lg:col-span-2 flex flex-col gap-2 overflow-y-auto max-h-[300px] lg:max-h-none pr-1">
                            {talks.map((talk, idx) => {
                                const isActive = idx === activeIdx;
                                return (
                                    <button
                                        key={talk.id}
                                        onClick={() => setActiveIdx(idx)}
                                        className="flex items-center gap-3 p-3 rounded-xl text-left transition-all w-full"
                                        style={{
                                            backgroundColor: isActive ? 'rgb(var(--theme-primary) / 0.12)' : 'transparent',
                                            border: isActive ? '1px solid rgb(var(--theme-primary) / 0.25)' : '1px solid transparent',
                                        }}
                                    >
                                        {/* Thumbnail nhỏ */}
                                        <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0">
                                            {talk.thumbnail_url ? (
                                                <Image src={talk.thumbnail_url} alt={talk.title_vi} fill className="object-cover" unoptimized />
                                            ) : (
                                                <div
                                                    className="w-full h-full flex items-center justify-center"
                                                    style={{ backgroundColor: 'rgb(var(--theme-primary) / 0.15)' }}
                                                >
                                                    <svg className="w-5 h-5" style={{ color: 'rgb(var(--theme-primary))' }} viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                                    </svg>
                                                </div>
                                            )}
                                            {isActive && (
                                                <div
                                                    className="absolute inset-0 flex items-center justify-center"
                                                    style={{ backgroundColor: 'rgb(var(--theme-primary) / 0.6)' }}
                                                >
                                                    <div className="flex items-end gap-0.5">
                                                        {[3, 5, 4].map((h, i) => (
                                                            <div
                                                                key={i}
                                                                className="w-0.5 rounded-full animate-pulse bg-white"
                                                                style={{ height: `${h * 3}px`, animationDuration: `${0.6 + i * 0.2}s` }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p
                                                className="text-[13px] font-semibold line-clamp-2 leading-snug"
                                                style={{ color: isActive ? 'rgb(var(--theme-primary))' : 'rgb(var(--theme-text))' }}
                                            >
                                                {talk.title_vi}
                                            </p>
                                            {talk.duration && (
                                                <span
                                                    className="text-[11px] mt-0.5 block"
                                                    style={{ color: 'rgb(var(--theme-text) / 0.45)' }}
                                                >
                                                    {talk.duration}
                                                </span>
                                            )}
                                        </div>

                                        {/* Play icon */}
                                        <div
                                            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                                            style={{ backgroundColor: 'rgb(var(--theme-primary) / 0.15)' }}
                                            onClick={(e) => { e.stopPropagation(); handlePlay(talk); }}
                                        >
                                            <svg className="w-3 h-3 ml-0.5" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'rgb(var(--theme-primary))' }}>
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* YouTube Modal */}
            {modalOpen && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    onClick={() => setModalOpen(false)}
                >
                    <div
                        className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <iframe
                            src={modalUrl}
                            className="w-full h-full"
                            allowFullScreen
                            allow="autoplay; encrypted-media"
                            title="Pháp Thoại"
                        />
                        <button
                            onClick={() => setModalOpen(false)}
                            className="absolute top-3 right-3 w-9 h-9 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
