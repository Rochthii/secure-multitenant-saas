'use client';

import React from 'react';
import { Search, X, Filter, Library } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function SearchFilterBar({ 
    authors = [], 
    totalCount = 0 
}: { 
    authors?: string[]; 
    totalCount?: number;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentSearch = searchParams.get('search') || '';
    const currentType = searchParams.get('type') || 'all';
    const currentAuthor = searchParams.get('author') || 'all';

    const handleUpdateParams = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== 'all') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.delete('page');
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="mb-10 pb-6 border-b border-stone-200">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300 group-focus-within:text-gold-primary transition-colors" />
                    <input 
                        type="text"
                        placeholder="Tìm kiếm kinh sách, tài liệu..."
                        defaultValue={currentSearch}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleUpdateParams('search', (e.target as HTMLInputElement).value);
                            }
                        }}
                        className="w-full pl-10 pr-10 py-3 bg-transparent border-0 border-b border-stone-300 text-stone-800 placeholder-stone-400 focus:ring-0 focus:border-gold-primary transition-colors outline-none font-serif text-base"
                    />
                    {currentSearch && (
                        <button 
                            onClick={() => handleUpdateParams('search', '')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 lg:flex items-center gap-4">
                    <div className="relative flex-1 lg:w-48">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                        <select 
                            value={currentType}
                            onChange={(e) => handleUpdateParams('type', e.target.value)}
                            className="w-full pl-9 pr-4 py-3 bg-transparent border-0 border-b border-stone-300 text-stone-600 appearance-none focus:ring-0 focus:border-gold-primary transition-colors outline-none font-serif text-xs uppercase tracking-widest cursor-pointer"
                        >
                            <option value="all">TẤT CẢ LOẠI</option>
                            <option value="book">KINH SÁCH</option>
                            <option value="audio">PHÁP ÂM</option>
                            <option value="video">VIDEO</option>
                            <option value="document">TÀI LIỆU PDF</option>
                        </select>
                    </div>

                    <div className="relative flex-1 lg:w-56">
                        <Library className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                        <select 
                            value={currentAuthor}
                            onChange={(e) => handleUpdateParams('author', e.target.value)}
                            className="w-full pl-9 pr-4 py-3 bg-transparent border-0 border-b border-stone-300 text-stone-600 appearance-none focus:ring-0 focus:border-gold-primary transition-colors outline-none font-serif text-xs uppercase tracking-widest cursor-pointer"
                        >
                            <option value="all">MỌI TÁC GIẢ</option>
                            {authors.filter(Boolean).map(author => (
                                <option key={author} value={author}>{author.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="h-full flex items-center lg:pl-4 pt-2 lg:pt-0">
                    <span className="font-serif text-xs text-stone-400 tracking-widest whitespace-nowrap italic">
                        {totalCount} KẾT QUẢ
                    </span>
                </div>
            </div>
        </div>
    );
}
