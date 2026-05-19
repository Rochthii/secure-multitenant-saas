import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getUserContext } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// @ts-ignore
import { SearchInput, FilterSelect } from '@/components/admin/data-filters';
// @ts-ignore
import { Pagination } from '@/components/admin/pagination';
import { Eye, Edit, Calendar, Building2, Plus } from 'lucide-react';
import { formatDate } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getCachedCategoriesTree } from '@/lib/cache/queries';
import { EventCategoryFilter } from '@/components/admin/event-category-filter';

export const metadata = {
    title: 'Quản lý Sự Kiện Toàn Hệ Thống | Global Admin',
};

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const GLOBAL_TENANT_ID = '55555555-5555-5555-5555-555555555555';

export default async function GlobalEventsAdminPage(props: PageProps) {
    const ctx = await getUserContext();
    if (!ctx || !['super_admin', 'company_editor', 'admin'].includes(ctx.role)) {
        redirect('/admin/select-tenant');
    }

    const searchParams = await props.searchParams;
    const q = (searchParams.q as string) || '';
    const status = (searchParams.status as string) || '';
    const tenantFilter = (searchParams.tenant as string) || '';
    const categoryFilter = (searchParams.category as string) || '';
    const currentPage = Number(searchParams.page) || 1;
    const itemsPerPage = 15;
    const offset = (currentPage - 1) * itemsPerPage;

    const supabase = await createClient();

    // Fetch all tenants for filter dropdown
    const { data: tenantsData } = await (supabase as any)
        .from('tenants')
        .select('id, name')
        .order('name');
    const tenants = tenantsData || [];

    // Fetch category tree for global view (no tenantId = fetch all)
    const categoriesAll = await getCachedCategoriesTree(undefined, 'company');
    const allEventCategories = categoriesAll.events || [];

    // Flatten tree để truyền vào EventCategoryFilter
    const flattenTree = (nodes: any[], level = 0): any[] => {
        let result: any[] = [];
        nodes.forEach(node => {
            result.push({ ...node, level });
            if (node.children?.length) {
                result = result.concat(flattenTree(node.children, level + 1));
            }
        });
        return result;
    };

    const flatCategories = flattenTree(allEventCategories);
    const localEventCategories = flatCategories
        .filter((c: any) => c.tenant_id && c.tenant_id !== GLOBAL_TENANT_ID)
        .map((c: any) => {
            // Tìm tên chi nhánh để gắn nhãn
            const tenant = tenants.find((t: any) => t.id === c.tenant_id);
            // Nếu là category của chi nhánh, prefix tên chi nhánh vào để phân biệt ở global view
            return { ...c, name_vi: tenant ? `${tenant.name} › ${c.name_vi}` : c.name_vi };
        });
    const globalEventCategories = flatCategories.filter((c: any) => c.tenant_id === GLOBAL_TENANT_ID);

    // Build events query — sử dụng LEFT JOIN để không lọc mất sự kiện nào
    let dbQuery = (supabase as any)
        .from('events')
        .select(`
            id, title_vi, slug, status, start_date, end_date, location, thumbnail_url, tenant_id, category_id,
            tenants(name, domain)
        `, { count: 'exact' });

    if (q) {
        dbQuery = dbQuery.ilike('title_vi', `%${q}%`);
    }
    if (status && status !== 'all') {
        dbQuery = dbQuery.eq('status', status);
    }
    if (tenantFilter && tenantFilter !== 'all') {
        dbQuery = dbQuery.eq('tenant_id', tenantFilter);
    }
    if (categoryFilter && categoryFilter !== 'all') {
        dbQuery = dbQuery.eq('category_id', categoryFilter);
    }

    const { data: events, count } = await dbQuery
        .order('start_date', { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

    const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;

    const statusBadge = (status: string) => {
        const map: Record<string, { label: string; className: string }> = {
            upcoming: { label: 'Sắp diễn ra', className: 'bg-blue-100 text-blue-800 border-blue-200' },
            ongoing: { label: 'Đang diễn ra', className: 'bg-green-100 text-green-800 border-green-200' },
            completed: { label: 'Đã hoàn thành', className: 'bg-gray-100 text-gray-800 border-gray-200' },
            cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-800 border-red-200' },
        };
        return map[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 border-gray-200' };
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-playfair font-bold text-gray-900 flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-gold-primary" />
                        Sự kiện toàn hệ thống
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Tổng hợp tất cả sự kiện / lịch lễ từ mọi đơn vị — {count ?? 0} sự kiện
                    </p>
                </div>
                <Link href="/admin/events/new">
                    <Button className="bg-gold-primary hover:bg-gold-dark text-white gap-2 shadow-sm">
                        <Plus className="w-4 h-4" />
                        Tạo sự kiện mới
                    </Button>
                </Link>
            </div>

            <Card className="shadow-sm border-gray-200">
                <CardHeader className="p-4 border-b bg-gray-50/50">
                    <div className="flex flex-col md:flex-row gap-3 items-start md:items-center flex-wrap">
                        <SearchInput placeholder="Tìm kiếm sự kiện..." />
                        <div className="flex items-center gap-2 flex-wrap">
                            <FilterSelect
                                label="Đơn vị"
                                paramName="tenant"
                                options={tenants.map((t: any) => ({ label: t.name, value: t.id }))}
                            />
                            <FilterSelect
                                label="Trạng thái"
                                paramName="status"
                                options={[
                                    { label: 'Sắp diễn ra', value: 'upcoming' },
                                    { label: 'Đang diễn ra', value: 'ongoing' },
                                    { label: 'Đã hoàn thành', value: 'completed' },
                                    { label: 'Đã hủy', value: 'cancelled' },
                                ]}
                            />
                            <EventCategoryFilter
                                localCategories={localEventCategories}
                                globalCategories={globalEventCategories}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b text-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Tiêu đề</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Đơn vị</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Thời gian</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Địa điểm</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {events && events.length > 0 ? (
                                    events.map((event: any) => {
                                        const badge = statusBadge(event.status);
                                        return (
                                            <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {event.thumbnail_url && (
                                                            <img
                                                                src={event.thumbnail_url}
                                                                alt=""
                                                                className="h-10 w-10 rounded object-cover border shrink-0"
                                                            />
                                                        )}
                                                        <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                                            {event.title_vi}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                        <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                        <span className="truncate max-w-[140px]">{event.tenants?.name ?? '—'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    <div>{formatDate(new Date(event.start_date), 'dd/MM/yyyy HH:mm', { locale: vi })}</div>
                                                    {event.end_date && (
                                                        <div className="text-xs text-gray-400 mt-0.5">
                                                            đến {formatDate(new Date(event.end_date), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 max-w-[180px] truncate">
                                                    {event.location || '—'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge className={`${badge.className} border text-xs`}>
                                                        {badge.label}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {event.slug && (
                                                            <Link href={`/vi/su-kien/${event.slug}`} target="_blank">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600" title="Xem trên website">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                        )}
                                                        <Link href={`/admin/t/${event.tenant_id}/events/${event.id}`}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gold-primary" title="Chỉnh sửa">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                                            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                            <p className="font-medium">Không có sự kiện nào</p>
                                            <p className="text-sm mt-1">Hãy thêm sự kiện từ trang quản lý của từng chi nhánh.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {totalPages > 1 && (
                <Pagination totalPages={totalPages} currentPage={currentPage} />
            )}
        </div>
    );
}
