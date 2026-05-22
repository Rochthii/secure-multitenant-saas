import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, HelpCircle, Info } from 'lucide-react';
// @ts-ignore
import { DeleteFAQButton } from '@/components/admin/delete-faq-button';
import { requireTenantAccess } from '@/lib/permissions';
import { Badge } from '@/components/ui/badge';

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
        <div className="space-y-6 text-slate-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <HelpCircle className="w-8 h-8 text-amber-400" />
                        Câu hỏi thường gặp (FAQ)
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Quản lý các câu hỏi thường gặp của cơ sở để hỗ trợ giải đáp thắc mắc cho người dùng.
                    </p>
                </div>
                <Link href={`/admin/t/${tenant_id}/faq/new`}>
                    <Button className="bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/20 px-5">
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo câu hỏi mới
                    </Button>
                </Link>
            </div>

            <Card className="border-white/[0.08] bg-slate-900/40 backdrop-blur-xl overflow-hidden rounded-2xl shadow-none">
                <CardContent className="p-0">
                    {(faqs as any[]) && (faqs as any[]).length > 0 ? (
                        <div className="divide-y divide-white/[0.05]">
                            {(faqs as any[]).map((faq, index) => (
                                <div key={faq.id} className="p-6 hover:bg-white/[0.02] transition-colors group">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Badge className="bg-white/5 text-slate-400 border border-white/10 rounded-lg font-bold px-2 py-1">
                                                    #{index + 1}
                                                </Badge>
                                                <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                                                    {faq.question_vi}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-slate-400 mt-2 line-clamp-2 pl-1">
                                                {faq.answer_vi}
                                            </p>
                                            <div className="mt-3 flex gap-2 pl-1">
                                                {faq.question_en && (
                                                    <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-bold">EN</Badge>
                                                )}
                                                {faq.question_km && (
                                                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold">KM</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <Link href={`/admin/t/${tenant_id}/faq/${faq.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-amber-400 hover:bg-white/5 rounded-xl transition-colors">
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
                        <div className="p-16 text-center text-slate-400">
                            <HelpCircle className="h-10 w-10 mx-auto mb-4 text-slate-600" />
                            <p className="mb-4 font-bold text-white">Chưa có câu hỏi nào</p>
                            <Link href={`/admin/t/${tenant_id}/faq/new`}>
                                <Button className="bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/20 px-5">
                                    Tạo câu hỏi đầu tiên
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="p-5 bg-blue-950/20 rounded-2xl border border-blue-500/20 text-slate-300 flex gap-4 mt-6">
                <div className="mt-0.5 bg-blue-500/10 p-2 rounded-xl h-fit border border-blue-500/20">
                    <Info className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                    <h3 className="font-bold text-blue-300 mb-2">💡 Hướng dẫn</h3>
                    <p className="text-sm text-slate-400">
                        FAQ hiển thị trên trang chủ hoặc trang riêng. Hỗ trợ 3 ngôn ngữ: Tiếng Việt, English, Khmer.
                        Sử dụng "Thứ tự" để sắp xếp vị trí hiển thị hợp lý.
                    </p>
                </div>
            </div>
        </div>
    );
}
