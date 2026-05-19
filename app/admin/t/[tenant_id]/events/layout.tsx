import { requirePermission } from '@/lib/permissions';
import React from 'react';

export default async function EventsLayout({ children }: { children: React.ReactNode }) {
    await requirePermission('events', 'read');
    return <>{children}</>;
}
