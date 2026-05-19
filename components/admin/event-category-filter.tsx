'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CustomCategorySelect } from '@/components/admin/custom-category-select';

interface CategoryOption {
    id: string;
    name_vi: string;
    parent_id?: string | null;
    level?: number;
    isGlobal?: boolean;
}

interface EventCategoryFilterProps {
    localCategories: CategoryOption[];
    globalCategories: CategoryOption[];
}

export function EventCategoryFilter({ localCategories, globalCategories }: EventCategoryFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentCategoryId = searchParams.get('category') || 'all';

    const [value, setValue] = useState(currentCategoryId === 'all' ? '' : currentCategoryId);

    const handleChange = (categoryId: string) => {
        setValue(categoryId);
        const params = new URLSearchParams(searchParams.toString());
        if (categoryId && categoryId !== 'all') {
            params.set('category', categoryId);
        } else {
            params.delete('category');
        }
        params.set('page', '1');
        router.push(`?${params.toString()}`);
    };

    const handleClear = () => {
        setValue('');
        const params = new URLSearchParams(searchParams.toString());
        params.delete('category');
        params.set('page', '1');
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            <div className="w-[220px]">
                <CustomCategorySelect
                    value={value}
                    onChange={handleChange}
                    localCategories={localCategories}
                    globalCategories={globalCategories}
                    placeholder="Danh mục sự kiện"
                    className="h-9 text-sm"
                />
            </div>
            {value && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="text-xs text-gray-500 hover:text-gold-dark hover:underline whitespace-nowrap"
                >
                    ✕ Xóa lọc
                </button>
            )}
        </div>
    );
}
