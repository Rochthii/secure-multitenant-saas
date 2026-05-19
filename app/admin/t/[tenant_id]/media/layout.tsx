import { requirePermission } from '@/lib/permissions';
import React from 'react';

export default async function MediaLayout({ children }: { children: React.ReactNode }) {
    await requirePermission('media', 'read');
    return <>{children}</>;
}
