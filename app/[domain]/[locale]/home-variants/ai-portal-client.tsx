"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Volume2, MessageCircle, BookOpen, Menu, X, UserCircle, Plus, Pin, Pencil, Trash2, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import DharmaChatBubble from '@/components/templates/ai-portal/dharma-chat-bubble';
import DharmaChatInput from '@/components/templates/ai-portal/dharma-chat-input';
import { useWebRag } from '@/hooks/use-web-rag';
import { TenantConfig } from '@/lib/tenant';
import { Button } from '@/components/ui/button';
import DharmaQuizPortal from '@/lib/ai-core/components/dharma-quiz-portal';
import { createClient } from '@/lib/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import DharmaAuthOverlay, { AuthView } from '@/lib/ai-core/components/dharma-auth-overlay';
import DharmaAccountOverlay from '@/lib/ai-core/components/dharma-account-overlay';
import DharmaPolicyOverlay, { PolicyView } from '@/lib/ai-core/components/dharma-policy-overlay';
import { toast } from 'sonner';

interface AiPortalClientProps {
    tenantId: string;
    domain: string;
    locale: string;
    settings: TenantConfig;
}

type PortalTab = 'chat' | 'quiz';

export default function AiPortalClient({ tenantId, domain, locale, settings }: AiPortalClientProps) {
    const { 
        messages, sessions, sessionId, isLoading, 
        sendMessage, retryLastMessage, stopGeneration, createNewSession, 
        switchSession, renameSession, togglePin, deleteSession,
        submitNegativeFeedback,
        messageCount 
    } = useWebRag(tenantId);
    
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<PortalTab>('chat');
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');

    // Auth State
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [authForceView, setAuthForceView] = useState<AuthView | undefined>(undefined);
    const [isAccountOpen, setIsAccountOpen] = useState(false);

    // Mobile sidebar drawer
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Policy State
    const [isPolicyOpen, setIsPolicyOpen] = useState(false);
    const [policyView, setPolicyView] = useState<PolicyView>('tos');
    const [accountInitialTab, setAccountInitialTab] = useState<'profile' | 'security' | 'system'>('profile');

    const openPolicy = (view: PolicyView) => {
        setPolicyView(view);
        setIsPolicyOpen(true);
    };

    const openAccount = (tab: 'profile' | 'security' | 'system') => {
        setAccountInitialTab(tab);
        setIsAccountOpen(true);
    };

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);

            if (event === 'PASSWORD_RECOVERY') {
                setAuthForceView('update_password');
                setIsAuthOpen(true);
            } else if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
                const isRecovery = window.location.hash.includes('type=recovery');
                if (!isRecovery) {
                    setIsAuthOpen(false);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Theo dõi vị trí cuộn
    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            setIsAtBottom(scrollHeight - scrollTop <= clientHeight + 150);
        }
    };

    // Auto-scroll thông minh
    useEffect(() => {
        if (activeTab !== 'chat') return;
        
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage) return;

        // Nếu người dùng vừa gửi tin nhắn -> cuộn mượt xuống cuối ngay lập tức
        if (lastMessage.isUser) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        // Nếu AI đang stream/render và người dùng đang ở cuối trang
        if (isAtBottom) {
            if (lastMessage.isStreaming) {
                // Đang stream thì cuộn thẳng (auto) để không bị lag do gọi smooth liên tục
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
                }
            } else {
                // Xong stream thì cuộn mượt 1 lần cuối
                chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [messages, activeTab, isAtBottom]);

    // Đóng mobile menu khi chuyển tab
    const handleTabChange = (tab: PortalTab) => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false);
    };

    // Branding logic: Phân biệt giữa Chi nhánh cụ thể và Hệ thống toàn cầu
    const isGlobalMode = tenantId === 'GLOBAL' || tenantId === '55555555-5555-5555-5555-555555555555';
    const portalName = isGlobalMode 
        ? "AI Copilot - Trợ lý AI Doanh nghiệp" 
        : (settings.name || "AI Copilot");

    const title = portalName;

    // Wrapper để bắt sự kiện gửi tin nhắn — Kiểm tra Auth trước khi gửi
    const handleSendMessage = async (text: string) => {
        try {
            await sendMessage(text);
        } catch (error: any) {
            console.error('Chat Error:', error);
            if (error.message === 'SESSION_EXPIRED') {
                toast.error('Phiên đăng nhập hết hạn. Quý vị vui lòng đăng xuất và đăng nhập lại để tiếp tục.', {
                    duration: 5000,
                    action: {
                        label: 'Đăng xuất',
                        onClick: () => { /* Trigger logout logic if available */ }
                    }
                });
            } else {
                toast.error('Có lỗi xảy ra khi gửi tin nhắn. Quý vị vui lòng thử lại sau.');
            }
        }
    };

    // ── Sidebar Content (dùng chung desktop & mobile drawer) ──────────────
    const SidebarContent = () => (
        <>
            {/* Tab Switcher */}
            <div className="p-3 border-b border-stone-200/30">
                <div className="flex gap-1 bg-stone-100/80 rounded-xl p-1">
                    <button
                        onClick={() => handleTabChange('chat')}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all',
                            activeTab === 'chat'
                                ? 'bg-white text-stone-800 shadow-sm'
                                : 'text-stone-500 hover:text-stone-700'
                        )}
                    >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Hỏi Đáp
                    </button>
                    <button
                        onClick={() => handleTabChange('quiz')}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all',
                            activeTab === 'quiz'
                                ? 'bg-white text-amber-800 shadow-sm'
                                : 'text-stone-500 hover:text-stone-700'
                        )}
                    >
                        <BookOpen className="w-3.5 h-3.5" />
                        Trắc Nghiệm
                    </button>
                </div>
            </div>

            {/* Sidebar body */}
            {activeTab === 'chat' && (
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
                    <Button 
                        onClick={createNewSession}
                        variant="outline" 
                        className="w-full justify-start gap-2 mb-4 border-stone-200 bg-white hover:bg-stone-50 text-stone-700 rounded-xl h-10 shadow-sm"
                    >
                        <Plus className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-semibold">Cuộc trò chuyện mới</span>
                    </Button>

                    <div className="flex items-center justify-between px-2 mb-2">
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Hội thoại gần đây</p>
                        <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full font-mono">
                            {sessions.length}/{user ? 5 : 1}
                        </span>
                    </div>
                    
                    <div className="space-y-1">
                        {sessions.map((s) => (
                            <div 
                                key={s.id}
                                className={cn(
                                    "group relative flex flex-col p-2.5 rounded-xl cursor-pointer transition-all border",
                                    sessionId === s.id 
                                        ? "bg-white border-amber-200/50 shadow-sm ring-1 ring-amber-100/50" 
                                        : "border-transparent hover:bg-stone-100/60 hover:border-stone-200/40"
                                )}
                                onClick={() => switchSession(s.id)}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    {editingSessionId === s.id ? (
                                        <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                            <input 
                                                autoFocus
                                                value={newTitle}
                                                onChange={(e) => setNewTitle(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') { renameSession(s.id, newTitle); setEditingSessionId(null); }
                                                    if (e.key === 'Escape') setEditingSessionId(null);
                                                }}
                                                className="flex-1 bg-white border border-amber-300 rounded px-1.5 py-0.5 text-xs outline-none"
                                            />
                                            <button onClick={() => { renameSession(s.id, newTitle); setEditingSessionId(null); }} className="text-green-600">
                                                <Check className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className={cn(
                                            "flex-1 text-xs truncate transition-colors",
                                            sessionId === s.id ? "font-bold text-stone-800" : "text-stone-600"
                                        )}>
                                            {s.title || "Cuộc trò chuyện mới"}
                                        </span>
                                    )}
                                    
                                    <div className={cn(
                                        "flex items-center gap-1 transition-opacity",
                                        sessionId === s.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                    )}>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); togglePin(s.id); }}
                                            className={cn("p-1 rounded-md hover:bg-stone-200 transition-colors", s.is_pinned ? "text-amber-600" : "text-stone-400")}
                                        >
                                            <Pin className="w-3 h-3" fill={s.is_pinned ? "currentColor" : "none"} />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setEditingSessionId(s.id); setNewTitle(s.title); }}
                                            className="p-1 rounded-md hover:bg-stone-200 text-stone-400 transition-colors"
                                        >
                                            <Pencil className="w-3 h-3" />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                                            className="p-1 rounded-md hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-1.5 px-0.5">
                                    <span className="text-[9px] text-stone-400 uppercase">
                                        {s.message_count || 0}/50 CÂU
                                    </span>
                                    {s.is_pinned && <span className="text-[8px] bg-amber-50 text-amber-700 px-1 rounded font-bold">ĐÃ GHIM</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {activeTab === 'quiz' && (
                <div className="flex-1 p-4">
                    <p className="text-xs text-stone-400 font-medium px-2 py-2 uppercase tracking-wider">Hướng dẫn</p>
                    <div className="space-y-2 text-xs text-stone-500 px-2 leading-relaxed">
                        <p>① Chọn phòng ban và quy trình chuyên môn.</p>
                        <p>② AI sẽ tự sinh câu hỏi từ kho tài liệu bảo mật.</p>
                        <p>③ Chọn đáp án và xem giải thích ngay.</p>
                        <p>④ Câu hỏi được Phòng Tuân thủ (Compliance) kiểm duyệt để đảm bảo chính xác.</p>
                    </div>
                </div>
            )}

            {/* Bottom Auth */}
            <div className="p-4 border-t border-stone-200/50 space-y-2">
                {user ? (
                    <button
                        onClick={() => { openAccount('profile'); setIsMobileMenuOpen(false); }}
                        className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-stone-200/60 rounded-xl hover:bg-stone-50 transition shadow-sm text-left group"
                    >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0 border border-amber-200/50">
                                <span className="text-amber-800 font-lora font-bold text-sm">
                                    {(user.user_metadata?.full_name || user.email || '?').charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex flex-col truncate">
                                <span className="text-sm font-bold text-[#1C1C1A] font-lora truncate tracking-tight">
                                    {user.user_metadata?.full_name || 'Nhân Sự'}
                                </span>
                                <span className="text-[10px] text-stone-400 uppercase tracking-wider">Hồ sơ nhân sự</span>
                            </div>
                        </div>
                    </button>
                ) : (
                    <Button
                        variant="default"
                        className="w-full justify-start bg-[#1C1917] hover:bg-[#2D2A26] text-[#FAF4EB] rounded-xl shadow-md h-11"
                        onClick={() => { setIsAuthOpen(true); setIsMobileMenuOpen(false); }}
                    >
                        <UserCircle className="w-4 h-4 mr-2" />
                        Đăng nhập Nhân sự
                    </Button>
                )}
                <Button
                    variant="ghost"
                    className="w-full justify-start text-stone-500 hover:text-stone-800 hover:bg-stone-200/40 rounded-xl h-11"
                    onClick={() => { openAccount('system'); setIsMobileMenuOpen(false); }}
                >
                    <Settings className="w-4 h-4 mr-2" />
                    Cài đặt
                </Button>
            </div>
        </>
    );

    return (
        <div
            className="fixed inset-0 z-[100] flex w-full h-[100dvh] bg-[#FDFBF7] text-stone-800 font-manrope selection:bg-amber-200 selection:text-amber-900 overflow-hidden"
            style={{ colorScheme: 'light' }}
        >
            {/* Background textures */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-multiply"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-amber-50/80 rounded-full blur-[140px] opacity-60 pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-50/60 rounded-full blur-[120px] opacity-50 pointer-events-none" />

            {/* ── DESKTOP SIDEBAR (Floating Glass Panel) ─────────────────────────────────────────── */}
            <aside className="hidden lg:flex flex-col w-[280px] my-4 ml-4 rounded-[28px] border border-white/60 bg-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-2xl z-10 relative shrink-0 overflow-hidden">
                <div className="p-6 pt-8 border-b border-stone-200/30 flex flex-col items-start justify-center relative">
                    <a href={`/${locale}`} className="absolute top-8 right-6 text-stone-400 hover:text-amber-700 transition bg-white/50 p-1.5 rounded-full" title="Trở về Trang chủ">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </a>
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-800 shadow-lg shadow-amber-900/20">
                            {isGlobalMode ? (
                                <BookOpen className="h-5 w-5 text-amber-50" />
                            ) : settings.logo_url ? (
                                <img src={settings.logo_url} alt="Logo" className="h-6 w-6 object-contain brightness-0 invert" />
                            ) : (
                                <MessageCircle className="h-5 w-5 text-amber-50" />
                            )}
                        </div>
                        <div>
                            <h1 className="font-lora text-xl font-bold text-[#1C1C1A] tracking-tight">{isGlobalMode ? "AI Copilot" : settings.name}</h1>
                            <p className="text-[10px] text-stone-500 mt-0.5 uppercase tracking-widest font-semibold">Trí Tuệ Nhân Tạo</p>
                        </div>
                    </div>
                </div>
                <SidebarContent />
            </aside>

            {/* ── MOBILE SIDEBAR (Bottom Sheet) ───────────────────────────────────── */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="lg:hidden fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40"
                        />
                        {/* Drawer panel */}
                        <motion.div
                            key="drawer"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
                            className="lg:hidden fixed left-0 right-0 bottom-0 max-h-[85vh] bg-[#FDFBF7] z-50 flex flex-col shadow-[0_-8px_40px_rgba(0,0,0,0.12)] rounded-t-[32px] border-t border-white/80"
                        >
                            {/* Drawer header / Handle */}
                            <div className="flex justify-center pt-3 pb-1 shrink-0">
                                <div className="w-12 h-1.5 bg-stone-300/50 rounded-full" />
                            </div>
                            <div className="px-6 pb-4 pt-2 border-b border-stone-200/40 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-800 shadow-lg shadow-amber-900/20">
                                        {isGlobalMode ? (
                                            <BookOpen className="h-5 w-5 text-amber-50" />
                                        ) : settings.logo_url ? (
                                            <img src={settings.logo_url} alt="Logo" className="h-6 w-6 object-contain brightness-0 invert" />
                                        ) : (
                                            <MessageCircle className="h-5 w-5 text-amber-50" />
                                        )}
                                    </div>
                                    <div>
                                        <h1 className="font-lora text-xl font-bold text-[#1C1C1A] tracking-tight">{isGlobalMode ? "AI Copilot" : settings.name}</h1>
                                        <p className="text-[10px] text-stone-500 mt-0.5 uppercase tracking-widest font-semibold">Trí Tuệ Nhân Tạo</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a href={`/${locale}`} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors" title="Trở về Trang chủ">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                    </a>
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <SidebarContent />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── MAIN AREA ────────────────────────────────────────────────── */}
            <main className="flex-1 flex flex-col relative z-20 min-h-0 overflow-hidden">

                {/* Mobile Header — compact & glass */}
                <header 
                    className="flex items-center justify-between border-b border-stone-200/20 bg-white/40 backdrop-blur-xl shrink-0 z-30 relative lg:hidden"
                    style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(60px + env(safe-area-inset-top))' }}
                >
                    <div className="flex items-center gap-3 px-4">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsMobileMenuOpen(true); }}
                            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/60 text-stone-700 transition-all active:scale-95 shadow-sm border border-stone-200/50"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h2 className="text-sm font-bold text-[#1C1C1A] lg:text-base truncate font-lora">
                            {portalName}
                        </h2>
                    </div>

                    {/* Auth avatar / login shortcut */}
                    <button
                        onClick={() => { if (user) openAccount('profile'); else setIsAuthOpen(true); }}
                        className="w-10 h-10 mr-4 flex items-center justify-center rounded-xl hover:bg-stone-200/60 transition-colors relative"
                    >
                        {user ? (
                            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center border border-amber-200/60 shadow-sm">
                                <span className="text-[12px] text-amber-800 font-bold font-lora">
                                    {(user.user_metadata?.full_name || user.email || '?').charAt(0).toUpperCase()}
                                </span>
                            </div>
                        ) : (
                            <div className="relative">
                                <UserCircle className="w-6 h-6 text-stone-500" />
                                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
                            </div>
                        )}
                    </button>
                </header>

                {/* ── TAB CONTENT ───────────────────────────────────────── */}
                <AnimatePresence mode="wait">
                    {activeTab === 'chat' && (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="flex-1 flex flex-col min-h-0 overflow-hidden"
                        >
                            {/* Messages */}
                            <div
                                ref={scrollContainerRef}
                                onScroll={handleScroll}
                                className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
                            >
                                <div className="max-w-4xl mx-auto w-full px-4 md:px-6 pt-16 md:pt-20 pb-4 flex flex-col gap-6 md:gap-8">
                                    {messages.length === 0 ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className="flex flex-col items-center justify-center min-h-[40vh] text-center mt-8 md:mt-16"
                                        >
                                            <div className="w-16 h-16 rounded-full border border-amber-200/50 bg-gradient-to-br from-amber-50 to-amber-100/30 shadow-inner flex items-center justify-center mb-6 relative">
                                                <div className="absolute inset-0 bg-white/40 rounded-full blur-[2px]" />
                                                <Volume2 className="w-7 h-7 text-amber-700/70 relative z-10" />
                                            </div>
                                            <h2 className="font-lora text-2xl md:text-[32px] text-[#1C1C1A] mb-3 font-semibold tracking-tight">
                                                Kính chào Quý Nhân sự
                                            </h2>
                                            <p className="text-stone-500 max-w-sm mx-auto text-[14px] leading-relaxed">
                                                AI Copilot ở đây để cùng quý vị đàm đạo. Quý vị có thể đặt câu hỏi về quy định công ty, quy trình bảo mật hoặc chính sách nội bộ.
                                            </p>
                                        </motion.div>
                                    ) : (
                                        <AnimatePresence initial={false}>
                                            {messages.map((msg, index) => (
                                                <DharmaChatBubble
                                                    key={msg.id}
                                                    message={msg}
                                                    isLatest={index === messages.length - 1}
                                                    onRetry={msg.isError ? retryLastMessage : undefined}
                                                    onNegativeFeedback={
                                                        !msg.isUser && !msg.isStreaming && !msg.isError
                                                            ? () => {
                                                                const userMsg = messages[index - 1];
                                                                submitNegativeFeedback(
                                                                    userMsg?.text || '',
                                                                    msg.text
                                                                );
                                                            }
                                                            : undefined
                                                    }
                                                />
                                            ))}
                                        </AnimatePresence>
                                    )}
                                    <div ref={chatEndRef} className="h-1" />
                                </div>
                            </div>

                             {/* ── INPUT AREA — Floating Style ─────────────────── */}
                             <div
                                 className="shrink-0 w-full bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/95 to-transparent pt-6 pb-4 px-4 md:px-8"
                                 style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
                             >
                                 <div className="max-w-4xl mx-auto w-full flex flex-col gap-2 relative">
                                     <div className="relative">
                                         <DharmaChatInput
                                             onSendMessage={handleSendMessage}
                                             disabled={isLoading || messageCount >= 100}
                                             onStop={stopGeneration}
                                             isStreaming={isLoading}
                                         />
                                         {messageCount >= 90 && (
                                            <div className="absolute -top-10 left-0 right-0 flex justify-center">
                                                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[10px] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Sắp đạt giới hạn 50 câu ({Math.round(messageCount/2)}/50). Hãy ghim hoặc mở hội thoại mới.
                                                </div>
                                            </div>
                                         )}
                                     </div>
                                     {/* Single-line footer — không còn rối rắm */}
                                     <div className="flex items-center justify-between gap-3 text-[10px] text-stone-400 px-1">
                                         <div className="flex items-center gap-3">
                                            <span>AI có thể sai — hãy đối chiếu tài liệu gốc</span>
                                            <span className="h-2.5 w-px bg-stone-300" />
                                            <button onClick={() => openPolicy('tos')} className="hover:text-amber-700 transition-colors underline underline-offset-2">Điều khoản</button>
                                         </div>
                                         <div className="font-mono font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                                             {Math.floor(messageCount/2)}/50
                                         </div>
                                     </div>
                                 </div>
                             </div>
                        </motion.div>
                    )}

                    {activeTab === 'quiz' && (
                        <motion.div
                            key="quiz"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="flex-1 overflow-y-auto"
                        >
                            <DharmaQuizPortal tenantId={tenantId} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Policy Overlay */}
                <DharmaPolicyOverlay
                    isOpen={isPolicyOpen}
                    view={policyView}
                    onClose={() => setIsPolicyOpen(false)}
                />
            </main>

            {/* Auth Overlay */}
            <DharmaAuthOverlay
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                onSuccess={() => setIsAuthOpen(false)}
                initialView={authForceView}
            />

            {/* Account Settings Overlay */}
            <DharmaAccountOverlay
                isOpen={isAccountOpen}
                onClose={() => setIsAccountOpen(false)}
                user={user}
                initialTab={accountInitialTab}
            />
        </div>
    );
}
