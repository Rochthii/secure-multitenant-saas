'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { cn } from '@/lib/utils';
import { Users, Heart, Calendar, GraduationCap } from 'lucide-react';
import { DharmaWheelIcon, HandsPrayerIcon, TenantIcon, MeditatingPersonIcon } from '@/components/ui/khmer-icons';

interface Stat {
    id: string;
    order_position: number;
    icon_emoji: string;
    stat_value: number;
    suffix: string;
    label_vi: string;
    label_km: string | null;
    label_en: string | null;
}

interface StatsSectionProps {
    stats: Stat[];
}

export function StatsSection({ stats }: StatsSectionProps) {
    const locale = useLocale();

    // Get localized label
    const getStatLabel = (stat: Stat) => {
        if (locale === 'km' && stat.label_km) return stat.label_km;
        if (locale === 'en' && stat.label_en) return stat.label_en;
        return stat.label_vi;
    };
    
    const getStatIcon = (emoji: string) => {
        switch (emoji) {
            case '👥': return <Users className="w-10 h-10" />;
            case '🙏': return <HandsPrayerIcon className="w-10 h-10" />;
            case '☸️':
            case '☸': return <DharmaWheelIcon className="w-10 h-10" />;
            case '🧘': return <MeditatingPersonIcon className="w-10 h-10" />;
            case '🏠':
            case '🏛️':
            case '🏛': return <TenantIcon className="w-10 h-10" />;
            case '❤️':
            case '💖': return <Heart className="w-10 h-10" />;
            case '📅': return <Calendar className="w-10 h-10" />;
            case '🎓':
            case '📖': return <GraduationCap className="w-10 h-10" />;
            default: return <span className="text-4xl md:text-5xl">{emoji}</span>;
        }
    };

    if (!stats || stats.length === 0) {
        return null; // Don't render if no stats
    }

    return (
        <section className="py-16 bg-gradient-to-b from-ivory to-white relative overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 bg-[url('/patterns/khmer-pattern-light.png')] opacity-3 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {stats.map((stat, index) => (
                        <div
                            key={stat.id}
                            className={cn(
                                'group relative bg-white rounded-xl p-6 md:p-8',
                                'shadow-md hover:shadow-xl transition-all duration-300',
                                'border border-stone-100 hover:border-gold-primary/30',
                                'animate-in fade-in slide-in-from-bottom-6 duration-700',
                                'hover:scale-105 cursor-default'
                            )}
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            {/* Icon */}
                            <div className="mb-3 md:mb-4 flex justify-center text-gold-primary group-hover:scale-110 transition-transform duration-300">
                                {getStatIcon(stat.icon_emoji)}
                            </div>

                            {/* Counter */}
                            <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-gold-primary mb-2 text-center">
                                <AnimatedCounter
                                    value={stat.stat_value}
                                    suffix={stat.suffix}
                                    duration={2000}
                                />
                            </div>

                            {/* Label */}
                            <p className="text-xs md:text-sm text-stone-600 text-center font-medium leading-tight">
                                {getStatLabel(stat)}
                            </p>

                            {/* Decorative gradient bar */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-primary/0 via-gold-primary to-gold-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
