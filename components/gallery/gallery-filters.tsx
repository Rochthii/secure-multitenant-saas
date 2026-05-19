'use client';

import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AVAILABLE_YEARS, COMMON_TAGS, MEDIA_CATEGORIES } from '@/lib/constants/media';

interface GalleryFiltersProps {
    selectedEvent: string | null;
    selectedYear: number | null;
    selectedCategory: string | null;
    selectedTags: string[];
    events: Array<{ id: string; title_vi: string }>;
    onEventChange: (eventId: string | null) => void;
    onYearChange: (year: number | null) => void;
    onCategoryChange: (category: string | null) => void;
    onTagsChange: (tags: string[]) => void;
    onClearFilters: () => void;
}

export function GalleryFilters({
    selectedEvent,
    selectedYear,
    selectedCategory,
    selectedTags,
    events,
    onEventChange,
    onYearChange,
    onCategoryChange,
    onTagsChange,
    onClearFilters,
}: GalleryFiltersProps) {
    const hasActiveFilters = selectedEvent || selectedYear || selectedCategory || selectedTags.length > 0;

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            onTagsChange(selectedTags.filter((t) => t !== tag));
        } else {
            onTagsChange([...selectedTags, tag]);
        }
    };

    return (
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Lọc nội dung</h3>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-4">
                {/* Category Filter */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Chủ đề</label>
                    <select
                        value={selectedCategory || ''}
                        onChange={(e) => onCategoryChange(e.target.value || null)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-gold-primary focus:ring-gold-primary"
                    >
                        <option value="">Tất cả chủ đề</option>
                        {MEDIA_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Event Filter */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Sự kiện</label>
                    <select
                        value={selectedEvent || ''}
                        onChange={(e) => onEventChange(e.target.value || null)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-gold-primary focus:ring-gold-primary"
                    >
                        <option value="">Tất cả sự kiện</option>
                        {events.map((event) => (
                            <option key={event.id} value={event.id}>
                                {event.title_vi}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Year Filter */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Năm</label>
                    <select
                        value={selectedYear || ''}
                        onChange={(e) => onYearChange(e.target.value ? Number(e.target.value) : null)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-gold-primary focus:ring-gold-primary"
                    >
                        <option value="">Tất cả các năm</option>
                        {AVAILABLE_YEARS.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Clear Button */}
                <div className="flex items-end">
                    <Button
                        variant="outline"
                        onClick={onClearFilters}
                        disabled={!hasActiveFilters}
                        className="w-full"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Xóa bộ lọc
                    </Button>
                </div>
            </div>

            {/* Tags Filter */}
            <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Thẻ</label>
                <div className="flex flex-wrap gap-2">
                    {COMMON_TAGS.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${isSelected
                                    ? 'bg-gold-primary text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gold-primary'
                                    }`}
                            >
                                {tag}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
