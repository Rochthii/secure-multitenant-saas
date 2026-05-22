import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, FileText, CornerDownRight, Info } from 'lucide-react';
import { formatDate } from 'date-fns';
import { vi } from 'date-fns/locale';
import { requireTenantAccess } from '@/lib/permissions';
import { DeletePageButton } from '@/components/admin/pages/delete-page-button';
import { Badge } from '@/components/ui/badge';

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
            const indentClass = level === 1 ? 'ml-8 border-l-2 border-white/10 pl-4' : level === 2 ? 'ml-16 border-l-2 border-white/10 pl-4' : '';

            return (
                <React.Fragment key={node.id}>
                    <div className={`p-4 hover:bg-white/[0.02] flex items-center justify-between border-t border-white/[0.05] transition-colors ${indentClass}`}>
                        <div className="flex items-center gap-3">
                            {level === 0 ? (
                                <FileText className="h-5 w-5 text-amber-400" />
                            ) : (
                                <CornerDownRight className="h-4 w-4 text-slate-500" />
                            )}
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className={`font-bold text-white ${level === 0 ? 'text-base' : 'text-sm'}`}>
                                        {node.title_vi}
                                    </h3>
                                    {node.status === 'published' ? (
                                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5 text-[10px] font-bold">
                                            Công khai
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-white/5 text-slate-400 border border-white/10 rounded-full px-2 py-0.5 text-[10px] font-bold">
                                            Nháp
                                        </Badge>
                                    )}
                                    {node.show_in_menu === false && (
                                        <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 rounded px-1.5 py-0.5 text-[10px] font-bold">
                                            Ẩn khỏi Menu
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 mt-1">/{node.slug} • Khởi tạo: {formatDate(new Date(node.created_at), 'dd/MM/yyyy', { locale: vi })}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 items-center">
                            <div className="flex gap-1 mr-4">
                                {node.title_en && <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold">EN</Badge>}
                                {node.title_km && <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold">KM</Badge>}
                            </div>
                            <Link href={`/admin/t/${tenant_id}/pages/${node.slug}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-amber-400 hover:bg-white/5 rounded-xl transition-colors">
                                    <Edit className="h-4 w-4" />
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
            <Card className="border-white/[0.08] bg-slate-900/40 backdrop-blur-xl overflow-hidden rounded-2xl shadow-none">
                <CardContent className="p-0 flex flex-col">
                    {roots.map((root: any) => renderNode(root))}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6 text-slate-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <FileText className="w-8 h-8 text-amber-400" />
                        Quản lý Trang Nội Dung
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Cấu trúc cây trang (Hoạt động như thanh điều hướng chính)</p>
                </div>
                <Link href={`/admin/t/${tenant_id}/pages/new`}>
                    <Button className="bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/20 px-5">
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo trang mới
                    </Button>
                </Link>
            </div>

            {pgs.length > 0 ? (
                renderPageTree()
            ) : (
                <Card className="border-white/[0.08] bg-slate-900/40 backdrop-blur-xl overflow-hidden rounded-2xl shadow-none">
                    <CardContent className="p-16 text-center text-slate-400">
                        <FileText className="h-10 w-10 mx-auto mb-4 text-slate-600" />
                        <p className="mb-4 font-bold text-white">Chưa có trang nội dung nào</p>
                        <Link href={`/admin/t/${tenant_id}/pages/new`}>
                            <Button className="bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/20 px-5">
                                Tạo trang đầu tiên
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            <div className="p-5 bg-blue-950/20 rounded-2xl border border-blue-500/20 text-slate-300 flex gap-4">
                <div className="mt-0.5 bg-blue-500/10 p-2 rounded-xl h-fit border border-blue-500/20">
                    <Info className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                    <h3 className="font-bold text-blue-300 mb-2">📝 Hướng dẫn Tổ chức Trang</h3>
                    <ul className="text-sm text-slate-400 list-disc ml-5 space-y-1">
                        <li>Các Trang hoạt động theo mô hình <strong>Cha - Con</strong>. Nếu một trang có "Trang cha", nó sẽ hiển thị lùi vào dưới nhánh cha đổ xuống.</li>
                        <li><strong>Menu Website</strong> sẽ tự động hiển thị các trang nằm ngoài cùng là Menu gốc, và trang con dưới dạng mục sổ xuống (Dropdown - Nếu bạn chọn "Hiển thị trên Menu").</li>
                        <li>Sử dụng thuộc tính <strong>Order Index</strong> trong lúc Sửa trang để tùy biến thứ tự hiển thị từ Trái sang Phải trên Header.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
