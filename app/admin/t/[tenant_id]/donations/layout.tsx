import { requirePermission } from '@/lib/permissions';
import React from 'react';

export default async function TransactionsLayout({ children }: { children: React.ReactNode }) {
    await requirePermission('transactions', 'read');
    return <>{children}</>;
}
