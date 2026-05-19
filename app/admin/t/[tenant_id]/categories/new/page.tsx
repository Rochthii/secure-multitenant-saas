import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { CategoryForm } from '@/components/admin/category-form';
import { GlobalCategory, TenantMetadata } from '@/types/admin';

interface NewCategoryPageProps {
    params: Promise<{ tenant_id: string }>;
}

export default async function NewCategoryPage({ params }: NewCategoryPageProps) {
    const { tenant_id } = await params;
    const supabase = await createClient();

    // Lấy toàn bộ danh mục để làm options cho Parent Category dropdown
    const [allCategoriesRes, tenantsRes] = await Promise.all([
        supabase.from('categories').select('id, name_vi, module, parent_id, tenant_id').eq('tenant_id', tenant_id),
        (supabase as any).from('tenants').select('id, name, domain, tenant_type').eq('tenant_type', 'tenant').order('name')
    ]);

    const allCategories = (allCategoriesRes.data as unknown as GlobalCategory[]) || [];
    const tenants = (tenantsRes.data as unknown as TenantMetadata[]) || [];

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-playfair font-bold text-gray-900">Tạo danh mục mới</h1>
                <p className="text-gray-500 mt-1">Thêm một chuyên mục nội dung để phân loại bài viết, video...</p>
            </div>

            <CategoryForm 
                allCategories={allCategories} 
                tenants={tenants}
                contextTenantId={tenant_id} 
            />
        </div>
    );
}
