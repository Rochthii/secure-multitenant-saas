import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Plus, Eye, Edit, Clock, User, CalendarClock,
    CheckCircle, XCircle, FileText, AlertCircle,
} from 'lucide-react';
// @ts-ignore
import { DeleteNewsButton } from '@/components/admin/delete-news-button';
// @ts-ignore
import { SearchInput } from '@/components/admin/search-input';
// @ts-ignore
import { Pagination } from '@/components/admin/pagination';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { TenantFilter } from './tenant-filter';

interface NewsListViewProps {
    searchParams?: any;
    basePath: string; // ví dụ: '/admin/t/123/news' hoặc '/collaborator/news-manager'
    isCollaborator?: boolean;
    dbClient: any;
    userId?: string;
    tenantId?: string;
    tenants?: Array<{ id: string; name: string }>;
}

const STATUS_TABS = [
    { value: '', label: 'Tất cả', icon: FileText },
    { value: 'pending_review', label: 'Chờ duyệt', icon: AlertCircle, color: 'text-amber-600' },
    { value: 'draft', label: 'Nháp', icon: FileText, color: 'text-gray-500' },
    { value: 'scheduled', label: 'Lên lịch', icon: CalendarClock, color: 'text-blue-600' },
    { value: 'published', label: 'Đã đăng', icon: CheckCircle, color: 'text-green-600' },
    { value: 'rejected', label: 'Từ chối', icon: XCircle, color: 'text-red-600' },
];

function getStatusBadge(status: string) {
    switch (status) {
        case 'published':
            return <Badge className="bg-green-100 text-green-800 border-green-200 gap-1"><CheckCircle className="h-3 w-3" />Đã đăng</Badge>;
        case 'pending_review':
            return <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1"><AlertCircle className="h-3 w-3" />Chờ duyệt</Badge>;
        case 'scheduled':
            return <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1"><CalendarClock className="h-3 w-3" />Lên lịch</Badge>;
        case 'draft':
            return <Badge className="bg-gray-100 text-gray-700 border-gray-200 gap-1"><FileText className="h-3 w-3" />Nháp</Badge>;
        case 'rejected':
            return <Badge className="bg-red-100 text-red-800 border-red-200 gap-1"><XCircle className="h-3 w-3" />Từ chối</Badge>;
        case 'archived':
            return <Badge variant="secondary">Lưu trữ</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}

function formatSmartDate(dateStr: string | null) {
    if (!dateStr) return null;
    try {
        return format(new Date(dateStr), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
        return null;
    }
}

export async function NewsListView({ searchParams, basePath, isCollaborator, dbClient, userId, tenantId, tenants }: NewsListViewProps) {
    const resolvedParams = await searchParams;
    const query = resolvedParams?.q || '';
    const status = resolvedParams?.status || '';
    const statusFilter = status === 'all' ? '' : status;
    const filterTenantId = resolvedParams?.tenantId || '';
    const currentPage = Number(resolvedParams?.page) || 1;
    const itemsPerPage = 15;

    // Use passed tenantId or from search params if for global admin
    const effectiveTenantId = tenantId || filterTenantId;

    // Build query
    let dbQuery = dbClient
        .from('news')
        .select(`
            id, title_vi, slug, status, created_at, published_at, scheduled_at,
            reviewed_at, reviewer_name, review_note, author_name,
            categories(name_vi), thumbnail_url,
            tenant_id
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

    if (effectiveTenantId) {
        // Bao gồm bài viết của chính chi nhánh này HOẶC bài từ chi nhánh khác được broadcast tới (published_to contains effectiveTenantId)
        dbQuery = dbQuery.or(`tenant_id.eq.${effectiveTenantId},published_to.cs.{${effectiveTenantId}}`);
    }

    if (isCollaborator && userId) {
        // Cho CTV: chỉ xem những tin bài do MÌNH tạo 
        dbQuery = dbQuery.eq('author_id', userId);
    }

    if (status) dbQuery = dbQuery.eq('status', status);
    if (query) dbQuery = dbQuery.ilike('title_vi', `%${query}%`);

    const { data: news, count } = await dbQuery;
    const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;

    // Status counts for tabs
    let countsQuery = dbClient.from('news').select('status');
    if (effectiveTenantId) {
        countsQuery = countsQuery.or(`tenant_id.eq.${effectiveTenantId},published_to.cs.{${effectiveTenantId}}`);
    }
    if (isCollaborator && userId) {
        countsQuery = countsQuery.eq('author_id', userId);
    }

    const { data: statusCounts } = await countsQuery;
    const counts: Record<string, number> = {};
    (statusCounts || []).forEach((r: any) => {
        counts[r.status] = (counts[r.status] || 0) + 1;
    });

    return (
        <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-playfair font-bold text-gray-900">
                        {isCollaborator ? 'Quản lý tin tức CTV' : 'Quản lý tin tức'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {count ?? 0} bài viết · {isCollaborator ? 'Bài viết và nội dung của bạn.' : 'Lịch đăng, duyệt bài và quản lý nội dung.'}
                    </p>
                </div>
                <Link href={`${basePath}/new`}>
                    <Button className="bg-gold-primary hover:bg-gold-dark shadow-md">
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo tin tức mới
                    </Button>
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Status Tabs */}
                <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                    {STATUS_TABS.map((tab) => {
                        const isActive = status === tab.value || (status === '' && tab.value === '');
                        const Icon = tab.icon;
                        const href = `${basePath}?status=${tab.value}${query ? `&q=${query}` : ''}${filterTenantId ? `&tenantId=${filterTenantId}` : ''}`;

                        return (
                            <Link
                                key={tab.value}
                                href={href}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? 'bg-white shadow text-gray-900'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                                    }`}
                            >
                                <Icon className={`h-4 w-4 ${isActive ? (tab.color || 'text-gold-primary') : ''}`} />
                                {tab.label} {counts[tab.value] ? `(${counts[tab.value]})` : ''}
                            </Link>
                        );
                    })}
                </div>

                {/* Tenant Filter (Only for Global Admin) */}
                {!tenantId && tenants && tenants.length > 0 && (
                    <TenantFilter tenants={tenants} />
                )}
            </div>

            {/* Table */}
            <Card className="shadow-sm border-gray-200">
                <CardHeader className="p-4 border-b bg-gray-50/50">
                    <SearchInput placeholder="Tìm kiếm tiêu đề..." />
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b text-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-[35%]">
                                        Tiêu đề
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                        Tác giả
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                        Thời gian đăng
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                        Người duyệt
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {news && (news as any[]).length > 0 ? (
                                    (news as any[]).map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                                            {/* Title */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    {item.thumbnail_url ? (
                                                        <img
                                                            src={item.thumbnail_url}
                                                            alt=""
                                                            className="h-10 w-14 rounded object-cover border flex-shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-14 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                            <FileText className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                                            {item.title_vi}
                                                        </div>
                                                        {item.categories?.name_vi && (
                                                            <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                                                {item.categories.name_vi}
                                                            </span>
                                                        )}
                                                        {!tenantId && item.tenant_id && tenants && (
                                                            <span className="text-xs text-amber-600 font-medium ml-2 border-l pl-2">
                                                                {tenants.find(t => t.id === item.tenant_id)?.name || 'Hệ thống'}
                                                            </span>
                                                        )}
                                                        {/* Rejection note inline */}
                                                        {item.status === 'rejected' && item.review_note && (
                                                            <div className="text-xs text-red-500 mt-0.5 line-clamp-1">
                                                                Lý do: {item.review_note}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                {getStatusBadge(item.status)}
                                            </td>

                                            {/* Author */}
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                    <User className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                                    <span className="truncate max-w-[120px]">
                                                        {item.author_name || 'Không rõ'}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-400 mt-0.5">
                                                    {formatSmartDate(item.created_at)}
                                                </div>
                                            </td>

                                            {/* Publish time */}
                                            <td className="px-4 py-3.5 whitespace-nowrap text-sm">
                                                {item.status === 'published' && item.published_at ? (
                                                    <div>
                                                        <div className="flex items-center gap-1 text-green-700">
                                                            <CheckCircle className="h-3.5 w-3.5" />
                                                            {formatSmartDate(item.published_at)?.split(' ')[0]}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {formatSmartDate(item.published_at)?.split(' ')[1]}
                                                        </div>
                                                    </div>
                                                ) : item.status === 'scheduled' && item.scheduled_at ? (
                                                    <div>
                                                        <div className="flex items-center gap-1 text-blue-700">
                                                            <CalendarClock className="h-3.5 w-3.5" />
                                                            {formatSmartDate(item.scheduled_at)?.split(' ')[0]}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {formatSmartDate(item.scheduled_at)?.split(' ')[1]}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-300 text-xs">—</span>
                                                )}
                                            </td>

                                            {/* Reviewer */}
                                            <td className="px-4 py-3.5 whitespace-nowrap text-sm">
                                                {item.reviewer_name ? (
                                                    <div>
                                                        <div className="flex items-center gap-1 text-gray-600">
                                                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                                            <span className="truncate max-w-[100px]">{item.reviewer_name}</span>
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {formatSmartDate(item.reviewed_at)}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-300 text-xs">Chưa duyệt</span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3.5 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {item.status === 'published' && item.slug && (
                                                        <Link href={`/vi/tin-tuc/${item.slug}`} target="_blank">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600" title="Xem trên website">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    <Link href={`${basePath}/${item.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gold-primary" title="Chỉnh sửa">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {/* Hide delete button for collaborator assuming volunteer shouldn't delete */}
                                                    {!isCollaborator && (
                                                        <DeleteNewsButton id={item.id} />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="bg-gray-100 p-4 rounded-full">
                                                    <FileText className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <p className="text-lg font-medium text-gray-700">
                                                    {status === 'pending_review' ? 'Không có bài chờ duyệt' :
                                                        status === 'draft' ? 'Không có bản nháp' :
                                                            status === 'scheduled' ? 'Không có bài lên lịch' :
                                                                'Chưa có tin tức nào'}
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    {!status && 'Bắt đầu bằng cách tạo tin tức mới.'}
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
