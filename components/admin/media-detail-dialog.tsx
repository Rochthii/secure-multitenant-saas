'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { formatDate } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { updateMediaMetadata } from '@/app/actions/admin/media';
import { getItemTags } from '@/app/actions/admin/tags';
import { TagInput } from '@/components/admin/tag-input';
import { Badge } from '@/components/ui/badge';
import { Hash, Globe } from 'lucide-react';
import type { CategoryNode } from '@/lib/cache/queries';
import { TenantBroadcastSelect } from '@/components/admin/tenant-broadcast-select';
import { CustomCategorySelect } from '@/components/admin/custom-category-select';

// Icons
const IconCopy = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>;
const IconCheck = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><polyline points="20 6 9 17 4 12" /></svg>;
const IconDownload = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
const IconExternal = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>;
const IconEdit = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const IconLoader = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 animate-spin mr-2"><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>;

const flattenCategories = (nodes: CategoryNode[], level = 0): { id: string; name_vi: string; level: number; isGlobal: boolean }[] => {
    let result: { id: string; name_vi: string; level: number; isGlobal: boolean }[] = [];
    const GLOBAL_TENANT_ID = '55555555-5555-5555-5555-555555555555';

    nodes?.forEach(node => {
        result.push({ 
            id: node.id, 
            name_vi: node.name_vi, 
            level, 
            isGlobal: node.tenant_id === GLOBAL_TENANT_ID 
        });
        if (node.children && node.children.length > 0) {
            result = result.concat(flattenCategories(node.children, level + 1));
        }
    });
    return result;
};

interface MediaDetailDialogProps {
    tenantId: string;
    media: any | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categoriesTree?: CategoryNode[];
    tenants?: any[];
    onUpdateComplete?: () => void;
}

export function MediaDetailDialog({ tenantId, media, open, onOpenChange, categoriesTree, tenants, onUpdateComplete }: MediaDetailDialogProps) {
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isPending, startTransition] = useTransition();

    const [formState, setFormState] = useState({
        title_vi: '',
        description_vi: '',
        category_id: '',
        published_to: [] as string[],
    });
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [itemTags, setItemTags] = useState<any[]>([]);

    useEffect(() => {
        if (media) {
            setFormState({
                title_vi: media.title_vi || '',
                description_vi: media.description_vi || '',
                category_id: media.category_id || '',
                published_to: media.published_to || [],
            });
            setIsEditing(false);

            // Fetch tags
            const fetchTags = async () => {
                const tags = await getItemTags('media_tags', media.id, tenantId);
                setItemTags(tags);
                setSelectedTagIds(tags.map((t: any) => t.id));
            };
            fetchTags();
        }
    }, [media, open]);

    if (!media) return null;

    const flatCategories = categoriesTree ? flattenCategories(categoriesTree) : [];

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(media.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = async () => {
        const formData = new FormData();
        formData.append('title_vi', formState.title_vi);
        formData.append('description_vi', formState.description_vi);
        formData.append('type', media.type); // Không cho phép đổi type
        formData.append('url', media.url); // Không cho phép đổi url
        if (formState.category_id) formData.append('category_id', formState.category_id);
        formData.append('published_to', JSON.stringify(formState.published_to));
        formData.append('tag_ids', JSON.stringify(selectedTagIds));

        startTransition(async () => {
            const res = await updateMediaMetadata(tenantId, media.id, formData);
            if (res.success) {
                toast.success('Cập nhật thông tin thành công');
                setIsEditing(false);
                onUpdateComplete?.();
            } else {
                toast.error(res.error || 'Cập nhật thất bại');
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader className="flex flex-row items-center justify-between mt-2">
                    <DialogTitle>{isEditing ? 'Chỉnh sửa Media' : (media.title_vi || 'Chi tiết Media')}</DialogTitle>
                    {!isEditing && (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                            <IconEdit /> Sửa thông tin
                        </Button>
                    )}
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {/* Preview Section */}
                    <div className="bg-gray-100 rounded-lg flex items-center justify-center p-4 min-h-[300px]">
                        {media.type === 'image' && (
                            <div className="relative w-full h-full min-h-[300px]">
                                <Image
                                    src={media.url}
                                    alt={media.title_vi || 'Preview'}
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            </div>
                        )}
                        {media.type === 'video' && (
                            <video src={media.url} controls className="max-w-full max-h-[500px]" />
                        )}
                        {media.type === 'audio' && (
                            <audio src={media.url} controls className="w-full" />
                        )}
                        {media.type === 'document' && (
                            <iframe src={media.url} className="w-full h-[500px]" />
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="space-y-6">
                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <Label>Tên file / Tiêu đề</Label>
                                    <Input
                                        value={formState.title_vi}
                                        onChange={e => setFormState(f => ({ ...f, title_vi: e.target.value }))}
                                        placeholder="Nhập tên file"
                                    />
                                </div>
                                <div>
                                    <Label>Mô tả (tuỳ chọn)</Label>
                                    <Textarea
                                        value={formState.description_vi}
                                        onChange={e => setFormState(f => ({ ...f, description_vi: e.target.value }))}
                                        placeholder="Nhập mô tả"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <Label>Danh mục phân loại (Nhóm)</Label>
                                    <CustomCategorySelect
                                        value={formState.category_id}
                                        onChange={val => setFormState(f => ({ ...f, category_id: val }))}
                                        localCategories={flatCategories.filter(c => !c.isGlobal)}
                                        globalCategories={flatCategories.filter(c => c.isGlobal)}
                                        placeholder="Chọn danh mục..."
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2 block text-sm font-medium">Thẻ chủ đề (Tags)</Label>
                                    <TagInput
                                        tenantId={tenantId}
                                        selectedTagIds={selectedTagIds}
                                        onChange={setSelectedTagIds}
                                    />
                                </div>

                                {tenants && tenants.length > 0 && (
                                    <div className="pt-2 border-t mt-4">
                                        <TenantBroadcastSelect
                                            tenants={tenants}
                                            selectedTenantIds={formState.published_to}
                                            onChange={ids => setFormState(f => ({ ...f, published_to: ids }))}
                                            ownerTenantId={media.tenant_id}
                                        />
                                    </div>
                                )}

                                <div className="flex gap-2 pt-4">
                                    <Button onClick={handleSave} disabled={isPending} className="bg-gold-primary hover:bg-gold-dark text-white">
                                        {isPending ? <IconLoader /> : 'Lưu thay đổi'}
                                    </Button>
                                    <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isPending}>
                                        Hủy
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Tên file</h3>
                                    <p className="mt-1 text-sm text-gray-900 break-all font-semibold">{media.title_vi}</p>
                                </div>

                                {media.description_vi && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Mô tả</h3>
                                        <p className="mt-1 text-sm text-gray-700">{media.description_vi}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Loại</h3>
                                        <p className="mt-1 text-sm text-gray-900 capitalize">{media.type}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Ngày tải lên</h3>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {formatDate(new Date(media.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                        </p>
                                    </div>
                                </div>

                                {(media.category || media.categories?.name_vi) && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Danh mục</h3>
                                        <span className="mt-1 inline-block px-2 py-0.5 bg-gold-primary/10 text-gold-dark text-xs font-medium rounded-full border border-gold-primary/20">
                                            {media.categories?.name_vi || media.category}
                                        </span>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1.5">Tags</h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {itemTags.length > 0 ? (
                                            itemTags.map(tag => (
                                                <Badge key={tag.id} variant="outline" className="text-[10px] bg-stone-50 text-stone-600 border-stone-200">
                                                    <Hash className="w-2.5 h-2.5 mr-1 opacity-40" />
                                                    {tag.name}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-xs text-stone-400 italic">Không có thẻ.</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">URL</h3>
                                    <div className="flex gap-2">
                                        <code className="flex-1 bg-gray-100 p-2 rounded text-xs break-all border block max-h-[100px] overflow-y-auto">
                                            {media.url}
                                        </code>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-4 border-t">
                                    <Button onClick={handleCopyUrl} className={copied ? "bg-green-600 hover:bg-green-700" : ""}>
                                        {copied ? <IconCheck /> : <IconCopy />}
                                        {copied ? 'Đã copy' : 'Copy URL'}
                                    </Button>

                                    <Button variant="outline" asChild>
                                        <a href={media.url} target="_blank" rel="noopener noreferrer">
                                            <IconExternal />
                                            Mở file
                                        </a>
                                    </Button>

                                    <Button variant="outline" asChild>
                                        <a href={media.url} download>
                                            <IconDownload />
                                            Tải về
                                        </a>
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
