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
import { Save, RotateCcw, Clock, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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
            toast.success(initialData ? '✅ Cập nhật thành công' : '✅ Tạo mới thành công');
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
                <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl pb-4 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.back()}
                            className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors -ml-2"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay lại
                        </Button>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {initialData ? 'Chỉnh sửa Trình chiếu' : 'Thêm Trình chiếu mới'}
                            </h2>
                            {lastSaved && (
                                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-mono">
                                    <Clock className="w-3 h-3 text-amber-500" />
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
                                className="text-amber-400 border-amber-500/35 hover:bg-amber-950/20 bg-transparent rounded-xl"
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
                            className="bg-amber-500 hover:bg-amber-600 text-slate-955 text-slate-950 font-bold shadow-md shadow-amber-500/20 rounded-xl min-w-[120px]"
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
                    {/* LEFT COLUMN: Media & Basic settings */}
                    <div className="bg-slate-900/20 backdrop-blur-xl border border-white/[0.08] p-6 rounded-2xl shadow-2xl space-y-6">
                        <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">Cấu hình Cơ bản</h3>
                        
                        <FormField
                            control={form.control}
                            name="image_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <ImageUpload
                                            label="Hình ảnh (Khuyên dùng 1920x1080px)"
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-400 text-xs" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="is_active"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-white/[0.08] bg-slate-950/40 p-4 transition-all hover:bg-slate-950/60">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-sm font-bold text-slate-200">Kích hoạt Slide</FormLabel>
                                        <FormDescription className="text-xs text-slate-400">
                                            Hiển thị slide này trên banner trang chủ
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
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-xs font-bold text-slate-350 text-slate-350 text-slate-300 uppercase tracking-wider">Thứ tự hiển thị</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            {...field} 
                                            onChange={e => field.onChange(Number(e.target.value))} 
                                            className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50 rounded-xl"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-400 text-xs" />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* RIGHT COLUMN: Multi-language Texts & CTA Buttons */}
                    <div className="bg-slate-900/20 backdrop-blur-xl border border-white/[0.08] p-6 rounded-2xl shadow-2xl space-y-6">
                        <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">Nội dung hiển thị & Kêu gọi (CTA)</h3>

                        <Tabs defaultValue="vi" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 bg-slate-955/40 bg-slate-950/40 border border-white/[0.08] p-1 gap-1 rounded-xl h-auto">
                                <TabsTrigger value="vi" className="text-[10px] font-bold py-1.5 rounded-lg data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-slate-400">Tiếng Việt</TabsTrigger>
                                <TabsTrigger value="km" className="text-[10px] font-bold py-1.5 rounded-lg data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-slate-400">Khmer</TabsTrigger>
                                <TabsTrigger value="en" className="text-[10px] font-bold py-1.5 rounded-lg data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-slate-400">English (Tùy chọn)</TabsTrigger>
                            </TabsList>

                            <TabsContent value="vi" className="space-y-4 pt-4">
                                <FormField
                                    control={form.control}
                                    name="title_vi"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-xs text-slate-300">Tiêu đề (VI)</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ''} className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50 rounded-xl" />
                                            </FormControl>
                                            <FormMessage className="text-red-400 text-xs" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="subtitle_vi"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-xs text-slate-300">Mô tả phụ (VI)</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ''} className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50 rounded-xl" />
                                            </FormControl>
                                            <FormMessage className="text-red-400 text-xs" />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            <TabsContent value="km" className="space-y-4 pt-4">
                                <FormField
                                    control={form.control}
                                    name="title_km"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-xs text-slate-300">Tiêu đề (KM)</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ''} placeholder="បញ្ចូលចំណងជើងជាភាសាខ្មែរ..." className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50 rounded-xl" />
                                            </FormControl>
                                            <FormMessage className="text-red-400 text-xs" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="subtitle_km"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-xs text-slate-300">Mô tả phụ (KM)</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ''} placeholder="បញ្ចូលការពិពណ៌នាជាភាសាខ្មែរ..." className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50 rounded-xl" />
                                            </FormControl>
                                            <FormMessage className="text-red-400 text-xs" />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            <TabsContent value="en" className="space-y-4 pt-4">
                                <FormField
                                    control={form.control}
                                    name="title_en"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-xs text-slate-300">Tiêu đề (EN)</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ''} placeholder="Slide headline in English..." className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50 rounded-xl" />
                                            </FormControl>
                                            <FormMessage className="text-red-400 text-xs" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="subtitle_en"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-xs text-slate-300">Mô tả phụ (EN)</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ''} placeholder="Slide sub-headline in English..." className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50 rounded-xl" />
                                            </FormControl>
                                            <FormMessage className="text-red-400 text-xs" />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>
                        </Tabs>

                        <div className="space-y-6 pt-6 border-t border-white/[0.08]">
                            {/* CTA 1 Group */}
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="cta1_enabled"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-xl border border-white/[0.08] bg-slate-950/40 p-3 transition-all hover:bg-slate-950/60">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-xs font-bold text-slate-200">Kích hoạt nút CTA 1</FormLabel>
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
                                    <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-amber-500/30 animate-in fade-in slide-in-from-left-2 duration-300">
                                        <FormField
                                            control={form.control}
                                            name="cta1_text_key"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] uppercase font-bold text-slate-400">Từ khóa nhãn (Text Key)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value || ''} placeholder="Ví dụ: learnMore" className="h-9 px-3 bg-slate-950/50 border-white/10 text-white focus:border-amber-500/50 rounded-xl" />
                                                    </FormControl>
                                                    <FormMessage className="text-red-400 text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="cta1_link"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] uppercase font-bold text-slate-400">Đường dẫn liên kết (Link)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value || ''} placeholder="/gioi-thieu" className="h-9 px-3 bg-slate-950/50 border-white/10 text-white focus:border-amber-500/50 rounded-xl" />
                                                    </FormControl>
                                                    <FormMessage className="text-red-400 text-xs" />
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
                                        <FormItem className="flex flex-row items-center justify-between rounded-xl border border-white/[0.08] bg-slate-950/40 p-3 transition-all hover:bg-slate-950/60">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-xs font-bold text-slate-200">Kích hoạt nút CTA 2</FormLabel>
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
                                    <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-amber-500/30 animate-in fade-in slide-in-from-left-2 duration-300">
                                        <FormField
                                            control={form.control}
                                            name="cta2_text_key"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] uppercase font-bold text-slate-400">Từ khóa nhãn (Text Key)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value || ''} placeholder="Ví dụ: contactUs" className="h-9 px-3 bg-slate-950/50 border-white/10 text-white focus:border-amber-500/50 rounded-xl" />
                                                    </FormControl>
                                                    <FormMessage className="text-red-400 text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="cta2_link"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-[10px] uppercase font-bold text-slate-400">Đường dẫn liên kết (Link)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value || ''} placeholder="/lien-he" className="h-9 px-3 bg-slate-950/50 border-white/10 text-white focus:border-amber-500/50 rounded-xl" />
                                                    </FormControl>
                                                    <FormMessage className="text-red-400 text-xs" />
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
