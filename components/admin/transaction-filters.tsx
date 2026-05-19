'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon, Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce'; // Assuming this hook exists, if not we'll debounce manually or create it

interface TransactionFiltersProps {
    purposes: { id: string; title: string }[];
}

export function TransactionFilters({ purposes }: TransactionFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State for filters
    const [q, setQ] = useState(searchParams.get('q') || '');
    const [status, setStatus] = useState(searchParams.get('status') || 'all');
    const [method, setMethod] = useState(searchParams.get('method') || 'all');
    const [purpose, setPurpose] = useState(searchParams.get('purpose') || 'all');
    const [dateFrom, setDateFrom] = useState<Date | undefined>(
        searchParams.get('date_from') ? new Date(searchParams.get('date_from')!) : undefined
    );
    const [dateTo, setDateTo] = useState<Date | undefined>(
        searchParams.get('date_to') ? new Date(searchParams.get('date_to')!) : undefined
    );

    // Debounce search input
    const [debouncedQ, setDebouncedQ] = useState(q);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQ(q), 500);
        return () => clearTimeout(timer);
    }, [q]);

    // Apply filters
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        // Search
        if (debouncedQ) params.set('q', debouncedQ);
        else params.delete('q');

        // Status
        if (status && status !== 'all') params.set('status', status);
        else params.delete('status');

        // Method
        if (method && method !== 'all') params.set('method', method);
        else params.delete('method');

        // Purpose (Project)
        if (purpose && purpose !== 'all') params.set('purpose', purpose);
        else params.delete('purpose');

        // Dates
        if (dateFrom) params.set('date_from', format(dateFrom, 'yyyy-MM-dd'));
        else params.delete('date_from');

        if (dateTo) params.set('date_to', format(dateTo, 'yyyy-MM-dd'));
        else params.delete('date_to');

        // Reset page on filter change
        params.delete('page');

        router.push(`?${params.toString()}`);
    }, [debouncedQ, status, method, purpose, dateFrom, dateTo, router, searchParams]);

    // Clear all
    const clearFilters = () => {
        setQ('');
        setStatus('all');
        setMethod('all');
        setPurpose('all');
        setDateFrom(undefined);
        setDateTo(undefined);
        router.push('?');
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 1. Search */}
                <div className="relative col-span-1 lg:col-span-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Tìm theo tên, SĐT, mã giao dịch..."
                        className="pl-9"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                </div>

                {/* 2. Status */}
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                        <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                        <SelectItem value="pending">Chờ xác nhận</SelectItem>
                        <SelectItem value="rejected">Đã hủy</SelectItem>
                    </SelectContent>
                </Select>

                {/* 3. Method */}
                <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger>
                        <SelectValue placeholder="Phương thức" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả phương thức</SelectItem>
                        <SelectItem value="bank_transfer">Chuyển khoản</SelectItem>
                        <SelectItem value="momo">MoMo</SelectItem>
                        <SelectItem value="cash">Tiền mặt</SelectItem>
                    </SelectContent>
                </Select>

                {/* 4. Purpose (Project) */}
                <Select value={purpose} onValueChange={setPurpose}>
                    <SelectTrigger>
                        <SelectValue placeholder="Hạng mục / Quỹ" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả hạng mục</SelectItem>
                        {purposes.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                                {p.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* 4. Date Range (simplified as two inputs for now, or use a Range Picker if available) */}
                <div className="flex gap-2 col-span-1 lg:col-span-1">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal truncate",
                                    !dateFrom && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateFrom ? format(dateFrom, "dd/MM", { locale: vi }) : "Từ ngày"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={dateFrom}
                                onSelect={setDateFrom}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal truncate",
                                    !dateTo && "text-muted-foreground"
                                )}
                            >
                                {/* <CalendarIcon className="mr-2 h-4 w-4" /> */}
                                {dateTo ? format(dateTo, "dd/MM", { locale: vi }) : "Đến ngày"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={dateTo}
                                onSelect={setDateTo}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {(q || status !== 'all' || method !== 'all' || dateFrom || dateTo) && (
                <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        <X className="h-4 w-4 mr-2" />
                        Xóa bộ lọc
                    </Button>
                </div>
            )}
        </div>
    );
}
