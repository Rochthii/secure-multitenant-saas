'use client';

import React from 'react';
import Image from 'next/image';
import type { MediaItem } from '@/lib/constants/media';

interface ImageGalleryProps {
    images: MediaItem[];
    onImageClick: (index: number) => void;
}

// Nhóm ảnh theo category, fallback về 'Khác'
function groupByCategory(images: MediaItem[]): Record<string, MediaItem[]> {
    const groups: Record<string, MediaItem[]> = {};
    for (const img of images) {
        const key = img.category || (img.title_vi ? '' : '') || 'Khác';
        if (!groups[key]) groups[key] = [];
        groups[key].push(img);
    }
    return groups;
}

const IconZoom = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
    </svg>
);

export function ImageGallery({ images, onImageClick }: ImageGalleryProps) {
    if (images.length === 0) {
        return (
            <div className="text-center py-20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-16 h-16 mx-auto text-stone-300 mb-4">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                </svg>
                <p className="text-gray-400 font-medium">Chưa có hình ảnh nào</p>
                <p className="text-gray-300 text-sm mt-1">Hình ảnh sẽ xuất hiện sau khi được thêm qua trang quản trị</p>
            </div>
        );
    }

    const hasCategories = images.some(img => img.category);

    if (hasCategories) {
        // Hiển thị theo nhóm
        const groups = groupByCategory(images);
        // Tính offset index cho lightbox
        let globalIndex = 0;
        const groupEntries = Object.entries(groups);

        return (
            <div className="space-y-14">
                {groupEntries.map(([category, groupImages]) => {
                    const startIndex = globalIndex;
                    globalIndex += groupImages.length;
                    return (
                        <div key={category}>
                            {/* Group header */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-1 h-7 bg-gold-primary rounded-full flex-shrink-0" />
                                <h3 className="text-xl font-playfair font-bold text-coffee-dark">{category}</h3>
                                <div className="flex-1 h-px bg-gradient-to-r from-gold-primary/30 to-transparent" />
                                <span className="text-xs text-gray-400 font-medium">{groupImages.length} ảnh</span>
                            </div>

                            {/* Masonry grid */}
                            <div
                                style={{ columnCount: 'auto', columnWidth: '220px', columnGap: '12px' }}
                                className="[column-count:2] sm:[column-count:3] lg:[column-count:4]"
                            >
                                {groupImages.map((image, idx) => (
                                    <div
                                        key={image.id}
                                        className="mb-3 cursor-zoom-in group break-inside-avoid"
                                        onClick={() => onImageClick(startIndex + idx)}
                                    >
                                        <div className="relative overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-0.5">
                                            <Image
                                                src={image.url}
                                                alt={image.title_vi || image.title || ''}
                                                width={400}
                                                height={300}
                                                className="w-full h-auto object-cover"
                                                loading="lazy"
                                                unoptimized
                                            />
                                            {/* Hover overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                                                <div className="flex items-end justify-between">
                                                    <p className="text-white text-xs font-medium line-clamp-2 flex-1 mr-2">
                                                        {image.title_vi || image.title}
                                                    </p>
                                                    <div className="text-white/80 flex-shrink-0">
                                                        <IconZoom />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    // Không có category — hiển thị masonry đơn giản
    return (
        <div
            className="[column-count:2] sm:[column-count:3] lg:[column-count:4]"
            style={{ columnGap: '12px' }}
        >
            {images.map((image, index) => (
                <div
                    key={image.id}
                    className="mb-3 cursor-zoom-in group break-inside-avoid"
                    onClick={() => onImageClick(index)}
                >
                    <div className="relative overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-0.5">
                        <Image
                            src={image.url}
                            alt={image.title_vi || image.title || ''}
                            width={400}
                            height={300}
                            className="w-full h-auto object-cover"
                            loading="lazy"
                            unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                            <div className="flex items-end justify-between">
                                <p className="text-white text-xs font-medium line-clamp-2 flex-1 mr-2">
                                    {image.title_vi || image.title}
                                </p>
                                <div className="text-white/80 flex-shrink-0">
                                    <IconZoom />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
