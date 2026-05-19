'use client';

import React from 'react';
import Image from 'next/image';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { LOCALES, DEFAULT_SITE_NAME } from '@/lib/constants';
import { SearchModal } from '@/components/search/search-modal';
import { UserMenu } from '@/components/layout/user-menu';
import type { CategoryNode } from '@/lib/cache/queries';
import { PageNode, NavItem, buildNavigation, getNavLabel } from '@/lib/navigation';
import { TenantLogo } from '@/components/layout/tenant-logo';
import { DharmaWheelIcon } from '@/components/ui/khmer-icons';
import { BlockConfig, BlockType } from '@/lib/types/layout-blocks';
import { SECTION_REGISTRY } from '@/lib/blocks-registry';

// ─────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────

// ─────────────────────────────────────────────────
// Sub-Components (Style Theravāda)
// ─────────────────────────────────────────────────

const TheraNavLink = React.memo(({ item, isActive, locale }: any) => {
    const tNav = useTranslations('navigation');
    return (
        <Link
            href={item.href}
            prefetch={true}
            className={cn(
                'relative px-4 py-2 text-[14px] font-medium transition-all duration-300 rounded-md flex items-center',
                isActive 
                    ? 'text-[#3C2F1F] font-bold bg-[#E6A229]/10 border-b-2 border-[#E6A229] rounded-b-none' 
                    : 'text-[#7D6B52] hover:text-[#3C2F1F] hover:bg-[#E6A229]/5'
            )}
        >
            {getNavLabel(item, tNav, locale)}
        </Link>
    );
});
TheraNavLink.displayName = 'TheraNavLink';

// ─────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────

export function TheraHeader({
    settings = {},
    categoriesTree,
    pagesTree,
    aboutSectionsTree,
    layoutBlocks = [],
    domain,
    modulesConfig,
    isCompany,
    hasProjects,
    navVisibility = {}
}: any) {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [searchOpen, setSearchOpen] = React.useState(false);
    const [expandedNodes, setExpandedNodes] = React.useState<Record<string, boolean>>({});
    const pathname = usePathname();
    const router = useRouter();
    const locale = useLocale();
    const tNav = useTranslations('navigation');

    const navigation = React.useMemo(() => buildNavigation({ categoriesTree, pagesTree, aboutSectionsTree, layoutBlocks, modulesConfig, isCompany, hasProjects, navVisibility }), [categoriesTree, pagesTree, aboutSectionsTree, layoutBlocks, modulesConfig, isCompany, hasProjects, navVisibility]);

    const isActiveLink = React.useCallback((item: NavItem): boolean => {
        if (item.href === '/') return pathname === '/';
        if (pathname === item.href) return true;
        if (item.children?.some(child => isActiveLink(child))) return true;
        return pathname.startsWith(`${item.href}/`);
    }, [pathname]);

    const switchLocale = (newLocale: string) => {
        window.location.href = `/${newLocale}${pathname === '/' ? '' : pathname}`;
    };

    return (
        <header className="sticky top-0 z-50 w-full" suppressHydrationWarning>
            {/* Top Accent Bar */}
            <div className="h-1 bg-[#E6A229]" />
            
            <div className="backdrop-blur-md border-b border-[#F4EFE2] shadow-sm" style={{ backgroundColor: 'var(--theme-header-bg, rgba(255, 249, 240, 0.95))' }}>
                <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 py-3 lg:px-8 relative">
                    
                    {/* Logo & Identity Container */}
                    <div className="flex-1 flex justify-start">
                        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
                            <TenantLogo 
                                src={settings['site_logo']} 
                                alt={settings['site_name_vi']} 
                                variant="adaptive" 
                                size="md" 
                                className="bg-white border-[#E6A229]/30 shadow-sm"
                                fallbackIcon={<DharmaWheelIcon className="w-7 h-7" />}
                            />
                            <div className="flex flex-col">
                                <h1 className="text-lg lg:text-xl font-serif font-bold text-[#3C2F1F] leading-tight" style={{ fontFamily: 'Merriweather, serif' }}>
                                    {settings['site_name_vi'] || DEFAULT_SITE_NAME}
                                </h1>
                                <span className="text-[10px] text-[#7D6B52] uppercase tracking-[0.15em] font-medium">
                                    {settings['site_name_km'] || 'Theravāda Buddhism'}
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center justify-center gap-1">
                        {navigation.map(item => (
                            <div key={item.href} className="group">
                                <TheraNavLink item={item} isActive={isActiveLink(item)} locale={locale} />
                                
                                {item.children && (
                                    <div className="absolute top-full left-0 right-0 w-full flex justify-center pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none group-hover:pointer-events-auto">
                                        <div className="bg-white border border-[#F4EFE2] shadow-xl rounded-lg overflow-hidden min-w-[200px] p-2 mt-1 pointer-events-auto">
                                            {item.children.map(child => {
                                                const isChildActive = isActiveLink(child);
                                                return (
                                                <Link
                                                    key={child.href}
                                                    href={child.href}
                                                    className={cn(
                                                        "block px-4 py-2.5 text-[13px] rounded-md transition-colors",
                                                        isChildActive 
                                                            ? "font-bold text-[#E6A229] bg-[#FFF9F0]" 
                                                            : "text-[#7D6B52] hover:text-[#3C2F1F] hover:bg-[#FFF9F0]"
                                                    )}
                                                >
                                                    {getNavLabel(child, tNav, locale)}
                                                </Link>
                                            )})}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Right Controls Container */}
                    <div className="flex-1 flex items-center justify-end gap-2">
                        {/* Search */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="p-2 text-[#7D6B52] hover:text-[#3C2F1F] hover:bg-[#E6A229]/10 rounded-full transition-all"
                            aria-label="Search"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        {/* Lang Switcher */}
                        <div className="hidden sm:block">
                            <select 
                                value={locale}
                                onChange={(e) => switchLocale(e.target.value)}
                                className="bg-transparent text-[13px] font-bold text-[#7D6B52] border-none focus:ring-0 cursor-pointer uppercase py-1"
                            >
                                {Object.keys(LOCALES).map(lang => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))}
                            </select>
                        </div>

                        {/* User Profile */}
                        <UserMenu />

                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden p-2 text-[#7D6B52] hover:text-[#3C2F1F]"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </nav>
            </div>

            {/* Mobile Drawer */}
            <div className={cn('lg:hidden fixed inset-0 z-[100] transition-all duration-500', mobileMenuOpen ? 'visible' : 'invisible')}>
                <div 
                    className={cn('absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500', mobileMenuOpen ? 'opacity-100' : 'opacity-0')} 
                    onClick={() => setMobileMenuOpen(false)}
                />
                <div className={cn(
                    'absolute right-0 top-0 bottom-0 w-[80%] max-w-[320px] bg-[#FFF9F0] shadow-2xl transition-transform duration-500 flex flex-col',
                    mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                )}>
                    <div className="p-5 border-b border-[#F4EFE2] flex items-center justify-between">
                        <span className="font-bold text-[#3C2F1F] font-serif uppercase tracking-widest text-sm">Menu</span>
                        <button onClick={() => setMobileMenuOpen(false)} className="text-[#7D6B52]">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-1">
                        {navigation.map(item => (
                            <div key={item.href} className="flex flex-col">
                                <Link 
                                    href={item.href} 
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                        'px-4 py-3 rounded-lg font-medium text-[15px] transition-all',
                                        isActiveLink(item) ? 'bg-[#E6A229] text-white shadow-md' : 'text-[#7D6B52] active:bg-[#E6A229]/10'
                                    )}
                                >
                                    {getNavLabel(item, tNav, locale)}
                                </Link>
                                {item.children && (
                                    <div className="ml-4 border-l border-[#F4EFE2] flex flex-col pt-1">
                                        <Link
                                            href={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="px-6 py-2.5 text-[14px] text-[#E6A229] font-medium"
                                        >
                                            → Xem trang tổng hợp
                                        </Link>
                                        {item.children.map(child => (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="px-6 py-2.5 text-[14px] text-[#7D6B52] hover:text-[#3C2F1F]"
                                            >
                                                └ {getNavLabel(child, tNav, locale)}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-[#F4EFE2] space-y-4">
                        <div className="flex items-center justify-center gap-4">
                            {Object.entries(LOCALES).map(([code, name]) => (
                                <button
                                    key={code}
                                    onClick={() => switchLocale(code)}
                                    className={cn(
                                        'px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all',
                                        locale === code ? 'bg-[#3C2F1F] text-[#FFF9F0]' : 'text-[#7D6B52]'
                                    )}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
        </header>
    );
}
