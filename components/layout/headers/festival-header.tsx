'use client';

import React from 'react';
import Image from 'next/image';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
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
import { 
    Home, 
    Bell, 
    Library, 
    Coins, 
    Mail, 
    Scroll, 
    Building2,
    Search as SearchIcon
} from 'lucide-react';
import { 
    LotusIcon, 
    DharmaWheelIcon, 
    HandsPrayerIcon, 
    TenantIcon 
} from '@/components/ui/khmer-icons';

// ─────────────────────────────────────────────────
// Get icon for nav item
// ─────────────────────────────────────────────────

const getIconForNavItem = (item: NavItem, className?: string) => {
    const key = item.nameKey || item.node?.slug;
    if (!key) return null;

    const mapping: Record<string, React.ReactNode> = {
        'home': <Home className={className} />,
        'about': <LotusIcon className={className} />,
        'news': <Bell className={className} />,
        'dharma_talks': <DharmaWheelIcon className={className} />,
        'documents': <Library className={className} />,
        'transaction': <Coins className={className} />,
        'contact': <Mail className={className} />,
        'transaction_give': <HandsPrayerIcon className={className} />,
        'transaction_merit': <Scroll className={className} />,
        'transaction_projects': <TenantIcon className={className} />,
    };

    return mapping[key] || null;
};

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
                'relative px-3 py-2 text-[14px] font-medium transition-all duration-200 rounded-lg min-h-[40px] flex items-center gap-1.5',
                'hover:bg-[#FFD700]/10 hover:text-[#FFD700] hover:shadow-[0_0_10px_rgba(255,215,0,0.3)]',
                isActive
                    ? 'text-[#FFD700] font-bold shadow-[0_0_15px_rgba(255,215,0,0.5)] bg-[#FFD700]/10'
                    : 'text-[#FFF8E7]/85',
                item.children && 'pr-1'
            )}
        >
            <span className="opacity-70 group-hover:opacity-100 transition-opacity flex items-center shrink-0">
                {getIconForNavItem(item, "w-4 h-4")}
            </span>
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
                        'relative px-5 py-2.5 ml-3 text-[14px] font-bold tracking-wide rounded-full whitespace-nowrap flex items-center shadow-[0_0_15px_rgba(255,77,109,0.4)] transition-all duration-300',
                        'bg-[#FF4D6D] text-white hover:bg-[#FF4D6D]/90 hover:shadow-[0_0_20px_rgba(255,77,109,0.6)]',
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
                        'relative px-5 py-2.5 text-[14px] font-bold tracking-wide rounded-full whitespace-nowrap flex items-center shadow-[0_0_15px_rgba(255,77,109,0.4)] transition-all duration-300',
                        'bg-[#FF4D6D] text-white hover:bg-[#FF4D6D]/90 hover:shadow-[0_0_20px_rgba(255,77,109,0.6)]'
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
                    <div className="bg-[#12023A]/95 backdrop-blur-md border border-[#FFD700]/20 shadow-[0_0_30px_rgba(255,215,0,0.15)] rounded-xl p-3 min-w-[220px] relative mt-1 flex flex-col gap-1">
                        {item.children.map((child) => {
                            const isChildActive = isActiveLink(child.href);
                            return (
                                <div key={child.href} className="flex flex-col">
                                    <Link
                                        href={child.href}
                                        className={cn(
                                            "text-[14px] px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between",
                                            isChildActive 
                                                ? "font-bold text-[#FFD700] bg-[#FFD700]/10" 
                                                : "font-medium text-[#FFF8E7]/90 hover:text-[#FFD700] hover:bg-[#FFD700]/10"
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
                    'relative px-4 py-2 text-[14px] font-medium transition-all duration-200 rounded-lg min-h-[40px] flex items-center peer gap-1.5',
                    'hover:bg-[#FFD700]/10 hover:text-[#FFD700] hover:shadow-[0_0_10px_rgba(255,215,0,0.2)]',
                    isRootActive ? 'text-[#FFD700] font-bold shadow-[0_0_15px_rgba(255,215,0,0.4)] bg-[#FFD700]/10' : 'text-[#FFF8E7]/85'
                )}
            >
                <span className="opacity-70 group-hover:opacity-100 transition-opacity flex items-center shrink-0">
                    {getIconForNavItem(item, "w-4 h-4")}
                </span>
                {label}
                <svg className="w-3.5 h-3.5 ml-1.5 opacity-60 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </Link>

            {/* Submenu Dropdown */}
            <div className="absolute top-full left-0 right-0 w-full flex justify-center pt-2 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto">
                <div className="bg-[#12023A]/95 backdrop-blur-md border border-[#FFD700]/20 shadow-[0_0_30px_rgba(255,215,0,0.2)] rounded-xl p-5 min-w-[240px] w-max flex gap-4 mt-1 pointer-events-auto">
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
                                            isChildActive ? "font-bold text-[#39D5A0] drop-shadow-[0_0_5px_rgba(57,213,160,0.8)]" : hasGrandChildren ? "font-semibold text-[#FFD700] drop-shadow-[0_0_3px_rgba(255,215,0,0.5)]" : "font-semibold text-[#FFF8E7]/90 hover:text-[#39D5A0] hover:drop-shadow-[0_0_5px_rgba(57,213,160,0.8)]"
                                        )}
                                    >
                                        {getNavLabel(child, t, locale)}
                                    </Link>

                                    {hasGrandChildren && (
                                        <div className="flex flex-col space-y-2.5 mt-2 pl-2 border-l border-[#FFD700]/20">
                                            {child.children!.map(grandChild => {
                                                const isGrandActive = isActiveLink(grandChild.href);
                                                return (
                                                <div key={grandChild.href} className="flex flex-col">
                                                    <Link
                                                        href={grandChild.href}
                                                        className={cn(
                                                            "text-[13px] transition-all flex items-center gap-2 hover:drop-shadow-[0_0_5px_rgba(255,215,0,0.8)]",
                                                            isGrandActive 
                                                                ? "font-bold text-[#FFD700] drop-shadow-[0_0_5px_rgba(255,215,0,0.8)]" 
                                                                : "font-medium text-[#FFF8E7]/70 hover:text-[#FFD700]"
                                                        )}
                                                    >
                                                        <span className={cn("w-1.5 h-1.5 rounded-full block shadow-[0_0_5px_rgba(255,77,109,0.8)]", isGrandActive ? "bg-[#FFD700]" : "bg-[#FF4D6D]")} />
                                                        {getNavLabel(grandChild, t, locale)}
                                                    </Link>
                                                    {grandChild.children && grandChild.children.length > 0 && (
                                                        <div className="flex flex-col space-y-2 mt-2 pl-4 border-l border-[#FFD700]/10">
                                                            {grandChild.children.map(greatGrandChild => {
                                                                const isGreatActive = isActiveLink(greatGrandChild.href);
                                                                return (
                                                                <Link
                                                                    key={greatGrandChild.href}
                                                                    href={greatGrandChild.href}
                                                                    className={cn(
                                                                        "text-[12px] transition-colors flex items-center",
                                                                        isGreatActive 
                                                                            ? "font-bold text-[#FFD700]" 
                                                                            : "text-[#FFF8E7]/50 hover:text-[#FFD700]"
                                                                    )}
                                                                >
                                                                    - {getNavLabel(greatGrandChild, t, locale)}
                                                                </Link>
                                                            )})}
                                                        </div>
                                                    )}
                                                </div>
                                            )})}
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

const MobileNavNode = ({
    item,
    t,
    locale,
    isActiveLink,
    closeMenu,
    expandedNodes,
    toggleAccordion,
    depth = 0
}: {
    item: NavItem;
    t: any;
    locale: string;
    isActiveLink: (href: string) => boolean;
    closeMenu: () => void;
    expandedNodes: Record<string, boolean>;
    toggleAccordion: (href: string) => void;
    depth?: number;
}) => {
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
                        'flex items-center justify-between px-4 py-3 min-h-[44px] text-sm font-bold rounded-lg transition-all mt-4 shadow-[0_0_15px_rgba(255,77,109,0.3)] bg-[#FF4D6D] text-white',
                        depth > 0 && 'ml-4'
                    )}
                >
                    {label}
                    <span className="text-white/80">→</span>
                </Link>
            );
        }
        return (
            <Link
                href={item.href}
                onClick={closeMenu}
                className={cn(
                    'flex items-center px-4 py-3 min-h-[44px] text-[14px] font-medium rounded-lg transition-all gap-3',
                    active
                        ? 'bg-[#FFD700]/15 text-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.2)]'
                        : 'text-[#FFF8E7]/80 active:bg-white/5',
                    depth > 0 && `border-l border-[#FFD700]/20`,
                    depth === 0 && 'uppercase tracking-wide font-semibold border-b border-[#FFD700]/10'
                )}
                style={{ marginLeft: depth > 0 ? `${depth * 0.75}rem` : undefined }}
            >
                <span className="opacity-80 flex items-center shrink-0">
                    {getIconForNavItem(item, "w-5 h-5")}
                </span>
                {label}
            </Link>
        );
    }

    return (
        <div className="w-full flex-col flex mt-1">
            <button
                onClick={() => toggleAccordion(item.href)}
                className={cn(
                    'flex items-center justify-between w-full px-4 py-3 min-h-[44px] rounded-lg transition-all font-medium text-[14px] gap-3',
                    item.variant === 'button'
                        ? 'bg-[#12023A] text-[#FFD700] mt-4 border border-[#FFD700]/30 glow'
                        : active
                            ? 'text-[#FFD700] font-semibold bg-[#FFD700]/10 shadow-[0_0_10px_rgba(255,215,0,0.2)]'
                            : 'text-[#FFF8E7] active:bg-white/5 border-b border-[#FFD700]/10',
                    depth > 0 && `border-l border-[#FFD700]/20 border-b-0`
                )}
                style={{ marginLeft: depth > 0 ? `${depth * 0.75}rem` : undefined }}
            >
                <div className="flex items-center text-left gap-3">
                    <span className="opacity-80 flex items-center shrink-0">
                        {getIconForNavItem(item, "w-5 h-5")}
                    </span>
                    <span>{label}</span>
                </div>
                <svg
                    className={cn('w-4 h-4 text-[#FFF8E7]/50 transition-transform duration-200 shrink-0 ml-2', isExpanded && 'rotate-180 text-[#FFD700]')}
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
                    className="flex items-center px-4 py-2 min-h-[40px] text-[12px] font-bold text-[#FFD700]/80 uppercase tracking-widest rounded-lg active:bg-white/5 transition-colors mb-1"
                    style={{ marginLeft: `${(depth + 1) * 0.75}rem` }}
                >
                    <span className="mr-2">→</span> Xem trang tổng hợp
                </Link>
                {item.children?.map((child: any) => (
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

export function FestivalHeader({
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
            {/* ── Main Minimal Bar ── */}
            <div className="backdrop-blur-md border-b border-[#FFD700]/20 shadow-[0_4px_30px_rgba(255,215,0,0.15)] relative" style={{ backgroundColor: 'var(--theme-header-bg, rgba(18, 2, 58, 0.95))' }}>
                {/* Luminous glow effect at top */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent"></div>
                <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 py-3 lg:px-8 relative z-10" aria-label="Main navigation" suppressHydrationWarning>
                    
                    {/* Festival Logo Container */}
                    <div className="flex-1 flex justify-start">
                        <Link href="/" className="group flex-shrink-0 flex items-center gap-3" prefetch={true}>
                            <TenantLogo 
                                src={settings['site_logo']} 
                                alt={settings['site_name_vi']} 
                                variant="adaptive" 
                                size="md" 
                                className="bg-white/10 border-[#FFD700]/30 shadow-[0_0_10px_rgba(255,215,0,0.2)]"
                            />
                            <div className="flex flex-col">
                                <span className="text-lg font-inter font-bold text-[#FFD700] leading-tight drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">
                                    {settings['site_name_vi'] || DEFAULT_SITE_NAME}
                                </span>
                                <span className="text-[10px] text-[#39D5A0] font-medium tracking-widest uppercase mt-0.5 leading-none drop-shadow-[0_0_3px_rgba(57,213,160,0.8)]">
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
                        {/* Notification Bell */}
                        <div className="relative group">
                            <button className="flex items-center justify-center h-10 w-10 text-[#FFF8E7]/80 hover:text-[#FFD700] hover:bg-white/5 rounded-full transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#FF4D6D] rounded-full border border-[#12023A] shadow-[0_0_5px_rgba(255,77,109,0.8)]"></span>
                            </button>
                        </div>

                        {/* Search icon */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="flex items-center justify-center h-10 w-10 text-[#FFF8E7]/80 hover:text-[#FFD700] hover:bg-white/5 hover:shadow-[0_0_15px_rgba(255,215,0,0.2)] rounded-full transition-all"
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
                                    <button className="flex items-center gap-1.5 h-10 px-3 text-[13px] font-semibold text-[#FFF8E7]/80 hover:text-[#FFD700] hover:bg-white/5 rounded-full transition-all border border-white/10 hover:border-[#FFD700]/30 hover:shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                                        <span className="uppercase">{locale}</span>
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="min-w-[120px] bg-[#12023A]/95 backdrop-blur-md border border-[#FFD700]/20 rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.15)] p-1.5">
                                    {Object.entries(LOCALES).map(([code, name]) => (
                                        <DropdownMenuItem
                                            key={code}
                                            onClick={() => switchLocale(code)}
                                            className={cn(
                                                'cursor-pointer transition-colors text-[13px] font-medium rounded-lg py-2 px-3 focus:bg-white/5 text-[#FFF8E7]/80 focus:text-[#FFD700]',
                                                locale === code && 'text-[#FFD700] bg-[#FFD700]/10 font-bold drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]'
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
                                className="flex items-center justify-center h-10 w-10 text-[#FFF8E7]/80 hover:text-[#FFD700] rounded-lg transition-colors hover:bg-white/5"
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
                    'absolute inset-0 bg-[#12023A]/60 backdrop-blur-sm transition-opacity duration-300',
                    mobileMenuOpen ? 'opacity-100' : 'opacity-0'
                )} onClick={closeMobileMenu} />

                <div className={cn(
                    'absolute right-0 top-0 bottom-0 w-[85%] max-w-[340px] bg-[#12023A] shadow-[-10px_0_30px_rgba(255,215,0,0.1)] overflow-y-auto overscroll-contain transition-transform duration-300 border-l border-[#FFD700]/20',
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
                    <div className="bg-black/20 px-5 py-6 border-t border-[#FFD700]/10 flex flex-col gap-5">
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(LOCALES).map(([code, name]) => (
                                <button
                                    key={code}
                                    onClick={() => { switchLocale(code); closeMobileMenu(); }}
                                    className={cn(
                                        'py-3 text-[13px] font-semibold rounded-xl transition-all border',
                                        locale === code
                                            ? 'bg-[#FFD700]/10 border-[#FFD700]/30 text-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.2)]'
                                            : 'bg-white/5 border-white/10 text-[#FFF8E7]/70 hover:bg-white/10 hover:text-[#FFF8E7]'
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

            {/* ── Mobile Bottom Navigation ── */}
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[400px]">
                <div className="bg-[#12023A]/90 backdrop-blur-xl border border-[#FFD700]/30 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center justify-around p-2.5">
                    {navigation.slice(0, 5).map((item) => {
                        const active = isActiveLink(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all relative",
                                    active ? "text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" : "text-[#FFF8E7]/60"
                                )}
                            >
                                <span className="flex items-center">
                                    {getIconForNavItem(item, "w-5 h-5")}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                    {getNavLabel(item, tNav, locale).slice(0, 8)}
                                </span>
                                {active && (
                                    <span className="absolute -bottom-1 w-1 h-1 bg-[#FFD700] rounded-full animate-pulse shadow-[0_0_5px_rgba(255,215,0,0.8)]"></span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </header>
    );
}

