import React, { useState, useRef, useEffect } from 'react';
import { Send, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface DharmaChatInputProps {
    onSendMessage: (text: string) => void;
    disabled?: boolean;
    onStop?: () => void;
    isStreaming?: boolean;
}

export default function DharmaChatInput({ onSendMessage, disabled, onStop, isStreaming }: DharmaChatInputProps) {
    const [text, setText] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        
        // Save current scroll position to prevent jumping
        const scrollPos = textarea.scrollTop;
        
        // Reset height to recalculate
        textarea.style.height = '56px'; 
        const scrollHeight = textarea.scrollHeight;
        
        if (scrollHeight > 150) {
            textarea.style.height = '150px';
            textarea.style.overflowY = 'auto';
            textarea.scrollTop = scrollPos; // Restore scroll if it's full
        } else {
            textarea.style.height = `${scrollHeight}px`;
            textarea.style.overflowY = 'hidden';
        }
    }, [text]);

    const handleSend = () => {
        if (text.trim() && !disabled) {
            onSendMessage(text);
            setText('');
            if (textareaRef.current) {
                textareaRef.current.style.height = '56px'; // reset to min-height
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Trên mobile, phím Enter đôi khi có code 13 hoặc tên khác, ta check rộng hơn
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
            // Ẩn bàn phím sau khi gửi trên mobile (giúp người dùng thấy được tin nhắn đang hiện ra)
            if (window.innerWidth < 768 && textareaRef.current) {
                textareaRef.current.blur();
            }
        }
    };

    return (
        <motion.div 
            animate={{ 
                boxShadow: isFocused ? '0 12px 40px -10px rgba(180,83,9,0.15)' : '0 4px 24px -8px rgba(0,0,0,0.06)',
                y: isFocused ? -2 : 0
            }}
            transition={{ duration: 0.3 }}
            className={`
                relative bg-white/80 backdrop-blur-3xl border border-stone-200/50 rounded-[32px]
                flex flex-col justify-end
                transition-all duration-300
                ${disabled ? 'opacity-80' : ''}
            `}
        >
            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSend();
                }}
                className="flex items-end gap-2 p-2 relative"
            >
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={disabled && !isStreaming}
                    placeholder="Nhập câu hỏi hoặc yêu cầu hỗ trợ nội bộ..."
                    className="w-full max-h-[150px] min-h-[56px] resize-none bg-transparent outline-none border-none py-4 px-6 text-stone-800 placeholder:text-stone-400 font-manrope text-[15px] overflow-y-auto z-10"
                    rows={1}
                />
                
                <div className="flex items-center justify-center p-2 z-20">
                    <AnimatePresence mode="wait">
                        {isStreaming ? (
                            <motion.div
                                key="stop"
                                initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Button
                                    size="icon"
                                    type="button"
                                    onClick={onStop}
                                    variant="outline"
                                    className="h-11 w-11 text-stone-600 border-stone-200 hover:bg-stone-100 rounded-full active:scale-[0.85] transition-transform shadow-sm"
                                >
                                    <Square className="w-4 h-4 fill-current" />
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="send"
                                initial={{ opacity: 0, scale: 0.5, rotate: 90 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0, scale: 0.5, rotate: -90 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Button
                                    size="icon"
                                    type="submit"
                                    disabled={!text.trim() || disabled}
                                    className={`
                                        h-11 w-11 rounded-full transition-all duration-300
                                        ${text.trim() ? 'bg-[#1C1C1A] hover:bg-black text-white shadow-md active:scale-[0.85]' : 'bg-stone-100 text-stone-300 cursor-not-allowed'}
                                    `}
                                >
                                    <Send className="w-4 h-4 ml-0.5" />
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </form>
            
            {/* Ambient inner glow */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/60 to-transparent rounded-b-[32px] pointer-events-none" />
        </motion.div>
    );
}
