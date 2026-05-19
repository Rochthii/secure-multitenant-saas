'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { uploadMedia } from '@/app/actions/admin/upload';
import { createCategory } from '@/app/actions/admin/category';
import { compressImageToWebP, calcSavedPercent } from '@/lib/utils/compress-image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MEDIA_CATEGORIES } from '@/lib/constants/media';
import { toast } from 'sonner';
import type { CategoryNode } from '@/lib/cache/queries';
import { Input } from '@/components/ui/input';
import { CustomCategorySelect } from '@/components/admin/custom-category-select';
import { TenantBroadcastSelect } from '@/components/admin/tenant-broadcast-select';

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconUpload = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" aria-hidden="true">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);
const IconLink = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
);
const IconFile = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400" aria-hidden="true">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
);
const IconX = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const IconLoader = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 animate-spin mr-2" aria-hidden="true">
        <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
);
const IconCheck = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const IconImage = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
    </svg>
);
const IconVideo = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
);
const IconAudio = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
    </svg>
);
const IconDoc = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M4 22h14a2 2 0 002-2V7.5L14.5 2H6a2 2 0 00-2 2v16z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
);

// ─── URL Detection (client side preview) ─────────────────────────────────────
type DetectedInfo = {
    type: 'youtube' | 'tiktok' | 'facebook' | 'image' | 'video' | 'audio' | null;
    label: string;
    icon: React.ReactNode;
    thumbnail?: string;
    youtubeId?: string;
};

function detectUrl(url: string): DetectedInfo | null {
    if (!url.trim()) return null;
    const u = url.trim();

    const ytMatch = u.match(/(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/);
    if (ytMatch) {
        const id = ytMatch[1];
        return {
            type: 'youtube', label: 'YouTube Video', icon: <IconVideo />,
            thumbnail: `https://img.youtube.com/vi/${id}/mqdefault.jpg`, youtubeId: id,
        };
    }
    if (/tiktok\.com\/@[\w.]+\/video\/\d+/.test(u) || /vm\.tiktok\.com\//.test(u) || /vt\.tiktok\.com\//.test(u)) return { type: 'tiktok', label: 'TikTok Video', icon: <IconVideo /> };
    if (/(?:facebook\.com|fb\.watch|m\.facebook\.com)/.test(u) && (/\/videos?\//.test(u) || /fb\.watch\//.test(u) || /\/watch/.test(u))) return { type: 'facebook', label: 'Facebook Video', icon: <IconVideo /> };
    if (/\.(jpg|jpeg|png|gif|webp|avif|svg|bmp|tiff|tif|heic|heif|ico)(\?.*)?$/i.test(u)) return { type: 'image', label: 'Ảnh trực tiếp', icon: <IconImage />, thumbnail: u };
    if (/\.(mp4|webm|mov|avi|mkv|flv|wmv|m4v)(\?.*)?$/i.test(u)) return { type: 'video', label: 'Video trực tiếp', icon: <IconVideo /> };
    if (/\.(mp3|wav|ogg|m4a|flac|aac|opus|wma)(\?.*)?$/i.test(u)) return { type: 'audio', label: 'Audio trực tiếp', icon: <IconAudio /> };

    return null;
}

const SOURCE_COLORS: Record<string, string> = {
    youtube: 'bg-red-100 text-red-700 border-red-200',
    tiktok: 'bg-gray-900 text-white border-gray-700',
    facebook: 'bg-blue-100 text-blue-700 border-blue-200',
    image: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    video: 'bg-purple-100 text-purple-700 border-purple-200',
    audio: 'bg-orange-100 text-orange-700 border-orange-200',
};

// ─── Component ────────────────────────────────────────────────────────────────

interface MediaUploaderProps {
    tenantId: string;
    onUploadComplete?: () => void;
    categoriesTree?: CategoryNode[];
    tenants?: any[];
}

export function MediaUploader({ tenantId, onUploadComplete, categoriesTree, tenants }: MediaUploaderProps) {
    const [activeMode, setActiveMode] = useState<'image' | 'document' | 'link'>('image');

    // File mode
    const [filesData, setFilesData] = useState<{ id: string, file: File, title: string }[]>([]);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    // Category selection
    const [categoryId, setCategoryId] = useState('');

    // Publishing scope selection
    const [publishedTo, setPublishedTo] = useState<string[]>([]);
    
    // Quick album
    const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
    const [newAlbumName, setNewAlbumName] = useState('');

    // Link mode
    const [linkUrl, setLinkUrl] = useState('');
    const [linkTitle, setLinkTitle] = useState('');
    const [linkCategory, setLinkCategory] = useState('');
    const [addingLink, setAddingLink] = useState(false);
    const [detected, setDetected] = useState<DetectedInfo | null>(null);
    const [detectionError, setDetectionError] = useState(false);

    // Keep track of newly created categories to show them immediately in UI
    const [newlyCreatedCategories, setNewlyCreatedCategories] = useState<{ id: string; name_vi: string; level: number; module: string | null; isGlobal: boolean }[]>([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!linkUrl.trim()) { setDetected(null); setDetectionError(false); return; }
            const info = detectUrl(linkUrl);
            setDetected(info);
            setDetectionError(!info && linkUrl.trim().length > 10);
        }, 400);
        return () => clearTimeout(timer);
    }, [linkUrl]);

    // ── Drag & Drop ───────────────────────────────────────────────────────────
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    }, []);

    const processFiles = (newFiles: File[]) => {
        const mapped = newFiles.map(f => ({
            id: Math.random().toString(36).substring(7),
            file: f,
            title: f.name.replace(/\.[^/.]+$/, "") // Remove extension
        }));
        setFilesData(prev => [...prev, ...mapped]);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files) processFiles(Array.from(e.dataTransfer.files));
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) processFiles(Array.from(e.target.files));
        // Reset input để có thể chọn lại cùng 1 file nếu bị huỷ
        e.target.value = '';
    };

    const removeFile = (id: string) => setFilesData(prev => prev.filter(f => f.id !== id));
    const updateTitle = (id: string, newTitle: string) => {
        setFilesData(prev => prev.map(f => f.id === id ? { ...f, title: newTitle } : f));
    }

    const handleCreateAlbum = async () => {
        if (!newAlbumName.trim()) return;
        setIsCreatingAlbum(true);
        const fd = new FormData();
        fd.append('name_vi', newAlbumName);
        fd.append('module', 'media');
        fd.append('tenant_id', tenantId || '');
        // explicitly hide from public header/nav
        fd.append('is_visible', 'false'); 

        const res = await createCategory(fd);
        setIsCreatingAlbum(false);

        if (res.success && res.data) {
            toast.success(`Đã tạo Album: ${newAlbumName}`);
            setNewAlbumName('');
            setNewlyCreatedCategories(prev => [...prev, { 
                id: res.data.id, 
                name_vi: res.data.name_vi, 
                level: 0, 
                module: res.data.module, 
                isGlobal: false 
            }]);
            setCategoryId(res.data.id);
            onUploadComplete?.();
        } else {
            toast.error(res.error || 'Tạo album thất bại');
        }
    };

    const handleUpload = async () => {
        if (!filesData.length) return;
        setUploading(true);
        try {
            const files = filesData.map(f => f.file);
            const titles = filesData.map(f => f.title);

            // Only compress if they are images (for activeMode = image)
            const compressed = await Promise.all(files.map(f => f.type.startsWith('image/') ? compressImageToWebP(f) : f));
            const fd = new FormData();
            compressed.forEach(f => fd.append('files', f));
            fd.append('titles', JSON.stringify(titles));
            if (categoryId) fd.append('category_id', categoryId);
            if (publishedTo.length > 0) fd.append('published_to', JSON.stringify(publishedTo));

            const result = await uploadMedia(fd, tenantId);
            if (result.success) {
                toast.success(`✅ Upload thành công ${files.length} file`);
                setFilesData([]); setCategoryId(''); setPublishedTo([]);
                onUploadComplete?.();
            } else {
                toast.error(result.error || 'Upload thất bại');
            }
        } catch { toast.error('Có lỗi xảy ra khi upload'); }
        finally { setUploading(false); }
    };

    // Link submit
    const handleAddLink = async () => {
        if (!linkUrl.trim()) return;
        setAddingLink(true);
        try {
            const res = await fetch('/api/admin/media/link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    url: linkUrl, 
                    title_vi: linkTitle || undefined, 
                    category_id: linkCategory || undefined, 
                    tenant_id: tenantId,
                    published_to: publishedTo.length > 0 ? publishedTo : undefined
                }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Đã thêm link media thành công');
                setLinkUrl(''); setLinkTitle(''); setLinkCategory(''); setDetected(null); setPublishedTo([]);
                onUploadComplete?.();
            } else { toast.error(data.error); }
        } catch { toast.error('Lỗi kết nối'); }
        finally { setAddingLink(false); }
    };

    const flattenCategories = (nodes: CategoryNode[], level = 0): { id: string; name_vi: string; level: number; module: string | null; isGlobal: boolean }[] => {
        let result: { id: string; name_vi: string; level: number; module: string | null; isGlobal: boolean }[] = [];
        const GLOBAL_TENANT_ID = '55555555-5555-5555-5555-555555555555';
        nodes.forEach(node => {
            result.push({ 
                id: node.id, 
                name_vi: node.name_vi, 
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

    // Helper options with Local/Global support
    const flat = categoriesTree ? flattenCategories(categoriesTree) : [];
    
    const getGroups = (modules: string[]) => {
        const filtered = flat.filter(c => modules.includes(c.module || ''));
        const newlyCreated = newlyCreatedCategories.filter(c => modules.includes(c.module || ''));
        
        // Merge without duplicates (in case router.refresh eventually populates it)
        const combinedLocal = [
            ...filtered.filter(c => !c.isGlobal),
            ...newlyCreated.filter(nc => !filtered.some(f => f.id === nc.id))
        ];

        return {
            local: combinedLocal,
            global: filtered.filter(c => c.isGlobal)
        };
    };

    const imageGroups = getGroups(['media']);
    const docGroups = getGroups(['documents', 'audio_video']);

    return (
        <div className="space-y-4">
            {/* Mode selection */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-stone-100 rounded-xl mb-6">
                <button type="button" onClick={() => { setActiveMode('image'); setFilesData([]); setCategoryId(''); }} className={`flex justify-center items-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeMode === 'image' ? 'bg-white text-gold-dark shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
                    <IconImage /> Upload Ảnh
                </button>
                <button type="button" onClick={() => { setActiveMode('document'); setFilesData([]); setCategoryId(''); }} className={`flex justify-center items-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeMode === 'document' ? 'bg-white text-blue-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
                    <IconDoc /> Tải Tài liệu (PDF/Video/Audio)
                </button>
                <button type="button" onClick={() => setActiveMode('link')} className={`flex justify-center items-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeMode === 'link' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
                    <IconLink /> Dán Link
                </button>
            </div>

            {/* Render forms based on active mode */}
            {activeMode === 'link' ? (
                <Card className="p-5 space-y-4">
                    <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">Dán link vào đây:</p>
                        <div className={`flex items-center gap-2 border-2 rounded-lg px-3 py-2 transition-colors ${detected ? 'border-emerald-400 bg-emerald-50/50' : detectionError ? 'border-red-300 bg-red-50/30' : 'border-gray-200 focus-within:border-gold-primary'}`}>
                            <div className="text-gray-400 flex-shrink-0"><IconLink /></div>
                            <input type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="flex-1 text-sm bg-transparent outline-none placeholder:text-gray-400" />
                            {detected && <span className="text-emerald-500 flex-shrink-0"><IconCheck /></span>}
                        </div>
                    </div>

                    {detected && (
                        <div className={`flex items-start gap-3 p-3 rounded-lg border ${SOURCE_COLORS[detected.type!] || 'bg-gray-50 border-gray-200'}`}>
                            {detected.thumbnail ? (
                                <img src={detected.thumbnail} alt="preview" className="w-20 h-14 object-cover rounded-md flex-shrink-0 bg-gray-200" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            ) : (
                                <div className="w-20 h-14 rounded-md bg-white/30 flex items-center justify-center flex-shrink-0">{detected.icon}</div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold uppercase tracking-wide opacity-80">✓ Nhận diện thành công</p>
                                <p className="font-semibold text-sm mt-0.5">{detected.label}</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề (tuỳ chọn)</label>
                        <input type="text" value={linkTitle} onChange={e => setLinkTitle(e.target.value)} placeholder="Tên hiển thị..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-primary/30" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {detected?.type === 'image' ? 'Danh mục (Album ảnh)' : 'Danh mục (Sách hoặc Video/Audio)'}
                        </label>
                        <CustomCategorySelect 
                            value={linkCategory} 
                            onChange={setLinkCategory} 
                            localCategories={detected?.type === 'image' ? imageGroups.local : docGroups.local} 
                            globalCategories={detected?.type === 'image' ? imageGroups.global : docGroups.global}
                            placeholder={detected?.type === 'image' ? 'Chọn danh mục ảnh...' : 'Chọn danh mục tài liệu...'}
                        />
                    </div>

                    {tenants && tenants.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Xuất bản đến các chi nhánh (Tuỳ chọn)</label>
                            <TenantBroadcastSelect
                                tenants={tenants}
                                selectedTenantIds={publishedTo}
                                onChange={setPublishedTo}
                                ownerTenantId={tenantId}
                            />
                        </div>
                    )}

                    <Button onClick={handleAddLink} disabled={addingLink || !detected} className="w-full bg-gold-primary hover:bg-gold-dark text-white disabled:opacity-50">
                        {addingLink ? <><IconLoader />Đang lưu...</> : '+ Thêm vào thư viện'}
                    </Button>
                </Card>
            ) : (
                <div className="space-y-4">
                    {/* Danh mục & Tao Album nhanh */}
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-end gap-3">
                        <div className="flex-1 w-full">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {activeMode === 'image' ? "Chọn Album ảnh (Danh mục)" : "Chọn Danh mục Kinh sách / Pháp âm"}
                                </label>
                                <CustomCategorySelect
                                    value={categoryId}
                                    onChange={setCategoryId}
                                    localCategories={activeMode === 'image' ? imageGroups.local : docGroups.local}
                                    globalCategories={activeMode === 'image' ? imageGroups.global : docGroups.global}
                                    placeholder={activeMode === 'image' ? "Chọn album ảnh..." : "Chọn danh mục tài liệu..."}
                                />
                            </div>
                        </div>
                        {activeMode === 'image' && (
                            <div className="w-full sm:w-auto flex gap-2">
                                <Input
                                    className="w-full sm:w-48 bg-white"
                                    placeholder="Tên Album mới..."
                                    value={newAlbumName}
                                    onChange={e => setNewAlbumName(e.target.value)}
                                />
                                <Button
                                    variant="outline"
                                    onClick={handleCreateAlbum}
                                    disabled={!newAlbumName.trim() || isCreatingAlbum}
                                >
                                    {isCreatingAlbum ? <IconLoader /> : 'Tạo nhanh'}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Drop Zone */}
                    <Card
                        className={`border-2 border-dashed p-8 transition-all cursor-pointer bg-white ${dragActive ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-stone-300 hover:border-primary hover:bg-primary/5'}`}
                        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                    >
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className={`rounded-full p-4 transition-colors ${dragActive ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                                <IconUpload />
                            </div>
                            <div>
                                <p className="text-lg font-medium text-stone-900">Kéo thả {activeMode === 'image' ? 'hình ảnh' : 'tài liệu'} vào đây</p>
                                <p className="text-sm text-stone-500">hoặc click nút bên dưới</p>
                            </div>
                            <input
                                type="file" multiple onChange={handleFileInput}
                                className="hidden" id="file-upload"
                                accept={activeMode === 'image' ? 'image/*' : 'application/pdf,audio/*,video/*'}
                            />
                            <label htmlFor="file-upload">
                                <span className="inline-flex items-center px-4 py-2 border border-stone-300 rounded-lg text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 cursor-pointer transition-colors shadow-sm">
                                    Chọn file tải lên
                                </span>
                            </label>
                            <p className="text-xs text-stone-400">
                                {activeMode === 'image' ? 'Chỉ hỗ trợ file ảnh (.png, .jpg, .webp...) — Max 10MB' : 'Chỉ hỗ trợ PDF, Âm thanh, Video — Max 100MB'}
                            </p>
                        </div>
                    </Card>

                    {/* File List Editable */}
                    {filesData.length > 0 && (
                        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 animate-in fade-in slide-in-from-bottom-2">
                            <h3 className="mb-3 font-semibold text-stone-900 flex justify-between items-center">
                                <span>Đã chọn {filesData.length} file</span>
                                <span className="text-xs text-stone-400 font-normal">Sửa tên file trước khi tải lên (tuỳ chọn)</span>
                            </h3>
                            <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                                {filesData.map((fData) => (
                                    <div key={fData.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-lg border border-stone-100 p-2.5 bg-stone-50 hover:bg-stone-100 transition-colors">
                                        <div className="flex items-center gap-2 min-w-[30%] sm:w-1/3">
                                            {activeMode === 'image' ? <IconImage /> : <IconDoc />}
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-stone-900 truncate" title={fData.file.name}>{fData.file.name}</p>
                                                <p className="text-[10px] text-stone-500">{(fData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 w-full">
                                            <Input
                                                className="h-8 text-sm"
                                                value={fData.title}
                                                onChange={e => updateTitle(fData.id, e.target.value)}
                                                placeholder="Sửa tên file sẽ hiển thị..."
                                            />
                                        </div>
                                        <button onClick={() => removeFile(fData.id)} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0 self-end sm:self-auto bg-white rounded-md border border-stone-200">
                                            <IconX />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {tenants && tenants.length > 0 && (
                                <div className="mt-4 border-t pt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Xuất bản đến các chi nhánh (Tuỳ chọn)</label>
                                    <TenantBroadcastSelect
                                        tenants={tenants}
                                        selectedTenantIds={publishedTo}
                                        onChange={setPublishedTo}
                                        ownerTenantId={tenantId}
                                    />
                                </div>
                            )}

                            <Button
                                onClick={handleUpload} disabled={uploading}
                                className="mt-4 w-full bg-gold-primary hover:bg-gold-dark text-white font-bold h-12 text-base"
                            >
                                {uploading ? <><IconLoader />Đang upload và tối ưu {filesData.length} file...</> : `⬆ XÁC NHẬN TẢI LÊN ${filesData.length} FILE`}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Constants ──────────────────────────────────────────────────────────────
const flattenCategories = (nodes: CategoryNode[], level = 0): { id: string; name_vi: string; level: number; module: string | null; isGlobal: boolean }[] => {
    let result: { id: string; name_vi: string; level: number; module: string | null; isGlobal: boolean }[] = [];
    const GLOBAL_TENANT_ID = '55555555-5555-5555-5555-555555555555';
    
    nodes.forEach(node => {
        result.push({ 
            id: node.id, 
            name_vi: node.name_vi, 
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
