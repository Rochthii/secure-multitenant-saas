import { AboutSectionForm } from '@/components/admin/about-section-form';
import { createClient } from '@/lib/supabase/server';

interface PageProps {
    params: Promise<{
        tenant_id: string;
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function NewAboutSectionPage({ params, searchParams }: PageProps) {
    const { tenant_id } = await params;
    
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    const { data: roleData } = await (supabase as any)
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id as string)
        .maybeSingle();
    const currentUserRole = roleData?.role || ((user?.app_metadata?.role ?? user?.user_metadata?.role) as string) || 'editor';

    const resolvedSearchParams = await searchParams;
    const parentKey = typeof resolvedSearchParams.parent === 'string' ? resolvedSearchParams.parent : undefined;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Thêm mới phần giới thiệu</h1>
                <p className="text-muted-foreground">
                    {parentKey ? `Thêm nội dung con cho phần: ${parentKey}` : 'Tạo mới một phần giới thiệu gốc'}
                </p>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm">
                <AboutSectionForm 
                    contextTenantId={tenant_id} 
                    parentKey={parentKey} 
                    currentUserRole={currentUserRole}
                />
            </div>
        </div>
    );
}
