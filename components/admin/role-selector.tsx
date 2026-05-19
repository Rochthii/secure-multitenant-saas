'use client';

import React from 'react';
import { Role, getRoleDisplayName, getRoleBadgeColor } from '@/lib/permissions-types';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface RoleSelectorProps {
    currentRole: Role;
    onChange: (role: Role) => void;
    disabled?: boolean;
    allowedRoles?: Role[];
}

const ALL_ROLES: Role[] = [
    'super_admin',
    'agency_admin',
    'company_editor',
    'tenant_admin',
    'tenant_editor',
    'tenant_accountant',
    'admin',
    'moderator',
    'editor',
    'volunteer',
    'viewer',
];

const roleDescriptions: Partial<Record<Role, string>> = {
    super_admin: 'Toàn quyền hệ thống (nguy hiểm)',
    agency_admin: 'Đại lý Quản trị — Quản lý Web & Chi nhánh',
    company_editor: 'Biên tập mạng lưới — đăng bài nhiều chi nhánh',
    tenant_admin: 'Admin chi nhánh — quản lý toàn bộ trong phạm vi 1 chi nhánh',
    tenant_editor: 'Biên tập nội bộ chi nhánh — tạo/sửa bài viết',
    tenant_accountant: 'Kế toán chi nhánh — xem và quản lý đóng góp quỹ',
    admin: 'Duyệt bài, quản lý users, settings',
    moderator: 'Quản lý đóng góp quỹ chuyên biệt',
    editor: 'Tạo/sửa tin tức, sự kiện, upload ảnh',
    volunteer: 'Cộng Tác Viên đăng bài tự do',
    viewer: 'Chỉ đọc nội dung',
};

export function RoleSelector({ currentRole, onChange, disabled = false, allowedRoles }: RoleSelectorProps) {
    const renderRoles = allowedRoles ? ALL_ROLES.filter(r => allowedRoles.includes(r)) : ALL_ROLES;

    return (
        <div className="space-y-4">
            <Label>User Role</Label>
            <RadioGroup
                value={currentRole}
                onValueChange={(value: string) => onChange(value as Role)}
                disabled={disabled}
            >
                {renderRoles.map((role) => (
                    <div
                        key={role}
                        className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50"
                    >
                        <RadioGroupItem value={role} id={role} />
                        <div className="flex-1">
                            <label
                                htmlFor={role}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(role)}`}>
                                    {getRoleDisplayName(role)}
                                </span>
                            </label>
                            <p className="text-sm text-gray-500 mt-1">
                                {roleDescriptions[role]}
                            </p>
                        </div>
                    </div>
                ))}
            </RadioGroup>
        </div>
    );
}
