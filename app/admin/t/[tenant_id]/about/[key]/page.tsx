import { notFound } from 'next/navigation';
import { getAboutSectionByKey } from '@/app/actions/admin/about-sections';
import { AboutSectionForm } from '@/components/admin/about-section-form';
import { createClient } from '@/lib/supabase/server';

interface PageProps {
    params: Promise<{
        tenant_id: string;
        key: string;
    }>;
}

export default async function EditAboutSectionPage({ params }: PageProps) {
    const { tenant_id, key } = await params;
    
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    const { data: roleData } = await (supabase as any)
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id as string)
        .maybeSingle();
    const currentUserRole = roleData?.role || ((user?.app_metadata?.role ?? user?.user_metadata?.role) as string) || 'editor';

    const section = await getAboutSectionByKey(key, tenant_id);

    if (!section) {
        notFound();
    }

    const SECTION_NAMES: Record<string, string> = {
        'intro': 'Giới thiệu chung',
        'history': 'Lịch sử hình thành',
        'architecture': 'Kiến trúc & Nghệ thuật',
        'founder': 'Người sáng lập',
        'abbot': 'Trụ trì',
    };

    const sectionName = SECTION_NAMES[key] || key;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Chỉnh sửa: {sectionName}</h1>
                <p className="text-muted-foreground">
                    Cập nhật nội dung và hình ảnh cho phần này
                </p>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm">
                <AboutSectionForm 
                    initialData={section} 
                    sectionKey={key} 
                    contextTenantId={tenant_id} 
                    currentUserRole={currentUserRole}
                />
            </div>
        </div>
    );
}
