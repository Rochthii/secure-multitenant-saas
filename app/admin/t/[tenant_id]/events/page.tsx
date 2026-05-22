import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus, Eye, Edit, CalendarClock, Calendar } from 'lucide-react';
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
        <div className="space-y-6 text-slate-300">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <CalendarClock className="w-8 h-8 text-amber-400" />
                        Quản lý sự kiện
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {isCompany ? 'Danh sách tất cả các hoạt động và sự kiện' : 'Danh sách tất cả các sự kiện của chi nhánh'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href={`${basePath}/calendar`}>
                        <Button variant="outline" className="border-white/10 hover:bg-white/5 text-slate-300 hover:text-white rounded-xl">
                            Xem lịch
                        </Button>
                    </Link>
                    <Link href={`${basePath}/new`}>
                        <Button className="bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/20 px-5">
                            <Plus className="mr-2 h-4 w-4" />
                            Tạo sự kiện mới
                        </Button>
                    </Link>
                </div>
            </div>

            <Card className="border-white/[0.08] bg-slate-900/40 backdrop-blur-xl overflow-hidden rounded-2xl shadow-none">
                <CardHeader className="p-4 border-b border-white/5 bg-white/[0.02]">
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
                            <thead>
                                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider w-[40%]">
                                        Tiêu đề
                                    </th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        Thời gian
                                    </th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        Địa điểm
                                    </th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.05]">
                                {events && (events as any[]).length > 0 ? (
                                    (events as any[]).map((event) => (
                                        <tr key={event.id} className="hover:bg-white/[0.02] group transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {event.thumbnail_url ? (
                                                        <img
                                                            src={event.thumbnail_url}
                                                            alt=""
                                                            className="h-10 w-14 rounded-lg object-cover border border-white/10 flex-shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-14 rounded-lg bg-slate-950 flex items-center justify-center border border-white/10 flex-shrink-0">
                                                            <Calendar className="h-4 w-4 text-slate-500" />
                                                        </div>
                                                    )}
                                                    <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                                                        {event.title_vi}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-400">
                                                <div className="font-medium text-slate-300">{formatDate(new Date(event.start_date), 'dd/MM/yyyy HH:mm', { locale: vi })}</div>
                                                {event.end_date && (
                                                    <div className="text-xs text-slate-500 mt-1 font-mono">
                                                        đến {formatDate(new Date(event.end_date), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-400 max-w-[200px] truncate">
                                                {event.location || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    className={
                                                        event.status === 'upcoming' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 gap-1 rounded-full px-2.5 py-0.5 font-bold' :
                                                            event.status === 'ongoing' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 gap-1 rounded-full px-2.5 py-0.5 font-bold' :
                                                                event.status === 'completed' ? 'bg-slate-700/50 text-slate-300 border border-slate-600/40 gap-1 rounded-full px-2.5 py-0.5 font-bold' :
                                                                    'bg-red-500/10 text-red-400 border border-red-500/20 gap-1 rounded-full px-2.5 py-0.5 font-bold'
                                                    }
                                                >
                                                    {event.status === 'upcoming' ? 'Sắp diễn ra' :
                                                        event.status === 'ongoing' ? 'Đang diễn ra' :
                                                            event.status === 'completed' ? 'Đã hoàn thành' : 'Đã hủy'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {event.slug && (
                                                        <Link href={`/vi/su-kien/${event.slug}`} target="_blank">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-400 hover:bg-white/5 rounded-xl transition-colors" title="Xem trên website">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    <Link href={`${basePath}/${event.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-amber-400 hover:bg-white/5 rounded-xl transition-colors">
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
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="bg-slate-900/60 p-4 rounded-full border border-white/[0.08]">
                                                    <CalendarClock className="h-8 w-8 text-slate-500" />
                                                </div>
                                                <p className="text-lg font-bold text-white">Chưa có sự kiện nào</p>
                                                <p className="text-sm text-slate-400 mt-1">
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
