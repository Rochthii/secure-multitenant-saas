import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

const getSupabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const getSupabaseAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export interface ChatMessage {
    id: string;
    text: string;
    isUser: boolean;
    isStreaming?: boolean;
    isError?: boolean;
    errorCode?: string;
    citations?: any[];
}

export interface ChatSession {
    id: string;
    title: string;
    created_at: string;
    is_pinned: boolean;
    message_count: number;
}

export interface UseWebRagReturn {
    messages: ChatMessage[];
    sessions: ChatSession[];
    sessionId: string | null;
    isLoading: boolean;
    sendMessage: (text: string) => Promise<void>;
    retryLastMessage: () => Promise<void>;
    stopGeneration: () => void;
    createNewSession: () => Promise<void>;
    switchSession: (id: string) => void;
    renameSession: (id: string, newTitle: string) => Promise<void>;
    togglePin: (id: string) => Promise<void>;
    deleteSession: (id: string) => Promise<void>;
    submitNegativeFeedback: (query: string, answer: string) => Promise<void>;
    messageCount: number;
}

export const useWebRag = (tenantId?: string): UseWebRagReturn => {
    const supabase = createClient();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const loadSessions = useCallback(async () => {
        const { data: { session: authSession } } = await supabase.auth.getSession();
        if (!authSession) return;

        const { data, error } = await (supabase as any).rpc('get_active_chat_sessions_v2', {
            p_user_id: authSession.user.id,
            p_tenant_id: tenantId || 'GLOBAL'
        });

        if (!error && data) {
            setSessions(data);
            if (!sessionId && data.length > 0) setSessionId(data[0].id);
        }
    }, [supabase, tenantId, sessionId]);

    const loadMessages = useCallback(async (sid: string) => {
        const { data, error } = await (supabase as any)
            .from('chat_messages' as any)
            .select('id, content, is_user, created_at, metadata')
            .eq('session_id', sid)
            .order('created_at', { ascending: true });

        if (!error && data) {
            setMessages((data as any[]).map((m: any) => ({
                id: m.id,
                text: m.content,
                isUser: m.is_user,
                citations: m.metadata?.citations
            })));
        }
    }, [supabase]);

    useEffect(() => { loadSessions(); }, [loadSessions]);
    useEffect(() => {
        if (sessionId) loadMessages(sessionId);
        else setMessages([]);
    }, [sessionId, loadMessages]);

    const createNewSession = useCallback(async () => {
        const { data: { session: authSession } } = await supabase.auth.getSession();
        if (!authSession) return;
        const { data, error } = await (supabase as any).rpc('create_chat_session_v2', {
            p_tenant_id: tenantId || 'GLOBAL',
            p_user_id: authSession.user.id
        });
        if (!error && data) {
            setSessionId(data);
            await loadSessions();
        }
    }, [supabase, tenantId, loadSessions]);

    const switchSession = (id: string) => setSessionId(id);

    const renameSession = useCallback(async (id: string, newTitle: string) => {
        await (supabase as any).rpc('rename_chat_session', { p_session_id: id, p_new_title: newTitle.substring(0, 50) });
        await loadSessions();
    }, [supabase, loadSessions]);

    const togglePin = useCallback(async (id: string) => {
        await (supabase as any).rpc('toggle_pin_chat_session', { p_session_id: id });
        await loadSessions();
    }, [supabase, loadSessions]);

    const deleteSession = useCallback(async (id: string) => {
        await (supabase as any).rpc('delete_chat_session', { p_session_id: id });
        if (sessionId === id) setSessionId(null);
        await loadSessions();
    }, [supabase, sessionId, loadSessions]);

    const submitNegativeFeedback = useCallback(async (query: string, answer: string) => {
        const { data: { session: authSession } } = await supabase.auth.getSession();
        if (!authSession) return;
        await (supabase as any).from('ai_low_quality_logs' as any).insert([{
            session_id: sessionId,
            tenant_id: tenantId || 'GLOBAL',
            user_query: query,
            llm_answer: answer,
            status: 'PENDING'
        }]);
    }, [supabase, sessionId]);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim()) return;
        const userMsgId = Date.now().toString();
        const aiMsgId = (Date.now() + 1).toString();

        try {
            const { data: { session: authSession } } = await supabase.auth.getSession();
            
            let currentSessionId = sessionId;
            if (!currentSessionId) {
                const { data: newId, error: rpcError } = await (supabase as any).rpc('create_chat_session_v2', {
                    p_tenant_id: tenantId || 'GLOBAL',
                    p_user_id: authSession?.user?.id ?? null
                });
                if (!rpcError && newId) {
                    currentSessionId = newId;
                    setSessionId(newId);
                } else {
                    console.error('Session creation failed:', rpcError);
                    throw new Error(`SESSION_ERROR: ${rpcError?.message || 'Failed to create session'}`);
                }
            }

            const currentSession = sessions.find((s: ChatSession) => s.id === currentSessionId);
            if (currentSession && (!currentSession.title || currentSession.title === 'Cuộc trò chuyện mới' || currentSession.message_count === 0)) {
                renameSession(currentSessionId as string, text);
            }

            if (abortControllerRef.current) abortControllerRef.current.abort();
            abortControllerRef.current = new AbortController();
            setMessages((prev: ChatMessage[]) => [...prev, { id: userMsgId, text, isUser: true }, { id: aiMsgId, text: '', isUser: false, isStreaming: true }]);
            setIsLoading(true);

            const sUrl = getSupabaseUrl();
            const sKey = getSupabaseAnonKey();
            if (!sUrl || !sKey) {
                console.error('Supabase configuration missing:', { sUrl: !!sUrl, sKey: !!sKey });
                throw new Error('MISSING_CONFIG');
            }

            // Làm mới token trước khi gọi API, tránh gửi JWT hết hạn
            const { data: refreshedData } = await supabase.auth.refreshSession();
            const validSession = refreshedData?.session || authSession;
            const authToken = validSession?.access_token || sKey; // Fallback về anon nếu không có session

            const response = await fetch(`${sUrl.replace(/\/$/, '')}/functions/v1/rag-chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': sKey,
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ query: text, session_id: currentSessionId, tenant_id: tenantId || null }),
                signal: abortControllerRef.current?.signal
            });

            if (!response.ok) {
                const status = response.status;
                const errorText = await response.text();
                console.error(`RAG API Error (${status}):`, errorText);
                
                if (status === 401) {
                    // Không tự đăng xuất — chỉ báo lỗi phiên để người dùng tự xử lý
                    console.warn('[RAG] 401 received. Token may be invalid. Guest mode will be used on retry.');
                    throw new Error('SESSION_EXPIRED');
                }
                
                const err = new Error('FETCH_ERROR');
                (err as any).status = status;
                throw err;
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder('utf-8');
            if (!reader) throw new Error("No reader");

            let done = false; let currentText = '';
            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    const lines = decoder.decode(value, { stream: true }).split('\n');
                    for (const line of lines) {
                        if (line.trim() === '' || !line.startsWith('data: ')) continue;
                        const dataStr = line.replace('data: ', '').trim();
                        if (dataStr === '[DONE]') { done = true; break; }
                        try {
                            const parsed = JSON.parse(dataStr);
                            if (parsed.text !== undefined) {
                                currentText += parsed.text;
                                setMessages((prev: ChatMessage[]) => prev.map((m: ChatMessage) => m.id === aiMsgId ? { ...m, text: currentText } : m));
                            }
                            if (parsed.citations) {
                                setMessages((prev: ChatMessage[]) => prev.map((m: ChatMessage) => m.id === aiMsgId ? { ...m, citations: parsed.citations } : m));
                            }
                        } catch (e) {}
                    }
                }
            }
            setMessages((prev: ChatMessage[]) => prev.map((m: ChatMessage) => m.id === aiMsgId ? { ...m, isStreaming: false } : m));
            loadSessions();
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                const status = error.status;
                let msg = 'Hệ thống đang quá tải, vui lòng thử lại sau.';
                let code = 'UNKNOWN';

                if (error.message === 'SESSION_EXPIRED') {
                    msg = '⚠️ Phiên làm việc đã hết hạn. Vui lòng đăng xuất và đăng nhập lại..';
                    code = 'SESSION_EXPIRED';
                } else if (error.message === 'UNAUTHENTICATED') {
                    msg = '⚠️ Quý vị vui lòng đăng nhập để bắt đầu hỏi đáp.';
                    code = 'AUTH_REQUIRED';
                } else if (error.message === 'MISSING_CONFIG') {
                    msg = '⚠️ Cấu hình hệ thống bị thiếu sót, xin Nhân sự kiên nhẫn đợi giây lát.';
                    code = 'CONFIG_ERROR';
                } else if (status === 429) {
                    msg = '⚠️ Các Nhân sự đang hỏi đáp rất đông, xin Nhân sự vui lòng đợi trong giây lát rồi thử lại ạ.';
                    code = 'RATE_LIMIT';
                } else if (status === 403) {
                    msg = '⚠️ Cuộc hỏi đáp đã đủ duyên (50 câu). Xin mời Nhân sự mở hội thoại mới.';
                    code = 'FORBIDDEN';
                } 

                setMessages((prev: ChatMessage[]) => {
                    const exists = prev.find((m: ChatMessage) => m.id === aiMsgId);
                    if (exists) {
                        return prev.map((m: ChatMessage) => m.id === aiMsgId ? { ...m, text: msg, isStreaming: false, isError: true, errorCode: code } : m);
                    } else {
                        return [...prev, { id: aiMsgId, text: msg, isUser: false, isError: true, errorCode: code }];
                    }
                });
            }
        } finally {
            setIsLoading(false);
        }
    }, [supabase, tenantId, sessionId, sessions, loadSessions, renameSession]);

    const retryLastMessage = useCallback(async () => {
        const lastUserMsg = [...messages].reverse().find(m => m.isUser);
        if (lastUserMsg) {
            setMessages((prev: ChatMessage[]) => {
                const newMsgs = [...prev];
                while (newMsgs.length > 0 && !newMsgs[newMsgs.length-1].isUser) newMsgs.pop();
                if (newMsgs.length > 0 && newMsgs[newMsgs.length-1].isUser) newMsgs.pop();
                return newMsgs;
            });
            await sendMessage(lastUserMsg.text);
        }
    }, [messages, sendMessage]);

    const stopGeneration = useCallback(() => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
    }, []);

    return {
        messages, sessions, sessionId, isLoading,
        sendMessage, retryLastMessage, stopGeneration, createNewSession,
        switchSession, renameSession, togglePin, deleteSession,
        submitNegativeFeedback,
        messageCount: messages.length
    };
};
