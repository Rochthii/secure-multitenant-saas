'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { InlineSpinner } from '@/components/ui/buddhist-spinner';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
            });

            if (error) {
                setError(error.message);
            } else {
                setSuccess(true);
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
                    <CardTitle className="text-2xl font-playfair text-center">QuÃªn máº­t kháº©u</CardTitle>
                    <CardDescription className="text-center">
                        Nháº­p email cá»§a báº¡n Ä‘á»ƒ nháº­n liÃªn káº¿t Ä‘áº·t láº¡i máº­t kháº©u
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <CheckCircle className="h-12 w-12 text-green-500" />
                            </div>
                            <p className="text-green-700 font-medium">
                                ÄÃ£ gá»­i liÃªn káº¿t khÃ´i phá»¥c!
                            </p>
                            <p className="text-sm text-gray-600">
                                Vui lÃ²ng kiá»ƒm tra email <strong>{email}</strong> vÃ  lÃ m theo hÆ°á»›ng dáº«n.
                            </p>
                            <Button asChild className="w-full mt-4" variant="outline">
                                <Link href="/login">Quay láº¡i Ä‘Äƒng nháº­p</Link>
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@system.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                        Äang gá»­i...
                                    </>
                                ) : (
                                    'Gá»­i liÃªn káº¿t xÃ¡c nháº­n'
                                )}

                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center border-t p-4 bg-muted/20">
                    <Link href="/login" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay láº¡i trang Ä‘Äƒng nháº­p
                    </Link>
                </CardFooter>
            </Card>
        </div >
    );
}

