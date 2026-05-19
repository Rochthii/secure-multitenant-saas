'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

const PURPOSE_MAP: Record<string, string> = {
    construction: 'Xây dựng',
    education: 'Giáo dục',
    charity: 'Từ thiện',
    general: 'Chung',
};

const METHOD_MAP: Record<string, string> = {
    bank_transfer: 'Chuyển khoản',
    momo: 'MoMo',
    cash: 'Tiền mặt',
};

const STATUS_MAP: Record<string, string> = {
    confirmed: 'Đã nhận',
    pending: 'Chờ duyệt',
    cancelled: 'Đã hủy',
};

interface ExportTransactionsButtonProps {
    data: any[];
}

export function ExportTransactionsButton({ data }: ExportTransactionsButtonProps) {
    const handleExport = () => {
        if (!data || data.length === 0) {
            toast.warning('Không có dữ liệu để xuất.');
            return;
        }

        const headers = [
            'Mã giao dịch',
            'Người gieo duyên',
            'Điện thoại',
            'Email',
            'Số tiền (VNĐ)',
            'Mục đích',
            'Kênh thanh toán',
            'Mã giao dịch ngân hàng',
            'Trạng thái',
            'Ghi chú',
            'Ngày tạo',
            'Ngày hoàn thành',
        ];

        const rows = data.map((d) => [
            d.id || '',
            d.is_anonymous ? 'Ẩn danh' : (d.donor_name || ''),
            d.donor_phone || '',
            d.donor_email || '',
            d.amount || 0,
            PURPOSE_MAP[d.purpose] || d.purpose || '',
            METHOD_MAP[d.payment_method] || d.payment_method || '',
            d.transaction_id || '',
            STATUS_MAP[d.status] || d.status || '',
            d.note || '',
            d.created_at ? new Date(d.created_at).toLocaleString('vi-VN') : '',
            d.completed_at ? new Date(d.completed_at).toLocaleString('vi-VN') : '',
        ]);

        const csvLines = [
            headers.join('\t'),
            ...rows.map((row) =>
                row.map((cell) => String(cell).replace(/\t/g, ' ')).join('\t')
            ),
        ];

        // UTF-16 LE + BOM để Excel nhận dạng tiếng Việt đúng
        const content = '\uFEFF' + csvLines.join('\r\n');
        const blob = new Blob([content], { type: 'text/tab-separated-values;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cung-duong-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <Button onClick={handleExport} variant="outline" className="gap-2 text-green-700 border-green-600 hover:bg-green-50">
            <FileSpreadsheet className="h-4 w-4" />
            Xuất Excel ({data?.length || 0})
        </Button>
    );
}
