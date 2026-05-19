'use client';

import React, { useState, useMemo } from 'react';
import { MediaTabs } from '@/components/gallery/media-tabs';
import { ImageGallery } from '@/components/gallery/image-gallery';
import { LightboxViewer } from '@/components/gallery/lightbox-viewer';
import { VideoGallery } from '@/components/gallery/video-gallery';
import { AudioPlayer } from '@/components/gallery/audio-player';
import { PDFViewer } from '@/components/gallery/pdf-viewer';
import { GalleryFilters } from '@/components/gallery/gallery-filters';
import type { MediaType, MediaItem } from '@/lib/constants/media';

interface GalleryShellProps {
    initialMedia: MediaItem[];
    events: Array<{ id: string; title_vi: string }>;
}

export function GalleryShell({ initialMedia, events }: GalleryShellProps) {
    const [activeTab, setActiveTab] = useState<MediaType>('image');
    const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const filteredMedia = useMemo(() => {
        let result = initialMedia.filter((item) => item.type === activeTab);
        if (selectedEvent) result = result.filter((item) => item.event_id === selectedEvent);
        if (selectedYear) result = result.filter((item) => item.year === selectedYear);
        if (selectedCategory) result = result.filter((item) => item.category === selectedCategory);
        if (selectedTags.length > 0) result = result.filter((item) => selectedTags.some((tag) => item.tags?.includes(tag)));
        return result;
    }, [initialMedia, activeTab, selectedEvent, selectedYear, selectedCategory, selectedTags]);

    const counts = useMemo(() => ({
        image: initialMedia.filter(m => m.type === 'image').length,
        video: initialMedia.filter(m => m.type === 'video').length,
        audio: initialMedia.filter(m => m.type === 'audio').length,
        pdf: initialMedia.filter(m => m.type === 'pdf').length,
    }), [initialMedia]);

    const clearFilters = () => {
        setSelectedEvent(null);
        setSelectedYear(null);
        setSelectedCategory(null);
        setSelectedTags([]);
    };

    const handleImageClick = (index: number) => {
        setLightboxIndex(index);
        setIsLightboxOpen(true);
    };

    return (
        <div className="bg-page-surface min-h-screen">
            <div className="container mx-auto px-4 py-12">
                <MediaTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />

                <GalleryFilters
                    selectedEvent={selectedEvent}
                    selectedYear={selectedYear}
                    selectedCategory={selectedCategory}
                    selectedTags={selectedTags}
                    events={events}
                    onEventChange={setSelectedEvent}
                    onYearChange={setSelectedYear}
                    onCategoryChange={setSelectedCategory}
                    onTagsChange={setSelectedTags}
                    onClearFilters={clearFilters}
                />

                <div className="mt-8">
                    {activeTab === 'image' && (
                        <>
                            <ImageGallery images={filteredMedia} onImageClick={handleImageClick} />
                            <LightboxViewer
                                images={filteredMedia}
                                currentIndex={lightboxIndex}
                                isOpen={isLightboxOpen}
                                onClose={() => setIsLightboxOpen(false)}
                            />
                        </>
                    )}
                    {activeTab === 'video' && <VideoGallery videos={filteredMedia} />}
                    {activeTab === 'audio' && <AudioPlayer tracks={filteredMedia} />}
                    {activeTab === 'pdf' && <PDFViewer pdfs={filteredMedia} />}
                </div>
            </div>
        </div>
    );
}
