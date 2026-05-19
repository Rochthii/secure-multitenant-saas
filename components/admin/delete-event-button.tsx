'use client';

import { useState } from 'react';
import { deleteEvent } from '@/app/actions/admin/events';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function DeleteEventButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm) {
            setConfirm(true);
            setTimeout(() => setConfirm(false), 4000);
            return;
        }
        setLoading(true);
        const result = await deleteEvent(id);
        if (result.success) {
            toast.success('Đã xóa sự kiện thành công!');
            router.refresh();
        } else {
            toast.error(result.error || 'Có lỗi xảy ra');
            setConfirm(false);
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className={`text-xs font-semibold inline-flex items-center justify-center transition-all px-3 py-1.5 rounded-lg border transition-all duration-300 ${
                loading
                    ? 'bg-slate-800/80 text-slate-500 border-slate-700/50 cursor-not-allowed'
                    : confirm
                    ? 'bg-rose-950/60 text-rose-400 border-rose-800 shadow-[0_0_15px_rgba(244,63,94,0.15)] animate-pulse'
                    : 'text-rose-400 border-transparent hover:bg-rose-500/10 hover:border-rose-500/20'
            }`}
            style={{ minWidth: '96px' }}
        >
            {loading ? 'Đang xóa...' : confirm ? 'Xác nhận xóa' : 'Xóa'}
        </button>
    );
}
