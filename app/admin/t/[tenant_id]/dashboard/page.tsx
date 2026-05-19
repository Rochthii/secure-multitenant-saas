import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getAdminDashboardStats } from '@/lib/cache/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, Calendar, DollarSign, UserCheck, ArrowRight, FileText, Settings, Activity } from 'lucide-react';
import { formatCurrency } from '@/lib/constants/transaction';
import Link from 'next/link';
import { TransactionAnalyticsWrapper } from '@/components/admin/transaction-analytics-wrapper';
import { RecentActivity } from '@/components/admin/dashboard-widgets';
import { UnreadMessagesWidget } from '@/components/admin/unread-messages-widget';
import { DashboardTransactionSummary } from '@/components/admin/dashboard-transaction-summary';
import { requireTenantAccess } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { getTenantConfig } from '@/lib/tenant';

export default async function AdminDashboard({ params }: { params: Promise<{ tenant_id: string }> }) {
    const { tenant_id } = await params;
    // SECURITY: Verify user has access to this specific tenant
    await requireTenantAccess(tenant_id);

    const base = `/admin/t/${tenant_id}`;
    
    // Get tenant type
    const tenantConfig = await getTenantConfig(tenant_id);
    const tenantName = (tenantConfig as any)?.name ?? 'Workspace';

    // Use realtime stats (RLS enforced)
    const {
        newsCount,
        eventsCount,
        projectsCount,
        totalTransactions,
        pendingRegistrations,
        recentNews,
        recentTransactions,
        transactions,
        transactionSummary,
    } = await getAdminDashboardStats(tenant_id);

    const stats = [
        {
            title: 'Bài viết & Giải pháp',
            value: newsCount,
            icon: Newspaper,
            color: 'text-blue-600',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20'
        },
        {
            title: 'Hạng mục & Dự án',
            value: projectsCount || eventsCount, // Fallback if old data
            icon: Calendar,
            color: 'text-indigo-600',
            bg: 'bg-indigo-500/10',
            border: 'border-indigo-500/20'
        },
        {
            title: 'Tổng doanh thu (MRR)',
            value: formatCurrency(totalTransactions),
            icon: DollarSign,
            color: 'text-emerald-600',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20'
        },
        {
            title: 'Lượt đăng ký / Leads',
            value: pendingRegistrations,
            icon: UserCheck,
            color: 'text-purple-600',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20'
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Enterprise Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl">
                {/* Abstract shapes */}
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl mix-blend-screen pointer-events-none" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl mix-blend-screen pointer-events-none" />
                
                <div className="relative z-10 p-8 sm:p-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                                {tenantName}
                            </h1>
                            <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-bold rounded-full shadow-lg flex items-center gap-2 uppercase tracking-widest border border-white/10">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                                Enterprise Workspace
                            </span>
                        </div>
                        <p className="text-slate-400 max-w-xl text-sm sm:text-base leading-relaxed">
                            Trung tâm điều hành và phân tích dữ liệu chuyên sâu. Giám sát toàn bộ hoạt động kinh doanh, bảo mật và lưu lượng tương tác theo thời gian thực.
                        </p>
                    </div>
                    
                    <div className="hidden sm:flex flex-col items-end px-6 py-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1.5">System Status</span>
                        <div className="flex items-center gap-2.5">
                            <Activity className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-bold text-emerald-400 tracking-wide">All Systems Operational</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistic Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <UnreadMessagesWidget tenantId={tenant_id} />
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title} className="group border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-purple-500/30 transition-all duration-500 rounded-[2rem] overflow-hidden bg-white/60 backdrop-blur-xl">
                            <CardContent className="p-7 relative h-full flex flex-col justify-center">
                                <div className={`absolute -bottom-4 -right-4 p-6 opacity-0 group-hover:opacity-5 transition-all duration-500 transform scale-150 rotate-12 ${stat.color}`}>
                                    <Icon className="w-24 h-24" />
                                </div>
                                <div className="relative z-10">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 group-hover:-rotate-3 duration-500 shadow-sm border",
                                        stat.bg,
                                        stat.border
                                    )}>
                                        <Icon className={cn("h-5 w-5", stat.color)} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                            {stat.title}
                                        </p>
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                                            {stat.value}
                                        </h3>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Transaction Summary Table */}
                    {transactionSummary && (
                        <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow duration-500">
                            <DashboardTransactionSummary summary={transactionSummary} />
                        </div>
                    )}

                    {/* Analytics Chart */}
                    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow duration-500">
                        <TransactionAnalyticsWrapper transactions={transactions || []} />
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow duration-500">
                        <RecentActivity news={recentNews || []} transactions={recentTransactions} />
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Quick Actions */}
                    <Card className="border border-slate-800 shadow-2xl rounded-[2.5rem] overflow-hidden bg-slate-950 text-white relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 pointer-events-none" />
                        <CardHeader className="py-7 px-8 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-sm relative z-10">
                            <CardTitle className="text-lg font-black flex items-center gap-3">
                                <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-500/30">
                                    <ArrowRight className="w-5 h-5 text-blue-400" />
                                </div>
                                Thao tác nhanh
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 relative z-10">
                            <ul className="grid gap-3">
                                {[
                                    {
                                        href: `${base}/news/new`,
                                        title: 'Giải pháp mới',
                                        icon: Newspaper,
                                        desc: 'Truyền thông giá trị mới',
                                    },
                                    {
                                        href: `${base}/projects/new`,
                                        title: 'Dự án / Chiến dịch',
                                        icon: Calendar,
                                        desc: 'Khởi tạo chiến dịch',
                                    },
                                    {
                                        href: `${base}/transactions`,
                                        title: 'Quản lý Doanh thu',
                                        icon: FileText,
                                        desc: 'Theo dõi dòng tiền (MRR)',
                                    },
                                    {
                                        href: `${base}/homepage`,
                                        title: 'Cấu hình Global',
                                        icon: Settings,
                                        desc: 'Kiến trúc hệ thống',
                                    }
                                ].map((link, idx) => (
                                    <li key={idx}>
                                        <Link 
                                            href={link.href}
                                            className="flex items-center gap-4 p-4 rounded-[1.5rem] transition-all border bg-slate-900/50 border-slate-800/80 hover:bg-slate-800 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-900/20 group"
                                        >
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner bg-slate-800 border border-slate-700 group-hover:bg-blue-600/20 transition-colors">
                                                <link.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors truncate">{link.title}</h4>
                                                <p className="text-[11px] text-slate-500 truncate mt-0.5">{link.desc}</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:bg-blue-500 group-hover:border-blue-500 transition-colors">
                                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
