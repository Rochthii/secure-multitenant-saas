import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/constants/transaction';
import { formatDate } from 'date-fns';
import { vi } from 'date-fns/locale';
import { requirePermission } from '@/lib/permissions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Landmark, User, Calendar as CalendarIcon, Filter, FileDown, Plus, Settings } from 'lucide-react';
import { TransactionExportDialog } from '@/components/admin/finance/transaction-export-dialog';
// @ts-ignore
import { TransactionActionsButton } from '@/components/admin/transaction-actions-button';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function GlobalTransactionsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; tenant_id?: string }> }) {
    await requirePermission('transactions', 'read');
    
    const { q, status, tenant_id } = await searchParams;
    const supabase = await createClient();

    let query = (supabase as any).from('transactions')
        .select(`
            *,
            tenants (name)
        `)
        .order('created_at', { ascending: false });

    if (status && status !== 'all') query = query.eq('status', status as any);
    if (tenant_id && tenant_id !== 'all') query = query.eq('tenant_id', tenant_id);
    if (q) query = query.or(`donor_name.ilike.%${q}%,donor_phone.ilike.%${q}%`);

    const { data: transactions } = await query;
    const { data: tenants } = await (supabase as any).from('tenants').select('id, name').order('name');
    const { data: projects } = await (supabase as any).from('transaction_projects').select('id, title_vi, recipient_type');

    return (
        <div className="space-y-8 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-playfair font-bold text-slate-900 tracking-tight">Tất cả Đóng góp Hệ thống</h1>
                    <p className="text-slate-500 mt-1 text-sm font-medium tracking-wide uppercase">Báo cáo tài chính toàn mạng lưới cơ sở</p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/admin/finance/projects">
                        <Button variant="outline" size="sm" className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-100">
                            <Settings className="w-4 h-4" />
                            Quản lý Hạng mục
                        </Button>
                    </Link>
                    <TransactionExportDialog 
                        tenants={tenants || []} 
                        purposes={(projects || []).filter((c: any) => c.recipient_type === 'tenant_fund').map((p: any) => ({ id: p.id, name: p.title_vi, type: p.recipient_type }))}
                        projects={(projects || []).filter((c: any) => c.recipient_type === 'charity_fund').map((p: any) => ({ id: p.id, name: p.title_vi, type: p.recipient_type }))}
                    />
                </div>
            </div>

            {/* Stats and Filters Row */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full lg:w-2/3">
                    <Card className="bg-slate-900 border-0 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Landmark className="w-12 h-12 text-white" />
                        </div>
                        <CardHeader className="p-5">
                            <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Tổng tích lũy thành công</CardDescription>
                            <CardTitle className="text-2xl font-black text-amber-500">
                                {formatCurrency(transactions?.reduce((acc: number, curr: any) => acc + (curr.status === 'confirmed' ? curr.amount : 0), 0) || 0)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-0 shadow-md bg-white border-l-4 border-l-amber-500">
                        <CardHeader className="p-5">
                            <CardDescription className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Giao dịch chờ duyệt</CardDescription>
                            <CardTitle className="text-2xl font-bold text-slate-900">
                                {transactions?.filter((d: any) => d.status === 'pending').length || 0}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-0 shadow-md bg-white border-l-4 border-l-green-500">
                        <CardHeader className="p-5">
                            <CardDescription className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Giao dịch thành công</CardDescription>
                            <CardTitle className="text-2xl font-bold text-slate-900">
                                {transactions?.filter((d: any) => d.status === 'confirmed').length || 0}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="w-full lg:w-1/3 border-0 shadow-md bg-slate-50">
                    <CardContent className="p-5">
                        <form className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Tìm kiếm</label>
                                <div className="relative">
                                    <input 
                                        name="q"
                                        defaultValue={q}
                                        placeholder="Tên, SĐT người đóng góp..." 
                                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                                    />
                                    <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1 flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Trạng thái</label>
                                    <select 
                                        name="status"
                                        defaultValue={status || 'all'}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
                                    >
                                        <option value="all">Tất cả</option>
                                        <option value="confirmed">Đã nhận</option>
                                        <option value="pending">Chờ duyệt</option>
                                    </select>
                                </div>
                                <div className="flex-1 flex flex-col gap-2">
                                    <button type="submit" className="mt-6 w-full h-[38px] bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all">
                                        Lọc dữ liệu
                                    </button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden ring-1 ring-slate-100">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Đơn vị tiếp nhận</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Người đóng góp</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Số tiền</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Trạng thái</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Thời gian</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transactions?.map((transaction: any) => (
                                    <tr key={transaction.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm font-bold text-slate-700">{transaction.tenants?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">{transaction.is_anonymous ? 'Ẩn danh' : transaction.donor_name}</span>
                                                <span className="text-xs text-slate-400 font-mono">{transaction.donor_phone || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-amber-600">{formatCurrency(transaction.amount)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={transaction.status === 'confirmed' ? 'default' : 'outline'} 
                                                   className={transaction.status === 'confirmed' ? 'bg-green-500' : 'bg-amber-100 text-amber-700 border-amber-200'}>
                                                {transaction.status === 'confirmed' ? 'Đã nhận' : 'Chờ duyệt'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                <CalendarIcon className="w-3 h-3" />
                                                {formatDate(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <TransactionActionsButton id={transaction.id} status={transaction.status} />
                                        </td>
                                    </tr>
                                ))}
                                {(!transactions || transactions.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                                            Không có dữ liệu đóng góp nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
