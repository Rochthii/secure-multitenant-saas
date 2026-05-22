'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ShieldX, CheckCircle2, Loader2, AlertTriangle, Zap, Lock, Eye, Database, Search } from 'lucide-react';
import { toast } from 'sonner';

type Scenario = 'cross_tenant_read' | 'cache_pollution' | 'sql_injection';

interface SimulationResult {
    scenario: Scenario;
    blocked: boolean;
    audit_logged: boolean;
    tenant_a?: string;
    tenant_b?: string;
    rows_returned?: number;
    rows_leaked?: number;
    payloads_tested?: number;
    defense_layer?: string;
    defense_layers?: string[];
    latency_ms: number;
    detail: string;
}

const SCENARIOS: Record<Scenario, {
    label: string;
    description: string;
    icon: React.ReactNode;
    color: 'rose' | 'amber' | 'violet';
    phase1: string;
    phase2: string;
}> = {
    cross_tenant_read: {
        label: 'Cross-Tenant Read',
        description: 'User Tenant A cố đọc data Tenant B qua RLS',
        icon: <ShieldX className="w-4 h-4" />,
        color: 'rose',
        phase1: 'Tenant A đang cố truy cập dữ liệu Tenant B...',
        phase2: 'PostgreSQL RLS đang xử lý kiểm tra quyền...',
    },
    cache_pollution: {
        label: 'Cache Pollution',
        description: 'Thử làm rò rỉ dữ liệu qua cache chéo tenant',
        icon: <Database className="w-4 h-4" />,
        color: 'amber',
        phase1: 'Kẻ tấn công đang cố dùng cache key của Tenant khác...',
        phase2: 'Kiểm tra Tenant-aware Cache Layer...',
    },
    sql_injection: {
        label: 'SQL Injection',
        description: 'Thử bypass RLS bằng SQL Injection payload',
        icon: <Search className="w-4 h-4" />,
        color: 'violet',
        phase1: 'Gửi SQL Injection payload vào query parameter...',
        phase2: 'Parameterized Query đang xử lý escape input...',
    },
};

export function ThreatSimulator() {
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState<SimulationResult | null>(null);
    const [phase, setPhase] = useState<string>('');
    const [activeScenario, setActiveScenario] = useState<Scenario>('cross_tenant_read');

    const runSimulation = async (scenario: Scenario) => {
        setRunning(true);
        setActiveScenario(scenario);
        setResult(null);

        const scenarioConfig = SCENARIOS[scenario];
        setPhase('Khởi tạo cuộc tấn công giả định...');

        try {
            await delay(500);
            setPhase(scenarioConfig.phase1);
            await delay(700);
            setPhase(scenarioConfig.phase2);

            const startTime = performance.now();
            const res = await fetch('/api/admin/security/simulate-attack', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scenario }),
            });
            const latency = Math.round(performance.now() - startTime);

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Simulation failed');
            }

            setPhase('Đang phân tích kết quả & ghi audit log...');
            await delay(400);

            const data = await res.json();
            setResult({ ...data, latency_ms: latency });

            if (data.blocked) {
                toast.success(`✅ [${scenarioConfig.label}] Tấn công bị chặn đứng!`);
            } else {
                toast.error(`⚠️ [${scenarioConfig.label}] Phát hiện rủi ro bảo mật!`);
            }
        } catch (err: any) {
            toast.error(err.message || 'Lỗi khi chạy simulation');
        } finally {
            setRunning(false);
            setPhase('');
        }
    };

    const currentConfig = SCENARIOS[activeScenario];
    const colorMap = {
        rose: {
            border: 'border-rose-500/30',
            bg: 'bg-rose-500/10',
            text: 'text-rose-400',
            btn: 'bg-rose-600 hover:bg-rose-500 border-rose-500/50 shadow-rose-500/20',
        },
        amber: {
            border: 'border-amber-500/30',
            bg: 'bg-amber-500/10',
            text: 'text-amber-400',
            btn: 'bg-amber-600 hover:bg-amber-500 border-amber-500/50 shadow-amber-500/20',
        },
        violet: {
            border: 'border-violet-500/30',
            bg: 'bg-violet-500/10',
            text: 'text-violet-400',
            btn: 'bg-violet-600 hover:bg-violet-500 border-violet-500/50 shadow-violet-500/20',
        },
    };

    return (
        <Card className="border border-rose-500/30 bg-slate-900/60 backdrop-blur-xl shadow-2xl rounded-[2rem] overflow-hidden relative">
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
                            3 kịch bản tấn công thực tế — Kiểm chứng Defense-in-depth (Chương 5 Đồ án)
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-7 relative z-10 space-y-6">
                {/* Scenario Selector */}
                <div className="grid grid-cols-3 gap-2">
                    {(Object.entries(SCENARIOS) as [Scenario, typeof SCENARIOS[Scenario]][]).map(([key, cfg]) => {
                        const colors = colorMap[cfg.color];
                        const isActive = activeScenario === key;
                        return (
                            <button
                                key={key}
                                onClick={() => !running && setActiveScenario(key)}
                                disabled={running}
                                className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                                    isActive
                                        ? `${colors.border} ${colors.bg} ${colors.text}`
                                        : 'border-slate-700/50 bg-slate-800/40 text-slate-500 hover:border-slate-600'
                                }`}
                            >
                                <div className="flex items-center gap-1.5 mb-1">
                                    {cfg.icon}
                                    <span className="text-[10px] font-black uppercase tracking-wider">{cfg.label}</span>
                                </div>
                                <p className="text-[10px] leading-tight opacity-80">{cfg.description}</p>
                            </button>
                        );
                    })}
                </div>

                {/* Defense chain */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
                    {[
                        { label: 'Attacker', color: 'rose' },
                        { label: '→' },
                        { label: 'Next.js API', color: 'amber' },
                        { label: '→' },
                        { label: 'RLS / Cache / Parameterized', color: 'emerald' },
                        { label: '→' },
                        { label: 'BLOCKED ❌', color: 'rose' },
                    ].map((step, i) => (
                        step.label === '→' ? (
                            <span key={i} className="text-slate-600">→</span>
                        ) : (
                            <span key={i} className={`shrink-0 px-2 py-1 rounded-lg font-bold border ${
                                step.color === 'rose' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' :
                                step.color === 'amber' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
                                'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            }`}>
                                {step.label}
                            </span>
                        )
                    ))}
                </div>

                {/* Run Button */}
                <Button
                    onClick={() => runSimulation(activeScenario)}
                    disabled={running}
                    className={`w-full h-12 text-white font-black rounded-xl shadow-lg border transition-all duration-200 text-sm tracking-wider ${colorMap[currentConfig.color].btn}`}
                >
                    {running ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="animate-pulse">{phase}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5" />
                            🔴 KÍCH HOẠT: {SCENARIOS[activeScenario].label.toUpperCase()}
                        </div>
                    )}
                </Button>

                {/* Results */}
                {result && (
                    <div className={`rounded-2xl border p-6 space-y-4 transition-all duration-500 ${
                        result.blocked
                            ? 'bg-emerald-950/40 border-emerald-500/40'
                            : 'bg-rose-950/40 border-rose-500/40'
                    }`}>
                        <div className="flex items-center gap-3">
                            {result.blocked ? (
                                <>
                                    <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                                    <div>
                                        <p className="font-black text-emerald-300 text-base">CHẶN THÀNH CÔNG ✅</p>
                                        <p className="text-emerald-500 text-xs">
                                            [{SCENARIOS[result.scenario]?.label}] — Kiến trúc phòng thủ hoạt động đúng thiết kế
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="w-8 h-8 text-rose-400 shrink-0" />
                                    <div>
                                        <p className="font-black text-rose-300 text-base">CẢNH BÁO RỦI RO ⚠️</p>
                                        <p className="text-rose-500 text-xs">Phát hiện dữ liệu bị rò rỉ — Cần điều tra ngay!</p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-center">
                                <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Rows Leaked</p>
                                <p className={`text-2xl font-black ${(result.rows_returned ?? result.rows_leaked ?? 0) === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {result.rows_returned ?? result.rows_leaked ?? 0}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-center">
                                <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Audit Log</p>
                                <p className={`text-2xl font-black ${result.audit_logged ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {result.audit_logged ? 'YES' : 'NO'}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-center">
                                <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Latency</p>
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
                                <strong>ISO 27017:</strong> Sự kiện giả lập này đã được ghi vào Immutable Audit Log với action <code className="text-amber-400">simulate:{result.scenario}</code>
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
