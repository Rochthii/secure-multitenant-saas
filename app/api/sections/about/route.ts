/**
 * API Route: /api/sections/about
 * Trả về about_sections cho AngkorArchShowcase, LotusCultureGallery và các client components.
 */
import { NextResponse } from 'next/server';
import { getCachedAboutSections } from '@/lib/cache/queries';
import { getTenantConfig } from '@/lib/tenant';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const headersList = await headers();
        const host = headersList.get('host') || '';
        const tenant = await getTenantConfig(host);
        const tenantId = tenant?.id;

        if (!tenantId) {
            return NextResponse.json({ sections: [] }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
        }

        const sections = await getCachedAboutSections(tenantId);

        return NextResponse.json(
            { sections },
            { headers: { 'Cache-Control': 'no-store, max-age=0' } }
        );
    } catch (error) {
        console.error('[API] about sections error:', error);
        return NextResponse.json({ sections: [] }, { status: 200 });
    }
}
