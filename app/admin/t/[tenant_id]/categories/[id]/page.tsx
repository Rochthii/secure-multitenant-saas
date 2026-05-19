import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { CategoryForm } from '@/components/admin/category-form';
import { GlobalCategory, TenantMetadata } from '@/types/admin';

interface EditCategoryPageProps {
    params: Promise<{ tenant_id: string; id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
    const { tenant_id, id } = await params;
    const supabase = await createClient();

    // Lấy thông tin category hiện tại
    const { data: categoryData } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
    
    const category = categoryData as unknown as GlobalCategory;

    if (!category) {
        notFound();
    }

    // Lấy toàn bộ danh mục để làm options cho Parent Category dropdown & danh sách tenants để broadcast
    const [allCategoriesRes, tenantsRes] = await Promise.all([
        supabase.from('categories').select('id, name_vi, module, parent_id, tenant_id').eq('tenant_id', tenant_id),
        (supabase as any).from('tenants').select('id, name, domain, tenant_type').eq('tenant_type', 'tenant').order('name')
    ]);

    const allCategories = (allCategoriesRes.data as unknown as GlobalCategory[]) || [];
    const tenants = (tenantsRes.data as unknown as TenantMetadata[]) || [];

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-playfair font-bold text-gray-900">Sửa danh mục</h1>
                <p className="text-gray-500 mt-1">Cập nhật thông tin phân loại nội dung.</p>
            </div>

            <CategoryForm 
                category={category} 
                allCategories={allCategories} 
                tenants={tenants}
                contextTenantId={tenant_id} 
            />
        </div>
    );
}
