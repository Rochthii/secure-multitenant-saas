'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, Users, ShieldAlert, AlertTriangle, ShieldCheck, Lock, Fingerprint } from 'lucide-react';
import { AnomalyActionButtons } from '@/components/admin/audit/anomaly-action-buttons';
import { useRouter } from 'next/navigation';

interface AnomalyAlert {
  user_email: string;
  user_id?: string;
  action_count: number;
  period: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  created_at?: string;
}

interface SocMetricsPanelProps {
  initialStats: {
    last24hLogs: number;
    activeUsers24h: number;
    deleteCount24h: number;
    anomalyAlerts: AnomalyAlert[];
  };
  initialEmails: string[];
  topActiveUsersNode: React.ReactNode;
  ipBlocklistNode: React.ReactNode;
  auditLogExplorerNode: React.ReactNode;
}

export function SocMetricsPanel({ 
  initialStats, 
  initialEmails,
  topActiveUsersNode,
  ipBlocklistNode,
  auditLogExplorerNode
}: SocMetricsPanelProps) {
  const [last24hLogs, setLast24hLogs] = useState(initialStats.last24hLogs);
  const [activeUsers24h, setActiveUsers24h] = useState(initialStats.activeUsers24h);
  const [deleteCount24h, setDeleteCount24h] = useState(initialStats.deleteCount24h);
  const [anomalyAlerts, setAnomalyAlerts] = useState<AnomalyAlert[]>(initialStats.anomalyAlerts);
  const [knownEmails, setKnownEmails] = useState<Set<string>>(new Set(initialEmails));

  // State quản lý hiệu ứng nhấp nháy (glow) khi có log mới
  const [glowCard, setGlowCard] = useState<'logs' | 'users' | 'anomaly' | 'delete' | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Lắng nghe realtime từ bảng audit_logs
    const channel = supabase
      .channel('soc-metrics-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audit_logs' },
        (payload) => {
          const newLog = payload.new as any;
          console.log('Realtime log received in SOC Panel:', newLog);

          // 1. Cập nhật tổng số logs 24h
          setLast24hLogs((prev) => prev + 1);
          setGlowCard('logs');

          // 2. Cập nhật số active users
          const email = newLog.user_email || 'guest@anonymous';
          if (email !== 'guest@anonymous' && !knownEmails.has(email)) {
            setKnownEmails((prev) => {
              const next = new Set(prev);
              next.add(email);
              return next;
            });
            setActiveUsers24h((prev) => prev + 1);
            setGlowCard('users');
          }

          // 3. Cập nhật nếu là hành vi DELETE (High risk)
          if (newLog.action === 'delete') {
            setDeleteCount24h((prev) => prev + 1);
            setGlowCard('delete');
          }

          // 4. Kiểm tra nếu là cảnh báo Anomaly
          const riskScore = newLog.risk_score || 0;
          const severity = newLog.severity || 'INFO';
          const isAnomaly = riskScore >= 35 || severity === 'CRITICAL' || severity === 'HIGH';

          if (isAnomaly) {
            // Định nghĩa label & description
            let actionLabel = 'truy cập bất thường';
            if (newLog.action === 'sql_injection_attempt') actionLabel = 'tấn công chèn mã SQL Injection';
            else if (newLog.action === 'cross_tenant_violation') actionLabel = 'vi phạm truy cập dữ liệu chéo';
            else if (newLog.action === 'cache_pollution_attempt') actionLabel = 'tấn công noisy neighbor làm nghẽn tài nguyên';

            const description = newLog.details?.reason || newLog.details?.message || `Phát hiện hành vi đáng ngờ có mức độ nghiêm trọng: ${severity}`;

            const newAlert: AnomalyAlert = {
              user_email: email,
              user_id: newLog.user_id,
              action_count: riskScore || (severity === 'CRITICAL' ? 95 : 75),
              period: new Date(newLog.created_at || new Date()).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Ho_Chi_Minh'
              }),
              severity: riskScore >= 75 || severity === 'CRITICAL' ? 'critical' : 'warning',
              description: description,
              created_at: newLog.created_at
            };

            // Thêm cảnh báo mới lên đầu danh sách và giới hạn tối đa 10 cảnh báo
            setAnomalyAlerts((prev) => [newAlert, ...prev].slice(0, 10));
            setGlowCard('anomaly');
          }

          // Xóa hiệu ứng nhấp nháy sau 1.2 giây
          setTimeout(() => {
            setGlowCard(null);
          }, 1200);

          // Vẫn kích hoạt refresh Server Components ngầm để đồng bộ biểu đồ
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [knownEmails, router, supabase]);

  return (
    <div className="space-y-8">
      {/* 4 Cards Overview với hiệu ứng glow realtime */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={`bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl border shadow-xl overflow-hidden group transition-all duration-500 ${
          glowCard === 'logs' 
            ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-amber-500/10' 
            : 'border-slate-200 dark:border-slate-800/80 hover:border-amber-500/30'
        }`}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Tổng truy cập (24h)</p>
                <h3 className={`text-3xl font-black transition-all duration-300 ${glowCard === 'logs' ? 'text-amber-500 scale-110' : 'text-slate-800 dark:text-slate-100'}`}>
                  {last24hLogs}
                </h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center font-semibold">
                  <Activity className="w-3.5 h-3.5 mr-1" /> Logged actions
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-500 ${
                glowCard === 'logs' 
                  ? 'bg-amber-500 text-slate-950 border-amber-400' 
                  : 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:scale-110'
              }`}>
                <Fingerprint className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl border shadow-xl overflow-hidden group transition-all duration-500 ${
          glowCard === 'users' 
            ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-amber-500/10' 
            : 'border-slate-200 dark:border-slate-800/80 hover:border-amber-500/30'
        }`}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Users Hoạt động (24h)</p>
                <h3 className={`text-3xl font-black transition-all duration-300 ${glowCard === 'users' ? 'text-amber-500 scale-110' : 'text-slate-800 dark:text-slate-100'}`}>
                  {activeUsers24h}
                </h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center font-semibold">
                  <Users className="w-3.5 h-3.5 mr-1" /> Authenticated identities
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-500 ${
                glowCard === 'users' 
                  ? 'bg-amber-500 text-slate-950 border-amber-400' 
                  : 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:scale-110'
              }`}>
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl border shadow-xl overflow-hidden group transition-all duration-500 ${
          glowCard === 'anomaly' 
            ? 'border-rose-500 ring-2 ring-rose-500/25 shadow-rose-500/15' 
            : 'border-slate-200 dark:border-slate-800/80 hover:border-amber-500/30'
        }`}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Cảnh báo Anomaly</p>
                <h3 className={`text-3xl font-black transition-all duration-300 ${glowCard === 'anomaly' ? 'text-rose-500 scale-110 animate-pulse' : 'text-slate-800 dark:text-slate-100'}`}>
                  {anomalyAlerts.length}
                </h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-500" /> Truy cập bất thường
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-500 ${
                glowCard === 'anomaly' 
                  ? 'bg-rose-500 text-white border-rose-400 animate-bounce' 
                  : 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:scale-110'
              }`}>
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-slate-950/90 dark:bg-slate-950/60 border text-white backdrop-blur-xl shadow-xl overflow-hidden relative group transition-all duration-500 ${
          glowCard === 'delete' 
            ? 'border-rose-500 ring-2 ring-rose-500/25 shadow-rose-500/15' 
            : 'border-rose-500/30 dark:border-rose-950/40 hover:border-rose-500/60'
        }`}>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-rose-500/20 rounded-full blur-xl"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Xóa Dữ Liệu (24h)</p>
                <h3 className={`text-3xl font-black transition-all duration-300 ${glowCard === 'delete' ? 'text-rose-400 scale-110' : 'text-rose-400'}`}>
                  {deleteCount24h}
                </h3>
                <p className="text-xs text-slate-400 mt-2 flex items-center font-medium">
                  <Lock className="w-3.5 h-3.5 mr-1 text-rose-400" /> High-risk actions
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-500 ${
                glowCard === 'delete' 
                  ? 'bg-rose-600 text-white border-rose-500 animate-pulse' 
                  : 'bg-rose-500/20 border-rose-500/30 text-rose-400 group-hover:scale-110'
              }`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid 3 cột theo layout gốc của Security Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái: Anomaly Detection Card (Realtime), Top Users, IP Blocklist */}
        <div className="space-y-8 lg:col-span-1">
          <Card className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <CardHeader className="bg-rose-500/5 dark:bg-rose-950/10 border-b border-rose-100/50 dark:border-rose-950/20 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <ShieldAlert className="w-5 h-5 text-rose-500" /> Phát hiện truy cập bất thường
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">
                Phát hiện hành vi rủi ro dựa trên chỉ số CRS thời gian thực.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {anomalyAlerts.length === 0 ? (
                <div className="text-center py-8 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-950/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                  <ShieldCheck className="w-10 h-10 mx-auto mb-2 opacity-50 text-emerald-500" />
                  <p className="font-semibold text-sm">Không phát hiện truy cập bất thường</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                  {anomalyAlerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/40 shadow-sm hover:shadow-md transition-all flex items-start gap-3 relative overflow-hidden group ${
                        idx === 0 && glowCard === 'anomaly' ? 'ring-2 ring-rose-500/30 border-rose-400 animate-pulse' : ''
                      }`}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        alert.severity === 'critical' ? 'bg-rose-500' : 'bg-amber-500'
                      }`}></div>
                      <div className={`p-2 rounded-lg border shrink-0 ${
                        alert.severity === 'critical' 
                          ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/20' 
                          : 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{alert.user_email}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{alert.description}</p>
                        <div className="mt-2 flex gap-2">
                          <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md font-medium">{alert.action_count} CRS</span>
                          {alert.severity === 'critical' ? (
                            <span className="text-[10px] px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-md font-black uppercase tracking-wider animate-pulse">Critical</span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-md font-black uppercase tracking-wider">Warning</span>
                          )}
                          <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md font-medium">{alert.period}</span>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center">
                        <AnomalyActionButtons userEmail={alert.user_email} userId={alert.user_id} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Active Users Node */}
          {topActiveUsersNode}

          {/* IP Blocklist Node */}
          {ipBlocklistNode}
        </div>

        {/* Cột phải: Audit Log Explorer */}
        <div className="lg:col-span-2 space-y-6">
          {auditLogExplorerNode}
        </div>
      </div>
    </div>
  );
}
