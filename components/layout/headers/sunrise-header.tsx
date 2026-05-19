'use client';

import React from 'react';
import Image from 'next/image';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import type { CategoryNode } from '@/lib/cache/queries';
import { PageNode, NavItem, buildNavigation, getNavLabel } from '@/lib/navigation';
import { TenantLogo } from '@/components/layout/tenant-logo';
import { BlockConfig } from '@/lib/types/layout-blocks';
import { SECTION_REGISTRY } from '@/lib/blocks-registry';

// ─────────────────────────────────────────────────
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
                'relative px-3 py-2 text-[14px] font-medium transition-all duration-300 rounded-lg min-h-[40px] flex items-center',
                'hover:bg-[#FFF5E4]',
                isActive
                    ? 'text-[#D97706] font-bold bg-[#FFD1D1]/30'
                    : 'text-[#8B322C]/80 hover:text-[#8B322C]',
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
                                                ? "font-bold text-[#D97706] bg-[#FFD1D1]/30" 
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

    return (
        <div className="group">
            <Link
                href={item.href}
                className={cn(
                    'relative px-4 py-2 text-[14px] font-medium transition-all duration-300 rounded-lg min-h-[40px] flex items-center peer',
                    'hover:bg-[#FFF5E4] text-[#8B322C]/80 hover:text-[#8B322C]',
                    isRootActive && 'text-[#D97706] font-bold bg-[#FFD1D1]/30'
                )}
            >
                {label}
                <svg className="w-3.5 h-3.5 ml-1.5 opacity-40 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </Link>

            {/* Submenu Dropdown */}
            <div className="absolute top-full left-0 right-0 w-full flex justify-center pt-2 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50 pointer-events-none group-hover:pointer-events-auto">
                <div className="bg-white border border-[#FFE3E1] shadow-xl rounded-xl p-5 min-w-[240px] w-max flex gap-4 mt-1 relative pointer-events-auto">
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
                                            isChildActive ? "font-bold text-[#D97706]" : hasGrandChildren ? "font-semibold text-[#8B322C]" : "font-semibold text-[#8B322C]/80 hover:text-[#D97706]"
                                        )}
                                    >
                                        {getNavLabel(child, t, locale)}
                                    </Link>

                                    {hasGrandChildren && (
                                        <div className="flex flex-col space-y-2.5 mt-2 pl-2 border-l-2 border-[#FFE3E1]">
                                            {child.children!.map(grandChild => {
                                                const isGrandActive = isActiveLink(grandChild.href);
                                                return (
                                                    <Link
                                                        key={grandChild.href}
                                                        href={grandChild.href}
                                                        className={cn(
                                                            "text-[13px] transition-colors flex items-center gap-2",
                                                            isGrandActive 
                                                                ? "font-bold text-[#D97706]" 
                                                                : "font-medium text-[#A6615C] hover:text-[#D97706]"
                                                        )}
                                                    >
                                                        <span className={cn("w-1.5 h-1.5 rounded-full block", isGrandActive ? "bg-[#D97706]" : "bg-[#FFD1D1]")} />
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
                        'flex items-center justify-between px-4 py-3 min-h-[44px] text-[14px] font-semibold rounded-lg transition-all mt-4 border border-[#FFE3E1] bg-[#FFF5E4] text-[#8B322C]',
                        depth > 0 && 'ml-4'
                    )}
                >
                    {label}
                    <span className="text-[#A6615C]">→</span>
                </Link>
            );
        }
        return (
            <Link
                href={item.href}
                onClick={closeMenu}
                className={cn(
                    'flex items-center px-4 py-3 min-h-[44px] text-[14px] font-medium rounded-lg transition-all border-b border-[#FFE3E1]',
                    active
                        ? 'bg-[#FFD1D1]/30 text-[#D97706]'
                        : 'text-[#8B322C]/80 active:bg-[#FFF5E4]',
                    depth > 0 && `border-l-2 border-b-0 border-[#FFE3E1]`,
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
                        ? 'bg-[#8B322C] text-white mt-4 border-none'
                        : active
                            ? 'text-[#D97706] font-semibold border-b border-[#FFE3E1]'
                            : 'text-[#8B322C] active:bg-[#FFF5E4] border-b border-[#FFE3E1]',
                    depth > 0 && `border-l-2 border-[#FFE3E1] border-b-0`
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
                    className="flex items-center px-4 py-2 min-h-[40px] text-[12px] font-medium text-orange-600/80 uppercase tracking-widest rounded-lg active:bg-orange-50 transition-colors mb-1"
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

export function SunriseHeader({
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
}: {
    settings?: Record<string, string>,
    categoriesTree?: { news: CategoryNode[], dharma: CategoryNode[], documents: CategoryNode[], transactions?: CategoryNode[] },
    pagesTree?: PageNode[],
    aboutSectionsTree?: CategoryNode[],
    layoutBlocks?: BlockConfig[],
    domain?: string,
    modulesConfig?: Record<string, boolean>,
    isCompany?: boolean,
    hasProjects?: boolean,
    navVisibility?: Record<string, boolean>
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [searchOpen, setSearchOpen] = React.useState(false);
    const [expandedNodes, setExpandedNodes] = React.useState<Record<string, boolean>>({});
    const pathname = usePathname();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('common');
    const tNav = useTranslations('navigation');

    const navigation = React.useMemo(() => buildNavigation({ categoriesTree, pagesTree, aboutSectionsTree, layoutBlocks, modulesConfig, isCompany, hasProjects, navVisibility }), [categoriesTree, pagesTree, aboutSectionsTree, layoutBlocks, modulesConfig, isCompany, hasProjects, navVisibility]);

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
            {/* ── Main Minimal Bar ── */}
            <div className="backdrop-blur-md border-b border-[#FFD1D1] shadow-sm" style={{ background: 'var(--theme-header-bg, linear-gradient(to right, rgba(255, 245, 228, 0.95), rgba(255, 227, 225, 0.95), rgba(255, 209, 209, 0.95)))' }}>
                <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 py-3 lg:px-8 relative" aria-label="Main navigation" suppressHydrationWarning>
                    
                    {/* Minimal Logo Container */}
                    <div className="flex-1 flex justify-start">
                        <Link href="/" className="group flex-shrink-0 flex items-center gap-3" prefetch={true}>
                            <TenantLogo 
                                src={settings['site_logo']} 
                                alt={settings['site_name_vi']} 
                                variant="circle" 
                                size="md" 
                                className="bg-white/50 border-[#8B322C]/20 shadow-sm"
                            />
                            <div className="flex flex-col">
                                <span className="text-lg font-inter font-bold text-[#8B322C] leading-tight">
                                    {settings['site_name_vi'] || DEFAULT_SITE_NAME}
                                </span>
                                <span className="text-[10px] text-[#A6615C] font-medium tracking-widest uppercase mt-0.5 leading-none">
                                    {settings['site_name_en'] || 'Buddhist Tenant'}
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center justify-center gap-2 group/nav">
                        {navigation.map((item) => (
                            <DesktopNavNode key={item.href} item={item} t={tNav} locale={locale} isActiveLink={isActiveLink} />
                        ))}
                    </div>

                    {/* Right side controls Container */}
                    <div className="flex-1 flex items-center justify-end gap-3">
                        {/* Search icon */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="flex items-center justify-center h-10 w-10 text-[#8B322C]/70 hover:text-[#8B322C] hover:bg-white/50 rounded-full transition-all shadow-sm border border-transparent hover:border-[#8B322C]/20"
                            aria-label="Search"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        {/* Language switcher */}
                        <div className="hidden lg:block">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-1.5 h-10 px-3 text-[13px] font-semibold text-[#8B322C]/70 hover:text-[#8B322C] hover:bg-white/50 rounded-full transition-all border border-[#8B322C]/20 shadow-sm">
                                        <span className="uppercase">{locale}</span>
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="min-w-[120px] bg-white border border-[#FFE3E1] rounded-xl shadow-lg p-1.5">
                                    {Object.entries(LOCALES).map(([code, name]) => (
                                        <DropdownMenuItem
                                            key={code}
                                            onClick={() => switchLocale(code)}
                                            className={cn(
                                                'cursor-pointer transition-colors text-[13px] font-medium rounded-lg py-2 px-3 focus:bg-[#FFF5E4]',
                                                locale === code ? 'text-[#8B322C] bg-[#FFF5E4] font-bold' : 'text-gray-700'
                                            )}
                                        >
                                            {name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* User Profile */}
                        <div className="hidden lg:flex items-center">
                            <UserMenu />
                        </div>

                        {/* Mobile Menu Icon */}
                        <div className="flex lg:hidden items-center">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="flex items-center justify-center h-10 w-10 text-[#8B322C] hover:bg-white/50 rounded-lg transition-all border border-[#8B322C]/20 shadow-sm"
                            >
                                {mobileMenuOpen ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </nav>
            </div>

            {/* ── Mobile Drawer ── */}
            <div className={cn(
                'lg:hidden fixed inset-0 top-[65px] z-40 transition-opacity duration-300',
                mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            )}>
                <div className={cn(
                    'absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
                    mobileMenuOpen ? 'opacity-100' : 'opacity-0'
                )} onClick={closeMobileMenu} />

                <div className={cn(
                    'absolute right-0 top-0 bottom-0 w-[85%] max-w-[340px] bg-gradient-to-b from-[#FFF5E4] to-[#FFE3E1] shadow-2xl overflow-y-auto overscroll-contain transition-transform duration-300',
                    mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                )}>
                    {/* Nav items */}
                    <nav className="px-5 py-6" aria-label="Mobile navigation">
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
                    <div className="bg-white/60 px-5 py-6 border-t border-[#FFD1D1] flex flex-col gap-5">
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(LOCALES).map(([code, name]) => (
                                <button
                                    key={code}
                                    onClick={() => { switchLocale(code); closeMobileMenu(); }}
                                    className={cn(
                                        'py-3 text-[13px] font-semibold rounded-xl transition-all border',
                                        locale === code
                                            ? 'bg-white border-[#8B322C]/40 text-[#8B322C] shadow-sm shadow-[#8B322C]/10'
                                            : 'bg-white/80 border-transparent text-[#8B322C]/70 hover:bg-white'
                                    )}
                                >
                                    {name}
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
