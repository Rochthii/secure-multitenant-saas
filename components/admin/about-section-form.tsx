'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AboutSectionSchema, AboutSectionFormValues } from '@/lib/validations/admin';
import { updateAboutSection, createAboutSection } from '@/app/actions/admin/about-sections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, ArrowLeft, Eye, X } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy-load the heavy RichTextEditor to avoid freezing the admin bundle (SSR disabled)
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
import { toast } from 'sonner';
import { generateSlug } from '@/lib/utils';
import { RevisionHistory } from '@/components/admin/revision-history';
import { useAutoSave } from '@/hooks/use-auto-save';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Clock } from 'lucide-react';

interface AboutSectionFormProps {
    initialData?: any;
    sectionKey?: string;
    contextTenantId?: string;
    parentKey?: string;
    currentUserRole?: string;
}

export function AboutSectionForm({ initialData, sectionKey, contextTenantId, parentKey, currentUserRole }: AboutSectionFormProps) {
    const [loading, setLoading] = useState(false);
    const [isManualSlug, setIsManualSlug] = useState(false);
    const router = useRouter();

    const isEditing = !!initialData;

    const form = useForm<AboutSectionFormValues & { slug?: string }>({
        resolver: zodResolver(AboutSectionSchema) as any,
        defaultValues: {
            title_vi: initialData?.title_vi || '',
            title_en: initialData?.title_en || undefined,
            title_km: initialData?.title_km || undefined,
            summary_vi: initialData?.summary_vi || '',
            summary_km: initialData?.summary_km || '',
            summary_en: initialData?.summary_en || '',
            content_vi: initialData?.content_vi || '',
            content_en: initialData?.content_en || undefined,
            content_km: initialData?.content_km || undefined,
            image_url: initialData?.image_url || undefined,
            images: initialData?.images || [],
            is_active: initialData?.is_active ?? true,
            slug: '', // Only used for creation
        },
    });

    const draftKey = `about_${sectionKey || initialData?.id || 'new'}`;
    const formValues = form.watch();

    const { hasDraft, lastSaved, restoreDraft, clearDraft } = useAutoSave({
        key: draftKey,
        data: formValues,
        onRestore: (data: any) => {
            form.reset(data);
        },
        debounceMs: 5000
    });

    const onSubmit = async (data: AboutSectionFormValues & { slug?: string }) => {
        setLoading(true);
        const formData = new FormData();
        
        // react-hook-form zodResolver sẽ strip các field không có trong schema (như slug).
        // Phải dùng form.getValues('slug') để lấy giá trị thực tế trên UI.
        const currentSlug = data.slug || form.getValues('slug');

        if (!isEditing) {
            if (!currentSlug || !/^[a-z0-9-]+$/.test(currentSlug)) {
                toast.error('Slug không hợp lệ (chỉ được dùng a-z, 0-9 và dấu gạch -)');
                setLoading(false);
                return;
            }
            const finalKey = parentKey ? `${parentKey}/${currentSlug}` : currentSlug;
            formData.append('key', finalKey);
        }

        formData.append('title_vi', data.title_vi);
        if (data.title_en) formData.append('title_en', data.title_en);
        if (data.title_km) formData.append('title_km', data.title_km);

        if (data.summary_vi) formData.append('summary_vi', data.summary_vi);
        if (data.summary_km) formData.append('summary_km', data.summary_km);
        if (data.summary_en) formData.append('summary_en', data.summary_en);

        if (data.content_vi) formData.append('content_vi', data.content_vi);
        if (data.content_en) formData.append('content_en', data.content_en);
        if (data.content_km) formData.append('content_km', data.content_km);

        if (data.image_url) formData.append('image_url', data.image_url);
        if (data.images && data.images.length > 0) {
            formData.append('images', JSON.stringify(data.images));
        } else {
            formData.append('images', JSON.stringify([]));
        }

        formData.append('is_active', String(data.is_active));

        if (contextTenantId) {
            formData.append('tenant_id', contextTenantId);
        }

        let result;
        if (isEditing) {
            result = await updateAboutSection(sectionKey!, formData);
        } else {
            result = await createAboutSection(formData);
        }

        if (result.success) {
            clearDraft();
            toast.success(isEditing ? 'Cập nhật thành công' : 'Tạo mới thành công');
            router.refresh();
            if (!isEditing) {
                const targetPath = contextTenantId ? `/admin/t/${contextTenantId}/about` : '/admin/about';
                router.push(targetPath);
            }
        } else {
            toast.error(result.error || 'Có lỗi xảy ra');
        }
        setLoading(false);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 bg-white/90 backdrop-blur-sm z-10 py-4 border-b -mx-6 px-6">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    const targetPath = contextTenantId ? `/admin/t/${contextTenantId}/about` : '/admin/about';
                                    router.push(targetPath);
                                }}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Quay lại danh sách
                            </Button>
                        </div>
                        {/* Auto-save Status indicator */}
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
                                    Khôi phục bản nháp
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Revision History */}
                        {isEditing && (
                            <RevisionHistory
                                tableName="about_sections"
                                recordId={initialData.id}
                                currentUserRole={currentUserRole || 'editor'}
                            />
                        )}
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
                                    {isEditing ? 'Cập nhật' : 'Tạo mới'}
                                </>
                            )}
                        </Button>
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
                                        {!isEditing && (
                                            <FormField
                                                control={form.control}
                                                name="slug"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Đường dẫn (Slug) <span className="text-red-500">*</span></FormLabel>
                                                        <FormControl>
                                                            <div className="flex gap-2">
                                                                <div className="flex w-full">
                                                                    {parentKey && (
                                                                        <div className="bg-gray-100 border border-r-0 border-input rounded-l-md px-3 py-2 text-sm text-gray-500 flex items-center">
                                                                            {parentKey}/
                                                                        </div>
                                                                    )}
                                                                    <Input
                                                                        {...field}
                                                                        value={field.value || ''}
                                                                        placeholder="nhap-duong-dan-khong-dau"
                                                                        className={parentKey ? "rounded-none" : "rounded-r-none"}
                                                                        onChange={(e) => {
                                                                            setIsManualSlug(true);
                                                                            field.onChange(generateSlug(e.target.value));
                                                                        }}
                                                                    />
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="secondary"
                                                                    className={parentKey ? "rounded-r-md" : "rounded-r-md"}
                                                                    onClick={() => {
                                                                        const title = form.getValues('title_vi');
                                                                        if (title) {
                                                                            setIsManualSlug(true);
                                                                            form.setValue('slug', generateSlug(title), { shouldValidate: true, shouldDirty: true });
                                                                        } else {
                                                                            toast.error('Vui lòng nhập Tiêu đề trước khi tạo Slug tự động');
                                                                        }
                                                                    }}
                                                                >
                                                                    Tạo tự động
                                                                </Button>
                                                            </div>
                                                        </FormControl>
                                                        <FormDescription>
                                                            Chỉ chứa chữ thường không dấu, số và gạch ngang (-). Bắt buộc phải duy nhất.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}

                                        <FormField
                                            control={form.control}
                                            name="title_vi"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tiêu đề (VI) <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Nhập tiêu đề tiếng Việt"
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                                if (!isEditing && !isManualSlug) {
                                                                    const slug = generateSlug(e.target.value);
                                                                    form.setValue('slug', slug, { shouldValidate: true, shouldDirty: true });
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="summary_vi"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tóm tắt (VI)</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            {...field}
                                                            value={field.value || ''}
                                                            placeholder="Đoạn mô tả ngắn hiển thị trên thẻ (tối đa 500 ký tự)..."
                                                            rows={3}
                                                            maxLength={500}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="content_vi"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nội dung chi tiết (VI)</FormLabel>
                                                    <FormControl>
                                                        <div className="min-h-[400px]">
                                                            <RichTextEditor
                                                                content={field.value || ''}
                                                                onChange={field.onChange}
                                                                placeholder="Nhập nội dung bài viết..."
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>

                                    {/* --- TAB: ENGLISH --- */}
                                    <TabsContent value="en" className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="title_en"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tiêu đề (EN)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value || ''} placeholder="Enter English title..." />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="summary_en"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tóm tắt (EN)</FormLabel>
                                                    <FormControl>
                                                        <Textarea {...field} value={field.value || ''} placeholder="Short description in English..." rows={3} maxLength={500} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="content_en"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nội dung chi tiết (EN)</FormLabel>
                                                    <FormControl>
                                                        <div className="min-h-[300px]">
                                                            <RichTextEditor
                                                                content={field.value || ''}
                                                                onChange={field.onChange}
                                                                placeholder="Enter detailed English content..."
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>

                                    {/* --- TAB: KHMER --- */}
                                    <TabsContent value="km" className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="title_km"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>ចំណងជើង (KM)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value || ''} placeholder="បញ្ចូលចំណងជើង..." className="font-khmer" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="summary_km"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>សេចក្តីសង្ខេប (KM)</FormLabel>
                                                    <FormControl>
                                                        <Textarea {...field} value={field.value || ''} placeholder="បញ្ចូលសេចក្តីសង្ខេប..." rows={3} maxLength={500} className="font-khmer" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="content_km"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>ខ្លឹមសារ chi tiết (KM)</FormLabel>
                                                    <FormControl>
                                                        <div className="min-h-[300px]">
                                                            <RichTextEditor
                                                                content={field.value || ''}
                                                                onChange={field.onChange}
                                                                placeholder="បញ្ចូលខ្លឹមសារ..."
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar (Right, 1 col) */}
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cấu hình</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="is_active"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Hiển thị</FormLabel>
                                                <div className="text-sm text-muted-foreground">
                                                    Bật/tắt hiển thị section này trên trang chủ
                                                </div>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Hình ảnh đại diện</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="image_url"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <ImageUpload
                                                    label="Upload ảnh đại diện"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Thư viện ảnh</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="images"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div className="space-y-4">
                                                    {(field.value || []).map((url, index) => (
                                                        <div key={index} className="relative group">
                                                            <ImageUpload
                                                                label={`Ảnh ${index + 1}`}
                                                                value={url}
                                                                onChange={(newUrl) => {
                                                                    const newImages = [...(field.value || [])];
                                                                    if (newUrl) {
                                                                        newImages[index] = newUrl;
                                                                    } else {
                                                                        newImages.splice(index, 1);
                                                                    }
                                                                    field.onChange(newImages);
                                                                }}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="icon"
                                                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => {
                                                                    const newImages = [...(field.value || [])];
                                                                    newImages.splice(index, 1);
                                                                    field.onChange(newImages);
                                                                }}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="w-full border-dashed"
                                                        onClick={() => {
                                                            field.onChange([...(field.value || []), '']);
                                                        }}
                                                    >
                                                        + Thêm ảnh vào thư viện
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </Form>
    );
}
