'use client';

import React from 'react';
import Image from 'next/image';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import type { CategoryNode } from '@/lib/cache/queries';
import { BlockConfig } from '@/lib/types/layout-blocks';
import { SECTION_REGISTRY } from '@/lib/blocks-registry';
import { NavItem, buildNavigation, getNavLabel } from '@/lib/navigation';
import { TenantLogo } from '@/components/layout/tenant-logo';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { LOCALES, DEFAULT_SITE_NAME } from '@/lib/constants';
import { SearchModal } from '@/components/search/search-modal';

import { UserMenu } from '@/components/layout/user-menu';
import { LotusIcon } from '@/components/ui/khmer-icons';

// ─────────────────────────────────────────────────
// NavLink component
// ─────────────────────────────────────────────────

// ─────────────────────────────────────────────────
// NavLink component
// ─────────────────────────────────────────────────

const NavLink = React.memo(({
    item,
    isActive,
    onClick,
    locale
}: {
    item: NavItem;
    isActive: boolean;
    onClick?: () => void;
    locale: string;
}) => {
    const tNav = useTranslations('navigation');

    return (
        <Link
            href={item.href}
            onClick={onClick}
            prefetch={true}
            className={cn(
                'relative px-3 py-2 text-[14px] font-medium transition-all duration-200 rounded-lg min-h-[40px] flex items-center',
                'hover:bg-gray-100',
                isActive
                    ? 'text-primary font-bold bg-primary/5'
                    : 'text-gray-600 hover:text-gray-900',
                item.children && 'pr-1'
            )}
        >
            {getNavLabel(item, tNav, locale)}
        </Link>
    );
});

NavLink.displayName = 'NavLink';

// ─────────────────────────────────────────────────
// Recursive Desktop Minimal Menu Renderer
// ─────────────────────────────────────────────────

const DesktopNavNode = ({ item, t, locale, isActiveLink }: { item: NavItem; t: any; locale: string; isActiveLink: (href: string) => boolean }) => {
    const isRootActive = isActiveLink(item.href);
    const label = getNavLabel(item, t, locale);

    if (!item.children || item.children.length === 0) {
        if (item.variant === 'button') {
            return (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        'relative px-5 py-2.5 ml-3 text-[14px] font-medium tracking-wide rounded-full whitespace-nowrap flex items-center shadow-sm transition-all duration-300',
                        'bg-gray-900 text-white hover:bg-gray-800 hover:text-white',
                    )}
                >
                    <span className="relative z-10 flex items-center gap-2">
                        {label}
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </span>
                </Link>
            );
        }
        return <NavLink item={item} isActive={isRootActive} locale={locale} />;
    }

    if (item.variant === 'button') {
        return (
            <div className="group relative ml-3 mt-1 lg:mt-0">
                <Link
                    href={item.href}
                    className={cn(
                        'relative px-5 py-2.5 text-[14px] font-medium tracking-wide rounded-full whitespace-nowrap flex items-center shadow-sm transition-all duration-300',
                        'bg-gray-900 text-white hover:bg-gray-800 hover:text-white'
                    )}
                >
                    <span className="relative z-10 flex items-center gap-1.5">
                        {label}
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </span>
                </Link>

                {/* Dropdown Menu for Button Variant */}
                <div className="absolute top-full right-0 pt-3 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
                    <div className="bg-white border border-gray-100 shadow-xl rounded-xl p-3 min-w-[220px] relative mt-1 flex flex-col gap-1">
                        {item.children.map((child) => {
                            const isChildActive = isActiveLink(child.href);
                            return (
                                <div key={child.href} className="flex flex-col">
                                    <Link
                                        href={child.href}
                                        className={cn(
                                            "text-[14px] px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between",
                                            isChildActive 
                                                ? "font-bold text-primary bg-primary/5" 
                                                : "font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                                        )}
                                    >
                                        {getNavLabel(child, t, locale)}
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // Standard dropdown
    return (
        <div className="group">
            <Link
                href={item.href}
                className={cn(
                    'relative px-4 py-2 text-[14px] font-medium transition-all duration-200 rounded-lg min-h-[40px] flex items-center peer',
                    'hover:bg-gray-50 text-gray-600 hover:text-gray-900',
                    isRootActive && 'text-primary font-bold'
                )}
            >
                {label}
                <svg className="w-3.5 h-3.5 ml-1.5 opacity-40 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </Link>

            {/* Submenu Dropdown */}
            <div className="absolute top-full left-0 right-0 w-full flex justify-center pt-2 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto">
                <div className="bg-white border-t-2 border-primary shadow-xl p-5 min-w-[240px] w-max flex gap-4 mt-1 pointer-events-auto">
                    <div className="flex flex-row flex-wrap gap-x-8 gap-y-6 min-w-[220px] flex-1">
                        {item.children.map((child) => {
                            const hasGrandChildren = child.children && child.children.length > 0;
                            const isChildActive = isActiveLink(child.href);
                            return (
                                <div key={child.href} className="flex flex-col min-w-max">
                                    <Link
                                        href={child.href}
                                        className={cn(
                                            "text-[14px] mb-2 transition-colors",
                                            isChildActive ? "font-bold text-primary" : hasGrandChildren ? "font-semibold text-gray-900" : "font-semibold text-gray-600 hover:text-primary"
                                        )}
                                    >
                                        {getNavLabel(child, t, locale)}
                                    </Link>

                                    {hasGrandChildren && (
                                        <div className="flex flex-col space-y-2.5 mt-2 pl-2">
                                            {child.children!.map(grandChild => {
                                                const isGrandActive = isActiveLink(grandChild.href);
                                                return (
                                                    <Link
                                                        key={grandChild.href}
                                                        href={grandChild.href}
                                                        className={cn(
                                                            "text-[13px] transition-colors flex items-center gap-2",
                                                            isGrandActive 
                                                                ? "font-bold text-primary" 
                                                                : "font-medium text-gray-500 hover:text-primary"
                                                        )}
                                                    >
                                                        <span className={cn("w-1 h-1 rounded-full block", isGrandActive ? "bg-primary" : "bg-gray-300")} />
                                                        {getNavLabel(grandChild, t, locale)}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────
// Mobile Nav Node (Minimal)
// ─────────────────────────────────────────────────

const MobileNavNode = ({ item, t, locale, isActiveLink, closeMenu, expandedNodes, toggleAccordion, depth = 0 }: any) => {
    const active = isActiveLink(item.href);
    const label = getNavLabel(item, t, locale);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedNodes[item.href];

    if (!hasChildren) {
        if (item.variant === 'button') {
            return (
                <Link
                    href={item.href}
                    onClick={closeMenu}
                    className={cn(
                        'flex items-center justify-between px-4 py-3 min-h-[44px] text-sm font-semibold rounded-lg transition-all mt-4 border border-gray-200 bg-gray-50 text-gray-900',
                        depth > 0 && 'ml-4'
                    )}
                >
                    {label}
                    <span className="text-gray-400">→</span>
                </Link>
            );
        }
        return (
            <Link
                href={item.href}
                onClick={closeMenu}
                className={cn(
                    'flex items-center px-4 py-3 min-h-[44px] text-[14px] font-medium rounded-lg transition-all',
                    active
                        ? 'bg-primary/5 text-primary'
                        : 'text-gray-600 active:bg-gray-50',
                    depth > 0 && `border-l border-gray-100`,
                    depth === 0 && 'uppercase tracking-wide font-semibold'
                )}
                style={{ marginLeft: depth > 0 ? `${depth * 0.75}rem` : undefined }}
            >
                {label}
            </Link>
        );
    }

    return (
        <div className="w-full flex-col flex mt-1">
            <button
                onClick={() => toggleAccordion(item.href)}
                className={cn(
                    'flex items-center justify-between w-full px-4 py-3 min-h-[44px] rounded-lg transition-all font-medium text-[14px]',
                    item.variant === 'button'
                        ? 'bg-gray-900 text-white mt-4 border-none'
                        : active
                            ? 'text-primary font-semibold'
                            : 'text-gray-800 active:bg-gray-50',
                    depth > 0 && `border-l border-gray-100`
                )}
                style={{ marginLeft: depth > 0 ? `${depth * 0.75}rem` : undefined }}
            >
                <div className="flex items-center text-left">
                    <span>{label}</span>
                </div>
                <svg
                    className={cn('w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ml-2', isExpanded && 'rotate-180')}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div className={cn(
                'overflow-hidden transition-all duration-300 flex flex-col',
                isExpanded ? 'max-h-[1000px] opacity-100 mt-1' : 'max-h-0 opacity-0'
            )}>
                <Link
                    href={item.href}
                    onClick={closeMenu}
                    className="flex items-center px-4 py-2 min-h-[40px] text-[12px] font-medium text-pink-600/80 uppercase tracking-widest rounded-lg active:bg-pink-50 transition-colors mb-1"
                    style={{ marginLeft: `${(depth + 1) * 0.75}rem` }}
                >
                    <span className="mr-2">→</span> Xem trang tổng hợp
                </Link>
                {item.children.map((child: any) => (
                    <MobileNavNode
                        key={child.href}
                        item={child}
                        t={t}
                        locale={locale}
                        isActiveLink={isActiveLink}
                        closeMenu={closeMenu}
                        expandedNodes={expandedNodes}
                        toggleAccordion={toggleAccordion}
                        depth={depth + 1}
                    />
                ))}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────
// MINIMAL Header component
// ─────────────────────────────────────────────────

export function LotusHeader({
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
    const t = useTranslations('common');
    const tNav = useTranslations('navigation');

    const navigation = React.useMemo(() => buildNavigation({
        layoutBlocks,
        categoriesTree,
        pagesTree,
        aboutSectionsTree,
        modulesConfig,
        isCompany,
        hasProjects,
        navVisibility
    }), [layoutBlocks, categoriesTree, pagesTree, aboutSectionsTree, modulesConfig, isCompany, hasProjects, navVisibility]);

    const isActiveLink = React.useCallback((href: string) => {
        if (href === '/') {
            return pathname === '/';
        }
        return pathname === href || pathname.startsWith(href + '/');
    }, [pathname]);

    const switchLocale = React.useCallback((newLocale: string) => {
        router.replace(pathname, { locale: newLocale as any });
    }, [pathname, router]);

    const closeMobileMenu = React.useCallback(() => {
        setMobileMenuOpen(false);
    }, []);

    React.useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            setExpandedNodes({});
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    const toggleAccordion = (href: string) => {
        setExpandedNodes(prev => ({
            ...prev,
            [href]: !prev[href]
        }));
    };

    return (
        <header className="sticky top-0 z-50 w-full" suppressHydrationWarning>
            {/* ── Top Tier (White) ── */}
            <div className="border-b border-primary/20 relative overflow-hidden" style={{ backgroundColor: 'var(--theme-header-bg, #ffffff)' }}>
                {/* Subtle pattern background */}
                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z' fill='%23C73B2A' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                        backgroundSize: '30px 30px'
                    }}
                />

                <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 py-2.5 lg:px-8 relative z-10" aria-label="Main navigation" suppressHydrationWarning>

                    {/* Lotus Logo */}
                    <Link href="/" className="group flex-shrink-0 flex items-center gap-3" prefetch={true}>
                        <TenantLogo 
                            src={settings['site_logo']} 
                            alt={settings['site_name_vi']} 
                            variant="circle" 
                            size="lg" 
                            className="border-2 border-primary/20 bg-white"
                            fallbackIcon={<LotusIcon className="w-8 h-8 text-primary" />}
                        />
                        <div className="flex flex-col">
                            <span className="text-[19px] font-black tracking-wide leading-tight" style={{ fontFamily: 'Georgia, serif', color: 'rgb(var(--theme-text))' }}>
                                {settings['site_name_vi'] || DEFAULT_SITE_NAME}
                            </span>
                            <span className="text-[11px] font-bold tracking-[0.2em] uppercase mt-0.5 leading-none" style={{ color: 'rgb(var(--theme-primary))' }}>
                                {settings['site_name_en'] || 'Buddhist Tenant'}
                            </span>
                        </div>
                    </Link>

                    {/* Right side controls (Top Tier) */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="flex items-center justify-center h-10 w-10 text-gray-700 hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
                            aria-label="Search"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        <div className="hidden lg:block">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-1.5 h-10 px-3 text-[13px] font-bold text-gray-700 hover:text-primary hover:bg-primary/5 rounded-full transition-colors">
                                        <span className="uppercase tracking-wide">{locale}</span>
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="min-w-[120px] bg-white border border-primary/10 rounded-xl shadow-lg p-1.5">
                                    {Object.entries(LOCALES).map(([code, name]) => (
                                        <DropdownMenuItem
                                            key={code}
                                            onClick={() => switchLocale(code)}
                                            className={cn(
                                                'cursor-pointer transition-colors text-[13px] font-bold tracking-wide rounded-lg py-2 px-3 focus:bg-primary/5',
                                                locale === code && 'text-primary bg-primary/10'
                                            )}
                                        >
                                            {name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="hidden lg:flex items-center">
                            <UserMenu />
                        </div>

                        {/* Mobile Menu Icon */}
                        <div className="flex lg:hidden items-center border-l border-primary/20 pl-3 ml-1">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="flex items-center justify-center h-10 w-10 text-primary bg-primary/5 hover:bg-primary/10 rounded-full transition-colors"
                            >
                                {mobileMenuOpen ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </nav>
            </div>

            {/* ── Bottom Tier (Red/Primary Menu Bar) ── */}
            <div className="hidden lg:block bg-gradient-to-r from-red-800 to-red-900 shadow-md">
                <nav className="mx-auto flex max-w-7xl items-center justify-center gap-1 px-4 sm:px-6 lg:px-8 h-12 relative" aria-label="Secondary navigation">
                    {navigation.map((item) => (
                        <div key={item.href} className="group/bottom-nav relative h-full flex items-center">
                            {item.children ? (
                                <Link
                                    href={item.href}
                                    className={cn(
                                        'px-4 h-full flex items-center text-[13px] font-bold text-white/90 uppercase tracking-widest transition-colors hover:text-white',
                                        isActiveLink(item.href) && 'text-white border-b-2 border-yellow-400 bg-black/10'
                                    )}
                                >
                                    {getNavLabel(item, tNav, locale)}
                                    <svg className="w-3.5 h-3.5 ml-1.5 opacity-70 group-hover/bottom-nav:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </Link>
                            ) : (
                                <Link
                                    href={item.href}
                                    className={cn(
                                        'px-4 h-full flex items-center text-[13px] font-bold text-white/90 uppercase tracking-widest transition-colors hover:text-white hover:bg-black/10',
                                        isActiveLink(item.href) && 'text-white border-b-2 border-yellow-400 bg-black/10'
                                    )}
                                >
                                    {getNavLabel(item, tNav, locale)}
                                </Link>
                            )}

                            {/* Dropdown (Matches Lotus Style) */}
                            {item.children && (
                                <div className="absolute top-full left-0 right-0 w-full flex justify-center pt-2 opacity-0 invisible translate-y-2 group-hover/bottom-nav:opacity-100 group-hover/bottom-nav:visible group-hover/bottom-nav:translate-y-0 transition-all duration-200 z-50 pointer-events-none group-hover/bottom-nav:pointer-events-auto">
                                    <div className="bg-white border-t-2 border-primary shadow-xl p-4 min-w-[240px] flex flex-row flex-wrap gap-x-10 gap-y-6 w-max max-w-screen-xl pointer-events-auto">
                                        {item.children.map((child) => (
                                            <div key={child.href} className="flex flex-col">
                                                <Link
                                                    href={child.href}
                                                    className="text-[14px] font-bold text-gray-800 hover:text-primary hover:bg-primary/5 px-4 py-2.5 transition-colors border-l-2 border-transparent hover:border-primary"
                                                >
                                                    {getNavLabel(child, tNav, locale)}
                                                </Link>
                                                {child.children && child.children.length > 0 && (
                                                    <div className="flex flex-col ml-4 border-l border-gray-100 pl-2 mt-1 mb-2 space-y-1">
                                                        {child.children.map(grandChild => (
                                                            <Link
                                                                key={grandChild.href}
                                                                href={grandChild.href}
                                                                className="text-[13px] text-gray-500 font-medium hover:text-primary py-1.5 px-3 hover:bg-gray-50 transition-colors"
                                                            >
                                                                {getNavLabel(grandChild, tNav, locale)}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </div>

            {/* ── Mobile Drawer (Red/Primary Theme) ── */}
            <div className={cn(
                'lg:hidden fixed inset-0 top-[65px] z-40 transition-opacity duration-300',
                mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            )}>
                <div className={cn(
                    'absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300',
                    mobileMenuOpen ? 'opacity-100' : 'opacity-0'
                )} onClick={closeMobileMenu} />

                <div className={cn(
                    'absolute right-0 top-0 bottom-0 w-[85%] max-w-[340px] bg-white shadow-2xl overflow-y-auto overscroll-contain transition-transform duration-300 flex flex-col',
                    mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                )}>
                    {/* Dark Red Header in Drawer */}
                    <div className="bg-gradient-to-r from-red-800 to-red-900 border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                        <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-white/90">Danh Mục Trang</span>
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white" onClick={closeMobileMenu}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    </div>

                    {/* Nav items */}
                    <nav className="px-4 py-4 flex-1" aria-label="Mobile navigation">
                        {navigation.map((item) => (
                            <MobileNavNode
                                key={item.href}
                                item={item}
                                t={tNav}
                                locale={locale}
                                isActiveLink={isActiveLink}
                                closeMenu={closeMobileMenu}
                                expandedNodes={expandedNodes}
                                toggleAccordion={toggleAccordion}
                            />
                        ))}
                    </nav>

                    {/* Language & Utilities */}
                    <div className="bg-gray-50 px-5 py-6 border-t border-gray-100 flex flex-col gap-4 mt-auto">
                        <div className="flex items-center justify-center gap-4">
                            {Object.entries(LOCALES).map(([code, name]) => (
                                <button
                                    key={code}
                                    onClick={() => { switchLocale(code); closeMobileMenu(); }}
                                    className={cn(
                                        'px-4 py-2 text-[13px] font-bold tracking-wide uppercase rounded-full transition-all border-2',
                                        locale === code
                                            ? 'border-primary text-primary bg-primary/5'
                                            : 'border-transparent text-gray-500 hover:bg-gray-200'
                                    )}
                                >
                                    {code}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-center pt-2">
                            <UserMenu />
                        </div>
                    </div>
                </div>
            </div>

            <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
        </header>
    );
}
