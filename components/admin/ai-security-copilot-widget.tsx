'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Shield, Sparkles, Terminal, Activity, AlertTriangle, ShieldCheck, Loader2, ShieldAlert, LogOut, CheckCircle2, Download } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    isStreaming?: boolean;
    citations?: any[];
    // Hỗ trợ Action Card cho Active Defense
    suggestedAction?: {
        type: 'force_logout';
        userEmail: string;
        userId?: string;
        executed?: boolean;
        message?: string;
    };
    isReport?: boolean; // Đánh dấu tin nhắn là Báo cáo an ninh
}

export function AISecurityCopilotWidget({ tenantId }: { tenantId?: string | null }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [activePrompt, setActivePrompt] = useState<string | null>(null);
    const [hasNewAlert, setHasNewAlert] = useState(false);
    
    // 🛡️ CHẾ ĐỘ AI TỰ PHÒNG THỦ (ACTIVE DEFENSE)
    const [isAutoDefense, setIsAutoDefense] = useState(false);
    const [isDefending, setIsDefending] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Trình diễn hiệu ứng nháy đỏ khi có anomaly log (tạo cảm giác SOC thực thụ)
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                // Kiểm tra xem có anomalies mới trong 5 phút qua không
                const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
                const { count } = await supabase
                    .from('audit_logs')
                    .select('*', { count: 'exact', head: true })
                    .eq('action', 'delete')
                    .gt('created_at', fiveMinutesAgo);

                if (count && count > 0 && !isOpen) {
                    setHasNewAlert(true);
                }
            } catch (_) {}
        }, 15000);

        return () => clearInterval(interval);
    }, [isOpen, supabase]);

    // Khởi tạo Chat Session khi mở chatbot lần đầu
    const initSession = async () => {
        if (sessionId) return sessionId;
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: newId, error } = await (supabase as any).rpc('create_chat_session_v2', {
                p_tenant_id: tenantId || '55555555-5555-5555-5555-555555555555',
                p_user_id: user?.id ?? null
            });

            if (!error && newId) {
                setSessionId(newId);
                return newId;
            }
        } catch (e) {
            console.error('Failed to init session:', e);
        }
        return null;
    };

    // Quét câu trả lời AI để tự động phát hiện đề xuất chặn/khóa kẻ tấn công (Active Defense Parser)
    const parseSuggestedActions = (text: string): Message['suggestedAction'] | undefined => {
        // Tìm kiếm các mẫu đề xuất dạng: "đề xuất: ép đăng xuất tài khoản email@domain.com"
        // hoặc "cần force logout tài khoản email@domain.com"
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i;
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('ép đăng xuất') || lowerText.includes('force logout') || lowerText.includes('khóa tài khoản')) {
            const match = text.match(emailRegex);
            if (match && match[1]) {
                return {
                    type: 'force_logout',
                    userEmail: match[1]
                };
            }
        }
        return undefined;
    };

    // Thực thi ép đăng xuất (Force Logout API Call)
    const executeForceLogout = async (userEmail: string, messageId: string) => {
        setIsDefending(true);
        try {
            // Lấy userId tương ứng từ database để khóa
            const { data: userData } = await supabase
                .from('audit_logs')
                .select('user_id')
                .eq('user_email', userEmail)
                .limit(1)
                .maybeSingle();

            const res = await fetch('/api/admin/security/force-logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: userData?.user_id || null, 
                    userEmail 
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to force logout');

            // Cập nhật trạng thái Action Card
            setMessages(prev => prev.map(m => m.id === messageId ? {
                ...m,
                suggestedAction: m.suggestedAction ? {
                    ...m.suggestedAction,
                    executed: true,
                    message: `🛡️ Đã thực thi tự vệ thành công: Tài khoản ${userEmail} đã bị ép đăng xuất và thu hồi quyền truy cập.`
                } : undefined
            } : m));

            toast.success(`Active Defense kích hoạt: Đã khóa kẻ tấn công ${userEmail}`);

            // Thêm log vào ai_audit_log của Supabase
            await (supabase as any).from('ai_audit_log').insert([{
                issue_type: 'AI_ACTIVE_DEFENSE_EXECUTED',
                query: `AI tự động/hoặc Admin ra lệnh khóa tài khoản nghi vấn: ${userEmail}`,
                response_snippet: `Tài khoản ${userEmail} bị ép đăng xuất ngay tại chỗ do nghi vấn vi phạm chính sách bảo mật.`
            }]);

        } catch (error: any) {
            console.error('Failed to execute defense action:', error);
            toast.error(`Không thể thực thi phòng thủ: ${error.message}`);
        } finally {
            setIsDefending(false);
        }
    };

    // Hàm gọi Edge Function RAG
    const sendMessageToAI = async (text: string, systemContext?: string, isReportRequest?: boolean) => {
        const userMsgId = crypto.randomUUID();
        const aiMsgId = crypto.randomUUID();

        setMessages(prev => [
            ...prev,
            { id: userMsgId, text, isUser: true },
            { id: aiMsgId, text: '', isUser: false, isStreaming: true, isReport: isReportRequest }
        ]);

        setIsLoading(true);
        setHasNewAlert(false);

        try {
            const currentSessionId = await initSession();
            
            // Lấy Session token hợp lệ
            const { data: refreshedData } = await supabase.auth.refreshSession();
            const authToken = refreshedData?.session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

            // Nếu có Context an ninh thực tế, ta gộp nó vào query một cách kín đáo
            const finalQuery = systemContext 
                ? `${text}\n\n[SYSTEM_CONTEXT_ANALYTICS: ${systemContext}]`
                : text;

            const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')}/functions/v1/rag-chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    query: finalQuery,
                    session_id: currentSessionId,
                    tenant_id: tenantId || null,
                    tradition_id: 'MAHAYANA' // Bắt buộc định tuyến sang vai trò IT Security Officer (Sĩ quan An ninh)
                })
            });

            if (!response.ok) {
                throw new Error(`API_ERROR: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder('utf-8');
            if (!reader) throw new Error("No reader");

            let done = false;
            let currentText = '';

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    const lines = decoder.decode(value, { stream: true }).split('\n');
                    for (const line of lines) {
                        if (line.trim() === '' || !line.startsWith('data: ')) continue;
                        const dataStr = line.replace('data: ', '').trim();
                        if (dataStr === '[DONE]') {
                            done = true;
                            break;
                        }
                        try {
                            const parsed = JSON.parse(dataStr);
                            if (parsed.text !== undefined) {
                                currentText += parsed.text;
                                setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: currentText } : m));
                            }
                            if (parsed.citations) {
                                setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, citations: parsed.citations } : m));
                            }
                        } catch (e) {}
                    }
                }
            }

            // Kết thúc streaming -> Quét câu trả lời xem có hành động phòng thủ nào cần đề xuất không
            const finalAIMessage = currentText;
            const suggestedAction = parseSuggestedActions(finalAIMessage);

            setMessages(prev => prev.map(m => m.id === aiMsgId ? { 
                ...m, 
                isStreaming: false,
                suggestedAction
            } : m));

            // 🛡️ NẾU BẬT CHẾ ĐỘ AUTO-DEFENSE: TỰ ĐỘNG THỰC THI KHÔNG ĐỢI HỎI!
            if (isAutoDefense && suggestedAction && suggestedAction.type === 'force_logout') {
                toast.info(`Auto Defense: Phát hiện đề xuất tự vệ từ AI. Đang tự động xử lý...`);
                // Delay nhẹ 2s để tạo cảm giác AI đang suy nghĩ hành động thực
                setTimeout(() => {
                    executeForceLogout(suggestedAction.userEmail, aiMsgId);
                }, 2000);
            }

        } catch (error: any) {
            console.error('Error sending message:', error);
            setMessages(prev => prev.map(m => m.id === aiMsgId 
                ? { ...m, text: '❌ Lỗi kết nối hệ thống. Xin vui lòng kiểm tra lại quyền hạn hoặc thử lại sau.', isStreaming: false } 
                : m
            ));
        } finally {
            setIsLoading(false);
            setActivePrompt(null);
        }
    };

    // Xử lý gửi câu hỏi tự do
    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;
        const text = inputValue.trim();
        setInputValue('');
        sendMessageToAI(text);
    };

    // Tải báo cáo an ninh xuống dưới dạng file Markdown
    const downloadReport = (reportText: string) => {
        const header = `# BÁO CÁO ĐÁNH GIÁ AN NINH HỆ THỐNG SAAS\n*Chuẩn ISO 27001 - Vận hành bởi AI Security Copilot*\n*Thời gian xuất bản: ${new Date().toLocaleString('vi-VN')}*\n\n---\n\n`;
        const blob = new Blob([header + reportText], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Security_SOC_Report_${new Date().toISOString().split('T')[0]}.md`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Xử lý click Quick Prompt (Real Security Data Integration)
    const handleQuickPrompt = async (type: 'summary' | 'logs' | 'predict' | 'rls') => {
        if (isLoading) return;
        
        let promptText = '';
        let loadingLabel = '';
        let isReport = false;

        if (type === 'summary') {
            promptText = '📋 Hãy tóm tắt tình trạng an ninh và các chỉ số hoạt động của hệ thống hôm nay. Thiết lập báo cáo dạng văn bản hành chính.';
            loadingLabel = 'Đang trích xuất dữ liệu SOC thực tế...';
            isReport = true;
        } else if (type === 'logs') {
            promptText = '🛡️ Hãy phân tích nhật ký (logs) phòng thủ, chỉ ra các hành vi có nguy cơ cao (Delete) và đưa ra đề xuất xử lý ép đăng xuất nếu cần thiết.';
            loadingLabel = 'Đang phân tích logs thời gian thực...';
        } else if (type === 'predict') {
            promptText = '🔮 Hãy đưa ra dự báo rủi ro an ninh thông tin và các khuyến nghị tối ưu hóa (ISO 27001) cho dự án này.';
            loadingLabel = 'Đang mô hình hóa dự báo an ninh...';
            isReport = true;
        } else if (type === 'rls') {
            promptText = '🔒 Hãy kiểm tra và đánh giá cơ chế bảo mật cô lập Row Level Security (RLS) của database.';
            loadingLabel = 'Đang kiểm tra sơ đồ RLS...';
        }

        setActivePrompt(loadingLabel);

        try {
            // 1. Gọi API local để lấy ngữ cảnh an ninh thực tế
            const res = await fetch('/api/admin/security/copilot-context');
            const data = await res.json();
            
            // 2. Chuyển đổi dữ liệu thực tế thành chuỗi XML/JSON context cô đọng
            const contextString = JSON.stringify({
                stats_last24h_logs: data.stats?.last24hLogs || 0,
                stats_delete_ops_24h: data.stats?.deleteCount24h || 0,
                stats_active_users_24h: data.stats?.activeUsers24h || 0,
                stats_rls_coverage: data.stats?.rlsCoverage || { percentage: 93 },
                stats_anomalies_count: data.stats?.anomalyCount || 0,
                stats_noisy_neighbors: data.stats?.rateLimitHits || [],
                recent_immutable_logs: data.recentLogs?.map((l: any) => ({
                    time: l.created_at,
                    email: l.user_email,
                    action: l.action,
                    table: l.table_name,
                    ip: l.ip_address
                })).slice(0, 5)
            });

            // 3. Gửi lên Edge Function kèm ngữ cảnh
            await sendMessageToAI(promptText, contextString, isReport);

        } catch (err) {
            console.error('Failed to fetch copilot context:', err);
            // Fallback gửi prompt thường không kèm context thực
            await sendMessageToAI(promptText, undefined, isReport);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-inter">
            {/* 1. Floating Action Button (FAB) */}
            {!isOpen && (
                <button
                    onClick={() => {
                        setIsOpen(true);
                        setHasNewAlert(false);
                    }}
                    className={`relative p-4 rounded-full bg-slate-900 border border-slate-700/60 text-amber-400 shadow-[0_0_30px_-5px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_0px_rgba(245,158,11,0.6)] hover:border-amber-400 transition-all duration-300 transform hover:scale-110 flex items-center justify-center group ${
                        hasNewAlert ? 'animate-bounce border-rose-500 shadow-[0_0_30px_-5px_rgba(244,63,94,0.5)]' : ''
                    }`}
                >
                    {hasNewAlert ? (
                        <>
                            <span className="absolute -top-1 -right-1 flex h-5 w-5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-5 w-5 bg-rose-500 text-[9px] font-black text-white items-center justify-center">!</span>
                            </span>
                            <ShieldAlert className="w-7 h-7 text-rose-400 animate-pulse" />
                        </>
                    ) : (
                        <div className="relative">
                            <Bot className="w-7 h-7 text-amber-400 group-hover:rotate-12 transition-transform" />
                            <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1.5 -right-1.5 animate-pulse" />
                        </div>
                    )}
                </button>
            )}

            {/* 2. Chat Box Window */}
            {isOpen && (
                <div className="w-[420px] h-[600px] bg-slate-950/95 dark:bg-slate-950/90 backdrop-blur-3xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-[0_0_80px_-15px_rgba(245,158,11,0.35)] flex flex-col transition-all duration-300 transform scale-100 origin-bottom-right">
                    {/* Header */}
                    <div className="p-4 bg-slate-900 border-b border-slate-800/60 flex items-center justify-between relative overflow-hidden shrink-0">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl"></div>
                        <div className="flex items-center gap-2.5 relative z-10">
                            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                <Shield className="w-5 h-5 text-amber-400 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black tracking-wide text-amber-200 uppercase">AI Security Copilot</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active SecOps Agent v2.5</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* 🛡️ ACTIVE DEFENSE CONTROL SWITCH */}
                        <div className="flex items-center gap-2 bg-slate-950/60 p-1 px-2.5 rounded-xl border border-slate-800 shrink-0">
                            <span className="text-[9px] font-black tracking-wider uppercase text-slate-400">Auto Defense</span>
                            <button
                                onClick={() => {
                                    setIsAutoDefense(!isAutoDefense);
                                    toast.success(isAutoDefense ? 'Đã tắt tự động phòng thủ.' : '🛡️ Đã kích hoạt Chế độ AI Tự động Phòng thủ chủ động (Active Defense).');
                                }}
                                className={`w-8 h-4 rounded-full relative transition-all duration-300 border ${
                                    isAutoDefense 
                                        ? 'bg-rose-500 border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]' 
                                        : 'bg-slate-800 border-slate-700'
                                }`}
                            >
                                <span className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all duration-300 ${
                                    isAutoDefense ? 'right-0.5' : 'left-0.5'
                                }`}></span>
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="relative z-50 p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors shrink-0 pointer-events-auto cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-slate-950/50">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col justify-center items-center text-center p-4">
                                <div className="p-4 rounded-3xl bg-amber-500/5 border border-amber-500/10 mb-4 animate-pulse relative">
                                    <Bot className="w-12 h-12 text-amber-400" />
                                    {isAutoDefense && (
                                        <Shield className="w-5 h-5 text-rose-500 absolute -top-1 -right-1 animate-pulse" />
                                    )}
                                </div>
                                <h4 className="text-sm font-bold text-amber-100 mb-1">Tác tử An ninh AI chủ động sẵn sàng</h4>
                                <p className="text-xs text-slate-400 max-w-[320px] mb-6">
                                    Đã đồng bộ hóa với hệ thống giám sát an ninh (SOC) và kiểm toán (WORM). Tôi có thể tự phòng thủ (Khóa user) và phân tích dự đoán an ninh.
                                </p>

                                {/* Quick Prompts Grid */}
                                <div className="grid grid-cols-2 gap-2.5 w-full">
                                    <button
                                        onClick={() => handleQuickPrompt('summary')}
                                        className="p-3 text-left rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:bg-amber-500/5 hover:border-amber-500/30 transition-all duration-300 text-[11px] group"
                                    >
                                        <div className="flex items-center gap-1.5 text-amber-400 font-black mb-1">
                                            <Activity className="w-3.5 h-3.5" />
                                            <span>Báo cáo hoạt động</span>
                                        </div>
                                        <span className="text-slate-400 group-hover:text-slate-300 text-[10px] block">Tình trạng hệ thống SOC 24h</span>
                                    </button>

                                    <button
                                        onClick={() => handleQuickPrompt('logs')}
                                        className="p-3 text-left rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:bg-amber-500/5 hover:border-amber-500/30 transition-all duration-300 text-[11px] group"
                                    >
                                        <div className="flex items-center gap-1.5 text-rose-400 font-black mb-1">
                                            <Terminal className="w-3.5 h-3.5" />
                                            <span>Quét logs tự vệ</span>
                                        </div>
                                        <span className="text-slate-400 group-hover:text-slate-300 text-[10px] block">Quét log & đề xuất chặn kẻ xấu</span>
                                    </button>

                                    <button
                                        onClick={() => handleQuickPrompt('predict')}
                                        className="p-3 text-left rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:bg-amber-500/5 hover:border-amber-500/30 transition-all duration-300 text-[11px] group"
                                    >
                                        <div className="flex items-center gap-1.5 text-purple-400 font-black mb-1">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            <span>Dự báo an ninh</span>
                                        </div>
                                        <span className="text-slate-400 group-hover:text-slate-300 text-[10px] block">Đề xuất phòng thủ ISO 27001</span>
                                    </button>

                                    <button
                                        onClick={() => handleQuickPrompt('rls')}
                                        className="p-3 text-left rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:bg-amber-500/5 hover:border-amber-500/30 transition-all duration-300 text-[11px] group"
                                    >
                                        <div className="flex items-center gap-1.5 text-emerald-400 font-black mb-1">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            <span>Kiểm tra RLS</span>
                                        </div>
                                        <span className="text-slate-400 group-hover:text-slate-300 text-[10px] block">Đánh giá an toàn Database</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            messages.map((m) => (
                                <div key={m.id} className="space-y-2">
                                    <div className={`flex ${m.isUser ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                                                m.isUser
                                                    ? 'bg-amber-500 text-slate-950 font-bold rounded-tr-none'
                                                    : 'bg-slate-900/80 border border-slate-800/60 text-slate-100 rounded-tl-none shadow-md'
                                            }`}
                                        >
                                            <p className="whitespace-pre-line">{m.text}</p>
                                            
                                            {m.isStreaming && (
                                                <span className="inline-flex gap-0.5 ml-1">
                                                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></span>
                                                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                                </span>
                                            )}

                                            {/* Action Nút Tải Báo cáo (Nếu tin nhắn là Báo cáo an ninh) */}
                                            {!m.isStreaming && m.isReport && m.text.length > 200 && (
                                                <div className="mt-3 pt-2">
                                                    <button
                                                        onClick={() => downloadReport(m.text)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 hover:border-amber-500/40 rounded-xl transition-all font-bold text-[10px]"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                        Xuất báo cáo Markdown (.md)
                                                    </button>
                                                </div>
                                            )}

                                            {/* Citations Card */}
                                            {!m.isStreaming && m.citations && m.citations.length > 0 && (
                                                <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5">
                                                    <div className="text-[10px] text-amber-400 font-black uppercase tracking-wider flex items-center gap-1">
                                                        <Shield className="w-3 h-3" />
                                                        <span>Nguồn chính sách liên kết:</span>
                                                    </div>
                                                    {m.citations.map((c, idx) => (
                                                        <div key={idx} className="text-[10px] text-slate-400 font-medium bg-slate-950/60 p-2 rounded-xl border border-slate-800/50">
                                                            📖 {c.text}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 🛡️ ACTIVE DEFENSE INTERACTIVE ACTION CARD */}
                                    {!m.isStreaming && m.suggestedAction && (
                                        <div className={`flex justify-start pl-2`}>
                                            <div className="max-w-[85%] w-full p-4.5 rounded-2xl bg-rose-500/5 border border-rose-500/20 shadow-[0_0_15px_-3px_rgba(244,63,94,0.15)] space-y-3 animate-pulse">
                                                <div className="flex items-center gap-2 text-rose-400">
                                                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                                                    <span className="text-xs font-black uppercase tracking-wider">AI Active Defense Suggestion</span>
                                                </div>
                                                
                                                <p className="text-[11px] text-slate-300 leading-relaxed">
                                                    Hệ thống phát hiện tài khoản <span className="font-bold text-rose-300 font-mono">{m.suggestedAction.userEmail}</span> có hành vi truy cập bất thường nghiêm trọng.
                                                </p>

                                                {m.suggestedAction.executed ? (
                                                    <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-400">
                                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                                        <span>{m.suggestedAction.message}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => executeForceLogout(m.suggestedAction!.userEmail, m.id)}
                                                            disabled={isDefending}
                                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all text-[10px] shadow-lg shadow-rose-950/30"
                                                        >
                                                            {isDefending ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            ) : (
                                                                <LogOut className="w-3.5 h-3.5" />
                                                            )}
                                                            Ép đăng xuất & Khóa ngay
                                                        </button>
                                                        
                                                        <button
                                                            onClick={() => {
                                                                setMessages(prev => prev.map(msg => msg.id === m.id ? { ...msg, suggestedAction: undefined } : msg));
                                                                toast.info('Bỏ qua đề xuất an ninh.');
                                                            }}
                                                            className="px-3 py-2 border border-slate-800 hover:bg-slate-900 text-slate-400 rounded-xl transition-all text-[10px]"
                                                        >
                                                            Bỏ qua
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Active Prompt Info Block */}
                    {activePrompt && (
                        <div className="px-4 py-2 bg-amber-500/10 border-t border-b border-amber-500/20 text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-2 shrink-0">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>{activePrompt}</span>
                        </div>
                    )}

                    {/* Input Footer */}
                    <form
                        onSubmit={handleSend}
                        className="p-3 bg-slate-900/60 border-t border-slate-800/60 flex gap-2 shrink-0 items-center"
                    >
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={isAutoDefense ? "🛡️ Auto Defense đang trực chiến..." : "Hỏi bất kỳ điều gì về an ninh dự án..."}
                            disabled={isLoading}
                            className="flex-1 bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-amber-500/65 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !inputValue.trim()}
                            className="p-2 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 hover:scale-105 active:scale-95 disabled:bg-slate-800 disabled:text-slate-500 disabled:scale-100 transition-all flex items-center justify-center shrink-0"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
