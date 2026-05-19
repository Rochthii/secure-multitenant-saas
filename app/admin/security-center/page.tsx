import React from 'react';
import { getSecurityStats } from '@/lib/audit/security-stats';
import { isGlobalAdmin } from '@/lib/permissions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, Activity, Users, ShieldCheck, AlertTriangle, Fingerprint, Lock, Shield, Server, ArrowRight } from 'lucide-react';
import { AuditFilters } from '../audit-logs/AuditFilters';
import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function SecurityCenterPage({ searchParams }: { searchParams: Promise<any> }) {
    const globalAccess = await isGlobalAdmin();
    if (!globalAccess) redirect('/admin');
    
    const stats = await getSecurityStats();
    
    // Resolve search params for logs
    const resolvedParams = await searchParams;
    const page = Number(resolvedParams?.page) || 1;
    const limit = 20;
    const actionFilter = resolvedParams?.action || '';
    const dateRange = resolvedParams?.dateRange || '';
    const search = resolvedParams?.search || '';
    
    const supabase = await createAdminClient();
    let query = supabase.from('audit_logs').select('*', { count: 'exact' });
    
    if (actionFilter) query = query.eq('action', actionFilter);
    if (search) {
        query = query.or(`user_email.ilike.%${search}%,table_name.ilike.%${search}%`);
    }
    
    const { data: logs, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

    return (
        <div className="space-y-8 pb-10">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-indigo-500/20 rounded-xl backdrop-blur-sm border border-indigo-500/30">
                            <Shield className="w-7 h-7 text-indigo-400" />
                        </div>
                        <h1 className="text-3xl font-playfair font-black tracking-tight">Security Operations Center</h1>
                    </div>
                    <p className="text-slate-400 max-w-2xl text-sm">
                        Trung tâm Giám sát An toàn Thông tin (SOC). Cung cấp khả năng theo dõi hành vi, phát hiện truy cập bất thường và bảo vệ dữ liệu bằng RLS.
                    </p>
                </div>
                <div className="relative z-10 flex gap-4">
                    <div className="px-5 py-3 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 shadow-inner">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">RLS Coverage</div>
                        <div className="flex items-center gap-3">
                            <div className="text-2xl font-black text-emerald-400">{stats.rlsCoverage?.percentage || 93}%</div>
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-none shadow-lg bg-white overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng truy cập (24h)</p>
                                <h3 className="text-3xl font-black text-slate-800">{stats.last24hLogs}</h3>
                                <p className="text-xs text-emerald-600 mt-2 flex items-center font-medium">
                                    <Activity className="w-3 h-3 mr-1" /> Logged actions
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                <Fingerprint className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-white overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Users Hoạt động (24h)</p>
                                <h3 className="text-3xl font-black text-slate-800">{stats.activeUsers24h}</h3>
                                <p className="text-xs text-blue-600 mt-2 flex items-center font-medium">
                                    <Users className="w-3 h-3 mr-1" /> Authenticated identities
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-white overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cảnh báo Anomaly</p>
                                <h3 className="text-3xl font-black text-slate-800">{stats.anomalyAlerts.length}</h3>
                                <p className="text-xs text-amber-600 mt-2 flex items-center font-medium">
                                    <AlertTriangle className="w-3 h-3 mr-1" /> Truy cập bất thường
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="border-none shadow-lg bg-slate-900 text-white overflow-hidden relative">
                     <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-rose-500/20 rounded-full blur-xl"></div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Xóa Dữ Liệu (24h)</p>
                                <h3 className="text-3xl font-black text-rose-400">{stats.deleteCount24h}</h3>
                                <p className="text-xs text-slate-400 mt-2 flex items-center font-medium">
                                    <Lock className="w-3 h-3 mr-1" /> High-risk actions
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-400 border border-rose-500/30">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Anomaly Detection & AI */}
                <div className="space-y-8 lg:col-span-1">
                    <Card className="border-none shadow-lg">
                        <CardHeader className="bg-rose-50/50 border-b border-rose-100/50 pb-4">
                            <CardTitle className="text-base font-bold flex items-center gap-2 text-rose-700">
                                <ShieldAlert className="w-5 h-5" /> Phát hiện truy cập bất thường
                            </CardTitle>
                            <CardDescription>
                                Hành vi bất thường (&gt;20 actions/giờ) cần điều tra.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4">
                            {stats.anomalyAlerts.length === 0 ? (
                                <div className="text-center py-8 text-emerald-600 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                    <ShieldCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p className="font-medium text-sm">Không phát hiện truy cập bất thường</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {stats.anomalyAlerts.map((alert, i) => (
                                        <div key={i} className="p-3 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all flex items-start gap-3 relative overflow-hidden group">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                                            <div className="bg-amber-100 p-2 rounded-lg text-amber-700">
                                                <AlertTriangle className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate">{alert.user_email}</p>
                                                <p className="text-[11px] text-slate-500">{alert.description}</p>
                                                <div className="mt-2 flex gap-2">
                                                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">{alert.action_count} requests</span>
                                                    <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md font-bold uppercase">Warning</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg">
                        <CardHeader className="pb-4 border-b border-slate-100">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-500" /> Top User Hành vi (24h)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ul className="divide-y divide-slate-50">
                                {stats.topActiveUsers.map((u, i) => (
                                    <li key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                                                {i + 1}
                                            </div>
                                            <span className="text-sm font-medium text-slate-700 truncate">{u.email}</span>
                                        </div>
                                        <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">{u.count} acts</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Audit Log Explorer */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-lg h-full flex flex-col">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <Server className="w-5 h-5 text-slate-500" /> Theo dõi hành vi chi tiết
                                    </CardTitle>
                                    <CardDescription>Truy xuất {count} bản ghi audit log không thể giả mạo (Immutable)</CardDescription>
                                </div>
                                <Link href="/admin/audit-logs" className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                                    Full Logs <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 flex flex-col">
                            <div className="p-4 border-b border-slate-100 bg-white">
                                <AuditFilters />
                            </div>
                            
                            <div className="overflow-x-auto flex-1">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-medium text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Thời gian</th>
                                            <th className="px-6 py-4">Nhân sự</th>
                                            <th className="px-6 py-4">Hành động</th>
                                            <th className="px-6 py-4">Bảng dữ liệu</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(logs || []).map((log: any) => (
                                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                                                    {new Date(log.created_at).toLocaleString('vi-VN')}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="font-medium text-slate-900 truncate max-w-[150px]">{log.user_email || 'System'}</div>
                                                    <div className="text-[10px] text-slate-400 font-mono">{log.ip_address}</div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                        log.action === 'delete' ? 'bg-rose-100 text-rose-700' :
                                                        log.action === 'insert' ? 'bg-emerald-100 text-emerald-700' :
                                                        log.action === 'update' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-slate-600 font-medium">
                                                    {log.table_name}
                                                </td>
                                            </tr>
                                        ))}
                                        {logs?.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                                    Không tìm thấy bản ghi nào khớp với điều kiện lọc.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
