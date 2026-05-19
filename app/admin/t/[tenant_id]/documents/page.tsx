import React from 'react';
import { getDharmaTalksAdmin } from '@/app/actions/admin/dharma-talks';
import { DharmaTalksClient } from './dharma-talks-client';
import { getTenant } from '@/app/actions/admin/tenants';
import { createClient } from '@/lib/supabase/server';
import { GraduationCap, BookOpen } from 'lucide-react';

export default async function PhapAmAdminPage({ params }: { params: Promise<{ tenant_id: string }> }) {
    const { tenant_id } = await params;
    const talks = await getDharmaTalksAdmin(tenant_id);
    const { tenant } = await getTenant(tenant_id);
    const isCompany = tenant?.tenant_type !== 'tenant';
    
    const supabase = await createClient();

    // Lấy role user hiện tại
    const { data: { user } } = await supabase.auth.getUser();

    const { data: roleData } = await (supabase as any)
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id as string)
        .maybeSingle();

    const currentUserRole = roleData?.role || ((user?.app_metadata?.role ?? user?.user_metadata?.role) as string) || 'editor';

    // Fetch categories: chỉ lấy của chi nhánh hiện tại + danh mục chung
    const { data: categoriesRaw } = await (supabase as any)
        .from('categories')
        .select('*')
        .or(`tenant_id.is.null,tenant_id.eq.${tenant_id},tenant_id.eq.55555555-5555-5555-5555-555555555555`)
        .eq('module', 'dharma')
        .order('name_vi');

    const categories = (categoriesRaw || []).map((cat: any) => ({
        ...cat,
        isGlobal: cat.tenant_id === '55555555-5555-5555-5555-555555555555' || !cat.tenant_id
    }));

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-indigo-500/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                            {isCompany ? <GraduationCap className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                        </div>
                        <h1 className="text-3xl font-playfair font-black text-slate-900">
                            {isCompany ? 'Hệ thống E-Learning & Đào tạo' : 'Quản lý Pháp Thoại & Tư liệu'}
                        </h1>
                    </div>
                    <p className="text-slate-500 text-sm max-w-xl">
                        {isCompany 
                            ? 'Quản lý các khóa đào tạo nội bộ, video hướng dẫn nghiệp vụ và tài liệu kỹ thuật dành cho nhân sự.' 
                            : 'Số hóa và quản lý các bài giảng pháp âm, tài liệu Phật giáo và tư liệu truyền thống của cơ sở.'}
                    </p>
                </div>
            </div>

            <DharmaTalksClient
                initialTalks={talks as any}
                categories={categories || []}
                tenants={[]}
                contextTenantId={tenant_id}
                currentUserRole={currentUserRole}
                isCompany={isCompany}
            />
        </div>
    );
}
