'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Newspaper, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CollaboratorLayoutClient({ children, email }: { children: React.ReactNode, email: string }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const saved = localStorage.getItem('collab-sidebar-collapsed');
        if (saved === 'true') setSidebarCollapsed(true);
    }, []);

    const toggleSidebar = () => {
        setSidebarCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('collab-sidebar-collapsed', String(next));
            return next;
        });
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className={`transition-all duration-300 ease-in-out shrink-0 overflow-hidden bg-coffee-dark text-white shadow-xl z-50 flex flex-col ${sidebarCollapsed ? 'w-0 opacity-0' : 'w-64 opacity-100'}`}>
                {/* Logo/Header */}
                <div className="p-6 border-b border-gold-primary/20 bg-coffee-darker flex-shrink-0">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-full border border-gold-primary/40 flex items-center justify-center group-hover:border-gold-primary transition-colors">
                            <span className="text-gold-primary font-playfair font-bold text-lg">M</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[13px] leading-tight font-bold text-gold-light group-hover:text-gold-primary transition-colors">Multi-tenant Ecosystem</span>
                            <span className="text-[9px] text-gray-400 tracking-wider">CỘNG TÁC VIÊN</span>
                        </div>
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                    <Link
                        href="/collaborator/news-manager"
                        className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group',
                            pathname.includes('/collaborator/news-manager')
                                ? 'bg-gold-primary/10 text-gold-primary border border-gold-primary/20 shadow-sm'
                                : 'text-gray-300 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <Newspaper className={cn("w-4 h-4", pathname.includes('/collaborator/news-manager') ? "text-gold-primary" : "text-gray-400 group-hover:text-gold-primary")} />
                        Quản lý tin tức
                    </Link>
                </nav>

                {/* User Info & Logout */}
                <div className="p-4 border-t border-gold-primary/20 bg-coffee-darker flex-shrink-0">
                    <div className="flex items-center gap-3 px-2 py-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gold-primary/20 flex items-center justify-center text-gold-light border border-gold-primary/30 shrink-0">
                            {email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-[11px] font-semibold text-white truncate">{email}</span>
                            <span className="text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">Volunteer Role</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-start gap-3 px-3 py-2 text-[12px] font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                    </button>
                </div>
            </div>

            {/* Main content */}
            <main className="flex-1 h-screen overflow-y-auto relative">
                <button
                    type="button"
                    onClick={toggleSidebar}
                    title={sidebarCollapsed ? 'Mở thanh điều hướng' : 'Ẩn thanh điều hướng'}
                    className="fixed top-3 left-3 z-50 flex items-center justify-center w-8 h-8 rounded-lg bg-white shadow-md border border-gray-200 text-gray-500 hover:text-gray-900 transition-all duration-150"
                >
                    {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                </button>
                <div className={`${sidebarCollapsed ? 'pl-12' : 'pl-0'} p-4 md:p-8 transition-all duration-300`}>
                    {children}
                </div>
            </main>
        </div>
    );
}
