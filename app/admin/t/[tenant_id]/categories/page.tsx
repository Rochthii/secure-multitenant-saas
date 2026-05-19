import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FolderTree } from 'lucide-react';
import { CategoriesClient } from './categories-client';
import { requireTenantAccess } from '@/lib/permissions';
import { SeedCategoriesButton } from '@/components/admin/seed-categories-button';
import { NavVisibilitySettings } from '@/components/admin/nav-visibility-settings';

export default async function CategoriesListPage({ params }: { params: Promise<{ tenant_id: string }> }) {
    const { tenant_id } = await params;
    await requireTenantAccess(tenant_id);
    const supabase = await createClient();

    const { data: tenant } = await supabase
        .from('tenants' as any)
        .select('*')
        .eq('id', tenant_id)
        .single();

    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .or(`tenant_id.eq.${tenant_id},published_to.cs.{${tenant_id}}`)
        .order('order_position', { ascending: true })
        .order('created_at', { ascending: true });

    const cats = (categories || []) as any[];

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-playfair font-bold text-gray-900">Quản lý Danh mục</h1>
                    <p className="text-gray-500 mt-1">Xây dựng & sắp xếp cấu trúc cây thư mục (Hỗ trợ kéo thả)</p>
                </div>
                <div className="flex items-center gap-3">
                    <SeedCategoriesButton tenantId={tenant_id} />
                    <Link href={`/admin/t/${tenant_id}/categories/new`}>
                        <Button className="bg-gold-primary hover:bg-gold-dark shadow-md">
                            <Plus className="h-4 w-4 mr-2" />
                            Tạo danh mục mới
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="mb-8">
                <NavVisibilitySettings 
                    tenantId={tenant_id} 
                    initialNavVisibility={(tenant as any)?.nav_visibility || {}} 
                />
            </div>

            {cats.length > 0 ? (
                <CategoriesClient initialCategories={cats} tenantId={tenant_id} />
            ) : (
                <Card>
                    <CardContent className="p-12 text-center text-gray-500">
                        <FolderTree className="h-8 w-8 mx-auto mb-4 text-gray-300" />
                        <p className="mb-4 text-lg">Chưa có danh mục nào trong hệ thống</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <SeedCategoriesButton tenantId={tenant_id} />
                            <Link href={`/admin/t/${tenant_id}/categories/new`}>
                                <Button className="bg-gold-primary hover:bg-gold-dark">
                                    Tạo danh mục thủ công
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
