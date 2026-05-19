'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HeroSlideSchema, HeroSlideFormValues } from '@/lib/validations/admin';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/admin/image-upload';
import { createHeroSlide, updateHeroSlide } from '@/app/actions/admin/hero-slides';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RevisionHistory } from '@/components/admin/revision-history';
import { useAutoSave } from '@/hooks/use-auto-save';
import { Save, RotateCcw, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface HeroSlideFormProps {
    tenantId: string;
    initialData?: any;
    onSuccess?: () => void;
    currentUserRole?: string;
}

export function HeroSlideForm({ tenantId, initialData, onSuccess, currentUserRole }: HeroSlideFormProps) {
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);

    const form = useForm<HeroSlideFormValues>({
        resolver: zodResolver(HeroSlideSchema) as any,
        defaultValues: {
            title_vi: initialData?.title_vi || '',
            title_en: initialData?.title_en || undefined,
            title_km: initialData?.title_km || undefined,
            subtitle_vi: initialData?.subtitle_vi || '',
            subtitle_en: initialData?.subtitle_en || undefined,
            subtitle_km: initialData?.subtitle_km || undefined,
            image_url: initialData?.image_url || '',
            cta1_enabled: initialData?.cta1_enabled ?? !!initialData?.cta1_link,
            cta1_text_key: initialData?.cta1_text_key || undefined,
            cta1_link: initialData?.cta1_link || undefined,
            cta2_enabled: initialData?.cta2_enabled ?? !!initialData?.cta2_link,
            cta2_text_key: initialData?.cta2_text_key || undefined,
            cta2_link: initialData?.cta2_link || undefined,
            is_active: initialData?.is_active ?? true,
            order_position: initialData?.order_position || 0,
        },
    });

    const formValues = form.watch();

    const { hasDraft, lastSaved, restoreDraft, clearDraft } = useAutoSave({
        key: `hero_slide_${initialData?.id || 'new'}`,
        data: formValues,
        onRestore: (draftData) => {
            Object.entries(draftData).forEach(([k, v]) => {
                form.setValue(k as any, v, { shouldDirty: true });
            });
        },
        enabled: true,
        isDirty: form.formState.isDirty,
    });

    const onSubmit = async (data: HeroSlideFormValues) => {
        setLoading(true);
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, value.toString());
            }
        });

        formData.append('tenant_id', tenantId);

        const result = initialData
            ? await updateHeroSlide(tenantId, initialData.id, formData)
            : await createHeroSlide(formData);

        setLoading(false);

        if (result.success) {
            toast.success(initialData ? 'Cập nhật thành công' : 'Tạo mới thành công');
            clearDraft();
            router.refresh();
            if (onSuccess) onSuccess();
        } else {
            toast.error(result.error || 'Có lỗi xảy ra');
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Header Actions & Revision History */}
                <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.back()}
                            className="text-gray-500 hover:text-gray-900 -ml-2"
                        >
                             Quay lại
                        </Button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                {initialData ? 'Chỉnh sửa Trình chiếu' : 'Thêm Trình chiếu mới'}
                            </h2>
                            {lastSaved && (
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3" />
                                    Bản nháp lưu lúc {format(lastSaved, 'HH:mm:ss', { locale: vi })}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {hasDraft && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={restoreDraft}
                                className="text-amber-600 border-amber-200 hover:bg-amber-50"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Khôi phục nháp
                            </Button>
                        )}
                        
                        {initialData && (
                            <RevisionHistory
                                tableName="hero_slides"
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
                                'Đang lưu...'
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    {initialData ? 'Cập nhật' : 'Tạo mới'}
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="image_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <ImageUpload
                                            label="Hình ảnh (1920x1080px)"
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="is_active"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Hoạt động</FormLabel>
                                        <FormDescription>
                                            Hiển thị slide này trên trang chủ
                                        </FormDescription>
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

                        <FormField
                            control={form.control}
                            name="order_position"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Thứ tự hiển thị</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-6">
                        <Tabs defaultValue="vi" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="vi">Tiếng Việt</TabsTrigger>
                                <TabsTrigger value="km">Khmer</TabsTrigger>
                                <TabsTrigger value="en">English (Tùy chọn)</TabsTrigger>
                            </TabsList>

                            <TabsContent value="vi" className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="title_vi"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tiêu đề (VI)</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="subtitle_vi"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mô tả (VI)</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            <TabsContent value="km" className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="title_km"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tiêu đề (KM)</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ''} placeholder="បញ្ចូលចំណងជើងជាភាសាខ្មែរ..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="subtitle_km"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mô tả (KM)</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ''} placeholder="បញ្ចូលការពិពណ៌នាជាភាសាខ្មែរ..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            <TabsContent value="en" className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="title_en"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tiêu đề (EN)</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="subtitle_en"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mô tả (EN)</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>
                        </Tabs>

                        <div className="space-y-6 pt-4 border-t border-gray-100">
                            {/* CTA 1 Group */}
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="cta1_enabled"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 bg-gray-50/50">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-sm font-medium">Bật Nút kêu gọi 1 (CTA 1)</FormLabel>
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
                                
                                {formValues.cta1_enabled && (
                                    <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-gold-primary/30 animate-in fade-in slide-in-from-left-2 duration-300">
                                        <FormField
                                            control={form.control}
                                            name="cta1_text_key"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">CTA 1 Text Key</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value || ''} placeholder="e.g. learnMore" className="h-9 px-3" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="cta1_link"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">CTA 1 Link</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value || ''} placeholder="/gioi-thieu" className="h-9 px-3" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* CTA 2 Group */}
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="cta2_enabled"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 bg-gray-50/50">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-sm font-medium">Bật Nút kêu gọi 2 (CTA 2)</FormLabel>
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

                                {formValues.cta2_enabled && (
                                    <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-gold-primary/30 animate-in fade-in slide-in-from-left-2 duration-300">
                                        <FormField
                                            control={form.control}
                                            name="cta2_text_key"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">CTA 2 Text Key</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value || ''} placeholder="e.g. contactUs" className="h-9 px-3" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="cta2_link"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">CTA 2 Link</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value || ''} placeholder="/lien-he" className="h-9 px-3" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    );
}
