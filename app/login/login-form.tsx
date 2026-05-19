'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InlineSpinner } from '@/components/ui/buddhist-spinner';

export function LoginForm({ tenantName, tenantId }: { tenantName: string; tenantId?: string }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/admin';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const supabase = createClient();
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                setError('Email hoặc mật khẩu không đúng');
                setLoading(false);
                return;
            }

            // Check if user has any valid admin role
            const role = data.user?.app_metadata?.role ?? data.user?.user_metadata?.role ?? 'volunteer';
            const allowedRoles = ['super_admin', 'admin', 'editor', 'moderator', 'volunteer'];
            if (!allowedRoles.includes(role)) {
                await supabase.auth.signOut();
                setError('Tài khoản này không có quyền truy cập. Vui lòng liên hệ quản trị viên.');
                setLoading(false);
                return;
            }

            if (redirect !== '/admin') {
                router.push(redirect);
            } else {
                router.push('/admin');
            }
            router.refresh();
        } catch (err) {
            setError('Có lỗi xảy ra. Vui lòng thử lại.');
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=${redirect}`,
                    queryParams: {
                        prompt: 'select_account',
                    }
                }
            });
            if (error) throw error;
        } catch (err: any) {
            setError('Lỗi kết nối Google: ' + err.message);
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const supabase = createClient();
            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        requested_tenant_id: tenantId || null,
                        requested_tenant_name: tenantName || null,
                    }
                }
            });

            if (authError) {
                setError(authError.message);
                setLoading(false);
                return;
            }

            if (data.user) {
                setMessage('Đăng ký thành công! Vui lòng kiểm tra email để xác thực.');
            }

            setLoading(false);
        } catch (err) {
            setError('Có lỗi xảy ra khi đăng ký.');
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                    {error}
                </div>
            )}
            {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
                    {message}
                </div>
            )}

            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
                {isRegistering && (
                    <div>
                        <Label htmlFor="fullname">Họ tên</Label>
                        <Input
                            id="fullname"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Nguyễn Văn A"
                            required
                            disabled={loading}
                        />
                    </div>
                )}

                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={`admin@${tenantName.toLowerCase().replace(/\s/g, '').replace(/[^\w]/g, '')}.com`}
                        required
                        disabled={loading}
                    />
                </div>

                <div>
                    <Label htmlFor="password">Mật khẩu</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        disabled={loading}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full bg-gold-primary hover:bg-gold-dark"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <InlineSpinner className="mr-2 h-4 w-4" />
                            {isRegistering ? 'Đang tạo tài khoản...' : 'Đang đăng nhập...'}
                        </>
                    ) : (
                        isRegistering ? 'Đăng ký tài khoản' : 'Đăng nhập'
                    )}
                </Button>
            </form>

            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Hoặc</span>
                </div>
            </div>

            <Button
                type="button"
                variant="outline"
                className="w-full bg-white text-gray-700 hover:bg-gray-50 border-gray-300 font-medium"
                onClick={handleGoogleLogin}
                disabled={loading}
            >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    <path fill="none" d="M1 1h22v22H1z" />
                </svg>
                {loading && !isRegistering ? 'Đang tải...' : 'Tiếp tục với Google'}
            </Button>

            <div className="text-center pt-2">
                <button
                    type="button"
                    onClick={() => {
                        setIsRegistering(!isRegistering);
                        setError('');
                        setMessage('');
                    }}
                    className="text-sm text-gold-dark hover:underline focus:outline-none"
                >
                    {isRegistering
                        ? 'Đã có tài khoản? Đăng nhập ngay'
                        : 'Chưa có tài khoản? Đăng ký ngay'}
                </button>
            </div>
        </div>
    );
}
