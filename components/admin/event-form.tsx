'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// @ts-ignore - TypeScript cache issue
import { createEvent, updateEvent, submitEventForReview } from '@/app/actions/admin/events';
import { Button } from '@/components/ui/button';
import { ApproveRejectButtons } from '@/components/admin/approve-reject-buttons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, Save, Eye, Wand2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { generateSlug as utilsGenerateSlug } from '@/lib/utils';
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
// @ts-ignore - TypeScript cache issue
import { ImageUpload } from '@/components/admin/image-upload';
import { Switch } from '@/components/ui/switch';
import { BilingualInput } from '@/components/admin/bilingual-input';
import { RevisionHistory } from '@/components/admin/revision-history';
import { CustomCategorySelect } from '@/components/admin/custom-category-select';
import { CategoryNode } from '@/lib/cache/queries';

interface EventFormProps {
    event?: any;
    currentUserRole?: string;
    tenants?: any[];
    contextTenantId?: string;
    categories?: CategoryNode[];
    allCategories?: any; // To support both the local tree and the full object if needed
}

export function EventForm({ event, currentUserRole, tenants = [], contextTenantId, categories = [], allCategories }: EventFormProps) {
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [isManualSlug, setIsManualSlug] = useState(false);

    const canPublish = ['admin', 'super_admin'].includes(currentUserRole || '');
    const isPublished = event?.approval_status === 'published';

    // Title
    const [titleVi, setTitleVi] = useState(event?.title_vi || '');
    const [titleKm, setTitleKm] = useState(event?.title_km || '');
    const [titleEn, setTitleEn] = useState(event?.title_en || '');

    const [slug, setSlug] = useState(event?.slug || '');

    // Description & Excerpt
    const [descriptionVi, setDescriptionVi] = useState(event?.description_vi || '');
    const [descriptionKm, setDescriptionKm] = useState(event?.description_km || '');
    const [descriptionEn, setDescriptionEn] = useState(event?.description_en || '');

    const [excerptVi, setExcerptVi] = useState(event?.excerpt_vi || '');
    const [excerptKm, setExcerptKm] = useState(event?.excerpt_km || '');
    const [excerptEn, setExcerptEn] = useState(event?.excerpt_en || '');

    const [thumbnailUrl, setThumbnailUrl] = useState(event?.thumbnail_url || '');
    const [isRecurring, setIsRecurring] = useState(event?.is_recurring || false);
    const [registrationRequired, setRegistrationRequired] = useState(event?.registration_required || false);

    // Helper to format date strings to YYYY-MM-DDThh:mm for datetime-local inputs
    const formatDatetimeLocal = (val?: string) => {
        if (!val) return '';
        const str = val.replace(' ', 'T');
        if (str.length === 10) return `${str}T00:00`;
        return str.slice(0, 16);
    };

    // Date & Location states for auto-save and reliable loading
    const [startDate, setStartDate] = useState(formatDatetimeLocal(event?.start_date));
    const [endDate, setEndDate] = useState(formatDatetimeLocal(event?.end_date));
    const [location, setLocation] = useState(event?.location || '');

    // Broadcasting
    const [publishedTo, setPublishedTo] = useState<string[]>(event?.published_to || []);

    // Category state
    const [categoryId, setCategoryId] = useState(event?.category || '');

    // Tabs state
    const [activeDescTab, setActiveDescTab] = useState('vi');

    const draftKey = `event_${event?.id || 'new'}`;
    const { hasDraft, lastSaved, restoreDraft, clearDraft } = useAutoSave({
        key: draftKey,
        data: {
            titleVi, titleEn, titleKm,
            slug,
            descriptionVi, descriptionEn, descriptionKm,
            excerptVi, excerptEn, excerptKm,
            thumbnailUrl, isRecurring, registrationRequired, publishedTo,
            startDate, endDate, location, categoryId
        },
        onRestore: (data: any) => {
            setTitleVi(data.titleVi || ''); setTitleEn(data.titleEn || ''); setTitleKm(data.titleKm || '');
            setSlug(data.slug || '');
            setDescriptionVi(data.descriptionVi || ''); setDescriptionEn(data.descriptionEn || ''); setDescriptionKm(data.descriptionKm || '');
            setExcerptVi(data.excerptVi || ''); setExcerptEn(data.excerptEn || ''); setExcerptKm(data.excerptKm || '');
            setThumbnailUrl(data.thumbnailUrl || '');
            setIsRecurring(data.isRecurring || false);
            setRegistrationRequired(data.registrationRequired || false);
            setPublishedTo(data.publishedTo || []);
            setStartDate(data.startDate || '');
            setEndDate(data.endDate || '');
            setLocation(data.location || '');
            setCategoryId(data.categoryId || '');
        },
        debounceMs: 5000
    });

    const router = useRouter();
    const isEdit = !!event;

    // Auto-generate slug function
    const generateSlug = (text: string) => {
        const baseSlug = utilsGenerateSlug(text);
        return isEdit ? baseSlug : `${baseSlug}-${Date.now().toString().slice(-4)}`;
    };

    const handleTitleViChange = (value: string) => {
        setTitleVi(value);
        if (!isEdit && !isManualSlug) {
            setSlug(generateSlug(value));
        }
    };

    const handleGenerateSlug = () => {
        setSlug(generateSlug(titleVi));
    };

    // Helper to split categories into local and global (flattened for legacy select UI but suitable here too)
    const splitCategories = (nodes: CategoryNode[]) => {
        const local: any[] = [];
        const global: any[] = [];
        const GLOBAL_TENANT_ID = '55555555-5555-5555-5555-555555555555';

        const flatten = (items: CategoryNode[], target: any[], level = 0) => {
            items.forEach(item => {
                target.push({
                    id: item.id,
                    name_vi: item.name_vi,
                    level,
                    isGlobal: item.tenant_id === GLOBAL_TENANT_ID
                });
                if (item.children && item.children.length > 0) {
                    flatten(item.children, target, level + 1);
                }
            });
        };

        const localNodes = nodes.filter(n => n.tenant_id !== GLOBAL_TENANT_ID);
        const globalNodes = nodes.filter(n => n.tenant_id === GLOBAL_TENANT_ID);

        flatten(localNodes, local);
        flatten(globalNodes, global);

        return { local, global };
    };

    const categoryGroups = splitCategories(categories);

    const handlePreview = () => {
        const previewWindow = window.open('', '_blank');
        if (previewWindow) {
            previewWindow.document.write(`
                 <html>
                     <head>
                         <title>Preview: ${titleVi}</title>
                         <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                         <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600&family=Battambang:wght@400;700&display=swap" rel="stylesheet">
                         <style>
                            body { font-family: 'Inter', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                            .font-khmer { font-family: 'Battambang', cursive; }
                         </style>
                     </head>
                     <body>
                         <!-- VI -->
                         <div class="mb-12 border-b pb-12">
                            <h1 class="text-3xl font-bold mb-4">${titleVi}</h1>
                            <div class="mb-4 text-gray-500">
                                ${event?.start_date || 'Start Date'} - ${event?.end_date || 'End Date'}
                            </div>
                            <div class="prose lg:prose-xl">
                                ${descriptionVi}
                            </div>
                         </div>
                         <!-- KM -->
                         <div>
                            <h1 class="text-3xl font-bold mb-4 font-khmer">${titleKm}</h1>
                            <div class="prose lg:prose-xl font-khmer">
                                ${descriptionKm}
                            </div>
                         </div>
                     </body>
                 </html>
             `);
            previewWindow.document.close();
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);

        // Add rich text content and manual states
        formData.set('title_vi', titleVi);
        formData.set('title_km', titleKm);
        formData.set('title_en', titleEn);

        formData.set('description_vi', descriptionVi);
        formData.set('description_km', descriptionKm);
        formData.set('description_en', descriptionEn);

        formData.set('excerpt_vi', excerptVi);
        formData.set('excerpt_km', excerptKm);
        formData.set('excerpt_en', excerptEn);

        formData.set('slug', slug);
        formData.set('start_date', startDate);
        formData.set('end_date', endDate);
        formData.set('location', location);
        formData.set('is_recurring', String(isRecurring));
        formData.set('registration_required', String(registrationRequired));
        formData.set('category', categoryId);
        if (contextTenantId) {
            formData.set('tenant_id', contextTenantId);
        }

        if (publishedTo.length > 0) {
            formData.set('published_to', JSON.stringify(publishedTo));
        }

        const submitterAction = (e.nativeEvent as any).submitter?.getAttribute('data-action');
        let targetStatus = 'draft';
        const isApprovedStatus = ['published', 'approved'].includes(event?.approval_status);

        if (submitterAction === 'submit_review') {
            targetStatus = 'pending_review';
        } else if (isApprovedStatus && canPublish) {
            targetStatus = event.approval_status; // Keep either published or approved
        } else if (isApprovedStatus && !canPublish) {
            targetStatus = 'pending_review';
        }
        formData.set('approval_status', targetStatus);

        const result = isEdit
            ? await updateEvent(event.id, formData)
            : await createEvent(formData);

        if (result.success) {
            clearDraft();
            toast.success(isEdit ? 'Đã cập nhật sự kiện thành công!' : 'Đã tạo sự kiện mới thành công!');
            const targetPath = contextTenantId ? `/admin/t/${contextTenantId}/events` : `/admin/events`;
            router.push(targetPath);
            router.refresh();
        } else {
            toast.error(result.error || 'Có lỗi xảy ra');
            setLoading(false);
        }
    };

    const handleSubmitForReview = async () => {
        if (!event?.id) return;
        setSubmitLoading(true);
        const result = await submitEventForReview(event.id);
        setSubmitLoading(false);
        if (result.success) {
            toast.success('Đã gửi sự kiện để duyệt thành công!');
            router.refresh();
        } else {
            toast.error(result.error || 'Có lỗi khi gửi duyệt');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 bg-white/90 backdrop-blur-sm z-10 py-4 border-b -mx-6 px-6 shadow-sm">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="mr-2"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại
                        </Button>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEdit ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}
                        </h1>
                    </div>
                    {/* Auto-save Status Indicator */}
                    <div className="flex items-center gap-2 pl-2">
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
                                Bấm vào đây để Khôi phục bản nháp chưa lưu gần nhất
                            </Button>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Approval Buttons */}
                    {isEdit && event?.id && (
                        <ApproveRejectButtons
                            itemId={event.id}
                            currentStatus={event.approval_status || 'draft'}
                            currentUserRole={currentUserRole || ''}
                            type="events"
                        />
                    )}
                    {/* Revision History (chỉ khi edit) */}
                    {isEdit && event?.id && (
                        <RevisionHistory
                            tableName="events"
                            recordId={event.id}
                            currentUserRole={currentUserRole || 'editor'}
                        />
                    )}

                    <Button
                        type="button"
                        variant="outline"
                        onClick={handlePreview}
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        Xem trước
                    </Button>

                    {canPublish ? (
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gold-primary hover:bg-gold-dark min-w-[120px]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isEdit ? 'Cập nhật' : 'Tạo mới'}
                                </>
                            )}
                        </Button>
                    ) : (
                        <>
                            <Button
                                type="submit"
                                data-action="draft"
                                disabled={loading || submitLoading}
                                variant="outline"
                                className="min-w-[120px]"
                            >
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Lưu Nháp
                            </Button>
                            <Button
                                type="submit"
                                data-action="submit_review"
                                disabled={loading || submitLoading}
                                className="bg-gold-primary hover:bg-gold-dark min-w-[140px]"
                            >
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                Gửi Duyệt
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content (Left, 2 cols) */}
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin chính Đa ngôn ngữ</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="vi" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100">
                                        <TabsTrigger value="vi">Tiếng Việt</TabsTrigger>
                                        <TabsTrigger value="en">English (Tùy chọn)</TabsTrigger>
                                        <TabsTrigger value="km">Khmer</TabsTrigger>
                                    </TabsList>

                                {/* --- TAB: TIẾNG VIỆT --- */}
                                <TabsContent value="vi" className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="title_vi" className="mb-1.5 block">Tiêu đề (VI) <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="title_vi"
                                                name="title_vi"
                                                value={titleVi}
                                                onChange={(e) => handleTitleViChange(e.target.value)}
                                                placeholder="Tiêu đề tiếng Việt"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="slug" className="flex items-center gap-2 mb-1.5">
                                                Đường dẫn (Slug)
                                                <span className="text-xs text-muted-foreground font-normal">
                                                    (Tự động tạo từ tiêu đề tiếng Việt)
                                                </span>
                                            </Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="slug"
                                                    name="slug"
                                                    value={slug}
                                                    onChange={(e) => {
                                                        setIsManualSlug(true);
                                                        setSlug(utilsGenerateSlug(e.target.value));
                                                    }}
                                                    placeholder="url-su-kien"
                                                    className="font-mono text-sm bg-gray-50"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={handleGenerateSlug}
                                                    title="Tạo lại slug từ tiêu đề"
                                                >
                                                    Tạo tự động
                                                </Button>
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="excerpt_vi" className="mb-1.5 block">Mô tả ngắn (VI)</Label>
                                            <textarea
                                                id="excerpt_vi"
                                                name="excerpt_vi"
                                                value={excerptVi}
                                                onChange={(e) => setExcerptVi(e.target.value)}
                                                placeholder="Mô tả ngắn hiển thị preview..."
                                                rows={3}
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                                            />
                                        </div>

                                        <div>
                                            <Label className="mb-1.5 block">Mô tả chi tiết (VI)</Label>
                                            <div className="min-h-[400px]">
                                                <RichTextEditor
                                                    content={descriptionVi}
                                                    onChange={setDescriptionVi}
                                                    placeholder="Nhập mô tả sự kiện bằng tiếng Việt..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* --- TAB: ENGLISH --- */}
                                <TabsContent value="en" className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="title_en" className="mb-1.5 block">Tiêu đề (EN)</Label>
                                            <Input
                                                id="title_en"
                                                name="title_en"
                                                value={titleEn}
                                                onChange={(e) => setTitleEn(e.target.value)}
                                                placeholder="Enter English title..."
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="excerpt_en" className="mb-1.5 block">Tóm tắt (EN)</Label>
                                            <textarea
                                                id="excerpt_en"
                                                name="excerpt_en"
                                                value={excerptEn}
                                                onChange={(e) => setExcerptEn(e.target.value)}
                                                placeholder="Enter short description in English..."
                                                rows={3}
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                                            />
                                        </div>

                                        <div>
                                            <Label className="mb-1.5 block">Mô tả chi tiết (EN)</Label>
                                            <div className="min-h-[400px]">
                                                <RichTextEditor
                                                    content={descriptionEn}
                                                    onChange={setDescriptionEn}
                                                    placeholder="Enter detailed description in English..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* --- TAB: KHMER --- */}
                                <TabsContent value="km" className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="title_km" className="mb-1.5 block">ចំណងជើង (KM)</Label>
                                            <Input
                                                id="title_km"
                                                name="title_km"
                                                value={titleKm}
                                                onChange={(e) => setTitleKm(e.target.value)}
                                                placeholder="បញ្ចូលចំណងជើង..."
                                                className="font-khmer"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="excerpt_km" className="mb-1.5 block">សេចក្តីសង្ខេប (KM)</Label>
                                            <textarea
                                                id="excerpt_km"
                                                name="excerpt_km"
                                                value={excerptKm}
                                                onChange={(e) => setExcerptKm(e.target.value)}
                                                placeholder="បញ្ចូលសេចក្តីសង្ខេប..."
                                                rows={3}
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] font-khmer"
                                            />
                                        </div>

                                        <div>
                                            <Label className="mb-1.5 block">ខ្លឹមសារ chi tiết (KM)</Label>
                                            <div className="min-h-[400px]">
                                                <RichTextEditor
                                                    content={descriptionKm}
                                                    onChange={setDescriptionKm}
                                                    placeholder="បញ្ចូលខ្លឹមសារ..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar (Right, 1 col) */}
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thời gian & Địa điểm</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Date & Time optimized */}
                            <div className="space-y-5">
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-4">
                                    <Label className="text-gold-primary font-bold flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-gold-primary" />
                                        Bắt đầu
                                    </Label>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="space-y-1.5">
                                            <span className="text-[10px] uppercase font-bold text-gray-400">Ngày & Giờ bắt đầu</span>
                                            <Input
                                                id="start_date"
                                                name="start_date"
                                                type="datetime-local"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                required
                                                className="bg-white border-gray-200 focus:border-gold-primary focus:ring-gold-primary/20 transition-all"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="text-[10px] h-7 px-2"
                                                onClick={() => {
                                                    const now = new Date();
                                                    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                                                    const el = document.getElementById('start_date') as HTMLInputElement;
                                                    if (el) el.value = now.toISOString().slice(0, 16);
                                                }}
                                            >
                                                Bây giờ
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="text-[10px] h-7 px-2"
                                                onClick={() => {
                                                    const today = new Date();
                                                    today.setHours(8, 0, 0, 0);
                                                    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
                                                    const el = document.getElementById('start_date') as HTMLInputElement;
                                                    if (el) el.value = today.toISOString().slice(0, 16);
                                                }}
                                            >
                                                8:00 Sáng nay
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-4">
                                    <Label className="text-gray-500 font-bold flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-gray-300" />
                                        Kết thúc (Tùy chọn)
                                    </Label>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="space-y-1.5">
                                            <span className="text-[10px] uppercase font-bold text-gray-400">Ngày & Giờ kết thúc</span>
                                            <Input
                                                id="end_date"
                                                name="end_date"
                                                type="datetime-local"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="bg-white border-gray-200 focus:border-gold-primary focus:ring-gold-primary/20 transition-all"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="text-[10px] h-7 px-2"
                                                onClick={() => {
                                                    const startVal = (document.getElementById('start_date') as HTMLInputElement)?.value;
                                                    if (startVal) {
                                                        const date = new Date(startVal);
                                                        date.setHours(date.getHours() + 2);
                                                        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                                                        const el = document.getElementById('end_date') as HTMLInputElement;
                                                        if (el) el.value = date.toISOString().slice(0, 16);
                                                    }
                                                }}
                                            >
                                                +2 Giờ
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="text-[10px] h-7 px-2"
                                                onClick={() => {
                                                    const startVal = (document.getElementById('start_date') as HTMLInputElement)?.value;
                                                    if (startVal) {
                                                        const date = new Date(startVal);
                                                        date.setHours(17, 0, 0, 0);
                                                        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                                                        const el = document.getElementById('end_date') as HTMLInputElement;
                                                        if (el) el.value = date.toISOString().slice(0, 16);
                                                    }
                                                }}
                                            >
                                                Đến 17:00
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <Label htmlFor="location">Địa điểm</Label>
                                <Input
                                    id="location"
                                    name="location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Ví dụ: Chánh điện"
                                    className="mt-1.5"
                                />
                            </div>

                            <div className="flex items-center justify-between border-t pt-4">
                                <Label htmlFor="is_recurring" className="cursor-pointer">Sự kiện lặp lại?</Label>
                                <Switch
                                    id="is_recurring"
                                    checked={isRecurring}
                                    onCheckedChange={setIsRecurring}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Phân loại & Trạng thái</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Status */}
                            <div>
                                <Label htmlFor="status">
                                    Trạng thái <span className="text-red-500">*</span>
                                </Label>
                                <select
                                    id="status"
                                    name="status"
                                    defaultValue={event?.status || 'upcoming'}
                                    required
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 mt-1.5 bg-white"
                                >
                                    <option value="upcoming">Sắp diễn ra</option>
                                    <option value="ongoing">Đang diễn ra</option>
                                    <option value="completed">Đã hoàn thành</option>
                                    <option value="cancelled">Đã hủy</option>
                                </select>
                            </div>

                            {/* Category - Dynamic Heritage UI */}
                            <div className="space-y-2">
                                <Label className="text-gray-900 font-medium">
                                    Loại sự kiện <span className="text-red-500">*</span>
                                </Label>
                                <CustomCategorySelect
                                    localCategories={categoryGroups.local}
                                    globalCategories={categoryGroups.global}
                                    value={categoryId}
                                    onChange={setCategoryId}
                                    placeholder="Chọn loại sự kiện..."
                                    module="events"
                                />
                                <p className="text-[11px] text-gray-400 italic">
                                    Sắp xếp theo tab: Hệ thống & Chi nhánh của bạn
                                </p>
                            </div>

                            <div className="flex items-center justify-between border-t pt-4">
                                <Label htmlFor="registration_required" className="cursor-pointer">Yêu cầu đăng ký?</Label>
                                <Switch
                                    id="registration_required"
                                    checked={registrationRequired}
                                    onCheckedChange={setRegistrationRequired}
                                />
                            </div>

                            {registrationRequired && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <Label htmlFor="max_participants">Số lượng tối đa</Label>
                                    <Input
                                        id="max_participants"
                                        name="max_participants"
                                        type="number"
                                        defaultValue={event?.max_participants || ''}
                                        placeholder="Để trống nếu không giới hạn"
                                        className="mt-1.5"
                                    />
                                </div>
                            )}

                            {/* Broadcasting (Platform Admins only) */}
                            {tenants.length > 0 && (
                                <div className="border-t pt-4">
                                    <Label className="block mb-2 font-medium">
                                        Mạng lưới Xuất bản chéo (Cross-publish)
                                    </Label>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 border rounded-md p-3 bg-gray-50">
                                        {tenants.map(tenant => (
                                            <label key={tenant.id} className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-gray-100 rounded">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-gold-primary focus:ring-gold-primary"
                                                    checked={publishedTo.includes(tenant.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setPublishedTo([...publishedTo, tenant.id]);
                                                        } else {
                                                            setPublishedTo(publishedTo.filter(id => id !== tenant.id));
                                                        }
                                                    }}
                                                />
                                                <span className="text-sm font-medium text-gray-700">{tenant.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Chọn các chi nhánh sẽ hiển thị sự kiện này. Nếu không chọn, sự kiện chỉ hiển thị trên trang chính phủ.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Ảnh đại diện</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ImageUpload
                                label="Upload ảnh"
                                value={thumbnailUrl}
                                onChange={setThumbnailUrl}
                            />
                            <input type="hidden" name="thumbnail_url" value={thumbnailUrl} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
