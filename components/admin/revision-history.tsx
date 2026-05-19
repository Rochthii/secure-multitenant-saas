'use client';

import React, { useState, useEffect } from 'react';
import { getRevisions, rollbackToRevision, type ContentRevision } from '@/app/actions/admin/revisions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { History, RotateCcw, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    tableName: 'news' | 'events' | 'dharma_talks' | 'pages' | 'about_sections' | 'transaction_projects' | 'hero_slides' | 'faqs' | 'categories';
    recordId: string;
    currentUserRole: string;
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function diffSummary(oldData: Record<string, any> | null, newData: Record<string, any>): string[] {
    if (!oldData) return ['Tạo mới bản ghi'];
    const changed: string[] = [];
    const LABELS: Record<string, string> = {
        title_vi: 'Tiêu đề (VI)', title_en: 'Tiêu đề (EN)', title_km: 'Tiêu đề (KM)',
        content_vi: 'Nội dung (VI)', content_en: 'Nội dung (EN)', content_km: 'Nội dung (KM)',
        summary_vi: 'Tóm tắt (VI)', summary_en: 'Tóm tắt (EN)', summary_km: 'Tóm tắt (KM)',
        excerpt_vi: 'Mô tả ngắn (VI)', excerpt_en: 'Mô tả ngắn (EN)', excerpt_km: 'Mô tả ngắn (KM)',
        description_vi: 'Mô tả (VI)', description_en: 'Mô tả (EN)', description_km: 'Mô tả (KM)',
        status: 'Trạng thái', approval_status: 'Trạng thái duyệt',
        thumbnail_url: 'Ảnh đại diện', published_at: 'Ngày xuất bản',
        is_featured: 'Nổi bật', is_active: 'Hiển thị',
        target_amount: 'Số tiền mục tiêu', current_amount: 'Số tiền hiện tại',
        slug: 'Đường dẫn', meta_description_vi: 'SEO Description (VI)', meta_description_en: 'SEO Description (EN)',
    };
    for (const key of Object.keys(newData)) {
        if (key === 'updated_at') continue;
        if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
            const label = LABELS[key] ?? key;
            changed.push(label);
        }
    }
    return changed.length > 0 ? changed : ['Không có thay đổi đáng kể'];
}

export function RevisionHistory({ tableName, recordId, currentUserRole }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [revisions, setRevisions] = useState<ContentRevision[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [rollbackTarget, setRollbackTarget] = useState<ContentRevision | null>(null);
    const [rollbacking, setRollbacking] = useState(false);

    const isAdmin = ['admin', 'super_admin'].includes(currentUserRole);

    useEffect(() => {
        if (isOpen && revisions.length === 0) {
            loadRevisions();
        }
    }, [isOpen]);

    const loadRevisions = async () => {
        setLoading(true);
        const { revisions: data, error } = await getRevisions(tableName, recordId);
        setLoading(false);
        if (error) {
            toast.error('Không tải được lịch sử: ' + error);
        } else {
            setRevisions(data);
        }
    };

    const handleRollback = async () => {
        if (!rollbackTarget) return;
        setRollbacking(true);
        const result = await rollbackToRevision(rollbackTarget.id);
        setRollbacking(false);
        if (result.success) {
            toast.success('Đã khôi phục phiên bản thành công! Trang sẽ reload...');
            setRollbackTarget(null);
            setIsOpen(false);
            setTimeout(() => window.location.reload(), 1000);
        } else {
            toast.error(result.error || 'Có lỗi khi khôi phục');
        }
    };

    return (
        <>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="text-gray-500 hover:text-gray-700 gap-1.5"
            >
                <History className="h-4 w-4" />
                Lịch sử
                {revisions.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">{revisions.length}</Badge>
                )}
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col bg-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Lịch sử phiên bản
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto pr-1">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            </div>
                        ) : revisions.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <History className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                <p>Chưa có lịch sử thay đổi</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {revisions.map((rev, index) => {
                                    const changes = diffSummary(rev.old_data, rev.new_data);
                                    const isExpanded = expandedId === rev.id;
                                    return (
                                        <div key={rev.id} className="border rounded-lg overflow-hidden">
                                            <div
                                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                                                onClick={() => setExpandedId(isExpanded ? null : rev.id)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">
                                                            {rev.change_summary || `Thay đổi: ${changes.slice(0, 2).join(', ')}${changes.length > 2 ? '...' : ''}`}
                                                        </p>
                                                        <p className="text-xs text-gray-400">{formatDate(rev.created_at)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isAdmin && rev.old_data && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="gap-1 text-xs h-7"
                                                            onClick={(e) => { e.stopPropagation(); setRollbackTarget(rev); }}
                                                        >
                                                            <RotateCcw className="h-3 w-3" />
                                                            Khôi phục
                                                        </Button>
                                                    )}
                                                    {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="border-t px-3 py-2 bg-gray-50">
                                                    <p className="text-xs font-medium text-gray-500 mb-1.5">Các trường đã thay đổi:</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {changes.map((c) => (
                                                            <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Rollback confirm dialog */}
            <Dialog open={!!rollbackTarget} onOpenChange={() => setRollbackTarget(null)}>
                <DialogContent className="max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle>Xác nhận Khôi phục</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">
                        Bạn có chắc chắn muốn khôi phục về phiên bản lúc{' '}
                        <strong>{rollbackTarget ? formatDate(rollbackTarget.created_at) : ''}</strong>?
                        Hành động này sẽ ghi đè dữ liệu hiện tại.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRollbackTarget(null)}>Hủy</Button>
                        <Button
                            variant="destructive"
                            onClick={handleRollback}
                            disabled={rollbacking}
                        >
                            {rollbacking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Khôi phục
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
