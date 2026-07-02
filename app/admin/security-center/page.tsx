import React from 'react';
import { getSecurityStats } from '@/lib/audit/security-stats';
import { isGlobalAdmin } from '@/lib/permissions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, Activity, Users, ShieldCheck, AlertTriangle, Fingerprint, Lock, Shield, Server, ArrowRight } from 'lucide-react';
import { AuditFilters } from '../audit-logs/AuditFilters';
import { AnomalyActionButtons } from '@/components/admin/audit/anomaly-action-buttons';
import { NoisyNeighborsWidget } from '@/components/admin/audit/noisy-neighbors-widget';
import { ThreatSimulator } from '@/components/admin/threat-simulator';
import { WormVaultWidget } from '@/components/admin/worm-vault-widget';
import { TenantPoolerWidget } from '@/components/admin/tenant-pooler-widget';
import { SecurityTabsContainer } from '@/components/admin/security/security-tabs-container';
import { SecurityReportButton } from '@/components/admin/security/security-report-button';
import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { IpBlocklistWidget } from '@/components/admin/security/ip-blocklist-widget';
import { SocRealtimeListener } from '@/components/admin/security/soc-realtime-listener';
import { SocMetricsPanel } from '@/components/admin/security/soc-metrics-panel';
import { headers } from 'next/headers';
import { TechnicalAcademicMatrix } from '@/components/admin/security/matrix-blueprint';

export default async function SecurityCenterPage({ searchParams }: { searchParams: Promise<any> }) {
    const globalAccess = await isGlobalAdmin();
    if (!globalAccess) redirect('/admin');
    
    const stats = await getSecurityStats();
    
    // Resolve dynamic host for live fire QR Code
    const headersList = await headers();
    const host = headersList.get('host') || 'tdcrt.vercel.app';
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
    const councilUrl = `${protocol}://${host}/council`;
    
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

    // Fetch dynamic blocked_ips
    const { data: blockedIps } = await (supabase as any)
        .from('blocked_ips')
        .select('*')
        .order('blocked_at', { ascending: false });

    // ============================================================
    // NODE 1: GIÁM SÁT SOC THỜI GIAN THỰC (REAL-TIME SOC) - HYBRID CLIENT RENDER
    // ============================================================
    const topActiveUsersNode = (
        <Card className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-850 dark:text-slate-100">
                    <Users className="w-5 h-5 text-amber-500" /> Top User Hành vi (24h)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {stats.topActiveUsers.map((u, i) => (
                        <li key={i} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0">
                                    {i + 1}
                                </div>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-350 truncate">{u.email}</span>
                            </div>
                            <span className="text-xs font-bold px-2.5 py-1 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full">{u.count} acts</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );

    const ipBlocklistNode = (
        <IpBlocklistWidget blockedIps={(blockedIps || []).map((x: any) => ({
            id: x.id,
            ip: x.ip,
            tenant_id: x.tenant_id,
            blocked_at: x.blocked_at,
            blocked_until: x.blocked_until,
            reason: x.reason,
            created_by: x.created_by
        }))} />
    );

    const auditLogExplorerNode = (
        <Card className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden h-full flex flex-col">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex justify-between items-center gap-4">
                    <div>
                        <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-850 dark:text-slate-100">
                            <Server className="w-5 h-5 text-amber-500" /> Theo dõi hành vi chi tiết
                        </CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">Truy xuất {count} bản ghi audit log không thể giả mạo (Immutable)</CardDescription>
                    </div>
                    <Link href="/admin/audit-logs" className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-bold flex items-center gap-1 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 px-3 py-1.5 rounded-xl transition-all shadow-sm">
                        Full Logs <ArrowRight className="w-4 h-4 text-amber-500" />
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-transparent">
                    <AuditFilters />
                </div>
                
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/80 dark:bg-slate-900/40 text-slate-550 dark:text-slate-400 font-bold text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4">Thời gian</th>
                                <th className="px-6 py-4">Nhân sự</th>
                                <th className="px-6 py-4">Hành động</th>
                                <th className="px-6 py-4">Bảng dữ liệu</th>
                                <th className="px-6 py-4">Rủi ro (CRS)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {(logs || []).map((log: any) => (
                                <tr key={log.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-3 whitespace-nowrap text-slate-500 dark:text-slate-450 font-mono text-[11px]">
                                        {new Date(log.created_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[150px]">{log.user_email || 'System'}</div>
                                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{log.ip_address}</div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase tracking-wider ${
                                            log.action === 'delete' ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/20' :
                                            log.action === 'insert' ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                                            log.action === 'update' ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                                            'bg-slate-500/10 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-550/20'
                                        }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-slate-700 dark:text-slate-350 font-medium">
                                        {log.table_name}
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${
                                            (log.risk_score || 0) >= 75 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                            (log.risk_score || 0) >= 35 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                            'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                        }`}>
                                            {log.risk_score || 0} CRS
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {logs?.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                        Không tìm thấy bản ghi nào khớp với điều kiện lọc.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );

    const realtimeSocNode = (
        <SocMetricsPanel
            initialStats={{
                last24hLogs: stats.last24hLogs,
                activeUsers24h: stats.activeUsers24h,
                deleteCount24h: stats.deleteCount24h,
                anomalyAlerts: stats.anomalyAlerts,
            }}
            initialEmails={stats.activeEmails}
            topActiveUsersNode={topActiveUsersNode}
            ipBlocklistNode={ipBlocklistNode}
            auditLogExplorerNode={auditLogExplorerNode}
        />
    );

    // ============================================================
    // NODE 2: SỔ CÁI BẤT BIẾN (WORM VAULT)
    // ============================================================
    const wormVaultNode = (
        <div className="animate-in fade-in duration-300">
            <WormVaultWidget />
        </div>
    );

    // ============================================================
    // NODE 3: PHÒNG THÍ NGHIỆM GIẢ LẬP & SANDBOX
    // ============================================================
    const sandboxNode = (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
                {/* Threat Simulator Demo */}
                <ThreatSimulator />
                
                {/* Rate Limits & Noisy Neighbors */}
                <NoisyNeighborsWidget rateLimitHits={stats.rateLimitHits} />
            </div>
            
            <div>
                {/* Tenant Connection Pooler Widget */}
                <TenantPoolerWidget />
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 dark:bg-slate-950/80 text-white p-8 rounded-3xl relative overflow-hidden shadow-2xl border border-slate-800">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-amber-500/20 rounded-xl backdrop-blur-sm border border-amber-500/30">
                            <Shield className="w-7 h-7 text-amber-400" />
                        </div>
                        <h1 className="text-3xl font-playfair font-black tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">Security Operations Center</h1>
                    </div>
                    <p className="text-slate-400 max-w-2xl text-sm">
                        Trung tâm Giám sát An toàn Thông tin (SOC). Cung cấp khả năng theo dõi hành vi, phát hiện truy cập bất thường và bảo vệ dữ liệu bằng RLS.
                    </p>
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    {/* Council QR Code Entry — enlarged for easy scanning */}
                    <div className="flex flex-col items-center gap-2 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-amber-500/40 shadow-[0_0_24px_rgba(245,158,11,0.18)] shrink-0 group transition-all hover:border-amber-400/70 hover:shadow-[0_0_36px_rgba(245,158,11,0.30)]">
                        {/* Pulse ring */}
                        <div className="relative">
                            <div className="absolute inset-0 rounded-2xl bg-amber-500/10 animate-pulse pointer-events-none" />
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(councilUrl)}&color=f59e0b&bgcolor=0f172a&margin=6`}
                                alt={`QR Council Portal — ${host}/council`}
                                className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl border-2 border-amber-500/50 group-hover:scale-105 transition-transform relative z-10"
                            />
                        </div>
                        <div className="text-center">
                            <div className="text-[9px] text-amber-400/70 font-bold uppercase tracking-widest">📱 Quét để tấn công</div>
                            <div className="text-[11px] font-black text-amber-400 leading-tight">Threat Simulator</div>
                            <div className="text-[8px] text-slate-500 font-mono mt-0.5">{host}/council</div>
                        </div>
                    </div>


                    {/* SOC Realtime Audio Listener */}
                    <SocRealtimeListener />

                    {/* Security Report Button */}
                    <SecurityReportButton />

                    <div className="px-5 py-3 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 shadow-inner shrink-0">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">RLS Coverage</div>
                        <div className="flex items-center gap-3">
                            <div className="text-2xl font-black text-amber-400">{stats.rlsCoverage?.percentage || 93}%</div>
                            <ShieldCheck className="w-5 h-5 text-amber-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Academic Blueprint Matrix Node */}
            {(() => {
                const blueprintNode = (
                    <div className="animate-in fade-in duration-300">
                        <TechnicalAcademicMatrix />
                    </div>
                );
                return (
                    <SecurityTabsContainer 
                        realtimeSocNode={realtimeSocNode}
                        wormVaultNode={wormVaultNode}
                        sandboxNode={sandboxNode}
                        blueprintNode={blueprintNode}
                    />
                );
            })()}
        </div>
    );
}
