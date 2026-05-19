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
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-playfair font-bold">Hàng chờ duyệt bài</h1>
                <p className="text-gray-600 mt-1">
                    Xem xét nội dung do biên tập viên gửi
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            Chờ duyệt
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{items.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Đã duyệt hôm nay
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-</div>
                        <p className="text-xs text-gray-500 mt-1">Sắp có</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            Từ chối hôm nay
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-</div>
                        <p className="text-xs text-gray-500 mt-1">Sắp có</p>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Items List */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Bài chờ duyệt</h2>
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
                        <Card>
                            <CardContent className="py-8 text-center text-gray-500">
                                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p className="text-lg">Không có bài chờ duyệt</p>
                                <p className="text-sm mt-1">Tất cả nội dung đã được xem xét</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
