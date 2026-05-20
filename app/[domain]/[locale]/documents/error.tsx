'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[Documents System Error]', error);
    }, [error]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 bg-slate-50/50 dark:bg-zinc-950">
            <div className="text-center max-w-md mx-auto bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 p-8 rounded-2xl shadow-sm">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600 dark:text-red-400 shadow-sm">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 mb-3">
                    Hệ thống gặp sự cố tải dữ liệu
                </h2>
                <p className="text-slate-500 dark:text-zinc-400 mb-8 leading-relaxed text-sm">
                    Không thể hiển thị tài liệu hoặc SOP vào lúc này do lỗi kết nối. Quý doanh nghiệp vui lòng thử lại.
                </p>
                <button
                    onClick={reset}
                    className="w-full inline-flex items-center justify-center gap-2 bg-violet-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-violet-500 transition-all shadow-md shadow-violet-950/10"
                >
                    ↻ Thử lại
                </button>
            </div>
        </div>
    );
}
