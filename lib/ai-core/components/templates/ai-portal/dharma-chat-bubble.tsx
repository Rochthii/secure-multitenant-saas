/**
 * COPYRIGHT (C) 2026 - DHARMA CHAT RAG ENGINE
 * JOINT INTELLECTUAL PROPERTY:
 * - Technical Implementation: SaaS Project Owner
 * - Content curation & Academic metadata: Content Lead
 * 
 * This component defines the premium "Dho Paper" visual identity and 
 * interaction model for the standalone AI RAG interface.
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, BookOpen, Copy, CheckCheck, RefreshCcw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/hooks/use-web-rag';
import { Button } from '@/components/ui/button';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Citation {
    id: string;
    text: string;
    content: string;
}

interface CitationDoc {
    document_title?: string;
    content?: string;
    category_name?: string;
    similarity?: number;
}

interface DharmaChatBubbleProps {
    message: ChatMessage;
    isLatest?: boolean;
    onNegativeFeedback?: () => void;
    onRetry?: () => void;
}

export default function DharmaChatBubble({ message, isLatest = false, onNegativeFeedback, onRetry }: DharmaChatBubbleProps) {
    const isUser = message.isUser;
    const [copied, setCopied] = useState(false);
    const [feedbackSent, setFeedbackSent] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(message.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleNegativeFeedback = async () => {
        if (!onNegativeFeedback || feedbackSent) return;
        onNegativeFeedback();
        setFeedbackSent(true);
    };

    if (isUser) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex w-full justify-end px-4 md:px-0 mb-4"
            >
                <div className="max-w-[85%] md:max-w-[70%] ml-auto">
                    <div className="inline-block text-left bg-gradient-to-b from-[#F9F6F0] to-[#F3EFE6] border border-[#E8E2D2] text-[#1C1C1A] px-5 py-3.5 rounded-[24px] rounded-tr-[6px] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_10px_rgba(0,0,0,0.02)]">
                        <p className="text-[15px] font-medium leading-relaxed font-manrope whitespace-pre-wrap">{message.text}</p>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Citations có thể là string[] hoặc Citation { id, text, content }[]
    const normalizedCitations: CitationDoc[] = (message.citations || []).map((c: any) => {
        if (typeof c === 'string') return { document_title: c };
        // Map 'text' từ server sang 'document_title' của UI
        return { 
            document_title: c.text || c.document_title || "Tài liệu RAG",
            content: c.content,
            id: c.id
        };
    });

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex w-full justify-start px-4 md:px-0 group"
        >
            <div className="flex gap-4 max-w-full md:max-w-[85%]">
                {/* AI Avatar */}
                <div className="flex-shrink-0 mt-1 relative">
                    <div className={cn(
                        "w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 shadow-[0_4px_12px_rgba(180,83,9,0.4)] flex items-center justify-center relative z-10 overflow-hidden border border-amber-200/30",
                        message.isStreaming && "animate-glow"
                    )}>
                        <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
                        <span className="text-white font-lora font-black text-xs tracking-tighter drop-shadow-sm">
                            {message.isError ? "!" : "AI"}
                        </span>
                    </div>
                    {/* Hào quang khi suy nghĩ - Hiệu ứng Pulse sống động hơn */}
                    {message.isStreaming && (
                        <motion.div 
                            initial={{ scale: 1, opacity: 0.6 }}
                            animate={{ scale: 1.8, opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                            className="absolute inset-0 rounded-full bg-amber-500/40 -z-0"
                        />
                    )}
                </div>

                {/* Chat Content */}
                <div className="flex-1 flex flex-col gap-2 min-w-0">
                    <div className="text-stone-800 leading-relaxed font-lora">
                        {message.isStreaming && !message.text ? (
                            <div className="flex flex-col gap-3 py-2">
                                <span className="text-[13px] font-medium text-amber-800/80 font-manrope animate-pulse flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 animate-bounce" />
                                    Đang truy xuất đại tạng kinh...
                                </span>
                                <div className="flex items-center gap-2 px-1">
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0.2, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1.1 }}
                                            transition={{
                                                duration: 0.8,
                                                repeat: Infinity,
                                                repeatType: "reverse",
                                                delay: i * 0.25,
                                                ease: "easeInOut"
                                            }}
                                            className="w-1.5 h-1.5 rounded-full bg-amber-600/60 shadow-[0_0_10px_rgba(217,119,6,0.3)]"
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className={cn(
                                "prose prose-stone prose-sm md:prose-base max-w-none break-words",
                                "prose-p:leading-relaxed prose-p:text-stone-900 prose-p:mb-3 last:prose-p:mb-0 prose-p:font-lora",
                                "prose-headings:font-lora prose-headings:text-stone-900 prose-headings:mt-4 prose-headings:mb-2",
                                "prose-strong:text-amber-900 prose-strong:font-bold",
                                "prose-ul:list-disc prose-ul:pl-5 prose-ul:my-3 prose-ul:font-lora",
                                "prose-li:text-stone-800 prose-li:my-1",
                                "prose-blockquote:border-l-amber-500 prose-blockquote:bg-amber-50/50 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r-lg prose-blockquote:italic",
                                (message.isStreaming) ? "after:content-[''] after:inline-block after:w-[3px] after:h-[1.1em] after:bg-amber-600/80 after:rounded-full after:ml-1 after:align-middle after:animate-[pulse_1s_ease-in-out_infinite]" : ""
                            )}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {message.text}
                                </ReactMarkdown>
                                
                                {message.isError && (
                                    <div className="mt-4 flex flex-col items-start gap-2 italic text-stone-500 text-xs">
                                        <span>{message.text}</span>
                                        
                                        {onRetry && isLatest && (
                                            <Button
                                                onClick={onRetry}
                                                size="sm"
                                                className="mt-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-200 rounded-full px-4 h-8 text-[11px] font-bold shadow-sm flex items-center gap-2 transition-all active:scale-95 not-italic"
                                            >
                                                Thử lại ngay
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Citations — Masonry Bento Display */}
                    {normalizedCitations.length > 0 && !message.isStreaming && (
                        <div className="mt-6 flex flex-col gap-4 border-t border-stone-200/60 pt-5 relative">
                            <div className="absolute top-0 left-0 w-16 h-px bg-amber-300/50 -mt-px" />
                            <p className="text-[11px] font-bold text-stone-400 flex items-center uppercase tracking-[0.2em] font-manrope">
                                <BookOpen className="w-3 h-3 mr-2 text-amber-600/70" />
                                Nguồn Tham Chiếu
                            </p>
                            <div className="columns-1 md:columns-2 gap-3 space-y-3 w-full">
                                {normalizedCitations.map((cite: any, idx) => {
                                    const tier = cite.source_tier || 'UNKNOWN';
                                    const tierColor: Record<string, string> = {
                                        PRIMARY:     'bg-emerald-100 text-emerald-800 border-emerald-300',
                                        COMMENTARY:  'bg-blue-100   text-blue-800   border-blue-300',
                                        MODERN:      'bg-purple-100 text-purple-800 border-purple-300',
                                        TRANSLATION: 'bg-amber-100  text-amber-800  border-amber-300',
                                        UNKNOWN:     'bg-stone-100  text-stone-500  border-stone-300',
                                    };
                                    const tierLabel: Record<string, string> = {
                                        PRIMARY:     'Kinh gốc',
                                        COMMENTARY:  'Chú giải',
                                        MODERN:      'Hiện đại',
                                        TRANSLATION: 'Bản dịch',
                                        UNKNOWN:     'Tài liệu',
                                    };
                                    return (
                                        <div
                                            key={idx}
                                            className="break-inside-avoid bg-white/50 backdrop-blur-xl border border-white/60 hover:border-amber-200/80 hover:bg-white shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(180,83,9,0.06)] rounded-[16px] p-4 text-xs text-stone-700 transition-all duration-300 flex flex-col gap-2 group/cite cursor-pointer"
                                        >
                                            {/* Tier badge */}
                                            <span className={`self-start text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border font-manrope transition-colors ${tierColor[tier] || tierColor.UNKNOWN}`}>
                                                {tierLabel[tier] || tier}
                                            </span>

                                            {/* Title */}
                                            <p className="font-semibold text-[13px] leading-snug text-[#1C1C1A] break-words font-lora group-hover/cite:text-amber-800 transition-colors">
                                                {cite.document_title || cite.text || 'Tài liệu RAG'}
                                            </p>

                                            {/* Content snippet */}
                                            {cite.content && (
                                                <p className="text-[11.5px] text-stone-500 line-clamp-4 mt-0.5 font-manrope leading-relaxed">
                                                    &ldquo;{cite.content}&rdquo;
                                                </p>
                                            )}

                                            {/* Pāli Ref + Publisher + Year */}
                                            {(cite.pali_ref || cite.publisher || cite.publish_year) && (
                                                <div className="mt-2 pt-2 border-t border-stone-200/50 flex flex-wrap items-center gap-x-2 gap-y-1">
                                                    {cite.pali_ref && (
                                                        <span className="text-[10px] text-amber-700 font-medium font-manrope bg-amber-50 px-1.5 py-0.5 rounded">
                                                            {cite.pali_ref}
                                                        </span>
                                                    )}
                                                    {(cite.publisher || cite.publish_year) && (
                                                        <span className="text-[10px] text-stone-400 font-manrope leading-tight">
                                                            {[cite.publisher, cite.publish_year ? `(${cite.publish_year})` : null].filter(Boolean).join(' ')}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Action Bar */}
                    {!message.isStreaming && message.text && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-1 mt-2 transition-opacity duration-300 opacity-60 hover:opacity-100 focus-within:opacity-100"
                        >
                            {/* Copy */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-stone-500 hover:text-stone-800 pointer-events-auto active:scale-[0.85] transition-transform"
                                onClick={copyToClipboard}
                                title="Sao chép"
                            >
                                {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </Button>

                            <div className="w-px h-3 bg-stone-300 mx-1" />

                            {/* Thumbs Down — ghi log vào DB */}
                            {onNegativeFeedback && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-8 w-8 pointer-events-auto transition-transform active:scale-[0.85]",
                                        feedbackSent
                                            ? "text-orange-500 cursor-default"
                                            : "text-stone-500 hover:text-red-700 hover:bg-red-50"
                                    )}
                                    onClick={handleNegativeFeedback}
                                    disabled={feedbackSent}
                                    title={feedbackSent ? "Đã ghi nhận phản hồi!" : "Phản hồi không chính xác"}
                                >
                                    <ThumbsDown className="w-3.5 h-3.5" />
                                </Button>
                            )}

                            {/* Thumbs Up — UI chỉ, không cần ghi log */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-stone-500 hover:text-green-700 hover:bg-green-50 pointer-events-auto active:scale-[0.85] transition-transform"
                                title="Hữu ích"
                            >
                                <ThumbsUp className="w-3.5 h-3.5" />
                            </Button>

                            {/* Feedback Sent Toast */}
                            {feedbackSent && (
                                <motion.span
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-[10px] text-orange-500 font-medium font-manrope ml-1"
                                >
                                    Đã ghi nhận! Cảm ơn bạn. 🙏
                                </motion.span>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
