'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldAlert, RefreshCw, Layers, Database, Lock, AlertTriangle, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface WormBlock {
    index: number;
    id: string;
    action: string;
    table_name: string | null;
    timestamp: string;
    prev_hash: string;
    hash: string;
    severity: string;
}

interface VerificationResult {
    isValid: boolean;
    totalBlocks: number;
    tamperedBlockIndices: number[];
    mismatchedDbLogs: string[];
    lastSyncedIndex: number;
    lastSyncedAt: string | null;
    status: 'SECURE' | 'TAMPERED' | 'OUT_OF_SYNC';
}

export function WormVaultWidget() {
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [tampering, setTampering] = useState(false);
    const [data, setData] = useState<{
        verification: VerificationResult;
        recentBlocks: WormBlock[];
        totalBlocks: number;
    } | null>(null);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/security/worm-vault');
            if (res.ok) {
                const json = await res.json();
                setData(json);
            } else {
                toast.error('Không thể tải trạng thái WORM Vault');
            }
        } catch (e) {
            toast.error('Lỗi kết nối WORM API');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await fetch('/api/admin/security/worm-vault', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'sync' })
            });
            const json = await res.json();
            if (res.ok) {
                toast.success(`Đồng bộ thành công! Thêm mới ${json.syncedCount} bản ghi.`);
                fetchStatus();
            } else {
                toast.error(json.error || 'Lỗi đồng bộ');
            }
        } catch (e) {
            toast.error('Lỗi đồng bộ WORM API');
        } finally {
            setSyncing(false);
        }
    };

    const handleSimulateTamper = async (index: number) => {
        setTampering(true);
        try {
            const res = await fetch('/api/admin/security/worm-vault', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'tamper', 
                    index, 
                    newVal: 'UNAUTHORIZED_TAMPERED_ACTION' 
                })
            });
            const json = await res.json();
            if (res.ok) {
                toast.warning(`Đã giả lập can thiệp Block #${index}! Vui lòng chạy lại kiểm tra.`);
                fetchStatus();
            } else {
                toast.error(json.error || 'Không thể can thiệp');
            }
        } catch (e) {
            toast.error('Lỗi WORM API');
        } finally {
            setTampering(false);
        }
    };

    if (!data) {
        return (
            <Card className="bg-slate-900 border-slate-800 text-white animate-pulse">
                <CardContent className="h-64 flex items-center justify-center">
                    <div className="text-slate-400">Đang khởi tạo WORM Vault Cryptographic Ledger...</div>
                </CardContent>
            </Card>
        );
    }

    const { verification, recentBlocks, totalBlocks } = data;
    const isTampered = verification.status === 'TAMPERED';
    const isOutOfSync = verification.status === 'OUT_OF_SYNC';

    return (
        <Card className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-slate-800 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <CardHeader className="border-b border-slate-800/60 pb-6 relative z-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                            <Lock className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                                WORM Cryptographic Vault (ISO 27017 CLD.12.4.1)
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-xs">
                                Lưu trữ Audit Log bất biến vật lý bằng Sổ cái Chuỗi mã hóa (Hash-Chained immutable ledger)
                            </CardDescription>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={fetchStatus} 
                            disabled={loading || syncing}
                            className="bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 gap-1.5"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                            Tải lại
                        </Button>
                        <Button 
                            size="sm" 
                            onClick={handleSync} 
                            disabled={loading || syncing}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white border-none shadow-md font-bold gap-1.5"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Đồng bộ WORM
                        </Button>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="pt-6 relative z-10 space-y-6">
                {/* Status Indicator Bar */}
                <div className={`p-5 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                    isTampered 
                        ? 'bg-rose-950/20 border-rose-500/30' 
                        : isOutOfSync 
                            ? 'bg-amber-950/20 border-amber-500/30' 
                            : 'bg-emerald-950/20 border-emerald-500/30'
                }`}>
                    <div className="flex items-center gap-3.5">
                        <div className={`p-3 rounded-xl ${
                            isTampered 
                                ? 'bg-rose-500/20 text-rose-400' 
                                : isOutOfSync 
                                    ? 'bg-amber-500/20 text-amber-400' 
                                    : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                            {isTampered ? (
                                <ShieldAlert className="w-8 h-8" />
                            ) : isOutOfSync ? (
                                <AlertTriangle className="w-8 h-8" />
                            ) : (
                                <ShieldCheck className="w-8 h-8" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Ledger Integrity State</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                    isTampered 
                                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                                        : isOutOfSync 
                                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                }`}>
                                    {verification.status}
                                </span>
                            </div>
                            <h3 className="text-lg font-black mt-1">
                                {isTampered 
                                    ? 'PHÁT HIỆN SỰ CỐ XÂM PHẠM HỆ THỐNG!' 
                                    : isOutOfSync 
                                        ? 'Cần đồng bộ với Database' 
                                        : 'SỔ CÁI AN TOÀN TUYỆT ĐỐI'}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                                {isTampered 
                                    ? `Mã hóa chuỗi bị đứt gãy tại Block Index: #${verification.tamperedBlockIndices.join(', #')}. Cảnh báo giả mạo nhật ký!`
                                    : isOutOfSync 
                                        ? 'Database đang có audit logs mới chưa được lưu trữ vật lý vào WORM Sổ cái.'
                                        : `Tất cả ${totalBlocks} block nhật ký đã được mã hóa chuỗi khóa, đối chiếu DB đạt khớp nối 100%.`}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4 md:border-l border-slate-800/80 md:pl-6 text-sm">
                        <div>
                            <div className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Tổng số Block</div>
                            <div className="text-2xl font-black text-slate-100">{totalBlocks}</div>
                        </div>
                        <div>
                            <div className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Đồng bộ cuối</div>
                            <div className="text-slate-200 mt-1 font-mono text-xs">
                                {verification.lastSyncedAt 
                                    ? new Date(verification.lastSyncedAt).toLocaleTimeString('vi-VN') 
                                    : 'Chưa có'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hash Chain Visualizer */}
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        Trực quan chuỗi mã hóa Blocks (15 dòng gần nhất)
                    </h4>
                    
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                        {recentBlocks.map((block) => {
                            const blockTampered = verification.tamperedBlockIndices.includes(block.index);
                            return (
                                <div 
                                    key={block.id}
                                    className={`p-4 rounded-xl border transition-all duration-300 relative group flex flex-col sm:flex-row justify-between gap-4 ${
                                        blockTampered
                                            ? 'bg-rose-950/10 border-rose-500/30 shadow-[0_0_15px_rgba(239,68,68,0.05)]'
                                            : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/60'
                                    }`}
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${
                                                blockTampered 
                                                    ? 'bg-rose-500/20 text-rose-400' 
                                                    : 'bg-slate-800 text-slate-300'
                                            }`}>
                                                BLOCK #{block.index}
                                            </span>
                                            <span className="text-xs font-bold text-slate-300">{block.action}</span>
                                            <span className="text-slate-500 text-[10px]">•</span>
                                            <span className="text-slate-400 text-[10px] font-mono">{block.table_name || 'system'}</span>
                                            <span className="text-slate-500 text-[10px]">•</span>
                                            <span className="text-slate-500 text-[10px]">{new Date(block.timestamp).toLocaleString('vi-VN')}</span>
                                        </div>
                                        
                                        {/* Cryptographic hashes */}
                                        <div className="font-mono text-[10px] space-y-1 bg-slate-950/50 p-2.5 rounded-lg border border-slate-950/40">
                                            <div className="flex justify-between text-slate-500">
                                                <span>PREV_HASH:</span>
                                                <span className="text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap max-w-[280px] sm:max-w-[400px]">
                                                    {block.prev_hash}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-slate-500 border-t border-slate-900/60 pt-1 mt-1">
                                                <span>BLOCK_HASH:</span>
                                                <span className={`${blockTampered ? 'text-rose-400 font-bold' : 'text-emerald-400'} overflow-hidden text-ellipsis whitespace-nowrap max-w-[280px] sm:max-w-[400px]`}>
                                                    {block.hash}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex sm:flex-col justify-end items-end gap-2 shrink-0">
                                        {blockTampered && (
                                            <div className="flex items-center gap-1 text-rose-400 text-xs font-bold bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20 animate-pulse">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                Hủy liên kết
                                            </div>
                                        )}
                                        {!blockTampered && (
                                            <Button 
                                                size="sm" 
                                                variant="ghost"
                                                onClick={() => handleSimulateTamper(block.index)}
                                                disabled={tampering}
                                                className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 text-[10px] font-bold h-7 px-2.5 rounded-lg transition-all"
                                            >
                                                Giả lập can thiệp
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Secure Academic Mapping Callout */}
                <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80 flex items-start gap-3">
                    <FileText className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                        <h5 className="text-xs font-bold text-slate-300">Tính năng An toàn & Ý nghĩa học thuật</h5>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            Bảo vệ tính bất biến bằng mật mã học (Cryptographic Hash-Chained ledger) kết hợp trigger chống chỉnh sửa tại DB ngăn chặn tối đa việc quản trị viên tự chỉnh sửa dấu vết. Cơ chế này đáp ứng nghiêm ngặt tiêu chuẩn <strong>ISO/IEC 27017 CLD.12.4.1</strong> và chứng minh tính chống chối bỏ (Non-repudiation) cho Chương 4 của luận văn tốt nghiệp.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
