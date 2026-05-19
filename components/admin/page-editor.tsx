'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// @ts-ignore - TypeScript cache issue
import { updatePage } from '@/app/actions/admin/pages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { RevisionHistory } from '@/components/admin/revision-history';
// @ts-ignore - TypeScript cache issue
import dynamic from 'next/dynamic';
import { useAutoSave } from '@/hooks/use-auto-save';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Clock } from 'lucide-react';

const RichTextEditor = dynamic(
    () => import('@/components/admin/rich-text-editor').then((mod) => mod.RichTextEditor),
    { 
        ssr: false, 
        loading: () => (
            <div className="min-h-[400px] w-full flex items-center justify-center bg-gray-50 border border-gray-200 rounded-md">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Đang tải trình soạn thảo...</span>
            </div>
        )
    }
);
import { Switch } from '@/components/ui/switch';
import { createClient } from '@/lib/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PageEditorProps {
    page: any;
    contextTenantId?: string;
    currentUserRole?: string;
}

export function PageEditor({ page, contextTenantId, currentUserRole }: PageEditorProps) {
    const [loading, setLoading] = useState(false);
    const [contentVi, setContentVi] = useState(page?.content_vi || '');
    const [contentEn, setContentEn] = useState(page?.content_en || '');
    const [contentKm, setContentKm] = useState(page?.content_km || '');
    const [parentId, setParentId] = useState<string>(page?.parent_id || 'none');
    const [showInMenu, setShowInMenu] = useState<boolean>(page?.show_in_menu ?? true);
    const [availablePages, setAvailablePages] = useState<any[]>([]);
    const router = useRouter();

    React.useEffect(() => {
        const fetchPages = async () => {
            const supabase = createClient();
            let query = supabase.from('pages').select('id, title_vi');
            if (contextTenantId) {
                query = query.eq('tenant_id', contextTenantId);
            }
            if (page?.id) {
                // Không lấy chính trang này và các trang con của chính trang này để tránh LỖI Đệ Quy vòng lặp
                // Ta chỉ query loại trừ trang hiện tại cho đơn giản
                query = query.neq('id', page.id);
            }
            const { data } = await query.order('title_vi');
            if (data) setAvailablePages(data);
        };
        fetchPages();
    }, [contextTenantId, page?.id]);

    const draftKey = `page_${page?.id || 'new'}`;
    const { hasDraft, lastSaved, restoreDraft, clearDraft } = useAutoSave({
        key: draftKey,
        data: {
            contentVi, contentEn, contentKm,
            parentId, showInMenu
        },
        onRestore: (data: any) => {
            setContentVi(data.contentVi || ''); setContentEn(data.contentEn || ''); setContentKm(data.contentKm || '');
            setParentId(data.parentId || 'none');
            setShowInMenu(data.showInMenu ?? true);
        },
        debounceMs: 5000
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        formData.set('content_vi', contentVi);
        formData.set('content_en', contentEn);
        formData.set('content_km', contentKm);

        if (parentId !== 'none') {
            formData.set('parent_id', parentId);
        } else {
            // force delete parent_id in action? For empty parent_id, the action receives null if not set, or we can explicit.
            // We'll let the action handle missing parent_id as null.
        }
        formData.set('show_in_menu', showInMenu.toString());

        if (contextTenantId) {
            formData.set('tenant_id', contextTenantId);
        }

        const result = await updatePage(page.slug, formData);

        if (result.success) {
            clearDraft();
            toast.success('Đã lưu trang thành công!');
            const targetPath = contextTenantId ? `/admin/t/${contextTenantId}/pages` : '/admin/pages';
            router.push(targetPath);
            router.refresh();
        } else {
            toast.error(result.error || 'Có lỗi xảy ra');
        }
        setLoading(false);
    };

    return (
        <Card>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Page Info */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 flex-1">
                            <div>
                                <span className="text-sm font-medium text-gray-600">Slug:</span>
                                <span className="ml-2 text-sm text-gray-900">/{page.slug}</span>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-600">Trạng thái:</span>
                                <span className="ml-2 text-sm text-gray-900">
                                    {page.status === 'published' ? 'Công khai' : 'Nháp'}
                                </span>
                            </div>
                        </div>
                        {/* Auto-save Status */}
                        <div className="flex items-center gap-2">
                            {lastSaved && (
                                <span className="text-xs text-muted-foreground flex items-center">
                                    <Clock className="w-3 h-3 mr-1" /> Đã lưu tự động lúc {format(lastSaved, 'HH:mm:ss', { locale: vi })}
                                </span>
                            )}
                            {hasDraft && !lastSaved && (
                                <Button
                                    type="button"
                                    variant="link"
                                    size="sm"
                                    className="text-xs text-amber-600 p-0 h-auto"
                                    onClick={restoreDraft}
                                >
                                    Khôi phục bản nháp
                                </Button>
                            )}
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                            {/* Revision History */}
                            {page?.id && (
                                <RevisionHistory
                                    tableName="pages"
                                    recordId={page.id}
                                    currentUserRole={currentUserRole || 'editor'}
                                />
                            )}
                        </div>
                    </div>

                    {/* Hierarchy & Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-lg bg-white shadow-sm">
                        <div className="space-y-2">
                            <Label>Trang Cha (Cấu trúc Menu)</Label>
                            <Select value={parentId} onValueChange={setParentId}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Không có - Nằm ở mức Root" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">-- Không có (Trang gốc) --</SelectItem>
                                    {availablePages.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.title_vi}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Chọn trang để trang này thụt lề làm trang con</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="order_index">Thứ tự hiển thị</Label>
                            <Input
                                type="number"
                                id="order_index"
                                name="order_index"
                                defaultValue={page?.order_index || 0}
                            />
                            <p className="text-xs text-muted-foreground">Số càng nhỏ, trang sẽ hiển thị càng lên đầu/bên trái</p>
                        </div>
                        <div className="space-y-3 flex flex-col justify-center">
                            <Label className="mb-1">Tùy chọn hiển thị</Label>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="show_in_menu"
                                    checked={showInMenu}
                                    onCheckedChange={setShowInMenu}
                                />
                                <Label htmlFor="show_in_menu" className="cursor-pointer">Hiển thị lên Menu Website</Label>
                            </div>
                        </div>
                    </div>

                    {/* Content Tabs */}
                    <Tabs defaultValue="vi" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100">
                        <TabsTrigger value="vi">Tiếng Việt</TabsTrigger>
                        <TabsTrigger value="en">English (Tùy chọn)</TabsTrigger>
                        <TabsTrigger value="km">Khmer</TabsTrigger>
                        </TabsList>

                        <TabsContent value="vi" className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="title_vi" className="mb-1.5 block">Tiêu đề (VI) <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="title_vi"
                                        name="title_vi"
                                        defaultValue={page?.title_vi || ''}
                                        placeholder="Tiêu đề tiếng Việt"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="mb-1.5 block">Nội dung (VI)</Label>
                                    <div className="min-h-[400px]">
                                        <RichTextEditor
                                            content={contentVi}
                                            onChange={setContentVi}
                                            placeholder="Nhập nội dung tiếng Việt..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="meta_description_vi" className="mb-1.5 block">Meta Description (VI)</Label>
                                    <Input
                                        id="meta_description_vi"
                                        name="meta_description_vi"
                                        defaultValue={page?.meta_description_vi || ''}
                                        placeholder="Mô tả ngắn cho SEO..."
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="en" className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="title_en" className="mb-1.5 block">Title (EN)</Label>
                                    <Input
                                        id="title_en"
                                        name="title_en"
                                        defaultValue={page?.title_en || ''}
                                        placeholder="Enter English title..."
                                    />
                                </div>

                                <div>
                                    <Label className="mb-1.5 block">Content (EN)</Label>
                                    <div className="min-h-[400px]">
                                        <RichTextEditor
                                            content={contentEn}
                                            onChange={setContentEn}
                                            placeholder="Enter detailed English content..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="meta_description_en" className="mb-1.5 block">Meta Description (EN)</Label>
                                    <Input
                                        id="meta_description_en"
                                        name="meta_description_en"
                                        defaultValue={page?.meta_description_en || ''}
                                        placeholder="SEO description..."
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="km" className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="title_km" className="mb-1.5 block">ចំណងជើង (KM)</Label>
                                    <Input
                                        id="title_km"
                                        name="title_km"
                                        defaultValue={page?.title_km || ''}
                                        placeholder="បញ្ចូលចំណងជើង..."
                                        className="font-khmer"
                                    />
                                </div>

                                <div>
                                    <Label className="mb-1.5 block">មាតិកា (KM)</Label>
                                    <div className="min-h-[400px]">
                                        <RichTextEditor
                                            content={contentKm}
                                            onChange={setContentKm}
                                            placeholder="បញ្ចូលខ្លឹមសារ..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="meta_description_km" className="mb-1.5 block">Meta Description (KM)</Label>
                                    <Input
                                        id="meta_description_km"
                                        name="meta_description_km"
                                        defaultValue={page?.meta_description_km || ''}
                                        placeholder="SEO description in Khmer..."
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gold-primary hover:bg-gold-dark"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                'Lưu thay đổi'
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={loading}
                        >
                            Quay lại
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
