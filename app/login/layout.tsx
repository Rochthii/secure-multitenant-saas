import React from 'react';
import { Inter, Playfair_Display } from "next/font/google";
import "@/app/globals.css";
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/tenant';

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: 'swap',
});

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
    display: 'swap',
});

export async function generateMetadata() {
    const headerList = await headers();
    const host = headerList.get('host') || '';
    const tenant = await getTenantConfig(host);
    const tenantName = tenant?.name || 'Chi nhánh Khmer';

    return {
        title: `Đăng nhập | ${tenantName}`,
        description: 'Đăng nhập hệ thống quản trị',
    };
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="vi" suppressHydrationWarning>
            <body className={`${inter.variable} ${playfair.variable} font-inter antialiased bg-gray-50`} suppressHydrationWarning>
                <div className="min-h-screen flex items-center justify-center">
                    {children}
                </div>
            </body>
        </html>
    );
}
