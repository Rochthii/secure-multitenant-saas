'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { formatCurrency } from '@/lib/constants/transaction';
import { RecentTransaction } from '@/lib/donations';
import { motion } from 'framer-motion';

interface RecentDonationsProps {
    transactions?: RecentTransaction[];
    limit?: number;
    className?: string;
    purposes?: import('@/lib/constants/transaction').TransactionPurpose[];
    isCompany?: boolean;
}

export function RecentDonations({ transactions = [], purposes = [], className, isCompany }: RecentDonationsProps) {
    if (!transactions || transactions.length === 0) {
        return (
            <div className={`text-center py-8 text-gray-500 bg-white rounded-xl border border-dashed border-gray-200 ${className}`}>
                {isCompany ? 'Chưa có thông tin đóng góp gần đây' : 'Chưa có thông tin gieo duyên gần đây'}
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {transactions.map((transaction, index) => {
                const displayName = transaction.is_anonymous ? 'Ẩn danh' : transaction.donor_name;
                const initial = transaction.is_anonymous ? '?' : transaction.donor_name.charAt(0).toUpperCase();

                return (
                    <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gold-primary/10 text-gold-primary font-bold">
                                {initial}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <p className="font-semibold text-gray-900 truncate pr-2">{displayName}</p>
                                <p className="font-bold text-gold-primary whitespace-nowrap text-sm">
                                    {formatCurrency(transaction.amount)}
                                </p>
                            </div>
                            <div className="flex justify-between items-center mt-0.5">
                                <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                    {(() => {
                                        const found = purposes.find(p => p.id === transaction.project_id);
                                        return found ? found.title : (isCompany ? 'Dự án' : 'Thanh toán');
                                    })()}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {formatDistanceToNow(new Date(transaction.created_at), {
                                        addSuffix: true,
                                        locale: vi,
                                    })}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

