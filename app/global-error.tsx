'use client';

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="vi">
            <body className={inter.className}>
                <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-gray-50">
                    <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">🛑</span>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            Sự cố hệ thống nghiêm trọng
                        </h2>

                        <p className="text-gray-600 mb-8 text-sm leading-relaxed">
                            Rất tiếc, đã có một lỗi nghiêm trọng xảy ra khiến hệ thống không thể khởi động.
                            Vui lòng thử tải lại trang hoặc liên hệ quản trị viên.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => reset()}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all"
                            >
                                Thử tải lại hệ thống
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl border border-gray-200 transition-all"
                            >
                                Quay về trang chủ
                            </button>
                        </div>

                        {error.digest && (
                            <p className="mt-6 text-[10px] text-gray-400 font-mono uppercase tracking-widest">
                                Digest: {error.digest}
                            </p>
                        )}
                    </div>
                </div>
            </body>
        </html>
    );
}
