'use client';

import React, { useState } from 'react';
import { ChevronRight, Home, LayoutGrid, List } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { SearchFilterBar } from '@/components/tai-lieu-so/SearchFilterBar';
import { MediaPreviewModal } from '@/components/tai-lieu-so/MediaPreviewModal';
import Image from 'next/image';

// Use simpler types or 'any' for speed but keep it functional
export function LibraryContent({
    currentTab,
    selectedCategory,
    breadcrumbPath,
    authors,
    albums,
    documents,
    categoryTree,
    totalCount,
    locale
}: any) {
    const [selectedMedia, setSelectedMedia] = useState<any>(null);

    const renderBreadcrumbs = () => {
        if (!breadcrumbPath || breadcrumbPath.length === 0) return null;
        return (
            <nav className="flex items-center gap-2 mb-8 overflow-x-auto whitespace-nowrap bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-stone-100 w-fit">
                <Link href="/tai-lieu-so" className="text-stone-400 hover:text-gold-primary transition-colors">
                    <Home className="w-4 h-4" />
                </Link>
                {breadcrumbPath.map((item: any, idx: number) => (
                    <React.Fragment key={item.id}>
                        <ChevronRight className="w-3 h-3 text-stone-300" />
                        <Link 
                            href={`/tai-lieu-so?category=${item.slug}`}
                            className={`text-xs font-bold uppercase tracking-widest ${idx === breadcrumbPath.length - 1 ? 'text-gold-dark' : 'text-stone-400 hover:text-stone-600'}`}
                        >
                            {item.name_vi}
                        </Link>
                    </React.Fragment>
                ))}
            </nav>
        );
    };

    return (
        <div className="animate-in fade-in duration-1000">
            {/* 1. Search & Filter Bar */}
            <SearchFilterBar 
                authors={authors} 
                totalCount={totalCount} 
            />

            {/* 2. Breadcrumbs (Only if category selected) */}
            {renderBreadcrumbs()}

            {/* 3. Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {currentTab === 'albums' ? (
                    albums.map((album: any) => (
                        <AlbumCard key={album.id} album={album} />
                    ))
                ) : (
                    documents.map((doc: any) => (
                        <DocumentCard 
                            key={doc.id} 
                            doc={doc} 
                            onPreview={() => setSelectedMedia(doc)} 
                        />
                    ))
                )}
            </div>

            {/* 4. No Results State */}
            {totalCount === 0 && (
                <div className="py-20 text-center">
                    <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <LayoutGrid className="w-10 h-10 text-stone-300" />
                    </div>
                    <h3 className="text-xl font-bold text-stone-800 mb-2">Không tìm thấy tài liệu nào</h3>
                    <p className="text-stone-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
                </div>
            )}

            {/* 5. Preview Modal */}
            <MediaPreviewModal 
                isOpen={!!selectedMedia} 
                onClose={() => setSelectedMedia(null)} 
                doc={selectedMedia} 
            />
        </div>
    );
}

// Internal components to avoid prop drilling if possible, but kept here for clarity in one file
function isNewItem(dateString: string) {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
}

const NewBadge = () => (
    <div className="absolute top-3 right-3 z-20">
        <span className="flex items-center gap-1 bg-amber-400 text-amber-900 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-lg animate-pulse border border-white/50">
            <span className="w-1.5 h-1.5 bg-amber-900 rounded-full animate-ping" />
            Mới
        </span>
    </div>
);

function getThumbnailUrl(doc: any) {
    if (doc.thumbnail_url) return doc.thumbnail_url;
    const url = doc.url;
    if (!url || typeof url !== 'string') return null;

    if (url.includes('res.cloudinary.com') && url.toLowerCase().endsWith('.pdf')) {
        return url
            .replace(/\.pdf($|\?)/i, '.jpg$1')
            .replace('/upload/', '/upload/f_auto,q_auto,pg_1/');
    }
    return (doc.type === 'image') || /\.(jpg|jpeg|png|webp|avif|gif)($|\?)/i.test(url) ? url : null;
}

function DocumentCard({ doc, onPreview }: any) {
    const displayImage = getThumbnailUrl(doc);
    return (
        <div 
            onClick={onPreview}
            className="group cursor-pointer flex flex-col h-full bg-white border-b border-r border-stone-200 hover:border-gold-primary/50 hover:bg-stone-50 transition-all duration-300"
        >
            <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 border-b border-stone-100">
                {displayImage ? (
                    <Image 
                        src={displayImage} 
                        alt={doc.title_vi} 
                        fill 
                        className="object-cover mix-blend-multiply opacity-90 transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-stone-100 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                        <span className="font-serif text-lg text-stone-400 italic">
                            {doc.type}
                        </span>
                    </div>
                )}
                {isNewItem(doc.created_at) && (
                    <div className="absolute top-0 right-0 bg-gold-primary text-white text-[10px] uppercase tracking-widest px-2 py-1 font-serif">
                        Mới
                    </div>
                )}
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <span className="block text-[10px] text-stone-400 uppercase tracking-widest mb-2 font-medium">
                        {doc.type}
                    </span>
                    <h3 className="text-stone-900 text-base font-serif leading-snug group-hover:text-gold-dark transition-colors mb-2">
                        {doc.title_vi}
                    </h3>
                </div>
                <p className="text-xs text-stone-500 font-serif italic mt-auto border-t border-stone-100 pt-3">
                    {doc.author_name_vi || 'Nhiều Tác Giả'}
                </p>
            </div>
        </div>
    );
}

function AlbumCard({ album }: any) {
    return (
        <Link 
            href={`/tai-lieu-so/album/${album.id}`}
            className="group flex flex-col h-full bg-white border-b border-r border-stone-200 hover:border-gold-primary/50 hover:bg-stone-50 transition-all duration-300"
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 border-b border-stone-100">
                <Image src={album.coverUrl || '/placeholder-album.jpg'} alt={album.name_vi} fill className="object-cover mix-blend-multiply opacity-90 transition-transform duration-700 group-hover:scale-105" />
                {isNewItem(album.created_at) && (
                    <div className="absolute top-0 right-0 bg-gold-primary text-white text-[10px] uppercase tracking-widest px-2 py-1 font-serif">
                        Mới
                    </div>
                )}
                
                <div className="absolute top-3 left-3">
                    <span className="bg-stone-900/80 text-white text-[9px] uppercase tracking-widest px-2 py-1 font-serif">
                        {album._count || 0} Ảnh
                    </span>
                </div>
            </div>
            <div className="p-5 text-center flex-1 flex flex-col justify-center">
                <span className="block text-[10px] text-stone-400 uppercase tracking-widest mb-2 font-medium">
                    Album Hiện Vật
                </span>
                <h3 className="font-serif text-base text-stone-900 group-hover:text-gold-dark transition-colors line-clamp-2">
                    {album.name_vi}
                </h3>
            </div>
        </Link>
    );
}
