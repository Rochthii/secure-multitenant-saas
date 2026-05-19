'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { extractYouTubeId } from '@/lib/constants/media';
import { VideoModal } from '@/components/gallery/video-modal';
import { Link } from '@/i18n/routing';
import { Hash } from 'lucide-react';

import type { Database } from '@/lib/supabase/database.types';

type DharmaTalk = Database['public']['Tables']['dharma_talks']['Row'];

interface TalksGridProps {
    talks: any[];
    tenantName?: string;
    logoUrl?: string;
}

// SVG Icons
const IconPlay = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12" aria-hidden="true">
        <path d="M8 5.14v14l11-7-11-7z" />
    </svg>
);

const IconUser = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);

const IconClock = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export function TalksGrid({ talks, tenantName = 'Multi-tenant Ecosystem', logoUrl }: TalksGridProps) {
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

    if (talks.length === 0) {
        return (
            <div className="text-center py-20 bg-[#FAF7F2] rounded-3xl border border-stone-200">
                <div className="w-16 h-16 mx-auto bg-stone-100 rounded-full flex items-center justify-center mb-4 text-stone-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                </div>
                <h3 className="text-lg font-playfair font-bold text-coffee-dark mb-2">Đang cập nhật</h3>
                <p className="text-stone-500 max-w-sm mx-auto">
                    Các bài pháp thoại đang được biên tập và sẽ sớm ra mắt quý Nhân sự.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                {talks.map((talk) => {
                    const videoId = extractYouTubeId(talk.media_url);
                    const thumbnailUrl = talk.thumbnail_url ||
                        (videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null);

                    const durationText = talk.duration_minutes
                        ? `${talk.duration_minutes} phút`
                        : null;

                    return (
                        <div
                            key={talk.id}
                            className="group flex flex-col bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 md:hover:-translate-y-1 border border-stone-100"
                        >
                            {/* JSON-LD Video Schema */}
                            <script
                                type="application/ld+json"
                                dangerouslySetInnerHTML={{
                                    __html: JSON.stringify({
                                        "@context": "https://schema.org",
                                        "@type": "VideoObject",
                                        "name": talk.title_vi,
                                        "description": talk.description_vi || talk.title_vi,
                                        "thumbnailUrl": [thumbnailUrl],
                                        "uploadDate": talk.created_at,
                                        "duration": talk.duration_minutes ? `PT${talk.duration_minutes}M` : undefined,
                                        "contentUrl": talk.media_url,
                                        "embedUrl": videoId ? `https://www.youtube.com/embed/${videoId}` : talk.media_url,
                                        "publisher": {
                                            "@type": "Organization",
                                            "name": tenantName,
                                            "logo": {
                                                "@type": "ImageObject",
                                                "url": logoUrl || "https://chantarangsay.org/logo.png"
                                            }
                                        }
                                    })
                                }}
                            />
                            {/* Thumbnail Area */}
                            <div
                                className="relative aspect-video bg-stone-100 overflow-hidden cursor-pointer"
                                onClick={() => setSelectedVideo(talk.media_url)}
                            >
                                {thumbnailUrl ? (
                                    <Image
                                        src={thumbnailUrl}
                                        alt={talk.title_vi}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-coffee-dark/5 absolute inset-0">
                                        <span className="text-coffee-dark/30 text-4xl">VIDEO</span>
                                    </div>
                                )}

                                {/* Overlay & Play Btn */}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center z-10">
                                    <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-white/90 text-gold-primary flex items-center justify-center shadow-lg transform scale-90 opacity-80 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 pl-0.5 md:pl-1">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 md:w-10 md:h-10" aria-hidden="true">
                                            <path d="M8 5.14v14l11-7-11-7z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Topic Badge */}
                                {talk.topic_vi && (
                                    <div className="absolute top-3 left-3 bg-coffee-dark/90 backdrop-blur-sm text-gold-light text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                        {talk.topic_vi}
                                    </div>
                                )}

                                {/* Duration Badge */}
                                {durationText && (
                                    <div className="absolute bottom-1 right-1 md:bottom-3 md:right-3 bg-black/70 backdrop-blur-sm text-white text-[10px] md:text-xs font-medium px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <IconClock />
                                        <span>{durationText}</span>
                                    </div>
                                )}
                            </div>

                            {/* Content Area */}
                            <div className="p-3 md:p-5 flex-1 flex flex-col">
                                <h3
                                    className="text-sm md:text-lg font-playfair font-bold text-coffee-dark group-hover:text-gold-primary transition-colors line-clamp-2 mb-2 md:mb-3 cursor-pointer"
                                    onClick={() => setSelectedVideo(talk.media_url)}
                                >
                                    {talk.title_vi}
                                </h3>

                                {/* Display Tags */}
                                {talk.tags && talk.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {talk.tags.map((tag: any) => (
                                            <Link
                                                key={tag.id}
                                                href={`/chu-de/${tag.slug}`}
                                                className="inline-flex items-center gap-0.5 text-[10px] bg-stone-50 text-stone-500 hover:text-gold-dark hover:bg-gold-primary/10 px-1.5 py-0.5 rounded border border-stone-100 transition-colors"
                                            >
                                                <Hash className="w-2.5 h-2.5" />
                                                {tag.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-auto flex items-center justify-between pt-3 md:pt-4 border-t border-stone-100">
                                    {talk.speaker_name_vi ? (
                                        <div className="flex items-center gap-1 md:gap-2 text-stone-600 text-[10px] md:text-sm">
                                            <IconUser />
                                            <span className="font-medium truncate">{talk.speaker_name_vi}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 md:gap-2 text-stone-600 text-[10px] md:text-sm">
                                            <IconUser />
                                            <span className="font-medium truncate">
                                                {talk.tenant_id === '55555555-5555-5555-5555-555555555555' ? 'Hệ thống' : (tenantName || 'Ban trị sự')}
                                            </span>
                                        </div>
                                    )}

                                    {/* View count mock or real */}
                                    {/* <div className="text-xs text-stone-400">
                                        1.2k views
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <VideoModal
                videoUrl={selectedVideo}
                isOpen={!!selectedVideo}
                onClose={() => setSelectedVideo(null)}
            />
        </>
    );
}
