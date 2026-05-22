import React from 'react';
import { getOrganizations } from '@/app/actions/admin/organizations';
import { requirePermission } from '@/lib/permissions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Building2, Globe, Pencil, ExternalLink, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ORG_TYPE_LABELS: Record<string, string> = {
    enterprise: '🏢 Doanh nghiệp XH',
    ngo: '🌍 Phi lợi nhuận/NGO',
    partner: '🤝 Đối tác đồng hành',
};

export default async function TenantOrganizationsPage({ params }: { params: Promise<{ tenant_id: string }> }) {
    const { tenant_id } = await params;
    await requirePermission('tenants', 'read');

    const { organizations, error } = await getOrganizations(tenant_id);

    return (
        <div className="space-y-6 text-slate-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Building2 className="w-8 h-8 text-amber-400" />
                        Mạng lưới Đối tác
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">
                        Danh sách các doanh nghiệp xã hội và đối tác trong hệ sinh thái ({organizations.length} tổ chức)
                    </p>
                </div>
                <Link href={`/admin/t/${tenant_id}/organizations/new`}>
                    <Button className="gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md shadow-amber-900/10 rounded-xl">
                        <Plus className="w-4 h-4" />
                        Thêm Đối tác Mới
                    </Button>
                </Link>
            </div>

            {error && (
                <div className="bg-red-950/30 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                    <span>Lỗi tải dữ liệu: {error}</span>
                </div>
            )}

            {/* Organizations List */}
            {organizations.length === 0 ? (
                <Card className="border-white/[0.08] bg-slate-900/40 backdrop-blur-xl">
                    <CardContent className="py-20 text-center text-slate-500">
                        <Building2 className="w-16 h-16 mx-auto mb-4 opacity-20 text-amber-400" />
                        <h3 className="text-lg font-bold text-white mb-2">Chưa có đối tác nào</h3>
                        <p className="text-sm text-slate-400">Bắt đầu bằng cách thêm một tổ chức xã hội hoặc đối tác mới.</p>
                        <Link href={`/admin/t/${tenant_id}/organizations/new`} className="inline-block mt-4">
                            <Button variant="outline" className="rounded-xl border-white/10 text-slate-300 hover:bg-white/5">Thêm ngay</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {organizations.map(org => (
                        <Card key={org.id} className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-350 border-white/[0.08] bg-slate-900/60 backdrop-blur-xl hover:bg-slate-900/80 hover:border-amber-500/30 shadow-xl group overflow-hidden rounded-2xl">
                            <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-14 h-14 bg-slate-950/40 rounded-xl flex items-center justify-center border border-white/[0.08] shadow-inner group-hover:bg-amber-500/10 group-hover:border-amber-500/20 transition-colors">
                                        {org.logo_url ? (
                                            <img src={org.logo_url} alt={org.name} className="w-full h-full object-contain rounded-xl" />
                                        ) : (
                                            <Building2 className="w-7 h-7 text-slate-500 group-hover:text-amber-400 transition-colors" />
                                        )}
                                    </div>
                                    <Badge variant={org.is_active ? "default" : "secondary"} className={org.is_active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-400"}>
                                        {org.is_active ? 'Đang hoạt động' : 'Tạm ẩn'}
                                    </Badge>
                                </div>

                                <div className="mb-6">
                                    <h3 className="font-bold text-xl text-white group-hover:text-amber-400 transition-colors line-clamp-1">{org.name}</h3>
                                    <p className="text-xs font-semibold text-slate-500 mt-1.5 uppercase tracking-wider">
                                        {ORG_TYPE_LABELS[org.org_type] || org.org_type}
                                    </p>
                                    <p className="text-sm text-slate-400 mt-4 line-clamp-2 min-h-[40px]">
                                        {org.description || 'Chưa có mô tả ngắn về tổ chức này.'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t border-white/5 mt-auto">
                                    <Link href={`/admin/t/${tenant_id}/organizations/${org.id}`} className="flex-1">
                                        <Button variant="outline" className="w-full border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all font-bold rounded-xl gap-2">
                                            <Pencil className="w-4 h-4 text-amber-400" />
                                            Quản lý
                                        </Button>
                                    </Link>
                                    {org.website_url && (
                                        <a href={org.website_url} target="_blank" rel="noopener noreferrer">
                                            <Button size="icon" variant="outline" className="rounded-xl border-white/10 text-slate-300 hover:text-amber-400 hover:bg-amber-500/10">
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
