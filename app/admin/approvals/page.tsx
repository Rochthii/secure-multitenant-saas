import React from 'react';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ApprovalCard } from '@/components/admin/approval-card';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

export default async function ApprovalsPage() {
    // Chỉ admin trở lên mới xem queue duyệt bài
    await requireAdmin();

    const supabase = await createClient();

    // Lấy tất cả news đang pending_review
    const { data: pendingItems } = await (supabase as any)
        .from('news')
        .select('id, title_vi, excerpt_vi, author_name, created_at, status')
        .eq('status', 'pending_review')
        .order('created_at', { ascending: true });

    const items = pendingItems || [];

    return (
        <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl -mr-64 -mt-64 mix-blend-screen pointer-events-none" />
                <div className="relative z-10 p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30 text-amber-400">
                            <Clock className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent tracking-tight">Hàng chờ duyệt bài</h1>
                            <p className="text-slate-400 mt-1.5 text-sm">
                                Xem xét và phê duyệt nội dung bài đăng do biên tập viên gửi lên hệ thống.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 shadow-lg rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-500" />
                            Chờ duyệt
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">{items.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 shadow-lg rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            Đã duyệt hôm nay
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">-</div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-medium">Sắp ra mắt</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 shadow-lg rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-widest flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-rose-500" />
                            Từ chối hôm nay
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">-</div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-medium">Sắp ra mắt</p>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Items List */}
            <div className="space-y-4">
                <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Bài viết đang chờ phê duyệt</h2>
                <div className="space-y-4">
                    {items.length > 0 ? (
                        items.map((item: any) => (
                            <ApprovalCard
                                key={item.id}
                                item={{
                                    id: item.id,
                                    title: item.title_vi,
                                    excerpt: item.excerpt_vi,
                                    submitted_by: item.author_name || 'Không rõ',
                                    submitted_at: item.created_at || new Date().toISOString(),
                                    content: item.content ?? undefined,
                                }}
                            />
                        ))
                    ) : (
                        <Card className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-lg rounded-2xl">
                            <CardContent className="py-12 text-center text-slate-500 dark:text-slate-400">
                                <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-700 animate-pulse" />
                                <p className="text-lg font-bold text-slate-800 dark:text-slate-200">Không có bài chờ duyệt</p>
                                <p className="text-sm mt-1 text-slate-400 dark:text-slate-500">Tất cả nội dung đã được xem xét và xử lý.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
