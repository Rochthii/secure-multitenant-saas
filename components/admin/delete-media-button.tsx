'use client';

import { useState } from 'react';
import { deleteMedia } from '@/app/actions/admin/media';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function DeleteMediaButton({ tenantId, id }: { tenantId: string; id: string }) {
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
        const result = await deleteMedia(tenantId, id);
        if (result.success) {
            toast.success('Đã xóa media thành công!');
            router.refresh();
        } else {
            toast.error(result.error || 'Có lỗi xảy ra');
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className={`rounded-lg p-2 text-white disabled:opacity-50 transition-colors ${confirm ? 'bg-red-800' : 'bg-red-600 hover:bg-red-700'}`}
            title={confirm ? 'Nhấn lần nữa để xác nhận xóa' : 'Xóa media'}
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
    );
}
