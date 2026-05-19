'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X, Filter, User, Grid3X3 } from 'lucide-react';

interface CategoryNode {
    id: string;
    name_vi: string;
    children: CategoryNode[];
}

interface DocumentsFilterBarProps {
    categories: CategoryNode[];
    authors: string[];
    selectedCategory: string;
    selectedAuthor: string;
    locale: string;
}

export function DocumentsFilterBar({
    categories,
    authors,
    selectedCategory,
    selectedAuthor,
    locale,
}: DocumentsFilterBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'all') {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        params.delete('page'); // Reset to page 1 on filter change
        router.push(`/tai-lieu-so?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push('/tai-lieu-so');
    };

    const hasFilters = selectedCategory !== 'all' || selectedAuthor !== 'all';

    // Flatten categories for the select
    const flattenedCategories: { id: string; name: string }[] = [];
    const flatten = (nodes: CategoryNode[], level = 0) => {
        nodes.forEach(node => {
            flattenedCategories.push({
                id: node.id,
                name: `${'— '.repeat(Math.max(0, level || 0))}${node.name_vi}`
            });
            if (node.children) flatten(node.children, level + 1);
        });
    };
    flatten(categories);

    return (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-4">
                {/* Icon & Label (Desktop only) */}
                <div className="hidden md:flex items-center gap-2 pr-4 border-r border-stone-100 h-10">
                    <Filter className="w-4 h-4 text-gold-primary" />
                    <span className="text-sm font-semibold text-stone-600 uppercase tracking-wider">Tìm kiếm</span>
                </div>

                {/* Author Select */}
                <div className="w-full md:w-64 space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Tác giả / Giảng sư</label>
                    <Select
                        value={selectedAuthor}
                        onValueChange={(val) => updateFilter('author', val)}
                    >
                        <SelectTrigger className="bg-stone-50 border-stone-100 rounded-xl focus:ring-gold-primary/20">
                            <div className="flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-stone-400" />
                                <SelectValue placeholder="Chọn tác giả" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả tác giả</SelectItem>
                            {authors.map((author) => (
                                <SelectItem key={author} value={author}>
                                    {author}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Category Select */}
                <div className="w-full md:w-64 space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Chủ đề / Thể loại</label>
                    <Select
                        value={selectedCategory}
                        onValueChange={(val) => updateFilter('category', val)}
                    >
                        <SelectTrigger className="bg-stone-50 border-stone-100 rounded-xl focus:ring-gold-primary/20">
                            <div className="flex items-center gap-2">
                                <Grid3X3 className="w-3.5 h-3.5 text-stone-400" />
                                <SelectValue placeholder="Chọn chủ đề" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả chủ đề</SelectItem>
                            {flattenedCategories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Clear Filter */}
                {hasFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-stone-400 hover:text-gold-dark hover:bg-stone-50 rounded-xl self-end md:self-center h-10 px-4"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Xóa bộ lọc
                    </Button>
                )}
            </div>
        </div>
    );
}
