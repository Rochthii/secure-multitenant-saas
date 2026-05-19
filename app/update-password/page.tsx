'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InlineSpinner } from '@/components/ui/buddhist-spinner';
import { toast } from 'sonner';

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Máº­t kháº©u xÃ¡c nháº­n khÃ´ng khá»›p');
            return;
        }

        if (password.length < 6) {
            setError('Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±');
            return;
        }

        setLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                setError(error.message);
            } else {
                toast.success('Äá»•i máº­t kháº©u thÃ nh cÃ´ng! Äang chuyá»ƒn hÆ°á»›ng...');
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            }
        } catch (err) {
            setError('CÃ³ lá»—i xáº£y ra. Vui lÃ²ng thá»­ láº¡i.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-playfair text-center">Äáº·t láº¡i máº­t kháº©u</CardTitle>
                    <CardDescription className="text-center">
                        Nháº­p máº­t kháº©u má»›i cho tÃ i khoáº£n cá»§a báº¡n
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="password">Máº­t kháº©u má»›i</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm_password">XÃ¡c nháº­n máº­t kháº©u</Label>
                            <Input
                                id="confirm_password"
                                type="password"
                                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
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
                                    Äang lÆ°u...
                                </>
                            ) : (
                                'LÆ°u máº­t kháº©u má»›i'
                            )}

                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div >
    );
}

