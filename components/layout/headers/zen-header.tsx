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
                <div className="bg-white border border-gray-100 shadow-xl rounded-xl p-5 min-w-[240px] w-max flex gap-4 mt-1 pointer-events-auto">
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
                    className="flex items-center px-4 py-2 min-h-[40px] text-[11px] font-semibold text-stone-600 uppercase tracking-widest rounded-lg active:bg-stone-100 transition-colors mb-1"
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
// ZEN Header component
// ─────────────────────────────────────────────────

export function ZenHeader({
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
    const [scrolled, setScrolled] = React.useState(false);
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
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
        <header className={cn(
            "fixed top-0 w-full z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
            scrolled ? "backdrop-blur-xl border-b border-[#E1E7E3]/60 shadow-[0_4px_30px_rgba(0,0,0,0.02)] py-2" : "bg-transparent py-4"
        )} style={scrolled ? { backgroundColor: 'var(--theme-header-bg, rgba(255, 255, 255, 0.7))' } : {}} suppressHydrationWarning>
            {/* ── Main Zen Bar ── */}
            <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 lg:px-12 relative" aria-label="Main navigation" suppressHydrationWarning>
                
                {/* Zen Logo Container */}
                <div className="flex-1 flex justify-start">
                    <Link href="/" className="group flex-shrink-0 flex items-center gap-4" prefetch={true}>
                        <TenantLogo 
                            src={settings['site_logo']} 
                            alt={settings['site_name_vi']} 
                            variant="adaptive" 
                            size={scrolled ? "sm" : "md"} 
                            className="bg-white/50 border-[#E1E7E3]/50 shadow-sm"
                        />
                        <div className="flex flex-col justify-center">
                            <span className={cn(
                                "font-light tracking-[0.05em] text-[#2C3E35] transition-all duration-700",
                                scrolled ? "text-lg" : "text-xl"
                            )}>
                                {settings['site_name_vi'] || DEFAULT_SITE_NAME}
                            </span>
                            <span className="text-[10px] text-[#86968D] font-light tracking-[0.2em] uppercase mt-0.5">
                                {settings['site_name_en'] || 'Buddhist Tenant'}
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center justify-center gap-6 group/nav">
                    {navigation.map((item) => {
                        const isRootActive = isActiveLink(item.href);
                        const label = getNavLabel(item, tNav, locale);

                        // Custom Zen NavNodes inline to avoid prop drilling and keep it contained
                        if (!item.children || item.children.length === 0) {
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    prefetch={true}
                                    className={cn(
                                        'relative py-2 text-[14px] font-light tracking-wide transition-all duration-300',
                                        isRootActive
                                            ? 'text-[#4A6B5D]'
                                            : 'text-[#6B7C73] hover:text-[#2C3E35]',
                                        item.variant === 'button' && 'px-6 py-2.5 ml-4 rounded-full border border-[#D1DDD6] hover:bg-[#F2F5F3] bg-white/50 backdrop-blur-sm'
                                    )}
                                >
                                    {label}
                                    {isRootActive && item.variant !== 'button' && (
                                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#4A6B5D]" />
                                    )}
                                </Link>
                            );
                        }

                        return (
                            <div key={item.href} className="group relative">
                                <Link
                                    href={item.href}
                                    className={cn(
                                        'relative py-2 text-[14px] font-light tracking-wide transition-all duration-300 flex items-center gap-1.5',
                                        isRootActive
                                            ? 'text-[#4A6B5D]'
                                            : 'text-[#6B7C73] hover:text-[#2C3E35]'
                                    )}
                                >
                                    {label}
                                    <svg className="w-3.5 h-3.5 opacity-50 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                    {isRootActive && (
                                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#4A6B5D]" />
                                    )}
                                </Link>

                                {/* Zen Dropdown */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-6 opacity-0 invisible translate-y-3 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-50">
                                    <div className="bg-white/90 backdrop-blur-2xl border border-[#E1E7E3]/60 shadow-[0_10px_40px_rgba(0,0,0,0.04)] rounded-2xl p-6 min-w-[260px] flex gap-6">
                                        <div className="flex flex-row flex-wrap gap-x-10 gap-y-6 flex-1">
                                            {item.children.map((child: any) => {
                                                const hasGrandChildren = child.children && child.children.length > 0;
                                                return (
                                                    <div key={child.href} className="flex flex-col min-w-max">
                                                        <Link
                                                            href={child.href}
                                                            className={cn(
                                                                "text-[14px] tracking-wide mb-3 transition-colors",
                                                                hasGrandChildren ? "font-medium text-[#2C3E35]" : "font-light text-[#6B7C73] hover:text-[#4A6B5D]"
                                                            )}
                                                        >
                                                            {getNavLabel(child, tNav, locale)}
                                                        </Link>

                                                        {hasGrandChildren && (
                                                            <div className="flex flex-col space-y-3 pl-1 border-l border-[#E1E7E3]/60 ml-1">
                                                                {child.children.map((grandChild: any) => (
                                                                    <Link
                                                                        key={grandChild.href}
                                                                        href={grandChild.href}
                                                                        className="text-[13px] text-[#86968D] hover:text-[#4A6B5D] font-light transition-colors pl-3 relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-[1px] before:bg-transparent hover:before:bg-[#4A6B5D] before:transition-colors"
                                                                    >
                                                                        {getNavLabel(grandChild, tNav, locale)}
                                                                    </Link>
                                                                ))}
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
                    })}
                </div>

                {/* Right side controls Container */}
                <div className="flex-1 flex items-center justify-end gap-4">
                    {/* Search icon */}
                    <button
                        onClick={() => setSearchOpen(true)}
                        className="flex items-center justify-center h-10 w-10 text-[#6B7C73] hover:text-[#2C3E35] bg-white/50 hover:bg-white backdrop-blur-sm rounded-full transition-all duration-300 shadow-sm border border-[#E1E7E3]/50"
                        aria-label="Search"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>

                    {/* Language switcher */}
                    <div className="hidden lg:block relative group">
                        <button className="flex items-center gap-1.5 h-10 px-4 text-[13px] font-light tracking-widest text-[#6B7C73] hover:text-[#2C3E35] bg-white/50 hover:bg-white backdrop-blur-sm rounded-full transition-all duration-300 shadow-sm border border-[#E1E7E3]/50">
                            <span className="uppercase">{locale}</span>
                            <svg className="w-3 h-3 opacity-60 ml-0.5 group-hover:rotate-180 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className="absolute top-full right-0 pt-4 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-50">
                            <div className="min-w-[120px] bg-white/90 backdrop-blur-2xl border border-[#E1E7E3]/60 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] p-1.5 flex flex-col gap-0.5">
                                {Object.entries(LOCALES).map(([code, name]) => (
                                    <button
                                        key={code}
                                        onClick={() => switchLocale(code)}
                                        className={cn(
                                            'text-left transition-colors text-[13px] font-light tracking-wide rounded-xl py-2 px-4 hover:bg-[#F2F5F3]',
                                            locale === code ? 'text-[#4A6B5D] bg-[#F2F5F3]' : 'text-[#6B7C73]'
                                        )}
                                    >
                                        {name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* User Profile */}
                    <div className="hidden lg:flex items-center">
                        <button className="flex items-center justify-center h-10 w-10 text-[#6B7C73] hover:text-[#2C3E35] bg-white/50 hover:bg-white backdrop-blur-sm rounded-full transition-all duration-300 shadow-sm border border-[#E1E7E3]/50">
                            <UserMenu />
                        </button>
                    </div>

                    {/* Mobile Menu Icon */}
                    <div className="flex lg:hidden items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="flex items-center justify-center h-10 w-10 text-[#6B7C73] hover:text-[#2C3E35] bg-white/50 backdrop-blur-sm rounded-full transition-all duration-300 shadow-sm border border-[#E1E7E3]/50"
                        >
                            <div className="flex flex-col gap-1.5 items-center justify-center w-full h-full relative">
                                <span className={cn("w-4 h-[1.5px] bg-current transition-all duration-500 absolute", mobileMenuOpen ? "rotate-45" : "-translate-y-1.5")} />
                                <span className={cn("w-4 h-[1.5px] bg-current transition-all duration-500 absolute", mobileMenuOpen ? "opacity-0" : "opacity-100")} />
                                <span className={cn("w-4 h-[1.5px] bg-current transition-all duration-500 absolute", mobileMenuOpen ? "-rotate-45" : "translate-y-1.5")} />
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Mobile Drawer ── */}
            <div className={cn(
                'lg:hidden fixed inset-0 z-40 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
                mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none fade-out'
            )}>
                <div className={cn(
                    'absolute inset-0 bg-[#2C3E35]/10 backdrop-blur-md transition-opacity duration-700',
                    mobileMenuOpen ? 'opacity-100' : 'opacity-0'
                )} onClick={closeMobileMenu} />

                <div className={cn(
                    'absolute right-0 top-0 bottom-0 w-[85%] max-w-[360px] bg-white/95 backdrop-blur-2xl shadow-[-10px_0_40px_rgba(0,0,0,0.05)] overflow-y-auto overscroll-contain transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col',
                    mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                )}>

                    <div className="flex justify-end p-6 border-b border-[#E1E7E3]/50">
                        <button
                            onClick={closeMobileMenu}
                            className="flex items-center justify-center h-10 w-10 text-[#86968D] hover:text-[#2C3E35] bg-[#F2F5F3] rounded-full transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <nav className="flex-1 px-8 py-8" aria-label="Mobile navigation">
                        <div className="flex flex-col gap-6">
                            {navigation.map((item) => {
                                const active = isActiveLink(item.href);
                                const label = getNavLabel(item, tNav, locale);
                                const hasChildren = item.children && item.children.length > 0;
                                const isExpanded = expandedNodes[item.href];

                                return (
                                    <div key={item.href} className="flex flex-col border-b border-[#E1E7E3]/30 pb-4 last:border-0">
                                        <div className="flex items-center justify-between">
                                            <Link
                                                href={item.href}
                                                onClick={!hasChildren ? closeMobileMenu : undefined}
                                                className={cn(
                                                    'text-[15px] font-light tracking-wide transition-colors',
                                                    active ? 'text-[#4A6B5D] font-medium' : 'text-[#6B7C73]'
                                                )}
                                            >
                                                {label}
                                            </Link>

                                            {hasChildren && (
                                                <button
                                                    onClick={() => toggleAccordion(item.href)}
                                                    className="p-2 text-[#86968D]"
                                                >
                                                    <svg
                                                        className={cn('w-4 h-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]', isExpanded && 'rotate-180')}
                                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>

                                        {hasChildren && (
                                            <div className={cn(
                                                'overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col gap-4',
                                                isExpanded ? 'max-h-[1000px] opacity-100 mt-4 pl-4 border-l border-[#E1E7E3]/60' : 'max-h-0 opacity-0'
                                            )}>
                                                {item.children!.map((child: any) => (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        onClick={closeMobileMenu}
                                                        className="text-[14px] text-[#86968D] font-light"
                                                    >
                                                        {getNavLabel(child, tNav, locale)}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </nav>

                    {/* Utilities at bottom */}
                    <div className="p-8 border-t border-[#E1E7E3]/50 bg-[#F9FAF9]">
                        <div className="flex items-center gap-4 justify-between mb-6">
                            <span className="text-[11px] font-light tracking-widest text-[#86968D] uppercase">Ngôn ngữ</span>
                            <div className="flex gap-2">
                                {Object.entries(LOCALES).map(([code, name]) => (
                                    <button
                                        key={code}
                                        onClick={() => { switchLocale(code); closeMobileMenu(); }}
                                        className={cn(
                                            'px-3 py-1.5 text-[11px] font-medium tracking-wide rounded-full transition-all border',
                                            locale === code
                                                ? 'bg-[#4A6B5D] border-[#4A6B5D] text-white'
                                                : 'bg-transparent border-[#D1DDD6] text-[#6B7C73] hover:border-[#86968D]'
                                        )}
                                    >
                                        {code.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <UserMenu />
                        </div>
                    </div>
                </div>
            </div>

            <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
        </header>
    );
}

