'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/constants/transaction';
import { TrendingUp, Clock, XCircle, ChevronRight } from 'lucide-react';

const PURPOSE_LABEL: Record<string, string> = {
    construction: 'Xây dựng',
    education: 'Giáo dục',
    charity: 'Từ thiện',
    general: 'Chung',
};

const METHOD_LABEL: Record<string, string> = {
    bank_transfer: 'Chuyển khoản',
    momo: 'MoMo',
    cash: 'Tiền mặt',
};

interface TransactionSummary {
    total: number;
    byStatus: Record<string, { count: number; total: number }>;
    byPurpose: Record<string, { count: number; total: number }>;
    byMethod: Record<string, { count: number; total: number }>;
}

interface Props {
    summary: TransactionSummary;
}

export function DashboardTransactionSummary({ summary }: Props) {
    const { byStatus, byPurpose, byMethod, total } = summary;

    const confirmed = byStatus['confirmed'] || { count: 0, total: 0 };
    const pending = byStatus['pending'] || { count: 0, total: 0 };
    const cancelled = byStatus['cancelled'] || { count: 0, total: 0 };

    return (
        <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-playfair">Thống kê thanh toán</CardTitle>
                <Link
                    href="/admin/transactions"
                    className="text-sm text-gold-primary hover:underline flex items-center gap-1"
                >
                    Xem chi tiết <ChevronRight className="h-3.5 w-3.5" />
                </Link>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Bảng theo trạng thái */}
                    <div>
                        <h4 className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">Theo trạng thái</h4>
                        <div className="space-y-2">
                            <Link href="/admin/transactions?status=confirmed" className="flex items-center justify-between p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors group">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-800">Đã xác nhận</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-[13px] font-bold text-green-700">{confirmed.count} giao dịch</div>
                                    <div className="text-xs text-green-600">{formatCurrency(confirmed.total)}</div>
                                </div>
                            </Link>
                            <Link href="/admin/transactions?status=pending" className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors group">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-yellow-600" />
                                    <span className="text-sm font-medium text-yellow-800">Chờ duyệt</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-[13px] font-bold text-yellow-700">{pending.count} giao dịch</div>
                                    <div className="text-xs text-yellow-600">{formatCurrency(pending.total)}</div>
                                </div>
                            </Link>
                            <Link href="/admin/transactions?status=cancelled" className="flex items-center justify-between p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors group">
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-500" />
                                    <span className="text-sm font-medium text-red-700">Đã hủy</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-[13px] font-bold text-red-600">{cancelled.count} giao dịch</div>
                                    <div className="text-xs text-red-500">{formatCurrency(cancelled.total)}</div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Bảng theo mục đích */}
                    <div>
                        <h4 className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">Theo mục đích</h4>
                        <div className="space-y-2">
                            {Object.entries(byPurpose).length === 0 ? (
                                <p className="text-sm text-gray-400 italic">Chưa có dữ liệu</p>
                            ) : (
                                Object.entries(byPurpose)
                                    .sort(([, a], [, b]) => b.total - a.total)
                                    .map(([key, val]) => (
                                        <Link
                                            key={key}
                                            href={`/admin/transactions?purpose=${key}`}
                                            className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 hover:bg-gold-primary/10 transition-colors"
                                        >
                                            <span className="text-[13px] text-gray-700">{PURPOSE_LABEL[key] || key}</span>
                                            <div className="text-right">
                                                <div className="text-[13px] font-semibold text-gray-800">{formatCurrency(val.total)}</div>
                                                <div className="text-xs text-gray-500">{val.count} giao dịch</div>
                                            </div>
                                        </Link>
                                    ))
                            )}
                        </div>
                    </div>

                    {/* Bảng theo kênh */}
                    <div>
                        <h4 className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">Theo kênh</h4>
                        <div className="space-y-2">
                            {Object.entries(byMethod).length === 0 ? (
                                <p className="text-sm text-gray-400 italic">Chưa có dữ liệu</p>
                            ) : (
                                Object.entries(byMethod)
                                    .sort(([, a], [, b]) => b.total - a.total)
                                    .map(([key, val]) => (
                                        <Link
                                            key={key}
                                            href={`/admin/transactions?method=${key}`}
                                            className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 hover:bg-gold-primary/10 transition-colors"
                                        >
                                            <span className="text-[13px] text-gray-700">{METHOD_LABEL[key] || key}</span>
                                            <div className="text-right">
                                                <div className="text-[13px] font-semibold text-gray-800">{formatCurrency(val.total)}</div>
                                                <div className="text-xs text-gray-500">{val.count} giao dịch</div>
                                            </div>
                                        </Link>
                                    ))
                            )}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
                            <span className="text-xs text-gray-500">Tổng cộng</span>
                            <span className="text-xs font-semibold text-gray-700">{total} giao dịch</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
