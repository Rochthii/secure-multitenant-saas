'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { updateUserCustomPermissions } from '@/app/actions/admin/users';
import type { Permission, Resource } from '@/lib/permissions';

interface CustomizePermissionsDialogProps {
    userId: string;
    userName: string;
    basePermissions: Record<string, Permission>;
    initialOverrides: Record<string, Partial<Permission>> | null;
}

const RESOURCES: { id: Resource; label: string }[] = [
    { id: 'news', label: 'Tin tức' },
    { id: 'events', label: 'Sự kiện' },
    { id: 'media', label: 'Thư viện Media' },
    { id: 'transactions', label: 'Tiền Thành tích' },
    { id: 'registrations', label: 'Đăng Ký Khóa Lễ' },
    { id: 'users', label: 'Thành Viên' },
    { id: 'settings', label: 'Cài Đặt Website' },
    { id: 'analytics', label: 'Thống Kê' },
    { id: 'tenants', label: 'Quản Lý Chi nhánh' },
];

const ACTIONS = [
    { id: 'can_read', label: 'Xem' },
    { id: 'can_create', label: 'Thêm' },
    { id: 'can_update', label: 'Sửa' },
    { id: 'can_delete', label: 'Xóa' },
] as const;

export function CustomizePermissionsDialog({ userId, userName, basePermissions, initialOverrides }: CustomizePermissionsDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [overrides, setOverrides] = useState<Record<string, Partial<Permission>>>(initialOverrides || {});

    // Check if there are any overrides
    const hasOverrides = Object.keys(overrides).length > 0;

    const handleToggle = (resource: string, action: keyof Permission) => {
        setOverrides(prev => {
            const newOverrides = { ...prev };
            if (!newOverrides[resource]) {
                newOverrides[resource] = {};
            }

            const baseValue = basePermissions[resource]?.[action] ?? false;
            const currentValue = prev[resource]?.[action] ?? baseValue;
            const newValue = !currentValue;

            if (newValue === baseValue) {
                // Return to base, remove override
                delete newOverrides[resource][action];
                if (Object.keys(newOverrides[resource]).length === 0) {
                    delete newOverrides[resource];
                }
            } else {
                newOverrides[resource][action] = newValue;
            }

            return newOverrides;
        });
    };

    const handleReset = () => {
        setOverrides({});
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const dataToSave = Object.keys(overrides).length > 0 ? overrides : null;
            const result = await updateUserCustomPermissions(userId, dataToSave);

            if (result.success) {
                toast.success('Đã cập nhật cấu hình phân quyền cá nhân.');
                setOpen(false);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Không thể cập nhật quyền lúc này.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Tùy chỉnh quyền
                    {hasOverrides && (
                        <Badge variant="secondary" className="bg-gold-primary/20 text-gold-dark pointer-events-none">
                            Đã sửa đổi
                        </Badge>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col bg-white border-none shadow-2xl p-0 overflow-hidden">
                <div className="p-6 pb-2">
                    <DialogHeader>
                    <DialogTitle className="font-playfair text-2xl">
                        Tùy chỉnh quyền cá nhân
                    </DialogTitle>
                    <DialogDescription>
                        Cấu hình phân quyền đặc biệt cho <strong>{userName}</strong>.
                        Các ô được đánh dấu viền vàng <span>(vàng nhạt)</span> là những quyền đã được điều chỉnh khác với vai trò gốc.
                    </DialogDescription>
                    </DialogHeader>
                </div>

                <ScrollArea className="flex-1 px-6">
                    <div className="overflow-x-auto pb-4">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-4 px-4 font-bold text-slate-900 sticky left-0 bg-white z-20 w-[200px] border-b-2 border-slate-100">
                                        Tài nguyên (Menu)
                                    </th>
                                    {ACTIONS.map(a => (
                                        <th key={a.id} className="text-center py-4 font-bold text-slate-900 min-w-[100px] border-b-2 border-slate-100 bg-white">
                                            {a.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {RESOURCES.map(res => {
                                    return (
                                        <tr key={res.id} className="hover:bg-gray-50">
                                            <td className="py-4 px-4 font-semibold text-slate-700 sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-10 border-r border-slate-50">
                                                {res.label}
                                            </td>
                                            {ACTIONS.map(action => {
                                                const baseValue = basePermissions[res.id]?.[action.id] ?? false;
                                                const hasOverride = overrides[res.id] && action.id in overrides[res.id];
                                                const effectiveValue = hasOverride ? overrides[res.id][action.id] : baseValue;

                                                return (
                                                    <td key={action.id} className="py-3 text-center">
                                                        <div className="flex justify-center">
                                                            <div className={`
                                                                flex items-center justify-center p-2 rounded-lg transition-all duration-200
                                                                ${hasOverride ? 'bg-amber-50 ring-2 ring-amber-400/50 shadow-sm' : 'hover:bg-slate-100'}
                                                            `}>
                                                                <Checkbox
                                                                    checked={effectiveValue}
                                                                    onCheckedChange={() => handleToggle(res.id, action.id)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </ScrollArea>

                <DialogFooter className="p-6 bg-slate-50/50 border-t flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <Button
                        variant="ghost"
                        onClick={handleReset}
                        disabled={!hasOverrides || isSaving}
                        className="text-gray-500 hover:text-gray-900 w-full sm:w-auto"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Khôi phục về vai trò gốc
                    </Button>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving} className="flex-1 sm:flex-none">
                            Hủy bỏ
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-gold-primary hover:bg-gold-dark text-white flex-1 sm:flex-none">
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Đang lưu...' : 'Lưu tùy chỉnh'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
