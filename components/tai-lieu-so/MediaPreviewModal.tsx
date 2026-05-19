'use client';

import React from 'react';
import { X, ExternalLink, Download } from 'lucide-react';

interface MediaPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    doc: {
        title_vi: string;
        url: string;
        type: string;
    } | null;
}

export function MediaPreviewModal({ isOpen, onClose, doc }: MediaPreviewModalProps) {
    if (!isOpen || !doc) return null;

    const renderPreview = () => {
        const url = doc.url;
        const type = doc.type;

        if (type === 'video') {
            return (
                <div className="aspect-video w-full">
                    <iframe 
                        src={url.replace('watch?v=', 'embed/')} 
                        className="w-full h-full rounded-xl"
                        allowFullScreen
                    />
                </div>
            );
        }

        if (type === 'audio') {
            return (
                <div className="flex flex-col items-center justify-center py-20 bg-stone-50 rounded-xl border border-stone-200 border-dashed">
                    <audio controls className="w-full max-w-md">
                        <source src={url} />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            );
        }

        const isPdfUrl = url.toLowerCase().includes('.pdf');
        if (isPdfUrl || type === 'book' || type === 'sutra' || type === 'document') {
            return (
                <iframe 
                    src={url}
                    className="w-full h-[70vh] rounded-xl border border-stone-200 bg-stone-100"
                    title={doc.title_vi}
                />
            );
        }

        if (type === 'image' || /\.(jpg|jpeg|png|webp|avif|gif)/i.test(url)) {
            return (
                <div className="flex justify-center">
                    <img src={url} alt={doc.title_vi} className="max-w-full max-h-[70vh] rounded-xl object-contain shadow-2xl" />
                </div>
            );
        }

        return (
            <div className="py-20 text-center bg-stone-50 rounded-xl border-2 border-dashed border-stone-200">
                <p className="text-stone-500 font-medium">Bản xem trước không có sẵn cho loại tệp này.</p>
                <a href={url} target="_blank" className="mt-4 inline-flex items-center gap-2 text-gold-primary font-bold">
                    Mở trong cửa sổ mới <ExternalLink className="w-4 h-4" />
                </a>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 pointer-events-none">
            <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
            <div className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-300">
                <div className="absolute top-6 right-6 z-10 flex gap-2">
                    <a 
                        href={doc.url.includes('supabase.co') && !doc.url.includes('download') ? `${doc.url}${doc.url.includes('?') ? '&' : '?'}download=` : doc.url}
                        download 
                        target="_blank"
                        rel="noreferrer noopener"
                        className="p-3 bg-stone-100 text-stone-600 rounded-full hover:bg-stone-200 transition-colors"
                        title="Tải về"
                        onClick={async (e) => {
                            if (doc.type === 'video' && doc.url.includes('youtube.com')) return;
                            // Attempt programmatic download for PDFs to prevent browser opening them
                            if (doc.url.toLowerCase().includes('.pdf') || doc.url.includes('supabase.co')) {
                                e.preventDefault();
                                try {
                                    const response = await fetch(doc.url);
                                    if (!response.ok) throw new Error('Network response was not ok');
                                    const blob = await response.blob();
                                    const blobUrl = window.URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = blobUrl;
                                    link.download = doc.title_vi + (doc.url.toLowerCase().includes('.pdf') ? '.pdf' : '');
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    window.URL.revokeObjectURL(blobUrl);
                                } catch (err) {
                                    // Fallback
                                    window.open(doc.url.includes('supabase.co') && !doc.url.includes('download') ? `${doc.url}${doc.url.includes('?') ? '&' : '?'}download=` : doc.url, '_blank');
                                }
                            }
                        }}
                    >
                        <Download className="w-5 h-5" />
                    </a>
                    <button 
                        onClick={onClose}
                        className="p-3 bg-stone-100 text-stone-600 rounded-full hover:bg-stone-200 transition-colors"
                        title="Đóng"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-col h-full max-h-[90vh]">
                    <div className="p-8 pb-4">
                        <span className="text-[10px] font-black tracking-[0.2em] text-gold-primary uppercase mb-2 block">
                            Đang xem tài liệu
                        </span>
                        <h2 className="text-2xl md:text-3xl font-black text-stone-800 leading-tight">
                            {doc.title_vi}
                        </h2>
                    </div>

                    <div className="p-8 pt-0 overflow-y-auto">
                        {renderPreview()}
                    </div>
                </div>
            </div>
        </div>
    );
}
