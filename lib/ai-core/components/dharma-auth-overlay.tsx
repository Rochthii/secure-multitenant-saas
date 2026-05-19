"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User, X, CheckCircle2, ChevronLeft, ShieldCheck } from 'lucide-react';
import { InlineSpinner } from '@/components/ui/buddhist-spinner';
import DharmaPolicyOverlay, { PolicyView } from './dharma-policy-overlay';

export type AuthView = 'login' | 'register' | 'forgot_password' | 'update_password';

interface DharmaAuthOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialView?: AuthView;
}

export default function DharmaAuthOverlay({ isOpen, onClose, onSuccess, initialView }: DharmaAuthOverlayProps) {
    const [view, setView] = useState<AuthView>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isAgreed, setIsAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Policy State
    const [policyOpen, setPolicyOpen] = useState(false);
    const [activePolicy, setActivePolicy] = useState<PolicyView>('tos');

    const supabase = createClient();

    // Sync view with initialView prop, and reset state whenever modal opens
    useEffect(() => {
        if (isOpen) {
            // Reset agreement + errors every time modal opens fresh
            setIsAgreed(false);
            setError('');
            setMessage('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setFullName('');
        }
        if (initialView) {
            setView(initialView);
        } else if (isOpen) {
            setView('login'); // Default to login when opened without forced view
        }
    }, [isOpen, initialView]);

    const openPolicy = (p: PolicyView) => {
        setActivePolicy(p);
        setPolicyOpen(true);
    };

    const handleGoogleLogin = async () => {
        if (!isAgreed) return;
        setLoading(true);
        setError('');
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: { prompt: 'select_account' }
                }
            });
            if (error) throw error;
        } catch (err: any) {
            setError('Lỗi kết nối Google: ' + err.message);
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Consent check for registration and login
        if ((view === 'login' || view === 'register') && !isAgreed) {
            setError('Vui lòng tích vào ô đồng ý với Điều khoản & Chính sách bên dưới để tiếp tục.');
            // Scroll/highlight focus on the checkbox
            document.getElementById('agree')?.focus();
            return;
        }

        setError('');
        setMessage('');
        setLoading(true);

        try {
            if (view === 'login') {
                const { error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (authError) throw authError;
                onSuccess();
            } 
            else if (view === 'register') {
                const { error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            source: 'dharma_portal',
                        }
                    }
                });
                if (authError) throw authError;
                setMessage('Đăng ký thành công! Vui lòng kiểm tra email để xác minh.');
            }
            else if (view === 'forgot_password') {
                const { error: authError } = await supabase.auth.resetPasswordForEmail(email);
                if (authError) throw authError;
                setMessage('Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.');
            }
            else if (view === 'update_password') {
                if (password !== confirmPassword) {
                    throw new Error('Mật khẩu xác nhận không khớp.');
                }
                if (password.length < 6) {
                    throw new Error('Mật khẩu phải có ít nhất 6 ký tự.');
                }

                const { error: authError } = await supabase.auth.updateUser({
                    password: password,
                });
                if (authError) throw authError;

                // Security requirement: Sign out and force manual re-login
                await supabase.auth.signOut();
                setMessage('Mật khẩu đã được cập nhật thành công! Vui lòng đăng nhập lại bằng mật khẩu mới.');
                
                // Clear inputs
                setPassword('');
                setConfirmPassword('');
                
                // Switch to login view after a short delay or stay to show message
                setTimeout(() => setView('login'), 3000);
            }
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra. Xin thử lại.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Helper to check if agreement is needed for the current view
    const isConsentRequired = view === 'login' || view === 'register';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
                {/* Backdrop Layer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
                />

                {/* Simplified Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-[#FEF9F3] rounded-[32px] shadow-2xl overflow-hidden p-8 md:p-10 border border-stone-200"
                >
                    {/* Close Button */}
                    <button 
                        onClick={onClose}
                        className="absolute right-6 top-6 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Back button for internal navigation (Not available for update_password for security) */}
                    {(view === 'register' || view === 'forgot_password') && (
                        <button 
                            onClick={() => setView('login')}
                            className="absolute flex items-center gap-1 left-8 top-8 text-stone-400 hover:text-stone-600 transition-colors text-sm font-medium"
                        >
                            <ChevronLeft className="w-4 h-4" /> Quay lại
                        </button>
                    )}

                    <div className="space-y-8 mt-4">
                        {/* Header Section */}
                        <div className="text-center space-y-2">
                            <h2 className="font-playfair text-3xl font-bold text-stone-800">
                                {view === 'login' && 'Đăng nhập'}
                                {view === 'register' && 'Tạo tài khoản'}
                                {view === 'forgot_password' && 'Quên mật khẩu'}
                                {view === 'update_password' && 'Đổi mật khẩu mới'}
                            </h2>
                            <p className="text-sm text-stone-500">
                                {view === 'login' && 'Chào mừng bạn trở lại với hệ thống'}
                                {view === 'register' && 'Tham gia cộng đồng học thuật Phật giáo'}
                                {view === 'forgot_password' && 'Nhập email để khôi phục mật khẩu'}
                                {view === 'update_password' && 'Thiết lập lại mật khẩu an toàn cho tài khoản'}
                            </p>
                        </div>

                        {/* System Status Messages */}
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-2xl text-sm flex gap-2 items-start">
                                    <span className="mt-0.5">⚠️</span> 
                                    <span>{error === 'Invalid login credentials' ? 'Email hoặc mật khẩu không chính xác' : error}</span>
                                </motion.div>
                            )}
                            {message && (
                                <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-2xl text-sm flex gap-2 items-start">
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-600" /> 
                                    <span>{message}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleEmailAuth} className="space-y-5">
                            <AnimatePresence mode="popLayout">
                                {view === 'register' && (
                                    <motion.div 
                                        key="fullname"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="space-y-1.5"
                                    >
                                        <Label htmlFor="fullname" className="text-stone-600 font-medium text-xs ml-1">Họ tên / Pháp danh</Label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-3.5 h-4 w-4 text-stone-400 group-focus-within:text-amber-600 transition-colors" />
                                            <Input
                                                id="fullname"
                                                className="pl-11 bg-white border-stone-200 focus:border-amber-400 focus:ring-amber-100 rounded-2xl h-12 text-stone-800"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder="Nguyễn Văn A"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {((view as string) !== 'update_password') && (
                                    <motion.div key="email" layout className="space-y-1.5">
                                        <Label htmlFor="email" className="text-stone-600 font-medium text-xs ml-1">Địa chỉ Email</Label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-3.5 h-4 w-4 text-stone-400 group-focus-within:text-amber-600 transition-colors" />
                                            <Input
                                                id="email"
                                                type="email"
                                                className="pl-11 bg-white border-stone-200 focus:border-amber-400 focus:ring-amber-100 rounded-2xl h-12 text-stone-800"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="email@example.com"
                                                required={(view as string) !== 'update_password'}
                                                disabled={loading}
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {view !== 'forgot_password' && (
                                    <motion.div key="password" layout className="space-y-1.5">
                                        <div className="flex justify-between items-center pr-1">
                                            <Label htmlFor="password" className="text-stone-600 font-medium text-xs ml-1">
                                                {view === 'update_password' ? 'Mật khẩu mới' : 'Mật khẩu'}
                                            </Label>
                                            {view === 'login' && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => setView('forgot_password')}
                                                    className="text-xs text-stone-400 hover:text-amber-700 transition-colors"
                                                >
                                                    Quên mật khẩu?
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-3.5 h-4 w-4 text-stone-400 group-focus-within:text-amber-600 transition-colors" />
                                            <Input
                                                id="password"
                                                type="password"
                                                className="pl-11 bg-white border-stone-200 focus:border-amber-400 focus:ring-amber-100 rounded-2xl h-12 text-stone-800"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {view === 'update_password' && (
                                    <motion.div 
                                        key="confirm_password"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-1.5"
                                    >
                                        <Label htmlFor="confirmPassword" className="text-stone-600 font-medium text-xs ml-1">Xác nhận mật khẩu</Label>
                                        <div className="relative group">
                                            <ShieldCheck className="absolute left-4 top-3.5 h-4 w-4 text-stone-400 group-focus-within:text-amber-600 transition-colors" />
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                className="pl-11 bg-white border-stone-200 focus:border-amber-400 focus:ring-amber-100 rounded-2xl h-12 text-stone-800"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Consent Checkbox */}
                            {isConsentRequired && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-start gap-2.5 px-1 py-1"
                                >
                                    <input 
                                        type="checkbox" 
                                        id="agree" 
                                        checked={isAgreed}
                                        onChange={(e) => setIsAgreed(e.target.checked)}
                                        className="mt-1 w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600"
                                    />
                                    <label htmlFor="agree" className="text-xs text-stone-500 leading-relaxed cursor-pointer select-none">
                                        Tôi đồng ý với <button type="button" onClick={() => openPolicy('tos')} className="text-stone-700 font-medium hover:underline">Điều khoản Dịch vụ</button> và <button type="button" onClick={() => openPolicy('privacy')} className="text-stone-700 font-medium hover:underline">Chính sách Bảo mật</button>.
                                        {' '}<span className="text-red-500 font-semibold">(Bắt buộc)</span>
                                    </label>
                                </motion.div>
                            )}

                            <motion.div layout className="pt-2">
                                <Button
                                    type="submit"
                                    className="w-full bg-[#1C1917] hover:bg-black text-white rounded-2xl h-12 shadow-md transition-all active:scale-[0.98] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading || (isConsentRequired && !isAgreed)}
                                    title={isConsentRequired && !isAgreed ? 'Vui lòng tích ô đồng ý Điều khoản bên dưới' : undefined}
                                >
                                    {loading ? (
                                        <><InlineSpinner className="mr-2 h-4 w-4 text-amber-500" /> Đang xử lý...</>
                                    ) : (
                                        <>
                                            {view === 'login' && 'Đăng nhập'}
                                            {view === 'register' && 'Đăng ký'}
                                            {view === 'forgot_password' && 'Gửi yêu cầu'}
                                            {view === 'update_password' && 'Lưu mật khẩu mới'}
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        </form>

                        {/* Social Login Section */}
                        {view === 'login' && (
                            <div className="space-y-6">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-stone-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-semibold">
                                        <span className="px-4 bg-[#FEF9F3] text-stone-400">Hoặc tiếp tục với</span>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full bg-white text-stone-600 hover:bg-stone-50 border-stone-200 rounded-2xl h-12 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleGoogleLogin}
                                    disabled={loading || !isAgreed}
                                >
                                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        <path fill="none" d="M1 1h22v22H1z" />
                                    </svg>
                                    <span className="font-medium">Google</span>
                                </Button>
                            </div>
                        )}

                        {/* Secondary View Switcher */}
                        {(view !== 'update_password') && (
                            <div className="text-center pt-2">
                                {view === 'login' ? (
                                    <p className="text-sm text-stone-500">
                                        Chưa có tài khoản?{' '}
                                        <button onClick={() => setView('register')} className="text-amber-700 hover:text-amber-800 font-semibold ml-1">
                                            Đăng ký tại đây
                                        </button>
                                    </p>
                                ) : (
                                    <p className="text-sm text-stone-500">
                                        Đã có tài khoản?{' '}
                                        <button onClick={() => setView('login')} className="text-amber-700 hover:text-amber-800 font-semibold ml-1">
                                            Đăng nhập ngay
                                        </button>
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Footer: Legal Links */}
                        <div className="text-center pt-4 border-t border-stone-100">
                            <p className="text-[10px] leading-relaxed text-stone-400 px-4">
                                Bằng cách tiếp tục, bạn đồng ý với{' '}
                                <button onClick={() => openPolicy('tos')} className="text-stone-500 hover:underline">Điều khoản</button>
                                {' '}và{' '}
                                <button onClick={() => openPolicy('privacy')} className="text-stone-500 hover:underline">Chính sách bảo mật</button> 
                                {' '}của hệ thống.
                            </p>
                        </div>

                    </div>
                </motion.div>
            </div>
            
            {/* Standard Legal Pages Overlay */}
            <DharmaPolicyOverlay 
                isOpen={policyOpen} 
                view={activePolicy} 
                onClose={() => setPolicyOpen(false)} 
            />
        </AnimatePresence>
    );
}
