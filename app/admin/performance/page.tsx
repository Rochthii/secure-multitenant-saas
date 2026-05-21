import React from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/require-admin';
import { requirePermission } from '@/lib/permissions';
import { BenchmarkDashboard } from '@/components/admin/benchmark-dashboard';
import { Gauge, Info, BookOpen, ChevronRight, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = {
    title: 'Performance & Benchmark RLS | Admin',
    description: 'Công cụ đo lường hiệu năng hệ thống phân quyền (Row Level Security) – Dữ liệu phục vụ Chương 5 Đồ án.',
};

export default async function PerformancePage() {
    await requireAdmin();
    await requirePermission('settings', 'read');

    return (
        <div className="min-h-screen space-y-8 bg-slate-950 text-slate-300">
            {/* Page Header */}
            <div className="flex flex-col gap-2 pb-4 border-b border-white/5">
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <Gauge className="w-8 h-8 text-indigo-400" />
                    Performance & Benchmark Dashboard
                </h1>
                <p className="text-slate-400 text-sm max-w-2xl">
                    Đo lường và so sánh hiệu năng của 2 phương pháp kiểm soát phân quyền (RLS) để kiểm chứng giả thuyết kỹ thuật trong Chương 5 của đồ án.
                </p>
                <div>
                    <Link
                        href="/admin/security-center"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-200 bg-indigo-950/40 border border-indigo-500/30 px-3 py-1.5 rounded-full hover:bg-indigo-900/50 hover:text-white transition-colors"
                    >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Trung tâm An ninh
                    </Link>
                </div>
            </div>

            {/* Methodology Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-rose-950/20 border-rose-500/20 backdrop-blur-xl">
                    <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20 shrink-0 mt-0.5">
                                <BookOpen className="w-4 h-4 text-rose-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-rose-300 mb-1">Phương pháp Legacy – O(N)</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Policy RLS gọi hàm SQL <code className="text-rose-300 bg-rose-950/60 px-1 rounded">public.get_current_user_role()</code> — thực thi một câu <code className="text-rose-300 bg-rose-950/60 px-1 rounded">SELECT</code> phụ vào bảng <code className="text-slate-300 bg-slate-800 px-1 rounded">user_roles</code> cho <strong className="text-rose-300">mỗi dòng dữ liệu</strong> được scan, gây ra overhead đáng kể khi bảng lớn.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-emerald-950/20 border-emerald-500/20 backdrop-blur-xl">
                    <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 shrink-0 mt-0.5">
                                <BookOpen className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-emerald-300 mb-1">Phương pháp JWT Claims – O(1)</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Policy RLS đọc thẳng từ JWT token của phiên đăng nhập qua <code className="text-emerald-300 bg-emerald-950/60 px-1 rounded">auth.jwt() -&gt;&gt; 'role'</code> — không tốn thêm bất kỳ truy vấn DB nào, chi phí kiểm tra phân quyền là hằng số <strong className="text-emerald-300">O(1)</strong>.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* How to interpret results */}
            <Card className="border-indigo-500/20 bg-indigo-950/10">
                <CardContent className="p-4 flex items-start gap-3">
                    <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-400 leading-relaxed space-y-1">
                        <p><strong className="text-indigo-300">Cách đọc kết quả:</strong> P50 là độ trễ trung vị (50% request nhanh hơn mức này). P90 và P99 là các ngưỡng đuôi — thể hiện trải nghiệm của người dùng trong điều kiện xấu nhất (tail latency). Chênh lệch P99 đặc biệt quan trọng trong môi trường đa tenant.</p>
                        <p className="flex items-center gap-1"><ChevronRight className="w-3 h-3 text-indigo-500" />Dữ liệu này dùng để vẽ biểu đồ và bảng so sánh trong <strong className="text-white">Chương 5 – Thực nghiệm & Đánh giá</strong> của báo cáo đồ án.</p>
                    </div>
                </CardContent>
            </Card>

            {/* Main Dashboard */}
            <BenchmarkDashboard />
        </div>
    );
}
