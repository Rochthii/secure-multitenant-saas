import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, FileText, CornerDownRight } from 'lucide-react';
import { formatDate } from 'date-fns';
import { vi } from 'date-fns/locale';
import { requireTenantAccess } from '@/lib/permissions';
import { DeletePageButton } from '@/components/admin/pages/delete-page-button';

export default async function PagesListPage({ params }: { params: Promise<{ tenant_id: string }> }) {
    const { tenant_id } = await params;
    await requireTenantAccess(tenant_id);
    const supabase = await createClient();

    const { data: pages } = await supabase
        .from('pages')
        .select('*')
        .eq('tenant_id', tenant_id)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true });

    const pgs = (pages || []) as any[];

    // Tách cây thư mục (Root và Children)
    const renderPageTree = () => {
        if (pgs.length === 0) return null;

        const roots = pgs.filter(p => !p.parent_id);
        const children = pgs.filter(p => p.parent_id);

        const getChildren = (parentId: string) => children.filter(p => p.parent_id === parentId);

        const renderNode = (node: any, level: number = 0) => {
            const nodeChildren = getChildren(node.id);
            const indentClass = level === 1 ? 'ml-8 border-l-2 border-gray-200 pl-4' : level === 2 ? 'ml-16 border-l-2 border-gray-200 pl-4' : '';

            return (
                <React.Fragment key={node.id}>
                    <div className={`p-4 hover:bg-gray-50 flex items-center justify-between border-t border-gray-100 ${indentClass}`}>
                        <div className="flex items-center gap-3">
                            {level === 0 ? (
                                <FileText className="h-5 w-5 text-gold-primary" />
                            ) : (
                                <CornerDownRight className="h-4 w-4 text-gray-400" />
                            )}
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className={`font-semibold text-gray-900 ${level === 0 ? 'text-base' : 'text-sm'}`}>
                                        {node.title_vi}
                                    </h3>
                                    <span className={`px-2 inline-flex text-[10px] leading-4 font-semibold rounded-full ${node.status === 'published'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {node.status === 'published' ? 'Công khai' : 'Nháp'}
                                    </span>
                                    {node.show_in_menu === false && (
                                        <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-200">Ẩn khỏi Menu</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400">/{node.slug} • Khởi tạo: {formatDate(new Date(node.created_at), 'dd/MM/yyyy', { locale: vi })}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 items-center">
                            <div className="flex gap-1 mr-4">
                                {node.title_en && <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">EN</span>}
                                {node.title_km && <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded">KM</span>}
                            </div>
                            <Link href={`/admin/t/${tenant_id}/pages/${node.slug}`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Edit className="h-4 w-4 text-gray-500 hover:text-gold-primary" />
                                </Button>
                            </Link>
                            <DeletePageButton slug={node.slug} tenantId={tenant_id} hasChildren={nodeChildren.length > 0} />
                        </div>
                    </div>
                    {/* Render children recursively */}
                    {nodeChildren.map((child: any) => renderNode(child, level + 1))}
                </React.Fragment>
            );
        };

        return (
            <Card className="rounded-xl overflow-hidden shadow-sm">
                <CardContent className="p-0 flex flex-col">
                    {roots.map((root: any) => renderNode(root))}
                </CardContent>
            </Card>
        );
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-playfair font-bold text-gray-900">Quản lý Trang Nội Dung</h1>
                    <p className="text-gray-500 mt-1">Cấu trúc cây trang (Hoạt động như thanh điều hướng chính)</p>
                </div>
                <Link href={`/admin/t/${tenant_id}/pages/new`}>
                    <Button className="bg-gold-primary hover:bg-gold-dark shadow-md">
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo trang mới
                    </Button>
                </Link>
            </div>

            {pgs.length > 0 ? (
                renderPageTree()
            ) : (
                <Card>
                    <CardContent className="p-12 text-center text-gray-500">
                        <FileText className="h-8 w-8 mx-auto mb-4 text-gray-300" />
                        <p className="mb-4">Chưa có trang nội dung nào</p>
                        <Link href={`/admin/t/${tenant_id}/pages/new`}>
                            <Button className="bg-gold-primary hover:bg-gold-dark">
                                Tạo trang đầu tiên
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">📝 Hướng dẫn Tổ chức Trang</h3>
                <ul className="text-sm text-blue-800 list-disc ml-5 space-y-1">
                    <li>Các Trang hoạt động theo mô hình <strong>Cha - Con</strong>. Nếu một trang có "Trang cha", nó sẽ hiển thị lùi vào dưới nhánh cha đổ xuống.</li>
                    <li><strong>Menu Website</strong> sẽ tự động hiển thị các trang nằm ngoài cùng là Menu gốc, và trang con dưới dạng mục sổ xuống (Dropdown - Nếu bạn chọn "Hiển thị trên Menu").</li>
                    <li>Sử dụng thuộc tính <strong>Order Index</strong> trong lúc Sửa trang để tùy biến thứ tự hiển thị từ Trái sang Phải trên Header.</li>
                </ul>
            </div>
        </div>
    );
}
