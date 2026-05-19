'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
// @ts-ignore
import { deleteFAQ } from '@/app/actions/admin/faq';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';

export function DeleteFAQButton({ id, tenantId }: { id: string; tenantId: string }) {
    const [loading, setLoading] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm) {
            setConfirm(true);
            setTimeout(() => setConfirm(false), 3500);
            return;
        }
        setLoading(true);
        const result = await deleteFAQ(tenantId, id);
        if (result.success) {
            toast.success('Đã xóa câu hỏi thành công!');
            router.refresh();
        } else {
            toast.error(result.error || 'Có lỗi xảy ra');
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleDelete}
            disabled={loading}
            variant="outline"
            size="sm"
            className={`transition-colors ${confirm ? 'border-red-500 bg-red-50 text-red-700' : 'text-red-600 hover:text-red-700'}`}
            title={confirm ? 'Nhấn lần nữa để xác nhận xóa' : 'Xóa câu hỏi'}
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
    );
}
