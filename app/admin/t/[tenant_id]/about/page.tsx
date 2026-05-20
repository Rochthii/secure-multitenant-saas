import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Pencil, Plus, FolderTree, CornerDownRight, Trash2, ExternalLink } from 'lucide-react';
import { getAboutSections } from '@/app/actions/admin/about-sections';
import { getTenant } from '@/app/actions/admin/tenants';
import { Card, CardContent } from '@/components/ui/card';
import { requireTenantAccess } from '@/lib/permissions';
// @ts-ignore - We will create this component next
import { DeleteAboutSectionButton } from '@/components/admin/about/delete-section-button';

import { AboutSectionList } from '@/components/admin/about/about-section-list';

export default async function AboutSectionsPage({ params }: { params: Promise<{ tenant_id: string }> }) {
    const { tenant_id } = await params;
    await requireTenantAccess(tenant_id);
    const sections = await getAboutSections(tenant_id);
    const { tenant } = await getTenant(tenant_id);

    // Xác định link website
    const publicUrl = tenant?.domain 
        ? `https://${tenant.domain}/vi/gioi-thieu` 
        : `/gioi-thieu`; // Fallback for local/relative paths

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Hồ sơ Năng lực & Giới thiệu</h1>
                    <p className="text-gray-500 mt-1">Quản lý cây nội dung trang Giới thiệu (cấu trúc cha/con, sắp xếp thứ tự)</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href={publicUrl} target="_blank">
                        <Button variant="outline" className="gap-2 shadow-sm border-gray-300">
                            <ExternalLink className="h-4 w-4" />
                            Xem trên Website
                        </Button>
                    </Link>
                    {/* Nút luôn hiện — bổ sung key còn thiếu và làm mới cache header */}
                    <form action={async () => {
                        'use server';
                        const { initializeDefaultSections } = await import('@/app/actions/admin/about-sections');
                        await initializeDefaultSections(tenant_id);
                    }}>
                        <Button variant="outline" title="Bổ sung các mục còn thiếu theo cấu trúc chuẩn doanh nghiệp và làm mới Header ngay lập tức" className="shadow-sm border-violet-300 text-violet-700 hover:bg-violet-50 gap-1.5">
                            <FolderTree className="h-4 w-4" />
                            {sections.length === 0 ? 'Khởi tạo mục mẫu' : 'Đồng bộ & làm mới Header'}
                        </Button>
                    </form>
                    <Link href={`/admin/t/${tenant_id}/about/new`}>
                        <Button className="bg-violet-600 hover:bg-violet-700 shadow-md text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Tạo thẻ mới
                        </Button>
                    </Link>
                </div>
            </div>

            {sections.length > 0 ? (
                <div className="mb-8">
                    <Card className="rounded-xl overflow-hidden shadow-sm">
                        <CardContent className="p-0">
                            <AboutSectionList initialSections={sections as any} tenantId={tenant_id} />
                        </CardContent>
                    </Card>
                </div>
            ) : (
            <Card>
                    <CardContent className="p-12 text-center text-gray-500">
                        <FolderTree className="h-8 w-8 mx-auto mb-4 text-gray-300" />
                        <p className="mb-4">Chưa có phần giới thiệu nào. Nhấn <strong>"Khởi tạo dữ liệu mẫu"</strong> ở góc trên hoặc tạo mới thủ công.</p>
                        <Link href={`/admin/t/${tenant_id}/about/new`}>
                            <Button className="bg-gold-primary hover:bg-gold-dark">
                                Tạo thẻ giới thiệu mới
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
