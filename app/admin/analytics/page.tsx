import React from 'react';
import { redirect } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getVisitorStats } from '@/lib/analytics';
import { formatCurrency } from '@/lib/constants/transaction';
import { createClient } from '@/lib/supabase/server';
import { isGlobalAdmin } from '@/lib/permissions';

// ─── Default values for error states ────────────────────────────────────
const DEFAULT_ANALYTICS = {
    stats: {
        monthlyNews: 0,
        monthlyEvents: 0,
        monthlyTransactions: 0,
        monthlyRegistrations: 0,
    },
    topNews: null,
    topEvent: null,
    recentNews: [],
    recentTransactions: [],
};

// ─── Cache analytics data ───────────────────────────────────────────────
const getCachedAnalyticsData = unstable_cache(
    async () => {
        try {
            const supabase = await createClient();

            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

            // Parallel queries with safer selection
            const [
                monthlyNewsRes, 
                monthlyEventsRes, 
                monthlyTransactionsRes, 
                monthlyRegRes,
                topNewsRes, 
                topEventRes, 
                recentNewsRes, 
                recentTransactionsRes
            ] = await Promise.all([
                supabase.from('news').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth),
                supabase.from('events').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth),
                supabase.from('transactions').select('amount').gte('created_at', startOfMonth).eq('status', 'completed'),
                supabase.from('event_registrations').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth),
                supabase.from('news').select('id, title_vi, view_count').order('view_count', { ascending: false }).limit(1).maybeSingle(),
                supabase.from('events').select('id, title_vi, current_participants').order('current_participants', { ascending: false }).limit(1).maybeSingle(),
                supabase.from('news').select('title_vi, created_at').order('created_at', { ascending: false }).limit(5),
                supabase.from('transactions').select('donor_name, amount, created_at, is_anonymous').order('created_at', { ascending: false }).limit(5),
            ]);

            const monthlyTransactions = (monthlyTransactionsRes.data ?? []).reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);

            return {
                stats: {
                    monthlyNews: monthlyNewsRes.count ?? 0,
                    monthlyEvents: monthlyEventsRes.count ?? 0,
                    monthlyTransactions,
                    monthlyRegistrations: monthlyRegRes.count ?? 0,
                },
                topNews: topNewsRes.data as { id: string; title_vi: string; view_count: number } | null,
                topEvent: topEventRes.data as { id: string; title_vi: string; current_participants: number } | null,
                recentNews: (recentNewsRes.data ?? []) as any[],
                recentTransactions: (recentTransactionsRes.data ?? []) as any[],
            };
        } catch (error) {
            console.error('Analytics Fetch Error:', error);
            return DEFAULT_ANALYTICS;
        }
    },
    ['admin-analytics-data-v2'], // Versioned key
    { revalidate: 300, tags: ['admin-analytics'] }
);

export default async function AnalyticsPage() {
    // SECURITY: Only global admins can see system-wide analytics
    const globalAccess = await isGlobalAdmin();
    if (!globalAccess) {
        redirect('/admin');
    }

    // Fetch in parallel
    const [analyticsData, visitorStats] = await Promise.all([
        getCachedAnalyticsData(),
        getVisitorStats(),
    ]);

    const { stats, topNews, topEvent, recentNews, recentTransactions } = analyticsData || DEFAULT_ANALYTICS;

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-playfair font-bold">Analytics Hệ thống</h1>
                <p className="text-gray-500 text-sm italic">* Số liệu được cập nhật tự động sau mỗi 5 phút.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-none shadow-md bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-wider">
                            Tin tức tháng này
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-black text-blue-600">
                            {stats.monthlyNews}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-wider">
                            Sự kiện tháng này
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-black text-amber-600">
                            {stats.monthlyEvents}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-wider">
                            Thanh toán tháng này
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black text-green-600">
                            {formatCurrency(stats.monthlyTransactions)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-wider">
                            Đăng ký tháng này
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-black text-indigo-600">
                            {stats.monthlyRegistrations}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Online Status */}
            <div className="bg-slate-900 text-white rounded-[2rem] p-8 flex items-center justify-between shadow-xl">
                 <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Trạng thái hiện tại</h3>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        <span className="text-2xl font-black">{visitorStats.online} người đang truy cập</span>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">Tổng lượt truy cập</p>
                    <p className="text-3xl font-black text-gold-primary">{visitorStats.total.toLocaleString()} views</p>
                 </div>
            </div>

            {/* Top Content */}
            <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-500">Nội dung nổi bật</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-gray-100">
                        <div className="p-6 transition-colors hover:bg-slate-50 cursor-default">
                            <h3 className="text-[11px] font-black text-blue-500 uppercase tracking-widest mb-3">
                                Tin tức xem nhiều nhất 🔥
                            </h3>
                            <p className="text-lg font-bold text-gray-800 leading-snug line-clamp-2">
                                {topNews?.title_vi || 'Chưa có dữ liệu'}
                            </p>
                            {topNews && <p className="text-xs text-gray-400 mt-2">{topNews.view_count} lượt xem</p>}
                        </div>
                        <div className="p-6 transition-colors hover:bg-slate-50 cursor-default">
                            <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-widest mb-3">
                                Sự kiện được quan tâm ✨
                            </h3>
                            <p className="text-lg font-bold text-gray-800 leading-snug line-clamp-2">
                                {topEvent?.title_vi || 'Chưa có dữ liệu'}
                            </p>
                            {topEvent && <p className="text-xs text-gray-400 mt-2">{topEvent.current_participants} người tham gia</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                <Card className="border-none shadow-md h-full">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-500">Tin tức mới nhất</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {recentNews.length > 0 ? recentNews.map((news: any, idx: number) => (
                                <li key={`${news.created_at}-${idx}`} className="flex justify-between items-center group">
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-gold-dark transition-colors line-clamp-1 flex-1">{news.title_vi}</span>
                                    <span className="text-xs font-bold text-gray-400 ml-4 tabular-nums">
                                        {new Date(news.created_at).toLocaleDateString('vi-VN')}
                                    </span>
                                </li>
                            )) : <li className="text-sm text-gray-400 italic">Chưa có dữ liệu tin tức mới.</li>}
                        </ul>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md h-full">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-500">Đóng góp gần đây</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {recentTransactions.length > 0 ? recentTransactions.map((transaction: any, idx: number) => (
                                <li key={`${transaction.created_at}-${idx}`} className="flex justify-between items-center group">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-bold text-gray-800">
                                            {transaction.is_anonymous ? 'Ẩn danh' : transaction.donor_name}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">
                                            {new Date(transaction.created_at).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                    <span className="text-sm font-black text-green-600 tabular-nums">
                                        +{formatCurrency(transaction.amount)}
                                    </span>
                                </li>
                            )) : <li className="text-sm text-gray-400 italic">Chưa có dữ liệu đóng góp mới.</li>}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
