'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// @ts-ignore
import { MediaUploader } from '@/components/admin/media-uploader';
// @ts-ignore
import { DeleteMediaButton } from '@/components/admin/delete-media-button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MediaDetailDialog } from '@/components/admin/media-detail-dialog';
import { CategoryNode } from '@/lib/cache/queries';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomCategorySelect } from '@/components/admin/custom-category-select';
import { Checkbox } from '@/components/ui/checkbox';
import { BulkMediaActionsBar } from '@/components/admin/bulk-media-actions-bar';
interface MediaListClientProps {
    tenantId: string;
    media: any[];
    categoriesTree: CategoryNode[];
    tenants: any[];
}

const flattenCategories = (nodes: CategoryNode[], level = 0): { id: string; name: string; level: number; module: string | null; isGlobal: boolean }[] => {
    let result: { id: string; name: string; level: number; module: string | null; isGlobal: boolean }[] = [];
    const GLOBAL_TENANT_ID = '55555555-5555-5555-5555-555555555555';
    
    nodes.forEach(node => {
        result.push({ 
            id: node.id, 
            name: node.name_vi, 
            level, 
            module: node.module,
            isGlobal: node.tenant_id === GLOBAL_TENANT_ID
        });
        if (node.children && node.children.length > 0) {
            result = result.concat(flattenCategories(node.children, level + 1));
        }
    });
    return result;
};

export function MediaListClient({ tenantId, media, categoriesTree, tenants }: MediaListClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    // mainTab: 'images' | 'documents'
    const [mainTab, setMainTab] = useState('images');
    // subTab cho images: 'album' | 'image'
    const [imageSubTab, setImageSubTab] = useState('album');
    // subTab cho documents: 'audio' | 'video' | 'document' | 'all_docs'
    const [docSubTab, setDocSubTab] = useState('all_docs');

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
    const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Global filters & selections
    const [filterTenantId, setFilterTenantId] = useState<string>('all');
    const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);

    const flatCategories = flattenCategories(categoriesTree);

    // Lọc chung theo chi nhánh (chỉ dành cho admin tổng)
    let filteredMedia = media;
    if (!tenantId && filterTenantId !== 'all') {
        filteredMedia = filteredMedia.filter((m: any) => m.tenant_id === filterTenantId || (m.published_to && m.published_to.includes(filterTenantId)));
    }

    // Tính list tài liệu cho từng Main Tab
    // Hình ảnh
    let imageMedia = filteredMedia.filter((m: any) => m.type === 'image');
    if (selectedCategoryId !== 'all') {
        imageMedia = imageMedia.filter((m: any) => m.category_id === selectedCategoryId);
    }
    const albums = flatCategories.map(cat => {
        const catImages = filteredMedia.filter(m => m.type === 'image' && m.category_id === cat.id);
        return {
            ...cat,
            imageCount: catImages.length,
            coverImage: catImages.length > 0 ? catImages[0].url : null
        };
    }).filter(a => a.imageCount > 0);

    // Tài liệu (Kinh Sách)
    let docMedia = filteredMedia.filter((m: any) => ['audio', 'video', 'document'].includes(m.type));
    if (selectedCategoryId !== 'all') {
        docMedia = docMedia.filter((m: any) => m.category_id === selectedCategoryId);
    }
    if (docSubTab !== 'all_docs') {
        docMedia = docMedia.filter((m: any) => m.type === docSubTab);
    }

    const handleMediaClick = (item: any) => {
        setSelectedMedia(item);
        setDialogOpen(true);
    };

    const toggleSelection = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSelectedMediaIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-playfair font-bold">Thư viện (Media)</h1>
                {isPending && <span className="text-sm text-gold-primary animate-pulse font-medium">Đang cập nhật danh sách...</span>}
            </div>

            {/* Upload Section */}
            <MediaUploader
                tenantId={tenantId}
                categoriesTree={categoriesTree}
                tenants={tenants}
                onUploadComplete={() => {
                    startTransition(() => {
                        router.refresh();
                    });
                }}
            />

            {/* Main Tabs Navigation */}
            <div className={`mt-8 ${isPending ? "opacity-50 pointer-events-none" : "transition-opacity duration-300"}`}>
                <Tabs value={mainTab} onValueChange={(v: string) => {
                    setMainTab(v);
                    setSelectedCategoryId('all'); // Reset danh mục khi chuyển tab chính
                    setSelectedMediaIds([]); // Reset lựa chọn tài liệu khi chuyển tab
                }}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <TabsList className="bg-white border rounded-xl shadow-sm h-12 p-1">
                            <TabsTrigger value="images" className="rounded-lg font-bold data-[state=active]:bg-gold-primary data-[state=active]:text-white">
                                Hình Ảnh & Album
                            </TabsTrigger>
                            <TabsTrigger value="documents" className="rounded-lg font-bold data-[state=active]:bg-gold-primary data-[state=active]:text-white">
                                Kinh Sách & Tài Liệu
                            </TabsTrigger>
                        </TabsList>

                        {/* Standardized Category Filter */}
                        <div className="w-full sm:w-[280px]">
                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Lọc theo danh mục</p>
                            <CustomCategorySelect
                                value={selectedCategoryId}
                                onChange={(val: string) => setSelectedCategoryId(val)}
                                localCategories={flatCategories.filter(cat => 
                                    (mainTab === 'images' ? cat.module === 'media' : cat.module === 'documents') && !cat.isGlobal
                                ).map(c => ({...c, name_vi: c.name}))}
                                globalCategories={flatCategories.filter(cat => 
                                    (mainTab === 'images' ? cat.module === 'media' : cat.module === 'documents') && cat.isGlobal
                                ).map(c => ({...c, name_vi: c.name}))}
                                placeholder="Tất cả danh mục"
                                className="shadow-sm"
                            />
                            {selectedCategoryId !== 'all' && (
                                <button 
                                    onClick={() => setSelectedCategoryId('all')}
                                    className="text-[10px] text-gold-dark hover:underline mt-1 ml-1"
                                >
                                    ✕ Xóa lọc danh mục
                                </button>
                            )}
                        </div>

                        {/* Tenant Filter (Only global admin) */}
                        {!tenantId && tenants && tenants.length > 0 && (
                            <div className="w-full sm:w-[280px]">
                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Lọc theo chi nhánh</p>
                                <Select value={filterTenantId} onValueChange={setFilterTenantId}>
                                    <SelectTrigger className="w-full bg-white">
                                        <SelectValue placeholder="Tất cả chi nhánh" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả (Toàn hệ thống)</SelectItem>
                                        {tenants.map(t => (
                                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {filterTenantId !== 'all' && (
                                    <button 
                                        onClick={() => setFilterTenantId('all')}
                                        className="text-[10px] text-gold-dark hover:underline mt-1 ml-1"
                                    >
                                        ✕ Xóa lọc chi nhánh
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <TabsContent value="images" className="mt-0">
                        <div className="flex items-center gap-4 mb-6">
                            <Tabs value={imageSubTab} onValueChange={setImageSubTab}>
                                <TabsList>
                                    <TabsTrigger value="album">Danh sách Album ({albums.length})</TabsTrigger>
                                    <TabsTrigger value="image">Tất cả Ảnh rời ({media.filter((m: any) => m.type === 'image').length})</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        {imageSubTab === 'album' ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {albums.length > 0 ? albums.map(album => (
                                    <div
                                        key={album.id}
                                        className="group cursor-pointer flex flex-col bg-white p-3 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-all"
                                        onClick={() => {
                                            setSelectedCategoryId(album.id);
                                            setImageSubTab('image');
                                        }}
                                    >
                                        <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden relative mb-3">
                                            {album.coverImage ? (
                                                <Image
                                                    src={album.coverImage}
                                                    alt={album.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">Không có ảnh</div>
                                            )}
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md font-medium">
                                                {album.imageCount} ảnh
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-gray-900 group-hover:text-gold-dark transition-colors line-clamp-2 px-1 text-sm">
                                            {album.name}
                                        </h3>
                                    </div>
                                )) : (
                                    <div className="col-span-full text-center py-12 text-gray-500">
                                        Chưa có Album ảnh nào. Hãy tải ảnh lên và gắn vào danh mục.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Card className="border-stone-200 shadow-sm rounded-2xl overflow-hidden">
                                <CardContent className="p-6">
                                    {imageMedia.length > 0 ? (
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            {imageMedia.map((item: any) => (
                                                <div key={item.id} className="group relative cursor-pointer" onClick={() => handleMediaClick(item)}>
                                                    <div className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border transition-all ${selectedMediaIds.includes(item.id) ? 'border-gold-primary ring-2 ring-gold-primary shadow-md' : 'border-gray-200'}`}>
                                                        <Image
                                                            src={item.url}
                                                            alt={item.title_vi || 'Media'}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform"
                                                            unoptimized
                                                        />
                                                        {/* Checkbox */}
                                                        <div className="absolute top-2 left-2 z-10" onClick={(e) => toggleSelection(e, item.id)}>
                                                            <Checkbox checked={selectedMediaIds.includes(item.id)} className={`w-5 h-5 rounded ${selectedMediaIds.includes(item.id) ? 'bg-gold-primary border-gold-primary opacity-100' : 'bg-white opacity-0 group-hover:opacity-100 border-gray-300'}`} />
                                                        </div>
                                                        {/* Delete button (existing) */}
                                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={(e) => e.stopPropagation()}>
                                                            <DeleteMediaButton tenantId={tenantId} id={item.id} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">Chưa có ảnh nào</div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="documents" className="mt-0">
                        <div className="flex items-center gap-4 mb-6">
                            <Tabs value={docSubTab} onValueChange={setDocSubTab}>
                                <TabsList>
                                    <TabsTrigger value="all_docs">Tất cả ({media.filter((m: any) => ['audio', 'video', 'document'].includes(m.type)).length})</TabsTrigger>
                                    <TabsTrigger value="audio">Pháp âm ({media.filter((m: any) => m.type === 'audio').length})</TabsTrigger>
                                    <TabsTrigger value="video">Video ({media.filter((m: any) => m.type === 'video').length})</TabsTrigger>
                                    <TabsTrigger value="document">PDF/Sách ({media.filter((m: any) => m.type === 'document').length})</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        <Card className="border-stone-200 shadow-sm rounded-2xl overflow-hidden">
                            <CardContent className="p-6">
                                {docMedia.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                        {docMedia.map((item: any) => (
                                            <div key={item.id} className={`group relative cursor-pointer flex flex-col items-center bg-stone-50 rounded-xl p-4 transition-all border ${selectedMediaIds.includes(item.id) ? 'border-gold-primary ring-2 ring-gold-primary bg-gold-primary/5 shadow-md' : 'border-stone-200 hover:bg-stone-100'}`} onClick={() => handleMediaClick(item)}>
                                                {/* Checkbox */}
                                                <div className="absolute top-2 left-2 z-10" onClick={(e) => toggleSelection(e, item.id)}>
                                                    <Checkbox checked={selectedMediaIds.includes(item.id)} className={`w-5 h-5 rounded ${selectedMediaIds.includes(item.id) ? 'bg-gold-primary border-gold-primary opacity-100' : 'bg-white opacity-0 group-hover:opacity-100 border-gray-300'}`} />
                                                </div>
                                                <div className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-sm mb-3">
                                                    {item.type === 'video' && <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}
                                                    {item.type === 'audio' && <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>}
                                                    {item.type === 'document' && <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                                                </div>
                                                <p className="text-sm font-bold text-stone-800 text-center line-clamp-2 w-full mb-1">{item.title_vi || 'Chưa đặt tên'}</p>
                                                {item.author_name_vi && <span className="text-[10px] text-stone-500 italic text-center w-full truncate">{item.author_name_vi}</span>}
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 z-10" onClick={(e) => e.stopPropagation()}>
                                                    <DeleteMediaButton tenantId={tenantId} id={item.id} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">Chưa có tài liệu nào</div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <BulkMediaActionsBar
                tenantId={tenantId}
                selectedIds={selectedMediaIds}
                onClearSelection={() => setSelectedMediaIds([])}
                onRefresh={() => startTransition(() => router.refresh())}
                categoriesTree={categoriesTree}
                tenants={tenants}
                mainTab={mainTab}
            />

            <MediaDetailDialog
                tenantId={tenantId}
                media={selectedMedia}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                categoriesTree={categoriesTree}
                tenants={tenants}
                onUpdateComplete={() => {
                    startTransition(() => {
                        router.refresh();
                    });
                }}
            />
        </div>
    );
}
