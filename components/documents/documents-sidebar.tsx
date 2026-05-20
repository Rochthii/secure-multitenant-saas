'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
    ChevronDown, ChevronRight, Filter,
    Library, BookOpen, Headphones, Video,
    FileText, Link2, Grid3X3,
} from 'lucide-react';

interface CategoryNode {
    id: string;
    name_vi: string;
    name_km: string | null;
    name_en: string | null;
    slug: string;
    module: string | null;
    parent_id: string | null;
    children: CategoryNode[];
}

interface DocumentsSidebarProps {
    categoriesTree: CategoryNode[];
    selectedCategory: string;
    selectedType: string;
    totalCount?: number;
}

const TYPE_FILTERS = [
    { value: 'all', label: 'Tất cả', icon: Grid3X3, color: 'text-gray-500' },
    { value: 'document', label: 'Tài liệu', icon: FileText, color: 'text-blue-500' },
    { value: 'audio', label: 'Audio & Podcast SOP', icon: Headphones, color: 'text-purple-500' },
    { value: 'video', label: 'Video đào tạo', icon: Video, color: 'text-red-500' },
    { value: 'image', label: 'Hình ảnh', icon: Library, color: 'text-teal-500' },
];

function makeFilterHref(cat: string, typ: string): `/${string}` {
    const p = new URLSearchParams();
    if (cat !== 'all') p.set('category', cat);
    if (typ !== 'all') p.set('type', typ);
    const q = p.toString();
    return q ? `/tai-lieu-so?${q}` as `/${string}` : '/tai-lieu-so';
}

export function DocumentsSidebar({
    categoriesTree,
    selectedCategory,
    selectedType,
    totalCount,
}: DocumentsSidebarProps) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>(() => {
        const initialMap: Record<string, boolean> = {};
        categoriesTree.forEach(parent => {
            initialMap[parent.id] = true;
        });
        return initialMap;
    });

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setExpandedKeys(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <aside className="sticky top-24">
            {/* Mobile Toggle Button */}
            <div className="lg:hidden mb-4">
                <Button
                    variant="outline"
                    className="w-full flex items-center justify-between text-coffee-dark border-gold-primary/30 hover:bg-gold-primary/10 bg-white"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                >
                    <span className="flex items-center gap-2 font-medium">
                        <Filter className="w-4 h-4 text-gold-primary" />
                        Bộ lọc tài liệu {(selectedCategory !== 'all' || selectedType !== 'all') && <span className="text-xs bg-gold-primary/20 text-gold-dark px-2 rounded-full ml-1">Đang lọc</span>}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform text-gold-primary ${isMobileOpen ? 'rotate-180' : ''}`} />
                </Button>
            </div>

            <div className={`space-y-4 ${isMobileOpen ? 'block' : 'hidden lg:block'}`}>
                {/* Total Stats Card */}
                {typeof totalCount !== 'undefined' && (
                    <div className="bg-gradient-to-br from-amber-50 via-cream-light to-orange-50 rounded-2xl border border-gold-primary/20 p-4 text-center hidden lg:block">
                        <div className="text-3xl font-playfair font-bold text-gold-dark mb-1">{totalCount}</div>
                        <div className="text-sm text-coffee-dark/70 font-medium">Tài liệu lưu trữ</div>
                    </div>
                )}

                {/* Category Filter */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <h3 className="font-playfair font-bold text-sm text-coffee-dark flex items-center gap-2">
                            <Grid3X3 className="w-4 h-4 text-gold-primary" />
                            Theo Chủ Đề
                        </h3>
                    </div>

                    <div className="p-3 space-y-0.5 max-h-[40vh] lg:max-h-none overflow-y-auto">
                        {/* All Option */}
                        <Link
                            href={makeFilterHref('all', selectedType)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm group ${selectedCategory === 'all'
                                ? 'bg-gold-primary text-white font-semibold shadow-md shadow-gold-primary/20'
                                : 'text-gray-600 hover:bg-amber-50 hover:text-coffee-dark'
                                }`}
                        >
                            <FileText className={`w-4 h-4 shrink-0 ${selectedCategory === 'all' ? 'text-white' : 'text-gray-400 group-hover:text-gold-primary'}`} />
                            <span className="flex-1 text-left">Tất cả bài viết</span>
                            {selectedCategory === 'all' && (
                                <span className="w-2 h-2 bg-white/60 rounded-full shrink-0" />
                            )}
                        </Link>

                        {/* Category Tree */}
                        {categoriesTree.map((parent) => {
                            const hasChildren = parent.children && parent.children.length > 0;
                            const isParentSelected = selectedCategory === parent.id;
                            const isChildSelected = parent.children?.some(c => c.id === selectedCategory);
                            const isExpanded = expandedKeys[parent.id];
                            const isActive = isParentSelected || isChildSelected;

                            return (
                                <div key={parent.id} className="pt-0.5">
                                    <div className="flex items-center gap-1">
                                        <Link
                                            href={makeFilterHref(parent.id, selectedType)}
                                            className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm group ${isParentSelected
                                                ? 'bg-gold-primary text-white font-semibold shadow-md shadow-gold-primary/20'
                                                : isChildSelected
                                                    ? 'bg-amber-50 text-coffee-dark font-medium'
                                                    : 'text-gray-600 hover:bg-amber-50 hover:text-coffee-dark'
                                                }`}
                                        >
                                            <span className={`w-2 h-2 rounded-full shrink-0 ${isParentSelected ? 'bg-white' : isActive ? 'bg-gold-primary' : 'bg-gray-300 group-hover:bg-gold-primary/50'}`} />
                                            <span className="flex-1 text-left leading-tight">{parent.name_vi}</span>
                                        </Link>

                                        {hasChildren && (
                                            <button
                                                onClick={(e) => toggleExpand(parent.id, e)}
                                                className={`p-2 w-8 h-8 flex items-center justify-center rounded-lg transition-colors shrink-0 ${isActive ? 'text-gold-dark hover:bg-amber-100' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                                    }`}
                                                aria-label="Mở rộng danh mục"
                                            >
                                                {isExpanded
                                                    ? <ChevronDown className="w-3.5 h-3.5" />
                                                    : <ChevronRight className="w-3.5 h-3.5" />
                                                }
                                            </button>
                                        )}
                                    </div>

                                    {/* Children */}
                                    {hasChildren && isExpanded && (
                                        <div className="ml-4 pl-3 border-l-2 border-gray-100 mt-0.5 space-y-0.5">
                                            {parent.children.map(child => {
                                                const isChildActive = selectedCategory === child.id;
                                                return (
                                                    <Link
                                                        key={child.id}
                                                        href={makeFilterHref(child.id, selectedType)}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs ${isChildActive
                                                            ? 'bg-gold-primary/10 text-gold-dark font-semibold border border-gold-primary/20'
                                                            : 'text-gray-500 hover:text-coffee-dark hover:bg-amber-50'
                                                            }`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isChildActive ? 'bg-gold-primary' : 'bg-gray-300'}`} />
                                                        {child.name_vi}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Type Filter */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <h3 className="font-playfair font-bold text-sm text-coffee-dark flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-gold-primary" />
                            Theo Loại Tài Liệu
                        </h3>
                    </div>
                    <div className="p-3 space-y-0.5 flex flex-row flex-wrap lg:flex-col lg:flex-nowrap gap-1">
                        {TYPE_FILTERS.map(({ value, label, icon: Icon, color }) => {
                            const isTypeActive = value === selectedType;
                            return (
                                <Link
                                    key={value}
                                    href={makeFilterHref(selectedCategory, value)}
                                    className={`flex items-center gap-2 lg:gap-3 px-3 py-2 lg:py-2.5 rounded-xl text-xs lg:text-sm font-medium transition-all group border lg:border-none ${isTypeActive
                                            ? 'bg-gold-primary/10 text-gold-dark border-gold-primary/20 shadow-sm'
                                            : 'text-gray-500 border-gray-100 hover:bg-amber-50 hover:text-coffee-dark'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 shrink-0 transition-transform ${isTypeActive ? 'text-gold-primary' : color} group-hover:scale-110`} />
                                    {label}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Links */}
                <div className="bg-gradient-to-br from-coffee-dark to-brown-dark rounded-2xl p-4 text-white hidden lg:block">
                    <p className="text-xs text-white/60 uppercase tracking-wider mb-3 font-medium">Thư viện liên quan</p>
                    <div className="space-y-2">
                        <Link href="/documents" className="flex items-center gap-2 text-sm text-white/80 hover:text-gold-primary transition-colors group">
                            <Headphones className="w-4 h-4 text-gold-primary/60 group-hover:text-gold-primary" />
                            Video Đào tạo & SOP
                        </Link>
                        <Link href="/thu-vien" className="flex items-center gap-2 text-sm text-white/80 hover:text-gold-primary transition-colors group">
                            <Video className="w-4 h-4 text-gold-primary/60 group-hover:text-gold-primary" />
                            Thư viện Ảnh &amp; Video
                        </Link>
                    </div>
                </div>
            </div>
        </aside>
    );
}
