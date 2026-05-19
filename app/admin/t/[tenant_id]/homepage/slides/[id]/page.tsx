import { HeroSlideForm } from '@/components/admin/hero-slide-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireEditor } from '@/lib/auth/require-admin';

interface PageProps {
    params: Promise<{
        id: string;
        tenant_id: string;
    }>;
}

export default async function EditHeroSlidePage({ params }: PageProps) {
    const { id, tenant_id: tenantId } = await params;

    // Auth guard
    try {
        await requireEditor();
    } catch {
        redirect('/admin/login');
    }

    const supabase = await createClient();

    const { data: slide, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single();

    const slideData = slide as any;

    if (!slide || error) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/admin/t/${tenantId}/homepage/slides`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold tracking-tight">Chỉnh sửa Slide</h1>
                    <p className="text-sm text-muted-foreground">{slideData?.title_vi}</p>
                </div>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm">
                <HeroSlideForm tenantId={tenantId} initialData={slideData} />
            </div>
        </div>
    );
}
