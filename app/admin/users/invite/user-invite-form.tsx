'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowLeft } from 'lucide-react';
import { createUser } from '@/app/actions/admin/users';
import { toast } from 'sonner';
import Link from 'next/link';
// @ts-ignore - Module import cache
import { RoleSelector } from '@/components/admin/role-selector';
import { Role } from '@/lib/permissions';

const formSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    fullName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    role: z.string().min(1, 'Vui lòng chọn vai trò'),
    tenantId: z.string().optional(),
});

interface UserInviteFormProps {
    currentUserRole?: string | null;
    currentUserTenantId?: string | null;
    tenants?: { id: string; name: string }[];
}

export default function UserInviteForm({ currentUserRole, currentUserTenantId, tenants = [] }: UserInviteFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            fullName: '',
            password: '',
            role: 'viewer',
            tenantId: currentUserTenantId || '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (['tenant_admin', 'tenant_editor', 'tenant_accountant'].includes(values.role) && !values.tenantId) {
            toast.error('Vui lòng chọn một ngôi chi nhánh (chi nhánh) cho quyền Tenant này.');
            return;
        }
        try {
            setIsLoading(true);
            const result = await createUser(values);

            if (result.success) {
                toast.success('Đã tạo tài khoản thành công');
                router.push('/admin/users');
                router.refresh();
            } else {
                toast.error(result.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi tạo tài khoản');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/users">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-playfair font-bold">Thêm thành viên mới</h1>
                    <p className="text-gray-500">Tạo tài khoản mới cho quản trị viên hoặc biên tập viên</p>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="email@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Họ và tên</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nguyễn Văn A" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mật khẩu</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="******" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <RoleSelector
                                            currentRole={field.value as Role}
                                            onChange={field.onChange}
                                            disabled={isLoading}
                                            allowedRoles={currentUserRole === 'tenant_admin' ? ['tenant_editor', 'moderator', 'editor', 'volunteer', 'viewer'] : undefined}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Tenant Selector (Only conditionally shown) */}
                            {['tenant_admin', 'tenant_editor', 'tenant_accountant'].includes(form.watch('role')) && (
                                <FormField
                                    control={form.control}
                                    name="tenantId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Chọn Ngôi Chi nhánh Quản Lý <span className="text-red-500">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading || currentUserRole === 'tenant_admin'}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="-- Chọn Chi nhánh --" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {currentUserRole === 'tenant_admin' ? (
                                                        <SelectItem key={currentUserTenantId} value={currentUserTenantId || ''}>
                                                            {tenants.find(t => t.id === currentUserTenantId)?.name || 'Chi nhánh của bạn'}
                                                        </SelectItem>
                                                    ) : (
                                                        tenants.map(t => (
                                                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <div className="flex justify-end gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/admin/users')}
                                    disabled={isLoading}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-gold-primary hover:bg-gold-dark text-white"
                                    disabled={isLoading}
                                >
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Tạo tài khoản
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
