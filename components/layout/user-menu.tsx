'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function UserMenu() {
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                setRole(user.app_metadata?.role || user.user_metadata?.role || 'user');
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        setUser(null);
        setRole(null);
        router.refresh();
        router.push('/');
    };

    if (loading) {
        return <div className="w-9 h-9 animate-pulse bg-white/10 rounded-full" />;
    }

    if (!user) {
        return (
            <button
                onClick={() => router.push('/login')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gold-light border border-gold-primary/50 rounded-lg hover:bg-gold-primary/10 transition-all active:scale-95"
            >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Đăng nhập</span>
            </button>
        );
    }

    const isAdmin = role && ['admin', 'super_admin', 'editor', 'moderator'].includes(role);
    const isVolunteer = role === 'volunteer';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="flex items-center justify-center h-9 w-9 rounded-full bg-gold-primary/20 hover:bg-gold-primary/30 border border-gold-primary/50 text-gold-light transition-all"
                    title={user.email}
                >
                    <span className="text-sm font-bold uppercase">{user.email?.charAt(0) || 'U'}</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-coffee-dark/95 backdrop-blur-md border border-gold-dark/20 text-white">
                <div className="flex items-center justify-start gap-2 p-2 px-3 pb-3">
                    <div className="flex flex-col space-y-0.5 leading-none">
                        {user.user_metadata?.full_name && (
                            <p className="font-medium text-sm text-gold-light">{user.user_metadata.full_name}</p>
                        )}
                        <p className="w-[180px] truncate text-xs text-gray-400">
                            {user.email}
                        </p>
                    </div>
                </div>
                <DropdownMenuSeparator className="bg-gold-dark/20" />

                {(isAdmin || isVolunteer) && (
                    <DropdownMenuItem
                        onClick={() => router.push(isAdmin ? '/admin' : '/collaborator')}
                        className="cursor-pointer hover:bg-white/10 focus:bg-white/10"
                    >
                        <LayoutDashboard className="mr-2 h-4 w-4 text-gold-primary" />
                        <span>Bảng điều khiển</span>
                    </DropdownMenuItem>
                )}

                {!isAdmin && !isVolunteer && (
                    <DropdownMenuItem
                        onClick={() => router.push('/profile')}
                        className="cursor-pointer hover:bg-white/10 focus:bg-white/10"
                    >
                        <Settings className="mr-2 h-4 w-4 text-gray-400" />
                        <span>Hồ sơ cá nhân</span>
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="bg-gold-dark/20" />
                <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
