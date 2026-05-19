'use client';

import React from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import type { MediaItem } from '@/lib/constants/media';

interface LightboxViewerProps {
    images: MediaItem[];
    currentIndex: number;
    isOpen: boolean;
    onClose: () => void;
}

export function LightboxViewer({ images, currentIndex, isOpen, onClose }: LightboxViewerProps) {
    const slides = images.map((image) => ({
        src: image.url,
        alt: image.title_vi || image.title,
        title: image.title_vi || image.title,
        description: image.description_vi || image.description,
    }));

    return (
        <Lightbox
            open={isOpen}
            close={onClose}
            slides={slides}
            index={currentIndex}
            plugins={[Zoom]}
            carousel={{ finite: true }}
            render={{
                buttonPrev: slides.length <= 1 ? () => null : undefined,
                buttonNext: slides.length <= 1 ? () => null : undefined,
            }}
        />
    );
}
