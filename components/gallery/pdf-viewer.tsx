'use client';

import React from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { formatFileSize } from '@/lib/constants/media';
import type { MediaItem } from '@/lib/constants/media';

interface PDFViewerProps {
    pdfs: MediaItem[];
}

export function PDFViewer({ pdfs }: PDFViewerProps) {
    if (pdfs.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Chưa có tài liệu PDF nào</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {pdfs.map((pdf) => (
                <div
                    key={pdf.id}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gold-primary hover:shadow-md transition-all"
                >
                    <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 bg-red-50 rounded-lg">
                            <FileText className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{pdf.title}</h3>
                            {pdf.description && (
                                <p className="text-sm text-gray-600 mt-1">{pdf.description}</p>
                            )}
                            {pdf.file_size && (
                                <p className="text-xs text-gray-500 mt-1">{formatFileSize(pdf.file_size)}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Open in new tab */}
                        <a
                            href={pdf.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Mở trong tab mới"
                        >
                            <ExternalLink className="h-5 w-5 text-gray-600" />
                        </a>

                        {/* Download */}
                        <a
                            href={pdf.url}
                            download
                            className="flex items-center gap-2 px-4 py-2 bg-gold-primary hover:bg-gold-dark text-white rounded-lg transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Tải xuống</span>
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
}
