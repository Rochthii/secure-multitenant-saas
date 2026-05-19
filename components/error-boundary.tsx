'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        // TODO: Log to error reporting service (Sentry, etc.)
    }

    resetError = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                    <div className="max-w-md w-full text-center">
                        {/* Buddha Icon */}
                        <div className="mb-6">
                            <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500" />
                        </div>

                        {/* Error Message */}
                        <h1 className="text-2xl font-playfair font-bold text-gray-900 mb-3">
                            Đã xảy ra lỗi
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ với chúng tôi nếu vấn đề vẫn tiếp diễn.
                        </p>

                        {/* Error Details (dev mode only) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                                <p className="font-mono text-sm text-red-800 break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={this.resetError}
                                className="px-6 py-3 bg-gold-primary text-white rounded-lg hover:bg-gold-dark transition-colors font-medium"
                            >
                                Thử lại
                            </button>
                            <a
                                href="/"
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Về trang chủ
                            </a>
                        </div>

                        {/* Contact Info */}
                        <p className="mt-8 text-sm text-gray-500">
                            Cần trợ giúp? Liên hệ: <a href="mailto:contact@chantarangsay.org" className="text-gold-primary hover:underline">contact@chantarangsay.org</a>
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
