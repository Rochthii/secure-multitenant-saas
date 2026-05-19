'use client';

import React, { useState } from 'react';
import { useRagAdmin, RagDocument } from '@/hooks/use-rag-admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Loader2, Trash2, Eye, ChevronLeft, ChevronRight, Search, AlertCircle, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface Props { ragAdmin: ReturnType<typeof import('@/hooks/use-rag-admin').useRagAdmin> }

export function RagDocumentManager({ ragAdmin }: Props) {
    const {
        categories, documents, totalDocs, isLoadingDocuments,
        filterCategoryId, setFilterCategoryId,
        page, setPage, LIMIT,
        deleteDocument, previewDocument,
    } = ragAdmin;

    const [search, setSearch] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<RagDocument | null>(null);
    const [previewTarget, setPreviewTarget] = useState<RagDocument | null>(null);
    const [previewChunks, setPreviewChunks] = useState<any[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [deleteResult, setDeleteResult] = useState<{ count: number } | null>(null);
    const [isStandardizing, setIsStandardizing] = useState(false);
    const [error, setError] = useState('');

    const handleAutoStandardize = async () => {
        setIsStandardizing(true);
        toast.info('Hệ thống đang tự động chuẩn hóa tài liệu cũ bằng AI...');
        try {
            const res = await fetch('/api/admin/ai/documents/auto-standardize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Đã tự động chuẩn hóa thành công ${data.processed} tài liệu!`);
                ragAdmin.refetchAll();
            } else {
                toast.info(data.message || 'Không có tài liệu nào cần chuẩn hóa thêm.');
            }
        } catch (err) {
            toast.error('Lỗi khi tự động chuẩn hóa');
        } finally {
            setIsStandardizing(false);
        }
    };

    const totalPages = Math.ceil(totalDocs / LIMIT);

    // Filter hiển thị theo search (client-side, trong page hiện tại)
    const filtered = documents.filter(d =>
        d.title.toLowerCase().includes(search.toLowerCase())
    );

    const handlePreview = async (doc: RagDocument) => {
        setPreviewTarget(doc);
        setIsLoadingPreview(true);
        const { chunks } = await previewDocument(doc.id);
        setPreviewChunks(chunks);
        setIsLoadingPreview(false);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        setError('');
        const result = await deleteDocument(deleteTarget.id);
        setIsDeleting(false);

        if (result.error) {
            setError(result.error);
        } else {
            setDeleteResult({ count: result.deleted_chunks ?? 0 });
        }
        setDeleteTarget(null);
    };

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold">Kho Kinh điển</h2>
                <p className="text-sm text-gray-500 mt-1">
                    {totalDocs} tài liệu đã được vector hóa trong hệ thống.
                </p>
            </div>

            {/* Thông báo xóa thành công */}
            {deleteResult && (
                <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-700 text-sm">
                        ✅ Đã xóa tài liệu thành công và {deleteResult.count} vectors liên quan.
                    </AlertDescription>
                </Alert>
            )}

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Button 
                variant="outline" 
                className="w-full h-11 rounded-xl border-amber-200 bg-amber-50/50 text-amber-800 font-semibold hover:bg-amber-100 border-dashed"
                onClick={handleAutoStandardize}
                disabled={isStandardizing || isLoadingDocuments}
            >
                {isStandardizing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang chuẩn hóa...</>
                ) : (
                    <><ShieldCheck className="w-4 h-4 mr-2" /> ✨ Tự động chuẩn hóa học thuật toàn bộ</>
                )}
            </Button>

            {/* ── Bộ lọc ── */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Tìm tài liệu..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setDeleteResult(null); }}
                        className="pl-9"
                    />
                </div>
                <Select
                    value={filterCategoryId || 'all'}
                    onValueChange={v => { setFilterCategoryId(v === 'all' ? '' : v); setPage(1); setDeleteResult(null); }}
                >
                    <SelectTrigger className="w-52">
                        <SelectValue placeholder="Tất cả chuyên đề" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả chuyên đề</SelectItem>
                        {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* ── Danh sách ── */}
            {isLoadingDocuments ? (
                <div className="flex items-center gap-2 text-gray-400 py-12 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang tải danh sách...
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">
                    Không có tài liệu nào.
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(doc => (
                        <div
                            key={doc.id}
                            className="flex items-center gap-3 p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-gray-800 truncate">{doc.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    {doc.category && (
                                        <Badge variant="secondary" className="text-xs">
                                            {doc.category.name}
                                        </Badge>
                                    )}
                                    <span className="text-xs text-gray-400">
                                        {doc.chunk_count} vectors · {new Date(doc.created_at).toLocaleDateString('vi-VN')}
                                    </span>
                                    {doc.source_metadata?.translator && (
                                        <span className="text-xs text-gray-400 italic truncate">
                                            · {doc.source_metadata.translator}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePreview(doc)}
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600"
                                    title="Xem trước nội dung"
                                >
                                    <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => { setDeleteTarget(doc); setDeleteResult(null); setError(''); }}
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                                    title="Xóa tài liệu"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-gray-400">
                        Trang {page}/{totalPages} — {totalDocs} tài liệu
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline" size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page <= 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline" size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* ── Dialog Xóa ── */}
            <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa tài liệu</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn sắp xóa <strong>"{deleteTarget?.title}"</strong> và toàn bộ{' '}
                            <strong>{deleteTarget?.chunk_count} vector embeddings</strong> liên quan.
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang xóa...</> : 'Xóa vĩnh viễn'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Dialog Preview ── */}
            <Dialog open={!!previewTarget} onOpenChange={open => !open && setPreviewTarget(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-base">📖 Xem trước: {previewTarget?.title}</DialogTitle>
                    </DialogHeader>
                    {isLoadingPreview ? (
                        <div className="flex items-center gap-2 py-8 justify-center text-gray-400">
                            <Loader2 className="w-4 h-4 animate-spin" /> Đang tải nội dung...
                        </div>
                    ) : previewChunks.length === 0 ? (
                        <p className="text-gray-400 text-sm py-4">Không có nội dung để xem trước.</p>
                    ) : (
                        <div className="space-y-4">
                            {previewChunks.map((chunk, i) => (
                                <div key={chunk.id} className="border rounded-lg p-3 bg-gray-50 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-500">Đoạn {i + 1}</span>
                                        {chunk.metadata?.sutta_code && (
                                            <Badge variant="outline" className="text-xs">
                                                {chunk.metadata.sutta_code}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap line-clamp-6">
                                        {chunk.content}
                                    </p>
                                </div>
                            ))}
                            <p className="text-xs text-gray-400 text-center">
                                Hiển thị 3 đoạn đầu tiên trong tổng số {previewTarget?.chunk_count} đoạn.
                            </p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
