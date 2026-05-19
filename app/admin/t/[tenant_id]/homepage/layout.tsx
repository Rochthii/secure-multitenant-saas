import { requirePermission } from '@/lib/permissions';
import React from 'react';

export default async function HomepageLayout({ children }: { children: React.ReactNode }) {
    await requirePermission('news', 'read');
    return <>{children}</>;
}
