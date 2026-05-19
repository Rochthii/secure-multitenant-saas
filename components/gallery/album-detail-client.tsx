'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { LightboxViewer } from '@/components/gallery/lightbox-viewer';

interface AlbumDetailClientProps {
    images: any[];
}

export function AlbumDetailClient({ images }: AlbumDetailClientProps) {
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const handleImageClick = (index: number) => {
        setLightboxIndex(index);
        setIsLightboxOpen(true);
    };

    if (images.length === 0) {
        return (
            <div className="py-20 text-center bg-white rounded-3xl border border-stone-100 shadow-sm mt-8">
                <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-stone-300">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-stone-700 mb-2">Album trống</h3>
                <p className="text-stone-400 text-sm">Chưa có hình ảnh nào được tải lên album này.</p>
            </div>
        );
    }

    return (
        <div className="mt-8">
            <div
                className="[column-count:2] md:[column-count:3] lg:[column-count:4]"
                style={{ columnGap: '16px' }}
            >
                {images.map((img, idx) => (
                    <div
                        key={img.id}
                        className="mb-4 cursor-zoom-in group break-inside-avoid relative rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                        onClick={() => handleImageClick(idx)}
                    >
                        <Image
                            src={img.url}
                            alt={img.title_vi || 'Hình ảnh'}
                            width={500}
                            height={500}
                            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                        />
                        {/* Hover Overlay - No title displayed as requested by user */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-white drop-shadow-md">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                                </svg>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <LightboxViewer
                images={images}
                currentIndex={lightboxIndex}
                isOpen={isLightboxOpen}
                onClose={() => setIsLightboxOpen(false)}
            />
        </div>
    );
}
