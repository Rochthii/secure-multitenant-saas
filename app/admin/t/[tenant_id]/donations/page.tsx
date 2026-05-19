import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Settings } from 'lucide-react';
// @ts-ignore
import { TransactionActionsButton } from '@/components/admin/transaction-actions-button';
// @ts-ignore
import { TransactionAnalytics } from '@/components/admin/transaction-analytics';
// @ts-ignore
import { ExportTransactionsButton } from '@/components/admin/export-transactions-button';
import { TransactionFilters } from '@/components/admin/transaction-filters';
import { formatCurrency } from '@/lib/constants/transaction';
import { formatDate } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getTransactionPurposes } from '@/lib/donations';
import { requireTenantAccess, checkPermission } from '@/lib/permissions';
import { getTenantConfig } from '@/lib/tenant';

interface TransactionsPageProps {
    params: Promise<{ tenant_id: string }>;
    searchParams: Promise<{
        q?: string;
        status?: string;
        method?: string;
        purpose?: string;
        date_from?: string;
        date_to?: string;
        page?: string;
    }>;
}

export default async function TransactionsPage({ params, searchParams }: TransactionsPageProps) {
    const { tenant_id } = await params;
    // SECURITY: Transaction data is sensitive — only allow access to the correct tenant
    await requireTenantAccess(tenant_id);

    const tenantConfig = await getTenantConfig(tenant_id);
    const tenantType = (tenantConfig as any)?.tenant_type ?? 'tenant';
    const isCompany = tenantType !== 'tenant';

    const searchParamsObj = await searchParams;
    const q = searchParamsObj.q || '';
    const status = searchParamsObj.status || 'all';
    const method = searchParamsObj.method || 'all';
    const purpose = searchParamsObj.purpose || 'all';
    const dateFrom = searchParamsObj.date_from;
    const dateTo = searchParamsObj.date_to;

    const supabase = await createClient();

    let analyticsQuery = supabase.from('transactions').select('*').eq('tenant_id', tenant_id);

    if (status && status !== 'all') analyticsQuery = analyticsQuery.eq('status', status as any);
    if (method && method !== 'all') analyticsQuery = analyticsQuery.eq('payment_method', method);
    if (purpose && purpose !== 'all') analyticsQuery = analyticsQuery.eq('project_id', purpose);
    if (dateFrom) analyticsQuery = analyticsQuery.gte('created_at', dateFrom);
    if (dateTo) analyticsQuery = analyticsQuery.lte('created_at', `${dateTo}T23:59:59`);
    if (q) {
        analyticsQuery = analyticsQuery.or(`donor_name.ilike.%${q}%,donor_phone.ilike.%${q}%,id.ilike.%${q}%`);
    }

    const { data: analyticsData } = await analyticsQuery;

    let query = supabase
        .from('transactions')
        .select('*')
        .eq('tenant_id', tenant_id)
        .order('created_at', { ascending: false });

    // Apply Filters
    if (status && status !== 'all') query = query.eq('status', status as any);
    if (method && method !== 'all') query = query.eq('payment_method', method);
    if (purpose && purpose !== 'all') query = query.eq('project_id', purpose);
    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) query = query.lte('created_at', `${dateTo}T23:59:59`);

    // Search (check if text search column exists or use ilike on specific fields)
    if (q) {
        // Search by Name, Phone, or ID
        query = query.or(`donor_name.ilike.%${q}%,donor_phone.ilike.%${q}%,id.ilike.%${q}%`);
    }

    const { data: transactions } = await query;

    // Permissions check for actions
    const canManageTransactions = await checkPermission('transactions', 'update');

    // Fetch purposes and mapping titles
    const allPurposes = await getTransactionPurposes(tenant_id);

    return (
        <div className="space-y-8" suppressHydrationWarning>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-playfair font-bold">
                        {isCompany ? 'Quản lý đóng góp' : 'Quản lý thanh toán'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isCompany ? 'Theo dõi nguồn vốn và hỗ trợ của doanh nghiệp' : 'Theo dõi giao dịch và tài chính chi nhánh'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/admin/t/${tenant_id}/projects`}>
                        <Button variant="outline" className="gap-2 border-gold-primary text-gold-primary hover:bg-gold-primary hover:text-white">
                            <Settings className="h-4 w-4" />
                            Quản lý Hạng mục
                        </Button>
                    </Link>
                    <ExportTransactionsButton data={transactions || []} />
                </div>
            </div>

            {/* Analytics Section (Filtered) */}
            <TransactionAnalytics transactions={analyticsData || []} />

            {/* List Section */}
            <div className="space-y-4">
                {/* Advanced Filters */}
                <TransactionFilters purposes={allPurposes.map((p: any) => ({ id: p.id, title: p.title }))} />

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Người đóng góp
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Số tiền
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Dự án / Mục đích
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Kênh
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {isCompany ? 'Thời gian' : 'Ngày'}
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {(transactions as any[]) && (transactions as any[]).length > 0 ? (
                                        (transactions as any[]).map((transaction) => (
                                            <tr key={transaction.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900 font-bold">
                                                        {transaction.is_anonymous ? 'Ẩn danh' : transaction.donor_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-mono mt-1">
                                                        {transaction.id.substring(0, 8).toUpperCase()}
                                                    </div>
                                                    {transaction.donor_phone && (
                                                        <div className="text-xs text-gray-500">
                                                            {transaction.donor_phone}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-gold-primary">
                                                    {formatCurrency(transaction.amount)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {(() => {
                                                        const p = allPurposes.find((x: any) => x.id === transaction.project_id);
                                                        return p ? p.title : transaction.project_id;
                                                    })()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {transaction.payment_method === 'bank_transfer' && 'Chuyển khoản'}
                                                    {transaction.payment_method === 'momo' && 'MoMo'}
                                                    {transaction.payment_method === 'cash' && 'Tiền mặt'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                        {transaction.status === 'confirmed' && 'Đã nhận'}
                                                        {transaction.status === 'pending' && 'Chờ duyệt'}
                                                        {transaction.status === 'rejected' && 'Đã hủy'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {formatDate(new Date(transaction.created_at), 'dd/MM/yyyy', { locale: vi })}
                                                    <div className="text-xs text-gray-400">
                                                        {formatDate(new Date(transaction.created_at), 'HH:mm', { locale: vi })}
                                                    </div>
                                                </td>
                                                 <td className="px-6 py-4 text-right text-sm font-medium">
                                                    {canManageTransactions ? (
                                                        <TransactionActionsButton
                                                            id={transaction.id}
                                                            status={transaction.status}
                                                        />
                                                    ) : (
                                                        <span className="text-gray-400 italic text-xs">Chế độ xem</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <p className="text-lg">Không tìm thấy giao dịch nào</p>
                                                    <p className="text-sm text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc tìm kiếm lại</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
