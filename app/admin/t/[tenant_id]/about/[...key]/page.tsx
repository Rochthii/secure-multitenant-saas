import { notFound } from 'next/navigation';
import { getAboutSectionByKey } from '@/app/actions/admin/about-sections';
import { AboutSectionForm } from '@/components/admin/about-section-form';
import { createClient } from '@/lib/supabase/server';

interface PageProps {
    params: Promise<{
        tenant_id: string; // Thêm tenant_id
        key: string[]; // catch-all: ['truyen-thua-tiep-noi', 'tru-tri-duong-nhiem']
    }>;
}

export default async function EditAboutSectionPage({ params }: PageProps) {
    const { tenant_id, key: keySegments } = await params;
    
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    const { data: roleData } = await (supabase as any)
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id as string)
        .maybeSingle();
    const currentUserRole = roleData?.role || ((user?.app_metadata?.role ?? user?.user_metadata?.role) as string) || 'editor';

    // Ghép lại thành key thực: 'truyen-thua-tiep-noi/tru-tri-duong-nhiem'
    const key = keySegments.join('/');

    const section = await getAboutSectionByKey(key, tenant_id);

    if (!section) {
        notFound();
    }

    const SECTION_NAMES: Record<string, string> = {
        'dong-chay-lich-su': 'Dòng Chảy Lịch Sử',
        'truyen-thua-tiep-noi': 'Truyền Thừa & Tiếp Nối',
        'di-san-nghe-thuat': 'Di Sản & Nghệ Thuật',
        'noi-quy-tu-vien': 'Nội Quy Tu Viện',
    };

    const sectionName = section.title_vi || SECTION_NAMES[key] || key;

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
