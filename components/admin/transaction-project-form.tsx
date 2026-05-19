'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// @ts-ignore
import { createTransactionProject, updateTransactionProject } from '@/app/actions/admin/transaction-projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, Save, Eye, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateSlug } from '@/lib/utils';
import { RevisionHistory } from '@/components/admin/revision-history';
// @ts-ignore
import dynamic from 'next/dynamic';
import { useAutoSave } from '@/hooks/use-auto-save';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Clock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

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
// @ts-ignore
import { ImageUpload } from '@/components/admin/image-upload';

interface TransactionProjectFormProps {
    project?: any;
    contextTenantId?: string;
    currentUserRole?: string;
    tenants?: { id: string; name: string }[];
}

export function TransactionProjectForm({ project, contextTenantId, currentUserRole, tenants = [] }: TransactionProjectFormProps) {
    const [selectedTenantId, setSelectedTenantId] = useState(project?.tenant_id || contextTenantId || '');
    const [loading, setLoading] = useState(false);

    const [titleVi, setTitleVi] = useState(project?.title_vi || '');
    const [titleKm, setTitleKm] = useState(project?.title_km || '');
    const [descriptionVi, setDescriptionVi] = useState(project?.description_vi || '');
    const [descriptionKm, setDescriptionKm] = useState(project?.description_km || '');
    const [contentVi, setContentVi] = useState(project?.content_vi || '');
    const [contentKm, setContentKm] = useState(project?.content_km || '');
    const [thumbnailUrl, setThumbnailUrl] = useState(project?.thumbnail_url || '');
    const [isActive, setIsActive] = useState(project ? project.is_active : true);
    const [targetAmount, setTargetAmount] = useState(project?.target_amount || 0);
    const [currentAmount, setCurrentAmount] = useState(project?.current_amount || 0);
    const [slug, setSlug] = useState(project?.slug || '');
    const [isManualSlug, setIsManualSlug] = useState(false);

    const router = useRouter();
    const isEdit = !!project;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        formData.set('title_vi', titleVi);
        formData.set('title_km', titleKm);
        formData.set('description_vi', descriptionVi);
        formData.set('description_km', descriptionKm);
        formData.set('content_vi', contentVi);
        formData.set('content_km', contentKm);
        formData.set('is_active', String(isActive));
        formData.set('slug', slug);
        formData.set('target_amount', String(targetAmount));
        formData.set('current_amount', String(currentAmount));

        if (selectedTenantId) {
            formData.set('tenant_id', selectedTenantId);
        }

        const result = isEdit
            ? await updateTransactionProject(project.id, formData)
            : await createTransactionProject(formData);

        if (result.success) {
            toast.success(isEdit ? 'Đã cập nhật thành công!' : 'Đã tạo mới thành công!');
            const targetPath = contextTenantId ? `/admin/t/${contextTenantId}/transaction-projects` : `/admin/finance/projects`;
            router.push(targetPath);
            router.refresh();
        } else {
            toast.error(result.error || 'Có lỗi khi lưu');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 bg-white/90 backdrop-blur-sm z-10 py-4 border-b -mx-6 px-6 shadow-sm">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
                        </Button>
                        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Sửa dự án' : 'Dự án mới'}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button type="submit" disabled={loading} className="bg-gold-primary hover:bg-gold-dark min-w-[120px]">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {isEdit ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader><CardTitle>Thông tin chính</CardTitle></CardHeader>
                        <CardContent>
                            <Tabs defaultValue="vi" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100">
                                    <TabsTrigger value="vi">Tiếng Việt</TabsTrigger>
                                    <TabsTrigger value="km">Khmer</TabsTrigger>
                                </TabsList>
                                <TabsContent value="vi" className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="title_vi">Tên dự án (VI) *</Label>
                                            <Input id="title_vi" value={titleVi} onChange={(e) => { setTitleVi(e.target.value); if(!isEdit && !isManualSlug) setSlug(generateSlug(e.target.value)); }} required className="bg-slate-50" />
                                        </div>
                                        <div>
                                            <Label htmlFor="slug">Slug</Label>
                                            <Input id="slug" value={slug} onChange={(e) => { setIsManualSlug(true); setSlug(generateSlug(e.target.value)); }} className="font-mono text-sm bg-slate-50" />
                                        </div>
                                        <div>
                                            <Label htmlFor="description_vi">Mô tả ngắn (VI)</Label>
                                            <Textarea id="description_vi" value={descriptionVi} onChange={(e) => setDescriptionVi(e.target.value)} rows={3} className="bg-slate-50" />
                                        </div>
                                        <div className="min-h-[400px]">
                                            <Label>Nội dung chi tiết (VI)</Label>
                                            <RichTextEditor content={contentVi} onChange={setContentVi} />
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="km" className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="title_km">Tên dự án (KM)</Label>
                                            <Input id="title_km" value={titleKm} onChange={(e) => setTitleKm(e.target.value)} className="bg-slate-50" />
                                        </div>
                                        <div>
                                            <Label htmlFor="description_km">Mô tả ngắn (KM)</Label>
                                            <Textarea id="description_km" value={descriptionKm} onChange={(e) => setDescriptionKm(e.target.value)} rows={3} className="bg-slate-50" />
                                        </div>
                                        <div className="min-h-[400px]">
                                            <Label>Nội dung chi tiết (KM)</Label>
                                            <RichTextEditor content={contentKm} onChange={setContentKm} />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card>
                        <CardHeader><CardTitle>Tiến độ</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                        <Label htmlFor="target_amount">Mục tiêu (VND)</Label>
                                        <Input id="target_amount" type="number" value={targetAmount} onChange={(e) => setTargetAmount(Number(e.target.value))} required className="bg-slate-50" />
                                    </div>
                                    <div>
                                        <Label htmlFor="current_amount">Hiện tại (VND)</Label>
                                        <Input id="current_amount" type="number" value={currentAmount} onChange={(e) => setCurrentAmount(Number(e.target.value))} className="bg-slate-50" />
                                    </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Cài đặt</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label htmlFor="status">Trạng thái *</Label>
                                <select id="status" name="status" defaultValue={project?.status || 'ongoing'} className="w-full rounded-md border border-gray-300 px-3 py-2 mt-1.5 bg-white">
                                    <option value="ongoing">Đang mở</option>
                                    <option value="completed">Đã xong</option>
                                    <option value="cancelled">Đã hủy</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="is_active">Hiển thị?</Label>
                                <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Ảnh bìa</CardTitle></CardHeader>
                        <CardContent>
                            <ImageUpload value={thumbnailUrl} onChange={setThumbnailUrl} />
                            <input type="hidden" name="thumbnail_url" value={thumbnailUrl} />
                        </CardContent>
                    </Card>

                    {tenants.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle>Cơ sở</CardTitle></CardHeader>
                            <CardContent>
                                <Label htmlFor="tenant_id_select">Chọn chi nhánh *</Label>
                                <select id="tenant_id_select" value={selectedTenantId} onChange={(e) => setSelectedTenantId(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 mt-1.5 bg-white" required>
                                    <option value="">-- Chọn chi nhánh --</option>
                                    {tenants.map((t: any) => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </form>
    );
}
