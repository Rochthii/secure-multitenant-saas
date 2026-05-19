'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Application Error:', error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
            <div className="bg-red-50 p-6 rounded-2xl max-w-md w-full border border-red-100">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚠️</span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Đã có lỗi xảy ra
                </h2>

                <p className="text-gray-600 mb-6 text-sm">
                    Hệ thống đang gặp sự cố khi tải nội dung. Vui lòng thử lại sau giây lát.
                    <br />
                    <span className="text-xs text-gray-400 mt-2 block font-mono">
                        {error.digest && `Code: ${error.digest}`}
                    </span>
                </p>

                <div className="flex justify-center gap-3">
                    <Button
                        onClick={() => reset()}
                        className="bg-gold-primary hover:bg-gold-dark text-white gap-2"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Thử lại
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => window.location.href = '/'}
                    >
                        Về trang chủ
                    </Button>
                </div>
            </div>
        </div>
    );
}
