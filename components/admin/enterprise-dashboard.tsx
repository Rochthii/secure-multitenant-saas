import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Newspaper,
    Users,
    Activity,
    ArrowRight,
    FileText,
    Settings,
    Mail,
    Boxes,
    MonitorDot,
    TrendingUp,
    Globe,
    Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { RecentActivity } from '@/components/admin/dashboard-widgets';
import { UnreadMessagesWidget } from '@/components/admin/unread-messages-widget';
import { cn } from '@/lib/utils';

interface EnterpriseDashboardUIProps {
    tenantId: string;
    tenantName: string;
    newsCount: number;
    eventsCount: number;
    pendingRegistrations: number;
    recentNews: any[];
    recentTransactions?: any[];
}

export function EnterpriseDashboardUI({
    tenantId,
    tenantName,
    newsCount,
    eventsCount,
    pendingRegistrations,
    recentNews,
    recentTransactions,
}: EnterpriseDashboardUIProps) {
    const base = `/admin/t/${tenantId}`;

    const kpiCards = [
        {
            title: 'Bài viết & Nội dung',
            value: newsCount,
            icon: Newspaper,
            change: '+12% so với tháng trước',
            accent: 'from-violet-600 to-indigo-600',
            bg: 'bg-violet-500/10',
            border: 'border-violet-500/20',
            text: 'text-violet-400',
        },
        {
            title: 'Sự kiện đang diễn ra',
            value: eventsCount,
            icon: Activity,
            change: 'Cập nhật thời gian thực',
            accent: 'from-sky-600 to-blue-600',
            bg: 'bg-sky-500/10',
            border: 'border-sky-500/20',
            text: 'text-sky-400',
        },
        {
            title: 'Leads & Đăng ký mới',
            value: pendingRegistrations,
            icon: Users,
            change: 'Chờ xử lý',
            accent: 'from-emerald-600 to-teal-600',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            text: 'text-emerald-400',
        },
    ];

    const quickActions = [
        { href: `${base}/news/new`, label: 'Đăng nội dung mới', icon: Newspaper, desc: 'Tin tức, thông cáo báo chí' },
        { href: `${base}/events/new`, label: 'Tạo sự kiện', icon: Activity, desc: 'Hội thảo, webinar, gặp gỡ' },
        { href: `${base}/pages`, label: 'Quản lý trang', icon: FileText, desc: 'Landing page, giới thiệu' },
        { href: `${base}/messages`, label: 'Phản hồi khách hàng', icon: Mail, desc: 'CRM & Tin nhắn liên hệ' },
        { href: `${base}/organizations`, label: 'Mạng lưới đối tác', icon: Boxes, desc: 'Quản lý hệ sinh thái' },
        { href: `${base}/homepage`, label: 'Website Builder', icon: Sparkles, desc: 'Tùy biến trang chủ' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ── Hero Header ─────────────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-3xl bg-[#0a0a0f] border border-white/[0.06] shadow-2xl">
                {/* ambient glows */}
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 p-8 sm:p-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                                {tenantName}
                            </h1>
                            <span className="hidden sm:flex px-3 py-1 bg-violet-600/30 text-violet-300 text-[10px] font-black rounded-full border border-violet-500/30 uppercase tracking-widest items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                Enterprise
                            </span>
                        </div>
                        <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
                            Trung tâm điều hành nội dung & vận hành doanh nghiệp. Theo dõi hoạt động, quản lý nhân sự và tương tác khách hàng theo thời gian thực.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 px-5 py-3 bg-white/[0.04] backdrop-blur-md rounded-2xl border border-white/[0.08] shrink-0">
                        <MonitorDot className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-400">All Systems Operational</span>
                    </div>
                </div>
            </div>

            {/* ── KPI Cards ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Unread Messages */}
                <UnreadMessagesWidget tenantId={tenantId} />

                {kpiCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Card
                            key={card.title}
                            className={cn(
                                'group border shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl overflow-hidden bg-white/60 backdrop-blur-xl hover:border-violet-300/40',
                                card.border
                            )}
                        >
                            <CardContent className="p-6 relative">
                                <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center mb-4 border', card.bg, card.border)}>
                                    <Icon className={cn('h-5 w-5', card.text)} />
                                </div>
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{card.title}</p>
                                <h3 className="text-3xl font-black text-slate-900">{card.value}</h3>
                                <p className="text-xs text-slate-400 mt-2">{card.change}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* ── Main Content ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow duration-500">
                    <RecentActivity news={recentNews || []} transactions={recentTransactions ?? []} />
                </div>

                {/* Quick Actions */}
                <Card className="border border-slate-800 shadow-2xl rounded-3xl overflow-hidden bg-slate-950 text-white relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-indigo-500/5 pointer-events-none" />
                    <CardHeader className="py-6 px-7 border-b border-slate-800/80 relative z-10">
                        <CardTitle className="text-base font-black flex items-center gap-3">
                            <div className="p-2 bg-violet-500/20 rounded-xl border border-violet-500/30">
                                <ArrowRight className="w-4 h-4 text-violet-400" />
                            </div>
                            Thao tác nhanh
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 relative z-10">
                        <ul className="space-y-2">
                            {quickActions.map((action, idx) => (
                                <li key={idx}>
                                    <Link
                                        href={action.href}
                                        className="flex items-center gap-3 p-3 rounded-xl border bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:border-violet-500/40 transition-all group"
                                    >
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-slate-800 border border-slate-700 group-hover:bg-violet-600/20 group-hover:border-violet-500/40 transition-colors">
                                            <action.icon className="w-4 h-4 text-slate-400 group-hover:text-violet-400 transition-colors" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors truncate">{action.label}</p>
                                            <p className="text-[11px] text-slate-500 truncate">{action.desc}</p>
                                        </div>
                                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-violet-400 shrink-0 transition-colors" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* ── Impact Metric Strip ──────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Nền tảng', value: 'Multi-tenant SaaS', icon: Globe },
                    { label: 'Bảo mật', value: 'ISO 27001 Ready', icon: Settings },
                    { label: 'Uptime', value: '99.99%', icon: TrendingUp },
                    { label: 'Dữ liệu', value: 'RLS Enforced', icon: MonitorDot },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100"
                    >
                        <item.icon className="w-4 h-4 text-violet-500 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider truncate">{item.label}</p>
                            <p className="text-sm font-black text-slate-900 truncate">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
