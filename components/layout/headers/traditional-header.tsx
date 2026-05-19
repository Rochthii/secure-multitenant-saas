'use client';

import React from 'react';
import Image from 'next/image';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import type { CategoryNode } from '@/lib/cache/queries';
import { PageNode, NavItem, buildNavigation, getNavLabel } from '@/lib/navigation';
import { TenantLogo } from '@/components/layout/tenant-logo';

// ─────────────────────────────────────────────────
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { BlockConfig, BlockType } from '@/lib/types/layout-blocks';
import { SECTION_REGISTRY } from '@/lib/blocks-registry';
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
                'relative px-3 py-2 text-[13px] font-medium transition-all duration-200 rounded-lg min-h-[40px] flex items-center',
                item.variant === 'button'
                    ? 'bg-gradient-to-r from-gold-primary to-orange-600 text-white shadow-md hover:shadow-lg hover:brightness-110 active:scale-95 ml-2'
                    : isActive
                        ? 'bg-white/10 text-gold-light border border-white/5 shadow-sm'
                        : 'text-gray-200 hover:bg-white/5 hover:text-white',
                item.children && 'pr-1'
            )}
        >
            {getNavLabel(item, tNav, locale)}
        </Link>
    );
});

NavLink.displayName = 'NavLink';

// ─────────────────────────────────────────────────
// Recursive Desktop Mega Menu Renderer
// ─────────────────────────────────────────────────

const DesktopNavNode = ({ item, t, locale, isActiveLink }: { item: NavItem; t: any; locale: string; isActiveLink: (item: NavItem, exactOnly?: boolean) => boolean }) => {
    const isRootActive = isActiveLink(item, false);
    const label = getNavLabel(item, t, locale);

    if (!item.children || item.children.length === 0) {
        if (item.variant === 'button') {
            return (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        'relative px-4 py-2.5 ml-2 text-[13px] font-semibold rounded-lg whitespace-nowrap min-h-[40px] flex items-center transition-all duration-200',
                        'border border-gold-primary/60 text-gold-light hover:bg-gold-primary/20 hover:text-white hover:border-gold-primary',
                        isRootActive && 'bg-gold-primary/20 border-gold-primary'
                    )}
                >
                    {label}
                </Link>
            );
        }
        return <NavLink item={item} isActive={isRootActive} locale={locale} />;
    }

    // Node có children -> render dropdown Thanh toán
    if (item.variant === 'button') {
        return (
            <div className="group relative ml-2 mt-1 lg:mt-0">
                <Link
                    href={item.href}
                    className={cn(
                        'relative px-4 py-2.5 text-[13px] font-semibold rounded-lg whitespace-nowrap min-h-[40px] flex items-center transition-all duration-200',
                        'border border-gold-primary/60 text-gold-light hover:bg-gold-primary/20 hover:text-white hover:border-gold-primary',
                        isRootActive && 'bg-gold-primary/20 border-gold-primary'
                    )}
                >
                    <span className="flex items-center gap-1.5">
                        {label}
                        <svg className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                            <path d="M19 9l-7 7-7-7" />
                        </svg>
                    </span>
                </Link>

                {/* Dropdown Menu for Button Variant */}
                <div className="absolute top-full right-0 pt-2 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50 pointer-events-none group-hover:pointer-events-auto">
                    <div className="absolute top-1 right-6 w-3 h-3 bg-coffee-dark border-l border-t border-gold-dark/30 rotate-45 z-10" />
                    <div className="bg-coffee-dark/95 backdrop-blur-md border border-gold-dark/30 shadow-2xl rounded-xl p-4 min-w-[220px] relative overflow-hidden mt-1 flex flex-col gap-1 pointer-events-auto">
                        {item.children.map((child) => {
                            const hasSubItems = child.children && child.children.length > 0;
                            const isChildActive = isActiveLink(child, true);
                            return (
                                <div key={child.href} className="flex flex-col">
                                    <Link
                                        href={child.href}
                                        className={cn(
                                            "text-[14px] font-medium px-3 py-2 rounded-lg transition-colors flex items-center justify-between",
                                            isChildActive
                                                ? 'bg-gold-primary/25 text-gold-light'
                                                : 'text-white hover:text-gold-primary hover:bg-white/5'
                                        )}
                                    >
                                        {getNavLabel(child, t, locale)}
                                        {hasSubItems && <span className="text-white/50 text-xs">▼</span>}
                                    </Link>
                                    {hasSubItems && (
                                        <div className="flex flex-col pl-4 mt-1 space-y-1 border-l-2 border-white/5 ml-3">
                                            {child.children?.map(sub => {
                                                const isSubActive = isActiveLink(sub, true);
                                                return (
                                                    <Link
                                                        key={sub.href}
                                                        href={sub.href}
                                                        className={cn(
                                                            "text-[13px] px-3 py-1.5 rounded-md transition-colors",
                                                            isSubActive
                                                                ? 'bg-gold-primary/20 text-gold-light'
                                                                : 'text-white/80 hover:text-gold-light hover:bg-white/5'
                                                        )}
                                                    >
                                                        - {getNavLabel(sub, t, locale)}
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
        );
    }

    // Node có children -> render CSS Mega Menu
    return (
        <div className="group">
            <Link
                href={item.href}
                className={cn(
                    'relative px-3 py-2 text-[13px] font-medium transition-all duration-200 rounded-lg min-h-[40px] flex items-center peer',
                    isRootActive
                        ? 'bg-white/10 text-gold-light border border-white/5 shadow-sm'
                        : 'text-gray-200 hover:bg-white/5 hover:text-white'
                )}
            >
                {label}
                <svg className="w-3 h-3 ml-1 opacity-60 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </Link>

            {/* Submenu Dropdown */}
            <div className="absolute top-full left-0 right-0 w-full flex justify-center pt-2 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50 pointer-events-none group-hover:pointer-events-auto">
                <div className="bg-coffee-dark/95 backdrop-blur-md border border-gold-dark/30 shadow-2xl rounded-xl p-6 min-w-[300px] w-max max-w-[95vw] lg:max-w-screen-xl flex gap-6 relative overflow-hidden mt-1 pointer-events-auto">
                    {/* Các cột menu con (Hiển thị tất cả Level 2 ra Mega Menu, mỗi Level 2 thành 1 cột cùng với các con Level 3 của nó) */}
                    <div className="flex flex-row flex-wrap gap-x-12 gap-y-8 min-w-[240px] flex-1">
                        {item.children.map((child, index) => {
                            const hasGrandChildren = child.children && child.children.length > 0;
                            const isChildActive = isActiveLink(child, true);
                            return (
                                <div key={child.href} className="flex flex-col min-w-max">
                                    <Link
                                        href={child.href}
                                        className={cn(
                                            "font-semibold text-[13px] uppercase tracking-wider mb-2 transition-colors px-2 py-1.5 rounded",
                                            isChildActive
                                                ? 'text-gold-light bg-gold-primary/20 border border-gold-primary/10'
                                                : 'text-white hover:text-gold-light hover:bg-white/5'
                                        )}
                                    >
                                        {getNavLabel(child, t, locale)}
                                    </Link>

                                    {/* Danh sách Level 3 và Level 4 */}
                                    {hasGrandChildren && (
                                        <div className="flex flex-col space-y-1 mt-2 border-l-2 border-white/5 pl-3">
                                            {child.children!.map(grandChild => {
                                                const isGrandActive = isActiveLink(grandChild, true);
                                                return (
                                                    <div key={grandChild.href} className="flex flex-col">
                                                        <Link
                                                            href={grandChild.href}
                                                            className={cn(
                                                                "text-[13px] transition-all font-medium px-2 py-1 rounded",
                                                                isGrandActive
                                                                    ? 'text-gold-primary bg-gold-primary/15'
                                                                    : 'text-white hover:text-gold-primary'
                                                            )}
                                                        >
                                                            {getNavLabel(grandChild, t, locale)}
                                                        </Link>
                                                        {grandChild.children && grandChild.children.length > 0 && (
                                                            <div className="flex flex-col space-y-1 pl-3 mt-1 border-l border-white/5">
                                                                {grandChild.children.map(greatGrandChild => {
                                                                    const isGreatActive = isActiveLink(greatGrandChild, true);
                                                                    return (
                                                                        <Link
                                                                            key={greatGrandChild.href}
                                                                            href={greatGrandChild.href}
                                                                            className={cn(
                                                                                "text-[12px] transition-all px-2 py-0.5 rounded",
                                                                                isGreatActive
                                                                                    ? 'text-gold-light bg-gold-primary/10'
                                                                                    : 'text-white/70 hover:text-gold-light hover:translate-x-1'
                                                                            )}
                                                                        >
                                                                            - {getNavLabel(greatGrandChild, t, locale)}
                                                                        </Link>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
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
// Recursive Mobile Menu Renderer
// ─────────────────────────────────────────────────

const MobileNavNode = ({ item, t, locale, isActiveLink, closeMenu, expandedNodes, toggleAccordion, depth = 0 }: any) => {
    const active = isActiveLink(item, depth > 0);
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
                        'flex items-center justify-between px-4 py-3 min-h-[44px] text-sm font-bold uppercase rounded-lg transition-all mt-3',
                        'bg-gradient-to-r from-gold-primary/90 to-orange-600/90 text-white shadow-md border border-gold-primary/30',
                        depth > 0 && 'ml-4'
                    )}
                >
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                        {label}
                    </span>
                    <span className="text-white/80">→</span>
                </Link>
            );
        }
        return (
            <Link
                href={item.href}
                onClick={closeMenu}
                className={cn(
                    'flex items-center px-4 py-3 min-h-[44px] text-[13px] font-medium rounded-lg transition-all',
                    active
                        ? 'bg-white/10 text-gold-light border border-white/5 shadow-sm'
                        : 'text-gray-200 active:bg-white/5 active:text-white',
                    depth > 0 && `border-l border-gold-dark/20`,
                    depth === 0 && 'uppercase tracking-wide font-bold'
                )}
                style={{ marginLeft: depth > 0 ? `${depth * 0.75}rem` : undefined }}
            >
                {depth > 0 && <span className="text-gold-primary/40 mr-2 text-xs">└</span>}
                {label}
            </Link>
        );
    }

    return (
        <div className="w-full flex-col flex space-y-0.5 mt-0.5">
            <button
                onClick={() => toggleAccordion(item.href)}
                className={cn(
                    'flex items-center justify-between w-full px-4 py-3 min-h-[44px] rounded-lg transition-all',
                    item.variant === 'button'
                        ? 'bg-gradient-to-r from-gold-primary/90 to-orange-600/90 text-white shadow-md border border-gold-primary/30 mt-3 font-bold text-sm uppercase'
                        : active
                            ? 'bg-white/10 text-gold-light border border-white/5 font-medium text-sm'
                            : 'text-gray-200 active:bg-white/5 font-medium text-sm',
                    depth > 0 && `border-l border-gold-dark/20 text-[13px] border-t-0 border-r-0 border-b-0`
                )}
                style={{ marginLeft: depth > 0 ? `${depth * 0.75}rem` : undefined }}
            >
                <div className="flex items-center text-left">
                    {depth > 0 && item.variant !== 'button' && <span className="text-gold-primary/40 mr-2 text-xs">└</span>}
                    {item.variant === 'button' && (
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                    )}
                    <span className={depth === 0 ? "uppercase tracking-wide" : ""}>{label}</span>
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
                isExpanded ? 'max-h-[1500px] opacity-100 mt-1' : 'max-h-0 opacity-0'
            )}>
                <Link
                    href={item.href}
                    onClick={closeMenu}
                    className="flex items-center px-4 py-2 min-h-[40px] text-[11px] font-semibold text-gold-primary/80 uppercase tracking-widest rounded-lg active:bg-white/5 transition-colors mb-1"
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
// Header component
// ─────────────────────────────────────────────────

export function TraditionalHeader({
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

    const isActiveLink = React.useCallback((item: NavItem, exactOnly: boolean = false): boolean => {
        if (item.href === '/') {
            return pathname === '/';
        }

        // Exact match
        if (pathname === item.href) return true;

        if (exactOnly) return false;

        // Recursive child check
        if (item.children && item.children.length > 0) {
            if (item.children.some(child => isActiveLink(child))) {
                return true;
            }
        }

        // Parent path match (for URLs that follow typical hierarchy)
        // Ensure it's a true sub-path by checking for trailing slash
        if (pathname.startsWith(`${item.href}/`)) {
            return true;
        }
        return false;
    }, [pathname]);

    const switchLocale = React.useCallback((newLocale: string) => {
        window.location.href = `/${newLocale}${pathname === '/' ? '' : pathname}`;
    }, [pathname]);

    const closeMobileMenu = React.useCallback(() => {
        setMobileMenuOpen(false);
    }, []);

    // Lock body scroll when mobile menu is open
    React.useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            setExpandedNodes({}); // Reset accordion khi đóng menu
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
            {/* ── Gold accent line ── */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-gold-primary to-transparent" />

            {/* ── Main bar ── */}
            <div className="backdrop-blur-md border-b border-gold-dark/20 shadow-lg" style={{ backgroundColor: 'var(--theme-header-bg, rgba(38, 20, 12, 0.95))' }}>
                <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 py-2.5 lg:px-8 relative" aria-label="Main navigation" suppressHydrationWarning>
                    
                    {/* Traditional Logo Container */}
                    <div className="flex-1 flex justify-start">
                        <Link href="/" className="group flex-shrink-0 flex items-center gap-2.5" prefetch={true}>
                            <TenantLogo 
                                src={settings['site_logo']} 
                                alt={settings['site_name_vi']} 
                                variant="adaptive" 
                                size="md" 
                                className="bg-white/5 border-gold-primary/30 group-hover:border-gold-primary transition-colors !p-1"
                            />
                            <div className="flex flex-col text-left">
                                <span className="text-base lg:text-lg font-playfair font-bold text-gold-light group-hover:text-gold-primary transition-colors leading-tight">
                                    {settings['site_name_vi'] || DEFAULT_SITE_NAME}
                                </span>
                                <span className="text-[9px] text-gray-400 tracking-[0.2em] uppercase hidden sm:block leading-none">
                                    {settings['site_name_km'] || ''} · {settings['site_subtitle_vi'] || t('pagoda') || 'Chi nhánh Khmer'}
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center justify-center gap-0.5 group/nav">
                        {navigation.map((item) => (
                            <DesktopNavNode key={item.href} item={item} t={tNav} locale={locale} isActiveLink={isActiveLink} />
                        ))}
                    </div>

                    {/* Right side Container */}
                    <div className="flex-1 flex items-center justify-end gap-1.5">
                        {/* Search — all screens */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="flex items-center justify-center h-9 w-9 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            aria-label="Search"
                        >
                            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        {/* Language — Desktop */}
                        <div className="hidden lg:block">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="flex items-center gap-1 h-9 px-2.5 text-[13px] font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        aria-label={`Ngôn ngữ hiện tại: ${LOCALES[locale as keyof typeof LOCALES]}. Nhấn để chuyển ngôn ngữ`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                        </svg>
                                        <span className="uppercase">{locale}</span>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="min-w-[140px] bg-coffee-dark/95 backdrop-blur-md border border-gold-dark/20">
                                    {Object.entries(LOCALES).map(([code, name]) => (
                                        <DropdownMenuItem
                                            key={code}
                                            onClick={() => switchLocale(code)}
                                            className={cn(
                                                'cursor-pointer transition-colors text-sm py-2 outline-none',
                                                locale === code
                                                    ? 'bg-gold-primary/20 text-gold-primary font-bold focus:bg-gold-primary/20 focus:text-gold-primary'
                                                    : 'text-gray-300 hover:bg-gold-primary/10 hover:text-gold-light focus:bg-gold-primary/10 focus:text-gold-light'
                                            )}
                                        >
                                            {name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* User Profile */}
                        <div className="hidden lg:flex items-center ml-1">
                            <UserMenu />
                        </div>

                        {/* Mobile: Hamburger only — language is in drawer */}
                        <div className="flex lg:hidden items-center">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="flex items-center justify-center h-11 w-11 text-gray-300 hover:text-white hover:bg-white/10 active:bg-white/15 rounded-lg transition-colors"
                                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                                aria-expanded={mobileMenuOpen}
                            >
                                {mobileMenuOpen ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </nav >
            </div >

            {/* ── Mobile Drawer ── */}
            < div
                className={
                    cn(
                        'lg:hidden fixed inset-0 top-[52px] z-40 transition-opacity duration-300',
                        mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    )
                }
            >
                <div
                    className={cn(
                        'absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
                        mobileMenuOpen ? 'opacity-100' : 'opacity-0'
                    )}
                    onClick={closeMobileMenu}
                />

                <div 
                    className={cn(
                        'absolute right-0 top-0 bottom-0 w-[82%] max-w-[320px] backdrop-blur-md shadow-2xl overflow-y-auto overscroll-contain transition-transform duration-300',
                        mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    )}
                    style={{ backgroundColor: 'var(--theme-header-bg, rgba(38, 20, 12, 0.98))' }}
                >
                    {/* Drawer header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gold-dark/15">
                        <span className="text-xs font-semibold text-gold-primary/80 uppercase tracking-[0.2em]">Menu</span>
                        <button
                            onClick={closeMobileMenu}
                            className="flex items-center justify-center h-10 w-10 text-gray-400 hover:text-white rounded-lg transition-colors"
                            aria-label="Close menu"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Nav items */}
                    <nav className="px-3 py-3 space-y-0.5" aria-label="Mobile navigation">
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

                    {/* Language in drawer */}
                    <div className="border-t border-gold-dark/15 px-4 py-4 mx-3">
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] mb-2">Ngôn ngữ</p>
                        <div className="flex gap-2">
                            {Object.entries(LOCALES).map(([code, name]) => (
                                <button
                                    key={code}
                                    onClick={() => { switchLocale(code); closeMobileMenu(); }}
                                    className={cn(
                                        'flex-1 py-2.5 min-h-[44px] text-sm font-medium rounded-lg transition-all text-center',
                                        locale === code
                                            ? 'bg-gold-primary/90 text-white shadow-sm'
                                            : 'bg-white/5 text-gray-300 active:bg-white/10'
                                    )}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick contacts */}
                    <div className="border-t border-gold-dark/15 px-4 py-4 mx-3">
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] mb-3">Liên hệ nhanh</p>
                        <div className="grid grid-cols-3 gap-2">
                            <a
                                href={`tel:${(settings['contact_phone'] || '02812345678').replace(/\s+/g, '')}`}
                                className="flex-1 py-2.5 min-h-[44px] bg-white/5 active:bg-white/10 rounded-lg transition-colors"
                            >
                                <svg className="w-4 h-4 mx-auto text-gold-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </a>
                            <a
                                href="https://zalo.me/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-2.5 min-h-[44px] bg-white/5 active:bg-white/10 rounded-lg transition-colors"
                            >
                                <svg className="w-4 h-4 mx-auto text-gold-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </a>
                            <a
                                href={settings['facebook_url'] || "https://facebook.com/chuachantarangsay"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-2.5 min-h-[44px] bg-white/5 active:bg-white/10 rounded-lg transition-colors"
                            >
                                <svg className="w-4 h-4 mx-auto text-gold-primary" fill="currentColor" viewBox="0 0 24 24" >
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div className="border-t border-gold-dark/15 px-4 py-4 mx-3 mb-2 flex justify-center">
                        <UserMenu />
                    </div>
                </div>
            </ div>

            {/* ── Search Modal ── */}
            <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
        </ header>
    );
}
