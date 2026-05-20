'use client';

import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { updateNavVisibility } from '@/app/actions/admin/tenants';
import {
    Home, Info, Newspaper, BookOpen, FileText, Heart, Phone, Save, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface NavItem {
    key: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    alwaysOn?: boolean; // Không cho phép ẩn (ví dụ: Trang chủ)
    manageHref?: (tenantId: string) => string;
    manageLabel?: string;
}

const NAV_ITEMS: NavItem[] = [
    {
        key: 'home',
        label: 'Trang chủ',
        description: 'Luôn hiển thị',
        icon: <Home className="h-4 w-4" />,
        alwaysOn: true,
    },
    {
        key: 'about',
        label: 'Giới thiệu',
        description: 'Giới thiệu về doanh nghiệp, lịch sử phát triển, ban điều hành',
        icon: <Info className="h-4 w-4" />,
        manageHref: (tenantId) => `/admin/t/${tenantId}/pages`,
        manageLabel: 'Quản lý Trang tĩnh'
    },
    {
        key: 'news',
        label: 'Tin tức',
        description: 'Tin tức truyền thông & Sự kiện nổi bật của doanh nghiệp',
        icon: <Newspaper className="h-4 w-4" />,
        manageHref: (tenantId) => `/admin/t/${tenantId}/categories`,
        manageLabel: 'Quản lý Phân hệ News'
    },
    {
        key: 'dharma',
        label: 'Đào tạo & Video SOP',
        description: 'Video hướng dẫn nghiệp vụ, quy trình đào tạo và SOP',
        icon: <BookOpen className="h-4 w-4" />,
        manageHref: (tenantId) => `/admin/t/${tenantId}/categories`,
        manageLabel: 'Quản lý Video & Đào tạo'
    },
    {
        key: 'documents',
        label: 'Tài liệu số',
        description: 'Kho văn bản quy chế, chính sách doanh nghiệp số hóa',
        icon: <FileText className="h-4 w-4" />,
        manageHref: (tenantId) => `/admin/t/${tenantId}/categories`,
        manageLabel: 'Quản lý Tài liệu số'
    },
    {
        key: 'transaction',
        label: 'Dự án',
        description: 'Các dự án đóng góp xã hội & Sáng kiến ESG',
        icon: <Heart className="h-4 w-4" />,
        manageHref: (tenantId) => `/admin/t/${tenantId}/projects`,
        manageLabel: 'Quản lý Hạng mục Dự án'
    },
    {
        key: 'contact',
        label: 'Liên hệ',
        description: 'Thông tin liên lạc văn phòng và bản đồ',
        icon: <Phone className="h-4 w-4" />,
        manageHref: (tenantId) => `/admin/t/${tenantId}/settings/information`,
        manageLabel: 'Cập nhật thông tin Liên hệ'
    },
];

interface NavVisibilitySettingsProps {
    tenantId: string;
    initialNavVisibility?: Record<string, boolean>;
}

export function NavVisibilitySettings({ tenantId, initialNavVisibility = {} }: NavVisibilitySettingsProps) {
    const [visibility, setVisibility] = useState<Record<string, boolean>>(() => {
        const defaults: Record<string, boolean> = {};
        NAV_ITEMS.forEach(item => {
            // Default: hiển thị tất cả (true nếu key không tồn tại)
            defaults[item.key] = initialNavVisibility[item.key] !== false;
        });
        return defaults;
    });
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const handleToggle = (key: string, value: boolean) => {
        setVisibility(prev => ({ ...prev, [key]: value }));
        setIsDirty(true);
    };

    const handleSave = async () => {
        setSaving(true);
        const result = await updateNavVisibility(tenantId, visibility);
        setSaving(false);

        if (result.success) {
            toast.success('Đã lưu cấu hình menu! Header sẽ cập nhật ngay.');
            setIsDirty(false);
        } else {
            toast.error(result.error || 'Lỗi khi lưu cấu hình');
        }
    };

    return (
        <div className="space-y-4">
            <div className="text-sm text-gray-500 bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
                <span className="text-amber-600 font-medium">💡</span>
                <span>
                    Cấu hình này kiểm soát các mục <strong>hiển thị trên thanh menu chính</strong> (Header) của trang web doanh nghiệp.
                    Tắt một mục sẽ ẩn nó hoàn toàn khỏi điều hướng, không ảnh hưởng đến nội dung trang chủ.
                </span>
            </div>

            <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                {NAV_ITEMS.map((item) => {
                    const isOn = visibility[item.key] !== false;
                    return (
                        <div
                            key={item.key}
                            className={`flex items-center justify-between px-5 py-4 transition-colors ${isOn ? 'bg-white' : 'bg-gray-50'}`}
                        >
                             <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isOn ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                                    {item.icon}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className={`font-semibold text-sm ${isOn ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {item.label}
                                        </p>
                                        {item.alwaysOn && (
                                            <span className="text-[10px] font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                                Bắt buộc
                                            </span>
                                        )}
                                        {item.manageHref && (
                                            <Link 
                                                href={item.manageHref(tenantId)}
                                                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-2 py-0.5 rounded-full transition-colors ml-1"
                                                target="_blank"
                                            >
                                                <span>{item.manageLabel}</span>
                                                <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400">{item.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-medium ${isOn ? 'text-green-600' : 'text-gray-400'}`}>
                                    {item.alwaysOn ? 'Luôn bật' : isOn ? 'Hiển thị' : 'Đã ẩn'}
                                </span>
                                <Switch
                                    checked={isOn}
                                    disabled={item.alwaysOn}
                                    onCheckedChange={(val) => handleToggle(item.key, val)}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end pt-2">
                <Button
                    onClick={handleSave}
                    disabled={saving || !isDirty}
                    className={`gap-2 ${isDirty ? 'bg-gold-primary hover:bg-gold-dark' : ''}`}
                >
                    {saving ? (
                        <span className="animate-spin">⏳</span>
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    {saving ? 'Đang lưu...' : isDirty ? 'Lưu thay đổi' : 'Đã lưu'}
                </Button>
            </div>
        </div>
    );
}
