'use client';

import React, { useEffect } from 'react';
import { extractYouTubeId } from '@/lib/constants/media';

interface VideoModalProps {
    videoUrl: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export function VideoModal({ videoUrl, isOpen, onClose }: VideoModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !videoUrl) return null;

    const videoId = extractYouTubeId(videoUrl);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
            onClick={onClose}
        >
            <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>

                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    {videoId ? (
                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-white">
                            <p>Không thể tải video</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
