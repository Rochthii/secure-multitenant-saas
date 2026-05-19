import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, LogOut, Building2, CheckCircle2 } from 'lucide-react';
import { getUserContext } from '@/lib/permissions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function PendingApprovalPage() {
    const userCtx = await getUserContext();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // If user already has a role, they shouldn't be here (Smart Redirect back to admin)
    const allowedRoles = ['super_admin', 'company_editor', 'tenant_admin', 'tenant_editor', 'tenant_accountant', 'admin', 'editor', 'moderator'];
    if (userCtx?.role && allowedRoles.includes(userCtx.role)) {
        redirect('/admin');
    }

    const requestedTenantName = user?.user_metadata?.requested_tenant_name || 'Hệ thống';
    const fullName = user?.user_metadata?.full_name || user?.email;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full shadow-lg border-t-4 border-t-gold-primary">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-gold-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Clock className="h-8 w-8 text-gold-primary animate-pulse" />
                    </div>
                    <CardTitle className="text-2xl font-playfair text-gray-800">
                        Đang chờ phê duyệt
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-center">
                    <div className="space-y-2">
                        <p className="text-gray-600">
                            Xin chào <span className="font-semibold text-gray-900">{fullName}</span>,
                        </p>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Tài khoản của bạn đã được đăng ký thành công và đang chờ Quản trị viên phê duyệt quyền truy cập.
                        </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3 text-left">
                        <Building2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
                                Chi nhánh yêu cầu gia nhập
                            </p>
                            <p className="text-sm font-medium text-blue-900">
                                {requestedTenantName}
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 space-y-4">
                        <div className="flex items-center justify-center gap-2 text-xs text-green-600 font-medium">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Bạn sẽ nhận được thông báo khi được cấp quyền.</span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button asChild variant="outline" className="w-full border-gray-200 text-gray-600 hover:bg-gray-100">
                                <Link href="/">
                                    Quay về Trang chủ
                                </Link>
                            </Button>

                            <form action="/auth/sign-out" method="post">
                                <Button type="submit" variant="ghost" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Đăng xuất
                                </Button>
                            </form>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
