import { requirePermission } from '@/lib/permissions';
import React from 'react';

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
    await requirePermission('registrations', 'read');
    return <>{children}</>;
}
