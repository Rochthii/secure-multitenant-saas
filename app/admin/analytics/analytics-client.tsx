'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/constants/transaction';
import { 
    BarChart, 
    Bar, 
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
    TrendingUp, 
    Building2, 
    ShieldAlert, 
    Download, 
    Search, 
    ArrowUpDown, 
    Calendar,
    Newspaper,
    CheckCircle
} from 'lucide-react';

interface TenantData {
    id: string;
    name: string;
    domain: string;
    tenant_type: string;
    created_at: string;
}

interface TransactionData {
    id: string;
    amount: number;
    tenant_id: string;
    created_at: string;
    status: string;
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
    transactions: TransactionData[];
    news: NewsData[];
    events: EventData[];
    eventRegs: EventRegData[];
    totalUsers: number;
    auditCount: number;
}

const COLORS = ['#F59E0B', '#D4AF37', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

export function AnalyticsClient({
    tenants = [],
    transactions = [],
    news = [],
    events = [],
    eventRegs = [],
    totalUsers = 0,
    auditCount = 0
}: AnalyticsClientProps) {
    const [isMounted, setIsMounted] = React.useState(false);
    const [timeRange, setTimeRange] = React.useState<'7d' | '30d' | '90d' | 'all'>('all');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [sortField, setSortField] = React.useState<'name' | 'donations' | 'news' | 'events' | 'regs'>('donations');
    const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // ─── Lọc dữ liệu theo thời gian ───────────────────────────────────────────
    const getFilteredData = React.useCallback(() => {
        if (timeRange === 'all') {
            return { transactions, news, events, eventRegs };
        }

        const now = new Date();
        let limitDate = new Date();
        if (timeRange === '7d') limitDate.setDate(now.getDate() - 7);
        else if (timeRange === '30d') limitDate.setDate(now.getDate() - 30);
        else if (timeRange === '90d') limitDate.setDate(now.getDate() - 90);

        const limitTime = limitDate.getTime();

        return {
            transactions: transactions.filter(t => new Date(t.created_at).getTime() >= limitTime),
            news: news.filter(n => new Date(n.created_at).getTime() >= limitTime),
            events: events.filter(e => new Date(e.created_at).getTime() >= limitTime),
            eventRegs: eventRegs.filter(r => new Date(r.created_at).getTime() >= limitTime),
        };
    }, [timeRange, transactions, news, events, eventRegs]);

    const filtered = getFilteredData();

    // ─── Thống kê tổng hợp ───────────────────────────────────────────────────────
    const totalDonationsSum = filtered.transactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const totalNewsCount = filtered.news.length;
    const totalEventsCount = filtered.events.length;
    const totalRegsCount = filtered.eventRegs.length;

    // ─── Chuẩn bị dữ liệu cho biểu đồ Doanh thu theo tháng (6 tháng qua) ─────────
    const getMonthlyChartData = React.useCallback(() => {
        const monthsData: Record<string, { name: string; revenue: number; posts: number; dateObj: Date }> = {};
        
        // Tạo 6 tháng gần nhất mặc định
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = `Tháng ${d.getMonth() + 1}/${d.getFullYear().toString().slice(-2)}`;
            monthsData[key] = { name: label, revenue: 0, posts: 0, dateObj: d };
        }

        // Tích lũy tiền từ transactions
        filtered.transactions.forEach(t => {
            const date = new Date(t.created_at);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (monthsData[key]) {
                monthsData[key].revenue += (Number(t.amount) || 0);
            }
        });

        // Tích lũy nội dung từ news & events
        filtered.news.forEach(n => {
            const date = new Date(n.created_at);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (monthsData[key]) {
                monthsData[key].posts += 1;
            }
        });
        filtered.events.forEach(e => {
            const date = new Date(e.created_at);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (monthsData[key]) {
                monthsData[key].posts += 1;
            }
        });

        return Object.values(monthsData).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    }, [filtered]);

    const monthlyChartData = getMonthlyChartData();

    // ─── Dữ liệu phân bổ loại hình chi nhánh ───────────────────────────
    const tenantTypeChartData = React.useMemo(() => {
        const types: Record<string, number> = {};
        tenants.forEach(t => {
            const typeLabel = t.tenant_type === 'company' ? 'Tập đoàn' : t.tenant_type === 'ngo' ? 'Tổ chức phi lợi nhuận' : 'Chi nhánh chùa';
            types[typeLabel] = (types[typeLabel] || 0) + 1;
        });
        return Object.entries(types).map(([name, value]) => ({ name, value }));
    }, [tenants]);

    // ─── Dữ liệu tổng hợp từng chi nhánh (Tenants Metrics) ─────────────────────
    const tenantMetrics = React.useMemo(() => {
        return tenants.map(tenant => {
            const tenantTransactions = filtered.transactions.filter(t => t.tenant_id === tenant.id);
            const tenantNews = filtered.news.filter(n => n.tenant_id === tenant.id);
            const tenantEvents = filtered.events.filter(e => e.tenant_id === tenant.id);
            const tenantRegs = filtered.eventRegs.filter(r => r.tenant_id === tenant.id);

            const donationsSum = tenantTransactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

            return {
                id: tenant.id,
                name: tenant.name || 'Không tên',
                domain: tenant.domain || 'Không cấu hình',
                type: tenant.tenant_type === 'company' ? 'Doanh nghiệp' : tenant.tenant_type === 'ngo' ? 'NGO' : 'Chùa',
                totalDonations: donationsSum,
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

        if (sortField === 'donations') {
            valA = a.totalDonations;
            valB = b.totalDonations;
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
        const header = "Ten Chi Nhanh,Domain,Loai Hinh,Tong Dong Gop (VND),Tin Tuc,Su Kien,Luot Dang Ky\n";
        const rows = tenantMetrics.map(t => 
            `"${t.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')}",${t.domain},${t.type},${t.totalDonations},${t.newsCount},${t.eventsCount},${t.regsCount}`
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-4 rounded-3xl backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phạm vi thời gian:</span>
                    <div className="flex rounded-xl bg-slate-100 dark:bg-slate-850 p-1 border border-slate-200/50 dark:border-slate-800">
                        {(['all', '90d', '30d', '7d'] as const).map((r) => (
                            <button
                                key={r}
                                onClick={() => setTimeRange(r)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    timeRange === r 
                                        ? 'bg-amber-500 text-[#1C1008] shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                                }`}
                            >
                                {r === 'all' ? 'Tất cả' : r === '90d' ? '90 ngày' : r === '30d' ? '30 ngày' : '7 ngày'}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-95 transition-all text-xs border border-amber-500/30"
                >
                    <Download className="w-4 h-4" />
                    <span>Xuất báo cáo hệ thống (CSV)</span>
                </button>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-amber-500/5 hover:border-amber-500/30 group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-between">
                            <span>Tổng ngân quỹ toàn hệ thống</span>
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black text-amber-500 dark:text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                            {formatCurrency(totalDonationsSum)}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-bold uppercase tracking-wider">
                            Từ {filtered.transactions.length} giao dịch thành công
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-amber-500/5 hover:border-amber-500/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-between">
                            <span>Tin tức & Truyền thông</span>
                            <Newspaper className="w-4 h-4 text-amber-550" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-black text-amber-500 dark:text-amber-400">
                            {totalNewsCount}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-bold uppercase tracking-wider">
                            Bài viết truyền thông đã tạo
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-amber-500/5 hover:border-amber-500/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-between">
                            <span>Sự kiện & Hội thảo</span>
                            <Calendar className="w-4 h-4 text-blue-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-black text-amber-500 dark:text-amber-400">
                            {totalEventsCount}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-bold uppercase tracking-wider">
                            {totalRegsCount} lượt đăng ký tham gia thực tế
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-amber-500/5 hover:border-amber-500/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-between">
                            <span>Quy mô quản trị</span>
                            <Users className="w-4 h-4 text-purple-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-black text-amber-500 dark:text-amber-400">
                            {totalUsers}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-bold uppercase tracking-wider">
                            Nhân viên & Sư thầy đang quản trị
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Interactive Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Monthly Revenue Chart */}
                <Card className="lg:col-span-2 border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                    <CardHeader className="py-5 border-b border-slate-200 dark:border-slate-800">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Xu hướng doanh thu & Hoạt động (6 Tháng Qua)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-80 w-full">
                            {!isMounted ? (
                                <div className="w-full h-full bg-slate-100 dark:bg-slate-850 animate-pulse rounded-xl" />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={monthlyChartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight="bold" />
                                        <YAxis yAxisId="left" stroke="#F59E0B" fontSize={11} fontWeight="bold" />
                                        <YAxis yAxisId="right" orientation="right" stroke="#10B981" fontSize={11} fontWeight="bold" />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#0f172a', 
                                                borderColor: '#334155',
                                                borderRadius: '12px',
                                                color: '#f8fafc'
                                            }}
                                            labelClassName="font-black text-slate-200 text-xs"
                                        />
                                        <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                                        <Line yAxisId="left" type="monotone" dataKey="revenue" name="Doanh thu (VND)" stroke="#F59E0B" strokeWidth={3} activeDot={{ r: 8 }} />
                                        <Line yAxisId="right" type="monotone" dataKey="posts" name="Bài viết & Sự kiện" stroke="#10B981" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Tenant Type Pie Chart */}
                <Card className="border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                    <CardHeader className="py-5 border-b border-slate-200 dark:border-slate-800">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Phân bổ loại hình tổ chức</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex flex-col justify-center items-center h-80">
                        {!isMounted ? (
                            <div className="w-48 h-48 rounded-full bg-slate-100 dark:bg-slate-850 animate-pulse" />
                        ) : tenantTypeChartData.length > 0 ? (
                            <div className="relative w-full h-full flex flex-col justify-center items-center">
                                <div className="h-56 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={tenantTypeChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {tenantTypeChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{ 
                                                    backgroundColor: '#0f172a', 
                                                    borderColor: '#334155',
                                                    borderRadius: '12px',
                                                    color: '#f8fafc'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                                    {tenantTypeChartData.map((entry, index) => (
                                        <div key={entry.name} className="flex items-center gap-1">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                            <span>{entry.name}: {entry.value}</span>
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
            <Card className="border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="py-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Báo cáo hoạt động chi tiết từng chi nhánh</CardTitle>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-bold">Thống kê chi tiết tài chính và ấn phẩm truyền thông toàn hệ thống SaaS</p>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm chi nhánh..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none placeholder-slate-400 dark:placeholder-slate-650"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full min-w-[700px] border-collapse text-left text-xs text-slate-600 dark:text-slate-400">
                        <thead className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Tên chi nhánh</th>
                                <th className="px-6 py-4">Domain/Tên miền</th>
                                <th className="px-6 py-4">Loại hình</th>
                                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors" onClick={() => handleSort('donations')}>
                                    <div className="flex items-center gap-1.5">
                                        <span>Quỹ/Tổng đóng góp</span>
                                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors" onClick={() => handleSort('news')}>
                                    <div className="flex items-center gap-1.5">
                                        <span>Tin tức</span>
                                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors" onClick={() => handleSort('events')}>
                                    <div className="flex items-center gap-1.5">
                                        <span>Sự kiện</span>
                                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors" onClick={() => handleSort('regs')}>
                                    <div className="flex items-center gap-1.5">
                                        <span>Đăng ký tham gia</span>
                                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                            {sortedTenants.length > 0 ? sortedTenants.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-200">
                                        {item.name}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-500">
                                        {item.domain}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                            item.type === 'Doanh nghiệp' 
                                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                                                : item.type === 'NGO' 
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                        }`}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-black text-amber-500 dark:text-amber-400">
                                        {formatCurrency(item.totalDonations)}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                                        {item.newsCount}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                                        {item.eventsCount}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                                        {item.regsCount}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-slate-400 italic">
                                        Không tìm thấy chi nhánh nào trùng khớp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Intranet SOC Monitoring Activity Overview */}
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between shadow-2xl border border-slate-800 gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-400">
                        <ShieldAlert className="w-8 h-8 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest mb-1">Màn hình giám sát SOC & An ninh hệ thống</h3>
                        <p className="text-lg font-black text-slate-100">Đã kiểm toán và ghi nhận {auditCount.toLocaleString()} hành động bảo mật</p>
                    </div>
                </div>
                <div className="relative z-10 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hệ thống bảo vệ RLS đang hoạt động thực tế</span>
                </div>
            </div>
        </div>
    );
}
