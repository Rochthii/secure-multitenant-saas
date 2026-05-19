'use client';

import React from 'react';
import Image from 'next/image';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import type { CategoryNode } from '@/lib/cache/queries';
import { PageNode, NavItem, buildNavigation, getNavLabel } from '@/lib/navigation';
import { BlockConfig } from '@/lib/types/layout-blocks';
import { TenantLogo } from '@/components/layout/tenant-logo';
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
                'relative px-4 py-2 text-[15px] transition-all duration-300 rounded-sm min-h-[40px] flex items-center group',
                'hover:bg-[#4A3C31]/5',
                isActive
                    ? 'text-[#4A3C31] font-bold border-b-2 border-[#8B7355]'
                    : 'text-[#6B5A4E] hover:text-[#4A3C31]',
                item.children && 'pr-1'
            )}
            style={{ fontFamily: 'Georgia, serif' }}
        >
            {getNavLabel(item, tNav, locale)}
            <span className={cn(
                "absolute bottom-0 left-0 w-full h-[1px] bg-[#8B7355] transform origin-left transition-transform duration-300",
                isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
            )} />
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
                        'relative px-6 py-2 ml-3 text-[14px] font-bold tracking-widest uppercase rounded-sm flex items-center shadow-md transition-all duration-300 border border-[#4A3C31]',
                        'bg-[#4A3C31] text-[#F4F1EA] hover:bg-[#2A2118] hover:text-white',
                    )}
                    style={{ fontFamily: 'Georgia, serif' }}
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
                        'relative px-6 py-2 text-[14px] font-bold tracking-widest uppercase rounded-sm flex items-center shadow-md transition-all duration-300 border border-[#4A3C31]',
                        'bg-[#4A3C31] text-[#F4F1EA] hover:bg-[#2A2118] hover:text-white'
                    )}
                    style={{ fontFamily: 'Georgia, serif' }}
                >
                    <span className="relative z-10 flex items-center gap-1.5">
                        {label}
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </span>
                </Link>

                <div className="absolute top-full right-0 pt-3 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50">
                    <div className="bg-[#F4F1EA] border-t-4 border-[#8B7355] shadow-xl rounded-sm p-2 min-w-[220px] relative mt-1 flex flex-col gap-1">
                        {item.children.map((child) => {
                            const isChildActive = isActiveLink(child.href);
                            return (
                                <div key={child.href} className="flex flex-col">
                                    <Link
                                        href={child.href}
                                        className={cn(
                                            "text-[14px] px-4 py-2 rounded-sm transition-colors flex items-center justify-between",
                                            isChildActive 
                                                ? "font-bold text-[#8B7355] bg-[#EDE8D9]" 
                                                : "font-medium text-[#4A3C31] hover:text-[#8B7355] hover:bg-[#EDE8D9]"
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
                    'relative px-4 py-2 text-[15px] transition-all duration-300 rounded-sm min-h-[40px] flex items-center peer group-hover:bg-[#4A3C31]/5',
                    'text-[#6B5A4E] hover:text-[#4A3C31]',
                    isRootActive && 'text-[#4A3C31] font-bold border-b-2 border-[#8B7355]'
                )}
                style={{ fontFamily: 'Georgia, serif' }}
            >
                {label}
                <svg className="w-3.5 h-3.5 ml-1.5 opacity-40 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </Link>

            {/* Submenu Dropdown */}
            <div className="absolute top-full left-0 right-0 w-full flex justify-center pt-2 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50 pointer-events-none group-hover:pointer-events-auto">
                <div className="bg-[#F4F1EA] border-t-4 border-[#8B7355] shadow-xl rounded-sm p-6 min-w-[260px] w-max flex gap-6 mt-1 pattern-wavy pointer-events-auto">
                    <div className="flex flex-row flex-wrap gap-x-10 gap-y-8 min-w-[240px] flex-1">
                        {item.children.map((child) => {
                            const hasGrandChildren = child.children && child.children.length > 0;
                            const isChildActive = isActiveLink(child.href);
                            return (
                                <div key={child.href} className="flex flex-col min-w-max">
                                    <Link
                                        href={child.href}
                                        className={cn(
                                            "text-[15px] mb-3 transition-colors tracking-wide",
                                            isChildActive ? "font-bold text-[#8B7355]" : hasGrandChildren ? "font-bold text-[#4A3C31] uppercase" : "font-bold text-[#6B5A4E] hover:text-[#8B7355]"
                                        )}
                                        style={{ fontFamily: 'Georgia, serif' }}
                                    >
                                        {getNavLabel(child, t, locale)}
                                    </Link>

                                    {hasGrandChildren && (
                                        <div className="flex flex-col space-y-3 mt-1 pl-3 border-l px-1 border-[#D5CDBD]">
                                            {child.children!.map(grandChild => {
                                                const isGrandActive = isActiveLink(grandChild.href);
                                                return (
                                                <div key={grandChild.href} className="flex flex-col">
                                                    <Link
                                                        href={grandChild.href}
                                                        className={cn(
                                                            "text-[14px] transition-colors flex items-center gap-2 group/link",
                                                            isGrandActive 
                                                                ? "font-bold text-[#8B7355]" 
                                                                : "text-[#6B5A4E] hover:text-[#8B7355]"
                                                        )}
                                                    >
                                                        <span className={cn("w-1.5 h-1.5 rounded-none rotate-45 transition-colors", isGrandActive ? "bg-[#8B7355]" : "bg-[#D5CDBD] group-hover/link:bg-[#8B7355]")} />
                                                        {getNavLabel(grandChild, t, locale)}
                                                    </Link>
                                                    {grandChild.children && grandChild.children.length > 0 && (
                                                        <div className="flex flex-col space-y-2 mt-2 pl-4 border-l border-[#D5CDBD]/50">
                                                            {grandChild.children.map(greatGrandChild => {
                                                                const isGreatActive = isActiveLink(greatGrandChild.href);
                                                                return (
                                                                <Link
                                                                    key={greatGrandChild.href}
                                                                    href={greatGrandChild.href}
                                                                    className={cn(
                                                                        "text-[13px] transition-colors flex items-center group/sublink",
                                                                        isGreatActive 
                                                                            ? "font-bold text-[#8B7355]" 
                                                                            : "text-[#8B7355]/80 hover:text-[#8B7355]"
                                                                    )}
                                                                >
                                                                    <span className={cn("w-1 h-1 rounded-none mr-2", isGreatActive ? "bg-[#8B7355]" : "bg-[#D5CDBD] group-hover/sublink:bg-[#8B7355]")} />
                                                                    {getNavLabel(greatGrandChild, t, locale)}
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
                        'flex items-center justify-between px-4 py-3 min-h-[44px] text-sm font-bold uppercase tracking-wider rounded-sm transition-all mt-4 border border-[#4A3C31] bg-[#4A3C31] text-white',
                        depth > 0 && 'ml-4'
                    )}
                >
                    {label}
                    <span className="text-white/70">→</span>
                </Link>
            );
        }
        return (
            <Link
                href={item.href}
                onClick={closeMenu}
                className={cn(
                    'flex items-center px-4 py-3 min-h-[44px] text-[15px] rounded-sm transition-all border-b border-[#D5CDBD]/30 last:border-0',
                    active
                        ? 'bg-[#4A3C31]/5 text-[#4A3C31] font-bold'
                        : 'text-[#4A3C31] active:bg-[#4A3C31]/5',
                    depth === 0 && 'uppercase tracking-widest font-bold font-serif'
                )}
                style={{ marginLeft: depth > 0 ? `${depth * 1}rem` : undefined, fontFamily: depth === 0 ? 'Georgia, serif' : 'inherit' }}
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
                    'flex items-center justify-between w-full px-4 py-3 min-h-[44px] rounded-sm transition-all border-b border-[#D5CDBD]/30',
                    item.variant === 'button'
                        ? 'bg-[#4A3C31] text-white mt-4 border-none font-bold uppercase tracking-widest'
                        : active
                            ? 'text-[#4A3C31] font-bold bg-[#4A3C31]/5'
                            : 'text-[#4A3C31] active:bg-[#4A3C31]/5',
                    depth === 0 && 'uppercase tracking-widest font-bold font-serif'
                )}
                style={{ marginLeft: depth > 0 ? `${depth * 1}rem` : undefined, fontFamily: depth === 0 ? 'Georgia, serif' : 'inherit' }}
            >
                <div className="flex items-center text-left">
                    <span>{label}</span>
                </div>
                <svg
                    className={cn('w-4 h-4 text-[#8B7355] transition-transform duration-300 shrink-0 ml-2', isExpanded && 'rotate-180')}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div className={cn(
                'overflow-hidden transition-all duration-500 flex flex-col',
                isExpanded ? 'max-h-[1000px] opacity-100 bg-[#4A3C31]/[0.02]' : 'max-h-0 opacity-0'
            )}>
                <Link
                    href={item.href}
                    onClick={closeMenu}
                    className="flex items-center px-4 py-2 min-h-[40px] text-[12px] font-medium text-[#8B4513]/80 uppercase tracking-widest active:bg-[#8B4513]/5 transition-colors"
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

export function AngkorHeader({
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
            {/* ── Main Angkor Bar ── */}
            <div className="border-b-4 border-[#8B7355] relative shadow-md" style={{ backgroundColor: 'var(--theme-header-bg, #F4F1EA)' }}>
                {/* Stone texture overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    }}
                />

                <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 py-4 lg:px-8 relative z-10" aria-label="Main navigation" suppressHydrationWarning>
                    
                    {/* Angkor Logo Container */}
                    <div className="flex-1 flex justify-start">
                        <Link href="/" className="group flex-shrink-0 flex items-center gap-4" prefetch={true}>
                            <TenantLogo 
                                src={settings['site_logo']} 
                                alt={settings['site_name_vi']} 
                                variant="square" 
                                size="lg" 
                                className="border-2 border-[#8B7355] bg-[#F4F1EA]"
                            />
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-[#4A3C31] leading-tight font-serif tracking-wide drop-shadow-sm">
                                    {settings['site_name_vi'] || DEFAULT_SITE_NAME}
                                </span>
                                <span className="text-[11px] text-[#8B7355] font-bold tracking-[0.25em] uppercase mt-0.5 leading-none shadow-sm">
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
                    <div className="flex-1 flex items-center justify-end gap-4">
                        {/* Search icon */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="flex items-center justify-center h-10 w-10 text-[#6B5A4E] hover:text-[#4A3C31] hover:bg-[#4A3C31]/5 rounded-sm border border-transparent hover:border-[#D5CDBD] transition-all"
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
                                    <button className="flex items-center gap-1.5 h-10 px-4 text-[13px] font-bold text-[#4A3C31] hover:bg-[#4A3C31]/5 rounded-sm transition-all border border-[#8B7355]/30 hover:border-[#8B7355] bg-white/50">
                                        <span className="uppercase tracking-widest">{locale}</span>
                                        <svg className="w-3.5 h-3.5 text-[#8B7355]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="min-w-[120px] bg-[#F4F1EA] border-2 border-[#8B7355] rounded-sm shadow-xl p-1 rounded-none">
                                    {Object.entries(LOCALES).map(([code, name]) => (
                                        <DropdownMenuItem
                                            key={code}
                                            onClick={() => switchLocale(code)}
                                            className={cn(
                                                'cursor-pointer transition-colors text-[13px] font-bold tracking-wide rounded-sm py-2 px-3 focus:bg-[#4A3C31]/10',
                                                locale === code && 'text-[#4A3C31] bg-[#4A3C31]/10'
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
                                className="flex items-center justify-center h-10 w-10 text-[#4A3C31] hover:bg-[#4A3C31]/10 rounded-sm transition-colors border border-[#8B7355]/30 bg-white/50"
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
                'lg:hidden fixed inset-0 top-[76px] z-40 transition-opacity duration-300',
                mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            )}>
                <div className={cn(
                    'absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
                    mobileMenuOpen ? 'opacity-100' : 'opacity-0'
                )} onClick={closeMobileMenu} />

                <div className={cn(
                    'absolute right-0 top-0 bottom-0 w-[85%] max-w-[360px] bg-[#F4F1EA] shadow-[-10px_0_30px_rgba(0,0,0,0.2)] overflow-y-auto overscroll-contain transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] border-l-4 border-[#8B7355]',
                    mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                )}>
                    {/* Texture overlay for drawer */}
                    <div
                        className="absolute inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        }}
                    />

                    {/* Nav items */}
                    <nav className="px-6 py-8 relative z-10" aria-label="Mobile navigation">
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
                    <div className="bg-[#EDE8D9] px-6 py-8 border-t-2 border-[#8B7355]/20 flex flex-col gap-6 relative z-10">
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(LOCALES).map(([code, name]) => (
                                <button
                                    key={code}
                                    onClick={() => { switchLocale(code); closeMobileMenu(); }}
                                    className={cn(
                                        'py-3.5 text-[14px] font-bold tracking-widest uppercase rounded-sm transition-all border-2',
                                        locale === code
                                            ? 'bg-[#4A3C31] border-[#4A3C31] text-[#F4F1EA] shadow-md'
                                            : 'bg-[#F4F1EA] border-[#D5CDBD] text-[#6B5A4E] hover:bg-white hover:border-[#8B7355]'
                                    )}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-center pt-4 border-t border-[#D5CDBD]">
                            <UserMenu />
                        </div>
                    </div>
                </div>
            </div>

            <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
        </header>
    );
}
