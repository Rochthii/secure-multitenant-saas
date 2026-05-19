import { requirePermission } from '@/lib/permissions';
import React from 'react';

export default async function CategoriesLayout({ children }: { children: React.ReactNode }) {
    await requirePermission('categories', 'read');
    return <>{children}</>;
}
