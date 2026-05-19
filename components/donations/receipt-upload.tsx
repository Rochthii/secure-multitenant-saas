'use client';

import React, { useState } from 'react';
import { uploadReceipt } from '@/app/actions/upload-receipt';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, X, Image as ImageIcon, FileText } from 'lucide-react';
import Image from 'next/image';
import { compressImageToWebP } from '@/lib/utils/compress-image';

interface ReceiptUploadProps {
    value?: string;
    onChange: (value: string) => void;
    error?: string;
}

export function ReceiptUpload({ value, onChange, error }: ReceiptUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf';

        if (!isImage && !isPdf) {
            setLocalError('Vui lòng chọn file hình ảnh hoặc PDF.');
            return;
        }

        setUploading(true);
        setLocalError('');

        try {
            let fileToUpload: File | Blob = file;
            
            // Chỉ nén nếu là ảnh
            if (isImage) {
                fileToUpload = await compressImageToWebP(file);
            }

            const formData = new FormData();
            formData.append('file', fileToUpload);
            const result = await uploadReceipt(formData);

            if (result.success && result.url) {
                onChange(result.url);
            } else {
                setLocalError(result.error || 'Tải tệp lên thất bại');
            }
        } catch (err) {
            console.error(err);
            setLocalError('Có lỗi xảy ra khi tải tệp lên');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full mt-6 border-t border-dashed border-gray-200 pt-5">
            <Label className="text-gray-700 font-medium mb-3 block">
                Gửi tệp đính kèm
                <span className="text-xs text-gray-400 font-normal ml-2">(Ảnh chụp danh sách, biên lai... - tùy chọn)</span>
            </Label>

            {value ? (
                <div className="relative w-full md:w-3/4 aspect-video bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-sm mx-auto">
                    {value.toLowerCase().endsWith('.pdf') ? (
                        <div className="flex flex-col items-center justify-center w-full h-full text-blue-600 bg-blue-50/50">
                            <FileText className="h-16 w-16 mb-2" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Tài liệu PDF</span>
                            <a 
                                href={value} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="mt-2 text-[10px] underline hover:text-blue-800"
                            >
                                Xem tài liệu
                            </a>
                        </div>
                    ) : (
                        <Image src={value} alt="Receipt preview" fill className="object-contain" unoptimized />
                    )}
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        disabled={uploading}
                        className="absolute top-2 right-2 p-2 bg-white/90 text-gray-700 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors shadow z-10"
                        aria-label="Remove file"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <label className={`
                    flex flex-col items-center justify-center w-full min-h-[110px]
                    border-2 border-dashed border-gray-200 rounded-xl 
                    cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-gold-primary/50 transition-all
                    ${uploading ? 'opacity-70 pointer-events-none' : ''}
                `}>
                    <div className="flex flex-col items-center justify-center py-5">
                        {uploading ? (
                            <>
                                <Loader2 className="w-6 h-6 mb-2 text-gold-primary animate-spin" />
                                <p className="text-sm text-gray-500">Đang tải tệp lên...</p>
                            </>
                        ) : (
                            <>
                                <ImageIcon className="w-6 h-6 mb-2 text-gray-400" />
                                <p className="text-sm text-gray-600 font-medium line-clamp-1">Nhấn để chọn ảnh hoặc PDF</p>
                            </>
                        )}
                    </div>
                    <Input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </label>
            )}

            {(error || localError) && (
                <p className="text-sm text-red-500 mt-2 flex items-center justify-center">
                    <X className="w-4 h-4 mr-1" /> {error || localError}
                </p>
            )}
        </div>
    );
}
