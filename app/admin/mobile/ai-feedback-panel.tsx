'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Clock,
    CheckCircle2,
    XCircle,
    RefreshCcw,
    ChevronDown,
    ChevronUp,
    AlertTriangle,
    Loader2,
    Database,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type FeedbackStatus = 'PENDING' | 'REVIEWED' | 'REJECTED';

interface FeedbackLog {
    id: string;
    tenant_id: string | null;
    session_id: string | null;
    user_query: string;
    llm_answer: string;
    status: FeedbackStatus;
    corrected_answer: string | null;
    created_at: string;
    updated_at: string;
}

interface CacheLog {
    id: string;
    user_query: string;
    llm_answer: string;
    is_approved: boolean;
    view_count: number;
    tenant_id: string;
    created_at: string;
}

const STATUS_LABEL: Record<FeedbackStatus, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: {
        label: 'Chờ duyệt',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: <Clock className="w-3 h-3" />,
    },
    REVIEWED: {
        label: 'Đã hiệu đính',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: <CheckCircle2 className="w-3 h-3" />,
    },
    REJECTED: {
        label: 'Bác bỏ',
        color: 'bg-gray-100 text-gray-500 border-gray-200',
        icon: <XCircle className="w-3 h-3" />,
    },
};

function StatusBadge({ status }: { status: FeedbackStatus }) {
    const cfg = STATUS_LABEL[status] || STATUS_LABEL.PENDING;
    return (
        <span className={cn('inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border', cfg.color)}>
            {cfg.icon}
            {cfg.label}
        </span>
    );
}

function FeedbackRow({ log, onUpdated }: { log: FeedbackLog; onUpdated: () => void }) {
    const [expanded, setExpanded] = useState(false);
    const [corrected, setCorrected] = useState(log.corrected_answer || '');
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    const handleSave = async (newStatus: FeedbackStatus) => {
        setSaving(true);
        setSaveMsg('');

        try {
            if (newStatus === 'REVIEWED') {
                setSaveMsg('⏳ Đang huấn luyện AI...');
                
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;

                const response = await fetch(`${supabaseUrl}/functions/v1/train-ai-correction`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token || supabaseAnonKey}`,
                    },
                    body: JSON.stringify({
                        log_id: log.id,
                        corrected_answer: corrected,
                        is_approved: true // Duyệt thẳng vào Cache Approved
                    })
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.error || 'Lỗi huấn luyện');
                
                setSaveMsg('✅ Đã nạp vào Chánh Pháp!');
            } else {
                const { error } = await supabase
                    .from('ai_low_quality_logs')
                    .update({ status: newStatus, updated_at: new Date().toISOString() })
                    .eq('id', log.id);
                
                if (error) throw error;
                setSaveMsg('✅ Đã bác bỏ.');
            }

            setTimeout(() => {
                setSaveMsg('');
                onUpdated();
            }, 1000);
        } catch (error: any) {
            setSaveMsg('❌ Lỗi: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-slate-200 rounded-xl bg-white overflow-hidden"
        >
            {/* Header row */}
            <button
                className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors"
                onClick={() => setExpanded(prev => !prev)}
            >
                <MessageSquare className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{log.user_query}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        {log.tenant_id || 'GLOBAL'} · {new Date(log.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <StatusBadge status={log.status as FeedbackStatus} />
                {expanded ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
            </button>

            {/* Expanded detail */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4">
                            {/* Câu hỏi gốc */}
                            <div>
                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Câu hỏi của người dùng</p>
                                <div className="bg-stone-50 rounded-lg px-4 py-3 text-sm text-slate-700 border border-stone-200">
                                    {log.user_query}
                                </div>
                            </div>

                            {/* Câu trả lời của AI */}
                            <div>
                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Câu trả lời AI (bị đánh giá thấp)</p>
                                <div className="bg-amber-50 rounded-lg px-4 py-3 text-sm text-slate-700 border border-amber-200 max-h-48 overflow-y-auto whitespace-pre-wrap">
                                    {log.llm_answer}
                                </div>
                            </div>

                            {/* Câu trả lời hiệu đính */}
                            <div>
                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                                    Câu trả lời hiệu đính (tùy chọn · Sẽ được nạp vào Cache làm chuẩn)
                                </p>
                                <Textarea
                                    value={corrected}
                                    onChange={e => setCorrected(e.target.value)}
                                    placeholder="Nhập câu trả lời chuẩn theo Chánh pháp để nạp vào Semantic Cache..."
                                    className="min-h-[100px] text-sm resize-none"
                                />
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-3">
                                <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleSave('REVIEWED')}
                                    disabled={saving}
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                                    Xác nhận & Lưu
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-gray-500 border-gray-200"
                                    onClick={() => handleSave('REJECTED')}
                                    disabled={saving}
                                >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Bác bỏ
                                </Button>
                                {saveMsg && (
                                    <span className="text-sm font-medium text-green-600">{saveMsg}</span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export function AiFeedbackPanel() {
    const [activeTab, setActiveTab] = useState<'LOGS' | 'CACHE'>('LOGS');
    const [logs, setLogs] = useState<FeedbackLog[]>([]);
    const [cache, setCache] = useState<CacheLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FeedbackStatus | 'ALL'>('PENDING');

    const fetchData = useCallback(async () => {
        setLoading(true);
        if (activeTab === 'LOGS') {
            let query = supabase
                .from('ai_low_quality_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (filter !== 'ALL') query = query.eq('status', filter);
            const { data } = await query;
            if (data) setLogs(data as FeedbackLog[]);
        } else {
            const { data } = await supabase
                .from('ai_query_cache')
                .select('*')
                .order('is_approved', { ascending: true })
                .order('created_at', { ascending: false })
                .limit(50);
            if (data) setCache(data as CacheLog[]);
        }
        setLoading(false);
    }, [filter, activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleApproveCache = async (id: string, newContent: string) => {
        try {
            const { error } = await supabase
                .from('ai_query_cache')
                .update({ 
                    llm_answer: newContent, 
                    is_approved: true,
                    updated_at: new Date().toISOString() 
                })
                .eq('id', id);
            if (error) throw error;
            fetchData();
        } catch (e) {
            console.error(e);
        }
    };

    const pendingCount = logs.filter(l => l.status === 'PENDING').length;

    return (
        <div className="space-y-5">
            {/* Tab Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('LOGS')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        activeTab === 'LOGS' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <AlertTriangle className="w-4 h-4" />
                    Phản hồi lỗi ({pendingCount})
                </button>
                <button
                    onClick={() => setActiveTab('CACHE')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        activeTab === 'CACHE' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <Database className="w-4 h-4" />
                    Bộ đệm Chánh Pháp
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                </div>
            ) : activeTab === 'LOGS' ? (
                <div className="space-y-5">
                    {/* Filter buttons for Logs */}
                    <div className="flex gap-2">
                        {(['ALL', 'PENDING', 'REVIEWED', 'REJECTED'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                                    filter === s ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200"
                                )}
                            >
                                {s === 'ALL' ? 'Tất cả' : STATUS_LABEL[s].label}
                            </button>
                        ))}
                    </div>
                    {logs.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">Trống</div>
                    ) : (
                        <div className="space-y-3">
                            {logs.map(log => <FeedbackRow key={log.id} log={log} onUpdated={fetchData} />)}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {cache.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">Chưa có dữ liệu đệm.</div>
                    ) : (
                        cache.map(item => (
                            <div key={item.id} className="border border-slate-200 rounded-xl bg-white p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[10px] text-slate-400">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </Badge>
                                        {item.is_approved ? (
                                            <Badge className="bg-green-50 text-green-700 border-green-200">Đã duyệt</Badge>
                                        ) : (
                                            <Badge className="bg-amber-50 text-amber-700 border-amber-200">Chờ duyệt</Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                        <Zap className="w-3 h-3 text-amber-500" />
                                        {item.view_count} lượt dùng
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Câu hỏi</p>
                                    <p className="text-sm font-medium text-slate-800">{item.user_query}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Trả lời</p>
                                    <CacheEditor item={item} onApprove={handleApproveCache} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

function CacheEditor({ item, onApprove }: { item: CacheLog; onApprove: (id: string, content: string) => Promise<void> }) {
    const [content, setContent] = useState(item.llm_answer);
    const [loading, setLoading] = useState(false);

    return (
        <div className="space-y-2">
            <Textarea 
                value={content}
                onChange={e => setContent(e.target.value)}
                className="text-sm min-h-[80px]"
            />
            {!item.is_approved && (
                <Button 
                    size="sm" 
                    className="w-full bg-slate-900 text-white"
                    onClick={async () => {
                        setLoading(true);
                        await onApprove(item.id, content);
                        setLoading(false);
                    }}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                    Phê duyệt Chánh Pháp
                </Button>
            )}
        </div>
    );
}
