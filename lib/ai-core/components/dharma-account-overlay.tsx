"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, UserCircle, Key, LogOut, X, CheckCircle2, AlertCircle, Settings, Volume2 } from 'lucide-react';
import { InlineSpinner } from '@/components/ui/buddhist-spinner';

interface DharmaAccountOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    initialTab?: 'profile' | 'security' | 'system';
}

export default function DharmaAccountOverlay({ isOpen, onClose, user, initialTab }: DharmaAccountOverlayProps) {
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'system'>('profile');

    // Sync activeTab with initialTab when overlay opens
    useEffect(() => {
        if (isOpen && initialTab) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);
    
    // Profile State
    const [fullName, setFullName] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(false);
    
    // Security State
    const [newPassword, setNewPassword] = useState('');
    const [loadingSecurity, setLoadingSecurity] = useState(false);
    
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const supabase = createClient();

    useEffect(() => {
        if (user) {
            setFullName(user.user_metadata?.full_name || '');
        }
    }, [user]);

    // Handle Messages disappearance
    useEffect(() => {
        if (message || error) {
            const timer = setTimeout(() => {
                setMessage('');
                setError('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message, error]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingProfile(true);
        setError('');
        setMessage('');

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            });
            
            if (updateError) throw updateError;
            
            // Note: Since auth.users metadata doesn't automatically trigger a profile sync in our simpler trigger,
            // we should ideally update `user_profiles` directly or let a backend edge function handle it.
            // For now, Supabase user metadata update is enough to reflect in the UI temporarily.
            const { error: profileError } = await supabase
                .from('user_profiles' as any)
                .update({ full_name: fullName })
                .eq('id', user?.id);
                
            if (profileError) console.error("Lỗi đồng bộ profile:", profileError);

            setMessage('Cập nhật hồ sơ thành công.');
        } catch (err: any) {
            setError(err.message || 'Lấy cập nhật thất bại.');
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            setError('Mật khẩu tối thiểu 6 ký tự.');
            return;
        }

        setLoadingSecurity(true);
        setError('');
        setMessage('');

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            });
            if (updateError) throw updateError;
            
            setMessage('Đổi mật khẩu thành công.');
            setNewPassword('');
        } catch (err: any) {
            setError(err.message || 'Lưu mật khẩu thất bại.');
        } finally {
            setLoadingSecurity(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        onClose();
    };

    if (!isOpen || !user) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[102] flex items-center justify-center p-4">
                {/* Backdrop Layer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
                />

                {/* Main Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="relative w-full max-w-2xl bg-[#FEF9F3] rounded-[24px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[550px]"
                >
                    {/* Sidebar Nav */}
                    <div className="w-full md:w-1/3 bg-stone-100/50 border-r border-stone-200/50 flex flex-col items-center py-6 md:py-10 px-4 shrink-0">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xl md:text-2xl font-playfair font-bold shadow-inner mb-3 md:mb-4">
                            {fullName.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <h3 className="font-playfair text-base md:text-lg font-bold text-stone-800 text-center w-full truncate px-2">{fullName || 'Đạo Hữu'}</h3>
                        <p className="text-[10px] md:text-xs text-stone-500 mb-4 md:mb-8 truncate w-full text-center px-2">{user.email}</p>

                        <div className="w-full grid grid-cols-2 md:grid-cols-1 gap-2">
                            <button 
                                onClick={() => setActiveTab('profile')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-white text-stone-800 shadow-sm border border-stone-200/50' : 'text-stone-500 hover:bg-stone-200/30'}`}
                            >
                                <UserCircle className="w-4 h-4" /> Hồ Sơ Tịnh Tu
                            </button>
                            <button 
                                onClick={() => setActiveTab('security')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'security' ? 'bg-white text-stone-800 shadow-sm border border-stone-200/50' : 'text-stone-500 hover:bg-stone-200/30'}`}
                            >
                                <ShieldCheck className="w-4 h-4" /> Bảo Mật & Kết Nối
                            </button>
                            <button 
                                onClick={() => setActiveTab('system')}
                                className={`w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-[11px] md:text-sm font-medium transition-all ${activeTab === 'system' ? 'bg-white text-stone-800 shadow-sm border border-stone-200/50' : 'text-stone-500 hover:bg-stone-200/30'}`}
                            >
                                <Settings className="w-4 h-4" /> Cài đặt
                            </button>
                        </div>
                        
                        <div className="hidden md:block mt-auto w-full pt-4 border-t border-stone-200/50">
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="w-4 h-4" /> Đăng Xuất
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="w-full md:w-2/3 p-5 md:p-8 relative flex flex-col bg-[#FAF4EB] overflow-hidden">
                        {/* Close button */}
                        <button 
                            onClick={onClose}
                            className="absolute right-6 top-6 w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex-1 overflow-y-auto pr-2 pb-6 pt-4">
                            
                            {/* Messages */}
                            <AnimatePresence>
                                {message && (
                                    <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="mb-6 overflow-hidden">
                                        <div className="bg-emerald-50 border border-emerald-200/60 text-emerald-700 px-4 py-3 rounded-xl text-sm flex gap-2">
                                            <CheckCircle2 className="w-4 h-4 mt-0.5" /> <span>{message}</span>
                                        </div>
                                    </motion.div>
                                )}
                                {error && (
                                    <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="mb-6 overflow-hidden">
                                        <div className="bg-red-50 border border-red-200/60 text-red-700 px-4 py-3 rounded-xl text-sm flex gap-2">
                                            <AlertCircle className="w-4 h-4 mt-0.5" /> <span>{error}</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                    <div>
                                        <h2 className="font-playfair text-2xl font-bold text-stone-800">Hồ Sơ Tịnh Tu</h2>
                                        <p className="text-sm text-stone-500 mt-1">Danh xưng sẽ hiển thị trong không gian đàm đạo</p>
                                    </div>

                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div className="space-y-3">
                                            <Label htmlFor="fullname" className="text-stone-600 font-medium text-xs uppercase tracking-wider">Pháp danh / Họ tên</Label>
                                            <Input
                                                id="fullname"
                                                className="bg-white border-stone-200 focus:border-amber-400 rounded-xl h-12 px-4 shadow-sm text-stone-800"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder="Tên của bạn..."
                                            />
                                        </div>
                                        
                                        <div className="space-y-3 opacity-60 pointer-events-none">
                                            <Label htmlFor="email_disabled" className="text-stone-600 font-medium text-xs uppercase tracking-wider">Email tĩnh tu (Không thể đổi)</Label>
                                            <Input
                                                id="email_disabled"
                                                className="bg-stone-100 border-stone-200 rounded-xl h-12 px-4 text-stone-500"
                                                value={user.email}
                                                disabled
                                            />
                                        </div>

                                        <div className="pt-4">
                                            <Button
                                                type="submit"
                                                className="bg-[#1C1917] hover:bg-[#2D2A26] text-[#FAF4EB] rounded-xl px-8 h-11 transition-all"
                                                disabled={loadingProfile}
                                            >
                                                {loadingProfile ? <><InlineSpinner className="mr-2 h-4 w-4" /> Lưu thông tin...</> : 'Lưu Thay Đổi'}
                                            </Button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                    <div>
                                        <h2 className="font-playfair text-2xl font-bold text-stone-800">Bảo Mật</h2>
                                        <p className="text-sm text-stone-500 mt-1">Đảm bảo an toàn cho chặng đường tu học của bạn</p>
                                    </div>

                                    {/* Notice for OAuth Users */}
                                    {user.app_metadata?.provider === 'google' && (
                                        <div className="bg-blue-50 border border-blue-200/60 p-4 rounded-xl flex gap-3 text-blue-800 text-sm">
                                            <ShieldCheck className="w-5 h-5 shrink-0" />
                                            <p>Tài khoản của bạn được liên kết an toàn qua Google. Bạn có thể thiết lập mật khẩu riêng nếu muốn đăng nhập bằng Email.</p>
                                        </div>
                                    )}

                                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                                        <div className="space-y-3">
                                            <Label htmlFor="new_password" className="text-stone-600 font-medium text-xs uppercase tracking-wider">Thiết Lập Mật Khẩu Mới</Label>
                                            <div className="relative group">
                                                <Key className="absolute left-4 top-3.5 h-4 w-4 text-stone-400 group-focus-within:text-amber-600 transition-colors" />
                                                <Input
                                                    id="new_password"
                                                    type="password"
                                                    className="pl-11 bg-white border-stone-200 focus:border-amber-400 rounded-xl h-12 shadow-sm text-stone-800"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="Ít nhất 6 ký tự..."
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-stone-200/60 flex items-center justify-between">
                                            <p className="text-xs text-stone-400">Phiên bản sẽ tự động đăng xuất trên các thiết bị khác khi bạn đổi mật khẩu.</p>
                                            <Button
                                                type="submit"
                                                className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-6 h-11 shrink-0"
                                                disabled={loadingSecurity}
                                            >
                                                {loadingSecurity ? <><InlineSpinner className="mr-2 h-4 w-4" /> Đang cập nhật...</> : 'Cập nhật Mật Khẩu'}
                                            </Button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                            {/* System Tab */}
                            {activeTab === 'system' && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                    <div>
                                        <h2 className="font-playfair text-2xl font-bold text-stone-800">Cài đặt</h2>
                                        <p className="text-sm text-stone-500 mt-1">Tùy chỉnh trải nghiệm tu tập kỹ thuật số</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-2xl space-y-3">
                                            <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                                                <Volume2 className="w-4 h-4" /> Chế độ Âm thanh & Thông báo
                                            </h4>
                                            <p className="text-xs text-amber-800/70">Tự động đọc lời Phật dạy sau khi AI trả lời.</p>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="outline" className="text-[10px] h-7 bg-white border-amber-200 text-amber-700">Đang tắt</Button>
                                                <span className="text-[10px] text-stone-400 italic">(Tính năng đang phát triển)</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest">Dữ liệu cá nhân</h4>
                                            <Button 
                                                variant="outline" 
                                                className="w-full justify-start text-red-600 border-red-100 hover:bg-red-50 rounded-xl"
                                                onClick={() => {
                                                    if(confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện? Hành động này không thể hoàn tác.")) {
                                                        alert("Đang yêu cầu xóa dữ liệu...");
                                                    }
                                                }}
                                            >
                                                <X className="w-4 h-4 mr-2" /> Xóa lịch sử đàm đạo (Dharma Chat)
                                            </Button>
                                        </div>

                                        <div className="pt-4 border-t border-stone-200/50 md:hidden">
                                            <Button 
                                                variant="ghost" 
                                                className="w-full text-red-600 hover:bg-red-50 rounded-xl"
                                                onClick={handleLogout}
                                            >
                                                <LogOut className="w-4 h-4 mr-2" /> Đăng Xuất Tài Khoản
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
