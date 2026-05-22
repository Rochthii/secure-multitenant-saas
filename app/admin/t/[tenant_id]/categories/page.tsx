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
        <div className="space-y-6 text-slate-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <FolderTree className="w-8 h-8 text-amber-400" />
                        Quản lý Danh mục
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Xây dựng & sắp xếp cấu trúc cây thư mục (Hỗ trợ kéo thả)</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <SeedCategoriesButton tenantId={tenant_id} />
                    <Link href={`/admin/t/${tenant_id}/categories/new`}>
                        <Button className="bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/20 px-5">
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
                <Card className="border-white/[0.08] bg-slate-900/40 backdrop-blur-xl overflow-hidden rounded-2xl shadow-none">
                    <CardContent className="p-16 text-center text-slate-400">
                        <FolderTree className="h-10 w-10 mx-auto mb-4 text-slate-600" />
                        <p className="mb-6 text-lg font-bold text-white">Chưa có danh mục nào trong hệ thống</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <SeedCategoriesButton tenantId={tenant_id} />
                            <Link href={`/admin/t/${tenant_id}/categories/new`}>
                                <Button className="bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/20 px-5">
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
