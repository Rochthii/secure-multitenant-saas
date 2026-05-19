'use client';

import dynamic from 'next/dynamic';

const TransactionAnalytics = dynamic(
    () => import('./transaction-analytics').then(mod => mod.TransactionAnalytics),
    {
        loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-xl" />,
        ssr: false
    }
);

interface Props {
    transactions: any[];
}

export function TransactionAnalyticsWrapper({ transactions }: Props) {
    return <TransactionAnalytics transactions={transactions} />;
}
