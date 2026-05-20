'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createNews, updateNews, submitForReview } from '@/app/actions/admin/news';
import { getItemTags } from '@/app/actions/admin/tags';
import { TagInput } from '@/components/admin/tag-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Loader2, Wand2, Eye, Save, ArrowLeft,
    CalendarClock, Send, User, CheckCircle, AlertCircle, XCircle, Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { generateSlug as utilsGenerateSlug } from '@/lib/utils';
// @ts-ignore - TypeScript cache issue
import dynamic from 'next/dynamic';

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
// @ts-ignore
import { ApproveRejectButtons } from '@/components/admin/approve-reject-buttons';
import { TenantBroadcastSelect } from '@/components/admin/tenant-broadcast-select';
import { CustomCategorySelect } from '@/components/admin/custom-category-select';
import { RevisionHistory } from '@/components/admin/revision-history';
import { useAutoSave } from '@/hooks/use-auto-save';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface NewsFormProps {
    news?: any;
    categories: any[];
    currentUserRole?: string;
    tenants?: any[];
    contextTenantId?: string;
}

export function NewsForm({ news, categories, currentUserRole, tenants = [], contextTenantId }: NewsFormProps) {
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [isManualSlug, setIsManualSlug] = useState(false);

    // Xây dựng cây danh mục để hiển thị Select Box (thụt lề cấp bậc)
    const categoryGroups = React.useMemo(() => {
        const buildTree = (cats: any[]) => {
            const options: any[] = [];
            const roots = cats.filter(c => !c.parent_id);
            const getChildren = (parentId: string) => cats.filter(c => c.parent_id === parentId);

            const traverse = (node: any, level: number) => {
                options.push({ ...node, level });
                const children = getChildren(node.id);
                children.forEach(child => traverse(child, level + 1));
            };

            roots.forEach(root => traverse(root, 0));
            return options;
        };

        const localCats = categories.filter(c => !c.isGlobal);
        const globalCats = categories.filter(c => c.isGlobal);

        return {
            local: buildTree(localCats),
            global: buildTree(globalCats)
        };
    }, [categories]);

    // Cleanup object URLs khi unmount
    // Phân cấp role — dùng cho cả handleSubmit và JSX render
    const ROLE_LEVEL: Record<string, number> = { viewer: 1, volunteer: 2, editor: 3, moderator: 4, admin: 5, super_admin: 6 };
    const canPublish = (ROLE_LEVEL[currentUserRole || 'editor'] ?? 0) >= ROLE_LEVEL['admin'];

    // AI SEO State
    const [aiSeoLoading, setAiSeoLoading] = useState(false);
    const [seoMeta, setSeoMeta] = useState({ meta_title: news?.meta_title || '', meta_description: news?.meta_description || '', keywords: news?.keywords || '' });

    // Title
    const [titleVi, setTitleVi] = useState(news?.title_vi || '');
    const [titleKm, setTitleKm] = useState(news?.title_km || '');
    const [titleEn, setTitleEn] = useState(news?.title_en || '');

    const [slug, setSlug] = useState(news?.slug || '');

    // Content
    const [contentVi, setContentVi] = useState(news?.content_vi || '');
    const [contentKm, setContentKm] = useState(news?.content_km || '');
    const [contentEn, setContentEn] = useState(news?.content_en || '');

    // Excerpt
    const [excerptVi, setExcerptVi] = useState(news?.excerpt_vi || '');
    const [excerptKm, setExcerptKm] = useState(news?.excerpt_km || '');
    const [excerptEn, setExcerptEn] = useState(news?.excerpt_en || '');

    const [thumbnailUrl, setThumbnailUrl] = useState(news?.thumbnail_url || '');
    const [isPublished, setIsPublished] = useState(news?.status === 'published');
    const [categoryId, setCategoryId] = useState(news?.category_id || '');

    // Scheduling
    const [scheduledAt, setScheduledAt] = useState(
        news?.scheduled_at ? new Date(news.scheduled_at).toISOString().slice(0, 16) : ''
    );

    // Tags
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

    // Broadcasting
    const [publishedTo, setPublishedTo] = useState<string[]>(news?.published_to || []);

    // AI SEO Handler
    const handleAiSeo = async () => {
        setAiSeoLoading(true);
        try {
            const res = await fetch('/api/ai/seo-suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: titleVi, content: contentVi }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSeoMeta({ meta_title: data.meta_title, meta_description: data.meta_description, keywords: data.keywords });
            toast.success('✨ AI đã tạo gợi ý SEO!');
        } catch (err: any) {
            toast.error('Lỗi AI SEO: ' + err.message);
        } finally {
            setAiSeoLoading(false);
        }
    };

    const isEdit = !!news;

    // Auto-save integration
    const draftKey = `news_${isEdit ? news.id : 'new'}`;
    const { hasDraft, lastSaved, restoreDraft, clearDraft } = useAutoSave({
        key: draftKey,
        data: {
            titleVi, titleEn, titleKm,
            contentVi, contentEn, contentKm,
            excerptVi, excerptEn, excerptKm,
            seoMeta, slug, categoryId, scheduledAt, selectedTagIds, publishedTo, thumbnailUrl
        },
        onRestore: (data: any) => {
            setTitleVi(data.titleVi || ''); setTitleEn(data.titleEn || ''); setTitleKm(data.titleKm || '');
            setContentVi(data.contentVi || ''); setContentEn(data.contentEn || ''); setContentKm(data.contentKm || '');
            setExcerptVi(data.excerptVi || ''); setExcerptEn(data.excerptEn || ''); setExcerptKm(data.excerptKm || '');
            setSeoMeta(data.seoMeta || { meta_title: '', meta_description: '', keywords: '' });
            setSlug(data.slug || ''); setCategoryId(data.categoryId || '');
            setScheduledAt(data.scheduledAt || ''); setSelectedTagIds(data.selectedTagIds || []);
            setPublishedTo(data.publishedTo || []); setThumbnailUrl(data.thumbnailUrl || '');
        },
        debounceMs: 5000 // Tự động lưu mỗi 5 giây sau khi có thay đổi
    });

    const router = useRouter();
    const newsStatus = news?.status || 'draft';

    // Fetch existing tags if editing
    React.useEffect(() => {
        if (isEdit && news?.id) {
            const fetchItemTags = async () => {
                const tags = await getItemTags('news_tags', news.id, contextTenantId);
                setSelectedTagIds(tags.map(t => t.id));
            };
            fetchItemTags();
        }
    }, [isEdit, news?.id]);

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

    const handlePreview = () => {
        const previewWindow = window.open('', '_blank');
        if (previewWindow) {
            previewWindow.document.write(`
                <html>
                    <head>
                        <title>Preview: ${titleVi}</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600&family=Battambang:wght@400;700&display=swap" rel="stylesheet">
                        <style>
                            body { font-family: 'Inter', sans-serif; }
                            .font-khmer { font-family: 'Battambang', cursive; }
                            h1, h2, h3, h4, h5, h6 { font-family: 'Playfair Display', serif; }
                            .prose img { border-radius: 0.5rem; }
                        </style>
                    </head>
                    <body class="bg-gray-50 min-h-screen p-8">
                        <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden space-y-8">
                            <!-- Vietnamese Preview -->
                            <div class="p-8 md:p-12 border-b">
                                <h1 class="text-4xl font-bold mb-6 text-gray-900">${titleVi}</h1>
                                <div class="prose prose-lg max-w-none text-gray-700">
                                    ${contentVi}
                                </div>
                            </div>
                            <!-- Khmer Preview -->
                             <div class="p-8 md:p-12">
                                <h1 class="text-4xl font-bold mb-6 text-gray-900 font-khmer">${titleKm}</h1>
                                <div class="prose prose-lg max-w-none text-gray-700 font-khmer">
                                    ${contentKm}
                                </div>
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
        formData.set('content_vi', contentVi);
        formData.set('content_km', contentKm);
        formData.set('content_en', contentEn);
        formData.set('title_vi', titleVi);
        formData.set('title_km', titleKm);
        formData.set('title_en', titleEn);
        formData.set('excerpt_vi', excerptVi);
        formData.set('excerpt_km', excerptKm);
        formData.set('excerpt_en', excerptEn);
        formData.set('slug', slug);
        formData.set('category_id', categoryId);
        if (contextTenantId) {
            formData.set('tenant_id', contextTenantId);
        }
        if (publishedTo.length > 0) {
            formData.set('published_to', JSON.stringify(publishedTo));
        }
        const submitterAction = (e.nativeEvent as any).submitter?.getAttribute('data-action');

        let targetStatus = 'draft';
        if (submitterAction === 'submit_review') {
            targetStatus = 'pending_review';
            formData.delete('scheduled_at');
        } else if (scheduledAt && !isPublished) {
            targetStatus = 'scheduled';
            formData.set('scheduled_at', new Date(scheduledAt).toISOString());
        } else if (isPublished && canPublish) {
            targetStatus = 'published';
            formData.delete('scheduled_at');
        } else if (isPublished && !canPublish) {
            // User can't publish, fallback to review if they checked the switch
            targetStatus = 'pending_review';
            formData.delete('scheduled_at');
        }
        formData.set('status', targetStatus);

        const result = isEdit
            ? await updateNews(news.id, formData)
            : await createNews(formData);

        if (result.success) {
            clearDraft(); // Xóa bản nháp khi lưu thành công
            toast.success(isEdit ? 'Đã cập nhật bài viết thành công!' : 'Đã tạo bài viết mới thành công!');
            // Redirect depends on context
            router.push(contextTenantId ? `/admin/t/${contextTenantId}/news` : '/admin/news');
            router.refresh();
        } else {
            toast.error(result.error || 'Có lỗi xảy ra');
            setLoading(false);
        }
    };

    const handleSubmitForReview = async () => {
        if (!news?.id) return;
        setSubmitLoading(true);
        const result = await submitForReview(news.id);
        setSubmitLoading(false);
        if (result.success) {
            toast.success('Đã gửi bài để duyệt thành công!');
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
                            {isEdit ? 'Chỉnh sửa tin tức' : 'Tạo tin tức mới'}
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
                    {/* Revision History (chỉ khi edit) */}
                    {isEdit && news?.id && (
                        <RevisionHistory
                            tableName="news"
                            recordId={news.id}
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
                            <CardTitle>Nội dung Đa ngôn ngữ</CardTitle>
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
                                                    placeholder="url-bai-viet"
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
                                            <Label className="mb-1.5 block">Nội dung chi tiết (VI)</Label>
                                            <div className="min-h-[400px]">
                                                <RichTextEditor
                                                    content={contentVi}
                                                    onChange={setContentVi}
                                                    placeholder="Nhập nội dung bài viết bằng tiếng Việt..."
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
                                            <Label className="mb-1.5 block">Nội dung chi tiết (EN)</Label>
                                            <div className="min-h-[400px]">
                                                <RichTextEditor
                                                    content={contentEn}
                                                    onChange={setContentEn}
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
                                                    content={contentKm}
                                                    onChange={setContentKm}
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
                <div className="space-y-5">

                    {/* Author Info */}
                    {news?.author_name && (
                        <Card className="border-gray-200">
                            <CardContent className="pt-4 pb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="bg-gold-primary/10 p-2 rounded-full">
                                        <User className="h-4 w-4 text-gold-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Tác giả</p>
                                        <p className="text-sm font-semibold text-gray-900">{news.author_name}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Review Status Card (nếu đang edit) */}
                    {isEdit && newsStatus !== 'draft' && (
                        <Card className={`border-2 ${newsStatus === 'pending_review' ? 'border-amber-300 bg-amber-50' :
                            newsStatus === 'published' ? 'border-green-300 bg-green-50' :
                                newsStatus === 'rejected' ? 'border-red-300 bg-red-50' :
                                    newsStatus === 'scheduled' ? 'border-blue-300 bg-blue-50' :
                                        'border-gray-200'
                            }`}>
                            <CardContent className="pt-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    {newsStatus === 'published' && <CheckCircle className="h-4 w-4 text-green-600" />}
                                    {newsStatus === 'pending_review' && <AlertCircle className="h-4 w-4 text-amber-600" />}
                                    {newsStatus === 'rejected' && <XCircle className="h-4 w-4 text-red-600" />}
                                    {newsStatus === 'scheduled' && <CalendarClock className="h-4 w-4 text-blue-600" />}
                                    <span className={`text-sm font-semibold ${newsStatus === 'published' ? 'text-green-700' :
                                        newsStatus === 'pending_review' ? 'text-amber-700' :
                                            newsStatus === 'rejected' ? 'text-red-700' :
                                                newsStatus === 'scheduled' ? 'text-blue-700' : 'text-gray-700'
                                        }`}>
                                        {newsStatus === 'published' ? 'Đã xuất bản' :
                                            newsStatus === 'pending_review' ? 'Đang chờ duyệt' :
                                                newsStatus === 'rejected' ? 'Đã bị từ chối' :
                                                    newsStatus === 'scheduled' ? 'Đã lên lịch' : newsStatus}
                                    </span>
                                </div>
                                {news?.reviewer_name && (
                                    <p className="text-xs text-gray-500">
                                        {newsStatus === 'published' ? 'Duyệt bởi' : 'Xử lý bởi'}: <strong>{news.reviewer_name}</strong>
                                    </p>
                                )}
                                {news?.reviewed_at && (
                                    <p className="text-xs text-gray-400">
                                        lúc {new Date(news.reviewed_at).toLocaleString('vi-VN')}
                                    </p>
                                )}
                                {news?.review_note && (
                                    <div className="mt-2 p-2 bg-white/70 rounded border text-xs text-gray-600">
                                        Ghi chú: {news.review_note}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Approve/Reject Buttons (Admin only) */}
                    {isEdit && (newsStatus === 'pending_review' || newsStatus === 'rejected') && (
                        <ApproveRejectButtons
                            itemId={news.id}
                            type="news"
                            currentStatus={newsStatus}
                            currentUserRole={currentUserRole || 'editor'}
                        />
                    )}

                    {/* Publish & Status */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Xuất bản</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Admin trở lên: full control xuất bản */}
                            {((ROLE_LEVEL[currentUserRole || 'editor'] ?? 0) >= ROLE_LEVEL['admin']) ? (
                                <>
                                    {/* Publish toggle */}
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="is_published" className="cursor-pointer">
                                            Xuất bản ngay
                                        </Label>
                                        <Switch
                                            id="is_published"
                                            checked={isPublished}
                                            onCheckedChange={(v) => { setIsPublished(v); if (v) setScheduledAt(''); }}
                                        />
                                    </div>

                                    {/* Scheduled publishing */}
                                    {!isPublished && (
                                        <div className="space-y-1.5">
                                            <Label className="flex items-center gap-1.5 text-sm">
                                                <CalendarClock className="h-3.5 w-3.5 text-blue-500" />
                                                Lên lịch đăng (tùy chọn)
                                            </Label>
                                            <input
                                                type="datetime-local"
                                                value={scheduledAt}
                                                onChange={(e) => setScheduledAt(e.target.value)}
                                                min={new Date().toISOString().slice(0, 16)}
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                            {scheduledAt && (
                                                <p className="text-xs text-blue-600">
                                                    Bài sẽ đăng lúc {new Date(scheduledAt).toLocaleString('vi-VN')}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* Editor: chỉ thấy thông báo workflow */
                                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-amber-800">Cần duyệt trước khi đăng</p>
                                        <p className="text-xs text-amber-600 mt-0.5">
                                            Lưu bài xong, nhấn &quot;Gửi duyệt&quot; để gửi cho Admin phê duyệt.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Category */}
                            <div className="border-t pt-4">
                                <Label htmlFor="category_id">
                                    Danh mục <span className="text-red-500">*</span>
                                </Label>
                                <CustomCategorySelect
                                    value={categoryId}
                                    onChange={setCategoryId}
                                    localCategories={categoryGroups.local}
                                    globalCategories={categoryGroups.global}
                                />
                            </div>

                            {/* Broadcasting (Platform Admins only) */}
                            {tenants.length > 0 && (
                                <div className="border-t pt-4">
                                    <TenantBroadcastSelect
                                        tenants={tenants}
                                        selectedTenantIds={publishedTo}
                                        onChange={setPublishedTo}
                                    />
                                </div>
                            )}


                            {/* Tags System */}
                            <div className="border-t pt-4">
                                <div className="space-y-4 pt-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-base font-semibold text-stone-900">Chủ đề bài viết (Tags)</Label>
                                        <span className="text-xs text-stone-500 font-normal italic">
                                            Gợi ý: Dùng nút "Gợi ý SEO Tag" để tạo nhanh bộ thẻ chuẩn Google.
                                        </span>
                                    </div>
                                    <TagInput
                                        tenantId={contextTenantId || ''}
                                        selectedTagIds={selectedTagIds}
                                        onChange={setSelectedTagIds}
                                        title={titleVi}
                                        content={contentVi}
                                    />
                                </div>
                                <input type="hidden" name="tag_ids" value={JSON.stringify(selectedTagIds)} />
                            </div>

                            {/* Submit for Review button (editor: draft/rejected) */}
                            {isEdit && (newsStatus === 'draft' || newsStatus === 'rejected') && (
                                <div className="border-t pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full border-amber-400 text-amber-700 hover:bg-amber-50"
                                        onClick={handleSubmitForReview}
                                        disabled={submitLoading}
                                    >
                                        {submitLoading
                                            ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            : <Send className="h-4 w-4 mr-2" />}
                                        Gửi duyệt
                                    </Button>
                                    <p className="text-xs text-gray-400 mt-1.5 text-center">
                                        Gửi bài này để admin xem xét và duyệt
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* AI SEO Suggest */}
                    <Card className="border-purple-200">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2">
                                    ✨ Tối ưu SEO
                                </CardTitle>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAiSeo}
                                    disabled={aiSeoLoading}
                                    className="text-purple-600 border-purple-300 hover:bg-purple-50 text-xs"
                                >
                                    {aiSeoLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : null}
                                    AI Gợi ý
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-gray-600">Meta Title (tối đa 60 ký tự)</label>
                                <input
                                    name="meta_title"
                                    value={seoMeta.meta_title}
                                    onChange={e => setSeoMeta(s => ({ ...s, meta_title: e.target.value }))}
                                    placeholder="Tiêu đề SEO..."
                                    maxLength={60}
                                    className="w-full mt-1 rounded border border-gray-300 px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                                />
                                <p className="text-xs text-gray-400 mt-0.5">{seoMeta.meta_title.length}/60</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Meta Description (tối đa 160 ký tự)</label>
                                <textarea
                                    name="meta_description"
                                    value={seoMeta.meta_description}
                                    onChange={e => setSeoMeta(s => ({ ...s, meta_description: e.target.value }))}
                                    placeholder="Mô tả SEO..."
                                    maxLength={160}
                                    rows={3}
                                    className="w-full mt-1 rounded border border-gray-300 px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-purple-400 resize-none"
                                />
                                <p className="text-xs text-gray-400 mt-0.5">{seoMeta.meta_description.length}/160</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Keywords</label>
                                <input
                                    name="keywords"
                                    value={seoMeta.keywords}
                                    onChange={e => setSeoMeta(s => ({ ...s, keywords: e.target.value }))}
                                    placeholder="tổ chức, công nghệ, sự kiện..."
                                    className="w-full mt-1 rounded border border-gray-300 px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Thumbnail */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Ảnh đại diện</CardTitle>
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
