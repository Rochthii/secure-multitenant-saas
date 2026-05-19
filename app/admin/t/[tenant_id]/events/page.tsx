import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus, Eye, Edit } from 'lucide-react';
import { formatDate } from 'date-fns';
import { vi } from 'date-fns/locale';
// @ts-ignore - TypeScript cache issue
import { DeleteEventButton } from '@/components/admin/delete-event-button';
// @ts-ignore
import { SearchInput, FilterSelect } from '@/components/admin/data-filters';
// @ts-ignore
import { Pagination } from '@/components/admin/pagination';
import { Badge } from '@/components/ui/badge';
import { requireTenantAccess } from '@/lib/permissions';
import { getTenantConfig } from '@/lib/tenant';
import { getCachedCategoriesTree } from '@/lib/cache/queries';
import { EventCategoryFilter } from '@/components/admin/event-category-filter';

interface EventsPageProps {
    params: Promise<{ tenant_id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const GLOBAL_TENANT_ID = '55555555-5555-5555-5555-555555555555';

export default async function EventsListPage(props: EventsPageProps) {
    const { tenant_id } = await props.params;
    await requireTenantAccess(tenant_id);

    const tenantConfig = await getTenantConfig(tenant_id);
    const tenantType = (tenantConfig as any)?.tenant_type ?? 'tenant';
    const isCompany = tenantType !== 'tenant';

    const searchParams = await props.searchParams;
    const q = (searchParams.q as string) || '';
    const categoryFilter = (searchParams.category as string) || '';
    const status = (searchParams.status as string) || '';
    const currentPage = Number(searchParams.page) || 1;
    const itemsPerPage = 10;
    const offset = (currentPage - 1) * itemsPerPage;

    const supabase = await createClient();

    // Fetch category tree for the specific tenant
    const categoriesAll = await getCachedCategoriesTree(tenant_id, tenantType);
    const allEventCategories = categoriesAll.events || [];

    // Flatten tree and split into local/global
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
    const localEventCategories = flatCategories.filter((c: any) => c.tenant_id === tenant_id);
    const globalEventCategories = flatCategories.filter((c: any) => c.tenant_id === GLOBAL_TENANT_ID);

    let dbQuery = supabase
        .from('events')
        .select('id, title_vi, slug, status, start_date, end_date, location, thumbnail_url', { count: 'exact' })
        .eq('tenant_id', tenant_id);

    if (q) {
        dbQuery = dbQuery.ilike('title_vi', `%${q}%`);
    }

    if (status && status !== 'all') {
        dbQuery = dbQuery.eq('status', status as any);
    }

    if (categoryFilter && categoryFilter !== 'all') {
        dbQuery = dbQuery.eq('category_id', categoryFilter);
    }

    const { data: events, count } = await dbQuery
        .order('start_date', { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

    const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;

    const basePath = `/admin/t/${tenant_id}/events`;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-playfair font-bold text-gray-900">Quản lý sự kiện</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {isCompany ? 'Danh sách tất cả các hoạt động và sự kiện' : 'Danh sách tất cả các sự kiện của chi nhánh'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href={`${basePath}/calendar`}>
                        <Button variant="outline">
                            Xem lịch
                        </Button>
                    </Link>
                    <Link href={`${basePath}/new`}>
                        <Button className="bg-gold-primary hover:bg-gold-dark text-white shadow-md">
                            <Plus className="mr-2 h-4 w-4" />
                            Tạo sự kiện mới
                        </Button>
                    </Link>
                </div>
            </div>

            <Card className="shadow-sm border-gray-200">
                <CardHeader className="p-4 border-b bg-gray-50/50">
                    <div className="flex flex-col md:flex-row gap-4 items-center flex-wrap">
                        <SearchInput placeholder="Tìm kiếm sự kiện..." />

                        <div className="flex items-center gap-2">
                            <EventCategoryFilter
                                localCategories={localEventCategories}
                                globalCategories={globalEventCategories}
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
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b text-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                        Tiêu đề
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                        Thời gian
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                        Địa điểm
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {events && (events as any[]).length > 0 ? (
                                    (events as any[]).map((event) => (
                                        <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {event.thumbnail_url && (
                                                        <img
                                                            src={event.thumbnail_url}
                                                            alt=""
                                                            className="h-10 w-10 rounded object-cover border"
                                                        />
                                                    )}
                                                    <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                                        {event.title_vi}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div>{formatDate(new Date(event.start_date), 'dd/MM/yyyy HH:mm', { locale: vi })}</div>
                                                {event.end_date && (
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        đến {formatDate(new Date(event.end_date), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                                                {event.location || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    variant={
                                                        event.status === 'upcoming' ? 'default' :
                                                            event.status === 'ongoing' ? 'secondary' :
                                                                'outline'
                                                    }
                                                    className={
                                                        event.status === 'upcoming' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200' :
                                                            event.status === 'ongoing' ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200' :
                                                                event.status === 'completed' ? 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200' :
                                                                    'bg-red-100 text-red-800 hover:bg-red-200 border-red-200'
                                                    }
                                                >
                                                    {event.status === 'upcoming' ? 'Sắp diễn ra' :
                                                        event.status === 'ongoing' ? 'Đang diễn ra' :
                                                            event.status === 'completed' ? 'Đã hoàn thành' : 'Đã hủy'}
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
                                                    <Link href={`${basePath}/${event.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gold-primary">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <DeleteEventButton id={event.id} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="bg-gray-100 p-3 rounded-full mb-3">
                                                    <Plus className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <p className="text-lg font-medium text-gray-900">Chưa có sự kiện nào</p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {isCompany ? 'Hãy tạo sự kiện hoặc hoạt động đầu tiên.' : 'Hãy tạo sự kiện đầu tiên cho chi nhánh.'}
                                                </p>
                                            </div>
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
