'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { extractYouTubeId } from '@/lib/constants/media';
import type { MediaItem } from '@/lib/constants/media';
import { VideoModal } from './video-modal';

interface VideoGalleryProps {
    videos: MediaItem[];
}

// SVG play button — không dùng lucide
const IconPlay = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8" aria-hidden="true">
        <path d="M8 5.14v14l11-7-11-7z" />
    </svg>
);

const IconYouTube = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
    </svg>
);

export function VideoGallery({ videos }: VideoGalleryProps) {
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

    if (videos.length === 0) {
        return (
            <div className="text-center py-20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-16 h-16 mx-auto text-stone-300 mb-4">
                    <path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14" />
                    <rect x="3" y="6" width="12" height="12" rx="2" />
                </svg>
                <p className="text-gray-400 font-medium">Chưa có video nào</p>
                <p className="text-gray-300 text-sm mt-1">Video YouTube hoặc video tải lên sẽ xuất hiện ở đây</p>
            </div>
        );
    }

    const hasCategories = videos.some(video => video.category);

    // Helper: Group by category
    const groupByCategory = (items: MediaItem[]): Record<string, MediaItem[]> => {
        const groups: Record<string, MediaItem[]> = {};
        for (const item of items) {
            const key = item.category || 'Khác';
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        }
        // Sort group "Khác" to end
        const orderedGroups: Record<string, MediaItem[]> = {};
        Object.keys(groups).sort((a, b) => {
            if (a === 'Khác') return 1;
            if (b === 'Khác') return -1;
            return a.localeCompare(b);
        }).forEach(key => {
            orderedGroups[key] = groups[key];
        });
        return orderedGroups;
    };

    if (hasCategories) {
        const groups = groupByCategory(videos);
        const groupEntries = Object.entries(groups);

        return (
            <div className="space-y-14">
                {groupEntries.map(([category, groupVideos]) => (
                    <div key={category}>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-1 h-7 bg-gold-primary rounded-full flex-shrink-0" />
                            <h3 className="text-xl font-playfair font-bold text-coffee-dark">{category}</h3>
                            <div className="flex-1 h-px bg-gradient-to-r from-gold-primary/30 to-transparent" />
                            <span className="text-xs text-gray-400 font-medium">{groupVideos.length} video</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {groupVideos.map((video) => (
                                <VideoCard key={video.id} video={video} onSelect={setSelectedVideo} />
                            ))}
                        </div>
                    </div>
                ))}

                <VideoModal videoUrl={selectedVideo} isOpen={!!selectedVideo} onClose={() => setSelectedVideo(null)} />
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                    <VideoCard key={video.id} video={video} onSelect={setSelectedVideo} />
                ))}
            </div>

            <VideoModal
                videoUrl={selectedVideo}
                isOpen={!!selectedVideo}
                onClose={() => setSelectedVideo(null)}
            />
        </>
    );
}

function VideoCard({ video, onSelect }: { video: MediaItem; onSelect: (url: string) => void }) {
    const videoId = extractYouTubeId(video.url);
    const isYouTube = !!videoId;
    const thumbnailUrl =
        video.thumbnail_url ||
        (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null);

    return (
        <div
            className="group cursor-pointer"
            onClick={() => onSelect(video.url)}
        >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-stone-100 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                {thumbnailUrl ? (
                    <Image
                        src={thumbnailUrl}
                        alt={video.title_vi || video.title || ''}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-coffee-dark to-[#1C1008] flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-12 h-12 text-gold-primary/40">
                            <path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14" />
                            <rect x="3" y="6" width="12" height="12" rx="2" />
                        </svg>
                    </div>
                )}

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300" />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-gold-primary/90 group-hover:bg-gold-primary group-hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg text-white pl-1">
                        <IconPlay />
                    </div>
                </div>

                {/* YouTube badge */}
                {isYouTube && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                        <IconYouTube />
                        <span>YouTube</span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="mt-3 px-1">
                <h3 className="font-semibold text-coffee-dark group-hover:text-gold-dark transition-colors line-clamp-2 leading-snug">
                    {video.title_vi || video.title}
                </h3>
                {(video.description_vi || video.description) && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {video.description_vi || video.description}
                    </p>
                )}
            </div>
        </div>
    );
}
