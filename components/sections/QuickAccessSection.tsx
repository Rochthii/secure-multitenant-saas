'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { IconCard } from '@/components/ui/icon-card';

interface QuickLink {
    id: string;
    order_position: number;
    icon_emoji: string;
    translation_key: string;
    href: string;
    color_class: string;
}

interface QuickAccessSectionProps {
    links: QuickLink[];
}

export function QuickAccessSection({ links }: QuickAccessSectionProps) {
    const t = useTranslations('home.quickAccess');

    if (!links || links.length === 0) {
        return null; // Don't render if no links
    }

    return (
        <section className="py-16 bg-ivory relative">
            {/* Decorative pattern overlay */}
            <div className="absolute inset-0 bg-[url('/patterns/khmer-pattern-light.png')] opacity-5 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-24 md:-mt-32">
                    {links.map((link, index) => (
                        <div
                            key={link.id}
                            className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards"
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            <Link href={link.href} className="block h-full">
                                <IconCard
                                    emoji={link.icon_emoji}
                                    title={t(`${link.translation_key}.title`)}
                                    description={t(`${link.translation_key}.description`)}
                                    iconColor={link.color_class}
                                />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
