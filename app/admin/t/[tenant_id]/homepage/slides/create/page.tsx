import { HeroSlideForm } from '@/components/admin/hero-slide-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function CreateHeroSlidePage({ params }: { params: Promise<{ tenant_id: string }> }) {
    const { tenant_id: tenantId } = await params;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/admin/t/${tenantId}/homepage/slides`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">Tạo Hero Slide mới</h1>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm">
                <HeroSlideForm tenantId={tenantId} />
            </div>
        </div>
    );
}
