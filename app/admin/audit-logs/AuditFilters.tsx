'use client';

import React from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

const resourceLabels: Record<string, string> = {
    news: 'Truyền thông nội bộ',
    events: 'Sự kiện & Lịch biểu',
    media: 'Kho tư liệu / E-Learning',
    users: 'Tài khoản người dùng',
    settings: 'Cấu hình hệ thống',
    site_settings: 'Thiết lập Workspace',
    transactions: 'Quản lý Tài chính',
    transaction_projects: 'Dự án & Ngân sách',
    bank_accounts: 'Cổng thanh toán',
    registrations: 'Đăng ký dịch vụ',
    event_registrations: 'Đăng ký sự kiện',
    contact_messages: 'Phản hồi khách hàng',
    organizations: 'Mạng lưới đối tác',
    tenants: 'Quản lý Tổ chức (Tenants)',
    user_roles: 'Phân quyền hệ thống (RBAC)',
};

const actions = [
    'create', 'update', 'delete', 'publish', 'archive', 'restore', 
    'login', 'logout', 'upload', 'approve', 'reject', 'ban', 'activate'
];

export function AuditFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const routeParams = useParams();
    const tenantId = routeParams?.tenant_id as string | undefined;
    const basePath = tenantId ? `/admin/t/${tenantId}/audit-logs` : '/admin/audit-logs';

    const [search, setSearch] = React.useState(searchParams.get('search') || '');
    const [resource, setResource] = React.useState(searchParams.get('resource') || 'all');
    const [action, setAction] = React.useState(searchParams.get('action') || 'all');
    
    // Push changes to URL
    const updateFilters = (updates: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());
        
        Object.entries(updates).forEach(([key, value]) => {
            if (value === 'all' || !value) {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        
        // Luôn reset về trang 1 khi lọc
        params.delete('page');
        
        router.push(`${basePath}?${params.toString()}`);
    };

    const handleSearch = () => {
        updateFilters({ search });
    };

    const handleReset = () => {
        setSearch('');
        setResource('all');
        setAction('all');
        router.push(basePath);
    };

    return (
        <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
                {/* Search Email */}
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Tìm theo email người dùng..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-9"
                        />
                    </div>
                </div>

                {/* Resource Select */}
                <div className="w-[180px]">
                    <Select value={resource} onValueChange={(val) => {
                        setResource(val);
                        updateFilters({ resource: val });
                    }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Tài nguyên" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả tài nguyên</SelectItem>
                            {Object.entries(resourceLabels).map(([id, label]) => (
                                <SelectItem key={id} value={id}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Action Select */}
                <div className="w-[180px]">
                    <Select value={action} onValueChange={(val) => {
                        setAction(val);
                        updateFilters({ action: val });
                    }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Hành động" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả hành động</SelectItem>
                            {actions.map((act) => (
                                <SelectItem key={act} value={act}>{act.toUpperCase()}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex gap-2">
                    <Button variant="default" onClick={handleSearch}>
                        Lọc
                    </Button>
                    <Button variant="outline" onClick={handleReset} title="Xóa bộ lọc">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
