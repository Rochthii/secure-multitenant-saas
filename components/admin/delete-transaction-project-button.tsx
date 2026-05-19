'use client';

import React, { useState } from 'react';
import { deleteTransactionProject } from '@/app/actions/admin/projects';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function DeleteTransactionProjectButton({ id }: { id: string }) {
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
        const result = await deleteTransactionProject(id);
        if (result.success) {
            toast.success('Đã xóa dự án đóng góp quỹ thành công!');
            router.refresh();
        } else {
            toast.error(result.error || 'Có lỗi xảy ra khi xóa dự án');
            setLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
            className={`h-8 w-8 p-0 transition-colors ${confirm ? 'text-red-700 bg-red-50' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}`}
            title={confirm ? 'Nhấn lần nữa để xác nhận xóa' : 'Xóa dự án'}
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
    );
}
