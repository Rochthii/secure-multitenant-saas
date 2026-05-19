'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BackupPage() {
    const [loading, setLoading] = useState(false);
    const [selectedTable, setSelectedTable] = useState<string>('all');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [restoring, setRestoring] = useState(false);

    const handleExport = async () => {
        setLoading(true);

        try {
            // Fetch all data or partial data
            const urlEndpoint = selectedTable === 'all' 
                ? '/api/admin/backup' 
                : `/api/admin/backup?table=${selectedTable}`;
            const response = await fetch(urlEndpoint);
            
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to backup');
            }

            const data = await response.json();

            // Create JSON blob
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json',
            });

            // Download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `chantarangsay-backup-${Date.now()}.json`;
            toast.success('Đã tạo file backup thành công!');
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi khi export backup');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm('CẢNH BÁO: Phục hồi (Restore) sẽ GHI ĐÈ dữ liệu hiện tại bằng dữ liệu trong file JSON. Bạn có chắc chắn muốn tiếp tục?')) {
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setRestoring(true);
        const formData = new FormData();
        formData.append('backup_file', file);

        try {
            const res = await fetch('/api/admin/backup/restore', {
                method: 'POST',
                body: formData
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Failed to restore');

            toast.success(`Phục hồi thành công! Đã ghi đè ${result.total || 0} bản ghi.`);
        } catch (error: any) {
            toast.error(error.message || 'Lỗi phục hồi dữ liệu');
        } finally {
            setRestoring(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="max-w-3xl space-y-6">
            <h1 className="text-3xl font-playfair font-bold mb-8">Quản trị Lưu trữ (Backup & Restore)</h1>

            <Card className="border-gold-light">
                <CardHeader>
                    <CardTitle>Xuất dữ liệu hệ thống (Export JSON)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-gray-600">
                        Hành động tải xuống toàn cục các dữ liệu (tin tức, sự kiện, media, quỹ từ thiện) về dưới định dạng cấu trúc JSON nguyên bản.
                    </p>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                            <strong>Lưu ý:</strong> File backup chỉ chứa thông tin cấu trúc hiển thị. Các thành phần nhúng và file tĩnh 
                            Media vẫn được host thông qua public bucket của Supabase.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700">Chọn phạm vi dữ liệu xuất (Partial Check)</label>
                        <select 
                            value={selectedTable}
                            onChange={(e) => setSelectedTable(e.target.value)}
                            className="max-w-xs border border-gray-300 rounded p-2 focus:ring-2 focus:ring-gold-primary outline-none"
                            disabled={loading || restoring}
                        >
                            <option value="all">Tất cả dữ liệu (Full Export)</option>
                            <option value="news">Tạp chí Phán Pháp (news)</option>
                            <option value="events">Sự kiện (events)</option>
                            <option value="transactions">Thanh toán cá nhân (transactions)</option>
                            <option value="event_registrations">Đăng ký sự kiện (event_registrations)</option>
                            <option value="about_sections">Giới thiệu chi nhánh (about_sections)</option>
                        </select>
                    </div>

                    <Button
                        onClick={handleExport}
                        disabled={loading || restoring}
                        className="bg-gold-primary hover:bg-gold-dark"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xuất dữ liệu...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Tải xuống Backup (JSON)
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            <Card className="border border-red-100">
                <CardHeader>
                    <CardTitle className="text-red-700">Phục hồi dữ liệu hệ thống (Import JSON)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Chức năng tự động ghi đè và lấp đầy trực tiếp các khoảng trống hiện tại của dữ liệu Database của nền tảng dựa trên file backup JSON (.json) do hệ thống cung cấp.
                    </p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-red-800 font-semibold">
                            ⚠️ Cảnh Báo Nguy Hiểm: Thao tác này sẽ tự động thay đổi vĩnh viễn dữ liệu hiện có bằng bản gốc nằm trong file. Nếu upload nhầm file có thể dẫn đến lệch trạng thái toàn hệ thống. Hãy thực sự cẩn trọng!
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <input 
                            type="file"
                            accept=".json,application/json"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleRestore}
                        />
                        <Button 
                            variant="destructive"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={loading || restoring}
                        >
                            {restoring ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                                    Đang tải và chèn dữ liệu...
                                </>
                            ) : (
                                "Tải lên File JSON & Phục hồi"
                            )}
                        </Button>
                        <p className="text-xs text-gray-400 font-medium">Auto-Upsert API Chunking supported</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
