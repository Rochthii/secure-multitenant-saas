'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { extractYouTubeId } from '@/lib/constants/media';

interface DharmaTalk {
    id: string;
    title_vi: string | null;
    title_km: string | null;
    title_en: string | null;
    description_vi: string | null;
    description_km: string | null;
    description_en: string | null;
    media_type: string | null;
    media_url: string | null;
    thumbnail_url: string | null;
    duration_minutes: number | null;
    speaker_name_vi: string | null;
    speaker_name_km: string | null;
    speaker_name_en: string | null;
    topic_vi: string | null;
    topic_km: string | null;
    topic_en: string | null;
    view_count: number | null;
}

interface PhapAmPreviewSectionProps {
    talks: DharmaTalk[];
    customTitle?: string;
    customSubtitle?: string;
    limit?: number;
    settings?: Record<string, any>;
    isCompany?: boolean;
}

// Inline YouTube modal — không dùng lucide
function YouTubeModal({ videoId, onClose }: { videoId: string; onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={onClose}
        >
            <div className="relative w-full max-w-5xl" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute -top-14 right-0 flex items-center justify-center w-11 h-11 text-white hover:text-gray-300 transition-colors"
                    aria-label="Đóng"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
                <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                        title="Pháp Thoại"
                    />
                </div>
            </div>
        </div>
    );
}

export function PhapAmPreviewSection({ talks, customTitle, customSubtitle, limit, settings, isCompany }: PhapAmPreviewSectionProps) {
    const locale = useLocale();
    const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
    const displayTalks = limit && limit > 0 ? talks.slice(0, limit) : talks;

    const getLocalizedContent = (talk: DharmaTalk) => {
        const title = locale === 'km' && talk.title_km
            ? talk.title_km
            : locale === 'en' && talk.title_en
                ? talk.title_en
                : talk.title_vi || '';

        const description = locale === 'km' && talk.description_km
            ? talk.description_km
            : locale === 'en' && talk.description_en
                ? talk.description_en
                : talk.description_vi;

        const speaker = locale === 'km' && talk.speaker_name_km
            ? talk.speaker_name_km
            : locale === 'en' && talk.speaker_name_en
                ? talk.speaker_name_en
                : talk.speaker_name_vi || '';

        const topic = locale === 'km' && talk.topic_km
            ? talk.topic_km
            : locale === 'en' && talk.topic_en
                ? talk.topic_en
                : talk.topic_vi;

        return { title, description, speaker, topic };
    };

    const handleTalkClick = (talk: DharmaTalk) => {
        if (!talk.media_url) return;
        const videoId = extractYouTubeId(talk.media_url);
        if (videoId) {
            setActiveVideoId(videoId);
        } else {
            // Non-YouTube: mở tab mới
            window.open(talk.media_url, '_blank', 'noopener,noreferrer');
        }
    };

    if (!talks || talks.length === 0) {
        return null;
    }

    return (
        <>
            {/* YouTube modal */}
            {activeVideoId && (
                <YouTubeModal videoId={activeVideoId} onClose={() => setActiveVideoId(null)} />
            )}

            <section className="py-10 md:py-16 bg-page-surface relative overflow-hidden" suppressHydrationWarning>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(212,165,116,0.06),transparent)]" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-primary/30 to-transparent" />

                <div className="container mx-auto px-4 relative z-10">
                    {/* Section Header */}
                    <div className="text-center mb-8 md:mb-12">
                        <p className="text-indigo-600/70 text-xs font-semibold tracking-[0.25em] uppercase mb-3">
                            {isCompany ? 'Training & Development' : 'ធម្មទេសនា · Pháp Thoại'}
                        </p>
                        <h2 className="text-3xl md:text-4xl font-playfair font-black text-slate-900 mb-4">
                            {customTitle || (isCompany ? 'E-Learning & Đào tạo' : (locale === 'vi' ? 'Pháp Thoại' : locale === 'km' ? 'ពុទ្ធបញ្ញា - ទេសនា' : 'Dharma Talks'))}
                        </h2>
                        <div className={cn("w-12 h-1 bg-gold-primary mx-auto mb-4", isCompany && "bg-indigo-600")} />
                        <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
                            {customSubtitle || (isCompany 
                                ? 'Nâng cao năng lực chuyên môn và nhận thức an toàn thông tin' 
                                : (locale === 'vi'
                                    ? 'Lắng nghe lời Phật dạy, nuôi dưỡng tâm linh'
                                    : locale === 'km'
                                        ? 'ស្តាប់ពាក្យដែលព្រះពុទ្ធបានបង្រিয়েន លើកកម្ពស់ព្រលឹង'
                                        : "Listen to Buddha's teachings, nourish your spirit"))}
                        </p>
                    </div>

                    {/* Talks Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayTalks.slice(0, 3).map((talk, index) => {
                            const content = getLocalizedContent(talk);
                            const videoId = talk.media_url ? extractYouTubeId(talk.media_url) : null;
                            const thumbnailSrc = talk.thumbnail_url ||
                                (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '/images/placeholder.jpg');

                            return (
                                <button
                                    key={talk.id}
                                    onClick={() => handleTalkClick(talk)}
                                    className={cn(
                                        'group flex flex-row md:flex-col items-stretch text-left w-full h-[110px] md:h-auto bg-stone-50 md:bg-white rounded-xl md:rounded-2xl overflow-hidden hover:bg-stone-100 md:hover:shadow-lg transition-all border border-stone-100 md:border-stone-200/60',
                                        'animate-in fade-in slide-in-from-bottom-8 duration-700'
                                    )}
                                    style={{ animationDelay: `${index * 150}ms` }}
                                >
                                    {/* Thumbnail container */}
                                    <div className="relative w-2/5 md:w-full shrink-0 h-full md:h-auto md:aspect-video overflow-hidden bg-stone-900 border-r md:border-r-0 md:border-b border-stone-200/50">
                                        {thumbnailSrc ? (
                                            <Image
                                                src={thumbnailSrc}
                                                alt={content.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                                                sizes="(max-width: 768px) 40vw, (max-width: 1200px) 50vw, 33vw"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center bg-stone-800">
                                                {/* Placeholder for Youtube icon if needed */}
                                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 md:w-12 md:h-12 text-stone-600" aria-hidden="true">
                                                    <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
                                                </svg>
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />

                                        {/* Play icon inside thumbnail */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 transform group-hover:scale-110 group-hover:bg-gold-primary transition-all duration-300 shadow-xl group-hover:shadow-gold-primary/50">
                                                {/* Play icon */}
                                                <svg className="w-4 h-4 md:w-6 md:h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Badge Type - Hidden on mobile */}
                                        {content.topic && (
                                            <div className="hidden md:block absolute top-3 left-3">
                                                <span className="bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border-none px-3 py-1 text-xs rounded-full">
                                                    {content.topic}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content inside the flexible text container */}
                                    <div className="flex-1 p-3 md:p-5 min-w-0 flex flex-col justify-center md:justify-start w-full bg-white">
                                        <h3 className="font-bold text-stone-800 text-sm md:text-lg line-clamp-2 md:line-clamp-2 leading-tight group-hover:text-gold-dark transition-colors mb-1 md:mb-3 uppercase tracking-tight">
                                            {content.title}
                                        </h3>

                                        <p className="hidden md:block text-sm text-stone-500 leading-relaxed line-clamp-2 mb-4">
                                            {content.description}
                                        </p>

                                        <div className="flex items-center justify-between text-xs text-stone-400 pt-3 border-t border-stone-100">
                                            <div className="flex items-center gap-1.5">
                                                {/* Lotus icon */}
                                                <svg viewBox="0 0 20 16" fill="none" className="w-3.5 h-3 text-gold-primary/60" aria-hidden="true">
                                                    <path d="M10 14C10 14 2 9 2 5C2 3 4 1 6 2.5C7.5 3.5 9 6 9 6C9 6 10 1 13 1C16 1 17.5 3.5 17.5 5C17.5 9 10 14 10 14Z" fill="currentColor" opacity="0.5" />
                                                </svg>
                                                <span className="font-medium text-stone-600">{content.speaker}</span>
                                            </div>
                                            <span className="text-gold-primary/70 font-medium md:bg-gold-primary/10 md:px-3 md:py-1 md:rounded-full md:text-gold-dark">Xem →</span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* View All — link channel của chi nhánh hoặc trang pháp thoại */}
                    <div className="text-center mt-10">
                        <a
                            href={settings?.['youtube_url'] || '/documents'}
                            target={settings?.['youtube_url'] ? '_blank' : undefined}
                            rel={settings?.['youtube_url'] ? 'noopener noreferrer' : undefined}
                            className={cn(
                                "inline-flex items-center gap-2 font-bold transition-all group px-8 py-3 rounded-xl border-2",
                                isCompany 
                                    ? "text-indigo-600 border-indigo-100 hover:bg-indigo-50" 
                                    : "text-gold-primary border-gold-primary/10 hover:bg-gold-primary/5"
                            )}
                        >
                            <span>
                                {isCompany ? 'Truy cập Trung tâm Đào tạo' : (locale === 'vi' ? 'Xem Pháp Thoại trên YouTube' : locale === 'km' ? 'មើលទាំងអស់' : 'View All on YouTube')}
                            </span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
}
