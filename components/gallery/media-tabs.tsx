'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { MediaType } from '@/lib/constants/media';

// SVG icons — không dùng lucide
const IconPhoto = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
    </svg>
);

const IconVideo = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14" />
        <rect x="3" y="6" width="12" height="12" rx="2" />
    </svg>
);

const IconAudio = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
    </svg>
);

const IconDocument = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
);

const TABS: { value: MediaType; label: string; Icon: React.FC }[] = [
    { value: 'image', label: 'Hình Ảnh', Icon: IconPhoto },
    { value: 'video', label: 'Video', Icon: IconVideo },
    { value: 'audio', label: 'Âm Thanh', Icon: IconAudio },
    { value: 'pdf', label: 'Tài Liệu', Icon: IconDocument },
];

interface MediaTabsProps {
    activeTab: MediaType;
    onTabChange: (tab: MediaType) => void;
    counts?: Partial<Record<MediaType, number>>;
}

export function MediaTabs({ activeTab, onTabChange, counts }: MediaTabsProps) {
    return (
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {TABS.map(({ value, label, Icon }) => {
                const isActive = activeTab === value;
                const count = counts?.[value];
                return (
                    <button
                        key={value}
                        onClick={() => onTabChange(value)}
                        className={cn(
                            'flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 border',
                            isActive
                                ? 'bg-coffee-dark text-gold-light border-coffee-dark shadow-md'
                                : 'bg-white text-gray-600 border-stone-200 hover:border-gold-primary hover:text-gold-dark'
                        )}
                    >
                        <Icon />
                        <span>{label}</span>
                        {count !== undefined && (
                            <span className={cn(
                                'ml-1 text-xs px-1.5 py-0.5 rounded-full font-bold',
                                isActive ? 'bg-gold-primary/30 text-gold-light' : 'bg-stone-100 text-gray-500'
                            )}>
                                {count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
