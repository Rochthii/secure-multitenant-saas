'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';

interface CategoryNode {
    id: string;
    name_vi: string;
    name_km: string | null;
    name_en: string | null;
    slug: string;
    module: string | null;
    parent_id: string | null;
    children: CategoryNode[];
}

interface CategorySectionHeaderProps {
    category: CategoryNode;
    baseHref: string;
    isCompany?: boolean;
}
export function CategorySectionHeader({ category, baseHref, isCompany }: CategorySectionHeaderProps) {
    const locale = useLocale();
    const t = useTranslations('common');

    // Helper function to get localized category name
    const getLabel = (node: CategoryNode) => {
        if (locale === 'km' && node.name_km) return node.name_km;
        if (locale === 'en' && node.name_en) return node.name_en;
        return node.name_vi;
    };

    const title = getLabel(category);

    return (
        <div className={cn("mb-8 border-b-2", isCompany ? "border-sky-500" : "border-gold-primary")}>
            {/* Desktop UI: Flex row with Title and Tabs */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between pb-2 gap-4 overflow-x-auto no-scrollbar">
                {/* Title */}
                <h2 className={cn(
                    "text-xl md:text-2xl font-bold uppercase relative inline-block whitespace-normal md:whitespace-nowrap",
                    isCompany ? "font-sans text-slate-900" : "font-playfair text-coffee-dark"
                )}>
                    {/* Decorative element from Brand theme */}
                    <span className={cn(
                        "absolute -bottom-[2px] left-0 w-full h-[2px] z-10",
                        isCompany ? "bg-sky-500" : "bg-coffee-dark"
                    )}></span>
                    <Link href={`${baseHref}?category=${category.slug}`} className={cn(
                        "transition-colors",
                        isCompany ? "hover:text-sky-600" : "hover:text-gold-primary"
                    )}>
                        {title}
                    </Link>
                </h2>
            </div>
        </div>
    );
}
