'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { approveNews, rejectNews } from '@/app/actions/admin/news';
import { approveEvent, rejectEvent } from '@/app/actions/admin/events';
import { approveDharmaTalk, rejectDharmaTalk } from '@/app/actions/admin/dharma-talks';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export type ApprovalType = 'news' | 'events' | 'dharma_talks';

interface ApproveRejectButtonsProps {
    itemId: string;
    currentStatus: string;
    currentUserRole: string;
    type?: ApprovalType; // Mặc định là news để tương thích code cũ
}

export function ApproveRejectButtons({
    itemId,
    currentStatus,
    currentUserRole,
    type = 'news'
}: ApproveRejectButtonsProps) {
    const router = useRouter();
    const [approveOpen, setApproveOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const canReview = ['admin', 'super_admin'].includes(currentUserRole);
    const isPendingReview = currentStatus === 'pending_review';
    const isRejected = currentStatus === 'rejected';

    if (!canReview) return null;
    if (!isPendingReview && !isRejected) return null;

    const handleApprove = async () => {
        setLoading(true);
        let result;
        if (type === 'events') {
            result = await approveEvent(itemId, note || undefined);
        } else if (type === 'dharma_talks') {
            result = await approveDharmaTalk(itemId, note || undefined);
        } else {
            result = await approveNews(itemId, note || undefined);
        }

        setLoading(false);
        if (result.success) {
            toast.success('Đã duyệt và xuất bản thành công!');
            setApproveOpen(false);
            router.refresh();
        } else {
            toast.error(result.error || 'Có lỗi khi duyệt');
        }
    };

    const handleReject = async () => {
        if (!note.trim()) {
            toast.error('Vui lòng nhập lý do từ chối');
            return;
        }
        setLoading(true);
        let result;
        if (type === 'events') {
            result = await rejectEvent(itemId, note);
        } else if (type === 'dharma_talks') {
            result = await rejectDharmaTalk(itemId, note);
        } else {
            result = await rejectNews(itemId, note);
        }

        setLoading(false);
        if (result.success) {
            toast.success('Đã từ chối');
            setRejectOpen(false);
            router.refresh();
        } else {
            toast.error(result.error || 'Có lỗi khi từ chối');
        }
    };

    return (
        <div className="flex gap-2">
            {/* Approve */}
            <Button
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => { setNote(''); setApproveOpen(true); }}
                type="button"
            >
                <CheckCircle className="h-4 w-4 mr-1" />
                Duyệt
            </Button>

            <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
                <DialogContent className="max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-green-700">✅ Xác nhận phê duyệt</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <Label className="text-sm text-gray-600">Ghi chú duyệt (không bắt buộc)</Label>
                        <Textarea
                            placeholder="VD: Nội dung tốt, đã kiểm tra hình ảnh..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="min-h-[80px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => setApproveOpen(false)} disabled={loading}>
                            Huỷ
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={handleApprove}
                            disabled={loading}
                            type="button"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                            Xác nhận duyệt
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject */}
            <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => { setNote(''); setRejectOpen(true); }}
                type="button"
            >
                <XCircle className="h-4 w-4 mr-1" />
                Từ chối
            </Button>

            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogContent className="max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-red-700">❌ Xác nhận từ chối</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <Label className="text-sm text-gray-600">
                            Lý do từ chối <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            placeholder="VD: Nội dung chưa phù hợp, cần bổ sung thêm hình ảnh..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => setRejectOpen(false)} disabled={loading}>
                            Huỷ
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={loading}
                            type="button"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                            Xác nhận từ chối
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
