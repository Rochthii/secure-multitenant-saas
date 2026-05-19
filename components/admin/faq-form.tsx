'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// @ts-ignore
import { createFAQ, updateFAQ } from '@/app/actions/admin/faq';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, RotateCcw, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { RevisionHistory } from '@/components/admin/revision-history';
import { useAutoSave } from '@/hooks/use-auto-save';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useForm } from 'react-hook-form';

interface FAQFormProps {
    faq?: any;
    contextTenantId?: string;
    currentUserRole?: string;
}

export function FAQForm({ faq, contextTenantId, currentUserRole }: FAQFormProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const isEdit = !!faq;

    const form = useForm({
        defaultValues: {
            display_order: faq?.display_order || 0,
            category: faq?.category || '',
            question_vi: faq?.question_vi || '',
            answer_vi: faq?.answer_vi || '',
            question_en: faq?.question_en || '',
            answer_en: faq?.answer_en || '',
            question_km: faq?.question_km || '',
            answer_km: faq?.answer_km || '',
            is_published: faq?.is_published ?? true,
        }
    });

    const formValues = form.watch();

    const { hasDraft, lastSaved, restoreDraft, clearDraft } = useAutoSave({
        key: `faq_${faq?.id || 'new'}`,
        data: formValues,
        onRestore: (draftData) => {
            Object.entries(draftData).forEach(([k, v]) => {
                form.setValue(k as any, v, { shouldDirty: true });
            });
        },
        enabled: true,
        isDirty: form.formState.isDirty,
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        Object.entries(formValues).forEach(([key, value]) => {
            formData.append(key, value?.toString() || '');
        });

        if (contextTenantId) {
            formData.append('tenant_id', contextTenantId);
        }

        const result = isEdit
            ? await updateFAQ(contextTenantId!, faq.id, formData)
            : await createFAQ(formData);

        if (result.success) {
            toast.success(isEdit ? 'Đã cập nhật câu hỏi thành công!' : 'Đã tạo mới câu hỏi thành công!');
            clearDraft();
            const targetPath = contextTenantId ? `/admin/t/${contextTenantId}/faq` : '/admin/faq';
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
                                    {isEdit ? 'Chỉnh sửa Câu hỏi (FAQ)' : 'Thêm Câu hỏi mới'}
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
                                    tableName="faqs"
                                    recordId={faq.id}
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

                    {/* Order Index */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div>
                            <Label htmlFor="display_order">Thứ tự hiển thị</Label>
                            <Input
                                type="number"
                                id="display_order"
                                {...form.register('display_order')}
                                min={0}
                            />
                        </div>
                        <div>
                            <Label htmlFor="category">Danh mục (tùy chọn)</Label>
                            <Input
                                id="category"
                                {...form.register('category')}
                                placeholder="Chung, Lễ nghi, Thanh toán..."
                            />
                        </div>
                    </div>

                    {/* Question & Answer Tabs */}
                    <Tabs defaultValue="vi" className="w-full">
                        <TabsList>
                            <TabsTrigger value="vi">Tiếng Việt</TabsTrigger>
                            <TabsTrigger value="km">Khmer</TabsTrigger>
                            <TabsTrigger value="en">English (Tùy chọn)</TabsTrigger>
                        </TabsList>

                        <TabsContent value="vi" className="space-y-4">
                            <div>
                                <Label htmlFor="question_vi">Câu hỏi (VI) <span className="text-red-500">*</span></Label>
                                <Input
                                    id="question_vi"
                                    {...form.register('question_vi', { required: true })}
                                    placeholder="Nhập câu hỏi..."
                                />
                            </div>
                            <div>
                                <Label htmlFor="answer_vi">Câu trả lời (VI) <span className="text-red-500">*</span></Label>
                                <Textarea
                                    id="answer_vi"
                                    {...form.register('answer_vi', { required: true })}
                                    rows={6}
                                    placeholder="Nhập câu trả lời..."
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="en" className="space-y-4">
                            <div>
                                <Label htmlFor="question_en">Question (EN)</Label>
                                <Input
                                    id="question_en"
                                    {...form.register('question_en')}
                                    placeholder="Enter question..."
                                />
                            </div>
                            <div>
                                <Label htmlFor="answer_en">Answer (EN)</Label>
                                <Textarea
                                    id="answer_en"
                                    {...form.register('answer_en')}
                                    rows={6}
                                    placeholder="Enter answer..."
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="km" className="space-y-4">
                            <div>
                                <Label htmlFor="question_km">Câu hỏi (KM)</Label>
                                <Input
                                    id="question_km"
                                    {...form.register('question_km')}
                                    placeholder="បញ្ចូលសំណួរជាភាសាខ្មែរ..."
                                />
                            </div>
                            <div>
                                <Label htmlFor="answer_km">Câu trả lời (KM)</Label>
                                <Textarea
                                    id="answer_km"
                                    {...form.register('answer_km')}
                                    rows={6}
                                    placeholder="បញ្ចូលចម្លើយជាភាសាខ្មែរ..."
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                </form>
            </CardContent>
        </Card>
    );
}
