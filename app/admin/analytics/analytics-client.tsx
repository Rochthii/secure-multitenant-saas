'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell,
    Legend
} from 'recharts';
import { 
    Users, 
    Database, 
    Download, 
    Search, 
    ArrowUpDown, 
    Calendar,
    Newspaper,
    Activity,
    FolderGit2,
    Layers,
    ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TenantData {
    id: string;
    name: string;
    domain: string;
    tenant_type: string;
    created_at: string;
}

interface NewsData {
    id: string;
    tenant_id: string;
    created_at: string;
}

interface EventData {
    id: string;
    tenant_id: string;
    created_at: string;
}

interface EventRegData {
    id: string;
    tenant_id: string;
    created_at: string;
}

interface AnalyticsClientProps {
    tenants: TenantData[];
    news: NewsData[];
    events: EventData[];
    eventRegs: EventRegData[];
    totalUsers: number;
    auditCount: number;
}

// Curated Harmonic Colors for charts
const COLORS = ['#6366f1', '#10b981', '#3b82f6', '#f43f5e', '#8b5cf6', '#06b6d4'];

// Glassmorphism Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl text-left">
                <p className="text-xs font-bold text-slate-400 mb-2">{label}</p>
                <div className="space-y-1">
                    {payload.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-3">
                            <span 
                                className="w-2.5 h-2.5 rounded-full" 
                                style={{ backgroundColor: item.color || item.fill }} 
                            />
                            <span className="text-xs font-medium text-slate-200">
                                {item.name}: <strong className="text-white font-black">
                                    {item.value}
                                </strong>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export function AnalyticsClient({
    tenants = [],
    news = [],
    events = [],
    eventRegs = [],
    totalUsers = 0,
    auditCount = 0
}: AnalyticsClientProps) {
    const [isMounted, setIsMounted] = React.useState(false);
    const [timeRange, setTimeRange] = React.useState<'7d' | '30d' | '90d' | 'all'>('all');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [sortField, setSortField] = React.useState<'name' | 'records' | 'news' | 'events' | 'regs'>('records');
    const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // ─── Lọc dữ liệu theo thời gian ───────────────────────────────────────────
    const getFilteredData = React.useCallback(() => {
        if (timeRange === 'all') {
            return { news, events, eventRegs };
        }

        const now = new Date();
        let limitDate = new Date();
        if (timeRange === '7d') limitDate.setDate(now.getDate() - 7);
        else if (timeRange === '30d') limitDate.setDate(now.getDate() - 30);
        else if (timeRange === '90d') limitDate.setDate(now.getDate() - 90);

        const limitTime = limitDate.getTime();

        return {
            news: news.filter(n => new Date(n.created_at).getTime() >= limitTime),
            events: events.filter(e => new Date(e.created_at).getTime() >= limitTime),
            eventRegs: eventRegs.filter(r => new Date(r.created_at).getTime() >= limitTime),
        };
    }, [timeRange, news, events, eventRegs]);

    const filtered = getFilteredData();

    // ─── Thống kê tổng hợp ───────────────────────────────────────────────────────
    const totalNewsCount = filtered.news.length;
    const totalEventsCount = filtered.events.length;
    const totalRegsCount = filtered.eventRegs.length;
    const totalRecordsCount = totalNewsCount + totalEventsCount + totalRegsCount;

    // ─── Chuẩn bị dữ liệu cho biểu đồ Hoạt động hệ thống theo tháng (6 tháng qua) ─────────
    const getMonthlyChartData = React.useCallback(() => {
        const monthsData: Record<string, { name: string; 'Lượt đăng ký': number; 'Ấn phẩm số': number; dateObj: Date }> = {};
        
        // Tạo 6 tháng gần nhất mặc định
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = `Tháng ${d.getMonth() + 1}/${d.getFullYear().toString().slice(-2)}`;
            monthsData[key] = { name: label, 'Lượt đăng ký': 0, 'Ấn phẩm số': 0, dateObj: d };
        }

        // Tích lũy lượt đăng ký từ eventRegs
        filtered.eventRegs.forEach(r => {
            const date = new Date(r.created_at);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (monthsData[key]) {
                monthsData[key]['Lượt đăng ký'] += 1;
            }
        });

        // Tích lũy nội dung từ news & events
        filtered.news.forEach(n => {
            const date = new Date(n.created_at);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (monthsData[key]) {
                monthsData[key]['Ấn phẩm số'] += 1;
            }
        });
        filtered.events.forEach(e => {
            const date = new Date(e.created_at);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (monthsData[key]) {
                monthsData[key]['Ấn phẩm số'] += 1;
            }
        });

        return Object.values(monthsData).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    }, [filtered]);

    const monthlyChartData = getMonthlyChartData();

    // ─── Dữ liệu phân bổ loại hình chi nhánh (SaaS vs Legacy) ───────────────────────────
    const tenantTypeChartData = React.useMemo(() => {
        const types: Record<string, number> = {};
        tenants.forEach(t => {
            const typeLabel = t.tenant_type !== 'tenant' ? 'Doanh nghiệp SaaS' : 'Tổ chức Di sản';
            types[typeLabel] = (types[typeLabel] || 0) + 1;
        });
        return Object.entries(types).map(([name, value]) => ({ name, value }));
    }, [tenants]);

    // ─── Dữ liệu tổng hợp từng chi nhánh (Tenants Metrics) ─────────────────────
    const tenantMetrics = React.useMemo(() => {
        return tenants.map(tenant => {
            const tenantNews = filtered.news.filter(n => n.tenant_id === tenant.id);
            const tenantEvents = filtered.events.filter(e => e.tenant_id === tenant.id);
            const tenantRegs = filtered.eventRegs.filter(r => r.tenant_id === tenant.id);
            const recordsCount = tenantNews.length + tenantEvents.length + tenantRegs.length;

            return {
                id: tenant.id,
                name: tenant.name || 'Không tên',
                domain: tenant.domain || 'Không cấu hình',
                type: tenant.tenant_type !== 'tenant' ? 'Doanh nghiệp' : 'Di sản',
                totalRecords: recordsCount,
                newsCount: tenantNews.length,
                eventsCount: tenantEvents.length,
                regsCount: tenantRegs.length,
            };
        });
    }, [tenants, filtered]);

    // Lọc theo search query
    const searchedTenants = tenantMetrics.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.domain.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sắp xếp bảng
    const sortedTenants = searchedTenants.sort((a, b) => {
        let valA: any = a.name;
        let valB: any = b.name;

        if (sortField === 'records') {
            valA = a.totalRecords;
            valB = b.totalRecords;
        } else if (sortField === 'news') {
            valA = a.newsCount;
            valB = b.newsCount;
        } else if (sortField === 'events') {
            valA = a.eventsCount;
            valB = b.eventsCount;
        } else if (sortField === 'regs') {
            valA = a.regsCount;
            valB = b.regsCount;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (field: typeof sortField) => {
        if (sortField === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    // ─── Xuất Báo Cáo CSV (Real Side-Effect) ────────────────────────────────────
    const handleExportCSV = () => {
        const header = "Ten Chi Nhanh,Domain,Loai Hinh,Tong Ban Ghi,Tin Tuc,Su Kien,Luot Dang Ky\n";
        const rows = tenantMetrics.map(t => 
            `"${t.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')}",${t.domain},${t.type},${t.totalRecords},${t.newsCount},${t.eventsCount},${t.regsCount}`
        ).join("\n");

        const csvContent = "data:text/csv;charset=utf-8," + header + rows;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `bao_cao_he_thong_saas_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Control Panel / Filter & Action */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 p-6 rounded-[2rem] shadow-2xl backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center gap-3 relative z-10">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lọc thời gian:</span>
                    <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200/50 dark:border-slate-800/80">
                        {(['all', '90d', '30d', '7d'] as const).map((r) => (
                            <button
                                key={r}
                                onClick={() => setTimeRange(r)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                    timeRange === r 
                                        ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                                )}
                            >
                                {r === 'all' ? 'Tất cả' : r === '90d' ? '90 ngày' : r === '30d' ? '30 ngày' : '7 ngày'}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all text-xs border border-indigo-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] relative z-10"
                >
                    <Download className="w-4 h-4" />
                    <span>Xuất báo cáo hệ thống (CSV)</span>
                </button>
            </div>

            {/* Metrics Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Card 1: Record Weight */}
                <Card className="border border-slate-200 dark:border-slate-800/60 shadow-2xl bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden transition-all duration-350 hover:shadow-[0_0_25px_rgba(99,102,241,0.15)] hover:border-indigo-500/40 group relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
                    <CardHeader className="pb-3">
                        <CardTitle className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-between">
                            <span>Dung lượng Bản ghi (RLS Rows)</span>
                            <Layers className="w-4 h-4 text-indigo-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1.5 transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400">
                            {totalRecordsCount.toLocaleString()}
                        </h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                            Tổng tài nguyên phân bổ đa thuê bao
                        </p>
                    </CardContent>
                </Card>

                {/* Card 2: News */}
                <Card className="border border-slate-200 dark:border-slate-800/60 shadow-2xl bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden transition-all duration-350 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] hover:border-emerald-500/40 group relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
                    <CardHeader className="pb-3">
                        <CardTitle className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-between">
                            <span>Bài viết & Ấn phẩm</span>
                            <Newspaper className="w-4 h-4 text-emerald-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1.5 transition-colors group-hover:text-emerald-500 dark:group-hover:text-emerald-400">
                            {totalNewsCount.toLocaleString()}
                        </h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                            Nội dung truyền thông đã đăng
                        </p>
                    </CardContent>
                </Card>

                {/* Card 3: Events */}
                <Card className="border border-slate-200 dark:border-slate-800/60 shadow-2xl bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden transition-all duration-350 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] hover:border-blue-500/40 group relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
                    <CardHeader className="pb-3">
                        <CardTitle className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-between">
                            <span>Sự kiện chi nhánh</span>
                            <Calendar className="w-4 h-4 text-blue-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1.5 transition-colors group-hover:text-blue-500 dark:group-hover:text-blue-400">
                            {totalEventsCount.toLocaleString()}
                        </h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                            {totalRegsCount.toLocaleString()} lượt đăng ký tham gia
                        </p>
                    </CardContent>
                </Card>

                {/* Card 4: Collaborators */}
                <Card className="border border-slate-200 dark:border-slate-800/60 shadow-2xl bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden transition-all duration-350 hover:shadow-[0_0_25px_rgba(139,92,246,0.15)] hover:border-purple-500/40 group relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
                    <CardHeader className="pb-3">
                        <CardTitle className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-between">
                            <span>Nhân sự điều hành</span>
                            <Users className="w-4 h-4 text-purple-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1.5 transition-colors group-hover:text-purple-500 dark:group-hover:text-purple-400">
                            {totalUsers.toLocaleString()}
                        </h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                            Nhân viên đa hệ thống
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Interactive Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Monthly Activity Trend Chart */}
                <Card className="lg:col-span-2 border border-slate-200 dark:border-slate-800/60 shadow-2xl bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                    <CardHeader className="py-6 border-b border-slate-100 dark:border-slate-800/80 p-8 pb-5">
                        <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                            <Activity className="w-4 h-4 text-indigo-500 animate-pulse" />
                            Xu thái Tạo Bản ghi & Hoạt động Hệ thống (6 Tháng Qua)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-80 w-full">
                            {!isMounted ? (
                                <div className="w-full h-full bg-slate-150 dark:bg-slate-850 animate-pulse rounded-2xl" />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                                        <XAxis 
                                            dataKey="name" 
                                            stroke="#64748b" 
                                            fontSize={10} 
                                            fontWeight="bold" 
                                            tickLine={false}
                                        />
                                        <YAxis 
                                            yAxisId="left" 
                                            stroke="#6366f1" 
                                            fontSize={10} 
                                            fontWeight="bold" 
                                            tickLine={false} 
                                            axisLine={false}
                                        />
                                        <YAxis 
                                            yAxisId="right" 
                                            orientation="right" 
                                            stroke="#10b981" 
                                            fontSize={10} 
                                            fontWeight="bold" 
                                            tickLine={false} 
                                            axisLine={false}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend 
                                            wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} 
                                            iconType="circle"
                                        />
                                        <Line yAxisId="left" type="monotone" dataKey="Lượt đăng ký" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 6 }} />
                                        <Line yAxisId="right" type="monotone" dataKey="Ấn phẩm số" stroke="#10b981" strokeWidth={3} />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Tenant Type Distribution (SaaS vs Legacy) */}
                <Card className="border border-slate-200 dark:border-slate-800/60 shadow-2xl bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                    <CardHeader className="py-6 border-b border-slate-100 dark:border-slate-800/80 p-8 pb-5">
                        <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                            <FolderGit2 className="w-4 h-4 text-emerald-500" />
                            Phân loại Không gian làm việc
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 flex flex-col justify-center items-center h-80">
                        {!isMounted ? (
                            <div className="w-44 h-44 rounded-full bg-slate-150 dark:bg-slate-850 animate-pulse" />
                        ) : tenantTypeChartData.length > 0 ? (
                            <div className="relative w-full h-full flex flex-col justify-center items-center gap-4">
                                <div className="h-52 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={tenantTypeChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={55}
                                                outerRadius={75}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {tenantTypeChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                                    {tenantTypeChartData.map((entry, index) => (
                                        <div key={entry.name} className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                            <span>{entry.name}: <strong className="text-slate-900 dark:text-white font-black">{entry.value}</strong></span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 italic">Chưa có dữ liệu phân bổ.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Tenant-by-Tenant Activity Breakdown Table */}
            <Card className="border border-slate-200 dark:border-slate-800/60 shadow-2xl bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                        <CardTitle className="text-base font-black text-slate-900 dark:text-white">Báo cáo hoạt động chi tiết từng chi nhánh</CardTitle>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Giám sát số lượng bài viết tin tức, sự kiện và đăng ký tham gia</p>
                    </div>

                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm chi nhánh..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 py-3 pl-10 pr-4 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 rounded-xl"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                            <tr>
                                <th className="px-8 py-5">Tên chi nhánh</th>
                                <th className="px-8 py-5">Domain / Tên miền</th>
                                <th className="px-8 py-5">Loại hình</th>
                                <th className="px-8 py-5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850/60 transition-colors" onClick={() => handleSort('records')}>
                                    <div className="flex items-center gap-1.5">
                                        <span>Tổng số bản ghi</span>
                                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                    </div>
                                </th>
                                <th className="px-8 py-5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850/60 transition-colors" onClick={() => handleSort('news')}>
                                    <div className="flex items-center gap-1.5">
                                        <span>Tin tức</span>
                                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                    </div>
                                </th>
                                <th className="px-8 py-5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850/60 transition-colors" onClick={() => handleSort('events')}>
                                    <div className="flex items-center gap-1.5">
                                        <span>Sự kiện</span>
                                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                    </div>
                                </th>
                                <th className="px-8 py-5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850/60 transition-colors" onClick={() => handleSort('regs')}>
                                    <div className="flex items-center gap-1.5">
                                        <span>Lượt đăng ký</span>
                                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-700 dark:text-slate-350">
                            {sortedTenants.length > 0 ? sortedTenants.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/30 transition-colors group">
                                    <td className="px-8 py-5 font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                                        {item.name}
                                    </td>
                                    <td className="px-8 py-5 font-mono text-slate-500 text-xs">
                                        {item.domain}
                                    </td>
                                    <td className="px-8 py-5">
                                        <Badge variant="outline" className={cn(
                                            "text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider",
                                            item.type === 'Doanh nghiệp' 
                                                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25' 
                                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
                                        )}>
                                            {item.type === 'Doanh nghiệp' ? 'Doanh nghiệp' : 'Legacy Space'}
                                        </Badge>
                                    </td>
                                    <td className="px-8 py-5 font-black text-indigo-600 dark:text-indigo-400">
                                        {item.totalRecords.toLocaleString()} bản ghi
                                    </td>
                                    <td className="px-8 py-5 font-bold text-slate-900 dark:text-white">
                                        {item.newsCount} bài viết
                                    </td>
                                    <td className="px-8 py-5 font-bold text-slate-900 dark:text-white">
                                        {item.eventsCount} sự kiện
                                    </td>
                                    <td className="px-8 py-5 font-bold text-indigo-500 dark:text-indigo-300">
                                        {item.regsCount} lượt
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-8 py-12 text-center text-slate-400 italic">
                                        Không tìm thấy chi nhánh nào trùng khớp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Intranet SOC Monitoring Activity Overview */}
            <div className="bg-slate-950 text-white rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between shadow-2xl border border-slate-800/80 gap-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-20" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex items-center gap-4">
                    <div className="p-3.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                        <ShieldAlert className="w-7 h-7 animate-pulse text-indigo-400" />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Màn hình giám sát SOC & An ninh hệ thống</h4>
                        <p className="text-lg font-black text-slate-100">Đã kiểm toán và ghi nhận {auditCount.toLocaleString()} hành động bảo mật RLS</p>
                    </div>
                </div>
                <div className="relative z-10 flex items-center gap-2.5 px-4.5 py-2.5 bg-white/5 rounded-xl border border-white/10 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Hệ thống bảo vệ RLS đang hoạt động thực tế</span>
                </div>
            </div>
        </div>
    );
}
