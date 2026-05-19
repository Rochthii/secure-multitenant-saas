import React from 'react';
import { Inter, Playfair_Display } from "next/font/google";
import { createClient } from '@/lib/supabase/server';
import "@/app/globals.css";
import "@/app/tiptap.css";
import { Toaster } from "@/components/ui/sonner";
import { CollaboratorLayoutClient } from '@/app/collaborator/layout-client';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: 'swap' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: 'swap' });

export const metadata = {
    title: 'Cổng Cộng Tác Viên | Multi-tenant Ecosystem',
    description: 'Báº£ng Ä‘iá»u khiá»ƒn dÃ nh riÃªng cho Cá»™ng TÃ¡c ViÃªn (Volunteer Portal).',
};

import { redirect } from 'next/navigation';

export default async function CollaboratorLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Authentication Check
    if (!user) {
        redirect('/login?redirect=/collaborator/news-manager');
    }

    // 2. Role Check
    const role = user.app_metadata?.role ?? user.user_metadata?.role ?? 'volunteer';
    const allowedRoles = ['volunteer', 'editor', 'moderator', 'admin', 'super_admin'];

    if (!allowedRoles.includes(role)) {
        redirect('/');
    }

    return (
        <html lang="vi" suppressHydrationWarning>
            <body className={`${inter.variable} ${playfair.variable} font-inter antialiased`} suppressHydrationWarning>
                <CollaboratorLayoutClient email={user?.email || 'CTV'}>
                    {children}
                </CollaboratorLayoutClient>
                <Toaster />
            </body>
        </html>
    );
}

