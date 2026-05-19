import { notFound } from 'next/navigation';
import { getTenantConfig } from '@/lib/tenant';

export default async function PhuocDienLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ domain: string }>;
}) {
    const { domain } = await params;
    const tenantConfig = await getTenantConfig(domain).catch(() => null);

    if (!tenantConfig || tenantConfig.modules_config?.transactions === false) {
        notFound();
    }

    return <>{children}</>;
}
