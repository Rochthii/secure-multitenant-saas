'use client';

import React from 'react';
import { Building2, GraduationCap, Heart, Landmark, HandCoins, LucideIcon } from 'lucide-react';
import { IconCard } from '@/components/ui/icon-card';
import { Progress } from '@/components/ui/progress';
import { TransactionPurpose, calculatePercentage, formatCurrency } from '@/lib/constants/transaction';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const ICON_MAP: Record<string, LucideIcon> = {
    Building2,
    GraduationCap,
    Heart,
    Landmark,
    HandCoins
};

interface TransactionPurposeSelectorProps {
    purposes: TransactionPurpose[];
    selectedPurpose: string | null;
    onPurposeChange: (id: string) => void;
}

export function TransactionPurposeSelector({
    purposes,
    selectedPurpose,
    onPurposeChange,
}: TransactionPurposeSelectorProps) {
    if (!purposes || purposes.length === 0) {
        return <div className="text-center p-8 text-gray-500">Đang cập nhật danh mục...</div>;
    }

    return (
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2">
            {purposes.map((purpose) => {
                // Fallback icon if mapped icon not found
                const Icon = ICON_MAP[purpose.icon] || Landmark;
                const percentage = calculatePercentage(purpose.current, purpose.goal);
                const isSelected = selectedPurpose === purpose.id;

                return (
                    <motion.div
                        key={purpose.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onPurposeChange(purpose.id)}
                        className={cn(
                            'cursor-pointer transition-all duration-300 rounded-xl border border-gray-100 bg-white hover:shadow-lg',
                            isSelected
                                ? 'ring-2 ring-gold-primary shadow-gold-glow/20 bg-gold-primary/5 border-gold-primary'
                                : 'hover:border-gold-primary/30'
                        )}
                    >
                        <div className="p-5 h-full flex flex-col">
                            <div className="flex items-start gap-4 mb-3">
                                <div className={cn(
                                    "p-3 rounded-lg flex-shrink-0",
                                    isSelected ? "bg-gold-primary text-white" : "bg-gray-100 text-gray-500Group"
                                )}>
                                    <Icon className={cn("h-6 w-6", !isSelected && purpose.color)} />
                                </div>
                                <div>
                                    <h3 className={cn("font-playfair font-bold text-lg", isSelected ? "text-gold-primary" : "text-gray-800")}>
                                        {purpose.title}
                                    </h3>
                                    {purpose.description && (
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                            {purpose.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {purpose.goal > 0 && purpose.current !== undefined && (
                                <div className="mt-auto pt-4 border-t border-gray-50">
                                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                                        <span className={cn(purpose.color ?? 'text-gold-primary')}>{percentage}%</span>
                                        <span className="text-gray-400">Mục tiêu: {formatCurrency(purpose.goal)}</span>
                                    </div>
                                    <Progress
                                        value={percentage}
                                        className="h-2 bg-gray-100"
                                        indicatorClassName={cn((purpose.color ?? 'text-gold-primary').replace('text-', 'bg-'))}
                                    />
                                    <p className="text-xs text-gray-500 mt-2 text-right">
                                        Đã nhận: <span className="font-semibold text-gray-700">{formatCurrency(purpose.current)}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
