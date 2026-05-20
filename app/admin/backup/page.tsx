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
        <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl -mr-64 -mt-64 mix-blend-screen pointer-events-none" />
                <div className="relative z-10 p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30 text-amber-400">
                            <Download className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent tracking-tight">Quản trị Lưu trữ</h1>
                            <p className="text-slate-400 mt-1.5 text-sm">
                                Sao lưu và phục hồi dữ liệu hệ thống đa khách hàng. Đảm bảo tính sẵn sàng cao và an toàn bảo mật.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Export Card */}
                <Card className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl rounded-[2rem] overflow-hidden flex flex-col justify-between">
                    <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800/80">
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            Xuất dữ liệu hệ thống (Export JSON)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                Hành động tải xuống toàn cục các dữ liệu (tin tức, sự kiện, media, quỹ từ thiện) về dưới định dạng cấu trúc JSON nguyên bản.
                            </p>

                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                                <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed font-medium">
                                    <strong>Lưu ý:</strong> File backup chỉ chứa thông tin cấu trúc dữ liệu hiển thị. Các tệp tin đa phương tiện vẫn được lưu trữ thông qua public bucket của Supabase CDN.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phạm vi dữ liệu xuất (Partial Check)</label>
                                <select 
                                    value={selectedTable}
                                    onChange={(e) => setSelectedTable(e.target.value)}
                                    className="w-full max-w-xs border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-950 rounded-xl p-2.5 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
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
                        </div>

                        <Button
                            onClick={handleExport}
                            disabled={loading || restoring}
                            className="w-full sm:w-auto mt-6 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl shadow-lg shadow-amber-500/25 px-6 transition-all duration-200"
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

                {/* Restore Card */}
                <Card className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl rounded-[2rem] overflow-hidden flex flex-col justify-between">
                    <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800/80 bg-rose-500/5">
                        <CardTitle className="text-xl font-bold text-rose-600 dark:text-rose-450 flex items-center gap-2">
                            Phục hồi dữ liệu hệ thống (Import JSON)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                Chức năng tự động ghi đè và lấp đầy trực tiếp các khoảng trống hiện tại của dữ liệu Database của nền tảng dựa trên file backup JSON (.json) do hệ thống cung cấp.
                            </p>
                            <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4">
                                <p className="text-xs text-rose-600 dark:text-rose-400 leading-relaxed font-semibold">
                                    ⚠️ Cảnh Báo Nguy Hiểm: Thao tác này sẽ tự động thay đổi vĩnh viễn dữ liệu hiện có bằng bản gốc nằm trong file. Nếu upload nhầm file có thể dẫn đến lệch trạng thái toàn hệ thống. Hãy thực sự cẩn trọng!
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6">
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
                                className="font-bold rounded-xl shadow-lg shadow-rose-500/20 px-6 transition-all duration-200"
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
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Auto-Upsert API Chunking</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
