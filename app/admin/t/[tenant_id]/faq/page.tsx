import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
// @ts-ignore
import { DeleteFAQButton } from '@/components/admin/delete-faq-button';
import { requireTenantAccess } from '@/lib/permissions';

export default async function FAQListPage({ params }: { params: Promise<{ tenant_id: string }> }) {
    const { tenant_id } = await params;
    await requireTenantAccess(tenant_id);
    const supabase = await createClient();
    const { data: faqs } = await supabase
        .from('faqs')
        .select('*')
        .eq('tenant_id', tenant_id)
        .order('order_index', { ascending: true });

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-playfair font-bold">Câu hỏi thường gặp (FAQ)</h1>
                <Link href={`/admin/t/${tenant_id}/faq/new`}>
                    <Button className="bg-gold-primary hover:bg-gold-dark">
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo câu hỏi mới
                    </Button>
                </Link>
            </div>

            <Card>
                <CardContent className="p-0">
                    {(faqs as any[]) && (faqs as any[]).length > 0 ? (
                        <div className="divide-y">
                            {(faqs as any[]).map((faq, index) => (
                                <div key={faq.id} className="p-6 hover:bg-gray-50">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    #{index + 1}
                                                </span>
                                                <h3 className="font-semibold text-gray-900">
                                                    {faq.question_vi}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {faq.answer_vi}
                                            </p>
                                            <div className="mt-2 flex gap-2">
                                                {faq.question_en && (
                                                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">EN</span>
                                                )}
                                                {faq.question_km && (
                                                    <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">KM</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={`/admin/t/${tenant_id}/faq/${faq.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <DeleteFAQButton id={faq.id} tenantId={tenant_id} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                            <p className="mb-4">Chưa có câu hỏi nào</p>
                            <Link href={`/admin/t/${tenant_id}/faq/new`}>
                                <Button className="bg-gold-primary hover:bg-gold-dark">
                                    Tạo câu hỏi đầu tiên
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Hướng dẫn</h3>
                <p className="text-sm text-blue-800">
                    FAQ hiển thị trên trang chủ hoặc trang riêng. Hỗ trợ 3 ngôn ngữ: Tiếng Việt, English, Khmer.
                    Sử dụng "Thứ tự" để sắp xếp vị trí hiển thị.
                </p>
            </div>
        </div>
    );
}
