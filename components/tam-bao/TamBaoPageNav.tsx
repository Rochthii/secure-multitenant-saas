'use client';

import React from 'react';

const LINKS = [
    { href: '#phat-bao', label: 'Phật Bảo' },
    { href: '#phap-bao', label: 'Pháp Bảo' },
    { href: '#tang-bao', label: 'Tăng Bảo' },
    { href: '#qui-y', label: 'Qui y Tam Bảo' },
];

export function TamBaoPageNav() {

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        const id = href.slice(1);
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <nav
            className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm"
            aria-label="Điều hướng trong trang Tam Bảo"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
                {/* Horizontal scroll on mobile; centered on desktop */}
                <div className="flex items-center justify-start sm:justify-center gap-1 md:gap-4 py-2.5 sm:py-3 overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory md:overflow-visible md:snap-none">
                    {LINKS.map(({ href, label }) => (
                        <a
                            key={href}
                            href={href}
                            onClick={(e) => handleClick(e, href)}
                            className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-amber-700 px-2.5 sm:px-3 py-2 rounded-lg hover:bg-amber-50 transition-colors whitespace-nowrap snap-start shrink-0 touch-manipulation"
                        >
                            {label}
                        </a>
                    ))}
                </div>
            </div>
        </nav>
    );
}
