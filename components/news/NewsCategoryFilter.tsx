'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

interface Category {
    id: string;
    name_vi: string;
}

interface Props {
    categories: Category[];
    selectedCategory: string;
}

const MAX_VISIBLE = 6;

export function NewsCategoryFilter({ categories, selectedCategory }: Props) {
    const [expanded, setExpanded] = useState(false);
    const router = useRouter();
    const locale = useLocale();

    const visible = expanded ? categories : categories.slice(0, MAX_VISIBLE);
    const hasMore = categories.length > MAX_VISIBLE;

    const buildHref = (cat: string) => {
        const qs = new URLSearchParams();
        if (cat !== 'all') qs.set('category', cat);
        const str = qs.toString();
        return `/${locale}/tin-tuc${str ? `?${str}` : ''}`;
    };

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, cat: string) => {
        e.preventDefault();
        router.push(buildHref(cat));
    };

    return (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
            {/* Tất cả */}
            <a
                href={buildHref('all')}
                onClick={(e) => handleClick(e, 'all')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${selectedCategory === 'all'
                        ? 'bg-gold-primary text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
            >
                Tất cả
            </a>

            {/* Categories hiển thị */}
            {visible.map((cat) => (
                <a
                    key={cat.id}
                    href={buildHref(cat.id)}
                    onClick={(e) => handleClick(e, cat.id)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${selectedCategory === cat.id
                            ? 'bg-gold-primary text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    {cat.name_vi}
                </a>
            ))}

            {/* Nút expand / collapse */}
            {hasMore && (
                <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    className="px-4 py-1.5 rounded-full text-sm font-medium bg-white border border-gray-300 text-gray-500 hover:border-gold-primary hover:text-gold-primary transition-all whitespace-nowrap"
                >
                    {expanded
                        ? '← Thu gọn'
                        : `+${categories.length - MAX_VISIBLE} danh mục`}
                </button>
            )}
        </div>
    );
}
