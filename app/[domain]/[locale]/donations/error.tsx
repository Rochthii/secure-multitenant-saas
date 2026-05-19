'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[Phuoc Dien Error]', error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md mx-auto">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🙏</span>
                </div>
                <h2 className="text-2xl font-playfair font-bold text-coffee-dark mb-3">
                    Trang Đóng góp tạm thời không khả dụng
                </h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    Đã xảy ra sự cố khi tải thông tin thanh toán. Vui lòng thử lại sau.
                </p>
                <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 bg-gold-primary text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-gold-dark transition-all shadow-lg shadow-gold-primary/20"
                >
                    ↻ Thử lại
                </button>
            </div>
        </div>
    );
}
