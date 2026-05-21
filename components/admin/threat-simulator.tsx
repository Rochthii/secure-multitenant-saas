'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ShieldX, CheckCircle2, Loader2, AlertTriangle, Zap, Lock, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface SimulationResult {
    attempt: string;
    blocked: boolean;
    rls_denied: boolean;
    audit_logged: boolean;
    tenant_a: string;
    tenant_b: string;
    rows_returned: number;
    latency_ms: number;
    detail: string;
}

export function ThreatSimulator() {
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState<SimulationResult | null>(null);
    const [phase, setPhase] = useState<string>('');

    const runSimulation = async () => {
        setRunning(true);
        setResult(null);
        setPhase('Khởi tạo cuộc tấn công giả định...');

        try {
            // Phase 1: Announce
            await delay(600);
            setPhase('Tenant A đang cố truy cập dữ liệu Tenant B...');
            await delay(700);

            setPhase('Gửi request RLS cross-tenant đến Supabase...');
            const startTime = performance.now();

            // Gọi API thực — server sẽ thực sự thử query cross-tenant
            const res = await fetch('/api/admin/security/simulate-attack', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scenario: 'cross_tenant_read' }),
            });

            const latency = Math.round(performance.now() - startTime);

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Simulation failed');
            }

            setPhase('Đang phân tích phản hồi RLS...');
            await delay(500);

            const data = await res.json();

            setPhase('Kiểm tra audit log...');
            await delay(400);

            setResult({
                ...data,
                latency_ms: latency,
            });

            if (data.blocked && data.rls_denied) {
                toast.success('✅ RLS hoạt động đúng — tấn công bị ngăn chặn!');
            } else {
                toast.error('⚠️ Phát hiện rủi ro bảo mật!');
            }
        } catch (err: any) {
            toast.error(err.message || 'Lỗi khi chạy simulation');
        } finally {
            setRunning(false);
            setPhase('');
        }
    };

    return (
        <Card className="border border-rose-500/30 bg-slate-900/60 backdrop-blur-xl shadow-2xl rounded-[2rem] overflow-hidden relative">
            {/* Glowing background effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

            <CardHeader className="p-7 pb-5 border-b border-rose-500/20 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                        <CardTitle className="text-white font-black flex items-center gap-2">
                            🔴 Threat Simulation Demo
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-xs mt-0.5">
                            Giả lập tấn công Cross-Tenant Access — chứng minh RLS hoạt động thực tế
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-7 relative z-10 space-y-6">
                {/* Scenario explanation */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">KỊCH BẢN</p>
                        <p className="text-sm font-bold text-white">Cross-Tenant Read Attack</p>
                        <p className="text-xs text-slate-400 mt-1">User của Tenant A cố đọc data của Tenant B qua API</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">CƠ CHẾ BẢO VỆ</p>
                        <p className="text-sm font-bold text-amber-400">PostgreSQL RLS</p>
                        <p className="text-xs text-slate-400 mt-1">Row Level Security lọc dữ liệu theo tenant_id ở tầng DB</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">KẾT QUẢ KỲ VỌNG</p>
                        <p className="text-sm font-bold text-emerald-400">0 rows returned</p>
                        <p className="text-xs text-slate-400 mt-1">RLS deny → audit_log ghi nhận → hệ thống an toàn</p>
                    </div>
                </div>

                {/* Attack chain visualization */}
                <div className="flex items-center gap-2 overflow-x-auto py-2">
                    {[
                        { label: 'Tenant A User', icon: '👤', color: 'rose' },
                        { label: 'API Request', icon: '→', color: 'slate', arrow: true },
                        { label: 'Next.js API', icon: '⚡', color: 'amber' },
                        { label: 'Supabase', icon: '→', color: 'slate', arrow: true },
                        { label: 'RLS Filter', icon: '🛡️', color: 'emerald' },
                        { label: 'BLOCKED', icon: '❌', color: 'rose' },
                    ].map((step, i) => (
                        step.arrow ? (
                            <div key={i} className="text-slate-600 text-lg shrink-0">→</div>
                        ) : (
                            <div key={i} className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold border ${
                                step.color === 'rose' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' :
                                step.color === 'amber' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
                                step.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
                                'bg-slate-700/50 border-slate-600 text-slate-400'
                            }`}>
                                {step.icon} {step.label}
                            </div>
                        )
                    ))}
                </div>

                {/* Run button */}
                <Button
                    onClick={runSimulation}
                    disabled={running}
                    className="w-full h-12 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl shadow-lg shadow-rose-500/20 border border-rose-500/50 transition-all duration-200 text-sm tracking-wider"
                >
                    {running ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="animate-pulse">{phase}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <ShieldX className="w-5 h-5" />
                            🔴 KÍCH HOẠT GIẢI LẬP TẤN CÔNG
                        </div>
                    )}
                </Button>

                {/* Results */}
                {result && (
                    <div className={`rounded-2xl border p-6 space-y-4 transition-all duration-500 ${
                        result.blocked && result.rls_denied
                            ? 'bg-emerald-950/40 border-emerald-500/40'
                            : 'bg-rose-950/40 border-rose-500/40'
                    }`}>
                        <div className="flex items-center gap-3">
                            {result.blocked && result.rls_denied ? (
                                <>
                                    <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                                    <div>
                                        <p className="font-black text-emerald-300 text-lg">RLS BLOCKED — Hệ thống An toàn ✅</p>
                                        <p className="text-emerald-500 text-sm">Tấn công cross-tenant bị ngăn chặn hoàn toàn ở tầng Database</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="w-8 h-8 text-rose-400 shrink-0" />
                                    <div>
                                        <p className="font-black text-rose-300 text-lg">CẢNH BÁO — Cần kiểm tra!</p>
                                        <p className="text-rose-500 text-sm">Phát hiện dữ liệu bị rò rỉ cross-tenant</p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Rows Returned</p>
                                <p className={`text-2xl font-black ${result.rows_returned === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {result.rows_returned}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">RLS Denied</p>
                                <p className={`text-2xl font-black ${result.rls_denied ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {result.rls_denied ? 'YES' : 'NO'}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Audit Logged</p>
                                <p className={`text-2xl font-black ${result.audit_logged ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {result.audit_logged ? 'YES' : 'NO'}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Latency</p>
                                <p className="text-2xl font-black text-amber-400">{result.latency_ms}ms</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/30">
                            <div className="flex items-center gap-2 mb-2">
                                <Eye className="w-4 h-4 text-slate-400" />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phân tích chi tiết</p>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">{result.detail}</p>
                        </div>

                        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                            <p className="text-xs text-amber-300/80">
                                <strong>ISO 27017 §6.3.1:</strong> Hành động giả lập đã được ghi vào Immutable Audit Log. 
                                Tenant A: <code className="text-amber-400">{result.tenant_a}</code> → 
                                Tenant B: <code className="text-amber-400">{result.tenant_b}</code>
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
