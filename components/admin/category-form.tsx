'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCategory, updateCategory } from '@/app/actions/admin/category';
import { GlobalCategory, TenantMetadata } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, RotateCcw, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/admin/image-upload';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { generateSlug } from '@/lib/utils';
import { RevisionHistory } from '@/components/admin/revision-history';
import { useAutoSave } from '@/hooks/use-auto-save';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { TenantBroadcastSelect } from '@/components/admin/tenant-broadcast-select';

interface CategoryFormProps {
    category?: GlobalCategory;
    allCategories: GlobalCategory[];
    tenants?: TenantMetadata[];
    contextTenantId?: string;
    currentUserRole?: string;
}

const MODULES = [
    { value: 'news', label: 'Tin tức' },
    { value: 'dharma', label: 'Tài liệu / Video Quy Trình SOP' },
    { value: 'documents', label: 'Tài liệu số' },
    { value: 'events', label: 'Sự kiện' },
    { value: 'media', label: 'Thư viện Media (Album)' }
];

export function CategoryForm({ category, allCategories, tenants, contextTenantId, currentUserRole }: CategoryFormProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const isEdit = !!category;

    const form = useForm({
        defaultValues: {
            module: category?.module || 'news',
            parent_id: category?.parent_id || 'null',
            image_url: category?.image_url || '',
            is_visible: category?.is_visible !== false,
            slug: category?.slug || '',
            name_vi: category?.name_vi || '',
            description_vi: category?.description_vi || '',
            name_km: category?.name_km || '',
            description_km: category?.description_km || '',
            name_en: category?.name_en || '',
            description_en: category?.description_en || '',
            published_to: category?.published_to || [] as string[],
        }
    });

    const formValues = form.watch();
    const selectedModule = formValues.module;
    const parentId = formValues.parent_id;
    const imageUrl = formValues.image_url;
    const isVisible = formValues.is_visible;
    const slug = formValues.slug;
    const [isManualSlug, setIsManualSlug] = useState(false);

    const { hasDraft, lastSaved, restoreDraft, clearDraft } = useAutoSave({
        key: `category_${category?.id || 'new'}`,
        data: formValues,
        onRestore: (draftData) => {
            Object.entries(draftData).forEach(([k, v]) => {
                form.setValue(k as any, v, { shouldDirty: true });
            });
        },
        enabled: true,
        isDirty: form.formState.isDirty,
    });

    // Lọc ra các danh mục hợp lệ làm parent (cùng module, không phải chính nó)
    const validParents = allCategories.filter(c =>
        c.module === selectedModule && c.id !== category?.id
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        Object.entries(formValues).forEach(([key, value]) => {
            if (key === 'published_to') {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, value?.toString() || '');
            }
        });

        if (contextTenantId) {
            formData.append('tenant_id', contextTenantId);
        }

        const result = isEdit
            ? await updateCategory(category.id, formData)
            : await createCategory(formData);

        if (result.success) {
            toast.success(isEdit ? 'Đã cập nhật danh mục thành công!' : 'Đã tạo mới danh mục thành công!');
            clearDraft();
            const targetPath = contextTenantId ? `/admin/t/${contextTenantId}/categories` : '/admin/categories';
            router.push(targetPath);
            router.refresh();
        } else {
            toast.error(result.error || 'Có lỗi xảy ra');
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Header Actions & Revision History */}
                    <div className="sticky top-0 z-10 bg-white pb-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                                    {isEdit ? `Chỉnh sửa Danh mục: ${category?.name_vi}` : 'Thêm Danh mục mới'}
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
                            
                            {isEdit && (
                                <RevisionHistory
                                    tableName="categories"
                                    recordId={category.id}
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
                                        {isEdit ? 'Cập nhật' : 'Tạo mới'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Hình ảnh đại diện */}
                    <div className="space-y-2 pt-4">
                        <Label>Hình ảnh đại diện danh mục</Label>
                        <ImageUpload
                            value={imageUrl}
                            onChange={(val) => form.setValue('image_url', val, { shouldDirty: true })}
                            label="Hình ảnh banner/thumbnail cho danh mục"
                        />
                        <p className="text-xs text-gray-500 italic">* Dùng cho giao diện Overview Cards (Sự kiện, Truyền thông, Dự án...)</p>
                    </div>

                    {/* Module & Parent */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Module / Phân hệ</Label>
                            <Select value={selectedModule} onValueChange={(val) => {
                                form.setValue('module', val, { shouldDirty: true });
                                form.setValue('parent_id', 'null', { shouldDirty: true }); // Reset parent block
                            }}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Chọn module" />
                                </SelectTrigger>
                                <SelectContent>
                                    {MODULES.map(m => (
                                        <SelectItem key={m.value} value={m.value}>
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Danh mục Cha (tuỳ chọn)</Label>
                            <Select value={parentId} onValueChange={(val) => form.setValue('parent_id', val, { shouldDirty: true })}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Không có - Là danh mục gốc" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="null">-- Không có --</SelectItem>
                                    {validParents.map(c => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name_vi}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Hiển thị trên Header */}
                    <div className="flex items-center space-x-2 py-2 px-3 bg-gray-50 rounded-lg border border-gray-100">
                        <Switch
                            id="is_visible"
                            checked={isVisible}
                            onCheckedChange={(val) => form.setValue('is_visible', val, { shouldDirty: true })}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label
                                htmlFor="is_visible"
                                className="text-sm font-medium leading-none cursor-pointer"
                            >
                                Hiển thị trên Header
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Nếu tắt, danh mục sẽ không xuất hiện trên menu điều hướng chính.
                            </p>
                        </div>
                    </div>

                    {/* Broadcast targets for Categories */}
                    {tenants && tenants.length > 0 && (
                        <div className="pt-2 border-t mt-4">
                            <TenantBroadcastSelect
                                tenants={tenants}
                                selectedTenantIds={formValues.published_to}
                                onChange={ids => form.setValue('published_to', ids, { shouldDirty: true })}
                                ownerTenantId={category?.tenant_id || contextTenantId}
                            />
                        </div>
                    )}

                    {/* Language Tabs */}
                    <Tabs defaultValue="vi" className="w-full mt-4">
                        <TabsList>
                            <TabsTrigger value="vi">🇻🇳 Tiếng Việt</TabsTrigger>
                            <TabsTrigger value="km">🇰🇭 ខ្មែរ</TabsTrigger>
                            <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
                        </TabsList>

                        <TabsContent value="vi" className="space-y-4">
                            <div>
                                <Label htmlFor="name_vi">Tên danh mục (VI) <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name_vi"
                                    {...form.register('name_vi', { required: true })}
                                    placeholder="Ví dụ: Sự kiện & Hội thảo"
                                    onChange={(e) => {
                                        form.setValue('name_vi', e.target.value, { shouldDirty: true });
                                        if (!isEdit && !isManualSlug) {
                                            form.setValue('slug', generateSlug(e.target.value), { shouldDirty: true });
                                        }
                                    }}
                                />
                            </div>
                            <div>
                                <Label htmlFor="slug">Đường dẫn (Slug)</Label>
                                <Input
                                    id="slug"
                                    value={slug}
                                    onChange={(e) => {
                                        setIsManualSlug(true);
                                        form.setValue('slug', generateSlug(e.target.value), { shouldDirty: true });
                                    }}
                                    placeholder="url-danh-muc"
                                />
                                <p className="text-xs text-gray-500 mt-1">Đường dẫn sẽ được ưu tiên lấy từ ô này nếu bạn nhập.</p>
                            </div>
                            <div>
                                <Label htmlFor="description_vi">Mô tả ngắn (VI)</Label>
                                <Textarea
                                    id="description_vi"
                                    {...form.register('description_vi')}
                                    placeholder="Mô tả ngắn gọn về danh mục này..."
                                    rows={3}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="km" className="space-y-4">
                            <div>
                                <Label htmlFor="name_km">Tên danh mục (KM)</Label>
                                <Input
                                    id="name_km"
                                    {...form.register('name_km')}
                                    placeholder="បញ្ចូលឈ្មោះ..."
                                />
                            </div>
                            <div>
                                <Label htmlFor="description_km">Mô tả ngắn (KM)</Label>
                                <Textarea
                                    id="description_km"
                                    {...form.register('description_km')}
                                    placeholder="ការពិពណ៌នា..."
                                    rows={3}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="en" className="space-y-4">
                            <div>
                                <Label htmlFor="name_en">Tên danh mục (EN)</Label>
                                <Input
                                    id="name_en"
                                    {...form.register('name_en')}
                                    placeholder="Enter name..."
                                />
                            </div>
                            <div>
                                <Label htmlFor="description_en">Mô tả ngắn (EN)</Label>
                                <Textarea
                                    id="description_en"
                                    {...form.register('description_en')}
                                    placeholder="Brief description..."
                                    rows={3}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                </form>
            </CardContent>
        </Card>
    );
}
