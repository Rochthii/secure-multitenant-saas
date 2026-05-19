import React from 'react';
import { getOrganizations } from '@/app/actions/admin/organizations';
import { requirePermission } from '@/lib/permissions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Building2, Globe, Pencil, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ORG_TYPE_LABELS: Record<string, string> = {
    enterprise: '🏢 Doanh nghiệp XH',
    ngo: '🌍 Phi lợi nhuận/NGO',
    partner: '🤝 Đối tác đồng hành',
};

export default async function OrganizationsPage() {
    await requirePermission('tenants', 'read');

    const { organizations, error } = await getOrganizations();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-playfair font-bold text-slate-900 font-serif">Quản lý Tổ chức</h1>
                    <p className="text-gray-500 mt-1">
                        Danh sách các doanh nghiệp xã hội và đối tác trong hệ sinh thái ({organizations.length} tổ chức)
                    </p>
                </div>
                <Link href="/admin/organizations/new">
                    <Button className="gap-2 bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20 rounded-xl">
                        <Plus className="w-4 h-4" />
                        Thêm Tổ chức Mới
                    </Button>
                </Link>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm">
                    Lỗi tải dữ liệu: {error}
                </div>
            )}

            {/* Organizations List */}
            {organizations.length === 0 ? (
                <Card className="border-dashed border-2 bg-slate-50/50">
                    <CardContent className="py-20 text-center text-gray-400">
                        <Building2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-bold text-gray-500">Chưa có tổ chức nào</h3>
                        <p className="text-sm mt-1">Bắt đầu bằng cách thêm một tổ chức xã hội hoặc đối tác mới.</p>
                        <Link href="/admin/organizations/new" className="inline-block mt-4">
                            <Button variant="outline" className="rounded-xl">Thêm ngay</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {organizations.map(org => (
                        <Card key={org.id} className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-md group overflow-hidden bg-white/80 backdrop-blur-md rounded-2xl ring-1 ring-slate-200">
                            <div className="h-1 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner group-hover:bg-purple-50 transition-colors">
                                        {org.logo_url ? (
                                            <img src={org.logo_url} alt={org.name} className="w-full h-full object-contain rounded-xl" />
                                        ) : (
                                            <Building2 className="w-7 h-7 text-slate-400 group-hover:text-purple-500 transition-colors" />
                                        )}
                                    </div>
                                    <Badge variant={org.is_active ? "default" : "secondary"} className={org.is_active ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200" : ""}>
                                        {org.is_active ? 'Đang hoạt động' : 'Tạm ẩn'}
                                    </Badge>
                                </div>

                                <div className="mb-6">
                                    <h3 className="font-bold text-xl text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-1">{org.name}</h3>
                                    <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">
                                        {ORG_TYPE_LABELS[org.org_type] || org.org_type}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-4 line-clamp-2 min-h-[40px]">
                                        {org.description || 'Chưa có mô tả ngắn về tổ chức này.'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t border-slate-50 mt-auto">
                                    <Link href={`/admin/organizations/${org.id}`} className="flex-1">
                                        <Button variant="secondary" className="w-full rounded-xl gap-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-all font-bold">
                                            <Pencil className="w-4 h-4" />
                                            Quản lý
                                        </Button>
                                    </Link>
                                    {org.website_url && (
                                        <a href={org.website_url} target="_blank" rel="noopener noreferrer">
                                            <Button size="icon" variant="outline" className="rounded-xl hover:text-blue-500 hover:bg-blue-50">
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
