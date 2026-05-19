'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, DollarSign, Newspaper, Calendar, TrendingUp, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/constants/transaction';

interface GlobalStatsGridProps {
    stats: {
        newsCount: number;
        eventsCount: number;
        tenantsCount: number;
        totalVolume: number;
        pendingRegistrations: number;
    };
}

export function GlobalStatsGrid({ stats }: GlobalStatsGridProps) {
    const items = [
        {
            title: 'Tổ chức & Chi nhánh',
            value: stats.tenantsCount,
            icon: Building2,
            gradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
            iconColor: 'text-blue-400',
            bg: 'bg-blue-500/10 border-blue-500/20',
            borderHover: 'hover:border-blue-500/50',
            shadowHover: 'hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]',
            desc: 'Đang hoạt động trên hệ thống'
        },
        {
            title: 'Dòng tiền lưu chuyển',
            value: formatCurrency(stats.totalVolume),
            icon: DollarSign,
            gradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
            iconColor: 'text-amber-400',
            bg: 'bg-amber-500/10 border-amber-500/20',
            borderHover: 'hover:border-amber-500/50',
            shadowHover: 'hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]',
            desc: 'Tổng khối lượng giao dịch'
        },
        {
            title: 'Ấn phẩm số',
            value: stats.newsCount,
            icon: Newspaper,
            gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
            iconColor: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/20',
            borderHover: 'hover:border-emerald-500/50',
            shadowHover: 'hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]',
            desc: 'Tin tức & bài viết được phát hành'
        },
        {
            title: 'Sự kiện & Hội thảo',
            value: stats.eventsCount,
            icon: Sparkles,
            gradient: 'from-purple-500/20 via-purple-500/5 to-transparent',
            iconColor: 'text-purple-400',
            bg: 'bg-purple-500/10 border-purple-500/20',
            borderHover: 'hover:border-purple-500/50',
            shadowHover: 'hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]',
            desc: 'Chiến dịch đang diễn ra'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card key={stat.title} className={`relative overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 backdrop-blur-2xl transition-all duration-500 group rounded-[2rem] ${stat.borderHover} ${stat.shadowHover}`}>
                        {/* Dynamic Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
                        
                        {/* Animated Glow behind Icon */}
                        <div className={`absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none`} />

                        <CardContent className="p-7 relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} border backdrop-blur-md group-hover:scale-110 transition-transform duration-500`}>
                                    <Icon className={`h-7 w-7 ${stat.iconColor}`} />
                                </div>
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider shadow-inner">
                                    <TrendingUp className="w-3 h-3 text-emerald-500 dark:text-emerald-400 animate-pulse" />
                                    <span>Live</span>
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{stat.title}</p>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2 group-hover:translate-x-1 transition-transform duration-300">{stat.value}</h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{stat.desc}</p>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
