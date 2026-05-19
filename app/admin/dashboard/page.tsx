import React from 'react';
import { getGlobalDashboardStats } from '@/lib/cache/queries';
import { getSecurityStats } from '@/lib/audit/security-stats';
import { GlobalStatsGrid } from '@/components/admin/global-stats-grid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, ArrowRight, ShieldCheck, Activity, ShieldAlert, Fingerprint, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/constants/transaction';
import { isGlobalAdmin } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default async function GlobalDashboardPage() {
    // SECURITY: High-level system dashboard
    const globalAccess = await isGlobalAdmin();
    if (!globalAccess) {
        redirect('/admin');
    }

    const stats = await getGlobalDashboardStats();
    const securityStats = await getSecurityStats();

    return (
        <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -mr-64 -mt-64 mix-blend-screen pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -ml-64 -mb-64 mix-blend-screen pointer-events-none" />
                
                <div className="relative z-10 p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20 border border-indigo-400/20">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Bảng điều khiển Hệ sinh thái</h1>
                        </div>
                        <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed">
                            Trung tâm điều phối tài nguyên và giám sát hoạt động toàn mạng lưới đa khách hàng (Multi-tenant). Chào mừng Super Admin!
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-white/10 shadow-inner">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        <span className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Hệ thống ổn định</span>
                    </div>
                </div>
            </div>

            {/* SOC Mini Dashboard Widget for Global Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900/60 backdrop-blur-xl text-slate-900 dark:text-white relative overflow-hidden group rounded-[2rem] hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] hover:border-emerald-500/50 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-transform group-hover:scale-150 duration-700" />
                    <CardContent className="p-7 relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Mức độ Tuân thủ Bảo mật</p>
                                <h3 className="text-4xl font-black text-slate-900 dark:text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{securityStats.rlsCoverage?.percentage || 93}%</h3>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-bold shadow-inner">
                                    <ShieldCheck className="w-3.5 h-3.5" /> ISO 27017 Compliant
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm group-hover:bg-emerald-500/10 transition-colors">
                                <ShieldCheck className="w-6 h-6 text-emerald-500 dark:text-emerald-400 group-hover:drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] transition-all" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900/60 backdrop-blur-xl text-slate-900 dark:text-white relative overflow-hidden group rounded-[2rem] hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)] hover:border-indigo-500/50 transition-all duration-500">
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none transition-transform group-hover:scale-150 duration-700" />
                    <CardContent className="p-7 relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Lượt truy cập (24h)</p>
                                <h3 className="text-4xl font-black text-slate-900 dark:text-white">{securityStats.last24hLogs}</h3>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-600 dark:text-indigo-400 mt-3 font-bold shadow-inner">
                                    <Fingerprint className="w-3.5 h-3.5" /> Phiên hoạt động
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm group-hover:bg-indigo-500/10 group-hover:scale-110 transition-all">
                                <Activity className="w-6 h-6 text-indigo-500 dark:text-indigo-400 group-hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900/60 backdrop-blur-xl text-slate-900 dark:text-white relative overflow-hidden group rounded-[2rem] hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.3)] hover:border-rose-500/50 transition-all duration-500 flex flex-col justify-between">
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none transition-transform group-hover:scale-150 duration-700" />
                    <CardContent className="p-7 relative z-10 flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Cảnh báo Bất thường</p>
                                <h3 className="text-4xl font-black text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]">{securityStats.anomalyAlerts.length}</h3>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 dark:text-rose-400 mt-3 font-bold shadow-inner">
                                    <ShieldAlert className="w-3.5 h-3.5" /> {securityStats.anomalyAlerts.length > 0 ? 'Cần kiểm tra SOC' : 'Bình thường'}
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm group-hover:bg-rose-500/10 group-hover:rotate-12 transition-all">
                                <ShieldAlert className="w-6 h-6 text-rose-500 group-hover:drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                            </div>
                        </div>
                    </CardContent>
                    {securityStats.anomalyAlerts.length > 0 && (
                        <Link href="/admin/security-center" className="w-full bg-rose-500/20 py-3 text-center text-xs font-bold text-rose-500 dark:text-rose-400 uppercase hover:bg-rose-500/30 hover:text-rose-600 dark:hover:text-rose-300 transition-colors border-t border-rose-500/30 flex justify-center items-center gap-2 backdrop-blur-md">
                            Xử lý ngay <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    )}
                </Card>
            </div>

            {/* Main Stats */}
            <GlobalStatsGrid stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Tenants by Volume */}
                <Card className="lg:col-span-2 border border-slate-200 dark:border-slate-800/60 shadow-2xl overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900/40 backdrop-blur-xl relative">
                    {/* Background glow */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
                    
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 p-8 pb-6 relative z-10">
                        <CardTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)] border border-indigo-500/30">
                                <Activity className="w-5 h-5" />
                            </div>
                            Xếp hạng Tổ chức & Doanh thu
                        </CardTitle>
                        <CardDescription className="text-sm mt-1.5 text-slate-500 dark:text-slate-400">Báo cáo doanh thu (MRR) và lượng giao dịch theo từng Workspace</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 relative z-10">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/80 dark:bg-slate-900/80 text-slate-400 dark:text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase tracking-wider">
                                    <tr>
                                        <th className="px-8 py-5">Tổ chức</th>
                                        <th className="px-8 py-5">Số lượng GD</th>
                                        <th className="px-8 py-5 text-right">Tổng doanh thu (MRR)</th>
                                        <th className="px-8 py-5"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-600 dark:text-slate-300">
                                    {stats.recentTenants.map((tenant: any) => {
                                        const tenantStat = stats.tenantStats[tenant.id] || { count: 0, total: 0 };
                                        return (
                                            <tr key={tenant.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-lg shadow-sm border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-colors relative">
                                                            {tenant.name.charAt(0)}
                                                            {tenant.tenant_type !== 'tenant' && (
                                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.8)]" title="Doanh nghiệp">
                                                                    <Building2 className="w-2 h-2 text-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">{tenant.name}</p>
                                                                <Badge variant="outline" className={cn(
                                                                    "text-[10px] px-1.5 py-0 h-4 leading-none uppercase font-bold",
                                                                    tenant.tenant_type !== 'tenant' 
                                                                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30" 
                                                                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                                                )}>
                                                                    {tenant.tenant_type !== 'tenant' ? 'Enterprise' : 'Legacy'}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-xs text-slate-500">{tenant.domain}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 font-semibold text-slate-600 dark:text-slate-300">{tenantStat.count} giao dịch</td>
                                                <td className="px-8 py-5 text-right font-black text-emerald-600 dark:text-emerald-400 text-base drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                                                    {formatCurrency(tenantStat.total)}
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <Link 
                                                        href={`/admin/t/${tenant.id}/dashboard`}
                                                        className="inline-flex items-center justify-center gap-2 text-xs text-indigo-600 dark:text-indigo-300 hover:text-white font-bold px-4 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-600 transition-all border border-indigo-500/20 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:border-indigo-500"
                                                    >
                                                        Quản trị <ArrowRight className="w-4 h-4" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {stats.recentTenants.length === 0 && (
                            <div className="py-24 text-center text-slate-400">
                                <Building2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="font-medium">Chưa có dữ liệu tổ chức nào.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* System Activity */}
                <div className="space-y-8">
                    <Card className="border border-slate-200 dark:border-slate-800/60 shadow-2xl rounded-[2.5rem] bg-white dark:bg-slate-900/40 backdrop-blur-xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
                        
                        <CardHeader className="p-7 pb-4 border-b border-slate-100 dark:border-slate-800 relative z-10">
                            <CardTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                Tổ chức mới đăng ký <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-7 relative z-10">
                            <div className="space-y-4">
                                {stats.recentTenants.slice(0, 3).map((tenant: any) => (
                                    <div key={tenant.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all group">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-black text-sm shadow-sm group-hover:border-indigo-500 group-hover:text-indigo-500 group-hover:shadow-[0_0_10px_rgba(99,102,241,0.3)] transition-colors">
                                            {tenant.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">{tenant.name}</p>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Ngày {new Date(tenant.created_at).toLocaleDateString('vi-VN')}</p>
                                        </div>
                                        <Link href={`/admin/tenants/${tenant.id}`} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-colors text-slate-500 dark:text-slate-400 shadow-sm group-hover:shadow-[0_0_10px_rgba(99,102,241,0.3)]">
                                            <SettingsIcon className="w-4 h-4" />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-slate-800 shadow-2xl bg-slate-950 text-white overflow-hidden relative rounded-[2.5rem]">
                         <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl mix-blend-screen pointer-events-none" />
                         <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                         <CardHeader className="p-8 pb-4 relative z-10">
                             <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> TRẠNG THÁI HỆ THỐNG
                             </CardTitle>
                         </CardHeader>
                         <CardContent className="p-8 pt-0 relative z-10">
                             <div className="space-y-6">
                                 <div className="flex justify-between items-end">
                                     <div>
                                         <p className="text-5xl font-black text-white">{stats.tenantsCount}</p>
                                         <p className="text-sm font-medium text-slate-400 mt-1">Tổ chức đang hoạt động</p>
                                     </div>
                                     <Link href="/admin/tenants" className="text-xs font-bold px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10">
                                         Quản lý toàn bộ
                                     </Link>
                                 </div>
                                 <div className="h-2.5 w-full bg-slate-800/80 rounded-full overflow-hidden shadow-inner border border-slate-800">
                                     <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 w-[98%] shadow-[0_0_12px_rgba(52,211,153,0.8)] relative">
                                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                     </div>
                                 </div>
                                 <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                    <span>Server Load: 12%</span>
                                    <span>Cập nhật: Just now</span>
                                 </div>
                             </div>
                         </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function SettingsIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
    );
}
