'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export function NewsFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleStatusChange = (status: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (status && status !== 'all') {
            params.set('status', status);
        } else {
            params.delete('status');
        }
        params.set('page', '1');
        router.push(`?${params.toString()}`);
    };

    return (
        <Select
            defaultValue={searchParams.get('status') || 'all'}
            onValueChange={handleStatusChange}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="published">Đã đăng</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
                <SelectItem value="archived">Lưu trữ</SelectItem>
            </SelectContent>
        </Select>
    );
}
