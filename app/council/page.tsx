'use client';

import React, { useState } from 'react';
import { ShieldAlert, Terminal, Eye, Zap, Flame, Lock } from 'lucide-react';

export default function CouncilPortalPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
    const [logOutput, setLogOutput] = useState<string[]>([]);

    const handleAttack = async (scenario: string, label: string) => {
        setStatus('loading');
        setSelectedScenario(scenario);
        const timestamp = new Date().toLocaleTimeString('vi-VN');
        setLogOutput(prev => [...prev, `[${timestamp}] 🚀 Đang gửi yêu cầu tấn công [${label}]...`]);

        try {
            const url = scenario === 'honeypot' ? '/api/security/honeypot-decoy' : '/api/council/attack';
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scenario })
            });

            const data = await res.json();
            if (res.ok) {
                setStatus('success');
                setLogOutput(prev => [
                    ...prev,
                    `[${timestamp}] ✅ Thành công! Log an ninh đã được chèn.`,
                    `[${timestamp}] 🛡️ SOAR đã kích hoạt cơ chế tự động phòng vệ cho IP: ${data.clientIp}`,
                    `[${timestamp}] ⚠️ Hệ thống sẽ tự động chặn IP này tại Edge Middleware sau vài giây...`
                ]);

                // Tự động tải lại trang sau 2.5 giây để Edge Middleware chặn IP ngay lập tức
                setTimeout(() => {
                    window.location.reload();
                }, 2500);
            } else {
                throw new Error(data.error || 'Có lỗi xảy ra từ API.');
            }
        } catch (err: any) {
            setStatus('error');
            setLogOutput(prev => [
                ...prev, 
                `[${timestamp}] ❌ Lỗi: ${err?.message || 'Không thể kết nối đến máy chủ.'}`
            ]);
        }
    };

    return (
        <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col justify-between p-4 font-sans select-none relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Header */}
            <header className="text-center py-4 border-b border-slate-800/60 backdrop-blur-md bg-slate-900/10 rounded-2xl relative z-10">
                <div className="inline-flex p-2.5 bg-amber-500/10 rounded-2xl border border-amber-500/30 mb-2">
                    <ShieldAlert className="w-6 h-6 text-amber-400 animate-pulse" />
                </div>
                <h1 className="text-lg font-black tracking-wider uppercase bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">PTIT Cyber Sandbox</h1>
                <p className="text-[10px] text-slate-400 font-medium">Hệ thống mô phỏng xâm nhập & Thử nghiệm Active Defense</p>
            </header>

            {/* Main console */}
            <main className="my-6 space-y-6 relative z-10 flex-1 flex flex-col justify-center">
                <div className="text-center max-w-sm mx-auto mb-2">
                    <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                        Bạn đang đóng vai là **Hacker vãng lai** bên ngoài hệ thống. Hãy chọn 1 kịch bản dưới đây để thực hiện tấn công thực tế:
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 max-w-md mx-auto w-full">
                    {/* Scenario 1 */}
                    <button
                        disabled={status === 'loading'}
                        onClick={() => handleAttack('sql', 'SQL Injection')}
                        className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md text-left transition-all active:scale-98 hover:border-amber-500/30 flex items-center gap-4 group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                            <Flame className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-black uppercase text-slate-200">1. SQL Injection</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">Chèn chuỗi truy vấn thô vượt qua cổng API.</div>
                        </div>
                    </button>

                    {/* Scenario 2 */}
                    <button
                        disabled={status === 'loading'}
                        onClick={() => handleAttack('rls', 'Cross-tenant RLS')}
                        className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md text-left transition-all active:scale-98 hover:border-amber-500/30 flex items-center gap-4 group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0 group-hover:scale-105 transition-transform">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-black uppercase text-slate-200">2. Cross-tenant Access</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">Cố ý truy xuất trích xuất hồ sơ Tenant khác.</div>
                        </div>
                    </button>

                    {/* Scenario 3 */}
                    <button
                        disabled={status === 'loading'}
                        onClick={() => handleAttack('noisy', 'Connection Flood')}
                        className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md text-left transition-all active:scale-98 hover:border-amber-500/30 flex items-center gap-4 group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-black uppercase text-slate-200">3. Starvation Attack</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">Flood nhiều queries gây nghẽn Connection Limit.</div>
                        </div>
                    </button>

                    {/* Scenario 4 */}
                    <button
                        disabled={status === 'loading'}
                        onClick={() => handleAttack('tamper', 'Tamper Audit Logs')}
                        className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md text-left transition-all active:scale-98 hover:border-amber-500/30 flex items-center gap-4 group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-slate-550/10 border border-slate-500/20 flex items-center justify-center text-slate-350 shrink-0 group-hover:scale-105 transition-transform">
                            <Terminal className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-black uppercase text-slate-200">4. Tamper WORM Ledger</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">Cố ý sửa/xóa log thô nhằm che giấu dấu vết.</div>
                        </div>
                    </button>

                    {/* Scenario 5 */}
                    <button
                        disabled={status === 'loading'}
                        onClick={() => handleAttack('honeypot', 'Honeypot Decoy Trap')}
                        className="p-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/10 backdrop-blur-md text-left transition-all active:scale-98 hover:border-emerald-500/60 flex items-center gap-4 group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                            <Eye className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-black uppercase text-emerald-400">5. Honeypot Decoy Trap</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">Chạm vào bẫy mật ngọt: Chặn IP tức thì tại Edge.</div>
                        </div>
                    </button>
                </div>

                {/* Console Output Log */}
                {logOutput.length > 0 && (
                    <div className="p-4 rounded-2xl border border-slate-800 bg-[#02050a]/90 shadow-2xl max-w-md mx-auto w-full font-mono text-[10px] leading-relaxed text-amber-400/90 relative overflow-hidden group">
                        <div className="absolute top-2 right-3 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Console Live</span>
                        </div>
                        <div className="flex items-center gap-1 border-b border-slate-800/50 pb-2 mb-2 text-slate-500 font-bold uppercase tracking-wider">
                            <Terminal className="w-3.5 h-3.5" /> Terminal SecOps
                        </div>
                        <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                            {logOutput.map((log, i) => (
                                <div key={i} className="whitespace-pre-wrap">{log}</div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="text-center py-4 border-t border-slate-800/30 text-[9px] text-slate-500 font-medium tracking-wider uppercase relative z-10">
                Đồ án Tốt nghiệp PTIT © 2026 - Chăm Rốch Thi
            </footer>
        </div>
    );
}
