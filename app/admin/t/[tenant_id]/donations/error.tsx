'use client';

import { useEffect } from 'react';

export default function TransactionsAdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[Admin/Transactions] Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Lỗi tải Quản lý Thanh toán</h2>
            <p className="text-sm text-gray-500 mb-6 max-w-md">
                {error.message || 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.'}
            </p>
            <button
                onClick={reset}
                className="px-4 py-2 bg-gold-primary text-white rounded-lg text-sm font-medium hover:bg-gold-dark transition-colors"
            >
                Thử lại
            </button>
        </div>
    );
}
