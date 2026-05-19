'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

interface Category {
    id: string;
    parent_id?: string | null;
    isGlobal?: boolean;
    name_vi: string;
    level?: number;
}

interface CustomCategorySelectProps {
    value: string;
    onChange: (value: string) => void;
    localCategories: Category[];
    globalCategories: Category[];
    placeholder?: string;
    module?: string;
    className?: string;
}

export function CustomCategorySelect({ 
    value, 
    onChange, 
    localCategories, 
    globalCategories, 
    placeholder = '-- Chọn Danh Mục --',
    module,
    className
}: CustomCategorySelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState<'local' | 'global'>('local');

    const selectedCategory = localCategories.find((c: Category) => c.id === value) || globalCategories.find((c: Category) => c.id === value);
    const selectedName = selectedCategory ? selectedCategory.name_vi : placeholder;

    const renderList = (categories: Category[]) => {
        const filtered = categories.filter(c => c.name_vi.toLowerCase().includes(search.toLowerCase()));
        if (filtered.length === 0) return <div className="p-3 text-sm text-gray-500 text-center">Không tìm thấy danh mục</div>;
        
        return (
            <div className="max-h-60 overflow-y-auto p-1">
                {filtered.map(cat => (
                    <div
                        key={cat.id}
                        onClick={() => { onChange(cat.id); setIsOpen(false); }}
                        className={`flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gold-primary/10 ${value === cat.id ? 'bg-gold-primary/10 text-gold-dark font-medium' : 'text-gray-700'}`}
                    >
                        <span>{'\u00A0\u00A0'.repeat(cat.level || 0)}{cat.level && cat.level > 0 ? '└─ ' : ''}{cat.name_vi}</span>
                        {value === cat.id && <Check className="w-4 h-4 text-gold-primary flex-shrink-0" />}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="relative">
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between border rounded-lg px-3 py-2 text-sm bg-white cursor-pointer transition-colors ${isOpen ? 'border-gold-primary ring-1 ring-gold-primary/50' : 'border-gray-300 hover:border-gold-primary'}`}
            >
                <span className={value ? "text-gray-900 truncate" : "text-gray-500"}>{selectedName}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <>
                    {/* Fixed overlay to catch outside clicks without blocking entire page pointer events entirely */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col max-h-[350px]">
                        <div className="p-2 border-b bg-gray-50">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
                                <input 
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Tìm danh mục..."
                                    className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-gray-200 rounded text-gray-800 focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-gold-primary transition-all"
                                    // eslint-disable-next-line jsx-a11y/no-autofocus
                                    autoFocus
                                />
                            </div>
                        </div>
                        
                        {(localCategories.length > 0 && globalCategories.length > 0) && (
                            <div className="flex border-b bg-gray-50 text-[13px]">
                                <button 
                                    type="button"
                                    onClick={() => setTab('local')}
                                    className={`flex-1 py-2 font-medium border-b-2 transition-colors ${tab === 'local' ? 'border-gold-primary text-gold-dark' : 'border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                                >
                                    Chi nhánh / Tổ chức của bạn
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setTab('global')}
                                    className={`flex-1 py-2 font-medium border-b-2 transition-colors ${tab === 'global' ? 'border-gold-primary text-gold-dark' : 'border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                                >
                                    Hệ thống chung
                                </button>
                            </div>
                        )}
                        
                        {tab === 'local' ? renderList(localCategories) : renderList(globalCategories)}
                    </div>
                </>
            )}
        </div>
    );
}
